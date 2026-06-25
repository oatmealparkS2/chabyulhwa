# PRD 품질가드 자체검증 subAgent 독립화 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** prd-quality-guard 스킬의 step6 자체검증을, 생성 세션이 직접 점검하던 방식에서 격리된 fresh-context subAgent가 두 산출물의 구조 정합성(C1~C5)만 독립 판정하도록 바꾼다.

**Architecture:** 새 reference 파일 `references/verification.md`에 자기완결형 검증 프롬프트(C1~C5 + 증거 규칙 + 출력 형식)를 둔다. SKILL.md step6은 "두 파일 절대경로를 프롬프트에 치환해 Agent 도구로 검증 subAgent(general-purpose, sonnet) 디스패치 → verdict를 가공 없이 사용자에게 전달, 자동 수정 없음"으로 재작성한다. 검증은 PRD 재페치 없이 두 파일만 본다.

**Tech Stack:** Claude Code 스킬(markdown), Agent 도구(subagent_type=general-purpose), 셸(파일 복사·결함 주입). 자동화 테스트 러너 없음 — "테스트"는 실제 Agent 디스패치로 clean=PASS / broken=FAIL을 관찰하는 것.

**git 주의:** 이 프로젝트 규칙(CLAUDE.md "모든 커밋은 사용자가 직접") + 현재 git 저장소 아님 → **계획에 git commit 단계 없음**. 모든 변경은 디스크에 저장만 하고 커밋은 사용자가 직접 한다.

**참조 스펙:** `docs/superpowers/specs/2026-05-27-prd-quality-guard-subagent-verification-design.md`

---

## File Structure

| 파일 | 책임 | 작업 |
|---|---|---|
| `.claude/skills/prd-quality-guard/references/verification.md` | 검증 subAgent에 그대로 넘길 자기완결형 프롬프트 (C1~C5 정의·증거 규칙·출력 형식) | **Create** |
| `.claude/skills/prd-quality-guard/SKILL.md` | step6 재작성(디스패치 절차) + 참조 목록에 verification.md 추가 | **Modify** (35-40행, 42-44행) |
| `/tmp/pqg-verify-test/` | 민감도 테스트용 결함 주입 산출물 복사본 (비영속, 테스트 후 삭제) | **Create→Delete** (Task 4) |

검증 기준의 *정의*는 verification.md 한 곳에만 두고, SKILL.md step6은 그것을 참조만 한다(DRY — step6의 기존 5줄 체크리스트는 정의의 중복이므로 제거).

---

## Task 1: 검증 프롬프트 파일 `references/verification.md` 생성

**Files:**
- Create: `.claude/skills/prd-quality-guard/references/verification.md`

- [ ] **Step 1: 파일 작성**

아래 내용을 그대로 작성한다.

````markdown
# 검증 subAgent 프롬프트 (독립 구조검증자)

> SKILL.md step6에서 사용. 생성 세션은 아래 "프롬프트 본문"에서 `{{TC_FILE_PATH}}`·`{{GAP_FILE_PATH}}`를 두 산출물의 절대경로로 치환해 Agent 도구(subagent_type: general-purpose, model: sonnet)로 디스패치한다. subAgent가 반환한 verdict는 가공 없이 사용자에게 전달한다. 이 검증은 PRD 재페치 없이 두 파일의 구조 정합성만 본다.

## 프롬프트 본문 (이 아래 전체를 subAgent에 전달)

너는 PRD 품질가드 산출물의 **독립 구조검증자**다. 생성 근거를 신뢰하지 말고, 아래 두 파일에 **쓰여 있는 것만으로** 판정하라.

규칙:
- 아래 두 파일만 읽어라. **다른 어떤 외부 소스도 참조 금지**(특히 Confluence PRD를 재페치하지 마라). 구조 정합성만 본다.
- 모든 판정에 **증거**(개수·ID·줄 위치)를 붙여라. 추측 금지. 파일에 근거가 없으면 그 체크는 FAIL이다.
- 하나라도 FAIL이면 전체 verdict는 FAIL이다.

입력:
- TC 파일: `{{TC_FILE_PATH}}`
- GAP 파일: `{{GAP_FILE_PATH}}`

다음 5개 체크를 수행하라:

**C1 — 커버리지 누락 0**
TC 파일의 커버리지 매트릭스에서 요소군 행을 모두 나열하라. 셀이 비어있는(TC·갭이 모두 0인) 요소군이 하나라도 있으면 FAIL. 증거: 요소군 행 목록 + 빈 요소군 ID.

**C2 — 모든 갭 4필드 충족**
GAP 파일의 각 갭 행이 위치·분류·심각도·제안 4필드를 모두 채웠는지 확인. 하나라도 빈 칸이 있으면 FAIL. 증거: 결손 GAP-ID와 어느 필드가 비었는지.

**C3 — 7기법 각각 ≥1 TC에서 행사**
7기법(동등분할·경계값·결정테이블·상태전이·페어와이즈·유스케이스·오류추측)이 각각 최소 1개 TC에서 사용됐는지 TC의 기법 열을 스캔. 등장 0인 기법이 있으면 FAIL. 증거: 기법별 등장 TC 수.

**C4 — 상태전이 모델 존재 & ❓ 연결**
상태·라이프사이클 엔티티마다 전이표 + Mermaid 상태도가 둘 다 있는지 확인. 전이표의 모든 `❓` 칸이 GAP-ID와 연결돼 있는지 확인. 모델 누락 또는 GAP 미연결 `❓`가 있으면 FAIL. 증거: 엔티티별 전이표·상태도 유무, GAP 미연결 `❓` 칸 위치.

**C5 — ID 유일·일관 & 상호참조 유효**
TC-ID·GAP-ID가 중복·결번 없이 유일한지, TC↔GAP 상호참조(`→ GAP-xx` 등)가 실제 존재하는 ID를 가리키는지 확인. 중복·결번·dangling 참조가 있으면 FAIL. 증거: 문제 ID·참조 목록.

출력은 정확히 이 형식으로:
```
## 검증 결과: PASS | FAIL
- C1 커버리지: PASS/FAIL — <증거>
- C2 갭 4필드: PASS/FAIL — <증거>
- C3 7기법 행사: PASS/FAIL — <증거>
- C4 ST모델·❓연결: PASS/FAIL — <증거>
- C5 ID·상호참조: PASS/FAIL — <증거>
```
FAIL 항목은 위반 목록을 빠짐없이 나열하라. 파일에 쓰지 말고 이 결과를 텍스트로 반환하라.
````

- [ ] **Step 2: 파일 생성 확인**

Run: `cat ".claude/skills/prd-quality-guard/references/verification.md" | head -5`
Expected: 첫 줄 `# 검증 subAgent 프롬프트 (독립 구조검증자)` 출력.

---

## Task 2: SKILL.md step6 재작성 + 참조 목록 갱신

**Files:**
- Modify: `.claude/skills/prd-quality-guard/SKILL.md` (35-40행 step6, 42-44행 참조)

- [ ] **Step 1: step6 본문 교체**

기존 35-40행:
```markdown
### 6. 자체검증
- 모든 요소군이 커버리지 매트릭스에 1회 이상(커버리지 누락 0)
- 모든 갭이 위치·분류·심각도·제안 4필드 충족
- 7기법 각각 최소 1개 TC에서 행사
- 상태·라이프사이클 엔티티마다 상태전이 모델(전이표+상태도) 존재, 전이표의 모든 `❓` 칸이 GAP과 연결
- TC-ID/GAP-ID 일관성, TC↔GAP 상호참조 유효
```
를 아래로 교체:
```markdown
### 6. 자체검증 (독립 subAgent)
step5 완료 후, 생성 세션은 `references/verification.md`의 "프롬프트 본문"에서 `{{TC_FILE_PATH}}`·`{{GAP_FILE_PATH}}`를 두 산출물의 절대경로로 치환해 **검증 subAgent를 Agent 도구로 디스패치**한다(subagent_type: general-purpose, model: sonnet). 검증자는 PRD를 재페치하지 않고 두 파일의 **구조 정합성만** 본다(체크 C1~C5 정의는 `references/verification.md`). 반환된 verdict를 **가공 없이 사용자에게 전달**한다. FAIL이어도 자동 수정하지 않는다(수정 여부는 사용자 판단).
```

- [ ] **Step 2: 참조 목록에 verification.md 추가**

기존 43-44행 바로 아래(`schemas.md` 줄 다음, `assets/CLAUDE.md.template` 줄 위)에 한 줄 추가:
```markdown
- `references/verification.md` — 독립 구조검증 subAgent 프롬프트 + C1~C5 체크 정의
```

- [ ] **Step 3: 교체 결과 확인**

Run: `grep -n "독립 subAgent\|verification.md\|general-purpose" .claude/skills/prd-quality-guard/SKILL.md`
Expected: step6 헤더(`### 6. 자체검증 (독립 subAgent)`), 디스패치 문장의 `general-purpose`, 참조 목록의 `verification.md` 줄이 모두 출력. 기존 `- 모든 요소군이 커버리지...` 5줄 체크리스트는 사라져 있어야 함(`grep -n "모든 요소군이 커버리지" SKILL.md` → 결과 없음).

---

## Task 3: 무결 케이스 검증 (clean → PASS)

첫 시연 인스턴스(TC 42 / GAP 24)에 검증 subAgent를 실제 디스패치해 PASS가 나오는지 확인한다. 이것이 검증자의 "오탐 없음"을 증명한다.

**Files:** (읽기만)
- `차별화리뷰Pro-추천인코드/doc/TC-차별화리뷰Pro-추천인코드.md`
- `차별화리뷰Pro-추천인코드/doc/GAP-차별화리뷰Pro-추천인코드.md`

- [ ] **Step 1: 검증 subAgent 디스패치**

`references/verification.md`의 "프롬프트 본문"을 읽어, `{{TC_FILE_PATH}}`·`{{GAP_FILE_PATH}}`를 아래 절대경로로 치환한 텍스트를 Agent 도구로 디스패치한다.
- subagent_type: `general-purpose`, model: `sonnet`
- TC: `/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/TC-차별화리뷰Pro-추천인코드.md`
- GAP: `/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/GAP-차별화리뷰Pro-추천인코드.md`

- [ ] **Step 2: verdict 확인**

Expected: `## 검증 결과: PASS`, C1~C5 모두 PASS.
만약 어느 체크가 FAIL이면 — (a) 산출물에 실제 결함이 있거나(그러면 사용자에게 보고, 이 자체가 검증자가 일하는 증거), (b) 검증자 프롬프트의 판정 기준이 산출물 표 형식과 어긋난 것이다. 후자면 Task 1의 verification.md 해당 체크 문구를 산출물 실제 형식에 맞게 조정 후 재디스패치한다. 어느 쪽인지 verdict의 증거(증거에 적힌 ID·위치를 산출물에서 직접 대조)로 판별해 보고한다.

---

## Task 4: 민감도 검증 (broken → FAIL, 위반 정확)

일부러 결함을 주입한 복사본에 검증자를 돌려, 해당 체크를 FAIL로 잡고 위반 항목을 정확히 지목하는지 확인한다.

**Files:**
- Create: `/tmp/pqg-verify-test/TC.md`, `/tmp/pqg-verify-test/GAP.md` (복사본, 결함 주입)
- 테스트 후 Delete

- [ ] **Step 1: 산출물 복사**

Run:
```bash
mkdir -p /tmp/pqg-verify-test && \
cp "/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/TC-차별화리뷰Pro-추천인코드.md" /tmp/pqg-verify-test/TC.md && \
cp "/Users/sfn/workspace/PRD Quality Guard/차별화리뷰Pro-추천인코드/doc/GAP-차별화리뷰Pro-추천인코드.md" /tmp/pqg-verify-test/GAP.md && \
echo "copied"
```
Expected: `copied`.

- [ ] **Step 2: 결함 3건 주입 (각각 다른 체크 대상)**

복사본을 Read로 먼저 읽고, Edit로 아래 3건을 주입한다. 주입한 정확한 대상 ID를 기록해 둔다(Step 4 대조용).

1. **C5용 (dangling 참조):** `/tmp/pqg-verify-test/TC.md`에서 임의의 `GAP-` 상호참조 한 곳의 번호를 존재하지 않는 `GAP-99`로 바꾼다. (예: `→ GAP-17` → `→ GAP-99`)
2. **C2용 (4필드 결손):** `/tmp/pqg-verify-test/GAP.md`에서 첫 번째 갭 데이터 행의 **심각도** 칸 내용을 지워 빈 칸으로 만든다. 어느 GAP-ID인지 기록.
3. **C3용 (기법 누락):** `/tmp/pqg-verify-test/TC.md`에서 `오류추측` 문자열을 전부 다른 기법명으로 치환해 오류추측 등장을 0으로 만든다.

Run(3번 결함만 명령으로 — 1·2번은 Edit 도구 사용):
```bash
sed -i '' 's/오류추측/경계값/g' /tmp/pqg-verify-test/TC.md && \
grep -c "오류추측" /tmp/pqg-verify-test/TC.md
```
Expected: `0` (오류추측 자취 없음).

- [ ] **Step 3: 검증 subAgent 디스패치 (broken 대상)**

Task 3 Step 1과 동일하되 경로만 `/tmp/pqg-verify-test/TC.md`·`/tmp/pqg-verify-test/GAP.md`로 치환해 디스패치.

- [ ] **Step 4: verdict가 결함을 잡는지 확인**

Expected: `## 검증 결과: FAIL`. 그리고:
- C5 FAIL — dangling `→ GAP-99`(Step 2-1에서 바꾼 위치)를 위반으로 지목.
- C2 FAIL — Step 2-2에서 비운 GAP-ID를 심각도 결손으로 지목.
- C3 FAIL — `오류추측` 등장 0으로 지목.
주입한 3건이 모두 잡히면 민감도 통과. 하나라도 놓치면 verification.md의 해당 체크 문구를 강화(판정 기준 구체화) 후 재디스패치.

- [ ] **Step 5: 테스트 산출물 정리**

Run: `rm -rf /tmp/pqg-verify-test && echo "cleaned"`
Expected: `cleaned`.

---

## 완료 보고

- 변경 파일: `references/verification.md`(신규), `SKILL.md`(step6+참조) — 모두 디스크 저장, **커밋은 사용자가 직접**.
- 검증: clean=PASS(Task 3), broken=FAIL+위반 정확(Task 4) 관찰 결과를 사용자에게 보고.
- 후속(범위 밖, 스펙 §7): 독립 재분석 / 자동 수정 루프 / verdict 영속 파일 — 모두 미채택.
