# AI 추천 가격 관련 — 인수인계 문서

> 작성일: 2026-06-18 · 작성자(원 커밋터): jk-sfn
> 대상 도메인: `product`, `order` (+ `api-rest` 연동 계층)

이 문서는 **AI 추천 가격 시스템**과 관련해 내가 구현한 3가지 로직을 인수인계하기 위한 자료입니다.
각 로직은 독립된 엔드포인트지만, **하나의 일일(daily) 사이클**로 맞물려 동작합니다.

---

## 0. 전체 그림 (먼저 읽기)

AI 추천 가격은 "오늘 상품 데이터를 AI에 넘기고 → AI가 내일 가격/쿠폰을 예약·발급"하는 **하루 단위 파이프라인**입니다. 내가 만든 3개 로직이 이 파이프라인의 입구·중간·출구입니다.

> ⚠️ **쿠폰 2종의 발급 경로가 다름 (혼동 주의)**
> - **AI 추천쿠폰 (AI_REC)**: 주문서와 무관하게 **즉시 고객에게 직접 발급**됨. AI가 추천 결과를 만들면 `POST /external/partner/coupons/ai-rec/issue` (`issueAiRecCoupon`)로 곧바로 고객 `coupon` 레코드를 생성. (이 발급 로직은 이번 인수인계 3개 로직 범위 밖)
> - **AI 기본쿠폰 (AI_BASE)**: 생성 시점엔 스킴(coupon_meta+guest_benefit)만 만들고 **유저에게 즉시 발급하지 않음**. **고객이 주문서에 진입하는 순간**([로직 3])에 매핑 상품 기준으로 발급. 아래 다이어그램 [로직 3]은 이 AI_BASE 경로만 다룸.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  [로직 1] 상품 데이터 Export                                                    │
│  GET /external/system/products                                                 │
│  → 운영 정책(쿠폰 발급 제외 / 가격수정 제외 / 첫구매딜 제외 / top sales / boost)  │
│    을 플래그로 함께 실어 AI 학습 파이프라인에 전체 상품 전달                       │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ AI가 학습·추천 계산
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [로직 2] 내일 가격 예약 등록                                                    │
│  POST /external/partner/products/ai-rec/prices                                 │
│  → AI가 보낸 (정가/판매가)를 가격수정 가능 상품만 검증해 product_discount /        │
│    product_list_price 에 'started_at=내일' 예약 레코드로 저장 (부분 성공 모델)    │
│  → 자정이 지나면 date-effective 조회로 자동 유효, 익일 배치가 Product 본체 동기화  │
└───────────────────────────────┬─────────────────────────────────────────────┘
                                │ (쿠폰 스킴은 /coupons/base/create 등으로 별도 생성)
                                ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  [로직 3] 주문서 진입 시 AI_BASE 쿠폰 발급                                       │
│  POST (OrderForm create) 내부                                                  │
│  → 주문서 상품에 매핑된 활성 AI_BASE 쿠폰을 '그 시점에' 고객에게 실제 발급         │
│    (이미 발급/AI 쿠폰 보유 상품 제외 등 4단계 필터)                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

**핵심 시간 개념 — "전일 전달" 보정**: AI에는 데이터를 **하루 먼저** 전달합니다. 그래서 로직 1의 제외 판정은 `제외일 - 1일` 범위로 보정되어 있고(아래 1-3 참고), 로직 2가 등록하는 가격은 항상 "내일" 시작입니다. 이 어긋남(off-by-one-day)을 모르면 정책이 하루 밀린 것처럼 보일 수 있으니 주의하세요.

---

## 1. [로직 1] AI 학습용 전체 상품 조회 API

> **무엇을**: AI 추천 파이프라인에 학습용 상품 마스터 전체를 전달. 운영 정책상 "추천 제외" 대상도 **빼지 않고 플래그로 표시해** 전달.

### 1-1. 호출 체인

| 단계 | 위치 | 역할 |
|------|------|------|
| Controller | `api-rest/.../controller/external/ExternalSystemController.kt:25` `getProductsForAI(isTopSales)` | `@RequestParam(required=false) isTopSales: Boolean?` 수신, 응답을 1000개씩 chunk 로깅 |
| Broker | `api-rest/.../provider/external/ExternalSystemBroker.kt:11` | 로직 없이 단순 위임 |
| **Query(핵심)** | `product-domain/.../external/service/ExternalProductQuery.kt:52` `getProductsForAI()` | **모든 비즈니스 로직 집중** |
| 응답 DTO | `product-domain/.../external/model/dto/ExternalProductResponse.kt`, `ExternalExtendedProduct.kt` | |
| 상태 VO | `product-domain/.../external/model/vo/AIRecommendationApplyStatus.kt` | `APPLICABLE` / `EXCLUDED` 2값 |

- 인증/Rate Limit: 클래스 `@ExternalSystemAccessAuth`, 메서드 `@ExternalAccessRateLimit(seconds = 120)` → **6장 공통 인증** 참고. 동일 사용자/URI 기준 **120초당 1회** 제한.

### 1-2. "제외"는 두 종류 — 반드시 구분

| 구분 | 의미 | 코드 |
|------|------|------|
| **응답에서 빠지는 제외 (상품 자체 제거)** | `ProductEventType.FIRST_PURCHASE_DEAL`(첫구매딜) 상품은 응답 리스트에서 완전 제거 | `ExternalProductQuery.kt:101-105` `products.filterNot { it.id in firstPurchaseDealProductIds }` |
| **플래그로 표시되는 제외 (추천 적용 불가)** | AI 제외 상품/카테고리, 계근 상품, 비-top-sales 등은 응답에 **남기되** 상태값을 `EXCLUDED`로 내림 | 1-4 참고 |

> 기본 상품 집합 자체는 `ProductSearchCondition()`을 **빈 객체로** 호출 → WHERE 없이 `productErp` INNER JOIN 되는 **모든 상품**(`ExternalProductQuery.kt:54`). 판매상태/품절/노출여부로 거르지 않음. (ERP 매핑 없는 상품만 JOIN으로 자연 제외)

### 1-3. "오늘 제외 대상" 판정 — 전일 보정 + 요일 규칙 (중요)

`AIExclusionTarget`(`ExternalProductQuery.kt:95-99`) 구성:
- 제외 상품: `AIExcludedProductQuery.findTodayExcludedProductIdsForAI()`
- 제외 카테고리: `AIExcludedManagementCategoryQuery.findTodayExcludedCategoryIdsForAI()`
- 부스트 상품: `AIExcludedProductQuery.findTodayRecommendationBoostProductIdsForAI()`

```kotlin
// 상품 제외: 데이터는 전일 전달 → 제외기간을 하루 당겨서 비교  (AIExcludedProductQuery.kt:48-52)
.filter { !today.isBefore(it.excludeStartDate.minusDays(1)) && !today.isAfter(it.excludeEndDate.minusDays(1)) }
// 예) 제외 3/5~3/10 → 3/4~3/9에 excluded 플래그 전달 → 실제 AI 미적용 3/5~3/10
```

```kotlin
// 카테고리 제외: '수요일'에만 전체 제외 카테고리 반환, 그 외 요일은 emptySet  (AIExcludedManagementCategoryQuery.kt:21-26)
if (LocalDate.now().dayOfWeek != DayOfWeek.WEDNESDAY) return emptySet()
// 목요일 가격수정/쿠폰 적용은 전일(수) 데이터 기반이라는 운영 정책
```

상품별 최종 판정(`ExternalProductQuery.kt:118-121`):
```kotlin
val isTodayExcluded =
    aiExclusionTarget.isExcludedProduct(productId = product.id) ||
    aiExclusionTarget.isExcludedCategory(categoryId = productManagementLeafCategoryByProductId[product.id]?.id)
```

### 1-4. 응답 필드별 의미 (`ExternalExtendedProduct`)

| 필드 | 의미 / 계산 |
|------|------------|
| `productAdminInfo` | 상품 상세(ERP·구매이력·프로모션·정가·예약정가·예약할인가). `@JsonUnwrapped`로 평탄화 |
| `productManagementCategoryList` | 관리카테고리 1depth~leaf 계층 (계층 깨지면 `emptyList()`) |
| `productCouponApplicableStatus` | **쿠폰 발급 적용 가능 여부** → 1-5 |
| `priceModificationApplicableStatus` | **가격 수정 적용 가능 여부** → 1-6 |
| `recommendationBoostRequired` | 추천 부스트 필요 여부. `productId in boost && productId in excluded` (둘 다일 때만 true, `AIExclusionTarget.kt:16`) |
| `isTopSalesProduct` | `top_sales_product` 테이블 포함 여부 (`product.id in topSalesProductIds`) |
| `aiBaseCouponDiscountAmount` | `ai_base_coupon_discount_adjustment` 테이블의 상품별 기본쿠폰 금액(없으면 null) |

### 1-5. 쿠폰 발급 제외 정책 (`productCouponApplicableStatus`)

```kotlin
// AIRecommendationApplyStatus.kt:12-16
fun productCoupon(productStandardType: StandardType?, isTodayExcluded: Boolean): AIRecommendationApplyStatus {
    if (isTodayExcluded) return EXCLUDED
    if (productStandardType == StandardType.NON_STANDARD) return EXCLUDED   // 계근(비규격) 상품
    return APPLICABLE
}
```
**EXCLUDED 조건**: ① 오늘 AI 제외 상품/카테고리 이거나 ② **계근(NON_STANDARD) 상품**.

### 1-6. 가격 수정 제외 정책 (`priceModificationApplicableStatus`)

```kotlin
// AIRecommendationApplyStatus.kt:18-22
fun priceModification(isTodayExcluded: Boolean, isTopSalesProduct: Boolean): AIRecommendationApplyStatus {
    if (!isTopSalesProduct) return EXCLUDED   // top sales 아니면 무조건 제외
    if (isTodayExcluded) return EXCLUDED
    return APPLICABLE
}
```
**EXCLUDED 조건**: ① **매출 상위(top sales) 상품이 아니거나** ② 오늘 AI 제외 상품/카테고리.
→ 가격 수정이 `APPLICABLE` 되려면 **top sales 이면서 오늘 제외 대상이 아님**. (로직 2의 검증 대상과 직결)

### 1-7. `isTopSales` 파라미터 필터 (`ExternalProductQuery.kt:55-59`)

```kotlin
when (isTopSales) {
    true  -> allProducts.filter { it.id in topSalesProductIds }     // 상위만
    false -> allProducts.filterNot { it.id in topSalesProductIds }  // 상위 제외
    null  -> allProducts                                            // 전체
}
```

---

## 2. [로직 2] AI 추천 예약가격 등록 API

> **무엇을**: AI가 계산한 "내일의 정가/판매가"를 받아, **가격수정 가능 상품만** 검증해 예약 레코드로 저장. 부적격은 예외 없이 응답에 모아 돌려주는 **부분 성공(partial success)** 모델.

### 2-1. 호출 체인

| 단계 | 위치 | 역할 |
|------|------|------|
| Controller | `api-rest/.../controller/external/ExternalPartnerController.kt:98` `createAiRecReservedPrices(requests)` | `POST /external/partner/products/ai-rec/prices`, `201 CREATED` |
| Broker | `api-rest/.../provider/external/ExternalPartnerBroker.kt:285` | `register(requests, createdBy = AI_SYSTEM_USER_ID)` 호출 후 결과 슬랙 통지 |
| **Command(핵심)** | `product-domain/.../external/service/AIRecReservedPriceCommand.kt:31` `register()` | 클래스 `@Transactional`, 단일 트랜잭션 |
| 협력자 | `ProductQuery.findProducts`, `ProductDiscountScheduleEnroller`, `ProductDiscountAdminCommand.applyScheduledDiscountPrice`, `ProductListPriceAdminCommand.createBulkForTomorrow` | |

- `createdBy = ProductCouponConstants.AI_SYSTEM_USER_ID = -1L` — 모든 등록의 생성자는 시스템 사용자(-1).
- 인증: 클래스 `@ExternalPartnerAccessAuth` (고정 Basic 자격증명, 6장 참고).

### 2-2. Request / Response DTO

`AIRecReservedPriceRequest`:
- `productId: Long`
- `listPrice: Int` — **내일의 정가**
- `price: Int` — **내일의 판매가**. (할인가 적용 여부는 정가와 비교해 결정, 2-4 참고)

`AIRecReservedPriceResponse`:
- `successCount`, `successProductIds` — 성공 상품 (가격이 같아 "변경 불필요"인 스킵도 **성공으로 집계**)
- `failCount`, `failures: List<Failure>` — 실패 상세
- `totalCount = successCount + failCount`
- `Failure(productId, code, message)` — `code`는 `ProductErrorCode` 매핑 문자열

### 2-3. 가격 수정 가능 여부 검증 (순차 필터, 부적격은 `failures`로)

```
검증1  가격 양수      listPrice > 0 && price > 0        실패코드: AI_REC_PRICE_MUST_BE_POSITIVE   (:39-42)
검증2  상품 존재      productId in DB                   실패코드: NOT_FOUND_PRODUCT               (:45-49)
검증3  할인 스케줄    (할인가 필요 시) 1depth 관리카테고리명 == 프로모션 그룹명 매칭
       그룹 매칭                                       실패코드: AI_REC_NO_MATCHING_DISCOUNT_SCHEDULE_GROUP (:170-178)
```

- 검증3은 **할인가를 실제로 넣어야 하는 상품**(`discountPrice != null`)에만 적용. 할인이 없으면 그룹이 없어도 정가만 처리하고 성공.
- 매칭 로직: `ProductDiscountScheduleEnroller.findMatchingGroup` (`:41`), 컨텍스트는 `CategoryType.PRODUCT_MANAGEMENT depth==1` + `promotionRepository.findAllValidDiscountSchedulePromotions()`.
- **스킵(=성공)**: 현재 적용가와 내일 가격이 같으면 등록 건너뛰고 `successProductIds`에 추가 (`:121-130`). 별도 skip 카운트는 없음.

> ⚠️ 부적격 상품은 **예외를 던지지 않음**. 전부 `failures`에 모아 200/201로 반환하는 부분 성공 모델이라는 점을 인수자가 반드시 인지해야 함.

### 2-4. 정가/할인가 등록 규칙

**할인가 ≤ 정가 강제** (`discountPrice` 헬퍼, `AIRecReservedPriceCommand.kt:197-199`):
```kotlin
if (request.price < request.listPrice) BigDecimal(request.price) else null  // price >= listPrice 면 '할인 없음'
```
별도 min/max 경계 검증은 없음(양수 검증만).

**할인가 등록 — 2경로** (`scheduleDiscountPrices`, `:63`):
- **미등록 상품**: 프로모션 그룹에 신규 매핑 + `ProductDiscount` 2건 생성 — ① `promotion.startedAt~tomorrow` (할인 null), ② `tomorrow~promotion.endedAt` (내일 할인가).
- **기등록 상품** (`ProductDiscountAdminCommand.applyScheduledDiscountPrice`, `:76`): `started_at == tomorrow` 레코드 있으면 그 값만 갱신, 없으면 현재 레코드를 `tomorrow`까지 잘라 닫고 `tomorrow~원래 endedAt` 새 레코드 생성. → **오늘 할인가 유지, 내일부터 새 할인가**.

**정가 등록** (`ProductListPriceAdminCommand.createBulkForTomorrow`, `:39`): 현재 정가 ≠ 요청 정가인 상품만, 겹치는 기존 정가 soft-delete 후 `started_at=내일 00:00, ended_at=모레 00:00`로 신규 저장.

### 2-5. 저장 테이블 / 적용(apply) 메커니즘

| 항목 | 테이블 / 엔티티 | 핵심 컬럼 |
|------|----------------|----------|
| 할인가 | `product_discount` / `ProductDiscount` | `started_at`, `ended_at`, `discount_price`, `promotion_id`, soft-delete |
| 정가 | `product_list_price` / `ProductListPrice` | `product_id`, `list_price`, `started_at`, `ended_at`, soft-delete |

**적용은 2단으로**:
1. **읽기 시점 date-effective 조회**: `findEffectiveByProductIdsAt`이 `started_at <= now < ended_at`으로 유효가 조회 → `started_at=내일` 레코드는 **자정 지나면 자동 유효**.
2. **익일 배치로 본체 동기화**: `ProductDailyPriceSyncService`(`api-rest/.../executor/product/ProductDailyPriceSyncService.kt:31`) → `findAllByStartedAt(todayStart)` 수집 → `ProductPriceSyncProcessor.processProduct`가 `Product.updateListPrice`로 **엔티티 정가 컬럼 갱신** + `ProductPriceHistory` 기록 + `ProductBulkCreated` 이벤트로 검색 동기화. 분산락 + 1회 retry + 실패 시 `ProductPriceSyncFailure` 저장/슬랙 통지.
   - 트리거: `BatchEventType.PRODUCT_DAILY_PRICE_SYNC` 이벤트(`BatchEventExecutor` 패턴).
   - ⚠️ **이 배치를 매일 호출하는 cron 시각은 이 레포에 없음**(`@Scheduled`/yml 없음). 외부 스케줄러(EventBridge 등)가 `BatchEvent`를 발행하는 구조 → 인프라 설정에서 확인 필요.

---

## 3. [로직 3] 주문서 생성 시점 AI_BASE 쿠폰 자동 발급

> **무엇을**: `createCoupon(AI_BASE)`은 쿠폰 **스킴**(coupon_meta + guest_benefit)만 만들고 유저에게 직접 발급하지 않음. 고객이 **주문서에 진입하는 순간** 해당 상품에 매핑된 활성 AI_BASE 쿠폰을 실제 `coupon` 레코드로 발급해 고객이 일치하는 혜택을 보게 함.

### 3-1. 호출 체인

```
OrderFormController.create                         api-rest/.../controller/front/order/OrderFormController.kt:33
 → OrderFormBroker.createOrderForm                 api-rest/.../provider/front/order/OrderFormBroker.kt:28   (@Transactional 없음, 컨벤션 준수)
   → OrderFormCreateUseCase.execute                order-domain/.../order/OrderFormCreateUseCase.kt:20       ← @Transactional 경계
     → OrderFormAiBaseCouponIssuer.issue           order-domain/.../coupon/service/OrderFormAiBaseCouponIssuer.kt:12  (try/catch 로 감쌈)
       → OrderFormAiBaseCouponFinder.findIssuable  order-domain/.../coupon/service/OrderFormAiBaseCouponFinder.kt:30  (발급 대상 판정)
       → CouponAdminCommand.issueSystemCouponsOrThrow  order-domain/.../coupon/service/CouponAdminCommand.kt:196 (실제 insert)
     → OrderFormCommand.createOrderForm            (주문서 영속화)
```

**발급 순서**: `OrderFormCreateUseCase.execute`에서 **쿠폰 발급이 먼저, 주문서 영속화가 나중** (`:29-40`).

### 3-2. 발급 대상 판정 — 4단계 파이프라인

`OrderFormAiBaseCouponFinder.findIssuable` (`:34-38`):
```kotlin
return couponMetaRepository.findIssuableAiBaseCandidates(orderProductIds, now)  // 기준 후보 (조건 1)
    .filterByIssueConstraints(userId)                                            // 발급 제약 선검증
    .filterNotAlreadyIssuedToUser(userId)                                        // 조건 2
    .filterProductsWithoutExistingAiCoupon(userId, orderProductIds.toSet(), now) // 조건 3+4
    .map { ... }
```

**조건 1 — 활성 AI_BASE & 주문상품 매핑** (`CouponMetaRepository.findIssuableAiBaseCandidates`, `:72-99`):
```kotlin
guestBenefit.type.eq(GuestBenefitType.COUPON),
guestBenefit.startAt.lt(now), guestBenefit.endAt.gt(now),                       // guest_benefit 기간
couponMeta.commonMetaInfo.issueSourceType.eq(IssueSourceType.AI_BASE),          // AI_BASE 만
couponProductMapping.productId.`in`(orderProductIds),                           // 주문상품 매핑
couponMeta.commonMetaInfo.usableAt.isNull.or(...loe(now)),                      // couponMeta 사용기간도 포함
couponMeta.commonMetaInfo.expiredAt.isNull.or(...goe(now)),
```
→ guest_benefit 기간 **AND** couponMeta 사용기간을 함께 검사.

**발급 제약 선검증** (`filterByIssueConstraints`, `:42`): `CouponIssueValidator`로 `ISSUE_NOT_STARTED / ISSUE_EXPIRED / ISSUE_LIMIT_REACHED / ISSUE_PAUSED / NOT_ALLOWED_STATUS`를 미리 걸러 `issueSystemCouponsOrThrow`의 예외를 예방.

**조건 2 — 이미 발급한 메타 제외** (`filterNotAlreadyIssuedToUser`, `:56`): **per-metaCouponNumber**. `coupon` 레코드 존재 자체로 차단(사용/미사용·만료 무관).

**조건 3+4 — AI 쿠폰 보유 상품 제외** (`filterProductsWithoutExistingAiCoupon`, `:69`): **per-productId**. 유저가 "오늘 유효한 AI 쿠폰"을 이미 가진 상품 제외.
```kotlin
// CouponRepositoryImpl.findAiCouponNumbersInEffectOn (:281-295)
coupon.commonMetaInfo.issueSourceType.`in`(IssueSourceGroup.AI.types()),  // AI_BASE + AI_REC + AI 전부
coupon.commonMetaInfo.usableAt.loe(effectiveDate),                        // "오늘 유효" = usableAt <= now <= expiredAt
coupon.commonMetaInfo.expiredAt.goe(effectiveDate),
```
> 📌 설계 노트엔 "조건3=AI_REC 우선 / 조건4=AI_BASE 중복방지"로 나눠 적었지만, **실제 코드는 둘을 한 메서드로 통합**해 AI 그룹(AI_BASE/AI_REC/AI) 전체를 productId 단위로 한 번에 배제합니다. 별도 "AI_REC 우선" 분기는 없음.

### 3-3. AI_BASE vs AI_REC 구분

- enum `IssueSourceType` (`order-domain/.../coupon/model/vo/type/IssueSourceType.kt`): `AI_BASE`, `AI_REC`, (레거시) `AI` — 모두 `IssueSourceGroup.AI` 그룹. `commonMetaInfo.issueSourceType`에 저장.
- 후보는 `AI_BASE`만, 배제 판정은 `IssueSourceGroup.AI.types()`(그룹 전체).

### 3-4. 트랜잭션 경계 ⚠️ (인수 시 반드시 확인)

- 트랜잭션은 **UseCase**에 정의(`OrderFormCreateUseCase` 클래스 `@Transactional`, `:14`) — Broker 트랜잭션 금지 컨벤션 준수.
- `CouponAdminCommand`도 클래스 `@Transactional`, **propagation 기본값(REQUIRED), REQUIRES_NEW 아님** → 발급이 주문서 생성과 **동일 트랜잭션에 참여**.
- 발급 호출은 try/catch로 **예외를 swallow**(`OrderFormCreateUseCase.kt:29-38`): 의도는 "쿠폰 발급 실패가 주문서 생성을 막지 않게".

> 🐛 **잠재 리스크(검증 필요)**: 같은 REQUIRED 트랜잭션에서 `issueSystemCouponsOrThrow`가 예외를 던지면 스프링이 트랜잭션을 **rollback-only**로 마킹합니다. 그러면 catch로 예외를 삼켜도 **커밋 시 `UnexpectedRollbackException`이 터져 주문서 생성까지 롤백**될 수 있습니다 — "주문서 생성을 막지 않는다"는 주석 의도가 런타임에 깨질 수 있음.
> 정상 경로에선 `filterByIssueConstraints` 선검증으로 예외가 거의 안 나도록 설계됐으나, **동시성/경합(발급 한도 초과 등)** 시 노출 가능. 발급을 정말로 격리하려면 `REQUIRES_NEW` 분리를 검토하세요. (운영 슬랙 알림 vs UnexpectedRollback 로그로 교차 검증 권장)

---

## 4. 공통 인증

| 엔드포인트군 | 어노테이션 | 방식 |
|--------------|-----------|------|
| `/external/system/**` (로직 1) | `@ExternalSystemAccessAuth` + `@ExternalAccessRateLimit` | `ExternalAccessInterceptor`에서 Basic 토큰 ↔ `externalAuthProperties.systemBasicAuth` 비교. Rate limit: Redis 키로 120초당 1회 |
| `/external/partner/**` (로직 2) | `@ExternalPartnerAccessAuth` | Basic 토큰 ↔ `partnerBasicAuth` 비교. 사용자 컨텍스트 인가 없음(시스템 -1로 기록) |
| `/orderforms` 등 (로직 3) | Spring Security + `@CancunContext` 인증 사용자 | 고객용 Front API |

- 인터셉터: `api-rest/.../config/auth/external/ExternalAccessInterceptor.kt:21`, `ExternalAccessRateLimitInterceptor.kt:20`. 헤더 없음 → `UnauthorizedException`, 자격 불일치 → `ForbiddenException`.

---

## 5. 인수인계 체크리스트 / 주의사항

- [ ] **off-by-one-day**: AI에는 데이터를 하루 먼저 전달 → 로직 1 제외 판정은 `제외일-1`, 로직 2 가격은 항상 "내일" 시작. 정책이 하루 밀려 보이면 이 보정 때문임.
- [ ] **로직 1의 "제외" 2종 구분**: 첫구매딜 = 응답에서 제거 / 그 외 = `EXCLUDED` 플래그(응답엔 남음).
- [ ] **가격수정 적용 = top sales 전제**: top sales 아니면 `priceModificationApplicableStatus = EXCLUDED` → 로직 2에서도 실질 대상 한정.
- [ ] **쿠폰 발급 제외 = 계근(NON_STANDARD) 상품** + 오늘 제외 대상.
- [ ] **로직 2는 부분 성공 모델**: 부적격은 예외가 아니라 `failures`로 반환. 호출측(AI)은 `failures`를 반드시 확인해야 함.
- [ ] **가격 적용 배치 cron은 레포 밖**: `PRODUCT_DAILY_PRICE_SYNC` 트리거 시각은 인프라(외부 스케줄러)에서 관리. 가격이 반영 안 되면 배치 실행 여부부터 확인.
- [ ] **로직 3 트랜잭션 리스크**: 발급 실패 swallow가 REQUIRED 전파의 rollback-only 때문에 보장되지 않을 수 있음 — `REQUIRES_NEW` 분리 검토 대상.
- [ ] **전체 조회/배치의 `findAll()`**: `AIExcludedProduct`, `AIExcludedManagementCategory`, `TopSalesProduct`, `AIBaseCouponDiscountAdjustment` 등은 페이징 없는 전체 조회. 현재는 테이블 행 수가 작다는 전제 — 데이터 증가 시 성능 점검 필요.

### 주요 파일 한눈에

**로직 1**
- `api-rest/.../controller/external/ExternalSystemController.kt`
- `api-rest/.../provider/external/ExternalSystemBroker.kt`
- `product-domain/.../external/service/ExternalProductQuery.kt`
- `product-domain/.../external/model/vo/AIRecommendationApplyStatus.kt`
- `product-domain/.../external/model/dto/{ExternalExtendedProduct,ExternalProductResponse,AIExclusionTarget}.kt`
- `product-domain/.../external/service/{AIExcludedProductQuery,AIExcludedManagementCategoryQuery,TopSalesProductQuery,AIBaseCouponDiscountAdjustmentQuery}.kt`

**로직 2**
- `api-rest/.../controller/external/ExternalPartnerController.kt`
- `api-rest/.../provider/external/ExternalPartnerBroker.kt`
- `product-domain/.../external/service/AIRecReservedPriceCommand.kt`
- `product-domain/.../external/model/dto/{AIRecReservedPriceRequest,AIRecReservedPriceResponse}.kt`
- `product-domain/.../product/service/admin/{ProductDiscountScheduleEnroller,ProductDiscountAdminCommand,ProductListPriceAdminCommand}.kt`
- `api-rest/.../executor/product/ProductDailyPriceSyncService.kt`, `product-domain/.../service/batch/ProductPriceSyncProcessor.kt`

**로직 3**
- `api-rest/.../controller/front/order/OrderFormController.kt`
- `api-rest/.../provider/front/order/OrderFormBroker.kt`
- `order-domain/.../order/OrderFormCreateUseCase.kt`
- `order-domain/.../coupon/service/{OrderFormAiBaseCouponIssuer,OrderFormAiBaseCouponFinder,CouponAdminCommand}.kt`
- `order-domain/.../coupon/repository/{CouponMetaRepository,CouponRepositoryImpl}.kt`
- `order-domain/.../coupon/support/validation/CouponIssueValidator.kt`
- `order-domain/.../coupon/model/vo/type/IssueSourceType.kt`

**공통 인증**
- `api-rest/.../config/auth/external/{ExternalAccessInterceptor,ExternalAccessRateLimitInterceptor,ExternalSystemAccessAuth,ExternalPartnerAccessAuth}.kt`
