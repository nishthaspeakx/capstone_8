// Capstone 8 — 8-Slide Demo Deck (designed for live presentation)
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Group 8 — IIM Calcutta APAL02";
p.title = "Lowe's Store-Level Sales Target — Demo Deck";

// ── Palette (matching video) ─────────────────────────────
const NAVY = "003087", NAVY2 = "012A6E", BLUE = "0277BD", ICE = "CADCFC";
const ACCENT = "F4B400", GREEN = "2E7D32", RED = "C62828", ORANGE = "E65100";
const PURPLE = "6A1B9A", PINK = "C2185B", CYAN = "00BCD4";
const WHITE = "FFFFFF", PAPER = "F4F7FB", INK = "1A2332", MUTE = "5A6B7B";
const W = 13.333, H = 7.5;
let N = 1;
const TOTAL = 8;

const makeShadow = () => ({ type: "outer", color: "0A1F44", blur: 8, offset: 3, angle: 135, opacity: 0.16 });
const card = (s, x, y, w, h, fill) =>
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, rectRadius: 0.08, shadow: makeShadow() });
const footer = (s) => {
  s.addShape(p.shapes.RECTANGLE, { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: NAVY } });
  s.addText("Capstone 8 · Group 8 · IIM Calcutta APAL02", { x: 0.5, y: H - 0.32, w: 7, h: 0.32, fontSize: 9, color: ICE, valign: "middle", margin: 0 });
  s.addText(`${N} / ${TOTAL}`, { x: W - 1.2, y: H - 0.32, w: 0.9, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });
  N++;
};
const kicker = (s, t) => s.addText(t.toUpperCase(), { x: 0.6, y: 0.42, w: 9, h: 0.32, fontSize: 12, color: BLUE, bold: true, charSpacing: 3, margin: 0 });
const title = (s, t) => s.addText(t, { x: 0.6, y: 0.78, w: 12.1, h: 0.9, fontSize: 32, color: NAVY, bold: true, fontFace: "Georgia", margin: 0 });

// ═══════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ═══════════════════════════════════════════════════════
let s = p.addSlide(); s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: ACCENT } });
s.addShape(p.shapes.OVAL, { x: W - 4.2, y: -2.2, w: 6.5, h: 6.5, fill: { color: NAVY2 } });
s.addShape(p.shapes.OVAL, { x: W - 2.6, y: 3.4, w: 4.2, h: 4.2, fill: { color: BLUE, transparency: 60 } });

s.addText("IIM CALCUTTA  ·  CAPSTONE 8  ·  GROUP 8", { x: 0.8, y: 0.95, w: 11, h: 0.4, fontSize: 13, color: ACCENT, bold: true, charSpacing: 4, margin: 0 });
s.addText("Lowe's Store-Level\nAI Sales Targeting", { x: 0.8, y: 1.55, w: 9.8, h: 2.4, fontSize: 48, color: WHITE, bold: true, fontFace: "Georgia", lineSpacing: 52, margin: 0 });
s.addText("Replacing the peanut-butter spread with a supervised ML model that learns local market dynamics", { x: 0.8, y: 4.0, w: 9.2, h: 0.8, fontSize: 16, color: ICE, italic: true, margin: 0 });

// Team-member band
card(s, 0.8, 5.05, 8.4, 1.85, NAVY2);
s.addText("TEAM MEMBERS", { x: 1.0, y: 5.15, w: 8.0, h: 0.35, fontSize: 11, color: ACCENT, bold: true, charSpacing: 3, margin: 0 });
const members = ["Member 1","Member 2","Member 3","Member 4","Member 5","Member 6","Member 7","Member 8"];
members.forEach((m, i) => {
  const col = i % 4, row = Math.floor(i / 4);
  const x = 1.0 + col * 2.0, y = 5.5 + row * 0.62;
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.08, h: 0.42, fill: { color: ACCENT } });
  s.addText(m, { x: x + 0.18, y, w: 1.75, h: 0.42, fontSize: 13, color: WHITE, bold: true, valign: "middle", margin: 0 });
});
s.addText("github.com/nishthaspeakx/capstone_8", { x: 0.8, y: 7.1, w: 8, h: 0.3, fontSize: 11, color: ICE, italic: true, margin: 0 });
N++; // title slide doesn't show footer counter

// ═══════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM
// ═══════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "The Problem"); title(s, "Today's targets ignore local reality");
s.addText([
  { text: "How Lowe's sets targets today: ", options: { bold: true, color: NAVY } },
  { text: "the total company plan is divided across ~1,727 stores using each store's 3-year historical sales share — a flat allocation that ignores local market reality.", options: { color: INK } },
], { x: 0.6, y: 1.95, w: 7.5, h: 1.5, fontSize: 16, lineSpacing: 24 });
[
  ["A booming new-construction suburb gets the SAME growth rate as a declining rural town", ORANGE],
  ["Demographics, housing age, income, competition — all invisible to the method", ORANGE],
  ["Planners spend the whole year manually overriding wrong targets", RED],
].forEach((row, i) => {
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 3.55 + i * 0.85, w: 0.08, h: 0.65, fill: { color: row[1] } });
  s.addText(row[0], { x: 0.85, y: 3.55 + i * 0.85, w: 7.2, h: 0.65, fontSize: 14, color: INK, valign: "middle", margin: 0 });
});
card(s, 8.5, 1.95, 4.3, 4.3, NAVY);
s.addText("25.83%", { x: 8.5, y: 2.4, w: 4.3, h: 1.5, fontSize: 64, color: ACCENT, bold: true, align: "center", margin: 0 });
s.addText("of store-weeks miss target\nby more than ±10%\nunder the current method", { x: 8.7, y: 3.95, w: 3.9, h: 1.5, fontSize: 15, color: WHITE, align: "center", lineSpacing: 22 });
s.addText("1 in 4 store-weeks need re-planning", { x: 8.5, y: 5.6, w: 4.3, h: 0.45, fontSize: 12, color: ICE, align: "center", italic: true });
footer(s);

// ═══════════════════════════════════════════════════════
// SLIDE 3 — OUR SOLUTION
// ═══════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Our Solution"); title(s, "Supervised ML on 16 carefully chosen features");

// Left: features by group
const groups = [
  ["Lag / Momentum (4)", BLUE, "lag_1 · lag_4 · lag_13 · lag_52"],
  ["Demand — Raw (5)", PINK, "Households · Density · Income · Housing Units · Population"],
  ["Demand — Engineered (3)", GREEN, "income_affluent · housing_new · housing_old"],
  ["Competition + Store (4)", ORANGE, "Sister Stores · Total Competitors · Wallflowers · Urbanicity"],
];
groups.forEach((g, i) => {
  const y = 1.95 + i * 0.92;
  card(s, 0.6, y, 7.0, 0.78);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.09, h: 0.78, fill: { color: g[1] } });
  s.addText(g[0], { x: 0.82, y: y + 0.07, w: 6.5, h: 0.32, fontSize: 13, color: NAVY, bold: true, margin: 0 });
  s.addText(g[2], { x: 0.82, y: y + 0.39, w: 6.5, h: 0.32, fontSize: 11, color: INK, margin: 0 });
});

// Right: methodology
card(s, 7.85, 1.95, 5.0, 3.7);
s.addShape(p.shapes.RECTANGLE, { x: 7.85, y: 1.95, w: 5.0, h: 0.55, fill: { color: NAVY } });
s.addText("Built on rigorous methodology", { x: 8.05, y: 1.95, w: 4.7, h: 0.55, fontSize: 13, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  { text: "Model:", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 4 } },
  { text: "XGBoost (vs LightGBM, Ridge, naive)", options: { color: INK, breakLine: true, paraSpaceAfter: 12 } },
  { text: "Trained on:", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 4 } },
  { text: "269,412 store-week records", options: { color: INK, breakLine: true, paraSpaceAfter: 12 } },
  { text: "Validation:", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 4 } },
  { text: "Rolling time split (train past → predict future)", options: { color: INK, breakLine: true, paraSpaceAfter: 12 } },
  { text: "Leakage banned:", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 4 } },
  { text: "Plan Sales USD, Invoice Count, Avg Ticket", options: { color: INK } },
], { x: 8.05, y: 2.7, w: 4.7, h: 2.85, fontSize: 11, color: INK, valign: "top", lineSpacing: 14, margin: 0 });

// 165 → 40 → 16 ribbon
s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 7.85, y: 5.8, w: 5.0, h: 0.9, fill: { color: ACCENT }, rectRadius: 0.06 });
s.addText("165 → 40 → 16 features", { x: 7.85, y: 5.85, w: 5.0, h: 0.45, fontSize: 17, color: NAVY, bold: true, align: "center", margin: 0 });
s.addText("3 iterations · multicollinearity removed · business-relevance trim", { x: 7.85, y: 6.28, w: 5.0, h: 0.4, fontSize: 10, color: NAVY, align: "center", italic: true, margin: 0 });
footer(s);

// ═══════════════════════════════════════════════════════
// SLIDE 4 — RESULTS
// ═══════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Headline Results"); title(s, "Every success criterion met");

const kpis = [
  ["7.05%", "WAPE", "Target < 8%", GREEN],
  ["−0.97%", "Bias", "Within ±2%", GREEN],
  ["0.977", "R²", "Target > 0.88", GREEN],
  ["15%", "vs Naive", "Beats lag-52", BLUE],
  ["94.7%", "Calibrated", "1,636 / 1,727", ACCENT],
];
kpis.forEach((k, i) => {
  const x = 0.6 + i * 2.46;
  card(s, x, 1.95, 2.3, 2.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 1.95, w: 2.3, h: 0.1, fill: { color: k[3] } });
  s.addText(k[0], { x, y: 2.15, w: 2.3, h: 0.85, fontSize: 28, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(k[1], { x, y: 3.0, w: 2.3, h: 0.4, fontSize: 12, color: INK, bold: true, align: "center", margin: 0 });
  s.addText(k[2], { x, y: 3.4, w: 2.3, h: 0.4, fontSize: 10.5, color: GREEN, align: "center", margin: 0 });
});

s.addTable([
  [{ text: "Model", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "WAPE", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Bias", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "R²", options: { bold: true, color: WHITE, fill: { color: NAVY } } }],
  [{ text: "XGBoost (selected)", options: { bold: true } }, "7.05%", "−0.97%", "0.977"],
  ["LightGBM", "7.07%", "−1.11%", "0.977"],
  ["Ridge Regression", "7.11%", "+0.39%", "0.978"],
  ["Naive (lag-52)", "8.27%", "+0.33%", "0.965"],
], { x: 0.6, y: 4.3, w: 12.1, h: 2.5, fontSize: 13, color: INK, align: "center", valign: "middle",
     border: { pt: 0.5, color: ICE }, fill: { color: WHITE }, rowH: [0.5, 0.48, 0.48, 0.48, 0.48] });
footer(s);

// ═══════════════════════════════════════════════════════
// SLIDE 5 — STORE ACCURACY LOOP
// ═══════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "The Differentiator"); title(s, "Store-Level Accuracy Loop");
s.addText("Per-store WAPE, Bias & quarterly bias — then classify every store for targeted planner action.", { x: 0.6, y: 1.85, w: 12.1, h: 0.5, fontSize: 14, color: INK, margin: 0 });

const cls = [
  ["1,636", "Well-Calibrated", "Within ±5% — trust the target", GREEN],
  ["60", "Under-Targeted", "Sandbagged — raise target", ORANGE],
  ["31", "Over-Targeted", "Too aggressive — review", RED],
];
cls.forEach((c, i) => {
  const x = 0.6 + i * 4.12;
  card(s, x, 2.75, 3.9, 2.7);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.75, w: 3.9, h: 0.1, fill: { color: c[3] } });
  s.addText(c[0], { x, y: 2.95, w: 3.9, h: 0.95, fontSize: 44, color: c[3], bold: true, align: "center", margin: 0 });
  s.addText(c[1], { x, y: 3.95, w: 3.9, h: 0.5, fontSize: 17, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(c[2], { x: x + 0.2, y: 4.5, w: 3.5, h: 0.85, fontSize: 12, color: MUTE, align: "center", lineSpacing: 16, margin: 0 });
});

// Big impact strip
card(s, 0.6, 5.8, 12.1, 1.2, NAVY);
s.addText("1,727 stores manually reviewed today  →  only 91 stores need attention with our model", { x: 0.6, y: 5.85, w: 12.1, h: 0.55, fontSize: 18, color: WHITE, bold: true, align: "center", margin: 0 });
s.addText("a ~95% reduction in planner override workload", { x: 0.6, y: 6.4, w: 12.1, h: 0.4, fontSize: 13, color: ACCENT, align: "center", italic: true, margin: 0 });
footer(s);

// ═══════════════════════════════════════════════════════
// SLIDE 6 — ROLE OF STORE
// ═══════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Strategic Overlay"); title(s, "Role-of-Store — one model, 5 playbooks");

s.addChart(p.charts.DOUGHNUT, [{
  name: "Roles", labels: ["High Growth", "Growth", "Neutral", "Maintain", "Defend"],
  values: [346, 345, 345, 346, 345],
}], {
  x: 0.6, y: 1.95, w: 5.2, h: 4.7,
  chartColors: ["1565C0", "43A047", "757575", "FF8F00", "C62828"],
  showLegend: true, legendPos: "b", legendColor: INK, legendFontSize: 11,
  dataLabelColor: WHITE, showValue: false, holeSize: 55,
});
const roles = [
  ["High Growth", "Expanding market + outperforming → raise targets aggressively", "1565C0"],
  ["Growth / Neutral", "Moderate or stable signals → trust data-driven target", "43A047"],
  ["Maintain", "Aging market, steady demand → hold targets, monitor", "FF8F00"],
  ["Defend", "High competition + underperforming → conservative, protect share", "C62828"],
];
roles.forEach((r, i) => {
  const y = 2.0 + i * 1.18;
  card(s, 6.2, y, 6.5, 1.02);
  s.addShape(p.shapes.RECTANGLE, { x: 6.2, y, w: 0.09, h: 1.02, fill: { color: r[2] } });
  s.addText(r[0], { x: 6.45, y: y + 0.1, w: 6, h: 0.4, fontSize: 15, color: NAVY, bold: true, margin: 0 });
  s.addText(r[1], { x: 6.45, y: y + 0.5, w: 6.05, h: 0.5, fontSize: 12, color: INK, margin: 0 });
});
footer(s);

// ═══════════════════════════════════════════════════════
// SLIDE 7 — REFLECTIONS & NEXT STEPS
// ═══════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Reflections"); title(s, "What worked, what's honest, what's next");

// What worked well
card(s, 0.6, 1.95, 4.05, 4.85);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.95, w: 4.05, h: 0.55, fill: { color: GREEN } });
s.addText("What worked well", { x: 0.8, y: 1.95, w: 3.85, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  "Leakage-safe lag features turned a hard problem tractable",
  "Trimming to 16 features improved bias AND explainability",
  "Store-Level Accuracy Loop — the real business differentiator",
  "3 model families agreeing at ~7% — robust, not a fluke",
  "Discipline on leakage (refused Plan Sales USD at corr 0.986)",
].map(t => ({ text: t, options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 14 } })),
  { x: 0.8, y: 2.7, w: 3.7, h: 4.0, fontSize: 11.5, color: INK, valign: "top", margin: 0 });

// Honest limitations
card(s, 4.85, 1.95, 4.05, 4.85);
s.addShape(p.shapes.RECTANGLE, { x: 4.85, y: 1.95, w: 4.05, h: 0.55, fill: { color: ORANGE } });
s.addText("Honest limitations", { x: 5.05, y: 1.95, w: 3.85, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  "Lag-driven — strong for existing stores, not for new ones",
  "Week-ahead scoring (no recursive multi-week forecasting yet)",
  "Role thresholds are heuristic (quantile-based)",
  "Demographics are annual snapshots; intra-year shifts missed",
  "No event / promo calendar integrated yet",
].map(t => ({ text: t, options: { bullet: { code: "2022", color: ORANGE }, breakLine: true, paraSpaceAfter: 14 } })),
  { x: 5.05, y: 2.7, w: 3.7, h: 4.0, fontSize: 11.5, color: INK, valign: "top", margin: 0 });

// Next steps
card(s, 9.1, 1.95, 3.65, 4.85);
s.addShape(p.shapes.RECTANGLE, { x: 9.1, y: 1.95, w: 3.65, h: 0.55, fill: { color: BLUE } });
s.addText("What's next", { x: 9.3, y: 1.95, w: 3.45, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  "Recursive multi-week forecasting for full-year targets",
  "Cold-start model for new stores (no lag history)",
  "Constrained optimization → store sums equal division plan",
  "Pilot West Division → measure override drop → scale",
].map(t => ({ text: t, options: { bullet: { code: "2022", color: BLUE }, breakLine: true, paraSpaceAfter: 14 } })),
  { x: 9.3, y: 2.7, w: 3.35, h: 4.0, fontSize: 11.5, color: INK, valign: "top", margin: 0 });

footer(s);

// ═══════════════════════════════════════════════════════
// SLIDE 8 — THANK YOU / Q&A
// ═══════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: NAVY };
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: ACCENT } });
s.addShape(p.shapes.OVAL, { x: -2, y: 4.0, w: 5.5, h: 5.5, fill: { color: NAVY2 } });

s.addText("Thank You", { x: 0.8, y: 1.6, w: 9, h: 1.1, fontSize: 56, color: WHITE, bold: true, fontFace: "Georgia", margin: 0 });
s.addText("Questions & discussion welcome", { x: 0.8, y: 2.85, w: 11, h: 0.5, fontSize: 19, color: ACCENT, italic: true, margin: 0 });
s.addText("From a flat heuristic → a transparent, store-specific, validated ML targeting system.", { x: 0.8, y: 3.45, w: 11.5, h: 0.7, fontSize: 15, color: ICE, italic: true, margin: 0 });

const close = [["7.05%", "WAPE"], ["−0.97%", "Bias"], ["94.7%", "Calibrated"], ["95%", "Workload Drop"]];
close.forEach((c, i) => {
  const x = 0.8 + i * 3.05;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 4.5, w: 2.8, h: 1.7, fill: { color: NAVY2 }, line: { color: ACCENT, width: 1.5 }, rectRadius: 0.1 });
  s.addText(c[0], { x, y: 4.75, w: 2.8, h: 0.85, fontSize: 32, color: ACCENT, bold: true, align: "center", margin: 0 });
  s.addText(c[1], { x, y: 5.6, w: 2.8, h: 0.45, fontSize: 14, color: WHITE, bold: true, align: "center", margin: 0 });
});

s.addText("IIM Calcutta  ·  Capstone 8  ·  Group 8   |   github.com/nishthaspeakx/capstone_8", { x: 0.8, y: 6.6, w: 12, h: 0.4, fontSize: 12, color: ICE, italic: true, margin: 0 });

p.writeFile({ fileName: "outputs/Capstone8_Demo_Deck.pptx" }).then(() => console.log("Demo deck written"));
