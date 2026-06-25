# PRD 품질 가드 스킬화 Implementation Plan

> **개정(2026-05-27):** 이 계획은 스킬을 **글로벌**(`~/.claude/skills/`)에 만들도록 작성·실행됐으나, 실행 후 사용자 결정으로 **프로젝트 로컬**(`PRD Quality Guard/.claude/skills/prd-quality-guard/`)로 이동함. 아래 모든 `~/.claude/skills/` 경로·"글로벌" 표현은 `.claude/skills/`(프로젝트 로컬)로 읽을 것. 새 PRD = 이 프로젝트 하위 서브폴더.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 재사용 방법론(현 산출물 Part 1)을 글로벌 스킬 `prd-quality-guard`로 추출하고, 이 폴더를 새 폴더 워크플로우(폴더별 CLAUDE.md + TC/GAP 2파일)에 맞게 마이그레이션한다.

**Architecture:** 엔진 = 글로벌 스킬 `~/.claude/skills/prd-quality-guard/`(SKILL.md + references 2개 + assets 템플릿). 인터페이스 = 각 PRD 폴더의 `CLAUDE.md`("대상 PRD" 섹션을 스킬이 읽음). 산출물 = 폴더 하위 `TC-*.md` + `GAP-*.md` 2파일. 현재 폴더는 스킬 개발 본거지 + 첫 시연 인스턴스.

**Tech Stack:** Markdown, Claude Code Skills(SKILL.md frontmatter), Atlassian MCP(`mcp__atlassian__getConfluencePage`).

**작성 규율:** Task 1(SKILL.md 작성)은 `superpowers:writing-skills` 규율을 따른다(description은 트리거용, 본문은 간결, 무거운 내용은 references로).

**⚠️ 커밋 정책(프로젝트 관례 — 시스템 기본 override):** 이 프로젝트는 **모든 git 커밋을 사용자가 직접** 한다. 따라서 각 Task의 마지막 단계는 `git commit`이 아니라 **구조 검증(grep/파일 확인)**이다. 절대 자동 커밋하지 말 것.

**소스 좌표(현 산출물 `PRD-품질가드_차별화리뷰Pro-추천인코드.md`, 407줄):**
- §1.2 7기법 가이드 = 68–79 / §1.3 기법↔요소 매핑 = 80–91
- §1.4 갭분류 = 92–103 / §1.5 심각도 = 104–111 / §1.6 빈 템플릿 = 112–131 / §1.7 Category 도출법 = 132–137
- §2.0 커버리지 매트릭스 = 139–155 / §2.1~2.7 = 156–366 / 부록 종합 갭 리포트 = 367–402 / 참조링크 [L1]~[L4] = 403–407

---

## File Structure

**생성 (글로벌 스킬, 프로젝트 폴더 밖):**
- `~/.claude/skills/prd-quality-guard/SKILL.md` — 진입점(트리거 description + 6단계 절차)
- `~/.claude/skills/prd-quality-guard/references/techniques.md` — 7기법 + 매핑 규칙
- `~/.claude/skills/prd-quality-guard/references/schemas.md` — 스키마 + 갭분류/심각도 + Category 도출법
- `~/.claude/skills/prd-quality-guard/assets/CLAUDE.md.template` — 새 폴더용 템플릿

**생성 (현재 폴더, 마이그레이션):**
- `TC-차별화리뷰Pro-추천인코드.md` — §2.0 매트릭스 + 요소별 TC 표
- `GAP-차별화리뷰Pro-추천인코드.md` — 종합 갭 리포트 24건

**수정/이동 (현재 폴더):**
- `CLAUDE.md` — 템플릿형으로 슬림화
- `PRD-품질가드_차별화리뷰Pro-추천인코드.md` → `_archive/`로 이동(비파괴)

---

## Task 1: 글로벌 스킬 SKILL.md

**Files:**
- Create: `~/.claude/skills/prd-quality-guard/SKILL.md`

- [ ] **Step 1: 스킬 디렉터리 생성**

Run:
```bash
mkdir -p ~/.claude/skills/prd-quality-guard/references ~/.claude/skills/prd-quality-guard/assets
```

- [ ] **Step 2: SKILL.md 작성 (아래 전체 내용 그대로)**

````markdown
---
name: prd-quality-guard
description: Use when generating test cases (TCs) and finding PRD gaps from a PRD using black-box testing techniques. Applies equivalence partitioning, boundary value, decision table, state transition, pairwise, use-case, and error-guessing to derive TCs, recording every point where a complete TC cannot be written as a PRD gap (모순/누락/모호/경계미정/TBD). Reads the target PRD link (Confluence pageId/cloudId) from the current folder's CLAUDE.md "대상 PRD" section, then writes a TC file plus a gap-report file into the folder. Korean output.
---

# PRD Quality Guard — 블랙박스 TC 기반 PRD 갭 분석

핵심 원칙: **"완전한 TC를 못 쓰면 = PRD 갭."** 출력 언어: 한국어.

## 절차

### 1. 대상 PRD 좌표 읽기
현재 작업 폴더의 `CLAUDE.md` "대상 PRD" 섹션에서 `cloudId`와 페이지별 `pageId`를 읽는다.
- 섹션이 없거나 플레이스홀더(`<여기>`)가 남아 있으면 사용자에게 PRD 링크를 요청한다.
- URL만 있으면 pageId = URL `.../pages/<숫자>`, cloudId = 사이트 도메인.

### 2. PRD 페치
각 pageId를 `mcp__atlassian__getConfluencePage`(contentFormat: markdown)로 라이브 페치. 원본은 read-only — 수정 도구 사용 금지. MCP 미인증이면 사용자에게 `/mcp` 연결을 안내한다.

### 3. 요소 추출 → 기법 매핑 → TC 도출 → 갭 기록
- 요소 추출: US/AC · 화면상태 · 정책 · 계산로직 · 비기능.
- 기법 매핑: `references/techniques.md`의 기법↔요소 매핑 규칙으로 요소마다 1순위 기법 선택.
- TC 도출: `references/schemas.md`의 TC 7열 표를 **빈칸 없이** 채우려 시도.
- 갭 기록: 한 칸이라도(특히 전제조건·기대결과) 못 채우면 그 지점이 갭. 분류(모순/누락/모호/경계미정/TBD)·심각도(High/Med/Low)로 8열 갭 표에 기록. PRD가 이미 미결로 표기한 항목엔 `[기인지]` 태그.

### 4. Category 통제어휘 도출
`references/schemas.md`의 도출법으로 이 PRD 전용 Category 값 5~10개를 제안 → 사용자 확정 → 폴더 CLAUDE.md "이 PRD Category 값"에 기록. 값은 PRD마다 다름 — 스킬에 하드코딩 금지.

### 5. 산출물 2파일 생성 (폴더 하위)
- `TC-<PRD명>.md`: 커버리지 매트릭스(요소군×7기법, 셀=TC수/갭수) + 요소별 TC 표(7열). 각 갭은 `→ GAP-xx (GAP 파일 참조)`로 연결.
- `GAP-<PRD명>.md`: 종합 갭 리포트(8열, 심각도순) = PM 액션 리스트.

### 6. 자체검증
- 모든 요소군이 커버리지 매트릭스에 1회 이상(커버리지 누락 0)
- 모든 갭이 위치·분류·심각도·제안 4필드 충족
- 7기법 각각 최소 1개 TC에서 행사
- TC-ID/GAP-ID 일관성, TC↔GAP 상호참조 유효

## 참조
- `references/techniques.md` — 7기법 가이드 + 기법↔요소 매핑 규칙
- `references/schemas.md` — TC/갭/매트릭스 스키마 + 갭분류·심각도 기준 + Category 도출법
- `assets/CLAUDE.md.template` — 새 PRD 폴더용 CLAUDE.md 템플릿
````

- [ ] **Step 3: 구조 검증**

Run:
```bash
test -f ~/.claude/skills/prd-quality-guard/SKILL.md && head -3 ~/.claude/skills/prd-quality-guard/SKILL.md | grep -q "name: prd-quality-guard" && grep -q "대상 PRD" ~/.claude/skills/prd-quality-guard/SKILL.md && echo OK
```
Expected: `OK` (파일 존재 + frontmatter name + 계약 문구 포함)

---

## Task 2: references/techniques.md

**Files:**
- Create: `~/.claude/skills/prd-quality-guard/references/techniques.md`
- Source: 산출물 68–91행 (§1.2 + §1.3)

- [ ] **Step 1: 소스 추출**

Run:
```bash
sed -n '68,91p' "/Users/sfn/workspace/PRD Quality Guard/PRD-품질가드_차별화리뷰Pro-추천인코드.md"
```
Expected: §1.2 7기법 가이드 표 + §1.3 기법↔요소 매핑 표 출력.

- [ ] **Step 2: techniques.md 작성**

추출한 내용을 그대로 옮기되 헤더만 조정:
- 파일 맨 위에 `# 7기법 가이드 · 기법↔요소 매핑` 추가
- `### 1.2 7기법 가이드` → `## 7기법 가이드`
- `### 1.3 기법 ↔ 요소 매핑 규칙` → `## 기법 ↔ 요소 매핑 규칙`
- 표 본문(7기법 행, 매핑 행)은 **한 글자도 바꾸지 않는다.**

- [ ] **Step 3: 구조 검증**

Run:
```bash
F=~/.claude/skills/prd-quality-guard/references/techniques.md
grep -q "## 7기법 가이드" $F && grep -q "## 기법 ↔ 요소 매핑 규칙" $F && grep -c "동등분할\|경계값\|결정테이블\|상태전이\|페어와이즈\|유스케이스\|오류추측" $F
```
Expected: 마지막 숫자 ≥ 2 (7기법 명이 가이드 표 + 매핑 표 양쪽에 등장)

---

## Task 3: references/schemas.md

**Files:**
- Create: `~/.claude/skills/prd-quality-guard/references/schemas.md`
- Source: 산출물 92–137행 (§1.4 갭분류 + §1.5 심각도 + §1.6 빈 템플릿 + §1.7 Category 도출법)

- [ ] **Step 1: 소스 추출**

Run:
```bash
sed -n '92,137p' "/Users/sfn/workspace/PRD Quality Guard/PRD-품질가드_차별화리뷰Pro-추천인코드.md"
```
Expected: §1.4~§1.7 (갭분류 표·심각도 표·TC 7열/갭 8열/매트릭스 빈 템플릿·Category 도출법) 출력.

- [ ] **Step 2: schemas.md 작성**

추출 내용을 옮기되 헤더만 조정:
- 파일 맨 위에 `# 스키마 · 갭 분류 · 심각도 · Category 도출법` 추가
- `### 1.4 갭 분류 체계` → `## 갭 분류 체계`
- `### 1.5 심각도 기준` → `## 심각도 기준`
- `### 1.6 빈 템플릿 3종` → `## 빈 템플릿 3종`
- `### 1.7 Category 통제 어휘 도출법` → `## Category 통제 어휘 도출법`
- §1.7 본문 중 "이 PRD 인스턴스(8값): …" 줄은 **삭제**(값은 PRD 전용 — 스킬엔 도출법만). 도출법 문장은 유지.
- 그 외 표/문구는 그대로.

- [ ] **Step 3: 구조 검증**

Run:
```bash
F=~/.claude/skills/prd-quality-guard/references/schemas.md
grep -q "## 갭 분류 체계" $F && grep -q "## 심각도 기준" $F && grep -q "TC-ID | Category" $F && grep -q "GAP-ID | 위치" $F && grep -q "## Category 통제 어휘 도출법" $F && ! grep -q "코드유효성검증 · 코드저장" $F && echo OK
```
Expected: `OK` (4섹션 + TC/갭 스키마 헤더 존재 + 이 PRD 8값은 미포함)

---

## Task 4: assets/CLAUDE.md.template

**Files:**
- Create: `~/.claude/skills/prd-quality-guard/assets/CLAUDE.md.template`

- [ ] **Step 1: 템플릿 작성 (아래 전체 내용 그대로)**

```markdown
> ## ▶ 사용자 할 일 — 아래 3가지만 하면 분석 시작
> ① 맨 윗줄 제목의 `<PRD 이름>` 교체
> ② "대상 PRD" 섹션의 cloudId·pageId·링크를 이 PRD 것으로 교체
> ③ 다 됐으면 이 문장 입력: **"prd-quality-guard 스킬로 이 PRD의 TC·갭 리포트를 만들어줘."**
> ※ Category 값은 비워둬도 됨 — 스킬이 분석 중 제안해줍니다.

# PRD 품질 가드 — <PRD 이름>

블랙박스 7기법으로 이 PRD의 TC를 도출하고 갭을 찾는 분석 폴더.
방법론 엔진 = 글로벌 스킬 `prd-quality-guard`. 출력 언어: 한국어.

## 대상 PRD (Atlassian MCP로 페치)
- cloudId: `<사이트 도메인, 예: smartfoodnet.atlassian.net>`
- L2 정책·유저스토리: pageId `<여기>`  ← TC/갭 1차 소스
- (필요 시) L1 개요 / L3 화면스펙 / L4 Tech Spec: pageId `<여기>`

## 이 PRD Category 값
- (스킬이 분석 후 5~10개 제안 → 확정해서 여기 기록)

## 산출물
- 이 폴더 하위: `TC-<PRD명>.md` + `GAP-<PRD명>.md`
```

- [ ] **Step 2: 구조 검증**

Run:
```bash
F=~/.claude/skills/prd-quality-guard/assets/CLAUDE.md.template
grep -q "^> ## ▶ 사용자 할 일" $F && grep -q "prd-quality-guard 스킬로" $F && grep -q "<PRD 이름>" $F && grep -q "pageId \`<여기>\`" $F && echo OK
```
Expected: `OK` (렌더링 `>` 배너 + 실행 프롬프트 + 플레이스홀더 존재)

---

## Task 5: 현재 폴더 — TC 파일 분리

**Files:**
- Create: `/Users/sfn/workspace/PRD Quality Guard/TC-차별화리뷰Pro-추천인코드.md`
- Source: 산출물 1–9행(제목/원칙 일부) + §2.0(139–155) + §2.1~2.7(156–366) + 참조링크(403–407)

- [ ] **Step 1: 각 §2.x의 GAP-ID 목록 확보 (포인터용)**

Run:
```bash
cd "/Users/sfn/workspace/PRD Quality Guard"
awk 'NR>=156 && NR<=366 && (/^### 2\.[1-7]/ || /^\| GAP-[0-9]/)' PRD-품질가드_차별화리뷰Pro-추천인코드.md | grep -oE "^### 2\.[0-9].*|GAP-[0-9]+"
```
Expected: 섹션 제목과 그 아래 GAP-ID들이 순서대로 출력 → 어느 섹션이 어떤 GAP을 갖는지 매핑.

- [ ] **Step 2: TC 파일 작성**

구성(위→아래):
1. 제목 블록: `# 테스트 케이스 — 차별화리뷰 Pro 추천인코드` + 한 줄 설명 + `> 갭 리포트는 [GAP-차별화리뷰Pro-추천인코드.md](GAP-차별화리뷰Pro-추천인코드.md) 참조.`
2. `## 커버리지 매트릭스` — 산출물 139–155행을 그대로 복사(헤더 `### 2.0 커버리지 매트릭스`만 `## 커버리지 매트릭스`로).
3. §2.1~2.7 각각: `### 2.x …` 제목 + `#### 대표 TC` 표 + `#### 추가 TC 스케치`를 **그대로 복사**. 단 각 섹션의 `#### 발견된 갭` 제목과 그 아래 갭 표는 **삭제하고**, 대신 한 줄로 치환:
   `> **발견된 갭:** GAP-aa, GAP-bb → [GAP 리포트](GAP-차별화리뷰Pro-추천인코드.md)` (aa,bb = Step 1에서 얻은 그 섹션의 GAP-ID들)
4. 맨 아래에 참조링크 정의(403–407행 [L1]~[L4]) 복사 — TC 셀이 `[↗][Lx]`를 쓰므로 필요.

TC 표 본문(7열 셀)은 한 글자도 바꾸지 않는다.

- [ ] **Step 3: 구조 검증**

Run:
```bash
cd "/Users/sfn/workspace/PRD Quality Guard"
F=TC-차별화리뷰Pro-추천인코드.md
echo "TC표행: $(grep -cE '^\| [A-Z].*-T[0-9]' $F)"   # 기대 ~42 (대표 TC 표행; 스케치 형식 따라 변동 — 불일치 시 원본과 대조)
echo "발견된갭 표제거: $(grep -c '#### 발견된 갭' $F)"                      # 기대: 0
echo "GAP포인터: $(grep -c '발견된 갭:\*\* GAP-' $F)"                       # 기대: 7
grep -q "## 커버리지 매트릭스" $F && grep -q "^\[L2\]:" $F && echo "매트릭스+참조링크 OK"
```
Expected: TC행 42, 발견된갭 표제거 0, GAP포인터 7, 매트릭스+참조링크 OK

---

## Task 6: 현재 폴더 — GAP 파일 분리

**Files:**
- Create: `/Users/sfn/workspace/PRD Quality Guard/GAP-차별화리뷰Pro-추천인코드.md`
- Source: 산출물 367–402행(부록 종합 갭 리포트) + 403–407행(참조링크)

- [ ] **Step 1: 소스 추출**

Run:
```bash
sed -n '367,407p' "/Users/sfn/workspace/PRD Quality Guard/PRD-품질가드_차별화리뷰Pro-추천인코드.md"
```
Expected: 부록 종합 갭 리포트(GAP-01~24, 8열, 심각도순) + [L1]~[L4] 참조링크 출력.

- [ ] **Step 2: GAP 파일 작성**

구성:
1. 제목 블록: `# PRD 갭 리포트 — 차별화리뷰 Pro 추천인코드` + `> PM 액션 리스트. 심각도순. 관련 TC는 [TC-차별화리뷰Pro-추천인코드.md](TC-차별화리뷰Pro-추천인코드.md) 참조.`
2. 367–402행의 부록 내용을 그대로 복사(`## 부록. 종합 갭 리포트` 제목은 `## 종합 갭 리포트`로).
3. 403–407행 참조링크 정의 복사.

갭 표 본문(8열 셀)은 한 글자도 바꾸지 않는다.

- [ ] **Step 3: 구조 검증**

Run:
```bash
cd "/Users/sfn/workspace/PRD Quality Guard"
F=GAP-차별화리뷰Pro-추천인코드.md
echo "GAP행: $(grep -cE '^\| GAP-[0-9]' $F)"     # 기대: 24
grep -q "^\[L4\]:" $F && grep -q "TC-차별화리뷰Pro" $F && echo "참조링크+TC링크 OK"
```
Expected: GAP행 24, 참조링크+TC링크 OK

---

## Task 7: 현재 폴더 — CLAUDE.md 슬림화 + 통합문서 아카이브

**Files:**
- Modify: `/Users/sfn/workspace/PRD Quality Guard/CLAUDE.md` (전면 재작성)
- Move: `PRD-품질가드_차별화리뷰Pro-추천인코드.md` → `_archive/`

- [ ] **Step 1: 통합 문서 아카이브 (비파괴 이동)**

Run:
```bash
cd "/Users/sfn/workspace/PRD Quality Guard"
mkdir -p _archive && mv PRD-품질가드_차별화리뷰Pro-추천인코드.md _archive/
```
Expected: 통합 문서가 `_archive/`로 이동(삭제 아님). Task 5·6 작성 완료 후에 실행할 것.

- [ ] **Step 2: CLAUDE.md 재작성 (아래 전체 내용 그대로)**

```markdown
> ## ▶ 이 폴더는 PRD 품질 가드 방법론의 개발 본거지 + 첫 시연 인스턴스
> 방법론 엔진은 글로벌 스킬 `prd-quality-guard`(`~/.claude/skills/prd-quality-guard/`)에 있다.
> 새 PRD를 분석하려면 새 폴더를 만들고 스킬의 `assets/CLAUDE.md.template`를 복사해 채운다.

# PRD 품질 가드 — 차별화리뷰 Pro 추천인코드

블랙박스 7기법으로 PRD의 TC를 도출하며 갭을 찾는 방법론 프로젝트.
핵심 원칙: **"완전한 TC를 못 쓰면 = PRD 갭."** 출력 언어: 한국어.

## 대상 PRD (Atlassian MCP로 페치)
- cloudId: `smartfoodnet.atlassian.net`
- L1 개요: pageId `1931739326`
- L2 정책·유저스토리: pageId `2082799647`  ← TC/갭 1차 소스
- L3-1 가입지면 화면스펙: pageId `2083160088`
- L3-2 BO 화면스펙: pageId `2083454980`
- L4 Tech Spec: pageId `2082897936`

## 이 PRD Category 값 (8)
코드유효성검증 · 코드저장·승계 · 할인적용·계산 · 리워드지급 · 가입화면UI · BO설정 · BO조회 · 비기능

## 산출물
- `TC-차별화리뷰Pro-추천인코드.md` — 커버리지 매트릭스 + TC 42건
- `GAP-차별화리뷰Pro-추천인코드.md` — 종합 갭 리포트 24건
- `_archive/PRD-품질가드_차별화리뷰Pro-추천인코드.md` — 분리 전 통합 문서(보관)

## 방법론·설계 문서
- 스킬: `~/.claude/skills/prd-quality-guard/`
- 설계: `docs/superpowers/specs/2026-05-27-skillify-prd-quality-guard-design.md`
- 계획: `docs/superpowers/plans/2026-05-27-skillify-prd-quality-guard.md`

## git
- 모든 커밋은 사용자가 직접. 원본 Confluence PRD는 read-only 조회만.
```

- [ ] **Step 3: 구조 검증**

Run:
```bash
cd "/Users/sfn/workspace/PRD Quality Guard"
test -f _archive/PRD-품질가드_차별화리뷰Pro-추천인코드.md && echo "아카이브 OK"
grep -q "prd-quality-guard" CLAUDE.md && grep -q "TC-차별화리뷰Pro" CLAUDE.md && grep -q "2082799647" CLAUDE.md && test $(wc -l < CLAUDE.md) -lt 50 && echo "CLAUDE.md 슬림 OK"
```
Expected: `아카이브 OK` + `CLAUDE.md 슬림 OK` (50줄 미만, 엔진·산출물·PRD좌표 포함)

---

## Task 8: 통합 인수 검증

**Files:** (검증 전용 — 새 파일 없음)

- [ ] **Step 1: 전체 파일 존재 + 핵심 불변식 확인**

Run:
```bash
echo "=== 스킬 ===" ; ls ~/.claude/skills/prd-quality-guard ~/.claude/skills/prd-quality-guard/references ~/.claude/skills/prd-quality-guard/assets
echo "=== 폴더 산출물 ===" ; cd "/Users/sfn/workspace/PRD Quality Guard"
echo "TC표행=$(grep -cE '^\| [A-Z].*-T[0-9]' TC-차별화리뷰Pro-추천인코드.md) (기대 ~42, 대표 TC 표행)"
echo "GAP행=$(grep -cE '^\| GAP-[0-9]' GAP-차별화리뷰Pro-추천인코드.md) (기대 24)"
echo "스킬엔 PRD전용 8값 없어야: $(grep -rc '코드유효성검증 · 코드저장' ~/.claude/skills/prd-quality-guard/ | grep -v ':0' | wc -l) (기대 0)"
```
Expected: 스킬 4파일(SKILL.md + references/2 + assets/1) 존재, TC행 42, GAP행 24, 스킬 내 PRD 8값 0.

- [ ] **Step 2: 트리거 검증 (수동 — 다음 세션)**

이 세션에서 새로 만든 스킬은 이미 로드된 스킬 목록에 즉시 안 뜰 수 있으므로 **다음 세션**에서 확인:
1. 임시 새 폴더 생성 → 스킬 `assets/CLAUDE.md.template` 복사 → cloudId/pageId 채움.
2. 그 폴더에서 "prd-quality-guard 스킬로 이 PRD의 TC·갭 리포트를 만들어줘" 입력.
3. 스킬이 호출되어 §1(CLAUDE.md 읽기)→§2(MCP 페치)로 진행하는지 확인.

Expected: 스킬이 호출되고 폴더 CLAUDE.md의 PRD 좌표만으로 페치가 시작됨. (실패 시 SKILL.md `description` 또는 "대상 PRD" 섹션 파싱 문구 조정.)

- [ ] **Step 3: 사용자 보고**

검증 결과를 사용자에게 요약 보고. 커밋은 사용자가 직접 하도록 안내(자동 커밋 금지).

---

## 자체검토 메모 (작성자)

- **스펙 커버리지:** 글로벌 스킬(Task1–4) · 폴더 CLAUDE.md 템플릿(Task4) · 2파일 산출물(Task5–6) · 현 폴더 마이그레이션·아카이브(Task7) · 검증(Task8) — 스펙 §3~§7 전부 태스크 대응.
- **불변식:** Category 8값은 스킬에서 제외(Task3 Step2·Task8), 폴더 CLAUDE.md에만 존재(Task7). TC↔GAP 상호링크(Task5·6).
- **비파괴:** 통합 문서는 삭제 아닌 `_archive/` 이동(Task7). 커밋은 사용자.
