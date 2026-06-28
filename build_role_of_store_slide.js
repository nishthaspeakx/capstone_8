// Single improved Role-of-Store slide
// - Donut chart on left (5 segments × 20%)
// - 5 separate role cards on right (Growth and Neutral split out)
const pptxgen = require("pptxgenjs");
const p = new pptxgen();
p.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
p.author = "Group 8 — IIM Calcutta APAL02";
p.title = "Role-of-Store Segmentation — improved";

// Palette (matches final presentation deck)
const NAVY = "003087", NAVY2 = "012A6E", BLUE = "0277BD", ICE = "CADCFC";
const ACCENT = "F4B400", GREEN = "2E7D32", RED = "C62828", ORANGE = "E65100";
const WHITE = "FFFFFF", PAPER = "F4F7FB", INK = "1A2332", MUTE = "5A6B7B";
const W = 13.333, H = 7.5;

const makeShadow = () => ({ type: "outer", color: "0A1F44", blur: 8, offset: 3, angle: 135, opacity: 0.16 });

const s = p.addSlide(); s.background = { color: PAPER };

// Kicker + title
s.addText("SECTION 06 · RESULTS", { x: 0.6, y: 0.42, w: 9, h: 0.32, fontSize: 12, color: BLUE, bold: true, charSpacing: 3, margin: 0 });
s.addText("Role-of-Store — one model, five planning playbooks", { x: 0.6, y: 0.78, w: 12.1, h: 0.95, fontSize: 30, color: NAVY, bold: true, fontFace: "Georgia", margin: 0 });
s.addText("Every store gets a planning role based on growth signals + model bias", { x: 0.6, y: 1.65, w: 12.1, h: 0.4, fontSize: 14, color: MUTE, italic: true, margin: 0 });

// ── LEFT: Donut chart embedded as image (matches reference exactly) ─────────
s.addImage({
  path: "outputs/role_donut_reference.png",
  x: 0.5, y: 1.9, w: 5.6, h: 5.0,
  sizing: { type: "contain", w: 5.6, h: 5.0 }
});

// Small caption under the donut
s.addText("1,727 stores · ~20% each — quantile-based segmentation", {
  x: 0.4, y: 6.95, w: 5.8, h: 0.3, fontSize: 10, color: MUTE, italic: true, align: "center", margin: 0
});

// ── RIGHT: 5 separate role cards ────────────────────────────
const roles = [
  ["High Growth", "1565C0", "Expanding market + store outperforming → raise targets aggressively"],
  ["Growth",       "43A047", "Positive market signals + store running ahead of pace → push target up moderately"],
  ["Neutral",      "757575", "Balanced profile, no strong signal either way → use the standard data-driven target"],
  ["Maintain",     "FF8F00", "Aging market, steady demand → hold targets, monitor for change"],
  ["Defend",       "C62828", "High competition + underperforming → conservative target, protect share"],
];

const cardX = 6.55;
const cardW = 6.4;
const cardH = 0.84;
const cardGap = 0.16;
const startY = 2.2;

roles.forEach((r, i) => {
  const y = startY + i * (cardH + cardGap);
  // Card with rounded corners + shadow
  s.addShape(p.shapes.ROUNDED_RECTANGLE, {
    x: cardX, y, w: cardW, h: cardH,
    fill: { color: WHITE }, rectRadius: 0.08,
    shadow: makeShadow()
  });
  // Colored vertical accent bar on the left
  s.addShape(p.shapes.RECTANGLE, {
    x: cardX, y, w: 0.12, h: cardH, fill: { color: r[1] }
  });
  // Role name (large, bold)
  s.addText(r[0], {
    x: cardX + 0.3, y: y + 0.08, w: cardW - 0.4, h: 0.36,
    fontSize: 16, color: NAVY, bold: true, valign: "middle", margin: 0
  });
  // Role description
  s.addText(r[2], {
    x: cardX + 0.3, y: y + 0.42, w: cardW - 0.4, h: 0.4,
    fontSize: 11.5, color: INK, valign: "middle", margin: 0
  });
});

// ── Footer ──────────────────────────────────────────────────
s.addShape(p.shapes.RECTANGLE, { x: 0, y: H - 0.32, w: W, h: 0.32, fill: { color: NAVY } });
s.addText("Capstone 8 · Group 8 · IIM Calcutta APAL02", { x: 0.5, y: H - 0.32, w: 8, h: 0.32, fontSize: 9, color: ICE, valign: "middle", margin: 0 });
s.addText("Role-of-Store · improved", { x: W - 4.5, y: H - 0.32, w: 4, h: 0.32, fontSize: 9, color: ICE, align: "right", valign: "middle", margin: 0 });

p.writeFile({ fileName: "outputs/Capstone8_RoleOfStore_Improved.pptx" }).then(() => console.log("Slide written"));
