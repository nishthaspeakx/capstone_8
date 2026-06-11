// Capstone 8 — FINAL Capstone Presentation Deck
// Lowe's Store-Level Sales Target Model
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Group 8 — IIM Calcutta APAL02";
p.title = "Lowe's Store-Level Sales Target Model — Final Capstone Presentation";

// ── Palette ───────────────────────────────────────────────────
const NAVY = "003087", NAVY2 = "012A6E", BLUE = "0277BD", ICE = "CADCFC";
const ACCENT = "F4B400", GREEN = "2E7D32", RED = "C62828", ORANGE = "E65100";
const PURPLE = "6A1B9A", PINK = "C2185B", TEAL = "00796B";
const WHITE = "FFFFFF", PAPER = "F4F7FB", INK = "1A2332", MUTE = "5A6B7B";
const W = 13.333, H = 7.5;
let SLIDE_NUM = 1;  // Slide 1 is the title (no footer); footer() pre-increments so slide 2 shows "2/21"
const TOTAL_SLIDES = 21;

// ── Helpers ───────────────────────────────────────────────────
function makeShadow() { return { type: "outer", color: "0A1F44", blur: 8, offset: 3, angle: 135, opacity: 0.16 }; }
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, rectRadius: 0.08, shadow: makeShadow() });
}
function footer(s) {
  SLIDE_NUM++;
  s.addShape(p.shapes.RECTANGLE, { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: NAVY } });
  s.addText("Capstone 8 · Group 8 · IIM Calcutta APAL02", { x: 0.5, y: H - 0.32, w: 7, h: 0.32, fontSize: 9, color: ICE, valign: "middle", margin: 0 });
  s.addText(`Lowe's Sales Target Model  |  ${SLIDE_NUM} / ${TOTAL_SLIDES}`, { x: W - 4.5, y: H - 0.32, w: 4, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });
}
function kicker(s, t) {
  s.addText(t.toUpperCase(), { x: 0.6, y: 0.42, w: 9, h: 0.32, fontSize: 12, color: BLUE, bold: true, charSpacing: 3, margin: 0 });
}
function title(s, t) {
  s.addText(t, { x: 0.6, y: 0.72, w: 12.1, h: 0.85, fontSize: 30, color: NAVY, bold: true, fontFace: "Georgia", margin: 0 });
}
function bg(s, c) { s.background = { color: c }; }

// ════════════════════════════════════════════════════════════
// SLIDE 1 — TITLE  (with team members)
// ════════════════════════════════════════════════════════════
let s = p.addSlide(); bg(s, NAVY);
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: ACCENT } });
s.addShape(p.shapes.OVAL, { x: W - 4.2, y: -2.2, w: 6.5, h: 6.5, fill: { color: NAVY2 } });
s.addShape(p.shapes.OVAL, { x: W - 2.6, y: 3.4, w: 4.2, h: 4.2, fill: { color: BLUE, transparency: 60 } });

s.addText("FINAL CAPSTONE PRESENTATION  ·  GROUP 8  ·  IIM CALCUTTA APAL02", { x: 0.8, y: 0.85, w: 11, h: 0.4, fontSize: 13, color: ICE, bold: true, charSpacing: 3, margin: 0 });
s.addText("Lowe's Store-Level\nSales Target Model", { x: 0.8, y: 1.45, w: 9.8, h: 2.3, fontSize: 48, color: WHITE, bold: true, fontFace: "Georgia", lineSpacing: 52, margin: 0 });
s.addText("Replacing the “peanut-butter spread” with a supervised machine-learning model that learns local market dynamics", { x: 0.8, y: 3.85, w: 9.2, h: 0.8, fontSize: 16, color: ICE, italic: true, margin: 0 });

// Team members card
card(s, 0.8, 4.9, 8.2, 2.0, NAVY2);
s.addText("TEAM MEMBERS", { x: 1.0, y: 5.0, w: 7.8, h: 0.35, fontSize: 11, color: ACCENT, bold: true, charSpacing: 3, margin: 0 });
const members = [
  ["Member 1", "Member 2", "Member 3", "Member 4"],
  ["Member 5", "Member 6", "Member 7", "Member 8"],
];
members.forEach((row, ri) => {
  row.forEach((name, ci) => {
    const x = 1.0 + ci * 1.95;
    const y = 5.4 + ri * 0.65;
    s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.08, h: 0.45, fill: { color: ACCENT } });
    s.addText(name, { x: x + 0.18, y: y, w: 1.7, h: 0.45, fontSize: 13, color: WHITE, bold: true, valign: "middle", margin: 0 });
  });
});

s.addText("github.com/nishthaspeakx/capstone_8", { x: 0.8, y: 7.1, w: 8, h: 0.3, fontSize: 11, color: ICE, italic: true, margin: 0 });

// ════════════════════════════════════════════════════════════
// SLIDE 2 — AGENDA
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Today's Talk"); title(s, "Agenda");
const agenda = [
  ["01", "The Problem", "Why current targets fail planners"],
  ["02", "Our Approach", "Supervised ML + Store Accuracy Loop"],
  ["03", "Dataset", "1,727 stores · 269K rows · FY23–FY25"],
  ["04", "Methodology", "165 → 40 → 16 features, 3 iterations"],
  ["05", "Model Selection", "XGBoost vs 3 alternatives"],
  ["06", "Results", "WAPE, Bias, calibration, segments"],
  ["07", "Business Impact", "Override workload: 1,727 → 91"],
  ["08", "What's Next", "Roadmap & deployment plan"],
];
agenda.forEach((a, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.7 + col * 6.1;
  const y = 1.8 + row * 1.25;
  card(s, x, y, 5.85, 1.1);
  s.addShape(p.shapes.OVAL, { x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6, fill: { color: NAVY } });
  s.addText(a[0], { x: x + 0.25, y: y + 0.25, w: 0.6, h: 0.6, fontSize: 14, color: ACCENT, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(a[1], { x: x + 1.0, y: y + 0.18, w: 4.7, h: 0.4, fontSize: 16, color: NAVY, bold: true, margin: 0 });
  s.addText(a[2], { x: x + 1.0, y: y + 0.6, w: 4.7, h: 0.35, fontSize: 11.5, color: MUTE, margin: 0 });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 3 — THE PROBLEM
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 01 · The Problem"); title(s, "The peanut-butter spread");
s.addText([
  { text: "How Lowe's sets store targets today: ", options: { bold: true, color: NAVY } },
  { text: "the total company plan is divided across ~1,727 stores using each store's 3-year historical sales share — a flat allocation that ignores local market reality.", options: { color: INK } },
], { x: 0.6, y: 1.75, w: 7.5, h: 1.3, fontSize: 15, lineSpacing: 23 });
[
  ["A booming new-construction suburb gets the SAME growth rate as a declining rural town", ORANGE],
  ["Demographic shifts, housing age, income, competition — all invisible to the method", ORANGE],
  ["Planners spend the entire year manually overriding wrong targets", RED],
].forEach((row, i) => {
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 3.2 + i * 0.85, w: 0.08, h: 0.65, fill: { color: row[1] } });
  s.addText(row[0], { x: 0.85, y: 3.2 + i * 0.85, w: 7.2, h: 0.65, fontSize: 14, color: INK, valign: "middle", margin: 0 });
});
card(s, 8.5, 1.75, 4.3, 3.1, NAVY);
s.addText("25.83%", { x: 8.5, y: 2.0, w: 4.3, h: 1.3, fontSize: 56, color: ACCENT, bold: true, align: "center", margin: 0 });
s.addText("of store-weeks miss target by\nmore than ±10% under the\ncurrent method", { x: 8.7, y: 3.35, w: 3.9, h: 1.2, fontSize: 14, color: WHITE, align: "center", lineSpacing: 19 });
s.addText("That's 1 in 4 store-weeks needing re-planning every cycle.", { x: 8.5, y: 5.0, w: 4.3, h: 0.4, fontSize: 12, color: MUTE, align: "center", italic: true });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 4 — OUR SOLUTION APPROACH
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 02 · Approach"); title(s, "Our solution: a supervised model + an accuracy loop");
const steps = [
  ["1", "Learn", "Train a supervised model on 269,412 store-week records to learn how local market + recent performance drive sales", BLUE],
  ["2", "Predict", "Generate store-specific, data-driven sales targets — not a flat chain-wide rate", GREEN],
  ["3", "Diagnose", "Store-Level Accuracy Loop flags exactly which stores are under- or over-targeted", ORANGE],
  ["4", "Act", "Role-of-Store segmentation turns one model into 5 planning playbooks for surgical overrides", PURPLE],
];
steps.forEach((st, i) => {
  const x = 0.6 + i * 3.12;
  card(s, x, 1.95, 2.9, 4.0);
  s.addShape(p.shapes.OVAL, { x: x + 1.1, y: 2.25, w: 0.7, h: 0.7, fill: { color: st[3] } });
  s.addText(st[0], { x: x + 1.1, y: 2.25, w: 0.7, h: 0.7, fontSize: 22, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(st[1], { x: x + 0.2, y: 3.1, w: 2.5, h: 0.5, fontSize: 18, color: st[3], bold: true, align: "center", margin: 0 });
  s.addText(st[2], { x: x + 0.25, y: 3.7, w: 2.4, h: 2.0, fontSize: 12, color: INK, align: "center", lineSpacing: 17, valign: "top", margin: 0 });
  if (i < 3) s.addText("→", { x: x + 2.78, y: 3.5, w: 0.5, h: 0.5, fontSize: 24, color: ACCENT, bold: true });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 5 — DATASET
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 03 · Dataset"); title(s, "269,412 store-weeks, fully validated");
const ds = [
  ["269,412", "Store-week rows"],
  ["1,727", "Unique stores"],
  ["3 years", "FY2023–FY2025"],
  ["194", "Raw columns"],
];
ds.forEach((st, i) => {
  const x = 0.6 + i * 3.12;
  card(s, x, 1.85, 2.9, 1.8);
  s.addText(st[0], { x: x, y: 2.05, w: 2.9, h: 0.85, fontSize: 32, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(st[1], { x: x, y: 2.9, w: 2.9, h: 0.55, fontSize: 12, color: MUTE, align: "center", margin: 0 });
});

card(s, 0.6, 4.0, 6.0, 2.7);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 4.0, w: 6.0, h: 0.5, fill: { color: NAVY } });
s.addText("What's in the data", { x: 0.8, y: 4.0, w: 5.8, h: 0.5, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  { text: "Sales metrics: Actual Sales USD, Plan Sales USD, Invoice Count, Avg Ticket", options: { bullet: { code: "2022", color: BLUE }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Store attributes: Sales floor size, garden center, urbanicity, CBSA", options: { bullet: { code: "2022", color: BLUE }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Trade-area demographics (Census CYE): 50+ variables", options: { bullet: { code: "2022", color: BLUE }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Competition: 17 named competitors × 5–6 distance bands = 98 cols", options: { bullet: { code: "2022", color: BLUE } } },
], { x: 0.85, y: 4.65, w: 5.6, h: 2.0, fontSize: 12, color: INK, valign: "top", margin: 0 });

card(s, 6.75, 4.0, 6.0, 2.7);
s.addShape(p.shapes.RECTANGLE, { x: 6.75, y: 4.0, w: 6.0, h: 0.5, fill: { color: NAVY } });
s.addText("Data integrity checks", { x: 6.95, y: 4.0, w: 5.8, h: 0.5, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  { text: "Rolling time-based split (train on past, test on future)", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Holdout: 19 Sep 2025 → 30 Jan 2026, 22,439 rows", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Leakage blacklist: Plan Sales USD, Invoice Count, Avg Ticket banned", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "12 zero-sales rows removed; 44,902 missing-target rows excluded", options: { bullet: { code: "2022", color: GREEN } } },
], { x: 7.0, y: 4.65, w: 5.6, h: 2.0, fontSize: 12, color: INK, valign: "top", margin: 0 });

footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 6 — METHODOLOGY (JOURNEY)
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 04 · Methodology"); title(s, "Our feature-engineering journey");
const journey = [
  ["1", "Raw Dataset", PURPLE, "194 cols, 269K rows",
   ["1,727 stores × 52 wks × 3 yrs", "Filtered identity & leakage", "→ 165 candidate features"]],
  ["2", "Phase 1 Set", BLUE, "165 → 40 features",
   ["Removed distance-band duplicates", "Dropped zero-variance competitors", "Selected by business-relevance"]],
  ["3", "First Iteration", ORANGE, "40-feature XGBoost",
   ["WAPE 6.21%, Bias −2.53%", "Multicollinearity identified", "Rolling features dominated 94%"]],
  ["4", "Reduce to 16", GREEN, "Business-relevance trim",
   ["Dropped roll_4, roll_13, Year, FW", "Collapsed 8 income bins → 3", "Collapsed 9 housing decades → 2"]],
  ["5", "Final Model", NAVY, "Production output",
   ["WAPE 7.05%, Bias −0.97%", "94.7% stores calibrated", "Override workload: 1,727 → 91"]],
];
journey.forEach((st, i) => {
  const x = 0.6 + i * 2.46;
  card(s, x, 1.8, 2.3, 4.85);
  s.addShape(p.shapes.OVAL, { x: x + 0.85, y: 2.0, w: 0.6, h: 0.6, fill: { color: st[2] } });
  s.addText(st[0], { x: x + 0.85, y: 2.0, w: 0.6, h: 0.6, fontSize: 20, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(st[1], { x: x + 0.1, y: 2.7, w: 2.1, h: 0.4, fontSize: 14, color: st[2], bold: true, align: "center", margin: 0 });
  s.addText(st[3], { x: x + 0.1, y: 3.1, w: 2.1, h: 0.45, fontSize: 10.5, color: MUTE, align: "center", italic: true, margin: 0 });
  s.addText(st[4].map(t => ({ text: t, options: { bullet: { code: "2022", color: st[2] }, breakLine: true, paraSpaceAfter: 7 } })),
    { x: x + 0.2, y: 3.65, w: 2.0, h: 2.9, fontSize: 9.5, color: INK, valign: "top", lineSpacing: 13, margin: 0 });
  if (i < 4) s.addText("→", { x: x + 2.2, y: 4.0, w: 0.4, h: 0.5, fontSize: 22, color: ACCENT, bold: true, align: "center", margin: 0 });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 7 — FEATURE ENGINEERING PRINCIPLES
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 04 · Methodology"); title(s, "Three rules of our feature engineering");
const rules = [
  ["1", "No Leakage", BLUE,
   "Never use information unavailable at prediction time.",
   ["All lags use shift(1) minimum", "Plan Sales, Invoice Count, Avg Ticket BANNED", "Programmatic guard in feature_engineering.py"]],
  ["2", "Reduce Redundancy", GREEN,
   "When raw features sum to ~100%, engineer 2–3 strategic combinations instead.",
   ["8 income brackets → 3 strategic shares", "9 housing decades → 2 strategic shares", "17 competitors → 1 composite + top-4"]],
  ["3", "Business Meaning", ORANGE,
   "Every feature should map to a business concept a planner can explain.",
   ["income_affluent = Pro/contractor proxy", "housing_new_share = new-build demand", "total_competitor_ta = market pressure"]],
];
rules.forEach((r, i) => {
  const x = 0.6 + i * 4.15;
  card(s, x, 1.85, 3.95, 5.0);
  s.addShape(p.shapes.OVAL, { x: x + 1.62, y: 2.05, w: 0.7, h: 0.7, fill: { color: r[2] } });
  s.addText(r[0], { x: x + 1.62, y: 2.05, w: 0.7, h: 0.7, fontSize: 22, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(r[1], { x: x + 0.2, y: 2.85, w: 3.55, h: 0.45, fontSize: 16, color: r[2], bold: true, align: "center", margin: 0 });
  s.addText(r[3], { x: x + 0.25, y: 3.35, w: 3.45, h: 0.95, fontSize: 11.5, color: INK, align: "center", italic: true, valign: "top", margin: 0 });
  s.addText(r[4].map(t => ({ text: t, options: { bullet: { code: "2022", color: r[2] }, breakLine: true, paraSpaceAfter: 7 } })),
    { x: x + 0.3, y: 4.4, w: 3.4, h: 2.4, fontSize: 10.5, color: INK, valign: "top", margin: 0 });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 8 — THE FINAL 16 FEATURES
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 04 · Methodology"); title(s, "The final 16 features — by group");
const groups = [
  ["Lag / Momentum (4)", BLUE,    ["lag_1 · last week (corr 0.98)", "lag_4 · monthly rhythm", "lag_13 · quarterly rhythm", "lag_52 · annual seasonality"]],
  ["Demand — Raw (5)",    PINK,   ["CYE Total Households", "Household Density / SqMi", "Median Household Income", "Total Housing Units", "Total Population"]],
  ["Demand — Engineered (3)", GREEN, ["income_affluent ($150K+)", "housing_new_share (post-2000)", "housing_old_share (pre-1969)"]],
  ["Competition + Store (4)", ORANGE,["Sister Store Count (TA)", "total_competitor_ta", "Wallflowers Depot (TA)", "Urbanicity (encoded)"]],
];
groups.forEach((g, i) => {
  const x = 0.6 + i * 3.12;
  card(s, x, 1.85, 2.9, 3.7);
  s.addShape(p.shapes.RECTANGLE, { x: x, y: 1.85, w: 2.9, h: 0.55, fill: { color: g[1] } });
  s.addText(g[0], { x: x + 0.1, y: 1.85, w: 2.7, h: 0.55, fontSize: 12.5, color: WHITE, bold: true, valign: "middle", margin: 0 });
  s.addText(g[2].map(t => ({ text: t, options: { bullet: { code: "2022", color: g[1] }, breakLine: true, paraSpaceAfter: 9 } })),
    { x: x + 0.2, y: 2.55, w: 2.6, h: 2.9, fontSize: 11.5, color: INK, valign: "top", margin: 0 });
});
s.addText("We deliberately dropped roll_4, roll_13, Year & Fiscal Week — they were so dominant (~94% importance) they masked every market signal. Bias improved to −0.97%.",
  { x: 0.6, y: 5.8, w: 12.1, h: 0.7, fontSize: 12.5, color: NAVY, italic: true, align: "center", margin: 0 });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 9 — MODELS CONSIDERED
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 05 · Model Selection"); title(s, "Four models, benchmarked head-to-head");
const mods = [
  ["XGBoost", "PRIMARY", GREEN, "Sequential boosted trees. Best WAPE + near-zero bias. Captures non-linear market interactions automatically.", "7.05% WAPE · −0.97% Bias"],
  ["LightGBM", "ROBUSTNESS", BLUE, "Leaf-wise boosting, faster on big data. Near-identical score — cross-validates the result is real, not a fluke.", "7.07% WAPE · −1.11% Bias"],
  ["Ridge", "LINEAR CONTROL", PURPLE, "L2-regularized linear regression. Sanity check: is the non-linear model even necessary? (It is.)", "7.11% WAPE · +0.39% Bias"],
  ["Naive (lag-52)", "BASELINE", MUTE, "This week = same week last year. The bar every real model must clear. We beat it by 15%.", "8.27% WAPE · +0.33% Bias"],
];
mods.forEach((m, i) => {
  const y = 1.8 + i * 1.27;
  card(s, 0.6, y, 12.1, 1.15);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.08, h: 1.15, fill: { color: m[2] } });
  s.addText(m[0], { x: 0.85, y: y + 0.12, w: 2.6, h: 0.5, fontSize: 19, color: NAVY, bold: true, margin: 0 });
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.9, y: y + 0.65, w: 1.9, h: 0.36, fill: { color: m[2] }, rectRadius: 0.18 });
  s.addText(m[1], { x: 0.9, y: y + 0.65, w: 1.9, h: 0.36, fontSize: 10, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(m[3], { x: 3.6, y: y + 0.15, w: 6.5, h: 0.85, fontSize: 12.5, color: INK, valign: "middle", margin: 0 });
  s.addText(m[4], { x: 10.2, y: y + 0.15, w: 2.4, h: 0.85, fontSize: 12, color: m[2], bold: true, valign: "middle", align: "right", margin: 0 });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 10 — WHY XGBOOST (LOGIC)
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, NAVY);
s.addText("THE LOGIC", { x: 0.6, y: 0.5, w: 9, h: 0.35, fontSize: 12, color: ACCENT, bold: true, charSpacing: 3, margin: 0 });
s.addText("Why gradient boosting works", { x: 0.6, y: 0.85, w: 12, h: 0.9, fontSize: 32, color: WHITE, bold: true, fontFace: "Georgia", margin: 0 });
const gb = [
  ["Tree 1", "Makes a rough prediction; we measure the error (residual) for every row"],
  ["Tree 2", "Trained on Tree 1's errors — it learns where Tree 1 was wrong"],
  ["Tree 3 … 500", "Each new tree corrects what all previous trees still get wrong"],
  ["Final", "Prediction = Tree1 + 0.05×Tree2 + 0.05×Tree3 + … (small steps avoid overshooting)"],
];
gb.forEach((g, i) => {
  const y = 1.95 + i * 1.0;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x: 0.6, y, w: 2.4, h: 0.78, fill: { color: BLUE }, rectRadius: 0.08 });
  s.addText(g[0], { x: 0.6, y, w: 2.4, h: 0.78, fontSize: 16, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(g[1], { x: 3.3, y, w: 9.4, h: 0.78, fontSize: 14, color: ICE, valign: "middle", margin: 0 });
  if (i < 3) s.addText("↓", { x: 1.65, y: y + 0.74, w: 0.4, h: 0.3, fontSize: 16, color: ACCENT, bold: true, margin: 0 });
});
s.addText("Formally: Fₘ(x) = Fₘ₋₁(x) + ν·hₘ(x), where hₘ fits the negative gradient of the loss. With squared error, that gradient IS the residual — so the intuition above is mathematically exact. Trees capture “if-and-and” interactions a linear model cannot.",
  { x: 0.6, y: 6.05, w: 12.1, h: 0.75, fontSize: 12, color: ICE, italic: true, margin: 0 });
SLIDE_NUM++;
s.addText(`Slide ${SLIDE_NUM} / ${TOTAL_SLIDES}`, { x: W - 1.5, y: H - 0.32, w: 1.3, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });

// ════════════════════════════════════════════════════════════
// SLIDE 11 — TRAIN/TEST METHODOLOGY
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 05 · Model Selection"); title(s, "Train / test methodology — keeping the model honest");

card(s, 0.6, 1.8, 6.0, 4.9);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.8, w: 6.0, h: 0.55, fill: { color: NAVY } });
s.addText("Rolling Time-Based Split", { x: 0.85, y: 1.8, w: 5.6, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  { text: "Training", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "16 Aug 2024 → 29 Aug 2025  ·  62,172 rows  ·  all 1,727 stores", options: { color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Holdout (Test)", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "19 Sep 2025 → 30 Jan 2026  ·  22,439 rows  ·  Q4 FY2025", options: { color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "Why not random?", options: { bold: true, color: NAVY, breakLine: true } },
  { text: "Random splits would leak future data into training. The model must predict the FUTURE from the PAST.", options: { color: INK } },
], { x: 0.85, y: 2.5, w: 5.6, h: 4.0, fontSize: 12, color: INK, valign: "top", lineSpacing: 18, margin: 0 });

card(s, 6.75, 1.8, 6.0, 4.9);
s.addShape(p.shapes.RECTANGLE, { x: 6.75, y: 1.8, w: 6.0, h: 0.55, fill: { color: RED } });
s.addText("Leakage Prevention", { x: 7.0, y: 1.8, w: 5.6, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  { text: "Three columns NEVER used as inputs:", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 10 } },
  { text: "Plan Sales USD (corr 0.986) — IS the answer", options: { bullet: { code: "2022", color: RED }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Invoice Count (corr 0.972) — same-period count", options: { bullet: { code: "2022", color: RED }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Avg Ticket (corr 0.133) — same-period decomposition", options: { bullet: { code: "2022", color: RED }, breakLine: true, paraSpaceAfter: 14 } },
  { text: "All lags use shift(1) minimum", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 7 } },
  { text: "Programmatic assertion raises error if breach", options: { bullet: { code: "2022", color: GREEN } } },
], { x: 7.0, y: 2.5, w: 5.6, h: 4.0, fontSize: 12, color: INK, valign: "top", lineSpacing: 17, margin: 0 });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 12 — HEADLINE RESULTS
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 06 · Results"); title(s, "Every success criterion met");
const kpis = [
  ["7.05%", "WAPE", "Target < 8%", GREEN],
  ["−0.97%", "Bias", "Within ±2%", GREEN],
  ["0.977", "R²", "Target > 0.88", GREEN],
  ["15%", "vs Naive", "Beats lag-52", BLUE],
  ["94.7%", "Calibrated", "1,636 / 1,727", ACCENT],
];
kpis.forEach((k, i) => {
  const x = 0.6 + i * 2.46;
  card(s, x, 1.75, 2.3, 2.0);
  s.addShape(p.shapes.RECTANGLE, { x, y: 1.75, w: 2.3, h: 0.1, fill: { color: k[3] } });
  s.addText(k[0], { x, y: 1.95, w: 2.3, h: 0.8, fontSize: 28, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(k[1], { x, y: 2.75, w: 2.3, h: 0.45, fontSize: 12, color: INK, bold: true, align: "center", margin: 0 });
  s.addText(k[2], { x, y: 3.2, w: 2.3, h: 0.45, fontSize: 10.5, color: GREEN, align: "center", margin: 0 });
});
s.addTable([
  [{ text: "Model", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "WAPE", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Bias", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "R²", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Verdict", options: { bold: true, color: WHITE, fill: { color: NAVY } } }],
  ["XGBoost (selected)", "7.05%", "−0.97%", "0.977", "Best balanced"],
  ["LightGBM", "7.07%", "−1.11%", "0.977", "Near-identical"],
  ["Ridge Regression", "7.11%", "+0.39%", "0.978", "Linear control"],
  ["Naive (lag-52)", "8.27%", "+0.33%", "0.965", "Baseline"],
], { x: 0.6, y: 4.0, w: 12.1, h: 2.7, fontSize: 13, color: INK, align: "center", valign: "middle",
     border: { pt: 0.5, color: ICE }, fill: { color: WHITE }, rowH: [0.5, 0.52, 0.52, 0.52, 0.52] });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 13 — FEATURE IMPORTANCE
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 06 · Results"); title(s, "What drives the predictions");
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
], { x: 8.65, y: 2.6, w: 3.85, h: 4.0, fontSize: 13, color: ICE, valign: "top", lineSpacing: 18, margin: 0 });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 14 — STORE-LEVEL ACCURACY LOOP
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 06 · Results"); title(s, "Store-Level Accuracy Loop — the differentiator");
s.addText("Instead of one global score that hides offsetting errors, we compute per-store WAPE, Bias & quarterly bias — then classify every store for surgical planner action.",
  { x: 0.6, y: 1.7, w: 12.1, h: 0.8, fontSize: 14, color: INK, margin: 0 });
const cls = [
  ["1,636", "Well-Calibrated", "Within ±5% — trust the target directly", GREEN],
  ["60", "Under-Targeted", "Bias < −5% — store sandbagged, raise target", ORANGE],
  ["31", "Over-Targeted", "Bias > +5% — too aggressive, review for headwinds", RED],
];
cls.forEach((c, i) => {
  const x = 0.6 + i * 4.12;
  card(s, x, 2.65, 3.9, 2.5);
  s.addShape(p.shapes.RECTANGLE, { x, y: 2.65, w: 3.9, h: 0.1, fill: { color: c[3] } });
  s.addText(c[0], { x, y: 2.85, w: 3.9, h: 0.9, fontSize: 40, color: c[3], bold: true, align: "center", margin: 0 });
  s.addText(c[1], { x, y: 3.75, w: 3.9, h: 0.5, fontSize: 16, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(c[2], { x: x + 0.2, y: 4.25, w: 3.5, h: 0.85, fontSize: 11.5, color: MUTE, align: "center", lineSpacing: 15, margin: 0 });
});
s.addText("Result: only ~91 stores need human review — vs. chain-wide manual re-planning today.",
  { x: 0.6, y: 5.45, w: 12.1, h: 0.5, fontSize: 13, color: NAVY, italic: true, bold: true, align: "center", margin: 0 });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 15 — ROLE OF STORE
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 06 · Results"); title(s, "Role-of-Store — one model, five planning playbooks");
s.addChart(p.charts.DOUGHNUT, [{
  name: "Roles", labels: ["High Growth", "Growth", "Neutral", "Maintain", "Defend"],
  values: [346, 345, 345, 346, 345],
}], {
  x: 0.6, y: 1.9, w: 5.2, h: 4.7,
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
  const y = 1.95 + i * 1.18;
  card(s, 6.2, y, 6.5, 1.02);
  s.addShape(p.shapes.RECTANGLE, { x: 6.2, y, w: 0.09, h: 1.02, fill: { color: r[2] } });
  s.addText(r[0], { x: 6.45, y: y + 0.1, w: 6, h: 0.4, fontSize: 15, color: NAVY, bold: true, margin: 0 });
  s.addText(r[1], { x: 6.45, y: y + 0.5, w: 6.05, h: 0.45, fontSize: 12, color: INK, margin: 0 });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 16 — BUSINESS IMPACT
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 07 · Business Impact"); title(s, "From 1,727 manual reviews → only 91");

card(s, 0.6, 1.75, 6.0, 3.15);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.75, w: 6.0, h: 0.55, fill: { color: RED } });
s.addText("Today — peanut-butter spread", { x: 0.85, y: 1.75, w: 5.6, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText("1,727 stores", { x: 0.85, y: 2.5, w: 5.5, h: 0.7, fontSize: 38, color: RED, bold: true, margin: 0 });
s.addText("require manual review every cycle", { x: 0.85, y: 3.2, w: 5.5, h: 0.4, fontSize: 13, color: INK, margin: 0 });
s.addText([
  { text: "25.83% of store-weeks miss by >±10%", options: { bullet: { code: "2022", color: RED }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Targets ignore local market dynamics", options: { bullet: { code: "2022", color: RED }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Planners spend the year overriding", options: { bullet: { code: "2022", color: RED } } },
], { x: 0.85, y: 3.65, w: 5.5, h: 1.2, fontSize: 11.5, color: INK, valign: "top", margin: 0 });

card(s, 6.75, 1.75, 6.0, 3.15);
s.addShape(p.shapes.RECTANGLE, { x: 6.75, y: 1.75, w: 6.0, h: 0.55, fill: { color: GREEN } });
s.addText("With the supervised model", { x: 7.0, y: 1.75, w: 5.6, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText("91 stores", { x: 7.0, y: 2.5, w: 5.5, h: 0.7, fontSize: 38, color: GREEN, bold: true, margin: 0 });
s.addText("need planner attention — a 95% workload drop", { x: 7.0, y: 3.2, w: 5.5, h: 0.4, fontSize: 13, color: INK, margin: 0 });
s.addText([
  { text: "1,636 stores well-calibrated (±5% bias)", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "60 under-targeted · 31 over-targeted — flagged automatically", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Chain plan still reconciles (bias near zero)", options: { bullet: { code: "2022", color: GREEN } } },
], { x: 7.0, y: 3.65, w: 5.5, h: 1.2, fontSize: 11.5, color: INK, valign: "top", margin: 0 });

card(s, 0.6, 5.05, 12.1, 1.65);
s.addText("BOTTOM-LINE BUSINESS VALUE", { x: 0.85, y: 5.15, w: 11.7, h: 0.35, fontSize: 11, color: NAVY, bold: true, charSpacing: 3, margin: 0 });
s.addText("A 95% reduction in planner override workload, near-zero chain-level bias, and a model whose drivers planners can read & defend — without requiring any new data inputs.",
  { x: 0.85, y: 5.55, w: 11.7, h: 1.0, fontSize: 14, color: INK, valign: "top", lineSpacing: 19, italic: true, margin: 0 });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 17 — LIMITATIONS / WHAT WE MISSED
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 07 · Business Impact"); title(s, "What the model still misses (the 91 stores)");
s.addText("Even the best model has blind spots. Understanding them tells us how human review adds value.",
  { x: 0.6, y: 1.7, w: 12.1, h: 0.5, fontSize: 13, color: MUTE, italic: true, margin: 0 });
const limits = [
  ["Local Events", ORANGE, "No event/promo calendar in the model — new highway opening, local fair, hurricane recovery."],
  ["Recent Renovations", ORANGE, "Sales-floor size is a static feature; mid-year remodels show as outliers."],
  ["Competitor Moves", ORANGE, "Competition counts are annual snapshots; mid-year closures/openings invisible."],
  ["Structural Breaks", RED, "Lags assume past pattern continues; new management or supply shocks break that."],
  ["Outlier Years", RED, "If FY2024 had an anomaly, lag_52 carries it forward as if it were normal."],
  ["Demographic Shifts Intra-Year", RED, "Census-based features are annual; mid-year inflows are invisible."],
];
limits.forEach((l, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.6 + col * 6.1;
  const y = 2.4 + row * 1.42;
  card(s, x, y, 5.85, 1.3);
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.08, h: 1.3, fill: { color: l[1] } });
  s.addText(l[0], { x: x + 0.25, y: y + 0.15, w: 5.5, h: 0.4, fontSize: 14, color: NAVY, bold: true, margin: 0 });
  s.addText(l[2], { x: x + 0.25, y: y + 0.55, w: 5.5, h: 0.7, fontSize: 11.5, color: INK, valign: "top", margin: 0 });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 18 — REFLECTIONS
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 07 · Reflections"); title(s, "What worked well & honest limitations");
card(s, 0.6, 1.85, 6.0, 4.7, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.85, w: 6.0, h: 0.55, fill: { color: GREEN } });
s.addText("What worked well", { x: 0.8, y: 1.85, w: 5.6, h: 0.55, fontSize: 15, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  "Leakage-safe lag features turned a hard problem tractable",
  "Trimming to 16 features improved bias AND explainability",
  "The Accuracy Loop is the real differentiator vs. a generic forecast",
  "3 model families agreeing at ~7% = robust, not a fluke",
  "Discipline on leakage (refusing Plan Sales USD)",
].map(t => ({ text: t, options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 14 } })),
  { x: 0.85, y: 2.6, w: 5.5, h: 3.8, fontSize: 12.5, color: INK, valign: "top", margin: 0 });

card(s, 6.9, 1.85, 5.8, 4.7, WHITE);
s.addShape(p.shapes.RECTANGLE, { x: 6.9, y: 1.85, w: 5.8, h: 0.55, fill: { color: ORANGE } });
s.addText("Honest limitations", { x: 7.1, y: 1.85, w: 5.4, h: 0.55, fontSize: 15, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  "Lag dominance: strong for existing stores; new stores need cold-start variant",
  "Pure week-ahead scoring (not multi-week recursive forecasting yet)",
  "Role-of-Store thresholds are heuristic (quantile-based)",
  "Demographics are annual snapshots; intra-year shifts not captured",
  "Event/promo calendar not yet integrated",
].map(t => ({ text: t, options: { bullet: { code: "2022", color: ORANGE }, breakLine: true, paraSpaceAfter: 14 } })),
  { x: 7.15, y: 2.6, w: 5.35, h: 3.8, fontSize: 12.5, color: INK, valign: "top", margin: 0 });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 19 — ROADMAP
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 08 · What's Next"); title(s, "Roadmap — closing the 91-store gap & scaling");
const pillars = [
  ["1", "Reason-Code Framework", BLUE,
   "Planners annotate the 91 off-target stores with 1 of 6 cause codes — building a labelled dataset of recurring miss patterns over 2-3 cycles."],
  ["2", "GenAI Explainability Layer", GREEN,
   "Gemini-powered, per-store, plain-English explanation: why this target, which features drove it, what segment, what action."],
  ["3", "Recursive Multi-Week Forecast", ORANGE,
   "Extend from week-ahead to next-FY forecasting: predict week 1 → feed as lag → predict week 2 → constrained sum to division plan."],
  ["4", "Cold-Start Model", PURPLE,
   "Demographics-only variant for new stores with no lag history — uses housing, income & competition to set the opening target."],
  ["5", "Pilot West Division", TEAL,
   "Run on 492 West stores · measure override-rate reduction vs current process · validate ROI · scale chain-wide."],
];
pillars.forEach((pl, i) => {
  const x = 0.6 + (i % 3) * 4.15;
  const y = 1.8 + Math.floor(i / 3) * 2.55;
  card(s, x, y, 3.95, 2.4);
  s.addShape(p.shapes.OVAL, { x: x + 0.2, y: y + 0.2, w: 0.55, h: 0.55, fill: { color: pl[2] } });
  s.addText(pl[0], { x: x + 0.2, y: y + 0.2, w: 0.55, h: 0.55, fontSize: 18, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(pl[1], { x: x + 0.9, y: y + 0.22, w: 2.95, h: 0.55, fontSize: 13, color: pl[2], bold: true, valign: "middle", margin: 0 });
  s.addText(pl[3], { x: x + 0.25, y: y + 0.85, w: 3.55, h: 1.5, fontSize: 11, color: INK, valign: "top", lineSpacing: 15, margin: 0 });
});
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 20 — LIVE DEMO
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, PAPER);
kicker(s, "Section 08 · Deployment"); title(s, "The interactive Streamlit demo app");
s.addText("Live, interactive web app — built in Streamlit, hosting the 16-feature XGBoost model + full Store-Level Accuracy Loop.",
  { x: 0.6, y: 1.7, w: 12.1, h: 0.6, fontSize: 14, color: INK, margin: 0 });

const demo = [
  ["Dataset summary", BLUE, "269K rows · 1,727 stores · 16 features · validation checks"],
  ["Model performance", GREEN, "5 hero KPIs · success-criteria checks · model comparison table"],
  ["Store-Level Accuracy Loop", ORANGE, "Filterable list of under/over-targeted stores · per-store drill-down"],
  ["Role-of-Store segmentation", PURPLE, "Pie + segment table · profiles per role"],
  ["Bias distribution & scatter", PINK, "Plotly charts: histogram of biases, predicted-vs-actual scatter"],
  ["Live CSV upload + score", TEAL, "Score new data in real time with the trained model · download results"],
];
demo.forEach((d, i) => {
  const col = i % 2;
  const row = Math.floor(i / 2);
  const x = 0.6 + col * 6.1;
  const y = 2.5 + row * 1.15;
  card(s, x, y, 5.85, 1.0);
  s.addShape(p.shapes.RECTANGLE, { x, y, w: 0.08, h: 1.0, fill: { color: d[1] } });
  s.addText(d[0], { x: x + 0.25, y: y + 0.13, w: 5.5, h: 0.4, fontSize: 13.5, color: NAVY, bold: true, margin: 0 });
  s.addText(d[2], { x: x + 0.25, y: y + 0.53, w: 5.5, h: 0.4, fontSize: 11, color: INK, valign: "top", margin: 0 });
});

s.addText("Live URL (local): http://localhost:8501   ·   Source: github.com/nishthaspeakx/capstone_8",
  { x: 0.6, y: 6.85, w: 12.1, h: 0.3, fontSize: 11, color: NAVY, bold: true, italic: true, align: "center", margin: 0 });
footer(s);

// ════════════════════════════════════════════════════════════
// SLIDE 21 — THANK YOU
// ════════════════════════════════════════════════════════════
s = p.addSlide(); bg(s, NAVY);
s.addShape(p.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: 0.18, fill: { color: ACCENT } });
s.addShape(p.shapes.OVAL, { x: -2, y: 4.0, w: 5.5, h: 5.5, fill: { color: NAVY2 } });
s.addText("Thank You", { x: 0.8, y: 1.4, w: 9, h: 1.1, fontSize: 48, color: WHITE, bold: true, fontFace: "Georgia", margin: 0 });
s.addText("Questions & discussion welcome", { x: 0.8, y: 2.55, w: 11, h: 0.5, fontSize: 18, color: ACCENT, italic: true, margin: 0 });
s.addText("From a flat heuristic → a transparent, store-specific, validated ML targeting system.",
  { x: 0.8, y: 3.15, w: 11.5, h: 0.7, fontSize: 15, color: ICE, italic: true, margin: 0 });

const close = [["7.05%", "WAPE"], ["−0.97%", "Bias"], ["94.7%", "Calibrated"], ["15%", "vs Naive"]];
close.forEach((c, i) => {
  const x = 0.8 + i * 3.05;
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y: 4.2, w: 2.8, h: 1.7, fill: { color: NAVY2 }, line: { color: ACCENT, width: 1.5 }, rectRadius: 0.1 });
  s.addText(c[0], { x, y: 4.45, w: 2.8, h: 0.85, fontSize: 32, color: ACCENT, bold: true, align: "center", margin: 0 });
  s.addText(c[1], { x, y: 5.3, w: 2.8, h: 0.45, fontSize: 14, color: WHITE, bold: true, align: "center", margin: 0 });
});

s.addText("Capstone 8  ·  Group 8  ·  IIM Calcutta APAL02   |   github.com/nishthaspeakx/capstone_8",
  { x: 0.8, y: 6.6, w: 12, h: 0.4, fontSize: 12, color: ICE, margin: 0 });
SLIDE_NUM++;
s.addText(`Slide ${SLIDE_NUM} / ${TOTAL_SLIDES}`, { x: W - 1.5, y: H - 0.32, w: 1.3, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });

p.writeFile({ fileName: "outputs/Capstone8_FINAL_Presentation.pptx" }).then(() => console.log("Final deck written"));
