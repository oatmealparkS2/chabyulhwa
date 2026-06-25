# 설계 — PRD 폴더 템플릿을 루트 `_template/`로 이동

- 작성일: 2026-05-28
- 출력 언어: 한국어
- 대상 스킬: `PRD Quality Guard/.claude/skills/prd-quality-guard/` (프로젝트 로컬)
- 선행 설계: `2026-05-27-skillify-prd-quality-guard-design.md` (§3.2 폴더별 CLAUDE.md 템플릿)

## 1. 목적 & 동기

신규 PRD 인스턴스를 시작할 때 사용자는 템플릿 파일을 자기 서브폴더의 `CLAUDE.md`로 복사한다. 현재 템플릿은 `.claude/skills/prd-quality-guard/assets/CLAUDE.md.template`에 있다 — Finder·`ls`에서 모두 숨김인 `.claude/` 아래 깊숙이 박혀 있어 **첫 사용자가 경로를 발견하기 어렵다**.

복사 단계 자체는 유지하되(자동 스캐폴딩은 별도 결정), **경로 가시성만** 손본다.

## 2. 확정된 결정사항 (브레인스토밍 합의)

| 항목 | 결정 |
|---|---|
| 문제 범위 | **경로 가시성만**. 수동 복사 워크플로는 유지. |
| 새 위치 | **루트 `_template/CLAUDE.md`**. `_` 접두사로 PRD 서브폴더와 시각적 구분. 향후 다른 템플릿 확장 여지. |
| 스킬 원본 처리 | **제거** — 루트 `_template/`가 유일 원본. `.claude/skills/.../assets/` 디렉토리 함께 삭제. |
| 단일 원본 근거 | 이 스킬은 project-local(루트 CLAUDE.md에 명시) → 이식성 비목표 → self-containment 부담 없음 → drift 위험 0. |
| 새 위치 안전장치 | `_template/README.md` 분리 — `_template/` 자체에서 `claude` 실행 금지 + 복사 대상은 `CLAUDE.md` 뿐임을 명시. README는 복사 대상이 아니라 잔여물 0. |
| 기존 인스턴스 호환 | `차별화리뷰Pro-추천인코드/` 영향 0(이미 생성된 CLAUDE.md). 자기지시 경로 줄은 정합성 권장으로 갱신. |

## 3. 변경 요약

### 3.1 파일 이동

```
.claude/skills/prd-quality-guard/assets/CLAUDE.md.template
                                                          → _template/CLAUDE.md (프로젝트 루트)
.claude/skills/prd-quality-guard/assets/                  → 삭제 (이 파일이 유일 콘텐츠)
```

### 3.2 활성 참조 갱신 — 3곳

| 파일 | 줄 | 변경 |
|---|---|---|
| `.claude/skills/prd-quality-guard/SKILL.md` | 44 | `` `assets/CLAUDE.md.template` `` → `` 프로젝트 루트 `_template/CLAUDE.md` (스킬 외부) `` |
| 루트 `CLAUDE.md` | 12 | "새 PRD 분석하는 법" step 2 안내문의 경로 토큰 갱신 |
| `_template/CLAUDE.md` | 5 | 「사용자 할 일」①의 자기지시 경로 갱신 |

### 3.3 새 위치 안전장치 — `_template/README.md` 분리 생성

`_template/` 안에 두 파일을 둔다:
- `_template/CLAUDE.md` — 실제 템플릿(사용자가 새 PRD 폴더로 복사하는 파일).
- `_template/README.md` — `_template/` 들어왔을 때 가장 먼저 보이는 안내. 복사 대상이 아니라 새 PRD 폴더로 따라가지 않는다.

`README.md` 본문(요지):
```
⚠️ 이 폴더(`_template/`) 자체에서 `claude` 실행 금지.
복사 대상은 `CLAUDE.md` 한 파일뿐. 새 PRD 식별자 폴더를 만들고 거기로 복사한 뒤,
그 새 폴더에서 `claude` 실행.
```

### 3.4 정합성 권장 — 필수 아님

| 파일 | 줄 | 변경 |
|---|---|---|
| `차별화리뷰Pro-추천인코드/CLAUDE.md` | 5 | 자기지시 경로 갱신(실효성 0, 일관성 목적) |
| 루트 `CLAUDE.md` | "현황" 섹션 말미 | 이번 이동을 한 줄 기록 |

## 4. 비변경 (의도적 보존)

- 루트 `CLAUDE.md` 「현황」 기존 항목 (line 25, 33) — 과거 시점 사실의 기록.
- `docs/superpowers/specs/2026-05-27-skillify-prd-quality-guard-design.md` 안 경로 언급(§3.2, §6) — 작성 당시 결정 기록.
- `docs/superpowers/plans/2026-05-27-skillify-prd-quality-guard.md` 안 경로 언급(Task 4 등) — 작성 당시 작업 기록.
- 검증 subAgent (`references/verification.md`, C1~C6) — 영향 0 (체크는 TC/GAP 두 파일의 구조만 본다).

## 5. 위험·완화

| 위험 | 가능성 | 영향 | 완화 |
|---|---|---|---|
| 사용자가 `_template/` 안에서 직접 `claude` 실행 → 빈 URL 분석 트리거 | 낮음 | 가벼움(분석 진행 안 되고 URL 요청에서 정지) | `_template/README.md`의 ⚠️ 안내 + 기존 SKILL.md step 1 플레이스홀더 방어막(`<URL 붙여넣기>` 잔존 시 분석 멈추고 사용자에게 링크 요청) |
| 사용자가 PRD 서브폴더를 `_template`로 명명 | 매우 낮음 | 충돌 | `_` 접두사가 PRD 식별자 명명 관행과 부자연 — 실 사례 미발생 가정 |

## 6. 검증

이동 적용 후 다음으로 확인한다:

1. **경로 grep**: 활성 마크다운에 `assets/CLAUDE.md.template` 잔존이 0인지(히스토리·spec/plan 제외).
2. **자기지시 일관성**: `_template/CLAUDE.md` line 5의 경로 토큰이 실제 파일 위치와 일치.
3. **신규 PRD 시뮬레이션 (수동)**: 임시 서브폴더 만들어 `_template/CLAUDE.md` 복사 → URL 채움 → 스킬 트리거가 정상 작동하는지 한 번 시연(이번 이동 자체와는 독립이나, regression 부재 확인용).

## 7. 후속 작업 — 본 설계 범위 밖

- **자동 스캐폴딩** (브레인스토밍 단계의 Option C): 사용자가 URL과 폴더명만 주면 스킬이 폴더+CLAUDE.md를 자동 생성. 이번 결정으로 마찰의 일부는 해소되나 mkdir+cp 단계는 여전히 수동 — 향후 별도 결정.
- **`_template/` 안 다른 자산 추가**: 예) `_template/사용자가이드.md` 등 — 필요 시점에 별도 PR.
