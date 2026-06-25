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
