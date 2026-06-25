# SFN PRD 작성 스킬 (prd-guide)

차별화상회(SFN) 플랫폼팀 표준 PRD를 AI 툴에서 작성하도록 돕는 Agent Skill이다.
Agent Skills 오픈 표준(SKILL.md)을 따르므로 여러 AI 툴에 동일한 폴더로 설치할 수 있다.

## 구성
```
prd-guide/
├── SKILL.md                  핵심 가이드 (유형판별·작성순서·금지규칙·자동화 연계맵)
├── references/               6종 문서 상세 템플릿 (필요 시 로드)
│   ├── 00-top-prd.md
│   ├── 01-1-userstory.md
│   ├── 01-2-policy.md
│   ├── 02-customer-screen.md
│   ├── 03-bo.md
│   └── 04-techspec.md
└── assets/                   과제 유형별 프로세스 플로우(HTML) — 원본 파일을 넣는다
    └── README.md
```

## 설치 방법 (툴별)

SKILL.md를 지원하는 툴은 이 폴더를 그대로 복사하면 된다.

| 툴 | 설치 |
| --- | --- |
| Claude.ai (웹/앱) | 설정 → 커스텀 스킬에서 이 폴더(zip) 업로드 |
| Claude Code | `prd-guide/` 폴더를 `.claude/skills/`(프로젝트) 또는 `~/.claude/skills/`(전역)에 복사 |
| Cursor · Codex CLI · Gemini CLI · Windsurf | 각 에이전트의 스킬 디렉터리에 `prd-guide/` 폴더 복사 |
| ChatGPT (Custom GPT / Projects) | `SKILL.md` 본문을 instructions에 붙여넣고, `references/`의 파일을 knowledge로 첨부. frontmatter의 description이 "언제 쓸지"에 해당 |
| Gemini Gem | 동일하게 본문을 Gem 지침으로, 템플릿을 첨부 파일로 |

## 사용
PRD/기획서/유저스토리/정책/화면설계/TechSpec 작성 요청 시 자동으로 트리거된다.
작성 전 과제 유형(A/B/C)을 먼저 판별하고, 의존성 순서(최상위 → 유저스토리 → 정책 → 화면 → TechSpec)로 작성한다.

## 주의
스킬에 스크립트를 추가할 경우 API 키·비밀번호 등 민감정보를 하드코딩하지 않는다.
받은 스킬은 활성화 전에 내용을 검토한다.
