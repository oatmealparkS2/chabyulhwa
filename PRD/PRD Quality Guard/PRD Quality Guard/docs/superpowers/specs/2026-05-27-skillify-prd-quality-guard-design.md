# 설계 — PRD 품질 가드 스킬화 (프로젝트 스킬 + 서브폴더 워크플로우)

> **개정(2026-05-27):** 최초 설계는 엔진을 **글로벌 스킬**(`~/.claude/skills/`)로 뒀으나, 사용자 결정으로 **프로젝트 로컬 스킬**(`PRD Quality Guard/.claude/skills/prd-quality-guard/`, 이 프로젝트 안에서만 동작)로 변경. 새 PRD = 이 프로젝트 **하위 서브폴더**. 아래 본문의 "글로벌"·"`~/.claude/skills/`" 표현은 모두 "프로젝트 로컬 `.claude/skills/`"로 읽을 것.

- 작성일: 2026-05-27
- 출력 언어: 한국어
- 선행 산출물: `PRD-품질가드_차별화리뷰Pro-추천인코드.md`(방법론 Part 1 + 이 PRD 시연 Part 2/부록), 원 방법론 스펙 `2026-05-27-prd-quality-guard-design.md`

## 1. 목적 & 동기

지금 "재사용 방법론"은 **문서 안(Part 1)** 에 있어 *수동적 재사용*(사람이 읽고 따라 함)에 머문다. 이를 **글로벌 스킬**로 추출해 *능동적 재사용*으로 바꾼다 — 새 PRD를 만나면 Claude가 스킬을 자동 호출해 동일 방법론으로 TC·갭을 도출한다.

사용자가 그린 운영 워크플로우:

1. 기획자가 PRD 작성 완료 → 링크 공유받음
2. **새 PRD마다 폴더 생성** + 그 폴더 `CLAUDE.md`에 PRD 링크를 직접 기입(상단 "할 일"이 무엇을 채울지 안내)
3. 그 폴더 하위에 **TC 산출물 + 갭 리포트** 생성

이 워크플로우가 빈 새 폴더 + 링크만으로 동작하려면 방법론 엔진이 폴더 밖(글로벌)에 있어야 한다 → **글로벌 스킬로 결정**.

## 2. 아키텍처 개요

```
~/.claude/skills/prd-quality-guard/   ← 엔진 (한 번 설치, 모든 폴더에서 자동 호출)
        │  (스킬이 현재 폴더 CLAUDE.md에서 PRD 링크를 읽음)
        ▼
<새 PRD 폴더>/                          ← PRD마다 1개 (분석 인스턴스)
        ├─ CLAUDE.md                    ← 상단 할 일 배너 + PRD 링크 + Category + 실행 프롬프트
        ├─ TC-<PRD명>.md                ← 산출물 ① 테스트 케이스
        └─ GAP-<PRD명>.md               ← 산출물 ② 갭 리포트 (PM 액션 리스트)
```

3개 구성요소: **(A) 글로벌 스킬(엔진)** / **(B) 폴더별 CLAUDE.md(인터페이스)** / **(C) 폴더 하위 산출물 2파일**.

## 3. 구성요소 상세

### 3.1 글로벌 스킬 `~/.claude/skills/prd-quality-guard/`

| 파일 | 역할 |
|---|---|
| `SKILL.md` | 진입점. frontmatter `description`(자동 호출 트리거) + 간결한 절차(아래). 무거운 기준표는 references로 위임. |
| `references/techniques.md` | 7기법 가이드 + 기법↔요소 매핑 규칙 (원 Part 1 §1.2~1.3) |
| `references/schemas.md` | TC 7열 · 갭 8열 · 커버리지 매트릭스 스키마 + 갭분류(모순/누락/모호/경계미정/TBD) + 심각도(High/Med/Low) + Category 통제어휘 *도출법* (원 §1.4~1.7) |
| `assets/CLAUDE.md.template` | 새 PRD 폴더용 CLAUDE.md 템플릿 (§3.2) |

**SKILL.md `description`(안)**: "Use when generating test cases and finding PRD gaps from a PRD (Confluence/markdown) using black-box testing techniques — applies equivalence partitioning, boundary value, decision table, state transition, pairwise, use-case, and error-guessing to derive TCs and records where TC derivation stalls as PRD gaps. Reads the target PRD link from the current folder's CLAUDE.md."

**SKILL.md 절차(요지)**:
1. 현재 폴더 `CLAUDE.md`의 "대상 PRD" 섹션에서 cloudId·pageId 읽기 (없으면 사용자에게 링크 요청)
2. `mcp__atlassian__getConfluencePage`(contentFormat markdown)로 각 페이지 라이브 페치
3. 요소 추출(US/AC·화면상태·정책·계산로직·비기능) → `references/techniques.md` 매핑으로 기법 선택 → `references/schemas.md` TC 표를 빈칸 없이 채우려 시도 → 막히는 칸을 갭으로 기록
4. **Category 통제어휘**: `references/schemas.md` 도출법으로 5~10개 제안 → 사용자 확정 → 폴더 CLAUDE.md에 기록
5. 폴더 하위에 산출물 2파일 생성(§3.3) + 자체검증(§7)

references는 **2개로 분리**(techniques / schemas) — 확정.

### 3.2 폴더별 `CLAUDE.md` (= `assets/CLAUDE.md.template`)

상단 **할 일 배너는 렌더링되는 `>` 블록**(미리보기에서도 보임) — 확정. 채울 자리는 `<...>` 플레이스홀더.

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

### 3.3 산출물 — **파일 2개** (확정)

- `TC-<PRD명>.md`: 커버리지 매트릭스(요소군×7기법) + 요소별 TC 표(7열). 갭 리포트 파일을 상호 참조.
- `GAP-<PRD명>.md`: 종합 갭 리포트(8열, 심각도순) = PM 단독 액션 리스트.
- 두 파일은 서로 링크(TC↔GAP의 관련TC/관련GAP 열로 추적성 유지).

## 4. 데이터 흐름 / 스킬↔폴더 계약

```
사용자: 폴더 CLAUDE.md의 ①②를 채움
   → "prd-quality-guard 스킬로 …" 입력
스킬: CLAUDE.md "대상 PRD" 섹션 파싱 → MCP 페치 → 요소추출·기법매핑·TC도출·갭기록
   → Category 제안(사용자 확정) → TC/GAP 2파일 작성 → 자체검증 리포트
```

**계약(불변)**: 스킬은 *현재 작업 폴더의 `CLAUDE.md` "대상 PRD" 섹션*에서 PRD 좌표를 읽는다. 이 한 줄 규약이 폴더↔엔진을 느슨하게 연결한다(폴더는 엔진 내부를 몰라도 되고, 엔진은 어느 폴더든 동일 규약으로 동작).

## 5. 현재 폴더 마이그레이션

이 `PRD Quality Guard` 폴더 = **스킬 개발 본거지 + 첫 시연 인스턴스**. 처리:

- 기존 `PRD-품질가드_차별화리뷰Pro-추천인코드.md`의 **Part 1(방법론)** → 스킬(`SKILL.md`/`references/`)로 추출(이전). 값이 아닌 *도출법*만.
- **Part 2(TC) → `TC-차별화리뷰Pro-추천인코드.md`**, **부록(갭 리포트) → `GAP-차별화리뷰Pro-추천인코드.md`** 로 분할. 내용·Confluence 링크·4단계 갭 설명은 **그대로 보존**(재작성 아님, 분할·정리만).
- **이 폴더 `CLAUDE.md`** → 템플릿 형태로 슬림화(상단 할 일 배너 + 이 PRD 링크 + 이미 도출된 Category 8값 + 실행 프롬프트). 기존의 방법론 설명·진행상태 장문은 제거(방법론은 스킬로, 상태는 짧게).
- 기존 통합 문서는 분할로 대체하되 **삭제하지 않고 `_archive/`로 이동**(비파괴적 — 사용자가 직접 커밋/정리 예정인 점 고려).

## 6. 확정된 결정사항

- 엔진 = **글로벌 스킬** `~/.claude/skills/prd-quality-guard/`
- 폴더 인터페이스 = **폴더별 `CLAUDE.md`**, 스킬이 "대상 PRD" 섹션을 읽음
- 할 일 안내 = **렌더링되는 `>` 블록**(상단)
- 산출물 = **파일 2개**(`TC-*.md` / `GAP-*.md`)
- references = **2개 분리**(techniques / schemas)
- Category 8값은 PRD 전용 → 스킬은 *도출법*만 보유, 값은 폴더에서 인스턴스화

## 7. 자체검증 / 테스트

스킬이 "동작한다"의 기준:
1. **트리거**: 새 폴더에서 실행 프롬프트 입력 시 스킬이 자동/명시 호출됨.
2. **계약**: 폴더 CLAUDE.md의 PRD 링크만으로 MCP 페치 성공.
3. **재현**: 이 PRD에 스킬을 돌린 결과가 기존 산출물(42 TC / 24 갭)과 동급 커버리지(요소군×7기법 0누락, 갭 4필드 충족, 기법별 ≥1) 달성.
4. **분리**: Category 값이 폴더에서 새로 도출되고 스킬에는 하드코딩 안 됨.

## 8. 범위 밖 (YAGNI)

- 폴더 자동 스캐폴딩 CLI/명령 — 사용자가 수동 폴더 생성(2단계)이라 명시. 템플릿 파일 제공으로 충분.
- Confluence 자동 발행(`createConfluencePage`) — 별도 옵션, 이 설계 범위 밖.
- 비-Confluence(노션 등) PRD 소스 — 현재 Atlassian MCP만. 확장은 추후.
