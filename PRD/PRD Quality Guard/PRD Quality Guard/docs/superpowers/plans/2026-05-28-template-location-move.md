# 템플릿 위치 이동 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** PRD 폴더용 CLAUDE.md 템플릿을 숨김 경로(`.claude/skills/prd-quality-guard/assets/CLAUDE.md.template`)에서 루트 `_template/CLAUDE.md`로 옮긴다. 신규 인스턴스 시작 시 사용자가 템플릿을 즉시 발견할 수 있게 한다.

**Architecture:** 루트에 `_template/` 폴더를 신설하고 두 파일을 둔다 — (1) 실제 템플릿 `_template/CLAUDE.md`, (2) 발견성·안전 안내용 `_template/README.md`(복사 대상 아님). 스킬 안 `assets/`는 통째 삭제(이 스킬은 project-local이라 단일 원본). 활성 참조 3곳(SKILL.md·루트 CLAUDE.md·새 템플릿 자기지시)을 새 경로로 갱신. 히스토리·spec/plan은 손대지 않는다.

**Tech Stack:** Markdown 파일 편집 + 셸(파일 이동·삭제·grep). 자동 테스트 러너 없음 — "테스트"는 grep 검증과 시각 점검.

**git 주의:** 프로젝트 규칙(루트 CLAUDE.md "모든 커밋은 사용자가 직접") + 현재 git 저장소 아님 → **이 plan에 git 단계 없음**. 모든 변경은 디스크에만 저장.

**참조 스펙:** `docs/superpowers/specs/2026-05-28-template-location-move-design.md`

---

## File Structure

| 파일 | 책임 | 작업 |
|---|---|---|
| `_template/CLAUDE.md` | 신규 PRD 폴더로 복사할 실제 템플릿. 본문은 기존과 동일하되 자기지시 경로만 새 위치로 갱신. | **Create** (Task 1) |
| `_template/README.md` | `_template/`에 들어왔을 때의 안전 안내. 복사 대상 아님 → 새 PRD 폴더로 따라가지 않음. | **Create** (Task 2) |
| `.claude/skills/prd-quality-guard/SKILL.md` | 참조 섹션(line 44)의 템플릿 경로 갱신. | **Modify** (Task 3) |
| `CLAUDE.md` (루트) | "새 PRD 분석하는 법" step 2(line 12)의 경로 갱신. 「현황」에 한 줄 추가(Task 7). | **Modify** (Task 4 · Task 7) |
| `.claude/skills/prd-quality-guard/assets/CLAUDE.md.template` | 구 원본. 신규 위치로 이동 완료 후 삭제. | **Delete** (Task 5) |
| `.claude/skills/prd-quality-guard/assets/` | 이 파일 외 콘텐츠 없음 → 디렉토리도 함께 제거. | **Delete** (Task 5) |
| `차별화리뷰Pro-추천인코드/CLAUDE.md` | 기존 인스턴스 자기지시(line 5). 실효성 0, 정합성 목적 갱신. | **Modify** (Task 7, 선택) |

---

## Task 1: 새 템플릿 `_template/CLAUDE.md` 생성

**Files:**
- Create: `_template/CLAUDE.md`

- [ ] **Step 1: 새 파일 작성**

기존 `.claude/skills/prd-quality-guard/assets/CLAUDE.md.template`와 본문은 동일하되, 「사용자 할 일」 ①의 **자기지시 경로**만 새 위치로 갱신한다(`스킬 assets/CLAUDE.md.template` → `루트 _template/CLAUDE.md`). 아래 내용을 그대로 작성:

````markdown
> ## ▶ 사용자 할 일 — 아래만 하면 분석 자동 시작
>
> **① 폴더 + CLAUDE.md 준비 (최초 1회)**
> · 루트(`PRD Quality Guard/`) 하위에 짧은 PRD 식별자 폴더 생성. 예: `결제수단연동/`
> · 이 템플릿을 그 폴더의 `CLAUDE.md`로 복사 (루트 `_template/CLAUDE.md`)
>
> **② 본문 빈칸 채우기**
> · 제목 `<PRD 이름>` 교체 (폴더명과 맞춰서 짧게)
> · "대상 PRD" 섹션 — **Confluence URL을 그대로 붙여넣기**:
>   `https://<도메인>.atlassian.net/wiki/spaces/.../pages/<숫자>/...` 형태면 OK
>   PRD가 여러 페이지(L1 개요·L2 정책·L3 화면스펙·L4 Tech Spec 등)로 나뉘면 모두 한 줄씩 추가
>   (cloudId·pageId는 스킬이 URL에서 자동 파싱 — 별도 입력 불필요. 단축 URL `/wiki/x/<코드>`는 브라우저에서 열어 long-form으로 펼친 뒤 붙여넣기)
> · Category 값은 그대로 두기 (스킬이 분석 후 5~10개 제안 → 확정 입력)
>
> **③ 사전 확인**
> · Atlassian MCP 인증 — `/mcp` 명령으로 상태 확인 (미인증 시 스킬이 다시 안내)
>
> **④ 실행**
> · 이 폴더에서 `claude` 실행 후 입력: **"prd-quality-guard 스킬로 이 PRD의 TC·갭 리포트를 만들어줘."**
> · 산출물 2파일이 자동 생성됨: `doc/TC-<PRD명>.md` + `doc/GAP-<PRD명>.md`

# PRD 품질 가드 — <PRD 이름>

블랙박스 7기법으로 이 PRD의 TC를 도출하고 갭을 찾는 분석 폴더.
방법론 엔진 = 프로젝트 스킬 `prd-quality-guard` (상위 `.claude/skills/`). 출력 언어: 한국어.

## 대상 PRD (Confluence URL — 스킬이 URL에서 cloudId·pageId 자동 파싱)
- L2 정책·유저스토리 (TC/갭 1차 소스): <URL 붙여넣기>
- (선택) L1 개요: <URL>
- (선택) L3 화면스펙: <URL>
- (선택) L4 Tech Spec: <URL>

## 이 PRD Category 값
- (스킬이 분석 후 5~10개 제안 → 확정해서 여기 기록)

## 산출물
- 이 폴더 하위 `doc/`: `doc/TC-<PRD명>.md` + `doc/GAP-<PRD명>.md`
````

- [ ] **Step 2: 파일 존재·크기 검증**

```bash
ls -la "/Users/sfn/workspace/PRD Quality Guard/_template/CLAUDE.md"
```

Expected: 파일 존재, 크기 약 2.0KB(기존 템플릿과 유사).

- [ ] **Step 3: 자기지시 줄 확인**

```bash
grep -n "루트 \`_template/CLAUDE.md\`" "/Users/sfn/workspace/PRD Quality Guard/_template/CLAUDE.md"
```

Expected: 정확히 1행 매치, line 5 부근.

---

## Task 2: `_template/README.md` 생성 (안전 안내)

**Files:**
- Create: `_template/README.md`

- [ ] **Step 1: 파일 작성**

````markdown
# `_template/` — 신규 PRD 폴더 시작용 템플릿

## 사용법

1. 루트(`PRD Quality Guard/`) 하위에 PRD 식별자 폴더 생성. 예: `결제수단연동/`
2. **이 폴더 안 `CLAUDE.md` 파일만** 새 PRD 폴더의 `CLAUDE.md`로 복사.
3. 새 PRD 폴더로 이동해 `CLAUDE.md` 빈칸(제목·PRD URL) 채우기.
4. 그 새 폴더에서 `claude` 실행 → `"prd-quality-guard 스킬로 이 PRD의 TC·갭 리포트를 만들어줘."`

## ⚠️ 주의

- **`_template/` 폴더 자체에서 `claude` 실행 금지.** 본문이 플레이스홀더(`<URL 붙여넣기>`)라 분석이 진행되지 않거나 사용자에게 URL을 다시 묻고 정지한다.
- **`README.md`(이 파일)는 복사 대상이 아니다.** `CLAUDE.md`만 복사한다.

## 관련 문서

- 방법론 본거지: 루트 `CLAUDE.md`
- 스킬: `.claude/skills/prd-quality-guard/SKILL.md`
````

- [ ] **Step 2: 파일 존재 확인**

```bash
ls -la "/Users/sfn/workspace/PRD Quality Guard/_template/"
```

Expected: `CLAUDE.md`와 `README.md` 두 파일 표시.

---

## Task 3: `SKILL.md` 참조 갱신 (line 44)

**Files:**
- Modify: `.claude/skills/prd-quality-guard/SKILL.md:44`

- [ ] **Step 1: 변경 전 줄 확인**

```bash
grep -n "assets/CLAUDE.md.template" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: `44:- \`assets/CLAUDE.md.template\` — 새 PRD 폴더용 CLAUDE.md 템플릿`

- [ ] **Step 2: Edit 적용**

old_string:
```
- `assets/CLAUDE.md.template` — 새 PRD 폴더용 CLAUDE.md 템플릿
```

new_string:
```
- 루트 `_template/CLAUDE.md` — 새 PRD 폴더용 CLAUDE.md 템플릿 (스킬 외부, project-local 단일 원본)
```

- [ ] **Step 3: 변경 후 검증**

```bash
grep -n "_template/CLAUDE.md" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
grep -n "assets/CLAUDE.md.template" "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/SKILL.md"
```

Expected: 첫 grep 1행 매치(line 44), 두번째 grep 0행.

---

## Task 4: 루트 `CLAUDE.md` step 2 갱신 (line 12)

**Files:**
- Modify: `CLAUDE.md:12`

- [ ] **Step 1: 변경 전 줄 확인**

```bash
grep -n "assets/CLAUDE.md.template" "/Users/sfn/workspace/PRD Quality Guard/CLAUDE.md"
```

Expected: line 12와 line 25, line 33 — 즉 3행 매치(line 12 = step 2 안내, line 25·33 = 「현황」 히스토리).

- [ ] **Step 2: Edit 적용 — 활성 안내문만(line 12)**

old_string:
```
2. 스킬 `assets/CLAUDE.md.template`를 그 서브폴더의 `CLAUDE.md`로 복사 → 제목 교체 + "대상 PRD" 섹션에 Confluence URL 붙여넣기(스킬이 URL에서 cloudId·pageId 자동 파싱).
```

new_string:
```
2. 루트 `_template/CLAUDE.md`를 그 서브폴더의 `CLAUDE.md`로 복사 → 제목 교체 + "대상 PRD" 섹션에 Confluence URL 붙여넣기(스킬이 URL에서 cloudId·pageId 자동 파싱). (`_template/README.md`는 복사하지 않는다.)
```

- [ ] **Step 3: 변경 후 검증**

```bash
grep -n "assets/CLAUDE.md.template" "/Users/sfn/workspace/PRD Quality Guard/CLAUDE.md"
```

Expected: 2행 매치(line 25, line 33만 — 「현황」 히스토리 의도적 보존).

---

## Task 5: 구 위치 삭제 — `assets/CLAUDE.md.template` + `assets/` 디렉토리

**Files:**
- Delete: `.claude/skills/prd-quality-guard/assets/CLAUDE.md.template`
- Delete: `.claude/skills/prd-quality-guard/assets/` (디렉토리)

- [ ] **Step 1: assets/ 안에 다른 파일 없는지 재확인**

```bash
ls -la "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/assets/"
```

Expected: `CLAUDE.md.template` 하나만 표시(+ `.`·`..`). 다른 파일이 있으면 중단하고 사용자 확인.

- [ ] **Step 2: 파일·디렉토리 삭제**

```bash
rm "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/assets/CLAUDE.md.template"
rmdir "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/assets"
```

Expected: 두 명령 모두 무출력 성공.

- [ ] **Step 3: 삭제 검증**

```bash
ls -la "/Users/sfn/workspace/PRD Quality Guard/.claude/skills/prd-quality-guard/"
```

Expected: `assets/` 디렉토리 없음. `references/`, `SKILL.md`만 표시.

---

## Task 6: 종합 grep 검증 (활성 참조 클린)

**Files:**
- (검증 전용 — 파일 변경 없음)

- [ ] **Step 1: 활성 마크다운에 옛 경로 잔존 0 확인**

```bash
cd "/Users/sfn/workspace/PRD Quality Guard" && \
  grep -rn "assets/CLAUDE.md.template" --include="*.md" . 2>/dev/null | \
  grep -v "^\./\.claude/plugins" | \
  grep -v "^\./docs/superpowers/" | \
  grep -v "^\./CLAUDE.md:25:" | \
  grep -v "^\./CLAUDE.md:33:" | \
  grep -v "^\./차별화리뷰Pro-추천인코드/CLAUDE.md:5:"
```

Expected: **출력 0행**. (제외 대상: superpowers 플러그인 캐시, `docs/superpowers/` 안 spec/plan 히스토리, 루트 CLAUDE.md 「현황」, 기존 인스턴스 자기지시 — Task 7에서 처리.)

- [ ] **Step 2: 새 경로가 활성 3곳에 존재하는지 확인**

```bash
cd "/Users/sfn/workspace/PRD Quality Guard" && \
  grep -rn "_template/CLAUDE.md" --include="*.md" . 2>/dev/null | \
  grep -v "^\./docs/superpowers/" | \
  grep -v "^\./\.claude/plugins"
```

Expected (정확히 3행):
- `./CLAUDE.md:12:...루트 \`_template/CLAUDE.md\`를...`
- `./.claude/skills/prd-quality-guard/SKILL.md:44:- 루트 \`_template/CLAUDE.md\`...`
- `./_template/CLAUDE.md:5:> · 이 템플릿을 그 폴더의 \`CLAUDE.md\`로 복사 (루트 \`_template/CLAUDE.md\`)`

3행보다 많거나 적으면 누락·중복이므로 원인 추적.

- [ ] **Step 3: 새 `_template/` 폴더 구조 확인**

```bash
ls -la "/Users/sfn/workspace/PRD Quality Guard/_template/"
```

Expected: `CLAUDE.md` + `README.md` 2개 파일.

---

## Task 7: 정합성 권장 갱신 (선택 — 단, 같이 수행 권장)

이 두 변경은 실효성 0이지만 문서 일관성 차원에서 함께 적용한다. 빠뜨려도 워크플로엔 영향 없음.

**Files:**
- Modify: `차별화리뷰Pro-추천인코드/CLAUDE.md:5`
- Modify: `CLAUDE.md` (루트, 「현황 (2026-05-28)」 섹션 말미)

- [ ] **Step 1: 기존 인스턴스 자기지시 갱신**

먼저 현재 줄 확인:
```bash
grep -n "assets/CLAUDE.md.template" "/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/CLAUDE.md"
```

Expected: `5:> · 이 템플릿을 그 폴더의 \`CLAUDE.md\`로 복사 (스킬 \`assets/CLAUDE.md.template\`)`

Edit 적용:

old_string:
```
> · 이 템플릿을 그 폴더의 `CLAUDE.md`로 복사 (스킬 `assets/CLAUDE.md.template`)
```

new_string:
```
> · 이 템플릿을 그 폴더의 `CLAUDE.md`로 복사 (루트 `_template/CLAUDE.md`)
```

- [ ] **Step 2: 루트 CLAUDE.md 「현황」에 한 줄 추가**

`## 현황 (2026-05-28)` 섹션의 마지막 `- ✅` 줄(현재는 「템플릿 「사용자 할 일」 구체화 + URL-입력 방식 전환」 항목) **바로 아래**, `- ⏭ 미착수 옵션:` 줄 **바로 위**에 다음을 삽입한다.

먼저 위치 확인:
```bash
grep -n "⏭ 미착수 옵션" "/Users/sfn/workspace/PRD Quality Guard/CLAUDE.md"
```

Expected: line 34 부근 1행 매치.

Edit 적용:

old_string:
```
- ⏭ 미착수 옵션: High 6건 PM 1페이지 요약 / Confluence 발행 / TC 확장 / (옵션) 차별화리뷰Pro 인스턴스 CLAUDE.md를 URL 형식으로 마이그레이션.
```

new_string:
```
- ✅ **템플릿 위치 가시화 (2026-05-28)** — 신규 PRD 시작 시 발견성 개선. `.claude/skills/prd-quality-guard/assets/CLAUDE.md.template` → 루트 `_template/CLAUDE.md`로 이동(+ `_template/README.md` 안전 안내). 스킬 `assets/` 디렉토리 제거 — project-local 스킬이라 단일 원본. SKILL.md·루트 CLAUDE.md step 2·기존 인스턴스 자기지시 갱신. 「현황」 히스토리 보존. 설계 `docs/superpowers/specs/2026-05-28-template-location-move-design.md` / 계획 `docs/superpowers/plans/2026-05-28-template-location-move.md`.
- ⏭ 미착수 옵션: High 6건 PM 1페이지 요약 / Confluence 발행 / TC 확장 / (옵션) 차별화리뷰Pro 인스턴스 CLAUDE.md를 URL 형식으로 마이그레이션 / 자동 스캐폴딩(URL+폴더명만 받아 인스턴스 폴더 자동 생성).
```

- [ ] **Step 3: 최종 grep 재확인**

```bash
cd "/Users/sfn/workspace/PRD Quality Guard" && \
  grep -rn "assets/CLAUDE.md.template" --include="*.md" . 2>/dev/null | \
  grep -v "^\./\.claude/plugins" | \
  grep -v "^\./docs/superpowers/"
```

Expected (정확히 3행, 모두 루트 `CLAUDE.md` 「현황」 안 — 의도적 보존):
- `./CLAUDE.md:25:` — 최초 추출 항목(과거 시점 기록).
- `./CLAUDE.md:33:` — 「템플릿 「사용자 할 일」 구체화」 항목(과거 시점 기록).
- `./CLAUDE.md:34:` — Task 7 Step 2에서 새로 추가한 「템플릿 위치 가시화」 항목(FROM 경로 언급).

`차별화리뷰Pro-추천인코드/CLAUDE.md`는 출력에 없어야 한다(Task 7 Step 1에서 갱신 완료).

---

## Task 8: 시각 점검 (Spec §6 검증 #3 — regression 부재 확인)

스킬 트리거가 새 경로로 정상 작동하는지 시뮬레이션. 실제 PRD를 분석하지는 않고 **스킬이 step 1에서 cwd CLAUDE.md를 읽어들이는 동작**만 확인한다.

**Files:**
- 임시: `_smoke-test/` (테스트 후 삭제)

- [ ] **Step 1: 임시 폴더에 새 템플릿 복사**

```bash
mkdir -p "/Users/sfn/workspace/PRD Quality Guard/_smoke-test"
cp "/Users/sfn/workspace/PRD Quality Guard/_template/CLAUDE.md" \
   "/Users/sfn/workspace/PRD Quality Guard/_smoke-test/CLAUDE.md"
```

Expected: 두 명령 무출력 성공.

- [ ] **Step 2: 복사본 내용이 템플릿과 동일한지 확인**

```bash
diff "/Users/sfn/workspace/PRD Quality Guard/_template/CLAUDE.md" \
     "/Users/sfn/workspace/PRD Quality Guard/_smoke-test/CLAUDE.md"
```

Expected: 출력 0행(차이 없음).

- [ ] **Step 3: 자기지시 줄이 복사본에도 새 경로로 들어가 있는지 확인**

```bash
grep -n "루트 \`_template/CLAUDE.md\`" "/Users/sfn/workspace/PRD Quality Guard/_smoke-test/CLAUDE.md"
```

Expected: 1행 매치(line 5).

- [ ] **Step 4: 임시 폴더 제거**

```bash
rm -rf "/Users/sfn/workspace/PRD Quality Guard/_smoke-test"
```

Expected: 명령 무출력 성공.

- [ ] **Step 5: (선택) 실 스킬 트리거 시연**

사용자가 직접 — 신규 PRD 인스턴스 하나를 끝까지(URL 채워서 분석 실행) 만들고 싶으면 별도 진행. 본 plan 범위 밖이라 plan은 여기서 종료.

---

## 완료 기준

- [ ] `_template/CLAUDE.md` + `_template/README.md` 두 파일 존재.
- [ ] `.claude/skills/prd-quality-guard/assets/` 디렉토리 부재.
- [ ] 활성 마크다운에 `assets/CLAUDE.md.template` 잔존 0(히스토리·spec/plan·플러그인 캐시 제외).
- [ ] `_template/CLAUDE.md` 자체 자기지시(line 5)가 새 경로로 갱신.
- [ ] SKILL.md line 44, 루트 CLAUDE.md line 12 모두 새 경로 참조.
- [ ] (선택) 기존 인스턴스 자기지시 갱신 + 루트 CLAUDE.md 「현황」 신규 항목 추가.
