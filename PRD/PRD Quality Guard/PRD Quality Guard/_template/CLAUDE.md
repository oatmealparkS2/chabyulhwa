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
> · **재실행(PRD 수정 후 재분석)**: 같은 폴더에서 같은 명령을 다시 실행하면 이전 산출물은 `doc/_archive/<날짜>/`로 자동 보관되고, 새 GAP 리포트에 「변경 이력」(해결/재발/신규/잔존)이 붙는다.

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
