---
name: prd-quality-guard
description: Use when generating test cases (TCs) and finding PRD gaps from a PRD using black-box testing techniques. Applies equivalence partitioning, boundary value, decision table, state transition, pairwise, use-case, and error-guessing to derive TCs, recording every point where a complete TC cannot be written as a PRD gap (모순/누락/모호/경계미정/TBD). Reads the target PRD link (Confluence pageId/cloudId) from the current folder's CLAUDE.md "대상 PRD" section, then writes a TC file plus a gap-report file into the folder. Korean output.
---

# PRD Quality Guard — 블랙박스 TC 기반 PRD 갭 분석

핵심 원칙: **"완전한 TC를 못 쓰면 = PRD 갭."** 출력 언어: 한국어.

## 절차

### 1. 대상 PRD 좌표 읽기
현재 작업 폴더의 `CLAUDE.md` "대상 PRD" 섹션에서 페이지 정보를 읽는다. **권장 1차 입력 = Confluence URL 리스트** — URL에서 `pageId = .../pages/<숫자>`, `cloudId = 사이트 도메인` 패턴으로 자동 파싱한다.
- 구버전 형식(`cloudId: <도메인>` + 페이지별 `pageId: <숫자>` 분리)도 그대로 인식 — 기존 인스턴스 호환.
- 섹션이 없거나 플레이스홀더(`<URL 붙여넣기>`·`<URL>`·`<여기>`)가 남아 있으면 사용자에게 PRD 링크를 요청한다.
- 단축 URL(`/wiki/x/<코드>`)은 pageId를 직접 포함하지 않으므로, 사용자에게 long-form URL(`.../pages/<숫자>/...`)로 다시 붙여달라고 요청한다.
- **L# 라벨 부여 + 딥링크 base**: PRD가 여러 페이지면 각 페이지에 레이어 라벨(예: L1 개요/KR · L2 정책 · L3 화면·BO · L4 TechSpec — 페이지 역할 기반, PRD마다 다름)을 부여한다. 이 L#→pageId→URL 맵을 step5 헤더 메타 `대상 PRD` 줄에 `L# · pageId · … · [링크](URL)`로 기록한다. **base URL은 입력 URL의 타이틀 슬러그를 떼지 말고 풀URL(`.../pages/<id>/<슬러그>`) 그대로 보존**한다 — 섹션 프래그먼트(`#앵커`)가 안정 동작하려면 슬러그 포함 정규형이 필요(Confluence가 pageId로 정규화하므로 슬러그 형태 자체는 관대).
- **섹션 딥링크 발행**: 본문 위치 약기호의 L-토큰은 **페이지 내 섹션 헤딩 앵커로 딥링크**한다. 앵커 도출 규칙 = `헤딩텍스트의 공백→"-" 치환 + 비ASCII UTF-8 퍼센트인코딩(점 보존)`, 딥링크 = `<base풀URL>#<앵커>`. 헤딩인 토큰(예 `2-1`·`US-01`)은 자기 헤딩 앵커, 표 행/하위항목 토큰(예 `AC-4`·`OI-01`·`§6`·`S1-B`)은 **가장 가까운 상위 헤딩 앵커**에 태운다. 매칭이 불확실하면 **페이지 레벨 폴백**(슬러그 풀URL·프래그먼트 없음). 앵커는 분석한 version에 고정 — 헤딩 rename 시 페이지 상단으로 폴백(치명적 아님·재실행 시 재생성).

### 2. PRD 페치
각 pageId를 `mcp__atlassian__getConfluencePage`(contentFormat: markdown)로 라이브 페치. 원본은 read-only — 수정 도구 사용 금지. MCP 미인증이면 사용자에게 `/mcp` 연결을 안내한다. 응답에서 페이지별 `version`·`lastModified`(또는 그에 준하는 버전 메타)를 함께 캡처해 둔다 — step 2.5 버전 비교와 step 5 헤더 메타에 쓴다. 또한 본문에서 헤딩 라인(마크다운 `#`~`######`)을 추출해 페이지별 **헤딩 인벤토리**(`{헤딩텍스트 → 앵커}`)를 구성해 둔다 — step1 딥링크 규칙으로 위치 토큰을 헤딩 앵커에 해소하는 데 쓴다.

### 2.5 회차 판별 (재실행 추적)
작업 폴더 하위 `doc/`에 기존 `TC-<PRD명>.md`·`GAP-<PRD명>.md`가 있는지 본다.
- **없음 → 1회차(신규)**: 회차 로직 건너뛰고 step 3으로. (단 step 5 헤더 메타는 1회차도 기록.)
- **있음 → N회차(재실행)**: 기존 GAP 파일 헤더의 `version`과 step 2에서 캡처한 새 version을 비교.
  - **상향** → 정상 재실행. step 3 진행.
  - **동일/하향** → "대상 PRD 페이지 버전 변경 없음(v_k 그대로). 그래도 재분석할까?"를 사용자에게 확인한 뒤 진행 여부 결정.
재실행이면 기존 산출물은 **아직 아카이브하지 않는다** — step 5의 delta 탐지가 이전 GAP 파일을 읽어야 하므로 `doc/`에 그대로 둔다.

### 3. 요소 추출 → 기법 매핑 → TC 도출 → 갭 기록
- 요소 추출: US/AC · 화면상태 · 정책 · 계산로직 · 비기능.
- 기법 매핑: `references/techniques.md`의 기법↔요소 매핑 규칙으로 요소마다 1순위 기법 선택.
- TC 도출: `references/schemas.md`의 TC 7열 표를 **빈칸 없이** 채우려 시도.
- TC 양산 방지: `references/techniques.md` "TC 양산 방지 규칙"을 강제한다 — 클래스당 대표 TC 1개·경계는 별도 경계 TC·다요인은 페어와이즈 압축·모든 TC는 커버리지 대상 ≥1에 매핑(중복+무변별=병합). TC는 갭 발견 수단인 동시에 QA 실행 명세이므로 redundant TC를 만들지 않는다.
- 상태전이 모델: 상태전이가 1순위인 요소(상태·라이프사이클 보유)는 `references/techniques.md` "상태전이(ST) 산출물" 규격대로 전이표 + Mermaid 상태도를 그려 빈 칸(미정의 전이)을 갭으로 식별.
- 결정 매트릭스: 결정테이블이 1순위인 요소(둘 이상 조건이 결합되는 정책)는 `references/techniques.md` "결정테이블(DT) 산출물" 규격대로 조건×규칙 매트릭스(+조건 ≥3개·비대칭 분기면 `flowchart`)를 그려 빈/충돌 셀(`❓`·`⚠️`)을 갭으로 식별.
- 갭 기록: 한 칸이라도(특히 전제조건·기대결과·전이표 칸·결정 매트릭스 셀) 못 채우면 그 지점이 갭. 분류(모순/누락/모호/경계미정/TBD)·심각도(High/Med/Low)로 8열 갭 표에 기록. PRD가 이미 미결로 표기한 항목엔 `[기인지]` 태그.
- 비목표(2): ① **우선순위** — 스킬은 우선순위를 매기지 않고 TC 표에 우선순위 열도 두지 않는다(영향도 컨텍스트는 PRD에 없음 → QA가 자기 컨텍스트로 부여하는 다운스트림 활동). ② **갭의 강제 TC화 금지** — 완전한 TC를 못 쓰는 지점은 TC로 변환하지 말고 갭으로만 남긴다(미정의 동작에 가짜 기대결과를 적으면 QA 실행이 거짓 PASS/FAIL이 됨).

### 4. Category 통제어휘 도출
`references/schemas.md`의 도출법으로 이 PRD 전용 Category 값 5~10개를 제안 → 사용자 확정 → 폴더 CLAUDE.md "이 PRD Category 값"에 기록. 값은 PRD마다 다름 — 스킬에 하드코딩 금지.

### 5. 산출물 2파일 생성 (폴더 하위 `doc/`)
작업 폴더 하위에 `doc/`가 없으면 만들고, 두 파일을 **그 안에** 쓴다. `<PRD명>` = 폴더 CLAUDE.md 제목의 PRD 이름(없으면 사용자에게 확인). 두 파일명에 동일하게 사용.

**(모든 회차) 헤더 메타 블록**: 두 파일 최상단에 `references/schemas.md` "산출물 헤더 메타 블록" 템플릿대로 회차·pageId·version·lastModified·이전회차 경로를 적는다.

**(재실행만) 회차 처리** — step 2.5에서 N회차로 판별됐으면, 새 파일을 쓰기 전에 순서대로:
1. **Delta 탐지**: `doc/`의 이전 GAP 파일을 읽어 step 3의 새 갭과 매칭한 초안을 만들고, 각 항목을 사용자에게 "동일/재발/신규/해결" 4분류로 확정받는다(자동 매칭은 제안일 뿐, 확정은 사람).
1.5. **처분 수확(carry-forward)**: 이전 GAP 파일 상세블록에서 `☑제외`/`☑오판정` + 사유를 읽어, 해당 GAP-ID를 새 색인·상세블록에서 **억제**한다(PRD에 갭이 남아 있어도 재등장 금지 — 좀비 방지). 결번 색인에 `[제외 …]`/`[오판정 …]` 사유와 함께 이월하고 변경이력에 `🚫` 마커로 기록. PM이 마음을 바꾸면(결번색인 stub 삭제) 재발 레일로 다음 회차 메인 복귀.
2. **아카이브**: 확정 후 기존 `doc/TC-*.md`·`doc/GAP-*.md`를 `doc/_archive/<이전회차날짜>/`로 이동(이전 헤더의 회차 날짜 사용; 같은 날짜 폴더가 이미 있으면 `-r2` 등 suffix 붙이고 사용자 확인).
3. **GAP-ID 항구성**: 회차 가로질러 불변 — 잔존=같은 ID 유지, 해결=메인 표 제거+「결번 색인」 stub, 재발=원 ID 재사용(색인 stub 제거 후 메인 복귀), 신규=지금껏 쓰인 최대 ID+1(결번 안 메움).
4. **변경 이력 + 결번 색인**: GAP 파일에 `references/schemas.md` 템플릿대로 두 섹션을 **필수**로 싣는다(회차간 diff = 1급 산출물).
- `doc/TC-<PRD명>.md`: 커버리지 매트릭스(요소군×7기법, 셀=TC수/갭수) + 요소별 TC 표(7열) + **상태전이 모델** 블록(상태·라이프사이클 엔티티마다 전이표 + Mermaid 상태도) + **결정 매트릭스** 블록(다조건 정책마다 조건×규칙 표, 조건 ≥3·비대칭이면 `flowchart`). 각 갭은 `→ GAP-xx (GAP 파일 참조)`로 연결하고, 전이표의 `❓` 칸·매트릭스의 `❓`·`⚠️` 셀은 GAP과 교차연결.
- `doc/GAP-<PRD명>.md`: **3단 구조**(`references/schemas.md` "갭 리포트") — (1) **색인 표**(6열 `GAP-ID·위치·기법·분류·심각도·한줄요약`, 심각도순) + (2) **GAP별 상세블록**(색인과 1:1, **하이브리드 표** 형식 — 서술 5필드[위치·현황·문제점·PM질문/제안·관련TC]는 `| 항목 | 내용 |` 세로 2열 표, `처분`(유지/제외/오판정)은 표 밖 편집줄로 분리; 셀 내 다중문장은 `<br>`) + (3) **ST/DT 도식 섹션**(상태전이 상태도·결정 매트릭스 사본, 각 `❓`·`⚠️`=GAP 캡션 — 독립 섹션, 상세블록에서 교차링크). 위치의 L-토큰은 헤더 L#→URL 맵을 base로 **섹션 딥링크**(step1 규칙; 폴백 시 페이지 레벨). **재실행이면** 말미에 「변경 이력」·「결번 색인」 두 섹션 필수.

### 6. 자체검증 (독립 subAgent)
step5 완료 후, 생성 세션은 `references/verification.md`의 "프롬프트 본문"에서 `{{TC_FILE_PATH}}`·`{{GAP_FILE_PATH}}`를 두 산출물의 절대경로로 치환해 **검증 subAgent를 Agent 도구로 디스패치**한다(subagent_type: general-purpose, model: sonnet). 검증자는 PRD를 재페치하지 않고 두 파일의 **구조 정합성만** 본다(체크 C1~C7 정의는 `references/verification.md`). 검증자는 각 체크를 증거 수집 후 **한 번만 판정**한다(중간 가판정·번복 금지 — 판정은 최종 출력 블록에만). 반환된 verdict를 **가공 없이 사용자에게 전달**한다. FAIL이어도 자동 수정하지 않는다(수정 여부는 사용자 판단).

## 참조
- `references/techniques.md` — 7기법 가이드 + 기법↔요소 매핑 규칙
- `references/schemas.md` — TC/갭/매트릭스 스키마 + 갭분류·심각도 기준 + Category 도출법
- `references/verification.md` — 독립 구조검증 subAgent 프롬프트 + C1~C7 체크 정의
- 루트 `_template/CLAUDE.md` — 새 PRD 폴더용 CLAUDE.md 템플릿 (스킬 외부, project-local 단일 원본)
