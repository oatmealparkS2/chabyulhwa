> ## ▶ 이 폴더(루트)는 PRD 품질 가드 방법론의 개발 본거지 (dev home)
> 방법론 엔진은 **프로젝트 스킬** `prd-quality-guard`(`.claude/skills/prd-quality-guard/`)에 있다 — 이 프로젝트 안에서만 동작.
> **루트에선 분석을 돌리지 않는다.** 각 PRD = 이 폴더 하위 **서브폴더**(자체 `CLAUDE.md` + `doc/` 산출물).

# PRD 품질 가드 — 방법론 본거지

블랙박스 7기법으로 PRD의 TC를 도출하며 갭을 찾는 방법론 프로젝트.
핵심 원칙: **"완전한 TC를 못 쓰면 = PRD 갭."** 출력 언어: 한국어.

## 새 PRD 분석하는 법
1. 이 폴더 하위에 PRD용 **서브폴더** 생성.
2. 루트 `_template/CLAUDE.md`를 그 서브폴더의 `CLAUDE.md`로 복사 → 제목 교체 + "대상 PRD" 섹션에 Confluence URL 붙여넣기(스킬이 URL에서 cloudId·pageId 자동 파싱). (`_template/README.md`는 복사하지 않는다.)
3. 그 서브폴더에서 실행: **"prd-quality-guard 스킬로 이 PRD의 TC·갭 리포트를 만들어줘."**
4. 산출물 2파일이 그 서브폴더의 `doc/`에 생성됨. (Category 값은 PRD마다 스킬이 재도출 — 하드코딩 금지.)

## PRD 인스턴스
- `차별화리뷰Pro-추천인코드/` — 첫 시연 인스턴스 (TC 42 / 갭 24). 대상 PRD 좌표·Category·산출물은 그 폴더의 `CLAUDE.md` 참조.

## 방법론·설계 문서
- 스킬: `.claude/skills/prd-quality-guard/` (프로젝트 로컬)
- 설계: `docs/superpowers/specs/2026-05-27-skillify-prd-quality-guard-design.md`
- 계획: `docs/superpowers/plans/2026-05-27-skillify-prd-quality-guard.md`

## PRD 입력 구조 권장안 (PM 가이드)
> 분석 품질의 상한선 = PRD 입력 품질. 엔진이 2계층을 읽으려면 PRD가 아래 구조를 따라야 한다.
> 상세 발표본은 별도 PPT(사용자 보유). 여기는 그 단일 출처(SSOT).

**2계층 모델** (브라운필드/그린필드 공통)
- **Layer 0 제품 지식베이스** — 항상 현재 진실·시점 무관: `용어집` / `정책`(할인중복·환불·인증·공통규칙) / `기능 명세`
- **Layer 1 프로젝트(PRD)** — 이벤트성·델타: 이번 분석 대상. Layer 0를 **링크만**(복붙 금지 — 정책 복붙 = 모순 갭 발원). 출시되면 그 기능이 Layer 0 `기능 명세`로 흡수.
- **그린필드 = 특수해**: Layer 0 부재 → PRD 자체가 베이스라인, INTERACTION 갭 없음. 구조는 동일.

**권장 Confluence 트리**
```
<Product> (플랫폼)
├─ 📚 제품 지식베이스   ← Layer 0
│   ├─ 용어집
│   ├─ 정책
│   └─ 기능 명세 ─ <서비스>/<기능…>   ← 출시 기능이 여기로 흡수
└─ 🚧 프로젝트 / PRD    ← Layer 1 (베이스라인 링크)
```
**규칙** (세 줄, 각각 한 가지 함정을 막는다 — 공통 목적: "같은 사실이 두 곳에 다른 값으로 존재하는 상태"를 구조적으로 불가능하게 만들어 가짜 모순 갭을 차단)
1. **진실의 원본은 `기능 명세` 한 곳.** 같은 동작 규칙(예: "추천코드는 가입 후 7일 내 1회만 입력")이 여러 문서에 흩어지면 한 곳만 고쳐지고 나머지는 옛 값으로 남아 → 어느 게 진짜인지 모르는 모순. 그래서 동작 규칙의 원본은 무조건 `기능 명세`로 못 박는다.
2. **PRD는 참조(링크)만 — 단방향.** PRD에 정책을 복붙(❌ "참고로 기존 환불 정책은 14일…")하면, 원본이 7일로 바뀌어도 PRD 복붙본은 14일로 남아 엔진이 두 값을 읽고 **유령 모순 갭**을 만든다. 대신 링크만(✅ "환불 정책은 [기능 명세>환불] 참조") 걸면 원본이 바뀌어도 항상 최신이고, PRD엔 이번 프로젝트의 델타만 남는다. **단방향** = 화살표가 PRD→기능 명세 한 방향뿐. 서로 참조(양방향)하면 "뭐가 원본인지" 다시 모호해진다. (= 안티패턴 "정책 복붙=모순"의 구조적 예방)
3. **"신규/기존"을 폴더 축으로 쓰지 않음 (시점 의존 → 무너짐).** 오늘 만든 기능은 오늘은 "신규"지만 출시되면 "기존"이 된다 → `신규/` 폴더에 넣어두면 폴더 이름이 시간이 지나며 거짓이 되고, 언제 `기존/`으로 옮길지 기준도 시간에 종속된다. 올바른 축은 **"항상 현재 진실(Layer 0)" vs "이벤트성 델타(Layer 1)"** — 시간이 지나도 안 무너진다. 기능이 출시되면 폴더 이동 없이 그냥 Layer 1 PRD → Layer 0 `기능 명세`로 **흡수**된다.

**갭 출처 태깅** (2계층 입력 시)
- `[FEATURE]` 피처 자체 미정의 — 이번 PM 소유
- `[INTERACTION]` 기존 동작과의 상호작용 미정의 — **최우선**·이번 PM 소유 (지식베이스 링크 부재 = 갭으로 노출)
- `[BASELINE]` 제품 본체 구멍 — 타 팀 소유·참고용

**피처 PRD 필수 섹션**: 개요/목표/**비목표** · 용어(또는 KB 링크) · 유스케이스(정상/대안/예외) · 입력 필드 표(타입·범위·경계·필수·기본값) · 비즈니스 규칙 표(결정테이블형) · 상태 정의(전이표) · 에러/예외 처리 · **영향 범위·기존 기능 상호작용**(=INTERACTION 표면) · Open Questions(TBD 명시)

**안티패턴**: 부사 회피어("적절히/필요시")=모호 / 산문 규칙 나열=조합 누락 / 경계 없는 수치=경계미정 / 예외플로우 생략 / 정책 복붙=모순

## 현황 (2026-05-29)
- ✅ 방법론을 **프로젝트 로컬 스킬** `prd-quality-guard`로 추출 (SKILL.md + references{techniques,schemas} + assets/CLAUDE.md.template). 엔진은 이 프로젝트 안에서만 동작.
- ✅ 첫 시연 인스턴스를 `차별화리뷰Pro-추천인코드/` **서브폴더로 분리** (TC 42 / 갭 24, 산출물은 그 폴더 `doc/`; 분리 전 통합문서는 그 폴더 `_archive/`). 루트는 dev home 역할만 — 인스턴스 정보는 서브폴더 CLAUDE.md로 이전.
- ✅ 산출물 위치 규칙 = 각 PRD 폴더 하위 `doc/` (스킬 SKILL.md step5 + 템플릿 반영).
- ✅ 스킬 references **도메인 일반화** — `techniques.md`/`schemas.md` 본문을 도메인 중립으로 전환, 추천인코드 사례는 각 파일 부록으로 격리(역수입 금지). 무관 도메인(EV 충전) 앵커링 테스트 통과.
- ✅ **스킬 트리거 테스트 통과** — 서브폴더에서 `claude` 실행 시 상위 루트의 `.claude/skills/prd-quality-guard`가 자동 발견·트리거됨 → **루트 실행 불필요**.
- ✅ **상태전이(ST) 산출물 강화** — ST를 `기법` 태그로 끝내지 않고 **상태전이 모델(전이표 + Mermaid 상태도)**을 산출물에 출력하도록 스킬 일반화(techniques.md ST 규격 신설 · schemas.md 템플릿 4종 · SKILL.md step3/5/6). 전이표 `❓` 칸 = 미정의 전이 = GAP 교차연결. 기존 인스턴스 TC 파일에 모델 3종(M1 가입화면 / M2 리워드 라이프사이클 / M3 할인차수) 소급 반영. **배치 규칙: 전이표 전체는 TC 파일, Mermaid 상태도는 TC + GAP 리포트 양쪽**(GAP는 PM 단독 액션 리스트라 ST 갭을 그 자리에 도식화; 도식↔갭 캡션 M1→GAP-17·M2→GAP-11·M3→GAP-12). mermaid-cli로 6개 도식 렌더 검증 완료.
- ✅ **자체검증(step6) 독립 subAgent화** — 생성 세션이 자기 산출물을 점검하던 5줄 체크리스트를, 격리된 fresh-context subAgent가 TC/GAP 두 파일의 **구조 정합성(C1~C6)만** 판정하도록 전환. 신규 `references/verification.md`(자기완결형 검증 프롬프트), SKILL.md step6 = 생성 직후 Agent 도구로 디스패치(general-purpose·sonnet) → verdict 가공 없이 사용자에게 전달, 자동수정 없음. 검증자는 각 체크를 한 번만 판정(중간 번복 금지). 검증: 무결 인스턴스=PASS, 결함 주입(C2 심각도 결손·C3 기법 누락·C5 dangling 참조)=FAIL 정확 지목. 설계 `docs/superpowers/specs/2026-05-27-prd-quality-guard-subagent-verification-design.md` / 계획 `docs/.../plans/2026-05-27-prd-quality-guard-subagent-verification.md`.
- ✅ **결정테이블(DT) 산출물 강화** — DT를 `기법` 태그로 끝내지 않고 **결정 매트릭스(조건×규칙 표 + 조건 ≥3·비대칭 분기 시 Mermaid `flowchart`)**를 산출물에 출력하도록 스킬 일반화(techniques.md DT 규격 신설 · schemas.md DT 매트릭스 템플릿 · SKILL.md step3/5 · verification.md C6 신설). 매트릭스 `❓` 셀 = 동작 미정의(누락), `⚠️` 셀 = 규칙 충돌(모순) → 모두 GAP 교차연결. 기존 인스턴스 TC 파일에 매트릭스 2종(DT-1 가입 시 추천코드 적용 결정 / DT-2 동시 결제 처리) 소급 반영. **배치 규칙: 전체 매트릭스는 TC 파일, `❓`·`⚠️` 셀 포함 매트릭스 사본은 GAP 리포트에도 게재**(매트릭스↔갭 캡션 DT-1→GAP-02·DT-2→GAP-16). mermaid-cli로 DT-1 flowchart 렌더 검증 완료. **명칭 통일**: 활성 파일에서 `결정표` → `결정테이블` 일괄 치환(\_archive 보존). 적용 후 검증 subAgent **재실행 → C1~C6 전부 PASS**.
- ✅ **템플릿 「사용자 할 일」 구체화 + URL-입력 방식 전환** — `assets/CLAUDE.md.template` 「사용자 할 일」을 3단계 → **4단계(폴더+CLAUDE.md 준비 / 본문 빈칸 채우기 / `/mcp` 사전확인 / 실행)**로 확장. "대상 PRD" 입력 방식을 cloudId/pageId 분리 기입 → **Confluence URL 페이스트**로 전환(스킬이 URL에서 cloudId·pageId 자동 파싱). SKILL.md step1 = URL-primary, 구버전 cloudId/pageId 구조 형식도 그대로 인식(기존 차별화리뷰Pro 인스턴스 호환). 단축 URL(`/wiki/x/<코드>`)은 long-form 요청 안내. 루트 CLAUDE.md "새 PRD 분석하는 법" 단계 2 안내문도 URL 방식으로 정렬.
- ✅ **템플릿 위치 가시화 (2026-05-28)** — 신규 PRD 시작 시 발견성 개선. `.claude/skills/prd-quality-guard/assets/CLAUDE.md.template` → 루트 `_template/CLAUDE.md`로 이동(+ `_template/README.md` 안전 안내). 스킬 `assets/` 디렉토리 제거 — project-local 스킬이라 단일 원본. SKILL.md·루트 CLAUDE.md step 2·기존 인스턴스 자기지시 갱신. 「현황」 히스토리 보존. 설계 `docs/superpowers/specs/2026-05-28-template-location-move-design.md` / 계획 `docs/superpowers/plans/2026-05-28-template-location-move.md`.
- ✅ **회차/버전 관리 + TC 양산 방지 (2026-05-29)** — 재실행 추적 도입. PRD 수정→재분석 시 이전 산출물 `doc/_archive/<날짜>/` 자동 보관 + GAP 파일 「변경 이력」(해결/재발/신규/잔존)·「결번 색인」(해결 GAP stub) 내장, GAP-ID 회차간 항구(재발=원ID 재사용·신규=max+1), 산출물 헤더에 pageId·version·lastModified 캡처(step2.5 회차 판별 신설). **TC 양산 방지 규칙**(클래스당 대표1·경계분리·페어와이즈 압축·커버리지 매핑+병합) techniques.md 단일원본 신설. **비목표 못박음**: 우선순위는 스킬 미산정+컬럼 미출력(QA 소유)·갭의 강제 TC화 금지(가짜 기대결과→거짓 PASS/FAIL 방지). 검증 **C5 정정**(결번 색인 정합)+**C7 신설**(재실행 추적). 적용 파일: SKILL.md(step2/2.5/3/5/6) · schemas.md(헤더·변경이력·결번색인 템플릿+병합주석) · techniques.md · verification.md · `_template/CLAUDE.md`. 설계 `docs/superpowers/specs/2026-05-29-prd-quality-guard-rerun-versioning-design.md` / 계획 `docs/superpowers/plans/2026-05-29-prd-quality-guard-rerun-versioning.md`.
- ✅ **전체 최종 점검 (2026-05-29 2차)** — 스킬 엔진·references·템플릿·docs·인스턴스 산출물 일괄 검증. (1) **doc/ 규칙 정합화** — 활성 인스턴스 산출물(TC·GAP, 05-29 신버전)이 폴더 루트에 있던 것을 `차별화리뷰Pro-추천인코드/doc/`로 이동(규칙 충족). `차별화리뷰Pro-추천인코드_Temp/`(05-28 구버전)는 **사용자 지정 백업**으로 유지. (2) **엔진 정합성 확인** — SKILL.md step1~6 + 회차 로직 + C1~C7 참조 맞물림, references 3종(techniques: 7기법·양산방지·ST·DT규격 / schemas: 분류·심각도·템플릿4종·Category·회차/변경이력/결번색인 / verification: C1~C7) 완비. (3) **독립 구조검증 subAgent 재디스패치(general-purpose·sonnet) → C1~C6 PASS · C7 N/A(1회차)** — 8요소군 커버리지·갭24 4필드·7기법·ST 3모델(M1/M2/M3) ❓6칸 연결·GAP-ID 중복0/결번0·TC→GAP 28참조 dangling0·DT 3매트릭스 ❓4·⚠️2 연결 전부 무결. (4) 결론: 엔진·첫 인스턴스 구조 무결, **회차/버전 관리(변경이력·결번색인)는 실회차 실행 시에만 산출물에 출현** → 잔여 Task12 실회차 시연과 일치.
- ✅ **PRD 입력 구조 권장안(PM 가이드) 문서화 (2026-06-01)** — 2계층 모델(Layer0 지식베이스/Layer1 PRD)·Confluence 트리·갭 출처 태깅([FEATURE]/[INTERACTION]/[BASELINE])·피처 PRD 필수 섹션·안티패턴을 루트 CLAUDE.md에 SSOT로 신설. PPT는 사용자 보유본에 직접 반영. **엔진 미반영**: descendants 기반 Layer0 자동 ingest·INTERACTION/BASELINE 태깅은 미착수 direction.
- ✅ **Confluence 트리 규칙 설명 확장 (2026-06-01)** — "PRD 입력 구조 권장안" 내 권장 트리 규칙을 한 줄 압축본 → **세 규칙 번호 매김 + 함정·예시**로 풀어 씀(① 원본 1곳=`기능 명세` ② PRD는 단방향 링크만+정책 복붙 유령갭 ❌/✅ 대비 ③ "신규/기존" 폴더축 금지=시점 의존). 안티패턴 "정책 복붙=모순"과의 연결 명시. 문서 가독성 개선만(엔진·SSOT 내용 불변).
- ✅ **CEG 흡수 ADR 기록 (2026-06-01)** — "왜 7기법에 Cause-Effect Graph가 없나" 질문에 대한 설계 결정 박제. CEG는 산출물이 결정테이블(DT)로 수렴하므로 **DT로 흡수**(별도 기법 미채택); DT의 `flowchart`·`❓/⚠️` 셀이 CEG의 인과 시각화·조합 완전성을 대체. `techniques.md` 7기법 표 하단에 **각주 1줄**(활성 파일·매 실행 적재), 전체 추론(Context/Decision/Consequences + revisit 조건)은 **비적재 ADR**로 분리 — `docs/superpowers/specs/2026-06-01-adr-cause-effect-graph-absorbed-into-decision-table.md`. 정통 ADR 4칸 양식 첫 사례(기존 `*-design.md`와 구분 위해 `adr-` 접두). 흡수 명시 범위는 CEG 1건 한정(타 표준 기법 부재 변명 금지).
- ✅ **GAP 리포트 재구조화 — 색인+상세블록·현황/문제점 분리·제외 처분·Confluence 링크 (2026-06-02)** — PM 소비/처분 레이어 개선(갭 검출 로직 불변). (1) **3단 레이아웃**: 뚱뚱한 8열 갭 표 → **색인 표(6열 `GAP-ID·위치·기법·분류·심각도·한줄요약`, 심각도순 스캔용) + GAP별 상세블록(색인과 1:1) + 기존 ST/DT 도식 섹션 유지**. (2) **R1 현황/문제점 분리**: 상세블록에서 `설명`을 `현황`(사실)·`문제점`(왜 갭) 별도 필드로 강제 분리. (3) **R2 제외 처분**: 상세블록 `처분` 3상태(☑유지/☐제외+사유/☐오판정+사유) — `제외`=갭 실재하나 PM 미반영·`오판정`=엔진 오검출. 재실행 시 step5 delta 로직이 이전 GAP 파일의 `☑제외/☑오판정`을 **수확→메인 억제(좀비 방지)→결번색인 `[제외/오판정]` 이월→변경이력 `🚫` 마커**(기존 carry-forward 레일 확장; 철회=재발 레일 재사용). (4) **R3 페이지 링크**: 위치 약기호의 L-토큰을 헤더 메타 `대상 PRD` 줄의 **L#→URL 맵**(분석 중 부여)으로 페이지 단위 하이퍼링크(섹션 딥링크는 앵커 불안정으로 미채택; Mermaid note 내부엔 링크 금지). (5) **검증**: verification.md **C2 재작성**(색인↔상세블록 1:1 + 필수필드 위치·현황·문제점·PM질문), **C5 보강**(결번색인 stub=해결·제외·오판정), **C7 보강**(🚫제외↔결번색인 stub 정합·제외 ID 메인 재등장 금지). 적용 파일: `schemas.md`·`SKILL.md`(step1 L# 발행·step5 신레이아웃+처분수확)·`verification.md` + **인스턴스 retrofit**(차별화리뷰Pro GAP 24건 3단 전환·TC 헤더 L#+링크). **검증 subAgent 재디스패치(general-purpose·sonnet) → C1~C6 PASS·C7 N/A(1회차)**; 결함주입 회귀(C2 1:1 위반·C5/C7 제외 stub 누락) **FAIL 정확 지목** 확인. L#맵은 MCP로 5페이지 제목·version 페치해 확정(L1 1931739326 v33 / L2 2082799647 v11 / L3-화면 2083160088 v8 / L3-BO 2083454980 v10 / L4 2082897936 v8). 설계 `docs/superpowers/specs/2026-06-02-gap-report-restructure-disposition-links-design.md` / 계획 `docs/superpowers/plans/2026-06-02-gap-report-restructure-disposition-links.md`.
- ✅ **GAP 리포트 v2 — 섹션 딥링크 + 하이브리드 상세표 (2026-06-02 2차)** — PM 피드백 2건 반영(갭 검출 로직 불변·표현 레이어만). (1) **섹션 딥링크**: 06-02 1차에서 "앵커 불안정"으로 미채택했던 섹션 딥링크를 **재채택**(PM이 실효성 확인). 앵커 규칙 = `헤딩텍스트 공백→"-" + 비ASCII UTF-8 퍼센트인코딩(점 보존)`, base는 **슬러그 포함 풀URL**(`.../pages/<id>/<슬러그>`), 헤딩 매칭 불확실 시 페이지 레벨 폴백, 앵커는 분석 version 고정(헤딩 rename 시 상단 폴백—GAP 헤더 캡션 명기). 실측 검증: `2-1. 리워드 체계`→`#2-1.-%EB%A6%AC%EC%9B%8C%EB%93%9C-%EC%B2%B4%EA%B3%84` = PM 기대값 정확 일치. (2) **하이브리드 상세표**: GAP 상세블록 불릿 → **서술 5필드(위치·현황·문제점·PM질문·관련TC) 세로 2열 표 + 처분 표 밖 편집줄 분리**(처분은 PM 편집 대상+carry-forward 파싱 대상이라 라인 유지). 셀 다중문장은 `<br>`. **전체 1표(행=GAP) 회귀안은 비채택**(06-02 1차에 버린 뚱뚱한 표). 적용 파일: 엔진 3종(`SKILL.md` step1 딥링크발행·step2 헤딩인벤토리·step5 하이브리드표 / `schemas.md` 앵커규칙 소절+상세블록 템플릿+헤더캡션 / `verification.md` C2 표행 탐지) + 인스턴스 retrofit(GAP 헤더 슬러그+캡션·색인24행·상세24블록 하이브리드표·딥링크 70개, TC 헤더 슬러그+본문 딥링크 3). 앵커는 5페이지 MCP 페치 후 결정론적 스크립트로 산출(손 인코딩 금지). **검증**: 구조 subAgent 재디스패치 → **C1~C6 PASS·C7 N/A(1회차)**; C2 결함주입(GAP-06 현황 행 삭제) → **FAIL 정확 지목**; 딥링크 표본 3건 디코딩 = 실제 헤딩 일치. 설계 `docs/superpowers/specs/2026-06-02-gap-report-deeplinks-detail-table-design.md` / 계획 `docs/superpowers/plans/2026-06-02-gap-report-deeplinks-detail-table.md`. **후속: L3 §5 딥링크 승격 (사용자 지시)** — 폴백이던 `[L3 §5]`(GAP-11)를 딥링크로 올리기 위해 **라이브 PRD L3-화면(2083160088) 본문을 1회 편집**(read-only 규칙 예외, 사용자 지시): `## 5. 검토중인 요소` 헤딩에 박혀 있던 상태칩 `260526 추가`를 헤딩 아래 단락으로 이동(헤딩 텍스트 정리=앵커 안정화). HTML 포맷 국소 수정(헤딩 1곳만, 테이블·이미지·매크로 무손상; 재페치 대조 확인) → 페이지 **v9→v10**(원 분석 v8 이후 외부 편집으로 이미 v9였음). 새 앵커 `#5.-%EA%B2%80%ED%86%A0%EC%A4%91%EC%9D%B8-%EC%9A%94%EC%86%8C` 디코딩=`5. 검토중인 요소` 일치. GAP-11 색인+상세 딥링크 승격, GAP·TC 헤더 L3-화면 version v8→v10·lastModified 2026-06-02 갱신. **남은 페이지레벨 폴백은 GAP-04 `[L3]`(섹션 미지정이라 딥링크 불가) 1건뿐.**
- ⏭ 미착수 옵션: **엔진 2계층 ingest**(`getConfluencePageDescendants`로 Layer0 자동 끌어오기 + INTERACTION/BASELINE 태깅 — 입력 구조 권고가 현장 정착된 뒤 착수) / **Task12 실회차 시연**(신스킬 회차/버전 관리 실증 — 실제 PRD 변경분 반영 또는 변경 없는 드라이런; MCP로 5페이지 version 비교 후 분기) / High 6건 PM 1페이지 요약 / **스키마 표현 개선 A~F(별도 spec — 채택 게이트: 갭발견·QA실행 기여 여부)** / (옵션) 차별화리뷰Pro 인스턴스 CLAUDE.md를 URL 형식으로 마이그레이션.

## git
- 모든 변경분 현재 **uncommitted**(디스크 저장됨). 모든 커밋은 사용자가 직접. 원본 Confluence PRD는 read-only 조회만.
