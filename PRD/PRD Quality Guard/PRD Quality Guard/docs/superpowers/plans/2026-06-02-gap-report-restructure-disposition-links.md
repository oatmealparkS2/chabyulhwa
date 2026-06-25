# GAP 리포트 재구조화 (색인+상세블록 · 현황/문제점 · 제외 처분 · 링크) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** GAP 리포트를 8열 표에서 "색인 표(6열) + GAP별 상세블록 + ST/DT 도식 섹션" 3단으로 재편하고, 현황/문제점 분리·제외 처분(재실행 carry-forward)·Confluence 페이지 링크를 더한다. 스킬 엔진(schemas/SKILL/verification) + 첫 인스턴스(차별화리뷰Pro) 동시 적용.

**Architecture:** 단일 원본은 스킬 references 3종. `schemas.md`가 산출물 shape를 정의 → `SKILL.md`가 절차로 참조 → `verification.md`가 구조 검증. 셋이 코히어런트해야 검증 subAgent가 PASS. 갭 검출 로직은 불변(표현·처분 레이어만). 테스트 게이트 = 독립 구조검증 subAgent(C1~C7); 회귀 = 결함주입.

**Tech Stack:** Markdown 스킬 파일. Atlassian MCP(`getConfluencePage`, read-only) — 인스턴스 L#→URL 맵 확정에만. 검증 = `Agent` 도구(general-purpose·sonnet). git 커밋 없음(프로젝트 규칙: 디스크 저장, 커밋은 사용자).

**경로 약칭:** `SK=` `.claude/skills/prd-quality-guard/`, `INST=` `차별화리뷰Pro-추천인코드/`. 모두 프로젝트 루트 `/Users/sfn/workspace/PRD Quality Guard/` 기준.

---

## 파일 구조

| 파일 | 책임 | 변경 |
|---|---|---|
| `SK/references/schemas.md` | 산출물 템플릿(갭 리포트·헤더·결번색인) | 갭 표→3단 템플릿, 헤더 L# 라벨, 결번색인 taxonomy |
| `SK/SKILL.md` | 절차(step1~6) | step1 L# 발행, step5 신 레이아웃+처분 수확 |
| `SK/references/verification.md` | C1~C7 구조검증 프롬프트 | C2 재작성, C5/C7 보강 |
| `INST/doc/GAP-차별화리뷰Pro-추천인코드.md` | 첫 인스턴스 GAP 산출물 | 3단 retrofit |
| `INST/doc/TC-차별화리뷰Pro-추천인코드.md` | 첫 인스턴스 TC 산출물 | 헤더 L# 라벨 + 위치 링크 |

`techniques.md`·`_template/CLAUDE.md`는 이번 변경에서 건드리지 않는다(상세블록 교차링크는 schemas.md 템플릿 주석으로 충분; 설계 F의 "소폭 또는 무변"을 "무변"으로 확정).

---

## Task 1: schemas.md — 갭 리포트 템플릿 3단 교체 + 헤더 L# + 결번색인 taxonomy

**Files:**
- Modify: `SK/references/schemas.md` (현재 33–37행 "갭 리포트 표 (8열)" 블록, 90–114행 회차/버전 템플릿)

- [ ] **Step 1: "갭 리포트 표 (8열)" 블록을 3단 템플릿으로 교체**

`schemas.md`에서 아래 기존 블록(33–37행)을 찾는다:
```
**갭 리포트 표 (8열)** — GAP-ID 형식 `GAP-01`(문서 전역 연번), 분류 ∈ {모순·누락·모호·경계미정·TBD}, 심각도 ∈ {High·Med·Low}:

| GAP-ID | 위치 | 관련TC | 기법 | 분류 | 심각도 | 설명 | PM질문/제안 |
|---|---|---|---|---|---|---|---|
|  |  |  |  |  |  |  |  |
```
다음으로 통째 교체:
```
**갭 리포트 (3단: 색인 표 + 상세블록 + 도식 섹션)** — GAP-ID 형식 `GAP-01`(문서 전역 연번), 분류 ∈ {모순·누락·모호·경계미정·TBD}, 심각도 ∈ {High·Med·Low}.

*1단 — 색인 표 (심각도순, 6열, 스캔용):*

| GAP-ID | 위치 | 기법 | 분류 | 심각도 | 한줄요약 |
|---|---|---|---|---|---|
|  |  |  |  |  |  |

*2단 — GAP별 상세블록 (색인의 각 GAP-ID와 1:1):*

### GAP-NN  〈분류〉·〈심각도〉·〈기법〉
- 위치: [L# 〈섹션약기호〉](〈URL〉) … (L-토큰은 헤더 메타의 L#→URL 맵에 해소 — **페이지 단위** 링크. 섹션약기호는 링크 텍스트에 남겨 페이지 내 위치표시)
- 현황: (PRD가 실제로 말하는 사실)
- 문제점: (왜 갭인가 — 리스크/공백)
- PM 질문/제안: …
- 처분: ☑유지(기본)  ☐제외(사유: ___)  ☐오판정(사유: ___)
- 관련 TC: 〈TC-ID〉 (TC 파일 참조)  · 도식 있으면 `→ M2 도식 참조`

처분 의미 — **제외**: 갭 실재하나 PM 미반영(의도된 동작/범위 외/리스크 수용) · **오판정**: 엔진 오검출(가짜 갭). 둘 다 사유 필수. 재실행 시 결번 색인 이월(아래 "회차/버전 템플릿").

*3단 — ST/DT 도식 섹션:* 상태전이 Mermaid 상태도(각 `❓`=GAP 캡션)·결정 매트릭스 사본(각 `❓`·`⚠️`=GAP 캡션)을 **독립 섹션**으로 싣는다. 여러 GAP을 가로지르는 엔티티 모델이라 상세블록에 흡수하지 않고, 상세블록에서 `→ M2 도식 참조`로 교차링크(전이표 전체·완전 매트릭스는 TC 파일).
```

- [ ] **Step 2: 헤더 메타 블록 템플릿에 L# 라벨 + 링크 추가**

`schemas.md` 회차/버전 템플릿(약 92–96행)의 `대상 PRD` 줄을 찾는다:
```
> **대상 PRD**: pageId <숫자> · version v<k> · lastModified <YYYY-MM-DD>
```
교체:
```
> **대상 PRD**: L<#> · pageId <숫자> · version v<k> · lastModified <YYYY-MM-DD> · [링크](<URL>)
```
바로 아래 설명문에 한 줄 추가:
```
다중 PRD면 `대상 PRD` 줄을 페이지별로 반복하며, 각 줄의 `L<#>`(분석 중 부여한 레이어 라벨)·`[링크]`가 본문 위치 약기호의 L-토큰 하이퍼링크가 해소되는 **L#→URL 맵**이다.
```

- [ ] **Step 3: 변경 이력 마커에 🚫제외/🚫오판정 추가**

`schemas.md` 「변경 이력」 템플릿(약 102–107행)의 마커 리스트에 두 줄 추가(➖잔존 줄 위):
```
- 🚫 제외: GAP-zz (사유) — 결번 색인으로 이동 (PM 미반영·갭 실재)
- 🚫 오판정: GAP-vv (사유) — 결번 색인으로 이동 (엔진 오검출)
```

- [ ] **Step 4: 결번 색인 stub 형식에 제외/오판정 추가 + GAP-ID 규칙 보강**

`schemas.md` 「결번 색인」 템플릿(약 109–112행)을 다음으로 교체:
```
## 결번 색인 (해결/제외/오판정된 GAP)
- GAP-xx: [해결 YYYY-MM-DD · pageId <숫자> v<k>] 한줄 설명
- GAP-yy: [제외 YYYY-MM-DD · pageId v<k>] 사유 (PM 미반영 — 갭 실재)
- GAP-ww: [오판정 YYYY-MM-DD] 사유 (엔진 오검출)
```
바로 아래 GAP-ID 규칙 줄(약 114행) 끝에 추가:
```
 · 제외/오판정=해결과 동일(메인 표·상세블록에서 제거 후 색인 stub) · 재개=재발 레일(색인 stub 제거 후 메인 복귀).
```

- [ ] **Step 5: 디스크 저장 확인 (검증은 Task 6에서 일괄)**

이 단계의 산출물은 Task 3·4와 함께 검증되므로 여기선 별도 실행 없음. 파일이 저장됐는지만 확인: `grep -n "3단: 색인" "SK/references/schemas.md"` → 1건 매치.

---

## Task 2: SKILL.md — step1 L# 발행, step5 신 레이아웃 + 처분 수확

**Files:**
- Modify: `SK/SKILL.md` (step1 = 12–16행, step5 = 42–53행)

- [ ] **Step 1: step1에 L# 라벨 발행 지시 추가**

`SKILL.md` step1(`### 1. 대상 PRD 좌표 읽기`)의 마지막 불릿 아래에 추가:
```
- **L# 라벨 부여**: PRD가 여러 페이지면 각 페이지에 레이어 라벨(예: L1 개요/KR · L2 정책 · L3 화면·BO · L4 TechSpec — 페이지 역할 기반, PRD마다 다름)을 부여한다. 이 L#→pageId→URL 맵을 step5 헤더 메타 `대상 PRD` 줄에 `L# · pageId · … · [링크](URL)`로 기록 → 본문 위치 약기호의 L-토큰이 페이지 단위로 하이퍼링크된다(섹션 딥링크는 앵커 불안정으로 안 함).
```

- [ ] **Step 2: step5 GAP 파일 산출물 불릿을 3단 구조로 교체**

`SKILL.md` step5의 `- doc/GAP-<PRD명>.md:` 불릿(약 53행)을 찾아 교체:
```
- `doc/GAP-<PRD명>.md`: **3단 구조**(`references/schemas.md` "갭 리포트") — (1) **색인 표**(6열 `GAP-ID·위치·기법·분류·심각도·한줄요약`, 심각도순) + (2) **GAP별 상세블록**(위치 링크·현황/문제점 분리·PM질문·처분(유지/제외/오판정)·관련TC, 색인과 1:1) + (3) **ST/DT 도식 섹션**(상태전이 상태도·결정 매트릭스 사본, 각 `❓`·`⚠️`=GAP 캡션 — 독립 섹션, 상세블록에서 교차링크). 위치의 L-토큰은 헤더 L#→URL 맵으로 링크. **재실행이면** 말미에 「변경 이력」·「결번 색인」 두 섹션 필수.
```

- [ ] **Step 3: step5 재실행 처리에 "처분 수확" 단계 삽입**

`SKILL.md` step5 "(재실행만) 회차 처리" 번호 리스트의 `1. Delta 탐지` 항목 바로 아래에 새 항목 삽입(이하 번호는 그대로 두고 이 항목만 끼움):
```
1.5. **처분 수확(carry-forward)**: 이전 GAP 파일 상세블록에서 `☑제외`/`☑오판정` + 사유를 읽어, 해당 GAP-ID를 새 색인·상세블록에서 **억제**한다(PRD에 갭이 남아 있어도 재등장 금지 — 좀비 방지). 결번 색인에 `[제외 …]`/`[오판정 …]` 사유와 함께 이월하고 변경이력에 `🚫` 마커로 기록. PM이 마음을 바꾸면(결번색인 stub 삭제) 재발 레일로 다음 회차 메인 복귀.
```

- [ ] **Step 4: 저장 확인**

`grep -n "처분 수확" "SK/SKILL.md"` → 1건. `grep -n "3단 구조" "SK/SKILL.md"` → 1건.

---

## Task 3: verification.md — C2 재작성, C5/C7 보강

**Files:**
- Modify: `SK/references/verification.md` (C2 = 24–25행, C5 = 33–34행, C7 = 39–46행)

- [ ] **Step 1: C2를 신구조 정합 체크로 재작성**

`verification.md`의 C2 블록(`**C2 — 갭 핵심 4필드 충족**` 단락)을 통째 교체:
```
**C2 — 갭 리포트 구조 정합 (색인 표 ↔ 상세블록 ↔ 필수필드)**
GAP 파일은 (1단) 색인 표 + (2단) GAP별 상세블록 구조다. 다음을 모두 확인:
- 색인 표 6열 헤더(`GAP-ID | 위치 | 기법 | 분류 | 심각도 | 한줄요약`)가 존재한다.
- 색인 표의 모든 GAP-ID에 대응 상세블록(`### GAP-NN …`)이 **1:1**로 존재한다(색인엔 있는데 블록 없음=FAIL, 블록은 있는데 색인에 없음=FAIL).
- 각 상세블록의 필수 필드 **위치·현황·문제점·PM 질문/제안**이 모두 비어있지 않다(`처분`·`관련 TC`는 비어도 무방). 분류·심각도·기법은 블록 헤딩 `### GAP-NN  분류·심각도·기법`에서 확인.
하나라도 어긋나면 FAIL. 증거: 색인 GAP-ID 수, 1:1 불일치 ID 목록, 결손 필드 GAP-ID와 어느 필드인지.
```

- [ ] **Step 2: C5에 제외/오판정 stub 인식 추가**

`verification.md` C5 블록에서 결번 색인을 다루는 문장을 찾아, 결번 처리 설명 끝에 다음을 추가:
```
 결번색인 stub 종류 = 해결·제외·오판정(과거 `철회` 표기도 오판정과 동일 취급). 제외/오판정 ID도 메인(색인 표·상세블록)에 재등장하면 FAIL(단 '재발' 표기 ID는 예외).
```

- [ ] **Step 3: C7에 제외 carry-forward 정합 추가**

`verification.md` C7 블록의 확인 항목 리스트(불릿)에 두 줄 추가:
```
- 「변경 이력」에 `🚫제외`/`🚫오판정` 항목이 있으면, 그 GAP-ID가 「결번 색인」에 **사유와 함께** stub으로 존재한다(없으면 FAIL).
- 제외/오판정으로 표기된 GAP-ID는 이번 회차 메인(색인·상세블록)에 재등장하지 않는다('재발' 표기 예외).
```

- [ ] **Step 4: 출력 형식 라벨 갱신**

`verification.md` 최종 출력 블록(약 50–57행)의 C2 줄을 교체:
```
- C2 갭구조정합: PASS/FAIL — <증거>
```

- [ ] **Step 5: 저장 확인**

`grep -n "색인 표 ↔ 상세블록" "SK/references/verification.md"` → 1건.

---

## Task 4: 인스턴스 GAP 파일 retrofit (3단 전환)

**Files:**
- Modify: `INST/doc/GAP-차별화리뷰Pro-추천인코드.md`
- 참조(수정 금지): `INST/CLAUDE.md` "대상 PRD" 5개 URL

- [ ] **Step 1: L#→URL 맵 확정 (페이지 역할 페치)**

`INST/CLAUDE.md` "대상 PRD"의 5개 URL pageId: `1931739326`, `2082799647`, `2083160088`, `2083454980`, `2082897936`. 기존 GAP 본문은 L1~L4 토큰을 쓴다(L1 KR · L2 정책 2-x · L3 화면 S1/BO · L4 §TechSpec). L# 1개가 2페이지에 걸칠 수 있으므로(L3=화면+BO), 5개 pageId를 각각 `mcp__atlassian__getConfluencePage`(contentFormat: markdown, read-only)로 페치해 **제목·최상위 헤딩으로 역할을 확인**하고 아래 맵을 확정한다(가설 → 페치로 검증):

| L# | 역할(가설) | pageId(가설) |
|---|---|---|
| L1 | 개요·KR | 1931739326 |
| L2 | 정책(2-x) | 2083160088 |
| L3-화면 | 화면스펙 S1 | 2082799647 *(또는 02-2와 교차—페치로 확정)* |
| L3-BO | BO 운영 | 2083454980 |
| L4 | Tech Spec(§) | 2082897936 |

위치 토큰 링크 해소 규칙: `L1`→L1 URL, `L2`→L2 URL, `L3 S1…`→L3-화면 URL, `L3 BO…`→L3-BO URL, `L4`→L4 URL. (페치 결과가 가설과 다르면 실제에 맞춰 맵 수정.)

- [ ] **Step 2: 헤더 메타 블록을 파일 최상단에 삽입**

기존 파일은 `# GAP 리포트 …` 제목 + `> PM 단독 액션 리스트…` 인용블록으로 시작한다. 제목 바로 아래(인용블록 위)에 헤더 메타 삽입(Step1에서 확정한 URL·version 사용; version은 페치 응답값):
```
> **분석 회차**: 1회차 (2026-05-29)
> **이전 회차**: — (최초)
> **대상 PRD**:
> · L1 · pageId 1931739326 · v<페치값> · [링크](<L1 URL>)
> · L2 · pageId 2083160088 · v<페치값> · [링크](<L2 URL>)
> · L3-화면 · pageId 2082799647 · v<페치값> · [링크](<L3화면 URL>)
> · L3-BO · pageId 2083454980 · v<페치값> · [링크](<L3BO URL>)
> · L4 · pageId 2082897936 · v<페치값> · [링크](<L4 URL>)
```

- [ ] **Step 3: 기존 8열 표 → 6열 색인 표로 축약**

기존 "## 1. 종합 갭 표 (심각도순)"의 8열 표(GAP-01~24)를 6열 색인 표로 교체. 변환 규칙: `GAP-ID·위치·기법·분류·심각도`는 그대로, `한줄요약` = 기존 `설명`을 한 문장(≤40자)으로 압축, `위치`는 Step1 규칙으로 L-토큰을 `[L# 약기호](URL)` 링크화. `설명`·`PM질문/제안` 열은 제거(상세블록으로 이동). 예(GAP-01):
```
## 1. 색인 표 (심각도순)

| GAP-ID | 위치 | 기법 | 분류 | 심각도 | 한줄요약 |
|---|---|---|---|---|---|
| GAP-01 | [L2 2-1·OI-01](L2URL) ↔ [L4 §2·5](L4URL) | 상태전이 | 모순 | High | 추천인 리워드 형태 L2(쿠폰 확정)↔L4(TBD) 불일치 |
| GAP-03 | [L2 US-01 AC-4](L2URL) · [L3 S1-D](L3화면URL) · [L4 §3-1](L4URL) | 결정테이블 | 누락 | High | 비로그인 유효코드 진입 후 이력판정 경로 미정의 |
…(나머지 22행 동일 규칙)…
```

- [ ] **Step 4: GAP별 상세블록 24개 생성 (색인 바로 아래 "## 2. GAP 상세" 섹션)**

각 GAP의 기존 `설명`을 **현황/문제점으로 분리**, `PM질문/제안`을 그대로 옮기고, `처분`(전부 유지 기본), `관련TC`(기존 값) 추가. 분리 규칙: `설명` 중 "PRD가 무엇을 말하는가(사실·확정·서술)"=현황, "왜 갭인가(불일치·미정의·공백·리스크)"=문제점. 도식 연결 GAP(M1↔GAP-03·08, M2↔GAP-01·10·18, M3↔GAP-13·18, DT-1↔GAP-03, DT-2↔GAP-10·22, DT-3↔GAP-16)은 `→ 도식 참조` 추가. 워크드 예 2건:
```
## 2. GAP 상세

### GAP-01  모순·High·상태전이
- 위치: [L2 2-1·OI-01](L2URL) ↔ [L4 §2·5](L4URL)
- 현황: L2는 추천인 리워드를 "10,000원 쿠폰(최소주문 10만원)"으로 확정([기인지] OI-01 완료).
- 문제점: L4 TechSpec Step5·시나리오4는 여전히 "[TBD: 포인트 or 쿠폰]" — 배치 구현 소스가 두 값을 가리킴.
- PM 질문/제안: 쿠폰으로 확정인지? L4 TechSpec의 TBD를 쿠폰으로 갱신 필요. 쿠폰 발급 API·유효기간·최소주문 10만원 조건 명시 요청.
- 처분: ☑유지  ☐제외(사유: ___)  ☐오판정(사유: ___)
- 관련 TC: US04-T04  · → M2 도식 참조

### GAP-20  TBD·Low·–
- 위치: [L1 KR2](L1URL)
- 현황: [기인지] L1 KR2 "신규 유료 전환 N건" 목표치가 "[TBD: 정책 확정 후]"로 표기됨.
- 문제점: 목표 수치 미확정 — 성과 판정 기준 부재.
- PM 질문/제안: 목표 전환 건수 수치 확정 요청.
- 처분: ☑유지  ☐제외(사유: ___)  ☐오판정(사유: ___)
- 관련 TC: –
```
나머지 22개 GAP(02·04·05·06·07·08·09·10·11·12·13·14·15·16·17·18·19·22·23·24·03)도 기존 행의 `설명`→현황/문제점 분리, `PM질문/제안`·`관련TC` 이전, `처분 ☑유지`를 적용해 동일 형식으로 작성. `[기인지]` 태그는 현황 앞에 보존.

- [ ] **Step 5: ST/DT 도식 섹션 번호 재정렬**

기존 "## 2. 상태전이 갭 도식"·"## 3. 결정 매트릭스 갭 사본"·"## 4. PM 우선 처리 권고"를 각각 "## 3."·"## 4."·"## 5."로 번호만 조정(색인=1, 상세=2 삽입에 따라). 도식 내용·Mermaid·캡션은 불변.

- [ ] **Step 6: 저장 확인**

`grep -c "^### GAP-" "INST/doc/GAP-차별화리뷰Pro-추천인코드.md"` → `24`. `grep -c "처분: ☑유지" "…GAP….md"` → `24`.

---

## Task 5: 인스턴스 TC 파일 retrofit (헤더 L# + 위치 링크)

**Files:**
- Modify: `INST/doc/TC-차별화리뷰Pro-추천인코드.md`

- [ ] **Step 1: 헤더 메타 블록 삽입**

TC 파일 최상단(제목 아래)에 Task4 Step2와 **동일한** 헤더 메타 블록(분석 회차·이전 회차·대상 PRD 5줄 L#·링크)을 삽입. (두 산출물 헤더 일치 — schemas.md "두 파일 최상단" 규칙.)

- [ ] **Step 2: TC 표의 위치/전제조건 L-토큰 링크화**

TC 표·전제조건·전이표 캡션에서 `L1`~`L4` 토큰이 나오는 위치를 Task4 Step1 맵으로 `[L# …](URL)` 링크화한다. TC 본문에 L-토큰이 없으면(요소코드 기반이면) 이 스텝은 헤더 L# 맵 제공으로 충분 — 변경 없음. 변경한 줄 수를 기록.

- [ ] **Step 3: 저장 확인**

`grep -n "분석 회차" "INST/doc/TC-차별화리뷰Pro-추천인코드.md"` → 1건(헤더 삽입 확인).

---

## Task 6: 검증 subAgent 재디스패치 → C1~C7 (테스트 게이트)

**Files:** 없음(읽기 전용 검증)

- [ ] **Step 1: 검증 subAgent 디스패치**

`SK/references/verification.md`의 "프롬프트 본문" 전체를 읽어 `{{TC_FILE_PATH}}`·`{{GAP_FILE_PATH}}`를 두 인스턴스 산출물 절대경로로 치환하고, `Agent` 도구로 디스패치한다:
- subagent_type: `general-purpose`, model: `sonnet`
- TC_FILE_PATH = `/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/TC-차별화리뷰Pro-추천인코드.md`
- GAP_FILE_PATH = `/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/GAP-차별화리뷰Pro-추천인코드.md`

- [ ] **Step 2: verdict 확인**

Expected: `## 검증 결과: PASS` — C1·C3·C4·C6 PASS(불변 요소), **C2 PASS**(색인↔상세블록 1:1·필수필드), **C5 PASS**(ID·참조 무결), **C7 N/A**(인스턴스 1회차). FAIL이면 Task 4/5의 해당 위반(증거에 명시된 GAP-ID/필드)을 고치고 Step 1 재디스패치. 통과까지 반복. (자동수정 금지 원칙은 운영 시 사용자 판단이나, 여기선 retrofit 정합 맞추는 작업이므로 위반을 수정해 재검증.)

---

## Task 7: 결함주입 회귀 (C2·C5/C7 정확 지목 확인)

**Files:** 임시 복제본만(원본 불변)

- [ ] **Step 1: C2 결함 주입본 생성**

GAP 파일을 임시경로 `/tmp/GAP-defect-c2.md`로 복사한 뒤, 상세블록 1개(예: GAP-24)의 `### GAP-24 …` 헤딩과 본문을 삭제(색인엔 GAP-24 남김) → 색인↔상세블록 1:1 위반.

- [ ] **Step 2: C2 결함본 검증 → FAIL(C2) 확인**

검증 subAgent를 `GAP_FILE_PATH=/tmp/GAP-defect-c2.md`, TC는 원본으로 디스패치.
Expected: `## 검증 결과: FAIL`, C2 줄에 "색인에 GAP-24 있으나 상세블록 없음" 취지 증거. 다른 체크는 영향 없어야 정상.

- [ ] **Step 3: C5/C7 결함 주입본 생성**

GAP 파일을 `/tmp/GAP-defect-c5.md`로 복사한 뒤, 상세블록 GAP-05의 처분을 `☑제외(사유: 범위 외)`로 바꾸고 메인(색인·상세블록)에는 그대로 둔 채 **결번 색인 stub을 만들지 않음** → 제외인데 메인 재등장 + 색인 누락(C5/C7 위반). 파일 말미에 「변경 이력」(`🚫 제외: GAP-05 (범위 외)`)만 추가하고 「결번 색인」 stub은 누락시킨다. (헤더에 2회차·이전회차 표기를 더해 C7 활성화.)

- [ ] **Step 4: C5/C7 결함본 검증 → FAIL 확인**

검증 디스패치. Expected: `FAIL` — C7(또는 C5)이 "🚫제외 GAP-05이 결번색인에 stub 없음 / 제외 ID가 메인 재등장" 지목.

- [ ] **Step 5: 임시본 정리**

`rm /tmp/GAP-defect-c2.md /tmp/GAP-defect-c5.md`. 원본 2파일은 Task 6에서 PASS된 상태 그대로.

---

## Task 8: CLAUDE.md 현황 + 메모리 갱신

**Files:**
- Modify: 루트 `CLAUDE.md` (「현황」 섹션)
- Modify: `~/.claude/projects/-Users-sfn-workspace-PRD-Quality-Guard/memory/` (관련 메모리 + MEMORY.md)

- [ ] **Step 1: 루트 CLAUDE.md 「현황」에 완료 항목 추가**

「현황」 리스트 말미에 `✅ **GAP 리포트 재구조화 (2026-06-02)**` 항목 추가 — 3단 레이아웃·현황/문제점 분리·처분 3상태+carry-forward·페이지 링크·C2 재작성/C5·C7 보강·인스턴스 retrofit·검증 PASS·결함주입 FAIL 지목. 설계/계획 경로 명시.

- [ ] **Step 2: 메모리 갱신**

`prd-quality-guard-project.md` 메모리에 이번 변경 한 줄 추가(스키마가 3단으로 바뀜·처분 carry-forward·링크). MEMORY.md 인덱스 해당 줄에 hook 갱신.

- [ ] **Step 3: 사용자에게 커밋 안내**

프로젝트 규칙상 커밋은 사용자가 직접. 변경 파일 목록(스킬 3 + 인스턴스 2 + 루트 CLAUDE.md + spec + plan)을 보고하고 커밋 권유는 사용자 판단에 맡긴다.

---

## Self-Review

**Spec coverage (설계 A~F):**
- A(3단 레이아웃) → Task 1 Step1, Task 4 Step3·4·5 ✓
- B(현황/문제점) → Task 1 Step1 템플릿, Task 4 Step4 ✓
- C(R3 링크) → Task 1 Step2(헤더), Task 2 Step1, Task 4 Step1·2·3, Task 5 ✓
- D(R2 처분+carry-forward) → Task 1 Step3·4, Task 2 Step3, Task 4 Step4 ✓
- E(검증) → Task 3 (C2 재작성·C5·C7) ✓
- F(영향파일+retrofit) → Task 1·2·3(엔진), Task 4·5(인스턴스) ✓
- 검증계획(subAgent PASS·결함주입) → Task 6·7 ✓

**Placeholder scan:** `<페치값>`·`<L# URL>`은 Task4 Step1 페치로 채워지는 실데이터 슬롯(placeholder 아님 — 출처 명시됨). "나머지 22개 동일 규칙"은 변환이 결정적이고 워크드 예 2건 + 전체 규칙 제공이라 허용. 그 외 TBD/TODO 없음.

**Type consistency:** 필드명 통일 확인 — `현황`·`문제점`·`PM 질문/제안`·`처분`·`관련 TC`가 schemas.md(Task1)·verification.md C2(Task3)·인스턴스(Task4)에서 동일 표기. 처분 3상태 `유지/제외/오판정`이 schemas·SKILL·verification·인스턴스 전부 일치. 마커 `🚫제외/🚫오판정`이 변경이력(Task1 Step3)·verification C7(Task3 Step3)·결함주입(Task7 Step3) 일치. 색인 6열 헤더 문자열이 Task1·Task3·Task4에서 동일.
