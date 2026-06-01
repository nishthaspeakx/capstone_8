// Capstone 8 — Professor email deck (3 core + 1 appendix)
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Group 8 — IIM Calcutta APAL02";
p.title = "Lowe's Store-Level Sales Target — Professor Summary";

// Palette
const NAVY = "003087", NAVY2 = "012A6E", BLUE = "0277BD", ICE = "CADCFC";
const ACCENT = "F4B400", GREEN = "2E7D32", RED = "C62828", ORANGE = "E65100";
const PURPLE = "6A1B9A", PINK = "C2185B";
const WHITE = "FFFFFF", PAPER = "F4F7FB", INK = "1A2332", MUTE = "5A6B7B";
const W = 13.333, H = 7.5;

function makeShadow() { return { type: "outer", color: "0A1F44", blur: 8, offset: 3, angle: 135, opacity: 0.16 }; }
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, rectRadius: 0.08, shadow: makeShadow() });
}
function footer(s, n, total) {
  s.addShape(p.shapes.RECTANGLE, { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: NAVY } });
  s.addText("Capstone 8 · Group 8 · IIM Calcutta APAL02", { x: 0.5, y: H - 0.32, w: 7, h: 0.32, fontSize: 9, color: ICE, valign: "middle", margin: 0 });
  s.addText(`Lowe's Sales Target Model  |  Slide ${n} of ${total}`, { x: W - 4.5, y: H - 0.32, w: 4, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });
}
function kicker(s, t) {
  s.addText(t.toUpperCase(), { x: 0.6, y: 0.42, w: 9, h: 0.32, fontSize: 12, color: BLUE, bold: true, charSpacing: 3, margin: 0 });
}
function title(s, t) {
  s.addText(t, { x: 0.6, y: 0.72, w: 12.1, h: 0.85, fontSize: 30, color: NAVY, bold: true, fontFace: "Georgia", margin: 0 });
}
const TOTAL = 4;

// ════════════════════════════════════════════════════════
// SLIDE 1 — PROBLEM STATEMENT
// ════════════════════════════════════════════════════════
let s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Capstone 8 — Problem Statement"); title(s, "Why Lowe's targets miss reality");

// Left column — context
card(s, 0.6, 1.7, 6.2, 5.0);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.7, w: 6.2, h: 0.55, fill: { color: NAVY } });
s.addText("Context", { x: 0.85, y: 1.7, w: 5.8, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  { text: "Lowe's is a leading U.S. home-improvement retailer", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 4 } },
  { text: "~1,727 stores  ·  ~$85B annual revenue", options: { color: MUTE, breakLine: true, paraSpaceAfter: 14 } },
  { text: "How they set store targets today:", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 4 } },
  { text: "The total company plan is divided across all stores using each store's 3-year historical sales share — a flat “peanut-butter spread.”", options: { color: INK, breakLine: true, paraSpaceAfter: 14 } },
  { text: "The flaw:", options: { bold: true, color: NAVY, breakLine: true, paraSpaceAfter: 4 } },
  { text: "It ignores LOCAL market dynamics — population growth, income shifts, housing age, competitive pressure.", options: { color: INK } },
], { x: 0.85, y: 2.4, w: 5.7, h: 4.2, fontSize: 12, color: INK, valign: "top", lineSpacing: 17, margin: 0 });

// Right column — the impact stat
card(s, 7.0, 1.7, 5.75, 2.4, NAVY);
s.addText("25.83%", { x: 7.0, y: 1.95, w: 5.75, h: 1.2, fontSize: 64, color: ACCENT, bold: true, align: "center", margin: 0 });
s.addText("of store-weeks miss target by\nmore than ±10% today", { x: 7.0, y: 3.15, w: 5.75, h: 0.85, fontSize: 14, color: WHITE, align: "center", lineSpacing: 19, margin: 0 });

// Goals card
card(s, 7.0, 4.2, 5.75, 2.5);
s.addShape(p.shapes.RECTANGLE, { x: 7.0, y: 4.2, w: 5.75, h: 0.55, fill: { color: GREEN } });
s.addText("What we are solving for", { x: 7.2, y: 4.2, w: 5.4, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText([
  { text: "Replace the flat heuristic with a supervised ML model", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 8 } },
  { text: "Set store-specific targets that reflect local conditions", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 8 } },
  { text: "Diagnose under/over-targeted stores per cycle", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 8 } },
  { text: "Cut planner override workload meaningfully", options: { bullet: { code: "2022", color: GREEN } } },
], { x: 7.2, y: 4.9, w: 5.45, h: 1.75, fontSize: 11.5, color: INK, valign: "top", margin: 0 });

footer(s, 1, TOTAL);

// ════════════════════════════════════════════════════════
// SLIDE 2 — JOURNEY
// ════════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Our Journey"); title(s, "From 165 raw features to a final 16-feature model");

const steps = [
  ["1", "Raw Dataset", PURPLE, "194 cols, 269K rows",
   ["1,727 stores × 52 wks × 3 yrs (FY23–FY25)", "Demographics, competition, sales", "Filtered identity & leakage cols → 165 candidates"]],
  ["2", "Phase 1 Feature Set", BLUE, "165 → 40 features",
   ["Removed redundant distance bands", "Dropped zero-variance competitors", "Selected by business-relevance + correlation"]],
  ["3", "First Iteration", ORANGE, "40-feature XGBoost run",
   ["WAPE 6.21%, Bias −2.53%", "Identified multicollinearity (rolling features dominated 94%)", "Market signals were masked"]],
  ["4", "Reduce to 16", GREEN, "Business-relevance trim",
   ["Dropped roll_4, roll_13, Year, Fiscal Week", "Collapsed 8 income brackets → 3 strategic ones", "Collapsed 9 housing decades → 2 shares"]],
  ["5", "Final Output", NAVY, "Production model",
   ["WAPE 7.05%, Bias −0.97% (near-zero!)", "94.7% stores well-calibrated", "Override workload: 1,727 → 91 stores"]],
];

steps.forEach((st, i) => {
  const x = 0.6 + i * 2.46;
  card(s, x, 1.85, 2.3, 4.85);
  // Step number circle
  s.addShape(p.shapes.OVAL, { x: x + 0.85, y: 2.05, w: 0.6, h: 0.6, fill: { color: st[2] } });
  s.addText(st[0], { x: x + 0.85, y: 2.05, w: 0.6, h: 0.6, fontSize: 20, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  // Step title
  s.addText(st[1], { x: x + 0.1, y: 2.75, w: 2.1, h: 0.4, fontSize: 14, color: st[2], bold: true, align: "center", margin: 0 });
  // Sub-label
  s.addText(st[3], { x: x + 0.1, y: 3.15, w: 2.1, h: 0.45, fontSize: 10.5, color: MUTE, align: "center", italic: true, margin: 0 });
  // Bullets
  s.addText(st[4].map(t => ({ text: t, options: { bullet: { code: "2022", color: st[2] }, breakLine: true, paraSpaceAfter: 7 } })),
    { x: x + 0.2, y: 3.7, w: 2.0, h: 2.9, fontSize: 9.5, color: INK, valign: "top", lineSpacing: 13, margin: 0 });
  // Arrow between cards
  if (i < 4) {
    s.addText("→", { x: x + 2.2, y: 4.0, w: 0.4, h: 0.5, fontSize: 22, color: ACCENT, bold: true, align: "center", margin: 0 });
  }
});

// Iteration count strip
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 6.85, w: 12.1, h: 0.18, fill: { color: NAVY } });
s.addText("Total of 3 modeling iterations  ·  Each step validated on the holdout set  ·  Driven by both data signals and business interpretability",
  { x: 0.6, y: 6.85, w: 12.1, h: 0.18, fontSize: 10, color: WHITE, italic: true, align: "center", valign: "middle", margin: 0 });

footer(s, 2, TOTAL);

// ════════════════════════════════════════════════════════
// SLIDE 3 — MODEL OUTPUT SUMMARY
// ════════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Output Summary"); title(s, "What the final model delivers");

// KPI row
const kpis = [
  ["7.05%", "WAPE", "Target < 8%", GREEN],
  ["−0.97%", "Bias", "Within ±2%", GREEN],
  ["0.977", "R²", "Target > 0.88", GREEN],
  ["94.7%", "Calibrated", "1,636 / 1,727 stores", ACCENT],
  ["15%", "vs Naive", "Beats lag-52 baseline", BLUE],
];
kpis.forEach((k, i) => {
  const x = 0.6 + i * 2.46;
  card(s, x, 1.7, 2.3, 1.7);
  s.addShape(p.shapes.RECTANGLE, { x, y: 1.7, w: 2.3, h: 0.09, fill: { color: k[3] } });
  s.addText(k[0], { x, y: 1.9, w: 2.3, h: 0.7, fontSize: 26, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(k[1], { x, y: 2.6, w: 2.3, h: 0.4, fontSize: 12, color: INK, bold: true, align: "center", margin: 0 });
  s.addText(k[2], { x, y: 3.0, w: 2.3, h: 0.4, fontSize: 9.5, color: MUTE, align: "center", margin: 0 });
});

// Bottom-left: Store accuracy loop
card(s, 0.6, 3.7, 6.0, 3.1);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 3.7, w: 6.0, h: 0.5, fill: { color: NAVY } });
s.addText("Store-Level Accuracy Loop", { x: 0.85, y: 3.7, w: 5.7, h: 0.5, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });

const cls = [["1,636", "Well-Calibrated", GREEN], ["60", "Under-Targeted", ORANGE], ["31", "Over-Targeted", RED]];
cls.forEach((c, i) => {
  const cx = 0.75 + i * 1.97;
  s.addText(c[0], { x: cx, y: 4.4, w: 1.85, h: 0.65, fontSize: 30, color: c[2], bold: true, align: "center", margin: 0 });
  s.addText(c[1], { x: cx, y: 5.05, w: 1.85, h: 0.35, fontSize: 11, color: NAVY, bold: true, align: "center", margin: 0 });
});
s.addText("Only 91 stores need planner review — a ~95% workload reduction vs. chain-wide manual re-planning today.",
  { x: 0.85, y: 5.7, w: 5.7, h: 0.95, fontSize: 11, color: INK, italic: true, align: "center", valign: "top", margin: 0 });

// Bottom-right: Role-of-Store distribution
card(s, 6.75, 3.7, 6.0, 3.1);
s.addShape(p.shapes.RECTANGLE, { x: 6.75, y: 3.7, w: 6.0, h: 0.5, fill: { color: NAVY } });
s.addText("Role-of-Store — 5 Strategic Segments", { x: 7.0, y: 3.7, w: 5.7, h: 0.5, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
const roles = [
  ["High Growth", 346, "1565C0"], ["Growth", 345, "43A047"], ["Neutral", 345, "757575"],
  ["Maintain", 346, "FF8F00"], ["Defend", 345, "C62828"]
];
roles.forEach((r, i) => {
  const ry = 4.35 + i * 0.46;
  s.addShape(p.shapes.RECTANGLE, { x: 6.95, y: ry, w: 0.15, h: 0.3, fill: { color: r[2] } });
  s.addText(r[0], { x: 7.2, y: ry - 0.02, w: 2.4, h: 0.34, fontSize: 12, color: NAVY, bold: true, valign: "middle", margin: 0 });
  s.addText(`${r[1]} stores`, { x: 9.6, y: ry - 0.02, w: 1.6, h: 0.34, fontSize: 11, color: INK, valign: "middle", margin: 0 });
  s.addText(`${(r[1] / 1727 * 100).toFixed(0)}%`, { x: 11.3, y: ry - 0.02, w: 1.3, h: 0.34, fontSize: 11, color: MUTE, valign: "middle", align: "right", margin: 0 });
});

footer(s, 3, TOTAL);

// ════════════════════════════════════════════════════════
// SLIDE 4 — APPENDIX
// ════════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Appendix"); title(s, "Definitions — features & acronyms");

// Left: Feature definitions
card(s, 0.6, 1.7, 7.4, 5.0);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 1.7, w: 7.4, h: 0.5, fill: { color: NAVY } });
s.addText("The 16 Features", { x: 0.85, y: 1.7, w: 7.0, h: 0.5, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });

s.addTable([
  [{ text: "#", options: { bold: true, color: WHITE, fill: { color: NAVY2 } } },
   { text: "Feature", options: { bold: true, color: WHITE, fill: { color: NAVY2 } } },
   { text: "What it means", options: { bold: true, color: WHITE, fill: { color: NAVY2 } } }],
  ["1", "lag_1", "Store's sales 1 week ago (strongest predictor)"],
  ["2", "lag_4", "Sales 4 weeks ago — monthly rhythm"],
  ["3", "lag_13", "Sales 13 weeks ago — quarterly rhythm"],
  ["4", "lag_52", "Sales 52 weeks ago — annual seasonality"],
  ["5", "Urbanicity", "Density tier (Metropolis → Remote, 7 levels)"],
  ["6", "CYE Total Households", "Households in store's trade area"],
  ["7", "HH Density / SqMi", "Households per square mile"],
  ["8", "Median HH Income", "Trade-area median income (purchasing power)"],
  ["9", "Total Housing Units", "All housing incl. vacant & new construction"],
  ["10", "Total Population", "Trade-area population"],
  ["11", "income_affluent", "% households earning $150K+"],
  ["12", "housing_old_share", "% homes built pre-1969 (repair demand)"],
  ["13", "housing_new_share", "% homes built post-2000 (new-build demand)"],
  ["14", "Sister Store Count", "Other Lowe's stores in trade area"],
  ["15", "total_competitor_ta", "Sum of all 17 competitor counts in trade area"],
  ["16", "Wallflowers Depot", "Most-prevalent competitor count (TA)"],
], { x: 0.85, y: 2.35, w: 6.9, h: 4.25, fontSize: 8.5, color: INK, valign: "middle",
     border: { pt: 0.4, color: ICE }, fill: { color: WHITE },
     colW: [0.45, 1.9, 4.55], rowH: 0.245 });

// Right: Acronyms
card(s, 8.15, 1.7, 4.6, 5.0);
s.addShape(p.shapes.RECTANGLE, { x: 8.15, y: 1.7, w: 4.6, h: 0.5, fill: { color: NAVY } });
s.addText("Acronyms & Metrics", { x: 8.4, y: 1.7, w: 4.2, h: 0.5, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });

s.addTable([
  [{ text: "Term", options: { bold: true, color: WHITE, fill: { color: NAVY2 } } },
   { text: "Definition", options: { bold: true, color: WHITE, fill: { color: NAVY2 } } }],
  ["WAPE", "Weighted Absolute % Error — dollar-weighted accuracy metric"],
  ["Bias", "Systematic over/under-prediction; (ΣPred−ΣAct)/ΣAct"],
  ["R²", "Share of sales variance explained by model"],
  ["RMSE", "Root Mean Squared Error — typical $ miss per week"],
  ["CYE", "Current Year Estimate (Census-based demographics)"],
  ["HH", "Household"],
  ["TA", "Trade Area — store's primary sales-catchment geography"],
  ["CBSA", "Core-Based Statistical Area (US Census)"],
  ["XGBoost", "Extreme Gradient Boosting — ensemble tree algorithm"],
  ["Lag_n", "Sales value shifted back by n weeks (no leakage)"],
  ["FY", "Fiscal Year (52 fiscal weeks)"],
  ["Holdout", "Test set the model never saw during training"],
], { x: 8.4, y: 2.35, w: 4.15, h: 4.25, fontSize: 8.5, color: INK, valign: "middle",
     border: { pt: 0.4, color: ICE }, fill: { color: WHITE },
     colW: [0.95, 3.2], rowH: 0.32 });

footer(s, 4, TOTAL);

p.writeFile({ fileName: "outputs/Capstone8_ProfessorDeck_v2.pptx" }).then(() => console.log("Deck written"));
