# 회차/버전 관리 + TC 양산 방지 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PRD Quality Guard 스킬에 재실행(회차) 추적을 도입한다 — PM이 PRD를 고쳐 재분석할 때 이전 산출물을 자동 보관하고, GAP 라이프사이클(해결/재발/신규/잔존)을 회차 간 안정적 GAP-ID로 추적한다. 동시에 TC 양산 방지 규칙을 못 박고, 우선순위·갭의 강제 TC화를 명시적 비목표로 둔다.

**Architecture:** 스킬은 마크다운 파일 집합(`SKILL.md` + `references/{techniques,schemas,verification}.md`)이다. 회차 로직은 **재실행 시에만** 활성(`doc/`에 기존 산출물 존재 여부로 판별). 산출물 헤더에 PRD 버전 메타를 캡처, GAP 파일에 「변경 이력」·「결번 색인」을 내장, 이전본은 `doc/_archive/<날짜>/`로 이동. 검증 subAgent는 C5를 결번 색인과 정합하도록 정정하고 C7(재실행 추적)을 신설.

**Tech Stack:** Markdown 파일 편집 + 셸(grep·ls·diff·파일 이동). 자동 테스트 러너 없음 — "테스트"는 grep 구조 검증 + 검증 subAgent 결함주입 테스트(Agent 도구).

**git 주의:** 프로젝트 규칙(루트 CLAUDE.md "모든 커밋은 사용자가 직접") + 현재 git 저장소 아님 → **이 plan에 git 단계 없음.** 모든 변경은 디스크에만 저장.

**참조 스펙:** `docs/superpowers/specs/2026-05-29-prd-quality-guard-rerun-versioning-design.md`

---

## File Structure

| 파일 | 책임 | 작업 |
|---|---|---|
| `.claude/skills/prd-quality-guard/references/techniques.md` | 7기법 가이드. **「TC 양산 방지 규칙」 섹션 신설**(4규칙 단일 원본). | Modify (Task 1) |
| `.claude/skills/prd-quality-guard/references/schemas.md` | 스키마 템플릿. **헤더 메타 블록 + 변경 이력/결번 색인 템플릿** 추가, 커버리지 매트릭스 병합 주석. | Modify (Task 2) |
| `.claude/skills/prd-quality-guard/SKILL.md` | 절차. step 2 version 캡처 · **step 2.5 회차 판별 신규** · step 3 양산 방지+비목표 · step 5 헤더/delta/아카이브/이력 · step 6 C1~C7. | Modify (Task 3·4·5·6) |
| `.claude/skills/prd-quality-guard/references/verification.md` | 검증 subAgent. **C5 정정 + C7 신설** + 체크 개수·출력 블록. | Modify (Task 7) |
| `_template/CLAUDE.md` | 신규 PRD 템플릿. 재실행 안내 한 줄 추가. | Modify (Task 8) |
| `CLAUDE.md` (루트) | 「현황」에 이번 작업 기록 + ⏭ 옵션 갱신. | Modify (Task 9) |
| (검증 전용) | 구조 grep + 검증 subAgent 결함주입 테스트. | Task 10·11 |

**작업 순서 근거:** 참조 파일(techniques·schemas)이 SKILL.md step들이 가리키는 대상이므로 먼저 만든다(Task 1·2) → SKILL.md 절차(Task 3~6) → 검증자(Task 7) → 사용자 표면(Task 8·9) → 검증(Task 10·11).

---

## Task 1: `techniques.md` — 「TC 양산 방지 규칙」 섹션 신설

**Files:**
- Modify: `.claude/skills/prd-quality-guard/references/techniques.md` (7기법 가이드 표와 「기법 ↔ 요소 매핑 규칙」 사이, 현재 line 16 빈 줄 위치)

스펙 §5.1의 4규칙을 **단일 원본**으로 여기 둔다(SKILL step 3과 schemas.md는 이 섹션을 참조만 — DRY).

- [ ] **Step 1: 삽입 지점 확인**

```bash
grep -n "## 기법 ↔ 요소 매핑 규칙" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/techniques.md"
```

Expected: `17:## 기법 ↔ 요소 매핑 규칙` (1행 매치).

- [ ] **Step 2: Edit 적용 — 매핑 규칙 섹션 헤더 앞에 새 섹션 삽입**

old_string:
```
## 기법 ↔ 요소 매핑 규칙
```

new_string:
````
## TC 양산 방지 규칙

TC는 두 목적을 동시에 가진다 — ① PRD 갭 발견 수단 ② 실제 QA가 실행하는 테스트 명세. 그래서 redundant TC = QA 실행 인시 낭비다. 도출 시 아래 4규칙을 강제한다(이 섹션이 단일 원본 — SKILL step3·schemas.md는 여기를 참조):

- **클래스당 대표 1개** — 동등분할은 한 동등 클래스당 TC 1개. 같은 클래스 안에서 값만 바꾼 TC는 만들지 않는다.
- **경계는 별도 경계 TC로** — 경계값(직전·정각·직후)은 클래스 대표 TC와 분리된 별도 TC. 클래스 대표와 중복시키지 않는다.
- **조합은 페어와이즈로 압축** — 다요인 조합은 모든 값 쌍을 1회 이상 덮는 최소 조합만(전수 조합 금지).
- **커버리지 매핑 의무 + 병합** — 모든 TC는 {동등클래스·경계·결정규칙·상태전이·유스케이스 경로·에러 시나리오} 중 최소 1개에 매핑된다. 두 TC가 같은 커버리지 대상에 매핑되고 추가 변별력이 없으면 병합한다.

## 기법 ↔ 요소 매핑 규칙
````

- [ ] **Step 3: 검증**

```bash
grep -n "TC 양산 방지 규칙\|클래스당 대표 1개\|커버리지 매핑 의무" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/techniques.md"
```

Expected: 3행 매치(섹션 헤더 1 + 규칙 2). `## TC 양산 방지 규칙`이 `## 기법 ↔ 요소 매핑 규칙`보다 위에 위치.

---

## Task 2: `schemas.md` — 헤더 메타 + 변경 이력/결번 색인 템플릿 + 병합 주석

**Files:**
- Modify: `.claude/skills/prd-quality-guard/references/schemas.md`

### 2-A. 커버리지 매트릭스 병합 주석 (line 39)

- [ ] **Step 1: 대상 줄 확인**

```bash
grep -n "커버리지 매트릭스 (행=요소군" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/schemas.md"
```

Expected: `39:**커버리지 매트릭스 (행=요소군 × 열=7기법)** — 셀 = \`TC수/갭수\`:` (1행).

- [ ] **Step 2: Edit 적용 — 설명에 병합 규칙 한 줄 추가**

old_string:
```
**커버리지 매트릭스 (행=요소군 × 열=7기법)** — 셀 = `TC수/갭수`:
```

new_string:
```
**커버리지 매트릭스 (행=요소군 × 열=7기법)** — 셀 = `TC수/갭수`. 두 TC가 같은 셀에서 동일 커버리지 대상에 매핑되고 추가 변별력이 없으면 병합한다(양산 방지 — `references/techniques.md` "TC 양산 방지 규칙"):
```

### 2-B. 헤더 메타 + 변경 이력/결번 색인 템플릿 추가 (부록 앞에)

- [ ] **Step 3: 삽입 지점 확인**

```bash
grep -n "## 부록 — 한 도메인 심각도 예시" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/schemas.md"
```

Expected: `90:## 부록 — 한 도메인 심각도 예시 (참고용, 역수입 금지)` 부근 1행.

- [ ] **Step 4: Edit 적용 — Category 도출법 섹션과 `---`·부록 사이에 회차 템플릿 삽입**

먼저 현재 Category 섹션 끝~부록 경계를 확인:
```bash
grep -n "^---$\|## Category 통제 어휘 도출법\|## 부록" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/schemas.md"
```
Expected: `84:## Category 통제 어휘 도출법` · `88:---` · `90:## 부록 …` (line 88의 `---`가 경계).

old_string:
```
> PRD의 기능 분해 단위(유저스토리 묶음 / 화면군 / 정책 영역)에서 5~10개의 상호배타적 기능 버킷을 추출한다. 화면 URL 그룹·US 제목·정책 섹션이 1차 후보다. 값 목록은 PRD별로 다르다.

---
```

new_string:
````
> PRD의 기능 분해 단위(유저스토리 묶음 / 화면군 / 정책 영역)에서 5~10개의 상호배타적 기능 버킷을 추출한다. 화면 URL 그룹·US 제목·정책 섹션이 1차 후보다. 값 목록은 PRD별로 다르다.

## 회차/버전 템플릿 (재실행 추적)

**산출물 헤더 메타 블록 (TC·GAP 두 파일 최상단)** — 1회차도 회차·PRD 버전은 기록. 다중 PRD면 `대상 PRD` 줄을 pageId별로 반복:

```
> **분석 회차**: N회차 (YYYY-MM-DD)
> **대상 PRD**: pageId <숫자> · version v<k> · lastModified <YYYY-MM-DD>
> **이전 회차**: (N-1)회차 (YYYY-MM-DD, pageId <숫자> v<j>) → `doc/_archive/<YYYY-MM-DD>/`
```
1회차면 `이전 회차` 줄은 `> **이전 회차**: — (최초)`.

**「변경 이력」 + 「결번 색인」 (GAP 파일 전용)** — 재실행(2회차+)이면 둘 다 **필수** 섹션(회차간 diff = 1급 산출물). GAP 파일 말미에 싣는다:

```
## 변경 이력
### N회차 (YYYY-MM-DD, pageId <숫자> v<j>→v<k>)
- ✅ 해결: GAP-xx (한줄) — 결번 색인으로 이동
- 🔁 재발: GAP-yy (한줄) — 원 ID 재사용, 색인에서 복귀
- 🆕 신규: GAP-zz (한줄)
- ➖ 잔존: GAP-aa, GAP-bb …

## 결번 색인 (해결/철회된 GAP)
- GAP-xx: [해결 YYYY-MM-DD · pageId <숫자> v<k>] 한줄 설명
- GAP-ww: [철회 YYYY-MM-DD] 오판정 사유
```

GAP-ID 규칙: 회차 가로질러 불변 · 잔존=같은 ID 유지 · 해결=메인 표에서 제거 후 색인 stub · 재발=원 ID 재사용(색인 stub 제거 후 메인 복귀) · 신규=직전까지 쓰인 최대 ID+1(결번 안 메움).

---
````

- [ ] **Step 5: 검증**

```bash
grep -n "회차/버전 템플릿\|산출물 헤더 메타 블록\|「변경 이력」 + 「결번 색인」\|병합한다(양산 방지" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/schemas.md"
```

Expected: 4행 매치(병합 주석 1 + 회차 템플릿 섹션 헤더 1 + 헤더 메타 1 + 변경이력/결번색인 1).

---

## Task 3: `SKILL.md` — step 2 version 캡처 + step 2.5 회차 판별 신설

**Files:**
- Modify: `.claude/skills/prd-quality-guard/SKILL.md` (현재 step 2 = line 18~19)

- [ ] **Step 1: 대상 확인**

```bash
grep -n "### 2. PRD 페치\|### 3. 요소 추출" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: `18:### 2. PRD 페치` · `21:### 3. 요소 추출 → 기법 매핑 → TC 도출 → 갭 기록`.

- [ ] **Step 2: Edit 적용 — step 2 본문에 version 캡처 추가 + step 2.5 삽입**

old_string:
```
### 2. PRD 페치
각 pageId를 `mcp__atlassian__getConfluencePage`(contentFormat: markdown)로 라이브 페치. 원본은 read-only — 수정 도구 사용 금지. MCP 미인증이면 사용자에게 `/mcp` 연결을 안내한다.
```

new_string:
```
### 2. PRD 페치
각 pageId를 `mcp__atlassian__getConfluencePage`(contentFormat: markdown)로 라이브 페치. 원본은 read-only — 수정 도구 사용 금지. MCP 미인증이면 사용자에게 `/mcp` 연결을 안내한다. 응답에서 페이지별 `version`·`lastModified`(또는 그에 준하는 버전 메타)를 함께 캡처해 둔다 — step 2.5 버전 비교와 step 5 헤더 메타에 쓴다.

### 2.5 회차 판별 (재실행 추적)
작업 폴더 하위 `doc/`에 기존 `TC-<PRD명>.md`·`GAP-<PRD명>.md`가 있는지 본다.
- **없음 → 1회차(신규)**: 회차 로직 건너뛰고 step 3으로. (단 step 5 헤더 메타는 1회차도 기록.)
- **있음 → N회차(재실행)**: 기존 GAP 파일 헤더의 `version`과 step 2에서 캡처한 새 version을 비교.
  - **상향** → 정상 재실행. step 3 진행.
  - **동일/하향** → "대상 PRD 페이지 버전 변경 없음(v_k 그대로). 그래도 재분석할까?"를 사용자에게 확인한 뒤 진행 여부 결정.
재실행이면 기존 산출물은 **아직 아카이브하지 않는다** — step 5의 delta 탐지가 이전 GAP 파일을 읽어야 하므로 `doc/`에 그대로 둔다.
```

- [ ] **Step 3: 검증**

```bash
grep -n "### 2.5 회차 판별\|version.*lastModified.*캡처\|아직 아카이브하지 않는다" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: 3행 매치. `### 2.5`가 `### 3.`보다 위.

---

## Task 4: `SKILL.md` step 3 — 양산 방지 참조 + 비목표 2개

**Files:**
- Modify: `.claude/skills/prd-quality-guard/SKILL.md` (step 3 = "TC 도출" 불릿 ~ "갭 기록" 불릿)

- [ ] **Step 1: 대상 확인**

```bash
grep -n "TC 도출: \`references/schemas.md\`의 TC 7열 표를" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: 1행 매치(현재 line 24).

- [ ] **Step 2: Edit 적용 — "TC 도출" 불릿 뒤에 양산 방지 불릿 삽입**

old_string:
```
- TC 도출: `references/schemas.md`의 TC 7열 표를 **빈칸 없이** 채우려 시도.
```

new_string:
```
- TC 도출: `references/schemas.md`의 TC 7열 표를 **빈칸 없이** 채우려 시도.
- TC 양산 방지: `references/techniques.md` "TC 양산 방지 규칙"을 강제한다 — 클래스당 대표 TC 1개·경계는 별도 경계 TC·다요인은 페어와이즈 압축·모든 TC는 커버리지 대상 ≥1에 매핑(중복+무변별=병합). TC는 갭 발견 수단인 동시에 QA 실행 명세이므로 redundant TC를 만들지 않는다.
```

- [ ] **Step 3: Edit 적용 — "갭 기록" 불릿 뒤에 비목표 2개 명문화**

먼저 현재 "갭 기록" 불릿 끝을 확인:
```bash
grep -n "PRD가 이미 미결로 표기한 항목엔 \`\[기인지\]\` 태그" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```
Expected: 1행 매치(현재 line 27, step 3 마지막 불릿).

old_string:
```
- 갭 기록: 한 칸이라도(특히 전제조건·기대결과·전이표 칸·결정 매트릭스 셀) 못 채우면 그 지점이 갭. 분류(모순/누락/모호/경계미정/TBD)·심각도(High/Med/Low)로 8열 갭 표에 기록. PRD가 이미 미결로 표기한 항목엔 `[기인지]` 태그.
```

new_string:
```
- 갭 기록: 한 칸이라도(특히 전제조건·기대결과·전이표 칸·결정 매트릭스 셀) 못 채우면 그 지점이 갭. 분류(모순/누락/모호/경계미정/TBD)·심각도(High/Med/Low)로 8열 갭 표에 기록. PRD가 이미 미결로 표기한 항목엔 `[기인지]` 태그.
- 비목표(2): ① **우선순위** — 스킬은 우선순위를 매기지 않고 TC 표에 우선순위 열도 두지 않는다(영향도 컨텍스트는 PRD에 없음 → QA가 자기 컨텍스트로 부여하는 다운스트림 활동). ② **갭의 강제 TC화 금지** — 완전한 TC를 못 쓰는 지점은 TC로 변환하지 말고 갭으로만 남긴다(미정의 동작에 가짜 기대결과를 적으면 QA 실행이 거짓 PASS/FAIL이 됨).
```

- [ ] **Step 4: 검증**

```bash
grep -n "TC 양산 방지: \`references/techniques.md\`\|비목표(2):\|갭의 강제 TC화 금지" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: 3행 매치(양산 방지 불릿 1 + 비목표 불릿 안 2개 토큰).

---

## Task 5: `SKILL.md` step 5 — 헤더 메타 + delta + 아카이브 + 변경이력/결번색인

**Files:**
- Modify: `.claude/skills/prd-quality-guard/SKILL.md` (step 5 = 현재 line 32~35)

- [ ] **Step 1: 현재 step 5 전체 확인**

```bash
sed -n '32,36p' "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: step 5 헤더 + 도입문 + TC/GAP 두 불릿 (line 35가 GAP 불릿 끝, line 36 = 빈 줄).

- [ ] **Step 2: Edit 적용 — step 5 도입문 뒤에 회차 처리 블록 삽입**

old_string:
```
### 5. 산출물 2파일 생성 (폴더 하위 `doc/`)
작업 폴더 하위에 `doc/`가 없으면 만들고, 두 파일을 **그 안에** 쓴다. `<PRD명>` = 폴더 CLAUDE.md 제목의 PRD 이름(없으면 사용자에게 확인). 두 파일명에 동일하게 사용.
```

new_string:
```
### 5. 산출물 2파일 생성 (폴더 하위 `doc/`)
작업 폴더 하위에 `doc/`가 없으면 만들고, 두 파일을 **그 안에** 쓴다. `<PRD명>` = 폴더 CLAUDE.md 제목의 PRD 이름(없으면 사용자에게 확인). 두 파일명에 동일하게 사용.

**(모든 회차) 헤더 메타 블록**: 두 파일 최상단에 `references/schemas.md` "산출물 헤더 메타 블록" 템플릿대로 회차·pageId·version·lastModified·이전회차 경로를 적는다.

**(재실행만) 회차 처리** — step 2.5에서 N회차로 판별됐으면, 새 파일을 쓰기 전에 순서대로:
1. **Delta 탐지**: `doc/`의 이전 GAP 파일을 읽어 step 3의 새 갭과 매칭한 초안을 만들고, 각 항목을 사용자에게 "동일/재발/신규/해결" 4분류로 확정받는다(자동 매칭은 제안일 뿐, 확정은 사람).
2. **아카이브**: 확정 후 기존 `doc/TC-*.md`·`doc/GAP-*.md`를 `doc/_archive/<이전회차날짜>/`로 이동(이전 헤더의 회차 날짜 사용; 같은 날짜 폴더가 이미 있으면 `-r2` 등 suffix 붙이고 사용자 확인).
3. **GAP-ID 항구성**: 회차 가로질러 불변 — 잔존=같은 ID 유지, 해결=메인 표 제거+「결번 색인」 stub, 재발=원 ID 재사용(색인 stub 제거 후 메인 복귀), 신규=지금껏 쓰인 최대 ID+1(결번 안 메움).
4. **변경 이력 + 결번 색인**: GAP 파일에 `references/schemas.md` 템플릿대로 두 섹션을 **필수**로 싣는다(회차간 diff = 1급 산출물).
```

- [ ] **Step 3: Edit 적용 — GAP 불릿에 재실행 섹션 명시**

old_string:
```
- `doc/GAP-<PRD명>.md`: 종합 갭 리포트(8열, 심각도순) = PM 액션 리스트. ST에서 도출된 갭이 있으면 **상태전이 Mermaid 상태도(각 `❓`=GAP-ID 캡션)**, DT에서 도출된 갭이 있으면 **결정 매트릭스 사본(전체 또는 갭 행 발췌, 각 `❓`·`⚠️`=GAP-ID 캡션)**도 함께 실어 단독 가독성을 확보(전이표 전체·완전 매트릭스는 TC 파일에).
```

new_string:
```
- `doc/GAP-<PRD명>.md`: 종합 갭 리포트(8열, 심각도순) = PM 액션 리스트. ST에서 도출된 갭이 있으면 **상태전이 Mermaid 상태도(각 `❓`=GAP-ID 캡션)**, DT에서 도출된 갭이 있으면 **결정 매트릭스 사본(전체 또는 갭 행 발췌, 각 `❓`·`⚠️`=GAP-ID 캡션)**도 함께 실어 단독 가독성을 확보(전이표 전체·완전 매트릭스는 TC 파일에). **재실행이면** 말미에 「변경 이력」·「결번 색인」 두 섹션을 필수로 싣는다.
```

- [ ] **Step 4: 검증**

```bash
grep -n "헤더 메타 블록\|Delta 탐지\|GAP-ID 항구성\|재실행이면.*변경 이력.*결번 색인" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: 4행 이상 매치(step 5 안 회차 처리 4항목 + GAP 불릿 재실행 명시).

---

## Task 6: `SKILL.md` step 6 — 체크 범위 `C1~C5` → `C1~C7` 정정

step 6 line 38은 `C1~C5`로 표기돼 있으나 verification.md는 이미 C6까지 있고 Task 7에서 C7을 추가한다. 동시에 정정.

**Files:**
- Modify: `.claude/skills/prd-quality-guard/SKILL.md:38`

- [ ] **Step 1: 대상 확인**

```bash
grep -n "체크 C1~C5 정의는" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: 1행 매치(line 38).

- [ ] **Step 2: Edit 적용**

old_string:
```
구조 정합성만** 본다(체크 C1~C5 정의는 `references/verification.md`)
```

new_string:
```
구조 정합성만** 본다(체크 C1~C7 정의는 `references/verification.md`)
```

- [ ] **Step 3: 검증**

```bash
grep -n "C1~C7 정의는\|C1~C5 정의는" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: `C1~C7` 1행, `C1~C5` 0행.

- [ ] **Step 4: Edit 적용 — 참조 섹션(line 43)의 C1~C5도 정정**

old_string:
```
- `references/verification.md` — 독립 구조검증 subAgent 프롬프트 + C1~C5 체크 정의
```

new_string:
```
- `references/verification.md` — 독립 구조검증 subAgent 프롬프트 + C1~C7 체크 정의
```

- [ ] **Step 5: 최종 검증**

```bash
grep -c "C1~C5" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
grep -c "C1~C7" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: `C1~C5` → `0`, `C1~C7` → `2`(line 38·43).

---

## Task 7: `verification.md` — C5 정정 + C7 신설 + 체크 개수 + 출력 블록

**Files:**
- Modify: `.claude/skills/prd-quality-guard/references/verification.md`

### 7-A. 체크 개수 (line 19)

- [ ] **Step 1: Edit 적용**

old_string:
```
다음 6개 체크를 수행하라:
```

new_string:
```
다음 7개 체크를 수행하라(C7은 재실행 산출물에만 적용 — 1회차면 N/A):
```

### 7-B. C5 정정 (결번 색인과 정합)

- [ ] **Step 2: 대상 확인**

```bash
grep -n "GAP-ID는 중복·결번 없이 연속이어야 하고" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/verification.md"
```

Expected: 1행 매치(line 34 본문 내).

- [ ] **Step 3: Edit 적용 — C5 본문 교체**

old_string:
```
ID 형식: TC-ID = `요소코드-T연번`(예: `US01-T01`), GAP-ID = `GAP-연번`(예: `GAP-01`, 문서 전역). GAP-ID는 중복·결번 없이 연속이어야 하고, TC-ID는 같은 요소코드 안에서 중복 없이 연속이면 충분하다(요소 간 전역 연속성은 요구하지 않음). TC↔GAP 상호참조(`→ GAP-xx`, 관련TC 열 등)가 실제 존재하는 ID를 가리켜야 한다. 중복·결번·dangling 참조가 있으면 FAIL. 증거: 문제 ID·참조 목록.
```

new_string:
```
ID 형식: TC-ID = `요소코드-T연번`(예: `US01-T01`), GAP-ID = `GAP-연번`(예: `GAP-01`, 문서 전역). GAP-ID는 **중복**이 없어야 한다. **결번 처리**: GAP 파일에 「결번 색인」 섹션이 없으면(1회차) 결번도 없어야 한다(결번 = FAIL). 「결번 색인」 섹션이 있으면(재실행) 메인 표의 결번 ID가 모두 색인에 stub으로 설명돼 있어야 하고, 설명 없는 결번은 FAIL. TC-ID는 같은 요소코드 안에서 중복 없이 연속이면 충분하다(요소 간 전역 연속성은 요구하지 않음). TC↔GAP 상호참조(`→ GAP-xx`, 관련TC 열 등)가 실제 존재하는 ID(메인 표 또는 결번 색인)를 가리켜야 한다. 중복·미설명 결번·dangling 참조가 있으면 FAIL. 증거: 문제 ID·참조 목록.
```

### 7-C. C7 신설 (C6 뒤, 출력 형식 앞)

- [ ] **Step 4: 삽입 지점 확인**

```bash
grep -n "출력은 정확히 이 형식으로:" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/verification.md"
```

Expected: 1행 매치(현재 line 39).

- [ ] **Step 5: Edit 적용 — C6 블록과 "출력은 …" 사이에 C7 삽입**

old_string:
```
출력은 정확히 이 형식으로:
```

new_string:
````
**C7 — 재실행 추적 정합 (재실행 산출물 한정)**
GAP 파일에 「변경 이력」 섹션이 없으면 이 체크는 **N/A(PASS로 집계)** — 1회차 산출물이다. 있으면(재실행) 다음을 모두 확인:
- 두 파일 최상단에 헤더 메타 블록(분석 회차 · pageId · version)이 존재한다.
- 「변경 이력」에 이번 회차 항목(✅해결/🔁재발/🆕신규/➖잔존 분류)이 있다.
- 「변경 이력」의 '✅해결' GAP-ID가 모두 「결번 색인」에 stub으로 존재한다(해결 선언됐는데 색인에 없으면 FAIL).
- 「결번 색인」 stub의 GAP-ID가 메인 표에 다시 나타나지 않는다 — 단 '🔁재발'로 표기된 ID는 예외(원 ID 재사용 허용).
- '🆕신규'로 표기된 GAP-ID가 직전까지 쓰인 최대 ID + 1 이상이다(결번을 메우지 않음).
하나라도 어긋나면 FAIL. 증거: 헤더 유무·변경이력 항목 수·해결↔색인 불일치 ID·메인 재등장 ID·신규 ID 위치.

출력은 정확히 이 형식으로:
````

### 7-D. 출력 블록에 C7 줄 추가 (line 47 뒤)

- [ ] **Step 6: Edit 적용**

old_string:
```
- C6 DT매트릭스·❓⚠️연결: PASS/FAIL — <증거>
```

new_string:
```
- C6 DT매트릭스·❓⚠️연결: PASS/FAIL — <증거>
- C7 재실행추적: PASS/FAIL/N/A — <증거>
```

- [ ] **Step 7: "하나라도 FAIL이면" 규칙이 N/A를 FAIL로 오해하지 않게 점검**

```bash
grep -n "하나라도 FAIL이면 전체 verdict는 FAIL" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/verification.md"
```

Expected: line 13에 1행. C7 본문이 "N/A(PASS로 집계)"라 명시했으므로 추가 수정 불필요(N/A는 FAIL 아님). 확인만 하고 넘어간다.

- [ ] **Step 8: 종합 검증**

```bash
grep -n "다음 7개 체크\|C7 — 재실행 추적\|C7 재실행추적: PASS/FAIL/N/A\|미설명 결번" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/references/verification.md"
```

Expected: 4행 매치(체크 개수 1 + C7 정의 헤더 1 + 출력 블록 C7 1 + C5 정정 토큰 1).

---

## Task 8: `_template/CLAUDE.md` — 재실행 안내 한 줄

**Files:**
- Modify: `_template/CLAUDE.md` (「사용자 할 일」 ④ 실행 블록, 현재 line 18~20)

- [ ] **Step 1: 대상 확인**

```bash
grep -n "산출물 2파일이 자동 생성됨: \`doc/TC-" "/Users/sfn/workspace/PRD Quality Guard/_template/CLAUDE.md"
```

Expected: 1행 매치(line 20).

- [ ] **Step 2: Edit 적용 — ④ 실행 마지막 줄 뒤에 재실행 안내 추가**

old_string:
```
> · 산출물 2파일이 자동 생성됨: `doc/TC-<PRD명>.md` + `doc/GAP-<PRD명>.md`
```

new_string:
```
> · 산출물 2파일이 자동 생성됨: `doc/TC-<PRD명>.md` + `doc/GAP-<PRD명>.md`
> · **재실행(PRD 수정 후 재분석)**: 같은 폴더에서 같은 명령을 다시 실행하면 이전 산출물은 `doc/_archive/<날짜>/`로 자동 보관되고, 새 GAP 리포트에 「변경 이력」(해결/재발/신규/잔존)이 붙는다.
```

- [ ] **Step 3: 검증**

```bash
grep -n "재실행(PRD 수정 후 재분석)" "/Users/sfn/workspace/PRD Quality Guard/_template/CLAUDE.md"
```

Expected: 1행 매치.

---

## Task 9: 루트 `CLAUDE.md` 「현황」 기록 + ⏭ 옵션 갱신

**Files:**
- Modify: `CLAUDE.md` (루트, line 35 = 현재 `- ⏭ 미착수 옵션:` 줄)

- [ ] **Step 1: 대상 확인**

```bash
grep -n "⏭ 미착수 옵션" "/Users/sfn/workspace/PRD Quality Guard/CLAUDE.md"
```

Expected: 1행 매치(line 35).

- [ ] **Step 2: Edit 적용 — ⏭ 줄 앞에 ✅ 신규 항목 삽입 + ⏭ 줄에서 "TC 확장" 제거·A~F 후속 명시**

old_string:
```
- ⏭ 미착수 옵션: High 6건 PM 1페이지 요약 / Confluence 발행 / TC 확장 / (옵션) 차별화리뷰Pro 인스턴스 CLAUDE.md를 URL 형식으로 마이그레이션 / 자동 스캐폴딩(URL+폴더명만 받아 인스턴스 폴더 자동 생성).
```

new_string:
```
- ✅ **회차/버전 관리 + TC 양산 방지 (2026-05-29)** — 재실행 추적 도입. PRD 수정→재분석 시 이전 산출물 `doc/_archive/<날짜>/` 자동 보관 + GAP 파일 「변경 이력」(해결/재발/신규/잔존)·「결번 색인」(해결 GAP stub) 내장, GAP-ID 회차간 항구(재발=원ID 재사용·신규=max+1), 산출물 헤더에 pageId·version·lastModified 캡처(step2.5 회차 판별 신설). **TC 양산 방지 규칙**(클래스당 대표1·경계분리·페어와이즈 압축·커버리지 매핑+병합) techniques.md 단일원본 신설. **비목표 못박음**: 우선순위는 스킬 미산정+컬럼 미출력(QA 소유)·갭의 강제 TC화 금지(가짜 기대결과→거짓 PASS/FAIL 방지). 검증 **C5 정정**(결번 색인 정합)+**C7 신설**(재실행 추적). 적용 파일: SKILL.md(step2/2.5/3/5/6) · schemas.md(헤더·변경이력·결번색인 템플릿+병합주석) · techniques.md · verification.md · `_template/CLAUDE.md`. 설계 `docs/superpowers/specs/2026-05-29-prd-quality-guard-rerun-versioning-design.md` / 계획 `docs/superpowers/plans/2026-05-29-prd-quality-guard-rerun-versioning.md`.
- ⏭ 미착수 옵션: High 6건 PM 1페이지 요약 / Confluence 발행 / **스키마 표현 개선 A~F(별도 spec — 채택 게이트: 갭발견·QA실행 기여 여부)** / (옵션) 차별화리뷰Pro 인스턴스 CLAUDE.md를 URL 형식으로 마이그레이션 / 자동 스캐폴딩(URL+폴더명만 받아 인스턴스 폴더 자동 생성).
```

- [ ] **Step 3: 검증**

```bash
grep -n "회차/버전 관리 + TC 양산 방지 (2026-05-29)\|스키마 표현 개선 A~F(별도 spec" "/Users/sfn/workspace/PRD Quality Guard/CLAUDE.md"
grep -c "TC 확장 /" "/Users/sfn/workspace/PRD Quality Guard/CLAUDE.md"
```

Expected: 첫 grep 2행 매치. 두번째 grep `0`(⏭ 줄에서 "TC 확장" 제거됨 — 다른 줄에 잔존하면 확인).

---

## Task 10: 구조 grep 검증 (전 파일 정합)

**Files:**
- (검증 전용 — 파일 변경 없음)

- [ ] **Step 1: 회차/버전 키워드가 4개 참조 파일에 모두 들어갔는지**

```bash
cd "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard" && \
  echo "--- SKILL.md ---"      && grep -c "2.5 회차 판별\|TC 양산 방지\|비목표(2)\|Delta 탐지\|C1~C7" SKILL.md && \
  echo "--- techniques ---"    && grep -c "TC 양산 방지 규칙\|클래스당 대표 1개" references/techniques.md && \
  echo "--- schemas ---"       && grep -c "회차/버전 템플릿\|산출물 헤더 메타 블록\|변경 이력.*결번 색인\|병합한다(양산 방지" references/schemas.md && \
  echo "--- verification ---"  && grep -c "다음 7개 체크\|C7 — 재실행 추적\|미설명 결번" references/verification.md
```

Expected: SKILL ≥5 · techniques ≥2 · schemas ≥3 · verification ≥3 (모두 0 아님).

- [ ] **Step 2: 옛 `C1~C5` 표기 잔존 0 (활성 파일)**

```bash
cd "/Users/sfn/workspace/PRD Quality Guard" && \
  grep -rn "C1~C5" --include="*.md" .claude _template CLAUDE.md 2>/dev/null
```

Expected: **0행**. (docs/superpowers/ 히스토리·플러그인 캐시는 검색 대상 아님 — 활성 스킬 파일만.)

- [ ] **Step 3: techniques.md 단일원본 ↔ SKILL/schemas 참조 정합**

```bash
cd "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard" && \
  grep -rn "TC 양산 방지 규칙" SKILL.md references/schemas.md references/techniques.md
```

Expected: 3파일 모두 매치 — techniques.md = 정의(섹션 헤더), SKILL.md·schemas.md = 참조. 정의가 한 곳(techniques.md)에만 `##` 헤더로 존재.

---

## Task 11: 검증 subAgent 결함주입 테스트 (C5·C7 실증)

기존 인스턴스(`차별화리뷰Pro-추천인코드/`, 1회차)를 베이스로 **재실행 산출물 픽스처**를 합성해 C5·C7이 결함을 정확히 잡는지 검증한다. 스펙 §9 #4 대응.

**Files:**
- 임시: `_rerun-fixture/` (테스트 후 삭제)

- [ ] **Step 1: 기존 인스턴스 산출물 경로 확인**

```bash
ls -1 "/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/"
```

Expected: `TC-*.md` · `GAP-*.md` 두 파일(정확한 PRD명 포함). 이 파일명을 이하 `<TC파일>`·`<GAP파일>`로 사용.

- [ ] **Step 2: 픽스처 폴더에 복사**

```bash
mkdir -p "/Users/sfn/workspace/PRD Quality Guard/_rerun-fixture"
cp "/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/"TC-*.md \
   "/Users/sfn/workspace/PRD Quality Guard/_rerun-fixture/TC-fixture.md"
cp "/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/"GAP-*.md \
   "/Users/sfn/workspace/PRD Quality Guard/_rerun-fixture/GAP-fixture.md"
```

Expected: 두 cp 무출력 성공. `ls _rerun-fixture/` → 2파일.

- [ ] **Step 3: GAP 픽스처에 결함 있는 재실행 섹션 주입**

`_rerun-fixture/GAP-fixture.md` **맨 끝**에 아래를 그대로 추가(Edit/append). 의도적 결함 2개: (D1) 변경이력에 `✅해결: GAP-02`라 해놓고 「결번 색인」에는 GAP-02 stub이 **없음** → C7 FAIL. (D2) 메인 표에서 GAP-02가 제거돼 결번이 생겼는데 색인 설명 없음 → C5 FAIL.

```markdown

## 변경 이력
### 2회차 (2026-05-29, pageId 999 v1→v2)
- ✅ 해결: GAP-02 (가입 시 추천코드 적용 결정) — 결번 색인으로 이동
- ➖ 잔존: GAP-11, GAP-16

## 결번 색인 (해결/철회된 GAP)
- (의도적 결함: GAP-02 stub 누락)
```

또한 GAP 픽스처 **맨 위**에 헤더 메타 블록을 추가(C7의 헤더 존재 체크 충족용 — 단 위 D1/D2는 그대로 결함):

```markdown
> **분석 회차**: 2회차 (2026-05-29)
> **대상 PRD**: pageId 999 · version v2 · lastModified 2026-05-29
> **이전 회차**: 1회차 (2026-05-27, pageId 999 v1) → `doc/_archive/2026-05-27/`
```

그리고 메인 갭 표에서 **GAP-02 행을 삭제**한다(해결됐다는 변경이력과 정합 + 결번 생성). TC 픽스처의 GAP-02 참조(`→ GAP-02`)는 dangling이 되지 않도록, 이 테스트에선 **GAP 파일만** 검증자에 넘기되 C5의 dangling 판정은 TC↔GAP 교차가 필요하므로 — 간소화: TC 픽스처도 같이 넘기고, TC의 `GAP-02` 참조는 C5에서 "결번 색인에도 메인에도 없는 ID 참조"로 잡히는 것까지 기대(중첩 결함 허용).

- [ ] **Step 4: 검증 subAgent 디스패치 (결함 버전)**

Agent 도구로 `references/verification.md`의 "프롬프트 본문"을 사용해 디스패치(subagent_type: general-purpose, model: sonnet). `{{TC_FILE_PATH}}` = `_rerun-fixture/TC-fixture.md` 절대경로, `{{GAP_FILE_PATH}}` = `_rerun-fixture/GAP-fixture.md` 절대경로.

Expected verdict: **FAIL**. 최소한:
- **C7 FAIL** — "변경 이력 '✅해결: GAP-02'인데 결번 색인에 GAP-02 stub 없음" 지목.
- **C5 FAIL** — "GAP-02 결번이 색인에 설명 없음(미설명 결번)" 또는 "TC의 GAP-02 참조가 dangling" 지목.

검증자가 C7/C5를 FAIL로, 그 사유를 위와 같이 지목하면 **테스트 통과**(결함 탐지 성공).

- [ ] **Step 5: 결함 수정 → 재디스패치로 PASS 확인**

`_rerun-fixture/GAP-fixture.md`의 결번 색인을 고친다:

old_string:
```
## 결번 색인 (해결/철회된 GAP)
- (의도적 결함: GAP-02 stub 누락)
```

new_string:
```
## 결번 색인 (해결/철회된 GAP)
- GAP-02: [해결 2026-05-29 · pageId 999 v2] 가입 시 추천코드 적용 결정 — v2에서 단일 규칙으로 확정
```

그리고 TC 픽스처의 `→ GAP-02` 참조도 결번 색인 ID를 가리키므로 C5상 유효(메인 또는 색인 존재). 재디스패치(Step 4와 동일 경로).

Expected verdict: **C5·C7 모두 PASS**(C7은 헤더·변경이력·해결↔색인 정합·신규 ID 규칙 충족). 다른 체크(C1~C4·C6)는 베이스 인스턴스가 이미 PASS였으므로 영향 없음 — 단 픽스처 편집으로 우발적 FAIL이 나면 그 항목은 픽스처 한정 노이즈로 기록(스킬 변경과 무관).

- [ ] **Step 6: 픽스처 정리**

```bash
rm -rf "/Users/sfn/workspace/PRD Quality Guard/_rerun-fixture"
```

Expected: 무출력 성공. 원본 인스턴스(`차별화리뷰Pro-추천인코드/doc/`)는 **건드리지 않았음**(복사본만 사용).

---

## Task 12: 실 회차 행위 시연 (사용자, 선택 — 스크립트 불가 영역)

스펙 §9의 #1(1회차 회귀)·#2(2회차 풀 시뮬레이션)·#3(version 미변경 분기)·#5(양산방지 실효)는 **스킬을 실제로 실행해야** 확인되는 행위 검증이다. 스킬 실행 = LLM 분석 작업이라 plan에서 스크립트로 못 돌린다(Task 10·11은 구조·검증자 단위까지만 커버). 따라서 이 항목은 실제 PRD 재실행 시연으로 남긴다 — 본 plan의 코드 변경 자체와는 독립.

- [ ] **Step 1 (사용자): 1회차 회귀** — 신규 PRD 폴더에서 스킬 1회 실행 → 산출물에 헤더 메타만 추가됐고 「변경 이력」·「결번 색인」은 없는지(1회차라 N/A) 확인.
- [ ] **Step 2 (사용자): 2회차 시연** — 같은 폴더에서 PRD version 상향 후 재실행 → 이전본 `doc/_archive/<날짜>/` 이동 · 헤더 회차/version 갱신 · delta 4분류 확인 프롬프트 · 「변경 이력」/「결번 색인」 생성 · 해결 GAP이 색인 stub으로 · 신규 GAP이 max+1 ID인지 확인.
- [ ] **Step 3 (사용자): version 미변경 분기** — 같은 version으로 재실행 → "변경 없음, 그래도 진행?" 확인 프롬프트 발동 확인.

이 시연은 본 plan 완료(완료 기준)와 무관하게 후속으로 진행 가능.

---

## 완료 기준

- [ ] `techniques.md`에 「TC 양산 방지 규칙」 섹션(4규칙) 존재 — 단일 원본.
- [ ] `schemas.md`에 헤더 메타 블록·「변경 이력」/「결번 색인」 템플릿 + 커버리지 병합 주석 존재.
- [ ] `SKILL.md`: step 2 version 캡처 · step 2.5 회차 판별 · step 3 양산방지+비목표 2개 · step 5 헤더/delta/아카이브/이력 · step 6·43 `C1~C7`.
- [ ] `verification.md`: 체크 7개 · C5 결번 색인 정합 정정 · C7 재실행 추적 신설 · 출력 블록 C7 줄.
- [ ] `_template/CLAUDE.md` 재실행 안내 한 줄.
- [ ] 루트 `CLAUDE.md` 「현황」 신규 항목 + ⏭에서 "TC 확장" 제거·A~F 후속 명시.
- [ ] 활성 스킬 파일에 `C1~C5` 잔존 0.
- [ ] 검증 subAgent 결함주입 테스트: 결함 버전 → C5·C7 FAIL 정확 지목, 수정 버전 → PASS.
