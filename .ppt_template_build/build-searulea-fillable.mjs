import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";
import {
  A,
  C,
  FONT,
  W,
  H,
  M,
  CW,
  NONE,
  addImage,
  addRect,
  addText,
  addRule,
  setPlaceholder,
  bulletParagraphs,
  addNotes,
  writeBlob,
  createLayouts,
  slideWithLayout,
  setHeader,
} from "./build-searulea-template.mjs";

const TMP_DIR = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/.ppt_template_build/fillable";
const OUTPUT_DIR = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/PowerPoint_Template";
const FINAL_PPTX = path.join(OUTPUT_DIR, "SEARULEA_Ready_to_Fill_Template.pptx");
const RENDER_DIR = path.join(TMP_DIR, "rendered");
const LAYOUT_DIR = path.join(TMP_DIR, "layouts");
const ASSET_ROOT = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/assets";

const EXTRA = {
  packaging: path.join(ASSET_ROOT, "img", "mockups", "4_packaging.jpg"),
  stationery: path.join(ASSET_ROOT, "img", "mockups", "5_stationery.jpg"),
  truck: path.join(ASSET_ROOT, "img", "mockups", "7_truck.jpg"),
  office: path.join(ASSET_ROOT, "img", "mockups", "11_office_glass.jpg"),
  cover: path.join(ASSET_ROOT, "img", "mockups", "1_cover.jpg"),
  signage: path.join(ASSET_ROOT, "img", "mockups", "6_signage.jpg"),
  billboard: path.join(ASSET_ROOT, "img", "mockups", "8_billboard.jpg"),
  phone: path.join(ASSET_ROOT, "img", "mockups", "2_phone.jpg"),
  apparel: path.join(ASSET_ROOT, "img", "mockups", "3_apparel_logofix.jpg"),
  poleBanners: path.join(ASSET_ROOT, "img", "mockups", "9_polebanners.jpg"),
  toteCap: path.join(ASSET_ROOT, "img", "mockups", "10_tote_cap.jpg"),
  rollup: path.join(ASSET_ROOT, "img", "mockups", "12_rollup.jpg"),
};

const GUIDE = "User-provided SEARULEA brand guideline";
const DECK = "User-provided SEARULEA presentation PDF";

function fillText(slide, name, text, position, style = {}, fill = "none", line = NONE) {
  const shape = addText(slide, name, Array.isArray(text) || (text && typeof text === "object") ? "" : text, position, {
    typeface: style.typeface ?? FONT.body,
    fontSize: style.fontSize ?? 22,
    color: style.color ?? C.ink,
    bold: style.bold ?? false,
    italic: style.italic ?? false,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    lineSpacing: style.lineSpacing ?? 1.15,
    insets: style.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  }, fill, line);
  if (Array.isArray(text) || (text && typeof text === "object")) shape.text.set(text);
  return shape;
}

function promptTitle(slide, eyebrow = "SECTION / TOPIC", title = "[ADD A CLEAR, DECISION-LED TITLE]") {
  setHeader(slide, eyebrow, title);
}

function addPhotoLabel(slide, position, label = "REPLACE IMAGE") {
  addRect(slide, { left: position.left, top: position.top + position.height - 32, width: 164, height: 32 }, C.deep, `${label}-${position.left}-${position.top}`);
  fillText(slide, `${label}-text-${position.left}-${position.top}`, label, { left: position.left + 12, top: position.top + position.height - 25, width: 142, height: 18 }, { fontSize: 12, color: C.white, bold: true, lineSpacing: 1 });
}

async function photo(slide, file, position, alt, fit = "cover") {
  await addImage(slide, file, position, { fit, alt });
  addPhotoLabel(slide, position);
}

function threeBullets() {
  return bulletParagraphs([
    "[Add the first supporting point.]",
    "[Add the second supporting point.]",
    "[Add the third supporting point.]",
  ]);
}

function addMetric(slide, x, value, label, width = 330, color = C.deep) {
  fillText(slide, `metric-value-${x}-${value}`, value, { left: x, top: 300, width, height: 88 }, { typeface: FONT.display, fontSize: 66, color, bold: true, alignment: "center", lineSpacing: 1 });
  fillText(slide, `metric-label-${x}-${label}`, label, { left: x + 18, top: 414, width: width - 36, height: 76 }, { fontSize: 19, color: C.ink2, alignment: "center", lineSpacing: 1.12 });
}

function addPortraitPlaceholder(slide, name, position, fill = C.foam) {
  addRect(slide, position, fill, `${name}-portrait`, { style: "solid", fill: C.line, width: 1 });
  fillText(slide, `${name}-portrait-label`, "REPLACE\nPORTRAIT", { left: position.left + 20, top: position.top + position.height / 2 - 34, width: position.width - 40, height: 68 }, { fontSize: 15, color: C.tide, bold: true, alignment: "center", verticalAlignment: "middle", lineSpacing: 1.05 });
}

function styleTable(table, rows, cols, headerFill = C.deep) {
  table.borders.assign({ style: "solid", fill: C.line, width: 1 });
  table.styleOptions = { headerRow: true, bandedRows: false };
  for (let c = 0; c < cols; c += 1) {
    const cell = table.getCell(0, c);
    cell.fill = headerFill;
    cell.text.style = { typeface: FONT.body, fontSize: 15, color: C.white, bold: true, verticalAlignment: "middle", insets: { top: 8, right: 10, bottom: 8, left: 10 } };
  }
  for (let r = 1; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const cell = table.getCell(r, c);
      cell.fill = r % 2 === 0 ? "#F0F5F5" : C.pearl;
      cell.text.style = { typeface: FONT.body, fontSize: 15, color: c === 0 ? C.deep : C.ink, bold: c === 0, verticalAlignment: "middle", insets: { top: 8, right: 10, bottom: 8, left: 10 } };
    }
  }
}

async function createFillableSlides(presentation, layouts) {
  const slides = [];

  // 01 — Authoring guide
  {
    const slide = slideWithLayout(presentation, layouts.guide);
    setHeader(slide, "TEMPLATE GUIDE / KEEP FOR AUTHORS", "Fill. Duplicate. Present.");
    const cols = [M, 516, 954];
    const titles = ["Choose a page", "Replace the prompts", "Keep the hierarchy"];
    const bodies = [
      "Use the page index, then duplicate the closest variant for your story.",
      "Bracketed copy, image labels and example data are fields to replace.",
      "Keep Lora for the main statement and DM Sans for everything supporting it.",
    ];
    cols.forEach((x, i) => {
      addRule(slide, x, 244, 350, C.tide, `guide-rule-${i}`, 3);
      fillText(slide, `guide-number-${i}`, `0${i + 1}`, { left: x, top: 272, width: 90, height: 55 }, { typeface: FONT.display, fontSize: 48, color: C.tide, bold: true });
      fillText(slide, `guide-title-${i}`, titles[i], { left: x, top: 354, width: 350, height: 72 }, { typeface: FONT.display, fontSize: 30, color: C.deep, bold: true, lineSpacing: 1 });
      fillText(slide, `guide-body-${i}`, bodies[i], { left: x, top: 456, width: 350, height: 128 }, { fontSize: 20, color: C.ink2, lineSpacing: 1.16 });
    });
    fillText(slide, "guide-fonts", "Install the bundled Lora and DM Sans fonts before editing.", { left: M, top: 674, width: 720, height: 24 }, { fontSize: 15, color: C.tide, bold: true });
    addNotes(slide, "Keep this slide for internal authors or delete it before presenting.", [GUIDE]);
    slides.push(slide);
  }

  // 02 — Library index
  {
    const slide = slideWithLayout(presentation, layouts.single);
    setHeader(slide, "TEMPLATE INDEX / 57 PAGES", "Every common presentation page, ready to duplicate.");
    const groups = [
      ["03–06", "Covers", "4 variants"],
      ["07–09", "Agendas", "3 variants"],
      ["10–13", "Dividers", "4 variants"],
      ["14–18", "Narrative", "5 variants"],
      ["19–24", "Image-led", "6 variants"],
      ["25–28", "Metrics", "4 variants"],
      ["29–33", "Process", "5 variants"],
      ["34–39", "Charts", "6 variants"],
      ["40–43", "Comparison", "4 variants"],
      ["44–46", "Tables", "3 variants"],
      ["47–50", "People", "4 variants"],
      ["51–54", "Proof & place", "4 variants"],
      ["55–57", "Closing", "3 variants"],
    ];
    groups.forEach((group, i) => {
      const col = i < 7 ? 0 : 1;
      const row = col === 0 ? i : i - 7;
      const x = col === 0 ? M : 742;
      const y = 216 + row * 68;
      addRule(slide, x, y + 44, 540, C.line, `index-rule-${i}`, 1);
      fillText(slide, `index-pages-${i}`, group[0], { left: x, top: y, width: 90, height: 30 }, { fontSize: 15, color: C.tide, bold: true });
      fillText(slide, `index-name-${i}`, group[1], { left: x + 108, top: y - 5, width: 250, height: 38 }, { typeface: FONT.display, fontSize: 25, color: C.deep, bold: true });
      fillText(slide, `index-count-${i}`, group[2], { left: x + 400, top: y + 2, width: 140, height: 24 }, { fontSize: 15, color: C.ink2, alignment: "right" });
    });
    addNotes(slide, "Use this index while authoring; delete it from the client-facing presentation.", [GUIDE]);
    slides.push(slide);
  }

  // 03 — Cover / photo panel
  {
    const slide = presentation.slides.add();
    await addImage(slide, A.hero, { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "SEARULEA offshore cages" });
    addRect(slide, { left: 0, top: 0, width: 760, height: H }, C.deep, "cover-panel");
    await addImage(slide, A.logoWhite, { left: 82, top: 56, width: 312, height: 62 }, { alt: "SEARULEA logo" });
    slide.setLayout(layouts.coverPhoto);
    setPlaceholder(slide, "body", 0, "[PRESENTATION TYPE / CLIENT]");
    setPlaceholder(slide, "title", 0, "[ADD PRESENTATION\nTITLE]");
    setPlaceholder(slide, "subtitle", 0, "[Add one concise sentence describing the purpose or outcome.]");
    setPlaceholder(slide, "body", 1, "[Month Year] · [Presenter] · [Confidentiality]");
    addNotes(slide, "Photo-led cover. Replace the full-slide image and keep the title to two lines maximum.", [GUIDE, "User-provided hero-cages.jpg"]);
    slides.push(slide);
  }

  // 04 — Cover / dark motif
  {
    const slide = slideWithLayout(presentation, layouts.coverDark);
    await addImage(slide, A.logoWhite, { left: 82, top: 56, width: 312, height: 62 }, { alt: "SEARULEA logo" });
    await addImage(slide, A.spiralGradient, { left: 1040, top: 0, width: 400, height: 400 }, { alt: "SEARULEA gradient spiral" });
    setPlaceholder(slide, "body", 0, "[PRESENTATION TYPE / CLIENT]");
    setPlaceholder(slide, "title", 0, "[ADD DECK\nTITLE]");
    setPlaceholder(slide, "subtitle", 0, "[Add one concise sentence describing the purpose or outcome.]");
    setPlaceholder(slide, "body", 1, "[Month Year] · [Presenter] · [Confidentiality]");
    addNotes(slide, "Formal Deep Sea cover. Keep the gradient spiral unchanged and use amber only inside this approved motif.", [GUIDE, "User-provided SEARULEA gradient spiral"]);
    slides.push(slide);
  }

  // 05 — Cover / full-bleed image
  {
    const slide = presentation.slides.add();
    await addImage(slide, A.coast, { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "SEARULEA coastline" });
    addRect(slide, { left: 0, top: 540, width: W, height: 270 }, C.deep, "cover-bottom-band");
    await addImage(slide, A.logoWhite, { left: M, top: 584, width: 250, height: 50 }, { alt: "SEARULEA logo" });
    fillText(slide, "cover-full-label", "[PRESENTATION TYPE]", { left: 430, top: 584, width: 330, height: 22 }, { fontSize: 14, color: C.foam, bold: true });
    fillText(slide, "cover-full-title", "[ADD PRESENTATION TITLE]", { left: 430, top: 628, width: 850, height: 82 }, { typeface: FONT.display, fontSize: 52, color: C.pearl, bold: true, lineSpacing: 0.96 });
    fillText(slide, "cover-full-meta", "[Month Year] · [Presenter]", { left: 430, top: 738, width: 500, height: 22 }, { fontSize: 15, color: C.foam });
    addNotes(slide, "Full-bleed photographic cover. Replace the image and keep important subjects above the title band.", [GUIDE, "User-provided 5_coast_sovereignty.jpg"]);
    slides.push(slide);
  }

  // 06 — Cover / minimal Pearl
  {
    const slide = presentation.slides.add();
    slide.background.fill = C.pearl;
    await addImage(slide, A.logoTeal, { left: M, top: 62, width: 300, height: 60 }, { alt: "SEARULEA logo" });
    await addImage(slide, A.spiralGradient, { left: 1060, top: 70, width: 270, height: 270 }, { alt: "SEARULEA gradient spiral" });
    fillText(slide, "cover-min-label", "[PRESENTATION TYPE / CLIENT]", { left: M, top: 276, width: 560, height: 24 }, { fontSize: 15, color: C.tide, bold: true });
    fillText(slide, "cover-min-title", "[ADD PRESENTATION TITLE]", { left: M, top: 326, width: 940, height: 180 }, { typeface: FONT.display, fontSize: 76, color: C.deep, bold: true, lineSpacing: 0.94 });
    fillText(slide, "cover-min-subtitle", "[Add one concise sentence describing the purpose or outcome.]", { left: M, top: 554, width: 780, height: 72 }, { fontSize: 24, color: C.ink2, lineSpacing: 1.12 });
    addRule(slide, M, 694, CW, C.line, "cover-min-rule", 1);
    fillText(slide, "cover-min-meta", "[Month Year] · [Presenter] · [Confidentiality]", { left: M, top: 718, width: 600, height: 22 }, { fontSize: 14, color: C.ink2 });
    addNotes(slide, "Minimal Pearl cover for proposals, reports and formal updates.", [GUIDE, "User-provided SEARULEA gradient spiral"]);
    slides.push(slide);
  }

  // 07 — Agenda / numbered rows
  {
    const slide = slideWithLayout(presentation, layouts.agenda);
    promptTitle(slide, "PRESENTATION OVERVIEW", "[ADD A SIMPLE AGENDA TITLE]");
    for (let i = 0; i < 4; i += 1) {
      const y = 224 + i * 112;
      addRule(slide, M, y + 78, CW, C.line, `agenda-row-${i}`, 1);
      fillText(slide, `agenda-num-${i}`, `0${i + 1}`, { left: M, top: y, width: 90, height: 46 }, { typeface: FONT.display, fontSize: 35, color: C.tide, bold: true });
      fillText(slide, `agenda-topic-${i}`, "[SECTION TITLE]", { left: 220, top: y + 4, width: 430, height: 36 }, { typeface: FONT.display, fontSize: 27, color: C.deep, bold: true });
      fillText(slide, `agenda-desc-${i}`, "[Add a short description of what this section covers.]", { left: 690, top: y + 6, width: 620, height: 48 }, { fontSize: 19, color: C.ink2 });
    }
    addNotes(slide, "Classic four-part agenda. Add or remove rows while preserving the spacing rhythm.", [GUIDE]);
    slides.push(slide);
  }

  // 08 — Agenda / three chapters
  {
    const slide = slideWithLayout(presentation, layouts.agenda);
    promptTitle(slide, "PRESENTATION OVERVIEW", "[ADD A THREE-CHAPTER AGENDA TITLE]");
    [M, 516, 954].forEach((x, i) => {
      addRule(slide, x, 244, 350, i === 1 ? C.tide : C.lineDark, `agenda3-rule-${i}`, 4);
      fillText(slide, `agenda3-num-${i}`, `0${i + 1}`, { left: x, top: 278, width: 96, height: 56 }, { typeface: FONT.display, fontSize: 48, color: C.tide, bold: true });
      fillText(slide, `agenda3-title-${i}`, "[CHAPTER TITLE]", { left: x, top: 372, width: 350, height: 78 }, { typeface: FONT.display, fontSize: 31, color: C.deep, bold: true, lineSpacing: 1 });
      fillText(slide, `agenda3-body-${i}`, "[Add one or two lines describing this chapter.]", { left: x, top: 480, width: 340, height: 110 }, { fontSize: 20, color: C.ink2 });
    });
    addNotes(slide, "Three-chapter agenda for concise presentations.", [GUIDE]);
    slides.push(slide);
  }

  // 09 — Agenda / journey
  {
    const slide = slideWithLayout(presentation, layouts.agenda);
    promptTitle(slide, "PRESENTATION OVERVIEW", "[ADD A JOURNEY-STYLE AGENDA TITLE]");
    addRule(slide, 170, 418, 1100, C.lineDark, "agenda-journey-line", 3);
    const xs = [190, 450, 710, 970, 1230];
    xs.forEach((x, i) => {
      addRect(slide, { left: x - 18, top: 400, width: 36, height: 36 }, i === 0 ? C.tide : C.pearl, `agenda-journey-node-${i}`, { style: "solid", fill: C.tide, width: 3 });
      fillText(slide, `agenda-journey-num-${i}`, `0${i + 1}`, { left: x - 56, top: 276, width: 112, height: 44 }, { typeface: FONT.display, fontSize: 34, color: C.tide, bold: true, alignment: "center" });
      fillText(slide, `agenda-journey-title-${i}`, "[STEP]", { left: x - 90, top: 482, width: 180, height: 34 }, { typeface: FONT.display, fontSize: 23, color: C.deep, bold: true, alignment: "center" });
      fillText(slide, `agenda-journey-body-${i}`, "[Short description]", { left: x - 105, top: 536, width: 210, height: 74 }, { fontSize: 16, color: C.ink2, alignment: "center" });
    });
    addNotes(slide, "Five-stage journey agenda. Keep the stage labels short.", [GUIDE]);
    slides.push(slide);
  }

  // 10 — Divider / Deep Sea motif
  {
    const slide = slideWithLayout(presentation, layouts.section);
    setPlaceholder(slide, "subtitle", 0, "[SECTION 01]");
    setPlaceholder(slide, "title", 0, "[ADD SECTION TITLE]");
    setPlaceholder(slide, "body", 0, "[Add one line that sets up the next chapter.]");
    addNotes(slide, "Primary section divider. Keep the title to two lines maximum.", [GUIDE, "User-provided SEARULEA Sea Foam spiral"]);
    slides.push(slide);
  }

  // 11 — Divider / photo
  {
    const slide = presentation.slides.add();
    await addImage(slide, A.offshore, { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "SEARULEA offshore operations" });
    addRect(slide, { left: 0, top: 0, width: 690, height: H }, C.deep, "divider-photo-panel");
    await addImage(slide, A.markWhite, { left: M, top: 68, width: 58, height: 58 }, { alt: "SEARULEA monogram" });
    fillText(slide, "divider-photo-number", "[SECTION 02]", { left: M, top: 280, width: 400, height: 24 }, { fontSize: 15, color: C.foam, bold: true });
    fillText(slide, "divider-photo-title", "[ADD SECTION TITLE]", { left: M, top: 330, width: 520, height: 170 }, { typeface: FONT.display, fontSize: 68, color: C.pearl, bold: true, lineSpacing: 0.94 });
    fillText(slide, "divider-photo-body", "[Add one line that sets up the next chapter.]", { left: M, top: 548, width: 500, height: 90 }, { fontSize: 23, color: C.foam });
    addNotes(slide, "Photographic section divider. Replace the image and preserve the Deep Sea panel.", [GUIDE, "User-provided 1_offshore_ops.jpg"]);
    slides.push(slide);
  }

  // 12 — Divider / Pearl minimal
  {
    const slide = presentation.slides.add();
    slide.background.fill = C.pearl;
    await addImage(slide, A.markTeal, { left: M, top: 70, width: 52, height: 52 }, { alt: "SEARULEA monogram" });
    addRule(slide, M, 262, 126, C.tide, "divider-minimal-rule", 4);
    fillText(slide, "divider-minimal-number", "[SECTION 03]", { left: M, top: 292, width: 420, height: 24 }, { fontSize: 15, color: C.tide, bold: true });
    fillText(slide, "divider-minimal-title", "[ADD SECTION TITLE]", { left: M, top: 344, width: 1020, height: 170 }, { typeface: FONT.display, fontSize: 76, color: C.deep, bold: true, lineSpacing: 0.94 });
    fillText(slide, "divider-minimal-body", "[Add one line that sets up the next chapter.]", { left: M, top: 568, width: 760, height: 72 }, { fontSize: 24, color: C.ink2 });
    addRule(slide, M, 752, CW, C.line, "divider-minimal-footer", 1);
    addNotes(slide, "Minimal Pearl section divider for quieter transitions.", [GUIDE]);
    slides.push(slide);
  }

  // 13 — Divider / Sea Foam split
  {
    const slide = slideWithLayout(presentation, layouts.metrics);
    addRect(slide, { left: 0, top: 0, width: 560, height: H }, C.deep, "divider-foam-panel");
    await addImage(slide, A.spiralFoam, { left: 22, top: 178, width: 470, height: 470 }, { alt: "SEARULEA Sea Foam spiral" });
    fillText(slide, "divider-foam-number", "[SECTION 04]", { left: 660, top: 270, width: 420, height: 24 }, { fontSize: 15, color: C.tide, bold: true });
    fillText(slide, "divider-foam-title", "[ADD SECTION TITLE]", { left: 660, top: 326, width: 650, height: 180 }, { typeface: FONT.display, fontSize: 67, color: C.deep, bold: true, lineSpacing: 0.94 });
    fillText(slide, "divider-foam-body", "[Add one line that sets up the next chapter.]", { left: 660, top: 558, width: 610, height: 86 }, { fontSize: 23, color: C.ink2 });
    addNotes(slide, "Sea Foam split divider for a more expressive brand transition.", [GUIDE, "User-provided SEARULEA Sea Foam spiral"]);
    slides.push(slide);
  }

  // 14 — Narrative / single column
  {
    const slide = slideWithLayout(presentation, layouts.single);
    promptTitle(slide);
    setPlaceholder(slide, "body", 0, [
      ["[Add a short opening paragraph that establishes the context.]"],
      ["[Use a second paragraph to explain the implication or decision.]"],
      ...threeBullets(),
    ]);
    addNotes(slide, "Single-column narrative. Aim for two short paragraphs and no more than three bullets.", [GUIDE]);
    slides.push(slide);
  }

  // 15 — Narrative / two columns
  {
    const slide = slideWithLayout(presentation, layouts.twoColumn);
    promptTitle(slide);
    setPlaceholder(slide, "body", 0, [[{ run: "[LEFT COLUMN HEADING]", textStyle: { bold: true, color: C.deep, fontSize: "26pt" } }], ["[Add the left-side argument, context or current-state explanation.]"], ...threeBullets()]);
    setPlaceholder(slide, "body", 1, [[{ run: "[RIGHT COLUMN HEADING]", textStyle: { bold: true, color: C.deep, fontSize: "26pt" } }], ["[Add the right-side argument, implication or future-state explanation.]"], ...threeBullets()]);
    addNotes(slide, "Two-column narrative. Use parallel structures on both sides.", [GUIDE]);
    slides.push(slide);
  }

  // 16 — Narrative / lead statement
  {
    const slide = slideWithLayout(presentation, layouts.statement);
    setPlaceholder(slide, "subtitle", 0, "[VISION / POSITIONING]");
    setPlaceholder(slide, "title", 0, "[ADD ONE DEFINING STATEMENT]");
    setPlaceholder(slide, "body", 0, "[Add one supporting sentence that turns the statement into a clear implication.]");
    addNotes(slide, "Use for a thesis, point of view or memorable chapter statement.", [GUIDE]);
    slides.push(slide);
  }

  // 17 — Narrative / three points
  {
    const slide = slideWithLayout(presentation, layouts.single);
    promptTitle(slide);
    [M, 516, 954].forEach((x, i) => {
      addRule(slide, x, 244, 350, i === 0 ? C.tide : C.lineDark, `threepoint-rule-${i}`, 3);
      fillText(slide, `threepoint-num-${i}`, `0${i + 1}`, { left: x, top: 276, width: 90, height: 50 }, { typeface: FONT.display, fontSize: 44, color: C.tide, bold: true });
      fillText(slide, `threepoint-title-${i}`, "[POINT TITLE]", { left: x, top: 362, width: 340, height: 72 }, { typeface: FONT.display, fontSize: 29, color: C.deep, bold: true, lineSpacing: 1 });
      fillText(slide, `threepoint-body-${i}`, "[Add two or three concise sentences explaining this point and why it matters.]", { left: x, top: 468, width: 340, height: 142 }, { fontSize: 19, color: C.ink2 });
    });
    addNotes(slide, "Three-point narrative. Keep all three points at similar depth.", [GUIDE]);
    slides.push(slide);
  }

  // 18 — Narrative / sidebar
  {
    const slide = slideWithLayout(presentation, layouts.single);
    promptTitle(slide);
    addRect(slide, { left: M, top: 224, width: 360, height: 420 }, C.foam, "sidebar-panel");
    fillText(slide, "sidebar-kicker", "[SIDEBAR LABEL]", { left: 112, top: 264, width: 280, height: 22 }, { fontSize: 14, color: C.tide, bold: true });
    fillText(slide, "sidebar-statement", "[Add a short key takeaway or definition.]", { left: 112, top: 322, width: 280, height: 190 }, { typeface: FONT.display, fontSize: 37, color: C.deep, bold: true, lineSpacing: 1 });
    fillText(slide, "sidebar-body", [
      ["[Add the main narrative here. Use two or three short paragraphs.]"],
      ["[Explain the implication, evidence or next decision.]"],
      ...threeBullets(),
    ], { left: 510, top: 236, width: 790, height: 400 }, { fontSize: 22, color: C.ink, lineSpacing: 1.18 });
    addNotes(slide, "Sidebar narrative. Use the colored panel for a definition, takeaway or important context.", [GUIDE]);
    slides.push(slide);
  }

  // 19 — Image left / text right
  {
    const slide = slideWithLayout(presentation, layouts.imageLeft);
    promptTitle(slide);
    await photo(slide, A.women, { left: M, top: 220, width: 590, height: 450 }, "SEARULEA team at work");
    setPlaceholder(slide, "body", 0, [
      [{ run: "[ADD A SUPPORTING SUBHEAD]", textStyle: { bold: true, color: C.deep, fontSize: "27pt" } }],
      ["[Add two or three concise sentences that explain what the image proves.]"],
      ...threeBullets(),
    ]);
    addNotes(slide, "Image-left story. Replace the image and use the text column to explain its relevance.", [GUIDE, "User-provided 3_women_searulea.jpg"]);
    slides.push(slide);
  }

  // 20 — Text left / image right
  {
    const slide = slideWithLayout(presentation, layouts.imageRight);
    promptTitle(slide);
    setPlaceholder(slide, "body", 0, [
      [{ run: "[ADD A SUPPORTING SUBHEAD]", textStyle: { bold: true, color: C.deep, fontSize: "27pt" } }],
      ["[Add two or three concise sentences that establish the context and implication.]"],
      ...threeBullets(),
    ]);
    await photo(slide, A.traceability, { left: 700, top: 220, width: 662, height: 450 }, "SEARULEA traceability technology");
    addNotes(slide, "Image-right story. Use when the narrative should lead before the visual evidence.", [GUIDE, "User-provided 4_traceability_tech.jpg"]);
    slides.push(slide);
  }

  // 21 — Full-bleed image with text panel
  {
    const slide = presentation.slides.add();
    await addImage(slide, A.port, { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "SEARULEA fresh product at port" });
    addRect(slide, { left: 0, top: 0, width: 610, height: H }, C.deep, "fullbleed-text-panel");
    await addImage(slide, A.markWhite, { left: M, top: 62, width: 52, height: 52 }, { alt: "SEARULEA monogram" });
    fillText(slide, "fullbleed-eyebrow", "[SECTION / TOPIC]", { left: M, top: 214, width: 430, height: 22 }, { fontSize: 14, color: C.foam, bold: true });
    fillText(slide, "fullbleed-title", "[ADD A STRONG IMAGE-LED TITLE]", { left: M, top: 266, width: 440, height: 190 }, { typeface: FONT.display, fontSize: 55, color: C.pearl, bold: true, lineSpacing: 0.96 });
    fillText(slide, "fullbleed-body", "[Add one short paragraph explaining why this image matters.]", { left: M, top: 506, width: 420, height: 116 }, { fontSize: 22, color: C.foam });
    addPhotoLabel(slide, { left: 610, top: 0, width: 830, height: H });
    addNotes(slide, "Full-bleed image story. Replace the image and keep the dark text panel to roughly two-fifths of the slide.", [GUIDE, "User-provided 2_fresh_at_port.jpg"]);
    slides.push(slide);
  }

  // 22 — Panoramic image with caption
  {
    const slide = slideWithLayout(presentation, layouts.gallery);
    promptTitle(slide);
    await photo(slide, A.coldchain, { left: M, top: 212, width: CW, height: 326 }, "SEARULEA cold-chain operations");
    fillText(slide, "panorama-caption-title", "[ADD A SHORT CAPTION HEADLINE]", { left: M, top: 578, width: 560, height: 42 }, { typeface: FONT.display, fontSize: 29, color: C.deep, bold: true });
    fillText(slide, "panorama-caption-body", "[Explain what the image shows and the implication the audience should take from it.]", { left: 690, top: 574, width: 646, height: 74 }, { fontSize: 19, color: C.ink2 });
    addNotes(slide, "Panoramic evidence page. Use a wide image with one concise caption and implication.", [GUIDE, "User-provided 6_team_coldchain.jpg"]);
    slides.push(slide);
  }

  // 23 — Two-image story
  {
    const slide = slideWithLayout(presentation, layouts.gallery);
    promptTitle(slide);
    await photo(slide, EXTRA.packaging, { left: M, top: 220, width: 610, height: 330 }, "SEARULEA packaging mockup");
    await photo(slide, EXTRA.truck, { left: 752, top: 220, width: 610, height: 330 }, "SEARULEA transport mockup");
    fillText(slide, "twoimage-title-a", "[LEFT IMAGE TITLE]", { left: M, top: 584, width: 560, height: 38 }, { typeface: FONT.display, fontSize: 27, color: C.deep, bold: true });
    fillText(slide, "twoimage-title-b", "[RIGHT IMAGE TITLE]", { left: 752, top: 584, width: 560, height: 38 }, { typeface: FONT.display, fontSize: 27, color: C.deep, bold: true });
    fillText(slide, "twoimage-caption-a", "[Add one sentence explaining the first image.]", { left: M, top: 636, width: 560, height: 50 }, { fontSize: 17, color: C.ink2 });
    fillText(slide, "twoimage-caption-b", "[Add one sentence explaining the second image.]", { left: 752, top: 636, width: 560, height: 50 }, { fontSize: 17, color: C.ink2 });
    addNotes(slide, "Two-image comparison or sequence. Use consistent crops and parallel captions.", [GUIDE, "User-provided SEARULEA packaging and truck mockups"]);
    slides.push(slide);
  }

  // 24 — Photo quote
  {
    const slide = presentation.slides.add();
    await addImage(slide, EXTRA.office, { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "SEARULEA office branding" });
    addRect(slide, { left: 0, top: 0, width: 720, height: H }, C.deep, "quote-panel");
    await addImage(slide, A.logoWhite, { left: 82, top: 56, width: 280, height: 56 }, { alt: "SEARULEA logo" });
    fillText(slide, "quote-eyebrow", "[PROOF / TESTIMONY]", { left: 82, top: 220, width: 520, height: 24 }, { fontSize: 15, color: C.foam, bold: true });
    fillText(slide, "quote-text", "“[ADD A CONCISE QUOTE OR PROOF POINT.]”", { left: 82, top: 284, width: 540, height: 286 }, { typeface: FONT.display, fontSize: 52, color: C.pearl, bold: true, lineSpacing: 0.98 });
    fillText(slide, "quote-source", "[Name] · [Role] · [Organisation]", { left: 84, top: 650, width: 520, height: 44 }, { fontSize: 18, color: C.foam, bold: true });
    addPhotoLabel(slide, { left: 720, top: 0, width: 720, height: H });
    addNotes(slide, "Photo quote. Verify the quote, speaker and image before presenting.", [GUIDE, "User-provided 11_office_glass.jpg"]);
    slides.push(slide);
  }

  // 25 — Metrics / three figures
  {
    const slide = slideWithLayout(presentation, layouts.metrics);
    promptTitle(slide, "KEY FIGURES / SNAPSHOT");
    [M, 516, 954].forEach((x, i) => {
      addRule(slide, x, 244, 350, i === 1 ? C.tide : C.lineDark, `metric3-rule-${i}`, 3);
      addMetric(slide, x, "[00]", "[Add the metric label and unit.]", 350, i === 1 ? C.tide : C.deep);
      fillText(slide, `metric3-note-${i}`, "[Optional one-line context]", { left: x + 18, top: 526, width: 314, height: 46 }, { fontSize: 15, color: C.ink2, alignment: "center" });
    });
    addNotes(slide, "Three-metric snapshot. Use values with similar visual weight and explain the unit in each label.", [GUIDE]);
    slides.push(slide);
  }

  // 26 — Metrics / four figures
  {
    const slide = slideWithLayout(presentation, layouts.metrics);
    promptTitle(slide, "KEY FIGURES / DASHBOARD");
    const xs = [M, 402, 726, 1050];
    xs.forEach((x, i) => {
      addRule(slide, x, 246, 264, i === 3 ? C.tide : C.lineDark, `metric4-rule-${i}`, 3);
      fillText(slide, `metric4-value-${i}`, "[00]", { left: x, top: 306, width: 264, height: 82 }, { typeface: FONT.display, fontSize: 58, color: i === 3 ? C.tide : C.deep, bold: true, alignment: "center" });
      fillText(slide, `metric4-label-${i}`, "[Metric label]", { left: x + 18, top: 420, width: 228, height: 70 }, { fontSize: 18, color: C.ink2, alignment: "center" });
      fillText(slide, `metric4-context-${i}`, "[Short context]", { left: x + 20, top: 520, width: 224, height: 48 }, { fontSize: 14, color: C.tide, bold: true, alignment: "center" });
    });
    addNotes(slide, "Four-metric dashboard. Keep the numbers short and use the final line for context, not another metric.", [GUIDE]);
    slides.push(slide);
  }

  // 27 — Metrics / hero number
  {
    const slide = slideWithLayout(presentation, layouts.statement);
    setPlaceholder(slide, "subtitle", 0, "[KEY FIGURE / OUTCOME]");
    setPlaceholder(slide, "title", 0, "[00%]");
    setPlaceholder(slide, "body", 0, "[Add one sentence explaining what the number means and why it matters.]");
    fillText(slide, "hero-metric-source", "[Optional period, baseline or source note]", { left: M, top: 690, width: 720, height: 22 }, { fontSize: 14, color: C.foam, bold: true });
    addNotes(slide, "Hero metric. Use one number only and include enough context to prevent misinterpretation.", [GUIDE]);
    slides.push(slide);
  }

  // 28 — Metrics / image split
  {
    const slide = slideWithLayout(presentation, layouts.metrics);
    promptTitle(slide, "KEY FIGURES / EVIDENCE");
    await photo(slide, EXTRA.cover, { left: M, top: 220, width: 610, height: 420 }, "SEARULEA cover mockup");
    const metricYs = [248, 414, 580];
    metricYs.forEach((y, i) => {
      addRule(slide, 780, y + 108, 520, C.line, `metric-image-rule-${i}`, 1);
      fillText(slide, `metric-image-value-${i}`, "[00]", { left: 780, top: y, width: 180, height: 72 }, { typeface: FONT.display, fontSize: 50, color: i === 0 ? C.tide : C.deep, bold: true });
      fillText(slide, `metric-image-label-${i}`, "[Metric label and concise context]", { left: 990, top: y + 8, width: 310, height: 64 }, { fontSize: 19, color: C.ink2 });
    });
    addNotes(slide, "Image-plus-metrics page. Use the image for evidence and the right rail for three related figures.", [GUIDE, "User-provided SEARULEA cover mockup"]);
    slides.push(slide);
  }

  // 29 — Process / three steps
  {
    const slide = slideWithLayout(presentation, layouts.process);
    promptTitle(slide, "PROCESS / THREE STEPS");
    addRule(slide, 250, 410, 940, C.lineDark, "process3-connector", 3);
    const xs = [250, 720, 1190];
    xs.forEach((x, i) => {
      addRect(slide, { left: x - 34, top: 376, width: 68, height: 68 }, i === 0 ? C.tide : C.pearl, `process3-node-${i}`, { style: "solid", fill: C.tide, width: 3 });
      fillText(slide, `process3-num-${i}`, `0${i + 1}`, { left: x - 58, top: 260, width: 116, height: 46 }, { typeface: FONT.display, fontSize: 37, color: C.tide, bold: true, alignment: "center" });
      fillText(slide, `process3-title-${i}`, "[STEP TITLE]", { left: x - 150, top: 486, width: 300, height: 48 }, { typeface: FONT.display, fontSize: 28, color: C.deep, bold: true, alignment: "center" });
      fillText(slide, `process3-body-${i}`, "[Add one or two lines describing this step.]", { left: x - 150, top: 558, width: 300, height: 92 }, { fontSize: 18, color: C.ink2, alignment: "center" });
    });
    addNotes(slide, "Three-step process. Connectors sit behind nodes; keep each step equally concise.", [GUIDE]);
    slides.push(slide);
  }

  // 30 — Process / four steps
  {
    const slide = slideWithLayout(presentation, layouts.process);
    promptTitle(slide, "PROCESS / FOUR STEPS");
    addRule(slide, 190, 408, 1060, C.lineDark, "process4-connector", 3);
    const xs = [190, 543, 897, 1250];
    xs.forEach((x, i) => {
      addRect(slide, { left: x - 28, top: 380, width: 56, height: 56 }, i === 3 ? C.tide : C.pearl, `process4-node-${i}`, { style: "solid", fill: C.tide, width: 3 });
      fillText(slide, `process4-num-${i}`, `0${i + 1}`, { left: x - 56, top: 274, width: 112, height: 42 }, { typeface: FONT.display, fontSize: 34, color: C.tide, bold: true, alignment: "center" });
      fillText(slide, `process4-title-${i}`, "[STEP]", { left: x - 124, top: 478, width: 248, height: 42 }, { typeface: FONT.display, fontSize: 25, color: C.deep, bold: true, alignment: "center" });
      fillText(slide, `process4-body-${i}`, "[Short description of the step]", { left: x - 126, top: 542, width: 252, height: 88 }, { fontSize: 17, color: C.ink2, alignment: "center" });
    });
    addNotes(slide, "Four-step process. Use the final accent node for the result or handoff.", [GUIDE]);
    slides.push(slide);
  }

  // 31 — Timeline / four milestones
  {
    const slide = slideWithLayout(presentation, layouts.timeline);
    setPlaceholder(slide, "subtitle", 0, "ROADMAP / MILESTONES");
    fillText(slide, "timeline4-heading", "[ADD A CLEAR, DECISION-LED TITLE]", { left: M, top: 94, width: 1110, height: 62 }, { typeface: FONT.display, fontSize: 48, color: C.deep, bold: true, lineSpacing: 0.96 });
    addRule(slide, 170, 416, 1100, C.deep, "timeline4-base", 4);
    const xs = [190, 520, 850, 1180];
    xs.forEach((x, i) => {
      addRule(slide, x, 388, 4, i === 3 ? C.tide : C.deep, `timeline4-tick-${i}`, 60);
      addRect(slide, { left: x - 10, top: 406, width: 24, height: 24 }, i === 3 ? C.tide : C.pearl, `timeline4-dot-${i}`, { style: "solid", fill: i === 3 ? C.tide : C.deep, width: 3 });
      fillText(slide, `timeline4-date-${i}`, "[DATE]", { left: x - 90, top: 266, width: 180, height: 50 }, { typeface: FONT.display, fontSize: 34, color: C.deep, bold: true, alignment: "center" });
      fillText(slide, `timeline4-title-${i}`, "[MILESTONE]", { left: x - 114, top: 492, width: 228, height: 40 }, { typeface: FONT.display, fontSize: 24, color: C.deep, bold: true, alignment: "center" });
      fillText(slide, `timeline4-body-${i}`, "[Short description]", { left: x - 120, top: 548, width: 240, height: 80 }, { fontSize: 17, color: C.ink2, alignment: "center" });
    });
    addNotes(slide, "Four-milestone timeline. Keep dates above and implications below the line.", [GUIDE]);
    slides.push(slide);
  }

  // 32 — Timeline / alternating five milestones
  {
    const slide = slideWithLayout(presentation, layouts.timeline);
    promptTitle(slide, "ROADMAP / FIVE PHASES");
    addRule(slide, 150, 426, 1140, C.lineDark, "timeline5-base", 3);
    const xs = [170, 445, 720, 995, 1270];
    xs.forEach((x, i) => {
      const above = i % 2 === 0;
      addRule(slide, x, above ? 330 : 426, 3, C.tide, `timeline5-stem-${i}`, 98);
      addRect(slide, { left: x - 12, top: 414, width: 26, height: 26 }, i === 4 ? C.tide : C.pearl, `timeline5-dot-${i}`, { style: "solid", fill: C.tide, width: 3 });
      const ty = above ? 254 : 506;
      fillText(slide, `timeline5-date-${i}`, "[DATE]", { left: x - 92, top: ty, width: 184, height: 36 }, { typeface: FONT.display, fontSize: 28, color: C.deep, bold: true, alignment: "center" });
      fillText(slide, `timeline5-title-${i}`, "[PHASE]", { left: x - 106, top: ty + 52, width: 212, height: 34 }, { fontSize: 18, color: C.tide, bold: true, alignment: "center" });
      fillText(slide, `timeline5-body-${i}`, "[Short description]", { left: x - 112, top: ty + 96, width: 224, height: 58 }, { fontSize: 15, color: C.ink2, alignment: "center" });
    });
    addNotes(slide, "Alternating five-phase timeline. Keep descriptions to one short line where possible.", [GUIDE]);
    slides.push(slide);
  }

  // 33 — Roadmap / phased bands
  {
    const slide = slideWithLayout(presentation, layouts.timeline);
    promptTitle(slide, "ROADMAP / PHASED DELIVERY");
    const phases = [
      { x: M, w: 350, fill: C.foam, label: "PHASE 01" },
      { x: 428, w: 420, fill: C.shore, label: "PHASE 02" },
      { x: 848, w: 514, fill: "#E4F0F2", label: "PHASE 03" },
    ];
    phases.forEach((p, i) => {
      addRect(slide, { left: p.x, top: 238, width: p.w, height: 402 }, p.fill, `roadmap-band-${i}`);
      fillText(slide, `roadmap-label-${i}`, p.label, { left: p.x + 30, top: 274, width: p.w - 60, height: 22 }, { fontSize: 14, color: C.tide, bold: true });
      fillText(slide, `roadmap-title-${i}`, "[PHASE TITLE]", { left: p.x + 30, top: 332, width: p.w - 60, height: 74 }, { typeface: FONT.display, fontSize: 30, color: C.deep, bold: true, lineSpacing: 1 });
      fillText(slide, `roadmap-date-${i}`, "[DATE RANGE]", { left: p.x + 30, top: 430, width: p.w - 60, height: 24 }, { fontSize: 15, color: C.tide, bold: true });
      fillText(slide, `roadmap-body-${i}`, [
        ...bulletParagraphs(["[Key activity]", "[Key activity]", "[Expected outcome]"], "–"),
      ], { left: p.x + 30, top: 488, width: p.w - 60, height: 120 }, { fontSize: 17, color: C.ink2, lineSpacing: 1.12 });
    });
    addNotes(slide, "Phased roadmap. Use unequal band widths when phase duration or effort differs materially.", [GUIDE]);
    slides.push(slide);
  }

  // 34 — Bar chart / full width
  {
    const slide = slideWithLayout(presentation, layouts.chartFull);
    promptTitle(slide, "DATA / COMPARISON", "[ADD THE INSIGHT, NOT THE CHART TYPE]");
    slide.charts.add("bar", {
      position: { left: 96, top: 214, width: 1240, height: 446 },
      categories: ["A", "B", "C", "D"],
      series: [{ name: "Series 1", values: [42, 67, 54, 78], fill: C.tide }],
      barOptions: { direction: "column", grouping: "clustered", gapWidth: 64 },
      hasLegend: false,
      xAxis: { textStyle: { fill: C.ink2, fontSize: 15 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: null },
      yAxis: { min: 0, max: 100, majorUnit: 20, textStyle: { fill: C.ink2, fontSize: 14 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: { style: "solid", fill: "#DCE7EA", width: 1 } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fill: C.deep, fontSize: 15, bold: true } },
      chartFill: "none", chartLine: NONE, plotAreaFill: "none", plotAreaLine: NONE,
    });
    fillText(slide, "bar-full-note", "EDIT DATA · Replace categories, values, units and title before presenting.", { left: 96, top: 686, width: 760, height: 22 }, { fontSize: 14, color: C.tide, bold: true });
    addNotes(slide, "Full-width bar chart. Right-click the chart and choose Edit Data.", [GUIDE]);
    slides.push(slide);
  }

  // 35 — Bar chart / commentary split
  {
    const slide = slideWithLayout(presentation, layouts.chartSplit);
    promptTitle(slide, "DATA / COMPARISON", "[ADD THE INSIGHT, NOT THE CHART TYPE]");
    slide.charts.add("bar", {
      position: { left: M, top: 226, width: 820, height: 416 },
      categories: ["A", "B", "C", "D"],
      series: [{ name: "Series 1", values: [36, 58, 73, 64], fill: C.tide }],
      barOptions: { direction: "bar", grouping: "clustered", gapWidth: 52 },
      hasLegend: false,
      xAxis: { min: 0, max: 100, majorUnit: 20, textStyle: { fill: C.ink2, fontSize: 13 }, majorGridlines: { style: "solid", fill: "#DCE7EA", width: 1 } },
      yAxis: { textStyle: { fill: C.ink2, fontSize: 14 }, majorGridlines: null },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fill: C.deep, fontSize: 14, bold: true } },
      chartFill: "none", chartLine: NONE, plotAreaFill: "none", plotAreaLine: NONE,
    });
    setPlaceholder(slide, "body", 0, [[{ run: "[WHAT THE CHART MEANS]", textStyle: { bold: true, color: C.deep, fontSize: "24pt" } }], ["[Add the conclusion in one or two sentences.]"], ...threeBullets()]);
    addNotes(slide, "Horizontal bar chart with commentary. Use the right column for meaning and action, not a restatement of values.", [GUIDE]);
    slides.push(slide);
  }

  // 36 — Line chart / full width
  {
    const slide = slideWithLayout(presentation, layouts.chartFull);
    promptTitle(slide, "DATA / TREND", "[ADD THE TREND OR CHANGE THAT MATTERS]");
    slide.charts.add("line", {
      position: { left: 96, top: 214, width: 1240, height: 446 },
      categories: ["P1", "P2", "P3", "P4", "P5", "P6"],
      series: [{ name: "Series 1", values: [28, 36, 44, 57, 63, 76], line: { style: "solid", fill: C.tide, width: 4 }, marker: { symbol: "circle", size: 8 } }],
      hasLegend: false,
      xAxis: { textStyle: { fill: C.ink2, fontSize: 14 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: null },
      yAxis: { min: 0, max: 100, majorUnit: 20, textStyle: { fill: C.ink2, fontSize: 14 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: { style: "solid", fill: "#DCE7EA", width: 1 } },
      chartFill: "none", chartLine: NONE, plotAreaFill: "none", plotAreaLine: NONE,
    });
    fillText(slide, "line-full-note", "EDIT DATA · Replace periods, values, units and title before presenting.", { left: 96, top: 686, width: 760, height: 22 }, { fontSize: 14, color: C.tide, bold: true });
    addNotes(slide, "Full-width line chart for a single trend over time.", [GUIDE]);
    slides.push(slide);
  }

  // 37 — Line chart / two series with commentary
  {
    const slide = slideWithLayout(presentation, layouts.chartSplit);
    promptTitle(slide, "DATA / TREND", "[ADD THE RELATIONSHIP BETWEEN THE TWO SERIES]");
    slide.charts.add("line", {
      position: { left: M, top: 226, width: 820, height: 410 },
      categories: ["P1", "P2", "P3", "P4", "P5", "P6"],
      series: [
        { name: "Series 1", values: [26, 34, 49, 53, 67, 74], line: { style: "solid", fill: C.tide, width: 4 }, marker: { symbol: "circle", size: 8 } },
        { name: "Series 2", values: [18, 28, 35, 47, 52, 61], line: { style: "solid", fill: C.amber, width: 3 }, marker: { symbol: "circle", size: 7 } },
      ],
      hasLegend: true,
      legend: { position: "bottom", overlay: false, textStyle: { fill: C.ink2, fontSize: 13 } },
      xAxis: { textStyle: { fill: C.ink2, fontSize: 13 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: null },
      yAxis: { min: 0, max: 80, majorUnit: 20, textStyle: { fill: C.ink2, fontSize: 13 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: { style: "solid", fill: "#DCE7EA", width: 1 } },
      chartFill: "none", chartLine: NONE, plotAreaFill: "none", plotAreaLine: NONE,
    });
    setPlaceholder(slide, "body", 0, [[{ run: "[WHAT THE CHART MEANS]", textStyle: { bold: true, color: C.deep, fontSize: "24pt" } }], ["[Add the conclusion in one or two sentences.]"], ...threeBullets()]);
    addNotes(slide, "Two-series trend with commentary. Use amber only for the secondary series.", [GUIDE]);
    slides.push(slide);
  }

  // 38 — Doughnut chart / composition
  {
    const slide = slideWithLayout(presentation, layouts.doughnut);
    promptTitle(slide, "DATA / COMPOSITION", "[ADD THE WHOLE-TO-PART CONCLUSION]");
    slide.charts.add("doughnut", {
      position: { left: 90, top: 210, width: 620, height: 440 },
      categories: ["Segment A", "Segment B", "Segment C"],
      series: [{ name: "Series 1", values: [50, 30, 20], points: [{ idx: 0, fill: C.deep }, { idx: 1, fill: C.tide }, { idx: 2, fill: C.foam }] }],
      doughnutOptions: { holeSize: 68, firstSliceAngle: 270 },
      hasLegend: true,
      legend: { position: "bottom", overlay: false, textStyle: { fill: C.ink2, fontSize: 14 } },
      dataLabels: { showPercent: true, showCategoryName: true, position: "outEnd", textStyle: { fill: C.deep, fontSize: 14, bold: true } },
      chartFill: "none", chartLine: NONE, plotAreaFill: "none", plotAreaLine: NONE,
    });
    setPlaceholder(slide, "body", 0, [[{ run: "[ADD THE MAIN TAKEAWAY]", textStyle: { bold: true, color: C.deep, fontSize: "27pt" } }], ["[Explain the most important segment and why the composition matters.]"], [{ run: "EDIT DATA", textStyle: { bold: true, color: C.tide } }, " to replace the example values."]]);
    addNotes(slide, "Doughnut chart for three to five categories. Use only when parts sum to a meaningful whole.", [GUIDE]);
    slides.push(slide);
  }

  // 39 — Stacked bar chart
  {
    const slide = slideWithLayout(presentation, layouts.chartFull);
    promptTitle(slide, "DATA / MIX OVER TIME", "[ADD THE CHANGE IN COMPOSITION THAT MATTERS]");
    slide.charts.add("bar", {
      position: { left: 96, top: 220, width: 1240, height: 432 },
      categories: ["P1", "P2", "P3", "P4"],
      series: [
        { name: "Segment A", values: [45, 42, 38, 34], fill: C.deep },
        { name: "Segment B", values: [35, 37, 39, 41], fill: C.tide },
        { name: "Segment C", values: [20, 21, 23, 25], fill: C.foam },
      ],
      barOptions: { direction: "column", grouping: "stacked", gapWidth: 58 },
      hasLegend: true,
      legend: { position: "bottom", overlay: false, textStyle: { fill: C.ink2, fontSize: 14 } },
      xAxis: { textStyle: { fill: C.ink2, fontSize: 14 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: null },
      yAxis: { min: 0, max: 100, majorUnit: 20, numberFormatCode: "0\"%\"", textStyle: { fill: C.ink2, fontSize: 13 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: { style: "solid", fill: "#DCE7EA", width: 1 } },
      chartFill: "none", chartLine: NONE, plotAreaFill: "none", plotAreaLine: NONE,
    });
    fillText(slide, "stacked-note", "EDIT DATA · Ensure every column represents the same whole before presenting.", { left: 96, top: 686, width: 820, height: 22 }, { fontSize: 14, color: C.tide, bold: true });
    addNotes(slide, "Stacked column chart for composition across periods or segments.", [GUIDE]);
    slides.push(slide);
  }

  // 40 — Comparison / two options
  {
    const slide = slideWithLayout(presentation, layouts.comparison);
    promptTitle(slide, "DECISION / TWO OPTIONS");
    const panels = [
      { x: M, label: "[OPTION A]", fill: C.pearl, accent: C.lineDark },
      { x: 738, label: "[OPTION B / RECOMMENDED]", fill: C.foam, accent: C.tide },
    ];
    panels.forEach((panel, i) => {
      addRect(slide, { left: panel.x, top: 218, width: 624, height: 422 }, panel.fill, `compare2-panel-${i}`, { style: "solid", fill: panel.accent, width: i === 1 ? 3 : 1 });
      fillText(slide, `compare2-label-${i}`, panel.label, { left: panel.x + 34, top: 250, width: 510, height: 22 }, { fontSize: 14, color: i === 1 ? C.tide : C.ink2, bold: true });
      fillText(slide, `compare2-title-${i}`, "[OPTION TITLE]", { left: panel.x + 34, top: 304, width: 520, height: 58 }, { typeface: FONT.display, fontSize: 35, color: C.deep, bold: true });
      ["[Criterion or benefit]", "[Criterion or benefit]", "[Criterion or consideration]"].forEach((item, j) => {
        addRule(slide, panel.x + 34, 400 + j * 66, 28, i === 1 ? C.tide : C.lineDark, `compare2-dash-${i}-${j}`, 3);
        fillText(slide, `compare2-item-${i}-${j}`, item, { left: panel.x + 82, top: 386 + j * 66, width: 480, height: 40 }, { fontSize: 20, color: C.ink });
      });
    });
    addNotes(slide, "Two-option comparison. Keep criteria parallel and mark a recommendation only when the evidence supports it.", [GUIDE]);
    slides.push(slide);
  }

  // 41 — Comparison / three options
  {
    const slide = slideWithLayout(presentation, layouts.comparison);
    promptTitle(slide, "DECISION / THREE OPTIONS");
    const xs = [M, 516, 954];
    xs.forEach((x, i) => {
      addRule(slide, x, 238, 350, i === 1 ? C.tide : C.lineDark, `compare3-rule-${i}`, i === 1 ? 5 : 3);
      fillText(slide, `compare3-label-${i}`, `[OPTION ${String.fromCharCode(65 + i)}]`, { left: x, top: 272, width: 350, height: 22 }, { fontSize: 14, color: i === 1 ? C.tide : C.ink2, bold: true });
      fillText(slide, `compare3-title-${i}`, "[OPTION TITLE]", { left: x, top: 326, width: 350, height: 68 }, { typeface: FONT.display, fontSize: 30, color: C.deep, bold: true });
      fillText(slide, `compare3-body-${i}`, [
        ...bulletParagraphs(["[Key strength]", "[Key trade-off]", "[Best fit or use case]"], "–"),
      ], { left: x, top: 430, width: 340, height: 166 }, { fontSize: 19, color: C.ink2, lineSpacing: 1.14 });
      fillText(slide, `compare3-callout-${i}`, i === 1 ? "[RECOMMENDED, IF APPLICABLE]" : "[OPTIONAL NOTE]", { left: x, top: 626, width: 340, height: 24 }, { fontSize: 13, color: C.tide, bold: true });
    });
    addNotes(slide, "Three-option comparison. Use the center accent only when that option is recommended.", [GUIDE]);
    slides.push(slide);
  }

  // 42 — Comparison / before and after
  {
    const slide = slideWithLayout(presentation, layouts.comparison);
    promptTitle(slide, "CHANGE / BEFORE AND AFTER");
    addRect(slide, { left: M, top: 224, width: 570, height: 416 }, C.shore, "before-panel");
    addRect(slide, { left: 714, top: 224, width: 648, height: 416 }, C.foam, "after-panel");
    fillText(slide, "before-label", "BEFORE / CURRENT STATE", { left: 116, top: 260, width: 480, height: 22 }, { fontSize: 14, color: C.ink2, bold: true });
    fillText(slide, "after-label", "AFTER / FUTURE STATE", { left: 752, top: 260, width: 530, height: 22 }, { fontSize: 14, color: C.tide, bold: true });
    fillText(slide, "before-title", "[CURRENT-STATE TITLE]", { left: 116, top: 318, width: 460, height: 72 }, { typeface: FONT.display, fontSize: 33, color: C.deep, bold: true });
    fillText(slide, "after-title", "[FUTURE-STATE TITLE]", { left: 752, top: 318, width: 530, height: 72 }, { typeface: FONT.display, fontSize: 33, color: C.deep, bold: true });
    fillText(slide, "before-body", [...bulletParagraphs(["[Current constraint]", "[Current constraint]", "[Current consequence]"], "–")], { left: 116, top: 430, width: 460, height: 150 }, { fontSize: 20, color: C.ink2 });
    fillText(slide, "after-body", [...bulletParagraphs(["[Future capability]", "[Future capability]", "[Expected outcome]"], "–")], { left: 752, top: 430, width: 530, height: 150 }, { fontSize: 20, color: C.ink2 });
    addNotes(slide, "Before-and-after comparison. Keep both sides parallel and grounded in the same criteria.", [GUIDE]);
    slides.push(slide);
  }

  // 43 — Comparison / benefits and considerations
  {
    const slide = slideWithLayout(presentation, layouts.comparison);
    promptTitle(slide, "DECISION / TRADE-OFFS");
    addRule(slide, M, 236, 540, C.tide, "benefits-rule", 4);
    addRule(slide, 760, 236, 540, C.lineDark, "considerations-rule", 4);
    fillText(slide, "benefits-title", "[BENEFITS / UPSIDE]", { left: M, top: 278, width: 540, height: 48 }, { typeface: FONT.display, fontSize: 31, color: C.deep, bold: true });
    fillText(slide, "considerations-title", "[CONSIDERATIONS / RISKS]", { left: 760, top: 278, width: 540, height: 48 }, { typeface: FONT.display, fontSize: 31, color: C.deep, bold: true });
    const items = ["[Add the first point and its implication.]", "[Add the second point and its implication.]", "[Add the third point and its implication.]", "[Add the fourth point if needed.]"];
    fillText(slide, "benefits-body", [...bulletParagraphs(items)], { left: M, top: 366, width: 540, height: 256 }, { fontSize: 21, color: C.ink, lineSpacing: 1.15 });
    fillText(slide, "considerations-body", [...bulletParagraphs(items)], { left: 760, top: 366, width: 540, height: 256 }, { fontSize: 21, color: C.ink, lineSpacing: 1.15 });
    addNotes(slide, "Balanced trade-off page. Use matched levels of specificity on both sides.", [GUIDE]);
    slides.push(slide);
  }

  // 44 — Table / concise data
  {
    const slide = slideWithLayout(presentation, layouts.table);
    promptTitle(slide, "DATA / SUMMARY TABLE");
    const values = [
      ["[Column 1]", "[Column 2]", "[Column 3]", "[Column 4]"],
      ["[Row label]", "[Value]", "[Value]", "[Value or note]"],
      ["[Row label]", "[Value]", "[Value]", "[Value or note]"],
      ["[Row label]", "[Value]", "[Value]", "[Value or note]"],
      ["[Row label]", "[Value]", "[Value]", "[Value or note]"],
    ];
    const table = slide.tables.add({ rows: values.length, columns: 4, left: M, top: 222, width: CW, height: 398, columnTracks: [{ mode: "fr", value: 1.3 }, { mode: "fr", value: 1 }, { mode: "fr", value: 1 }, { mode: "fr", value: 1.9 }], values });
    styleTable(table, values.length, 4);
    fillText(slide, "table-data-note", "EDITABLE TABLE · Keep to five or fewer rows on a standard slide.", { left: M, top: 654, width: 720, height: 24 }, { fontSize: 14, color: C.tide, bold: true });
    addNotes(slide, "Concise editable data table. Add a source or methodology note when the values are externally sourced.", [GUIDE]);
    slides.push(slide);
  }

  // 45 — Table / workplan
  {
    const slide = slideWithLayout(presentation, layouts.table);
    promptTitle(slide, "PLAN / WORKSTREAMS");
    const values = [
      ["[Workstream]", "[Owner]", "[Timing]", "[Status]", "[Outcome]"],
      ["[Workstream]", "[Name / team]", "[Date]", "[Status]", "[Expected outcome]"],
      ["[Workstream]", "[Name / team]", "[Date]", "[Status]", "[Expected outcome]"],
      ["[Workstream]", "[Name / team]", "[Date]", "[Status]", "[Expected outcome]"],
      ["[Workstream]", "[Name / team]", "[Date]", "[Status]", "[Expected outcome]"],
    ];
    const table = slide.tables.add({ rows: values.length, columns: 5, left: M, top: 222, width: CW, height: 398, columnTracks: [{ mode: "fr", value: 1.25 }, { mode: "fr", value: 1 }, { mode: "fr", value: 0.8 }, { mode: "fr", value: 0.8 }, { mode: "fr", value: 1.8 }], values });
    styleTable(table, values.length, 5);
    fillText(slide, "workplan-note", "EDITABLE TABLE · Make ownership and timing explicit.", { left: M, top: 654, width: 720, height: 24 }, { fontSize: 14, color: C.tide, bold: true });
    addNotes(slide, "Workplan table for ownership, timing, status and outcome.", [GUIDE]);
    slides.push(slide);
  }

  // 46 — Table / risk matrix
  {
    const slide = slideWithLayout(presentation, layouts.table);
    promptTitle(slide, "RISK / PRIORITISATION MATRIX");
    const values = [
      ["[Risk]", "[Likelihood]", "[Impact]", "[Priority]", "[Mitigation / owner]"],
      ["[Risk description]", "[Low / Med / High]", "[Low / Med / High]", "[Priority]", "[Action and owner]"],
      ["[Risk description]", "[Low / Med / High]", "[Low / Med / High]", "[Priority]", "[Action and owner]"],
      ["[Risk description]", "[Low / Med / High]", "[Low / Med / High]", "[Priority]", "[Action and owner]"],
      ["[Risk description]", "[Low / Med / High]", "[Low / Med / High]", "[Priority]", "[Action and owner]"],
    ];
    const table = slide.tables.add({ rows: values.length, columns: 5, left: M, top: 222, width: CW, height: 398, columnTracks: [{ mode: "fr", value: 1.65 }, { mode: "fr", value: 0.9 }, { mode: "fr", value: 0.9 }, { mode: "fr", value: 0.8 }, { mode: "fr", value: 2 }], values });
    styleTable(table, values.length, 5);
    [C.foam, C.shore, "#F3D6AF", "#E8B59B"].forEach((fill, i) => {
      const cell = table.getCell(i + 1, 3);
      cell.fill = fill;
      cell.text.style = { typeface: FONT.body, fontSize: 14, color: C.deep, bold: true, alignment: "center", verticalAlignment: "middle", insets: { top: 8, right: 8, bottom: 8, left: 8 } };
    });
    fillText(slide, "risk-note", "EDITABLE TABLE · Define the scoring method before assigning priority.", { left: M, top: 654, width: 760, height: 24 }, { fontSize: 14, color: C.tide, bold: true });
    addNotes(slide, "Risk register. Define likelihood and impact scales in notes or an appendix.", [GUIDE]);
    slides.push(slide);
  }

  // 47 — Profile / single leader
  {
    const slide = slideWithLayout(presentation, layouts.profile);
    promptTitle(slide, "LEADERSHIP / PROFILE");
    addPortraitPlaceholder(slide, "profile-single", { left: M, top: 210, width: 590, height: 470 });
    fillText(slide, "profile-single-name", "[NAME SURNAME]", { left: 750, top: 216, width: 565, height: 60 }, { typeface: FONT.display, fontSize: 39, color: C.deep, bold: true });
    fillText(slide, "profile-single-role", "[TITLE / FUNCTION]", { left: 750, top: 300, width: 565, height: 24 }, { fontSize: 14, color: C.tide, bold: true });
    setPlaceholder(slide, "body", 0, [["[Add a short biography focused on relevant experience and current responsibility.]"], ["[Add two or three proof points rather than a full career history.]"], ...threeBullets()]);
    addNotes(slide, "Single profile. Replace the portrait and verify the person's title and biography.", [GUIDE]);
    slides.push(slide);
  }

  // 48 — Team / two leaders
  {
    const slide = slideWithLayout(presentation, layouts.profile);
    promptTitle(slide, "LEADERSHIP / TWO PROFILES");
    const xs = [M, 746];
    xs.forEach((x, i) => {
      addPortraitPlaceholder(slide, `team2-${i}`, { left: x, top: 220, width: 250, height: 292 }, i === 0 ? C.foam : C.shore);
      fillText(slide, `team2-name-${i}`, "[NAME SURNAME]", { left: x + 284, top: 232, width: 300, height: 52 }, { typeface: FONT.display, fontSize: 30, color: C.deep, bold: true });
      fillText(slide, `team2-role-${i}`, "[TITLE / FUNCTION]", { left: x + 284, top: 304, width: 300, height: 22 }, { fontSize: 13, color: C.tide, bold: true });
      fillText(slide, `team2-bio-${i}`, "[Add a concise biography focused on relevant experience, responsibility and proof.]", { left: x + 284, top: 358, width: 300, height: 130 }, { fontSize: 18, color: C.ink2 });
      fillText(slide, `team2-proof-${i}`, "[Key credential or outcome]", { left: x, top: 546, width: 584, height: 38 }, { fontSize: 16, color: C.deep, bold: true });
    });
    addNotes(slide, "Two-profile leadership page. Keep biographies parallel in length and emphasis.", [GUIDE]);
    slides.push(slide);
  }

  // 49 — Team / three people
  {
    const slide = slideWithLayout(presentation, layouts.profile);
    promptTitle(slide, "TEAM / THREE PROFILES");
    [M, 516, 954].forEach((x, i) => {
      addPortraitPlaceholder(slide, `team3-${i}`, { left: x, top: 220, width: 350, height: 264 }, i === 1 ? C.shore : C.foam);
      fillText(slide, `team3-name-${i}`, "[NAME SURNAME]", { left: x, top: 520, width: 350, height: 40 }, { typeface: FONT.display, fontSize: 27, color: C.deep, bold: true });
      fillText(slide, `team3-role-${i}`, "[TITLE / FUNCTION]", { left: x, top: 574, width: 350, height: 22 }, { fontSize: 13, color: C.tide, bold: true });
      fillText(slide, `team3-bio-${i}`, "[One-line responsibility or relevant proof.]", { left: x, top: 620, width: 340, height: 54 }, { fontSize: 16, color: C.ink2 });
    });
    addNotes(slide, "Three-person team page. Use one line of proof per person.", [GUIDE]);
    slides.push(slide);
  }

  // 50 — Team / four people
  {
    const slide = slideWithLayout(presentation, layouts.profile);
    promptTitle(slide, "TEAM / FOUR PROFILES");
    const xs = [M, 402, 726, 1050];
    xs.forEach((x, i) => {
      addPortraitPlaceholder(slide, `team4-${i}`, { left: x, top: 220, width: 264, height: 250 }, i % 2 === 0 ? C.foam : C.shore);
      fillText(slide, `team4-name-${i}`, "[NAME SURNAME]", { left: x, top: 504, width: 264, height: 36 }, { typeface: FONT.display, fontSize: 23, color: C.deep, bold: true });
      fillText(slide, `team4-role-${i}`, "[TITLE / FUNCTION]", { left: x, top: 554, width: 264, height: 22 }, { fontSize: 12, color: C.tide, bold: true });
      fillText(slide, `team4-proof-${i}`, "[One-line responsibility]", { left: x, top: 600, width: 254, height: 52 }, { fontSize: 15, color: C.ink2 });
    });
    addNotes(slide, "Four-person team page. Keep names and roles concise.", [GUIDE]);
    slides.push(slide);
  }

  // 51 — Case study
  {
    const slide = slideWithLayout(presentation, layouts.imageRight);
    promptTitle(slide, "CASE STUDY / PROOF", "[ADD THE CASE STUDY OUTCOME]");
    fillText(slide, "case-label", "[CLIENT / PROJECT / LOCATION]", { left: M, top: 230, width: 500, height: 22 }, { fontSize: 14, color: C.tide, bold: true });
    fillText(slide, "case-summary", "[Add a two-sentence summary of the challenge, intervention and result.]", { left: M, top: 282, width: 520, height: 106 }, { typeface: FONT.display, fontSize: 30, color: C.deep, bold: true, lineSpacing: 1.02 });
    fillText(slide, "case-details", [
      [{ run: "CHALLENGE", textStyle: { bold: true, color: C.tide } }, "  [Add one concise sentence.]"],
      [{ run: "APPROACH", textStyle: { bold: true, color: C.tide } }, "  [Add one concise sentence.]"],
      [{ run: "RESULT", textStyle: { bold: true, color: C.tide } }, "  [Add one verified outcome.]"],
    ], { left: M, top: 438, width: 520, height: 172 }, { fontSize: 19, color: C.ink2, lineSpacing: 1.2 });
    await photo(slide, EXTRA.phone, { left: 700, top: 220, width: 662, height: 450 }, "SEARULEA phone mockup");
    addNotes(slide, "Case study page. Replace the image and use only verified results.", [GUIDE, "User-provided SEARULEA phone mockup"]);
    slides.push(slide);
  }

  // 52 — Gallery / three images
  {
    const slide = slideWithLayout(presentation, layouts.gallery);
    promptTitle(slide, "PROOF / THREE IMAGES");
    const items = [
      { file: EXTRA.signage, x: M, title: "[IMAGE TITLE 01]", source: "signage" },
      { file: EXTRA.billboard, x: 516, title: "[IMAGE TITLE 02]", source: "billboard" },
      { file: EXTRA.poleBanners, x: 954, title: "[IMAGE TITLE 03]", source: "pole banners" },
    ];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      await photo(slide, item.file, { left: item.x, top: 220, width: 408, height: 330 }, `SEARULEA ${item.source} mockup`);
      fillText(slide, `gallery3-title-${i}`, item.title, { left: item.x, top: 578, width: 408, height: 42 }, { typeface: FONT.display, fontSize: 25, color: C.deep, bold: true });
      fillText(slide, `gallery3-caption-${i}`, "[One sentence explaining what this image proves.]", { left: item.x, top: 632, width: 390, height: 52 }, { fontSize: 16, color: C.ink2 });
    }
    addNotes(slide, "Three-image evidence gallery. Use consistent crops and captions that explain meaning.", [GUIDE, "User-provided SEARULEA signage, billboard and pole-banner mockups"]);
    slides.push(slide);
  }

  // 53 — Gallery / four images
  {
    const slide = slideWithLayout(presentation, layouts.gallery);
    promptTitle(slide, "PROOF / FOUR IMAGES");
    const items = [
      { file: EXTRA.apparel, x: M, title: "[IMAGE 01]", alt: "SEARULEA apparel mockup" },
      { file: EXTRA.stationery, x: 402, title: "[IMAGE 02]", alt: "SEARULEA stationery mockup" },
      { file: EXTRA.toteCap, x: 726, title: "[IMAGE 03]", alt: "SEARULEA tote and cap mockup" },
      { file: EXTRA.rollup, x: 1050, title: "[IMAGE 04]", alt: "SEARULEA roll-up mockup" },
    ];
    for (let i = 0; i < items.length; i += 1) {
      const item = items[i];
      await photo(slide, item.file, { left: item.x, top: 220, width: 264, height: 300 }, item.alt);
      fillText(slide, `gallery4-title-${i}`, item.title, { left: item.x, top: 552, width: 264, height: 34 }, { typeface: FONT.display, fontSize: 22, color: C.deep, bold: true });
      fillText(slide, `gallery4-caption-${i}`, "[Short proof-oriented caption.]", { left: item.x, top: 602, width: 254, height: 56 }, { fontSize: 15, color: C.ink2 });
    }
    addNotes(slide, "Four-image gallery. Use this only when each visual earns its place.", [GUIDE, "User-provided SEARULEA apparel, stationery, tote/cap and roll-up mockups"]);
    slides.push(slide);
  }

  // 54 — Location / site
  {
    const slide = slideWithLayout(presentation, layouts.location);
    promptTitle(slide, "LOCATION / SITE");
    addRect(slide, { left: 610, top: 214, width: 752, height: 454 }, "#E4F0F2", "location-map-placeholder", { style: "solid", fill: C.line, width: 1 });
    fillText(slide, "location-map-label", "REPLACE WITH VERIFIED\nMAP OR SITE IMAGE", { left: 760, top: 380, width: 452, height: 90 }, { fontSize: 18, color: C.tide, bold: true, alignment: "center", verticalAlignment: "middle" });
    addRule(slide, M, 222, 118, C.tide, "location-accent", 3);
    setPlaceholder(slide, "body", 0, [[{ run: "[LOCATION / SITE NAME]", textStyle: { bold: true, color: C.deep, fontSize: "27pt" } }], ...bulletParagraphs(["[Geographic advantage]", "[Infrastructure or capacity]", "[Access or connectivity]", "[Strategic implication]"])]);
    addNotes(slide, "Location page. Replace the right frame with a verified map or site photograph.", [GUIDE]);
    slides.push(slide);
  }

  // 55 — Closing / CTA
  {
    const slide = slideWithLayout(presentation, layouts.closing);
    setPlaceholder(slide, "title", 0, "[ADD THE FINAL SYNTHESIS OR CALL TO ACTION]");
    setPlaceholder(slide, "body", 0, "[email@searulea.com]\n[www.searulea.com]");
    fillText(slide, "closing-cta-note", "[Optional next step, decision or meeting date]", { left: 660, top: 700, width: 660, height: 24 }, { fontSize: 15, color: C.foam, bold: true, alignment: "right" });
    addNotes(slide, "Primary closing page. Resolve the opening question with a clear next action.", [GUIDE, "User-provided SEARULEA Sea Foam spiral and logo"]);
    slides.push(slide);
  }

  // 56 — Closing / contact
  {
    const slide = presentation.slides.add();
    slide.background.fill = C.pearl;
    await addImage(slide, A.logoTeal, { left: M, top: 62, width: 300, height: 60 }, { alt: "SEARULEA logo" });
    await addImage(slide, A.spiralGradient, { left: 1040, top: 40, width: 300, height: 300 }, { alt: "SEARULEA gradient spiral" });
    fillText(slide, "contact-eyebrow", "CONTACT / NEXT STEP", { left: M, top: 274, width: 520, height: 24 }, { fontSize: 15, color: C.tide, bold: true });
    fillText(slide, "contact-title", "[ADD A SHORT CLOSING LINE]", { left: M, top: 326, width: 920, height: 130 }, { typeface: FONT.display, fontSize: 64, color: C.deep, bold: true, lineSpacing: 0.96 });
    const contactRows = ["[Name Surname]", "[Title / Function]", "[email@searulea.com]", "[+000 000 000 000]", "[www.searulea.com]"];
    contactRows.forEach((text, i) => fillText(slide, `contact-row-${i}`, text, { left: M, top: 520 + i * 38, width: 620, height: 26 }, { fontSize: i === 0 ? 20 : 17, color: i === 0 ? C.deep : C.ink2, bold: i === 0 }));
    addRule(slide, M, 752, CW, C.line, "contact-footer-rule", 1);
    addNotes(slide, "Minimal contact closing. Replace every contact field and verify details.", [GUIDE, "User-provided SEARULEA gradient spiral"]);
    slides.push(slide);
  }

  // 57 — Q&A
  {
    const slide = slideWithLayout(presentation, layouts.statement);
    setPlaceholder(slide, "subtitle", 0, "DISCUSSION / Q&A");
    setPlaceholder(slide, "title", 0, "Questions and next decisions.");
    setPlaceholder(slide, "body", 0, "[Add the decision, discussion prompt or follow-up action you want to leave visible.]");
    addNotes(slide, "Q&A page. Keep a useful decision prompt visible instead of a generic thank-you message.", [GUIDE]);
    slides.push(slide);
  }

  return slides;
}

function makeFillableMaster(presentation, name, background, dark = false) {
  const master = presentation.masters.add(name);
  master.background.fill = background;
  addRule(master, M, 752, CW, dark ? C.lineDark : C.line, `${name}-footer-rule`, 1);
  addText(master, `${name}-footer-label`, "SEARULEA — Ready-to-fill slide library", { left: M, top: 765, width: 420, height: 18 }, { typeface: FONT.body, fontSize: 13, color: dark ? C.foam : C.ink2, bold: true, lineSpacing: 1 });
  return master;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(RENDER_DIR, { recursive: true });
  await fs.mkdir(LAYOUT_DIR, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  presentation.theme.colorScheme = {
    name: "SEARULEA 2026",
    themeColors: {
      accent1: C.deep, accent2: C.tide, accent3: C.lagoon, accent4: C.foam, accent5: C.shore, accent6: C.amber,
      bg1: C.pearl, bg2: C.foam, tx1: C.ink, tx2: C.ink2, dk1: C.abyss, dk2: C.deep, lt1: C.white, lt2: C.pearl,
      hlink: C.tide, folHlink: C.lagoon,
    },
  };

  const cover = presentation.masters.add("SEARULEA Fillable / Cover");
  cover.background.fill = C.deep;
  const masters = {
    cover,
    deep: makeFillableMaster(presentation, "SEARULEA Fillable / Deep Sea", C.deep, true),
    light: makeFillableMaster(presentation, "SEARULEA Fillable / Pearl", C.pearl, false),
    foam: makeFillableMaster(presentation, "SEARULEA Fillable / Sea Foam", C.foam, false),
    shore: makeFillableMaster(presentation, "SEARULEA Fillable / Shore", C.shore, false),
  };
  await addImage(masters.light, A.markTeal, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });
  await addImage(masters.foam, A.markTeal, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });
  await addImage(masters.shore, A.markTeal, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });
  await addImage(masters.deep, A.markWhite, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });

  const layouts = await createLayouts(presentation, masters);
  const slides = await createFillableSlides(presentation, layouts);

  const blankLayouts = {
    cover: presentation.layouts.add("00 — Blank / Cover"),
    deep: presentation.layouts.add("00 — Blank / Deep Sea"),
    light: presentation.layouts.add("00 — Blank / Pearl"),
    foam: presentation.layouts.add("00 — Blank / Sea Foam"),
    shore: presentation.layouts.add("00 — Blank / Shore"),
  };
  blankLayouts.cover.setParentLayoutId(masters.cover.id);
  blankLayouts.deep.setParentLayoutId(masters.deep.id);
  blankLayouts.light.setParentLayoutId(masters.light.id);
  blankLayouts.foam.setParentLayoutId(masters.foam.id);
  blankLayouts.shore.setParentLayoutId(masters.shore.id);

  const replacementLayout = new Map();
  [layouts.coverPhoto, layouts.coverDark].forEach((layout) => replacementLayout.set(layout.id, blankLayouts.cover));
  [layouts.statement].forEach((layout) => replacementLayout.set(layout.id, blankLayouts.deep));
  [layouts.guide, layouts.agenda, layouts.single, layouts.twoColumn, layouts.imageLeft, layouts.process, layouts.timeline, layouts.chartFull, layouts.chartSplit, layouts.doughnut, layouts.comparison, layouts.table, layouts.location, layouts.gallery].forEach((layout) => replacementLayout.set(layout.id, blankLayouts.light));
  [layouts.metrics].forEach((layout) => replacementLayout.set(layout.id, blankLayouts.foam));
  [layouts.imageRight, layouts.profile].forEach((layout) => replacementLayout.set(layout.id, blankLayouts.shore));
  slides.forEach((slide) => {
    const replacement = replacementLayout.get(slide.useLayoutId);
    if (replacement) slide.setLayout(replacement);
  });

  for (let i = 0; i < slides.length; i += 1) {
    const stem = `slide-${String(i + 1).padStart(2, "0")}`;
    await writeBlob(path.join(RENDER_DIR, `${stem}.png`), await presentation.export({ slide: slides[i], format: "png", scale: 1 }));
    const layout = await slides[i].export({ format: "layout" });
    await fs.writeFile(path.join(LAYOUT_DIR, `${stem}.layout.json`), await layout.text());
  }

  await writeBlob(path.join(TMP_DIR, "SEARULEA-fillable-montage.webp"), await presentation.export({ format: "webp", montage: true, scale: 1 }));
  const snapshot = await presentation.inspect({ kind: "deck,slide,textbox,shape,image,table,chart,notes,layout", maxChars: 240000 });
  await fs.writeFile(path.join(TMP_DIR, "presentation-inspect.ndjson"), snapshot.ndjson);
  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
  console.log(`Created ${FINAL_PPTX}`);
  console.log(`Slides: ${slides.length}; layouts: ${presentation.layouts.items.length}; masters: ${presentation.masters.items.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
