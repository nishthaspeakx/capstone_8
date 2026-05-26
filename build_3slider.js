// Capstone 8 — 3-Slider for Professor Email
// Lowe's Store-Level Sales Target Model
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Group 8 — IIM Calcutta APAL02";
p.title = "Lowe's Store-Level Sales Target — 3-Slide Summary";

// Palette
const NAVY = "003087", NAVY2 = "012A6E", BLUE = "0277BD", ICE = "CADCFC";
const ACCENT = "F4B400", GREEN = "2E7D32", RED = "C62828", ORANGE = "E65100";
const WHITE = "FFFFFF", PAPER = "F4F7FB", INK = "1A2332", MUTE = "5A6B7B";
const W = 13.333, H = 7.5;

function shadow() { return { type: "outer", color: "0A1F44", blur: 8, offset: 3, angle: 135, opacity: 0.16 }; }
function card(s, x, y, w, h, fill) {
  s.addShape(p.shapes.ROUNDED_RECTANGLE, { x, y, w, h, fill: { color: fill || WHITE }, rectRadius: 0.08, shadow: shadow() });
}
function footer(s, n) {
  s.addShape(p.shapes.RECTANGLE, { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: NAVY } });
  s.addText("Capstone 8 · Group 8 · IIM Calcutta APAL02", { x: 0.5, y: H - 0.32, w: 7, h: 0.32, fontSize: 9, color: ICE, valign: "middle", margin: 0 });
  s.addText(`Lowe's Sales Target Model  |  Slide ${n} of 3`, { x: W - 4.5, y: H - 0.32, w: 4, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });
}
function kicker(s, t) {
  s.addText(t.toUpperCase(), { x: 0.6, y: 0.42, w: 9, h: 0.32, fontSize: 12, color: BLUE, bold: true, charSpacing: 3, margin: 0 });
}
function title(s, t) {
  s.addText(t, { x: 0.6, y: 0.72, w: 12.1, h: 0.85, fontSize: 30, color: NAVY, bold: true, fontFace: "Georgia", margin: 0 });
}

// ════════════════════════════════════════════════════════
// SLIDE 1 — "From 1,727 manual reviews to 91"
// ════════════════════════════════════════════════════════
let s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Headline Result"); title(s, "From 1,727 manual reviews → only 91");

// Hero KPI strip
const kpis = [
  ["7.05%", "WAPE",       "Target < 8%",   GREEN],
  ["−0.97%","Bias",       "Within ±2%",    GREEN],
  ["0.977", "R²",         "Target > 0.88", GREEN],
  ["94.7%", "Calibrated", "1,636 / 1,727 stores", ACCENT],
];
kpis.forEach((k, i) => {
  const x = 0.6 + i * 3.12;
  card(s, x, 1.7, 2.9, 1.7);
  s.addShape(p.shapes.RECTANGLE, { x, y: 1.7, w: 2.9, h: 0.09, fill: { color: k[3] } });
  s.addText(k[0], { x, y: 1.9, w: 2.9, h: 0.7, fontSize: 28, color: NAVY, bold: true, align: "center", margin: 0 });
  s.addText(k[1], { x, y: 2.6, w: 2.9, h: 0.4, fontSize: 12, color: INK, bold: true, align: "center", margin: 0 });
  s.addText(k[2], { x, y: 3.0, w: 2.9, h: 0.4, fontSize: 10.5, color: MUTE, align: "center", margin: 0 });
});

// Before/After workload comparison
card(s, 0.6, 3.7, 6.0, 3.15);
s.addShape(p.shapes.RECTANGLE, { x: 0.6, y: 3.7, w: 6.0, h: 0.55, fill: { color: RED } });
s.addText("Today — peanut-butter spread", { x: 0.85, y: 3.7, w: 5.6, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText("1,727 stores", { x: 0.85, y: 4.45, w: 5.5, h: 0.7, fontSize: 38, color: RED, bold: true, margin: 0 });
s.addText("require manual review every cycle", { x: 0.85, y: 5.15, w: 5.5, h: 0.4, fontSize: 13, color: INK, margin: 0 });
s.addText([
  { text: "25.83% of store-weeks miss by >±10%", options: { bullet: { code: "2022", color: RED }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Targets ignore local market dynamics", options: { bullet: { code: "2022", color: RED }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Planners spend the year overriding", options: { bullet: { code: "2022", color: RED } } },
], { x: 0.85, y: 5.65, w: 5.5, h: 1.1, fontSize: 11, color: INK, valign: "top", margin: 0 });

card(s, 6.75, 3.7, 6.0, 3.15);
s.addShape(p.shapes.RECTANGLE, { x: 6.75, y: 3.7, w: 6.0, h: 0.55, fill: { color: GREEN } });
s.addText("With the supervised model", { x: 7.0, y: 3.7, w: 5.6, h: 0.55, fontSize: 14, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText("91 stores", { x: 7.0, y: 4.45, w: 5.5, h: 0.7, fontSize: 38, color: GREEN, bold: true, margin: 0 });
s.addText("need planner attention — a 95% workload drop", { x: 7.0, y: 5.15, w: 5.5, h: 0.4, fontSize: 13, color: INK, margin: 0 });
s.addText([
  { text: "1,636 stores well-calibrated (±5% bias)", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "60 under-targeted · 31 over-targeted — both flagged automatically", options: { bullet: { code: "2022", color: GREEN }, breakLine: true, paraSpaceAfter: 6 } },
  { text: "Chain plan still reconciles (bias near zero)", options: { bullet: { code: "2022", color: GREEN } } },
], { x: 7.0, y: 5.65, w: 5.5, h: 1.1, fontSize: 11, color: INK, valign: "top", margin: 0 });

footer(s, 1);

// ════════════════════════════════════════════════════════
// SLIDE 2 — "How the model thinks"
// ════════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Approach"); title(s, "How the model thinks — 16 features, XGBoost");

// Left: feature groups (compact)
const groups = [
  ["Lag / Momentum (4)",      BLUE,   "lag_1 · lag_4 · lag_13 · lag_52"],
  ["Demand — Raw (5)",        "C2185B","Households · Density · Income · Housing Units · Population"],
  ["Demand — Engineered (3)", GREEN,  "income_affluent · housing_new_share · housing_old_share"],
  ["Competition + Store (4)", ORANGE, "Sister stores · total competitors · Wallflowers Depot · Urbanicity"],
];
groups.forEach((g, i) => {
  const y = 1.7 + i * 0.78;
  card(s, 0.6, y, 6.3, 0.68);
  s.addShape(p.shapes.RECTANGLE, { x: 0.6, y, w: 0.09, h: 0.68, fill: { color: g[1] } });
  s.addText(g[0], { x: 0.8, y: y + 0.05, w: 6.0, h: 0.3, fontSize: 12, color: NAVY, bold: true, margin: 0 });
  s.addText(g[2], { x: 0.8, y: y + 0.34, w: 6.0, h: 0.3, fontSize: 10.5, color: INK, margin: 0 });
});

// WAPE / Bias mini explainers
const wb = [
  ["WAPE 7.05%", "Of every $100 of actual sales, the model misses by $7.05 (in either direction). Weighted by sales — dollar accuracy."],
  ["Bias −0.97%", "Model is essentially unbiased — does not systematically over- or under-commit. Chain plan reconciles cleanly."],
];
wb.forEach((w, i) => {
  const y = 4.85 + i * 0.92;
  card(s, 0.6, y, 6.3, 0.82);
  s.addText(w[0], { x: 0.8, y: y + 0.08, w: 1.7, h: 0.35, fontSize: 13, color: NAVY, bold: true, margin: 0 });
  s.addText(w[1], { x: 0.8, y: y + 0.42, w: 6.0, h: 0.38, fontSize: 10.5, color: INK, margin: 0 });
});

// Right: sample predictions table
s.addText("Sample predictions — Store S00001 (Starmont, GA)", { x: 7.05, y: 1.7, w: 6.0, h: 0.4, fontSize: 13, color: NAVY, bold: true, margin: 0 });
s.addTable([
  [{ text: "Source", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Week", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Actual", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Predicted", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
   { text: "Err %", options: { bold: true, color: WHITE, fill: { color: NAVY } } }],
  ["Train", "FY24 W28", "$1.70M", "$1.60M", "−5.8%"],
  ["Train", "FY24 W29", "$1.67M", "$1.64M", "−1.7%"],
  ["Train", "FY24 W30", "$1.75M", "$1.70M", "−2.4%"],
  [{ text: "Test", options: { fill: { color: "E8F5E9" } } }, "FY25 W33", "$1.55M", "$1.58M", "+1.7%"],
  [{ text: "Test", options: { fill: { color: "E8F5E9" } } }, "FY25 W34", "$1.61M", "$1.65M", "+2.3%"],
  [{ text: "Test", options: { fill: { color: "E8F5E9" } } }, "FY25 W37", "$1.59M", "$1.63M", "+2.5%"],
], { x: 7.05, y: 2.15, w: 6.0, h: 2.4, fontSize: 10.5, color: INK, align: "center", valign: "middle",
     border: { pt: 0.5, color: ICE }, fill: { color: WHITE }, rowH: 0.34 });

// Train vs Test gap card
card(s, 7.05, 4.7, 6.0, 2.07);
s.addShape(p.shapes.RECTANGLE, { x: 7.05, y: 4.7, w: 6.0, h: 0.5, fill: { color: NAVY } });
s.addText("Why the small Train→Test gap matters", { x: 7.25, y: 4.7, w: 5.7, h: 0.5, fontSize: 12, color: WHITE, bold: true, valign: "middle", margin: 0 });
s.addText("Train WAPE 6.62%   →   Test WAPE 7.05%", { x: 7.25, y: 5.3, w: 5.7, h: 0.4, fontSize: 15, color: NAVY, bold: true, margin: 0 });
s.addText("Tiny gap = the model genuinely generalizes to the future. No overfitting. It is not just memorizing the past — it is learning patterns that hold on weeks it has never seen.", { x: 7.25, y: 5.75, w: 5.7, h: 0.95, fontSize: 11, color: INK, valign: "top", margin: 0 });

footer(s, 2);

// ════════════════════════════════════════════════════════
// SLIDE 3 — "What's next"
// ════════════════════════════════════════════════════════
s = p.addSlide(); s.background = { color: PAPER };
kicker(s, "Roadmap"); title(s, "What's next — closing the 91-store gap");

// Three pillars
const pillars = [
  ["1", "Reason-Code Framework", BLUE,
   "For each of the 91 off-target stores, planners annotate one of 6 cause codes:",
   ["RENOVATION — format/floor change", "NEW_COMPETITOR — entry/exit", "LOCAL_EVENT — fair, road work, weather", "STRUCTURAL — new mgmt, mix change", "DEMOGRAPHIC SHIFT — sudden inflow", "DATA_GAP — missing feed"]],
  ["2", "GenAI Explainability Layer", GREEN,
   "On every store click in the dashboard, Gemini explains in plain English:",
   ["Why this exact sales target?", "Which 16 features drove it most?", "Why was it placed in this segment?", "What action should the planner consider?", "Plug-in already wired into the Streamlit app"]],
  ["3", "5-Segment Planning Playbook", ORANGE,
   "Net score (growth − risk) splits all stores into 5 quintiles:",
   ["High Growth (346) — raise targets aggressively", "Growth (345) — standard model target", "Neutral (345) — hold pattern", "Maintain (346) — steady, monitor", "Defend (345) — protect share, conservative"]],
];
pillars.forEach((pl, i) => {
  const x = 0.6 + i * 4.15;
  card(s, x, 1.7, 3.95, 5.1);
  s.addShape(p.shapes.OVAL, { x: x + 1.62, y: 1.9, w: 0.7, h: 0.7, fill: { color: pl[2] } });
  s.addText(pl[0], { x: x + 1.62, y: 1.9, w: 0.7, h: 0.7, fontSize: 22, color: WHITE, bold: true, align: "center", valign: "middle", margin: 0 });
  s.addText(pl[1], { x: x + 0.2, y: 2.7, w: 3.55, h: 0.45, fontSize: 14, color: pl[2], bold: true, align: "center", margin: 0 });
  s.addText(pl[3], { x: x + 0.25, y: 3.2, w: 3.45, h: 0.85, fontSize: 10.5, color: INK, align: "center", valign: "top", margin: 0 });
  s.addText(pl[4].map(t => ({ text: t, options: { bullet: { code: "2022", color: pl[2] }, breakLine: true, paraSpaceAfter: 5 } })),
    { x: x + 0.3, y: 4.15, w: 3.4, h: 2.5, fontSize: 10, color: INK, valign: "top", margin: 0 });
});

// Closing tag
s.addText("Pilot on West Division (492 stores)  →  measure override-rate drop  →  scale chain-wide  ·  Source: github.com/nishthaspeakx/capstone_8",
  { x: 0.6, y: 7.0, w: 12.1, h: 0.18, fontSize: 9.5, color: NAVY, italic: true, align: "center", margin: 0 });

footer(s, 3);

p.writeFile({ fileName: "outputs/Capstone8_3Slider_for_Prof.pptx" }).then(() => console.log("3-slider written"));
