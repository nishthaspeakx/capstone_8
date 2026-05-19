// Capstone 8 — Lowe's Store-Level Sales Target Model
// Professor Presentation. Palette: Lowe's Navy executive.
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Group 8 — IIM Calcutta APAL02";
p.title = "Lowe's Store-Level Sales Target Model";

// ── Palette ──────────────────────────────────────────────
const NAVY = "003087";      // dominant
const NAVY2 = "012A6E";
const BLUE = "0277BD";      // support
const ICE = "CADCFC";       // light support
const ACCENT = "F4B400";    // sharp accent (gold)
const GREEN = "2E7D32";
const RED = "C62828";
const ORANGE = "E65100";
const WHITE = "FFFFFF";
const PAPER = "F4F7FB";
const INK = "1A2332";
const MUTE = "5A6B7B";

const W = 13.333, H = 7.5;

// ── Helpers ──────────────────────────────────────────────
function bg(slide, color) { slide.background = { color }; }
function footer(slide, n) {
  slide.addShape(p.shapes.RECTANGLE, { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: NAVY } });
  slide.addText("Capstone 8 · Group 8 · IIM Calcutta APAL02", { x: 0.5, y: H - 0.32, w: 7, h: 0.32, fontSize: 9, color: ICE, valign: "middle", margin: 0 });
  slide.addText(`Lowe's Sales Target Model  |  ${n}`, { x: W - 4.5, y: H - 0.32, w: 4, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });
}
function kicker(slide, text) {
  slide.addText(text.toUpperCase(), { x: 0.6, y: 0.42, w: 9, h: 0.32, fontSize: 12, color: BLUE, bold: true, charSpacing: 3, margin: 0 });
}
function title(slide, text) {
  slide.addText(text, { x: 0.6, y: 0.72, w: 12.1, h: 0.95, fontSize: 32, color: NAVY, bold: true, fontFace: "Georgia", margin: 0 });
}
function makeShadow() { return { type: "outer", color: "0A1F44", blur: 8, offset: 3, angle: 135, opacity: 0.16 }; }

function card(slide, x, y, w, h, fill) {
  slide.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, rectRadius: 0.08, shadow: makeShadow() });
}

// ════════════════════════════════════════════════════════
// SLIDE 1 — TITLE
// ════════════════════════════════════════════════════════
let s = p.addSlide(); bg(s, NAVY);
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: ACCENT } });
s.addShape(p.shapes.OVAL, { x: W - 4.2, y: -2.2, w: 6.5, h: 6.5, fill: { color: NAVY2 } });
s.addShape(p.shapes.OVAL, { x: W - 2.6, y: 3.4, w: 4.2, h: 4.2, fill: { color: BLUE, transparency: 60 } });

s.addText("CAPSTONE 8  ·  GROUP 8  ·  IIM CALCUTTA  ·  APAL02", { x: 0.8, y: 1.05, w: 9, h: 0.4, fontSize: 14, color: ICE, bold: true, charSpacing: 3 });
s.addText("Lowe's Store-Level\nSales Target Model", { x: 0.8, y: 1.7, w: 9.6, h: 2.2, fontSize: 46, color: WHITE, bold: true, fontFace: "Georgia", lineSpacing: 50 });
s.addText("Replacing the “peanut-butter spread” with a supervised ML model that learns local market dynamics", { x: 0.8, y: 3.95, w: 9.2, h: 0.8, fontSize: 16, color: ICE, italic: true });

const pills = [["1,727 Stores", 0.8], ["16 Features", 2.7], ["XGBoost", 4.4], ["FY2023–FY2025", 5.9], ["7.05% WAPE", 8.0]];
pills.forEach(([t, x]) => {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 5.05, w: t.length * 0.13 + 0.5, h: 0.5, fill: { color: NAVY2 }, line: { color: BLUE, width: 1 }, rectRadius: 0.25 });
  s.addText(t, { x, y: 5.05, w: t.length * 0.13 + 0.5, h: 0.5, fontSize: 13, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
});
s.addText("A data-driven store-targeting tool  ·  github.com/nishthaspeakx/capstone_8", { x: 0.8, y: 6.5, w: 11, h: 0.4, fontSize: 12, color: ICE });

// ════════════════════════════════════════════════════════
// SLIDE 2 — THE PROBLEM
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "The Business Problem"); title(s, "Today's targets ignore local reality");
s.addText([
  { text: "How Lowe's sets targets now: ", options: { bold: true, color: NAVY } },
  { text: "the total company plan is divided across ~1,727 stores using each store's 3-year historical sales share — a flat “peanut-butter spread.”", options: { color: INK } },
], { x: 0.6, y: 1.75, w: 7.2, h: 1.3, fontSize: 16, lineSpacing: 24 });
[
  ["A booming new-construction suburb gets the SAME growth rate as a declining rural town", ORANGE],
  ["Demographic shifts, housing age, income, competition — all invisible to the method", ORANGE],
  ["Planners spend the entire year manually overriding wrong targets", RED],
].forEach((row, i) => {
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 3.15 + i * 0.78, w: 0.07, h: 0.6, fill: { color: row[1] } });
  s.addText(row[0], { x: 0.85, y: 3.15 + i * 0.78, w: 6.9, h: 0.6, fontSize: 13.5, color: INK, valign: "middle", margin: 0 });
});
// Big stat card
card(s, 8.2, 1.75, 4.5, 3.0, NAVY);
s.addText("25.83%", { x: 8.2, y: 2.05, w: 4.5, h: 1.3, fontSize: 56, color: ACCENT, bold: true, align: "center", margin: 0 });
s.addText("of store-weeks miss target by\nmore than ±10% under the\ncurrent method", { x: 8.4, y: 3.35, w: 4.1, h: 1.2, fontSize: 14, color: WHITE, align: "center", lineSpacing: 19 });
s.addText("That's 1 in 4 store-weeks needing re-planning.", { x: 8.2, y: 4.95, w: 4.5, h: 0.4, fontSize: 12, color: MUTE, align: "center", italic: true });
footer(s, "The Problem");

// ════════════════════════════════════════════════════════
// SLIDE 3 — THE SOLUTION
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Our Approach"); title(s, "A supervised model + an accuracy loop");
const steps = [
  ["1", "Learn", "Train a supervised model on 269,412 store-week records to learn how local market + recent performance drive sales"],
  ["2", "Predict", "Generate store-specific, data-driven sales targets — not a flat chain-wide rate"],
  ["3", "Diagnose", "Store-Level Accuracy Loop flags exactly which stores are under- or over-targeted"],
  ["4", "Act", "Role-of-Store segmentation turns one model into 5 planning playbooks for surgical overrides"],
];
steps.forEach((st, i) => {
  const x = 0.6 + i * 3.12;
  card(s, x, 1.95, 2.9, 3.7);
  s.addShape(p.shapes.OVAL, { x: x + 1.1, y: 2.25, w: 0.7, h: 0.7, fill: { color: NAVY } });
  s.addText(st[0], { x: x + 1.1, y: 2.25, w: 0.7, h: 0.7, fontSize: 22, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(st[1], { x: x + 0.2, y: 3.1, w: 2.5, h: 0.5, fontSize: 18, color: BLUE, bold: true, align: "center", margin: 0 });
  s.addText(st[2], { x: x + 0.25, y: 3.65, w: 2.4, h: 1.8, fontSize: 12.5, color: INK, align: "center", lineSpacing: 17, margin: 0 });
  if (i < 3) s.addText("→", { x: x + 2.78, y: 3.5, w: 0.5, h: 0.5, fontSize: 24, color: BLUE, bold: true, margin: 0 });
});
footer(s, "Approach");

// ════════════════════════════════════════════════════════
// SLIDE 4 — DATASET
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "The Data"); title(s, "269,412 store-weeks, fully validated");
const stats = [
  ["269,412", "Store-week rows"],
  ["1,727", "Unique stores"],
  ["3 years", "FY2023–FY2025"],
  ["16", "Final features"],
];
stats.forEach((st, i) => {
  const x = 0.6 + i * 3.12;
  card(s, x, 1.85, 2.9, 1.7, WHITE);
  s.addText(st[0], { x: x, y: 2.0, w: 2.9, h: 0.85, fontSize: 32, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(st[1], { x: x, y: 2.85, w: 2.9, h: 0.55, fontSize: 12, color: MUTE, align: "center", margin: 0 });
});
s.addText("Data integrity checks", { x: 0.6, y: 3.95, w: 6, h: 0.4, fontSize: 16, color: NAVY, bold: true, margin: 0 });
[
  "Rolling time-based split — train on the past, test on the future (no temporal leakage)",
  "Holdout: 19 Sep 2025 → 30 Jan 2026 (Q4 FY2025), 22,439 rows, all 1,727 stores",
  "Leakage blacklist: Plan Sales USD, Invoice Count, Avg Ticket never used as inputs",
].forEach((t, i) => {
  s.addText(t, { x: 0.85, y: 4.4 + i * 0.5, w: 11.8, h: 0.45, fontSize: 13, color: INK, bullet: { code: "2022", color: BLUE }, margin: 0 });
});
footer(s, "Dataset");

// ════════════════════════════════════════════════════════
// SLIDE 5 — THE 16 FEATURES
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Feature Engineering"); title(s, "The final 16 features — by group");
const groups = [
  ["Lag / Momentum (4)", BLUE, ["lag_1 · last week (corr 0.98)", "lag_4 · monthly rhythm", "lag_13 · quarterly rhythm", "lag_52 · annual seasonality"]],
  ["Demand — Raw (5)", "C2185B", ["CYE Total Households", "Household Density / SqMi", "Median Household Income", "Total Housing Units", "Total Population"]],
  ["Demand — Engineered (3)", GREEN, ["income_affluent ($150K+)", "housing_new_share (post-2000)", "housing_old_share (pre-1969)"]],
  ["Competition + Store (4)", ORANGE, ["Sister Store Count (TA)", "total_competitor_ta", "Wallflowers Depot (TA)", "Urbanicity (encoded)"]],
];
groups.forEach((g, i) => {
  const x = 0.6 + (i % 4) * 3.12;
  card(s, x, 1.85, 2.9, 3.55);
  s.addShape(p.shapes.RECTANGLE, { x: x, y: 1.85, w: 2.9, h: 0.55, fill: { color: g[1] } });
  s.addText(g[0], { x: x + 0.1, y: 1.85, w: 2.7, h: 0.55, fontSize: 12.5, color: WHITE, bold: true, valign: "middle", margin: 0 });
  s.addText(g[2].map((t, j) => ({ text: t, options: { bullet: { code: "2022", color: g[1] }, breakLine: true, paraSpaceAfter: 8 } })),
    { x: x + 0.18, y: 2.55, w: 2.6, h: 2.75, fontSize: 11.5, color: INK, valign: "top", margin: 0 });
});
s.addText("We deliberately dropped roll_4, roll_13, Year & Fiscal Week — they were so dominant (~94% importance) they masked every market signal. Result: bias improved to −0.97%.", { x: 0.6, y: 5.6, w: 12.1, h: 0.7, fontSize: 12.5, color: NAVY, italic: true, align: "center", margin: 0 });
footer(s, "16 Features");

// ════════════════════════════════════════════════════════
// SLIDE 6 — MODELS USED & WHY
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "The Models"); title(s, "Four models, benchmarked head-to-head");
const models = [
  ["XGBoost", "PRIMARY", GREEN, "Sequential boosted trees. Best WAPE + near-zero bias. Captures non-linear market interactions automatically."],
  ["LightGBM", "ROBUSTNESS", BLUE, "Leaf-wise boosting, faster on big data. Near-identical score — cross-validates the result is real, not a fluke."],
  ["Ridge", "LINEAR CONTROL", "8E24AA", "L2-regularized linear regression. Sanity check: is the non-linear model even necessary? (It is.)"],
  ["Naive (lag-52)", "BASELINE", MUTE, "This week = same week last year. The bar every real model must clear. We beat it by 15%."],
];
models.forEach((m, i) => {
  const y = 1.8 + i * 1.32;
  card(s, 0.6, y, 12.1, 1.18);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.08, h: 1.18, fill: { color: m[2] } });
  s.addText(m[0], { x: 0.85, y: y + 0.12, w: 2.6, h: 0.5, fontSize: 19, color: NAVY, bold: true, margin: 0 });
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: y + 0.66, w: 1.9, h: 0.36, fill: { color: m[2] }, rectRadius: 0.18 });
  s.addText(m[1], { x: 0.9, y: y + 0.66, w: 1.9, h: 0.36, fontSize: 10, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(m[3], { x: 3.7, y: y + 0.18, w: 8.85, h: 0.85, fontSize: 13, color: INK, valign: "middle", margin: 0 });
});
footer(s, "Models");

// ════════════════════════════════════════════════════════
// SLIDE 7 — LOGIC BEHIND GRADIENT BOOSTING
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, NAVY);
s.addText("THE LOGIC", { x: 0.6, y: 0.5, w: 9, h: 0.35, fontSize: 12, color: ACCENT, bold: true, charSpacing: 3, margin: 0 });
s.addText("Why gradient boosting works", { x: 0.6, y: 0.85, w: 12, h: 0.9, fontSize: 32, color: WHITE, bold: true, fontFace: "Georgia", margin: 0 });
const gb = [
  ["Tree 1", "Makes a rough prediction; we measure the error (residual) for every row"],
  ["Tree 2", "Trained on Tree 1's errors — it learns where Tree 1 was wrong"],
  ["Tree 3…500", "Each new tree corrects what all previous trees still get wrong"],
  ["Final", "Prediction = Tree1 + 0.05×Tree2 + 0.05×Tree3 + … (small steps avoid overshooting)"],
];
gb.forEach((g, i) => {
  const y = 1.95 + i * 1.0;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 2.1, h: 0.78, fill: { color: BLUE }, rectRadius: 0.08 });
  s.addText(g[0], { x: 0.6, y, w: 2.1, h: 0.78, fontSize: 16, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(g[1], { x: 3.0, y, w: 9.6, h: 0.78, fontSize: 14, color: ICE, valign: "middle", margin: 0 });
  if (i < 3) s.addText("↓", { x: 1.5, y: y + 0.74, w: 0.4, h: 0.3, fontSize: 16, color: ACCENT, bold: true, margin: 0 });
});
s.addText("Formally: Fₘ(x) = Fₘ₋₁(x) + ν·hₘ(x), where hₘ fits the negative gradient of the loss — with squared error, that gradient IS the residual. Trees capture “if-and-and” interactions a linear model cannot.", { x: 0.6, y: 6.05, w: 12.1, h: 0.7, fontSize: 12, color: ICE, italic: true, margin: 0 });

// ════════════════════════════════════════════════════════
// SLIDE 8 — RESULTS / MODEL COMPARISON
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Results"); title(s, "Every success criterion met");
const kpi = [
  ["7.05%", "WAPE", "Target < 8%", GREEN],
  ["−0.97%", "Bias", "Within ±2%", GREEN],
  ["0.977", "R²", "Target > 0.88", GREEN],
  ["15%", "Better vs Naive", "vs 8.27%", BLUE],
  ["94.7%", "Stores Calibrated", "1,636 / 1,727", ACCENT],
];
kpi.forEach((k, i) => {
  const x = 0.6 + i * 2.46;
  card(s, x, 1.8, 2.28, 1.95);
  s.addShape(p.shapes.RECTANGLE, { x, y: 1.8, w: 2.28, h: 0.09, fill: { color: k[3] } });
  s.addText(k[0], { x, y: 2.0, w: 2.28, h: 0.75, fontSize: 28, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(k[1], { x, y: 2.75, w: 2.28, h: 0.45, fontSize: 11.5, color: INK, bold: true, align: "center", margin: 0 });
  s.addText(k[2], { x, y: 3.18, w: 2.28, h: 0.45, fontSize: 10, color: GREEN, align: "center", margin: 0 });
});
s.addTable([
  [{ text: "Model", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "WAPE", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Bias", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "R²", options: { bold: true, color: WHITE, fill: { color: NAVY } } }],
  ["XGBoost (selected)", "7.05%", "−0.97%", "0.977"],
  ["LightGBM", "7.07%", "−1.11%", "0.977"],
  ["Ridge Regression", "7.11%", "+0.39%", "0.978"],
  ["Naive (lag-52)", "8.27%", "+0.33%", "0.965"],
], { x: 0.6, y: 4.0, w: 12.1, h: 2.7, fontSize: 14, color: INK, align: "center", valign: "middle",
     border: { pt: 0.5, color: ICE }, fill: { color: WHITE },
     rowH: [0.5, 0.52, 0.52, 0.52, 0.52] });
footer(s, "Results");

// ════════════════════════════════════════════════════════
// SLIDE 9 — FEATURE IMPORTANCE
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "What Drives Predictions"); title(s, "Feature importance — interpretable by design");
s.addChart(p.charts.BAR, [{
  name: "Importance %",
  labels: ["lag_1", "lag_4", "lag_52", "Wallflowers Depot", "lag_13", "housing_new_share", "Total Population", "Median Income"],
  values: [62.22, 29.63, 3.14, 0.70, 0.55, 0.40, 0.39, 0.38],
}], {
  x: 0.6, y: 1.8, w: 7.4, h: 4.9, barDir: "bar",
  chartColors: [NAVY], chartArea: { fill: { color: WHITE } },
  catAxisLabelColor: MUTE, valAxisLabelColor: MUTE,
  valGridLine: { color: ICE, size: 0.5 }, catGridLine: { style: "none" },
  showValue: true, dataLabelPosition: "outEnd", dataLabelColor: INK, dataLabelFormatCode: '0.0"%"',
  showLegend: false, valAxisHidden: true, barGapWidthPct: 40,
});
card(s, 8.4, 1.8, 4.3, 4.9, NAVY);
s.addText("How to read this", { x: 8.65, y: 2.05, w: 3.8, h: 0.45, fontSize: 16, color: ACCENT, bold: true, margin: 0 });
s.addText([
  { text: "lag_1 + lag_4 lead — recent store performance is the backbone of any short-horizon forecast.", options: { breakLine: true, paraSpaceAfter: 12 } },
  { text: "After lags, competition + housing + income earn a meaningful, interpretable share.", options: { breakLine: true, paraSpaceAfter: 12 } },
  { text: "Planners distrust black boxes — a 16-feature model they can read and defend builds trust.", options: {} },
], { x: 8.65, y: 2.55, w: 3.85, h: 4.0, fontSize: 13, color: ICE, lineSpacing: 18, valign: "top", margin: 0 });
footer(s, "Feature Importance");

// ════════════════════════════════════════════════════════
// SLIDE 10 — STORE-LEVEL ACCURACY LOOP
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "The Key Differentiator"); title(s, "Store-Level Accuracy Loop");
s.addText("Instead of one global score that hides offsetting errors, we compute per-store WAPE, Bias & quarterly bias — then classify every store for surgical planner action.", { x: 0.6, y: 1.7, w: 12.1, h: 0.8, fontSize: 14, color: INK, margin: 0 });
const cls = [
  ["1,636", "Well-Calibrated", "Within ±5% — trust the target directly", GREEN],
  ["60", "Under-Targeted", "Bias < −5% — store sandbagged, raise target", ORANGE],
  ["31", "Over-Targeted", "Bias > +5% — too aggressive, review", RED],
];
cls.forEach((c, i) => {
  const x = 0.6 + i * 4.12;
  card(s, x, 2.65, 3.9, 2.5);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.65, w: 3.9, h: 0.1, fill: { color: c[3] } });
  s.addText(c[0], { x, y: 2.85, w: 3.9, h: 0.9, fontSize: 40, color: c[3], bold: true, align: "center", margin: 0 });
  s.addText(c[1], { x, y: 3.75, w: 3.9, h: 0.5, fontSize: 16, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(c[2], { x: x + 0.2, y: 4.25, w: 3.5, h: 0.8, fontSize: 11.5, color: MUTE, align: "center", lineSpacing: 15, margin: 0 });
});
s.addText("Result: only ~91 stores need human review — vs. chain-wide manual re-planning today. This is the core business value.", { x: 0.6, y: 5.45, w: 12.1, h: 0.7, fontSize: 13, color: NAVY, italic: true, bold: true, align: "center", margin: 0 });
footer(s, "Accuracy Loop");

// ════════════════════════════════════════════════════════
// SLIDE 11 — ROLE OF STORE
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Strategic Overlay"); title(s, "Role-of-Store — five strategic segments");
s.addChart(p.charts.DOUGHNUT, [{
  name: "Roles", labels: ["High Growth", "Growth", "Neutral", "Maintain", "Defend"],
  values: [346, 345, 345, 346, 345],
}], {
  x: 0.6, y: 1.9, w: 5.2, h: 4.6,
  chartColors: ["1565C0", "43A047", "757575", "FF8F00", "C62828"],
  showLegend: true, legendPos: "b", legendColor: INK, legendFontSize: 11,
  dataLabelColor: WHITE, showValue: false, holeSize: 55,
});
const roles = [
  ["High Growth", "Expanding market + store outperforming → raise targets aggressively", "1565C0"],
  ["Growth / Neutral", "Moderate or stable signals → standard data-driven target", "43A047"],
  ["Maintain", "Aging market, steady demand → hold targets, monitor", "FF8F00"],
  ["Defend", "High competition + underperforming → conservative, protect share", "C62828"],
];
roles.forEach((r, i) => {
  const y = 1.95 + i * 1.16;
  card(s, 6.2, y, 6.5, 1.0);
  s.addShape(p.shapes.RECTANGLE, { x: 6.2, y, w: 0.09, h: 1.0, fill: { color: r[2] } });
  s.addText(r[0], { x: 6.45, y: y + 0.1, w: 6, h: 0.4, fontSize: 15, color: NAVY, bold: true, margin: 0 });
  s.addText(r[1], { x: 6.45, y: y + 0.48, w: 6.05, h: 0.45, fontSize: 12, color: INK, margin: 0 });
});
footer(s, "Role-of-Store");

// ════════════════════════════════════════════════════════
// SLIDE 12 — METHODOLOGY & INTEGRITY
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Model Integrity"); title(s, "How we kept the model honest");
const integ = [
  ["Leakage Prevention", ["Plan Sales USD (corr 0.986) — banned", "Invoice Count (corr 0.972) — banned", "Avg Ticket (corr 0.133) — banned", "All lags use shift(1) minimum"]],
  ["Time-Based Validation", ["Rolling split, never random", "Train on past, test on future", "22,439 holdout rows", "All 1,727 stores represented"]],
  ["Multicollinearity", ["8 income brackets → 1 strategic feature", "9 housing decades → 2 features", "Avoids unstable redundant inputs", "Each feature = a business concept"]],
];
integ.forEach((g, i) => {
  const x = 0.6 + i * 4.12;
  card(s, x, 1.85, 3.9, 4.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 1.85, w: 3.9, h: 0.6, fill: { color: NAVY } });
  s.addText(g[0], { x: x + 0.15, y: 1.85, w: 3.6, h: 0.6, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
  s.addText(g[1].map(t => ({ text: t, options: { bullet: { code: "2022", color: BLUE }, breakLine: true, paraSpaceAfter: 14 } })),
    { x: x + 0.25, y: 2.62, w: 3.5, h: 3.0, fontSize: 12.5, color: INK, valign: "top", margin: 0 });
});
footer(s, "Methodology");

// ════════════════════════════════════════════════════════
// SLIDE 13 — REFLECTIONS / NEXT STEPS
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Reflections"); title(s, "What worked & where we go next");
card(s, 0.6, 1.85, 6.0, 4.6, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.85, w: 6.0, h: 0.55, fill: { color: GREEN } });
s.addText("What worked well", { x: 0.8, y: 1.85, w: 5.6, h: 0.55, fontSize: 15, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  "Leakage-safe lag features turned a hard problem tractable",
  "Trimming to 16 features improved bias AND explainability",
  "The Accuracy Loop is the real differentiator vs. a generic forecast",
  "3 model families agreeing at ~7% = robust, not a fluke",
].map(t => ({ text: t, options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 16 } })),
  { x: 0.85, y: 2.6, w: 5.5, h: 3.7, fontSize: 13, color: INK, valign: "top", margin: 0 });
card(s, 6.9, 1.85, 5.8, 4.6, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 6.9, y: 1.85, w: 5.8, h: 0.55, fill: { color: BLUE } });
s.addText("Next steps", { x: 7.1, y: 1.85, w: 5.4, h: 0.55, fontSize: 15, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  "Recursive multi-week forecasting for next-FY targets",
  "Cold-start model for new stores (no lag history)",
  "Constrained optimization so targets sum to division plan",
  "Pilot on West Division → measure override-rate drop → scale",
].map(t => ({ text: t, options: { bullet: { code: "2022", color: BLUE }, breakLine: true, paraSpaceAfter: 16 } })),
  { x: 7.15, y: 2.6, w: 5.35, h: 3.7, fontSize: 13, color: INK, valign: "top", margin: 0 });
footer(s, "Reflections");

// ════════════════════════════════════════════════════════
// SLIDE 14 — CLOSING
// ════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, NAVY);
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: ACCENT } });
s.addShape(p.shapes.OVAL, { x: -2, y: 4.0, w: 5.5, h: 5.5, fill: { color: NAVY2 } });
s.addText("Thank You", { x: 0.8, y: 1.55, w: 9, h: 1.1, fontSize: 48, color: WHITE, bold: true, fontFace: "Georgia", margin: 0 });
s.addText("From a flat heuristic to a transparent, store-specific, validated ML targeting system.", { x: 0.8, y: 2.7, w: 11.5, h: 0.7, fontSize: 17, color: ICE, italic: true, margin: 0 });
const close = [["7.05%", "WAPE"], ["−0.97%", "Bias"], ["94.7%", "Calibrated"], ["15%", "vs Naive"]];
close.forEach((c, i) => {
  const x = 0.8 + i * 3.05;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 3.95, w: 2.8, h: 1.7, fill: { color: NAVY2 }, line: { color: ACCENT, width: 1.5 }, rectRadius: 0.1 });
  s.addText(c[0], { x, y: 4.2, w: 2.8, h: 0.85, fontSize: 32, color: ACCENT, bold: true, align: "center", margin: 0 });
  s.addText(c[1], { x, y: 5.05, w: 2.8, h: 0.45, fontSize: 14, color: WHITE, bold: true, align: "center", margin: 0 });
});
s.addText("Capstone 8  ·  Group 8  ·  IIM Calcutta APAL02   |   Live demo: localhost:8501   |   github.com/nishthaspeakx/capstone_8", { x: 0.8, y: 6.4, w: 12, h: 0.5, fontSize: 12, color: ICE, margin: 0 });

p.writeFile({ fileName: "outputs/Capstone8_Final_Presentation.pptx" }).then(() => console.log("PPTX written"));
