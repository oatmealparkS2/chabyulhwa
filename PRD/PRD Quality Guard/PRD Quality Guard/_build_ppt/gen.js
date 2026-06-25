const pptxgen = require("pptxgenjs");
const React = require("react");
const ReactDOMServer = require("react-dom/server");
const sharp = require("sharp");
const Fa = require("react-icons/fa");

// ---------- palette ----------
const C = {
  ink: "0F172A",      // slate-900 (dark bg)
  ink2: "1E293B",     // slate-800
  slate: "334155",    // slate-700
  muted: "64748B",    // slate-500
  line: "E2E8F0",     // slate-200
  paper: "F8FAFC",    // slate-50 (light bg)
  white: "FFFFFF",
  teal: "0D9488",     // method / positive
  tealLt: "5EEAD4",
  tealBg: "CCFBF1",
  rose: "E11D48",     // High / risk
  roseBg: "FFE4E6",
  amber: "D97706",    // Med
  amberBg: "FEF3C7",
};
const HEAD = "Apple SD Gothic Neo";
const BODY = "Apple SD Gothic Neo";
const NUM = "Arial Black";

const W = 13.333, H = 7.5;

// ---------- icon rasterizer ----------
async function icon(IconComponent, color = "#FFFFFF", size = 256) {
  const svg = ReactDOMServer.renderToStaticMarkup(
    React.createElement(IconComponent, { color, size: String(size) })
  );
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  return "image/png;base64," + png.toString("base64");
}
const sh = () => ({ type: "outer", color: "0F172A", blur: 9, offset: 3, angle: 135, opacity: 0.16 });

(async () => {
  const pres = new pptxgen();
  pres.defineLayout({ name: "W", width: W, height: H });
  pres.layout = "W";
  pres.author = "PRD Quality Guard";
  pres.title = "PRD Quality Guard 소개";

  // preload icons
  const I = {
    search:   await icon(Fa.FaSearchPlus, "#FFFFFF"),
    warn:     await icon(Fa.FaExclamationTriangle, "#FFFFFF"),
    check:    await icon(Fa.FaCheckCircle, "#FFFFFF"),
    clip:     await icon(Fa.FaClipboardList, "#FFFFFF"),
    diagram:  await icon(Fa.FaProjectDiagram, "#FFFFFF"),
    table:    await icon(Fa.FaTable, "#FFFFFF"),
    list:     await icon(Fa.FaListOl, "#FFFFFF"),
    shield:   await icon(Fa.FaShieldAlt, "#FFFFFF"),
    flag:     await icon(Fa.FaFlagCheckered, "#FFFFFF"),
    file:     await icon(Fa.FaFileAlt, "#FFFFFF"),
    bug:      await icon(Fa.FaBug, "#FFFFFF"),
    bolt:     await icon(Fa.FaBolt, "#FFFFFF"),
    sync:     await icon(Fa.FaSyncAlt, "#FFFFFF"),
    robot:    await icon(Fa.FaRobot, "#FFFFFF"),
    users:    await icon(Fa.FaUsers, "#FFFFFF"),
  };

  // ---------- helpers ----------
  // header band for content (light) slides
  function contentHeader(slide, kicker, title, iconData, accent = C.teal) {
    slide.background = { color: C.paper };
    // top kicker bar
    slide.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.12, fill: { color: accent } });
    // icon chip
    slide.addShape(pres.shapes.OVAL, { x: 0.6, y: 0.55, w: 0.62, h: 0.62, fill: { color: accent }, shadow: sh() });
    slide.addImage({ data: iconData, x: 0.745, y: 0.695, w: 0.33, h: 0.33 });
    slide.addText(kicker, { x: 1.4, y: 0.5, w: 10, h: 0.3, fontFace: HEAD, fontSize: 12, color: accent, bold: true, charSpacing: 2, margin: 0 });
    slide.addText(title, { x: 1.4, y: 0.74, w: 11.3, h: 0.55, fontFace: HEAD, fontSize: 27, color: C.ink, bold: true, margin: 0 });
  }
  // sev pill
  function pill(slide, x, y, w, label, fill, txt = "FFFFFF") {
    slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.32, fill: { color: fill }, rectRadius: 0.16 });
    slide.addText(label, { x, y, w, h: 0.32, fontFace: HEAD, fontSize: 11, color: txt, bold: true, align: "center", valign: "middle", margin: 0 });
  }

  // ============================================================
  // SLIDE 1 — Title (dark)
  // ============================================================
  let s = pres.addSlide();
  s.background = { color: C.ink };
  // motif: faint concentric circles right
  s.addShape(pres.shapes.OVAL, { x: 9.6, y: -1.8, w: 5.6, h: 5.6, fill: { color: C.ink2 }, line: { color: C.slate, width: 1 } });
  s.addShape(pres.shapes.OVAL, { x: 10.7, y: 3.4, w: 4.2, h: 4.2, fill: { type: "solid", color: C.teal, transparency: 88 } });
  // icon chip
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 1.45, w: 0.95, h: 0.95, fill: { color: C.teal }, shadow: sh() });
  s.addImage({ data: I.shield, x: 1.12, y: 1.67, w: 0.5, h: 0.5 });
  s.addText("METHODOLOGY · QA ENABLEMENT", { x: 0.95, y: 2.62, w: 8, h: 0.3, fontFace: HEAD, fontSize: 13, color: C.tealLt, bold: true, charSpacing: 3, margin: 0 });
  s.addText("PRD Quality Guard", { x: 0.9, y: 2.95, w: 11.5, h: 1.0, fontFace: HEAD, fontSize: 50, color: C.white, bold: true, margin: 0 });
  s.addText("블랙박스 7기법으로 PRD의 갭을 조기에 찾아내는 방법론", { x: 0.95, y: 4.05, w: 11, h: 0.5, fontFace: HEAD, fontSize: 19, color: C.line, margin: 0 });
  // bottom strip
  s.addShape(pres.shapes.LINE, { x: 0.95, y: 5.0, w: 4.0, h: 0, line: { color: C.teal, width: 2 } });
  s.addText([
    { text: "대상  ", options: { color: C.muted, bold: true } },
    { text: "PM · QA", options: { color: C.white, bold: true } },
    { text: "      ·      ", options: { color: C.slate } },
    { text: "시연  ", options: { color: C.muted, bold: true } },
    { text: "차별화리뷰Pro 추천인코드", options: { color: C.white } },
  ], { x: 0.95, y: 5.2, w: 11.5, h: 0.4, fontFace: HEAD, fontSize: 14, margin: 0 });
  s.addText("2026-05-31", { x: 0.95, y: 6.6, w: 4, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.muted, margin: 0 });

  // ============================================================
  // SLIDE 2 — Agenda (목차)
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "AGENDA", "목차", I.list, C.ink2);
  const agenda = [
    ["01", "왜 필요한가", "PRD 갭이 개발·QA 단계에서 터지는 비용", C.rose, I.warn],
    ["02", "방법론 한눈에", "블랙박스 7기법으로 TC 도출 → 갭 역추적", C.teal, I.search],
    ["03", "산출물 2종", "TC 파일(QA) + GAP 리포트(PM)", C.teal, I.file],
    ["04", "갭 시각화 도구", "상태전이 모델 · 결정 매트릭스", C.teal, I.diagram],
    ["05", "시연 결과 — PM 액션 관점", "TC 42 / GAP 24, High 6건 결정 대기", C.rose, I.bug],
    ["06", "품질 보증 장치", "독립 검증 subAgent · 회차/버전 관리", C.ink2, I.shield],
  ];
  let ay = 1.58;
  agenda.forEach(([n, t, d, col, ic]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: ay, w: 12.1, h: 0.78, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: ay, w: 0.09, h: 0.78, fill: { color: col } });
    s.addText(n, { x: 0.85, y: ay, w: 0.9, h: 0.78, fontFace: NUM, fontSize: 24, color: col, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addShape(pres.shapes.OVAL, { x: 1.95, y: ay + 0.19, w: 0.4, h: 0.4, fill: { color: col } });
    s.addImage({ data: ic, x: 2.04, y: ay + 0.28, w: 0.22, h: 0.22 });
    s.addText(t, { x: 2.6, y: ay + 0.08, w: 4.6, h: 0.34, fontFace: HEAD, fontSize: 16, color: C.ink, bold: true, valign: "middle", margin: 0 });
    s.addText(d, { x: 2.6, y: ay + 0.41, w: 9.9, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.muted, valign: "middle", margin: 0 });
    ay += 0.88;
  });

  // ============================================================
  // SLIDE 3 — 왜 필요한가 (problem)
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "01 · WHY", "왜 PRD Quality Guard 인가", I.warn, C.rose);
  // left: pain
  s.addText("PRD의 모순·누락·모호는 보통 개발·QA 단계에서야 드러난다", { x: 0.6, y: 1.75, w: 6.0, h: 0.7, fontFace: HEAD, fontSize: 17, color: C.ink, bold: true, margin: 0 });
  const pains = [
    ["뒤늦은 발견", "스펙 공백이 구현·테스트 중 발견 → 재작업·일정 지연"],
    ["책임 공백", "\"누가 결정해야 하는가\"가 불명확해 핑퐁"],
    ["테스트 불가", "기대결과를 못 정하니 TC도 못 쓴다"],
  ];
  let py = 2.55;
  pains.forEach(([t, d]) => {
    s.addShape(pres.shapes.OVAL, { x: 0.62, y: py + 0.04, w: 0.34, h: 0.34, fill: { color: C.rose } });
    s.addImage({ data: I.warn, x: 0.7, y: py + 0.12, w: 0.18, h: 0.18 });
    s.addText(t, { x: 1.12, y: py - 0.04, w: 5.4, h: 0.32, fontFace: HEAD, fontSize: 14.5, color: C.ink, bold: true, margin: 0 });
    s.addText(d, { x: 1.12, y: py + 0.27, w: 5.4, h: 0.45, fontFace: HEAD, fontSize: 12.5, color: C.muted, margin: 0 });
    py += 0.92;
  });
  // right: core hypothesis callout card (dark)
  s.addShape(pres.shapes.RECTANGLE, { x: 7.15, y: 1.75, w: 5.55, h: 4.55, fill: { color: C.ink }, shadow: sh() });
  s.addShape(pres.shapes.RECTANGLE, { x: 7.15, y: 1.75, w: 5.55, h: 0.1, fill: { color: C.teal } });
  s.addText("핵심 가설", { x: 7.5, y: 2.15, w: 4, h: 0.35, fontFace: HEAD, fontSize: 13, color: C.tealLt, bold: true, charSpacing: 2, margin: 0 });
  s.addText("“완전한 TC를\n못 쓰면\n = PRD 갭”", { x: 7.5, y: 2.55, w: 4.9, h: 2.4, fontFace: HEAD, fontSize: 34, color: C.white, bold: true, lineSpacingMultiple: 1.05, margin: 0 });
  s.addText("테스트 케이스를 끝까지 못 적는 그 지점이 곧 스펙의 공백이다. 갭을 개발 이전에 PM에게 되돌려준다.", { x: 7.5, y: 5.35, w: 4.9, h: 0.85, fontFace: HEAD, fontSize: 13, color: C.line, margin: 0 });

  // ============================================================
  // SLIDE 4 — 방법론 한눈에 (7 techniques)
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "02 · METHOD", "방법론 한눈에 — 블랙박스 7기법", I.search, C.teal);
  s.addText([
    { text: "PRD를 입력하면 7가지 블랙박스 테스트 기법으로 TC를 도출하고, ", options: { color: C.slate } },
    { text: "TC를 끝까지 못 쓴 지점을 갭으로 역추적", options: { color: C.ink, bold: true } },
    { text: "한다.", options: { color: C.slate } },
  ], { x: 0.6, y: 1.62, w: 12.1, h: 0.4, fontFace: HEAD, fontSize: 14, margin: 0 });
  const techs = [
    ["동등분할", "입력을 클래스로 나눠 대표값"],
    ["경계값", "경계·하한·상한의 함정"],
    ["결정테이블", "조건 × 규칙 조합 빠짐"],
    ["상태전이", "상태·이벤트 미정의 전이"],
    ["페어와이즈", "요인 조합 효율 압축"],
    ["유스케이스", "흐름·예외 시나리오"],
    ["오류추측", "경험 기반 엣지/예외"],
  ];
  // 7 cards: 4 top, 3 bottom
  const cw = 2.92, gap = 0.18, startX = 0.6;
  function techCard(x, y, idx, t, d) {
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 1.55, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 0.07, fill: { color: C.teal } });
    s.addText(String(idx).padStart(2, "0"), { x: x + 0.18, y: y + 0.16, w: 1, h: 0.4, fontFace: NUM, fontSize: 17, color: C.tealLt, bold: true, margin: 0 });
    s.addText(t, { x: x + 0.18, y: y + 0.55, w: cw - 0.36, h: 0.4, fontFace: HEAD, fontSize: 16, color: C.ink, bold: true, margin: 0 });
    s.addText(d, { x: x + 0.18, y: y + 0.95, w: cw - 0.36, h: 0.5, fontFace: HEAD, fontSize: 11.5, color: C.muted, margin: 0 });
  }
  const r1y = 2.45, r2y = 4.3;
  for (let i = 0; i < 4; i++) techCard(startX + i * (cw + gap), r1y, i + 1, techs[i][0], techs[i][1]);
  for (let i = 0; i < 3; i++) techCard(startX + i * (cw + gap), r2y, i + 5, techs[i + 4][0], techs[i + 4][1]);
  // 8th slot -> arrow/result card
  const lastX = startX + 3 * (cw + gap);
  s.addShape(pres.shapes.RECTANGLE, { x: lastX, y: r2y, w: cw, h: 1.55, fill: { color: C.ink }, shadow: sh() });
  s.addImage({ data: I.bug, x: lastX + 0.18, y: r2y + 0.18, w: 0.34, h: 0.34 });
  s.addText("도출 불가 지점", { x: lastX + 0.18, y: r2y + 0.6, w: cw - 0.36, h: 0.35, fontFace: HEAD, fontSize: 15, color: C.white, bold: true, margin: 0 });
  s.addText("= PRD 갭으로 기록", { x: lastX + 0.18, y: r2y + 0.95, w: cw - 0.36, h: 0.4, fontFace: HEAD, fontSize: 12, color: C.tealLt, bold: true, margin: 0 });
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 2.0, y: 6.3, w: 9.3, h: 0.62, fill: { color: C.white }, line: { color: C.line, width: 1 }, rectRadius: 0.08, shadow: sh() });
  s.addText([
    { text: "분류  ", options: { color: C.muted, bold: true } },
    { text: "모순 · 누락 · 모호 · 경계미정 · TBD", options: { color: C.ink, bold: true } },
    { text: "      심각도  ", options: { color: C.muted, bold: true } },
    { text: "High · Med · Low", options: { color: C.ink, bold: true } },
  ], { x: 2.0, y: 6.3, w: 9.3, h: 0.62, fontFace: HEAD, fontSize: 12.5, align: "center", valign: "middle", margin: 0 });

  // ============================================================
  // SLIDE 5 — 산출물 2종
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "03 · DELIVERABLES", "산출물 2종 — 받는 사람이 다르다", I.file, C.teal);
  s.addText([
    { text: "입력은 ", options: { color: C.slate } },
    { text: "Confluence URL 하나", options: { color: C.ink, bold: true } },
    { text: ". 출력은 역할별 2개 파일.", options: { color: C.slate } },
  ], { x: 0.6, y: 1.62, w: 12, h: 0.4, fontFace: HEAD, fontSize: 14, margin: 0 });

  function deliverCard(x, accent, accentBg, ic, owner, file, title, bullets) {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.25, w: 5.95, h: 4.05, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.25, w: 5.95, h: 0.1, fill: { color: accent } });
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 2.6, w: 0.7, h: 0.7, fill: { color: accent } });
    s.addImage({ data: ic, x: x + 0.51, y: 2.76, w: 0.38, h: 0.38 });
    pill(s, x + 4.35, 2.72, 1.3, owner, accentBg, accent);
    s.addText(title, { x: x + 0.35, y: 3.45, w: 5.3, h: 0.4, fontFace: HEAD, fontSize: 19, color: C.ink, bold: true, margin: 0 });
    s.addText(file, { x: x + 0.35, y: 3.85, w: 5.3, h: 0.3, fontFace: "Consolas", fontSize: 11.5, color: C.muted, margin: 0 });
    s.addText(bullets.map((b, i) => ({ text: b, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: 6, color: C.slate } })),
      { x: x + 0.4, y: 4.3, w: 5.25, h: 1.85, fontFace: HEAD, fontSize: 13, margin: 0 });
  }
  deliverCard(0.6, C.teal, C.tealBg, I.clip, "QA 소유", "doc/TC-<PRD명>.md", "TC 파일",
    ["7기법별 도출 테스트 케이스", "상태전이 전이표 · 결정 매트릭스 전체 수록", "TC → GAP 교차연결로 추적", "우선순위 컬럼은 QA가 산정(스킬 미관여)"]);
  deliverCard(6.75, C.rose, C.roseBg, I.warn, "PM 소유", "doc/GAP-<PRD명>.md", "GAP 리포트",
    ["갭별 분류 · 심각도 · 위치", "각 갭에 PM 질문/제안 명시", "PM 단독 액션 리스트로 설계", "회차 변경이력 · 결번색인 내장"]);

  // ============================================================
  // SLIDE 6 — 갭 시각화 도구
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "04 · VISUALIZE", "갭을 눈에 보이게 — 시각화 도구", I.diagram, C.teal);
  s.addText("표의 빈칸·충돌 셀이 그대로 갭이 된다. QA는 누락을 신뢰하고, PM은 한눈에 읽는다.", { x: 0.6, y: 1.62, w: 12, h: 0.4, fontFace: HEAD, fontSize: 14, color: C.slate, margin: 0 });

  // left: state transition
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 5.95, h: 4.05, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 2.55, w: 0.55, h: 0.55, fill: { color: C.teal } });
  s.addImage({ data: I.diagram, x: 1.03, y: 2.68, w: 0.29, h: 0.29 });
  s.addText("상태전이 모델", { x: 1.6, y: 2.55, w: 4.5, h: 0.35, fontFace: HEAD, fontSize: 17, color: C.ink, bold: true, margin: 0 });
  s.addText("전이표 + Mermaid 상태도", { x: 1.6, y: 2.9, w: 4.5, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.muted, margin: 0 });
  s.addTable([
    [{ text: "상태 \\ 이벤트", options: { fill: { color: C.ink2 }, color: "FFFFFF", bold: true, fontSize: 11 } },
     { text: "로그인", options: { fill: { color: C.ink2 }, color: "FFFFFF", bold: true, fontSize: 11, align: "center" } },
     { text: "결제", options: { fill: { color: C.ink2 }, color: "FFFFFF", bold: true, fontSize: 11, align: "center" } }],
    [{ text: "코드유효(비로그인)", options: { fontSize: 11, color: C.slate } },
     { text: "❓", options: { fill: { color: C.roseBg }, color: C.rose, bold: true, align: "center" } },
     { text: "이력판정", options: { fontSize: 11, align: "center", color: C.slate } }],
    [{ text: "코드만료", options: { fontSize: 11, color: C.slate } },
     { text: "일반가", options: { fontSize: 11, align: "center", color: C.slate } },
     { text: "일반가", options: { fontSize: 11, align: "center", color: C.slate } }],
  ], { x: 0.9, y: 3.45, w: 5.35, colW: [2.55, 1.4, 1.4], border: { pt: 0.5, color: C.line }, valign: "middle", rowH: 0.56 });
  s.addText([
    { text: "❓", options: { color: C.rose, bold: true } },
    { text: " 셀 = 미정의 전이 = GAP", options: { color: C.ink, bold: true } },
    { text: "\n예: GAP-03 → 비로그인 이력판정 경로 공백", options: { color: C.slate } },
  ], { x: 0.9, y: 5.45, w: 5.4, h: 0.7, fontFace: HEAD, fontSize: 11.5, lineSpacingMultiple: 1.25, margin: 0 });

  // right: decision matrix
  s.addShape(pres.shapes.RECTANGLE, { x: 6.75, y: 2.25, w: 5.95, h: 4.05, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
  s.addShape(pres.shapes.OVAL, { x: 7.05, y: 2.55, w: 0.55, h: 0.55, fill: { color: C.teal } });
  s.addImage({ data: I.table, x: 7.18, y: 2.68, w: 0.29, h: 0.29 });
  s.addText("결정 매트릭스", { x: 7.75, y: 2.55, w: 4.5, h: 0.35, fontFace: HEAD, fontSize: 17, color: C.ink, bold: true, margin: 0 });
  s.addText("조건 × 규칙 표 (+ flowchart)", { x: 7.75, y: 2.9, w: 4.5, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.muted, margin: 0 });
  s.addTable([
    [{ text: "조건 \\ 규칙", options: { fill: { color: C.ink2 }, color: "FFFFFF", bold: true, fontSize: 11 } },
     { text: "R2", options: { fill: { color: C.ink2 }, color: "FFFFFF", bold: true, fontSize: 11, align: "center" } },
     { text: "R3", options: { fill: { color: C.ink2 }, color: "FFFFFF", bold: true, fontSize: 11, align: "center" } }],
    [{ text: "동시 결제 2건", options: { fontSize: 11, color: C.slate } },
     { text: "Y", options: { fontSize: 11, align: "center", color: C.slate } },
     { text: "Y", options: { fontSize: 11, align: "center", color: C.slate } }],
    [{ text: "PRD 서술", options: { fontSize: 10, color: C.slate } },
     { text: "각 건 적용", options: { fill: { color: C.amberBg }, fontSize: 10, align: "center", color: C.amber } },
     { text: "이후 중복처리", options: { fill: { color: C.amberBg }, fontSize: 10, align: "center", color: C.amber } }],
    [{ text: "→ 동작", options: { fontSize: 11, color: C.slate, bold: true } },
     { text: "⚠️", options: { fill: { color: C.roseBg }, color: C.rose, bold: true, align: "center" } },
     { text: "⚠️", options: { fill: { color: C.roseBg }, color: C.rose, bold: true, align: "center" } }],
  ], { x: 7.05, y: 3.45, w: 5.35, colW: [2.55, 1.4, 1.4], border: { pt: 0.5, color: C.line }, valign: "middle", rowH: 0.42 });
  s.addText([
    { text: "❓", options: { color: C.rose, bold: true } },
    { text: " 누락  ·  ", options: { color: C.ink, bold: true } },
    { text: "⚠️", options: { color: C.rose, bold: true } },
    { text: " 모순", options: { color: C.ink, bold: true } },
    { text: "\n예: GAP-16 → 동시결제 리워드 중복 위험", options: { color: C.slate } },
  ], { x: 7.05, y: 5.45, w: 5.4, h: 0.7, fontFace: HEAD, fontSize: 11.5, lineSpacingMultiple: 1.25, margin: 0 });

  // ============================================================
  // SLIDE 7 — 시연 결과 5-1 한눈에 (stats, dark)
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "05 · RESULT", "시연 결과 — 차별화리뷰Pro 추천인코드", I.bug, C.rose);

  function stat(x, num, label, sub, col) {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.85, w: 3.7, h: 2.15, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.85, w: 3.7, h: 0.1, fill: { color: col } });
    s.addText(num, { x: x + 0.2, y: 2.12, w: 3.3, h: 1.2, fontFace: NUM, fontSize: 66, color: C.ink, bold: true, align: "center", margin: 0 });
    s.addText(label, { x: x + 0.2, y: 3.34, w: 3.3, h: 0.35, fontFace: HEAD, fontSize: 17, color: col, bold: true, align: "center", margin: 0 });
    s.addText(sub, { x: x + 0.2, y: 3.68, w: 3.3, h: 0.3, fontFace: HEAD, fontSize: 11.5, color: C.muted, align: "center", margin: 0 });
  }
  stat(0.6, "42", "TC 도출", "8개 요소군 커버리지", C.teal);
  stat(4.75, "24", "GAP 발견", "PM 결정 대기 항목", C.ink2);
  stat(8.9, "6", "High 등급", "배포 차단급 리스크", C.rose);

  // severity stacked bar
  s.addText("심각도 분포", { x: 0.6, y: 4.4, w: 4, h: 0.3, fontFace: HEAD, fontSize: 13, color: C.ink, bold: true, margin: 0 });
  const barX = 0.6, barY = 4.8, barW = 12.1, total = 24;
  const segs = [["High", 6, C.rose], ["Med", 14, C.amber], ["Low", 4, C.teal]];
  let cx = barX;
  segs.forEach(([lab, val, col]) => {
    const sw = barW * (val / total);
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y: barY, w: sw, h: 0.62, fill: { color: col } });
    s.addText(`${lab} ${val}`, { x: cx, y: barY, w: sw, h: 0.62, fontFace: HEAD, fontSize: 14, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
    cx += sw;
  });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.8, w: 12.1, h: 0.85, fill: { color: C.roseBg } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 5.8, w: 0.1, h: 0.85, fill: { color: C.rose } });
  s.addText("High 6건이 결제 금액 정합성 · 리워드 중복 · 할인 모델 충돌 — 구현 착수 전 PM 결정이 필요한 배포 차단급 갭이다.",
    { x: 0.95, y: 5.8, w: 11.5, h: 0.85, fontFace: HEAD, fontSize: 13.5, color: C.ink2, bold: true, valign: "middle", margin: 0 });

  // ============================================================
  // SLIDE 8 — High 6건 PM 결정 대기 표
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "05 · RESULT", "High 6건 — PM 결정 대기", I.bug, C.rose);
  const headOpt = (t) => ({ text: t, options: { fill: { color: C.ink2 }, color: "FFFFFF", bold: true, fontSize: 12.5, valign: "middle" } });
  const cellGap = (t) => ({ text: t, options: { fill: { color: C.roseBg }, color: C.rose, bold: true, fontSize: 11.5, align: "center", valign: "middle" } });
  const cell = (t, b = false) => ({ text: t, options: { fontSize: 11.5, color: b ? C.ink : C.slate, bold: b, valign: "middle" } });
  s.addTable([
    [headOpt("GAP"), headOpt("무엇이 문제인가"), headOpt("PM이 결정할 것")],
    [cellGap("07"), cell("할인 모델 이중 정의 — “첫 달 50%” vs BO 코드별 정액/정률", true), cell("채널 기본할인 vs 코드 할인 우선순위 확정")],
    [cellGap("09"), cell("정률·정액 할인 기준가가 정가 vs 기본혜택가로 불명", true), cell("기준 금액 확정 (L4 §6 “기본가” 정의)")],
    [cellGap("06"), cell("최소 결제금액 0원 vs 1원 모순", true), cell("하한 0/1원 확정 (PG 0원 결제 허용 여부 포함)")],
    [cellGap("01"), cell("추천인 리워드 쿠폰 vs [TBD 포인트]", true), cell("L4 TechSpec TBD를 쿠폰으로 확정")],
    [cellGap("16"), cell("동시 결제 시 “각 건 적용” vs “중복 처리” 충돌", true), cell("사업자번호당 1회 보장 동시성 규칙 명문화")],
    [cellGap("03"), cell("비로그인 유효코드 진입 후 이력판정 경로 공백", true), cell("결제 직전 로그인 시 차단/되돌림 정의")],
  ], { x: 0.6, y: 1.7, w: 12.1, colW: [1.5, 6.0, 4.6], border: { pt: 0.5, color: C.line }, rowH: [0.45, 0.7, 0.7, 0.6, 0.6, 0.7, 0.7], align: "left", margin: [4, 6, 4, 6], fill: { color: C.white } });
  s.addText([
    { text: "읽는 법   ", options: { color: C.muted, bold: true } },
    { text: "GAP-07·09는 “할인 모델 단일화”로 묶어 동시 해소 가능. 모든 행은 GAP 리포트의 PM질문/제안 컬럼에서 그대로 가져온 것.", options: { color: C.slate } },
  ], { x: 0.6, y: 6.5, w: 12.1, h: 0.5, fontFace: HEAD, fontSize: 11.5, margin: 0 });

  // ============================================================
  // SLIDE 9 — PM 우선 처리 권고 (묶음 액션)
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "05 · RESULT", "PM 우선 처리 권고 — 묶음 액션", I.list, C.rose);
  const recs = [
    ["1", "High 6건 선결", "구현 착수 전 확정 — 결제 정합성·리워드 중복·할인 충돌의 배포 차단급 갭", "GAP-01·03·06·07·09·16", C.rose],
    ["2", "할인 모델 단일화", "“첫 달 50%” 채널 기본값과 BO 코드별 정액/정률의 우선순위·기준가·하한·반올림을 한 번에 정의", "GAP-07·09·06·02 → 4건 동시 해소", C.teal],
    ["3", "이력·동시성 정합성 묶음", "사업자번호 단위 중복방지의 판정시점·경계·환불연동을 한 정책으로 확정", "GAP-03·16·22·10·15·18", C.teal],
    ["4", "[기인지] BE 회신 대기", "정책·BE 확인 대기 항목. OI-01 확정에 따라 연쇄 해소 가능", "GAP-12·13·14·20·21", C.muted],
  ];
  let ry = 1.7;
  recs.forEach(([n, t, d, tag, col]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: ry, w: 12.1, h: 1.08, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
    s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: ry, w: 0.1, h: 1.08, fill: { color: col } });
    s.addShape(pres.shapes.OVAL, { x: 0.92, y: ry + 0.3, w: 0.5, h: 0.5, fill: { color: col } });
    s.addText(n, { x: 0.92, y: ry + 0.3, w: 0.5, h: 0.5, fontFace: NUM, fontSize: 20, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });
    s.addText(t, { x: 1.65, y: ry + 0.14, w: 7.0, h: 0.38, fontFace: HEAD, fontSize: 16, color: C.ink, bold: true, valign: "middle", margin: 0 });
    s.addText(d, { x: 1.65, y: ry + 0.52, w: 7.3, h: 0.5, fontFace: HEAD, fontSize: 12, color: C.muted, valign: "top", margin: 0 });
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: 9.2, y: ry + 0.32, w: 3.3, h: 0.44, fill: { color: C.paper }, line: { color: col, width: 1 }, rectRadius: 0.08 });
    s.addText(tag, { x: 9.25, y: ry + 0.32, w: 3.2, h: 0.44, fontFace: HEAD, fontSize: 11, color: col, bold: true, align: "center", valign: "middle", margin: 0 });
    ry += 1.2;
  });

  // ============================================================
  // SLIDE 10 — 품질 보증 장치
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "06 · ASSURANCE", "신뢰의 근거 — 품질 보증 장치", I.shield, C.ink2);
  s.addText("산출물이 신뢰할 만한지 자체를 검증한다. 사람이 아니라 격리된 검증 에이전트가 본다.", { x: 0.6, y: 1.62, w: 12, h: 0.4, fontFace: HEAD, fontSize: 14, color: C.slate, margin: 0 });

  function assureCard(x, ic, accent, title, sub, bullets) {
    s.addShape(pres.shapes.RECTANGLE, { x, y: 2.25, w: 5.95, h: 4.05, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
    s.addShape(pres.shapes.OVAL, { x: x + 0.35, y: 2.6, w: 0.7, h: 0.7, fill: { color: accent } });
    s.addImage({ data: ic, x: x + 0.51, y: 2.76, w: 0.38, h: 0.38 });
    s.addText(title, { x: x + 1.2, y: 2.62, w: 4.6, h: 0.4, fontFace: HEAD, fontSize: 18, color: C.ink, bold: true, margin: 0 });
    s.addText(sub, { x: x + 1.2, y: 3.0, w: 4.6, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.muted, margin: 0 });
    s.addText(bullets.map((b) => ({ text: b, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: 8, color: C.slate } })),
      { x: x + 0.4, y: 3.6, w: 5.25, h: 2.5, fontFace: HEAD, fontSize: 13, margin: 0 });
  }
  assureCard(0.6, I.robot, C.teal, "독립 검증 subAgent", "구조 정합성 C1~C7",
    ["생성 세션과 분리된 fresh-context 에이전트", "TC/GAP 두 파일의 구조만 판정 (자동수정 없음)", "결함 주입 테스트에서 누락·심각도 결손 정확 지목"]);
  assureCard(6.75, I.sync, C.ink2, "회차 / 버전 관리", "재분석 추적 + TC 양산 방지",
    ["PRD 수정 → 재분석 시 이전 산출물 자동 보관", "변경 이력(해결/재발/신규/잔존) · 결번 색인", "갭 강제 TC화 금지 — 거짓 PASS/FAIL 방지"]);

  // ============================================================
  // SLIDE 11 — closing / 현황 & 다음 단계 (dark)
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "CURRENT · NEXT", "현황 & 다음 단계", I.flag, C.teal);

  // done column card
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.75, w: 5.95, h: 4.0, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 1.75, w: 5.95, h: 0.1, fill: { color: C.teal } });
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 2.1, w: 0.5, h: 0.5, fill: { color: C.teal } });
  s.addImage({ data: I.check, x: 1.02, y: 2.22, w: 0.26, h: 0.26 });
  s.addText("완료", { x: 1.55, y: 2.1, w: 4.5, h: 0.5, fontFace: HEAD, fontSize: 19, color: C.ink, bold: true, valign: "middle", margin: 0 });
  s.addText([
    "방법론을 프로젝트 로컬 스킬로 추출 (7기법 엔진)",
    "첫 인스턴스 시연 — TC 42 / GAP 24",
    "상태전이 · 결정 매트릭스 시각화 산출",
    "독립 검증 subAgent (C1~C7)",
    "회차/버전 관리 + TC 양산 방지",
  ].map((b) => ({ text: b, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: 9, color: C.slate } })),
    { x: 1.0, y: 2.85, w: 5.35, h: 2.7, fontFace: HEAD, fontSize: 13, valign: "top", margin: 0 });

  // next column card
  s.addShape(pres.shapes.RECTANGLE, { x: 6.75, y: 1.75, w: 5.95, h: 4.0, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.75, y: 1.75, w: 5.95, h: 0.1, fill: { color: C.rose } });
  s.addShape(pres.shapes.OVAL, { x: 7.05, y: 2.1, w: 0.5, h: 0.5, fill: { color: C.rose } });
  s.addImage({ data: I.flag, x: 7.17, y: 2.22, w: 0.26, h: 0.26 });
  s.addText("다음 단계 (옵션)", { x: 7.7, y: 2.1, w: 4.7, h: 0.5, fontFace: HEAD, fontSize: 19, color: C.ink, bold: true, valign: "middle", margin: 0 });
  s.addText([
    "엔진 2계층 입력 — 지식베이스(Layer 0) 자동 연동",
    "실회차 시연 — 실제 PRD 변경분 재분석 검증",
    "High 6건 PM 1페이지 요약",
  ].map((b) => ({ text: b, options: { bullet: { code: "2022", indent: 14 }, breakLine: true, paraSpaceAfter: 9, color: C.slate } })),
    { x: 7.15, y: 2.85, w: 5.35, h: 2.7, fontFace: HEAD, fontSize: 13, valign: "top", margin: 0 });

  // closing quote band
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.1, w: 12.1, h: 0.78, fill: { color: C.ink } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.1, w: 0.1, h: 0.78, fill: { color: C.teal } });
  s.addText("“완전한 TC를 못 쓰면 = PRD 갭” — 갭을 개발 이전에 PM에게 되돌려준다.", { x: 0.6, y: 6.1, w: 12.1, h: 0.78, fontFace: HEAD, fontSize: 14, color: C.white, bold: true, align: "center", valign: "middle", margin: 0 });

  // ============================================================
  // SLIDE 12 — 제안: PRD 입력 구조 권장안
  // ============================================================
  s = pres.addSlide();
  contentHeader(s, "PROPOSAL", "제안 — PRD 입력 구조 권장안", I.users, C.teal);
  s.addText([
    { text: "분석 품질의 상한선 = PRD 입력 품질. ", options: { color: C.slate } },
    { text: "제품을 2계층으로 구조화", options: { color: C.ink, bold: true } },
    { text: "하면 엔진이 베이스라인을 끌어와 ", options: { color: C.slate } },
    { text: "상호작용(INTERACTION) 갭", options: { color: C.ink, bold: true } },
    { text: "까지 잡는다.", options: { color: C.slate } },
  ], { x: 0.6, y: 1.62, w: 12.1, h: 0.4, fontFace: HEAD, fontSize: 14, margin: 0 });

  // left card — 2계층 모델 + Confluence 트리
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 5.95, h: 4.05, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 2.25, w: 5.95, h: 0.1, fill: { color: C.teal } });
  s.addShape(pres.shapes.OVAL, { x: 0.9, y: 2.55, w: 0.55, h: 0.55, fill: { color: C.teal } });
  s.addImage({ data: I.diagram, x: 1.03, y: 2.68, w: 0.29, h: 0.29 });
  s.addText("제품을 2계층으로", { x: 1.6, y: 2.55, w: 4.7, h: 0.35, fontFace: HEAD, fontSize: 17, color: C.ink, bold: true, margin: 0 });
  s.addText("Layer 0 베이스라인 / Layer 1 PRD", { x: 1.6, y: 2.9, w: 4.7, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.muted, margin: 0 });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.9, y: 3.5, w: 5.4, h: 1.68, fill: { color: C.paper }, line: { color: C.line, width: 1 } });
  s.addText([
    { text: "<Product> (플랫폼)\n", options: { color: C.ink, bold: true } },
    { text: "├─ 📚 제품 지식베이스   ", options: { color: C.slate } },
    { text: "← Layer 0\n", options: { color: C.teal, bold: true } },
    { text: "│   ├─ 용어집\n│   ├─ 정책\n│   └─ 기능 명세 ─ <서비스>/<기능…>   ", options: { color: C.muted } },
    { text: "← 출시 기능이 여기로 흡수\n", options: { color: C.teal } },
    { text: "└─ 🚧 프로젝트 / PRD    ", options: { color: C.slate } },
    { text: "← Layer 1 (베이스라인 링크)", options: { color: C.rose, bold: true } },
  ], { x: 1.05, y: 3.58, w: 5.15, h: 1.55, fontFace: "Consolas", fontSize: 9.5, lineSpacingMultiple: 1.12, valign: "top", margin: 0 });
  s.addText([
    { text: "규칙  ", options: { color: C.muted, bold: true } },
    { text: "진실의 원본은 기능 명세. PRD는 참조(링크)만 — 단방향. “신규/기존”은 폴더 축으로 쓰지 않음(시점 의존 → 무너짐).", options: { color: C.slate } },
  ], { x: 0.9, y: 5.3, w: 5.4, h: 0.92, fontFace: HEAD, fontSize: 10.5, lineSpacingMultiple: 1.15, valign: "top", margin: 0 });

  // right card — 갭 출처 태깅 + PRD 필수 섹션
  s.addShape(pres.shapes.RECTANGLE, { x: 6.75, y: 2.25, w: 5.95, h: 4.05, fill: { color: C.white }, line: { color: C.line, width: 1 }, shadow: sh() });
  s.addShape(pres.shapes.RECTANGLE, { x: 6.75, y: 2.25, w: 5.95, h: 0.1, fill: { color: C.rose } });
  s.addShape(pres.shapes.OVAL, { x: 7.05, y: 2.55, w: 0.55, h: 0.55, fill: { color: C.rose } });
  s.addImage({ data: I.bug, x: 7.18, y: 2.68, w: 0.29, h: 0.29 });
  s.addText("갭을 출처로 태깅", { x: 7.75, y: 2.55, w: 4.7, h: 0.35, fontFace: HEAD, fontSize: 17, color: C.ink, bold: true, margin: 0 });
  s.addText("어느 계층의 책임인지 한눈에", { x: 7.75, y: 2.9, w: 4.7, h: 0.3, fontFace: HEAD, fontSize: 12, color: C.muted, margin: 0 });
  const propTags = [
    ["FEATURE", "피처 자체 미정의 — 이번 PM 소유", C.teal, C.tealBg],
    ["INTERACTION", "기존 동작 상호작용 — 최우선·금광", C.rose, C.roseBg],
    ["BASELINE", "제품 본체 구멍 — 타 팀·참고", C.muted, C.line],
  ];
  let pty = 3.5;
  propTags.forEach(([lab, d, col, bg]) => {
    pill(s, 7.05, pty, 1.55, lab, bg, col);
    s.addText(d, { x: 8.75, y: pty, w: 3.85, h: 0.32, fontFace: HEAD, fontSize: 11.5, color: C.slate, valign: "middle", margin: 0 });
    pty += 0.5;
  });
  s.addShape(pres.shapes.LINE, { x: 7.05, y: 5.1, w: 5.35, h: 0, line: { color: C.line, width: 1 } });
  s.addText([
    { text: "PRD 필수 섹션  ", options: { color: C.muted, bold: true } },
    { text: "비목표 · 입력 필드표 · 규칙(결정테이블)표 · 상태 전이표 · 예외 흐름 · 영향범위(=INTERACTION 표면) · Open Questions(TBD)", options: { color: C.slate } },
  ], { x: 7.05, y: 5.25, w: 5.4, h: 0.95, fontFace: HEAD, fontSize: 11, lineSpacingMultiple: 1.2, valign: "top", margin: 0 });

  // bottom band — 현재 상태(가이드 단계)
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.5, w: 12.1, h: 0.78, fill: { color: C.ink } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0.6, y: 6.5, w: 0.1, h: 0.78, fill: { color: C.amber } });
  s.addText([
    { text: "지금은 입력 가이드 단계", options: { color: C.amberBg, bold: true } },
    { text: " — 트리 미준수해도 분석은 실행된다(품질만 좌우). 엔진의 2계층 자동 ingest는 다음 단계.", options: { color: C.line } },
  ], { x: 0.95, y: 6.5, w: 11.5, h: 0.78, fontFace: HEAD, fontSize: 13, valign: "middle", margin: 0 });

  await pres.writeFile({ fileName: "/Users/sfn/workspace/PRD Quality Guard/_build_ppt/PRD-Quality-Guard-소개.pptx" });
  console.log("WROTE pptx");
})();
