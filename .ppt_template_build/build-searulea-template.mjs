import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const TMP_DIR = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/.ppt_template_build";
const OUTPUT_DIR = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/PowerPoint_Template";
const FINAL_PPTX = path.join(OUTPUT_DIR, "SEARULEA_Client_Presentation_Template.pptx");
const RENDER_DIR = path.join(TMP_DIR, "qa", "rendered");
const LAYOUT_DIR = path.join(TMP_DIR, "layouts");

const ASSET_ROOT = "/Users/zaidlakhel/Documents/Claude/Projects/SEARULEA/assets";
const LOGO_ROOT = path.join(ASSET_ROOT, "exports_HD", "Logos_PNG_4K");
const MOTIF_ROOT = path.join(ASSET_ROOT, "exports_HD", "Motifs_4K");
const ENV_ROOT = path.join(ASSET_ROOT, "img", "environment");

const A = {
  logoWhite: path.join(LOGO_ROOT, "SEARULEA_logo-horizontal_white.png"),
  logoTeal: path.join(LOGO_ROOT, "SEARULEA_logo-horizontal_teal.png"),
  stackedWhite: path.join(LOGO_ROOT, "SEARULEA_logo-stacked_white.png"),
  stackedTeal: path.join(LOGO_ROOT, "SEARULEA_logo-stacked_teal.png"),
  markWhite: path.join(LOGO_ROOT, "SEARULEA_logomark_white.png"),
  markTeal: path.join(LOGO_ROOT, "SEARULEA_logomark_teal.png"),
  spiralFoam: path.join(ASSET_ROOT, "img", "spirale_foam.png"),
  spiralDeep: path.join(MOTIF_ROOT, "SEARULEA_spiral_deepsea_4K.png"),
  spiralGradient: path.join(ASSET_ROOT, "img", "spirale-color.png"),
  fishWhite: path.join(MOTIF_ROOT, "SEARULEA_fish_white.png"),
  fishTeal: path.join(MOTIF_ROOT, "SEARULEA_fish_teal.png"),
  hero: path.join(ASSET_ROOT, "img", "hero-cages.jpg"),
  offshore: path.join(ENV_ROOT, "1_offshore_ops.jpg"),
  port: path.join(ENV_ROOT, "2_fresh_at_port.jpg"),
  women: path.join(ENV_ROOT, "3_women_searulea.jpg"),
  traceability: path.join(ENV_ROOT, "4_traceability_tech.jpg"),
  coast: path.join(ENV_ROOT, "5_coast_sovereignty.jpg"),
  coldchain: path.join(ENV_ROOT, "6_team_coldchain.jpg"),
};

const C = {
  pearl: "#FBF9F4",
  shore: "#EFE8D8",
  foam: "#D0E7ED",
  lagoon: "#0C7190",
  tide: "#0A6887",
  deep: "#074154",
  abyss: "#04293A",
  amber: "#D98E2B",
  ink: "#0B3242",
  ink2: "#3E5966",
  white: "#FFFFFF",
  line: "#B9CDD3",
  lineDark: "#3D7180",
};

const FONT = { display: "Lora", body: "DM Sans" };
const W = 1440;
const H = 810;
const M = 78;
const CW = W - M * 2;
const CONTENT_TOP = 166;
const CONTENT_BOTTOM = 724;
const NONE = { style: "solid", fill: "none", width: 0 };
const imageCache = new Map();
const placeholderDefinitions = new Map();
const localPlaceholderShapes = new WeakMap();

async function imageBytes(filePath) {
  if (!imageCache.has(filePath)) {
    const bytes = await fs.readFile(filePath);
    imageCache.set(filePath, bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength));
  }
  return imageCache.get(filePath);
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return ext === ".jpg" || ext === ".jpeg" ? "image/jpeg" : "image/png";
}

async function addImage(container, filePath, position, options = {}) {
  return container.images.add({
    blob: await imageBytes(filePath),
    contentType: contentType(filePath),
    alt: options.alt ?? path.basename(filePath),
    fit: options.fit ?? "contain",
    position,
    ...(options.crop ? { crop: options.crop } : {}),
    ...(options.geometry ? { geometry: options.geometry } : {}),
    ...(options.borderRadius ? { borderRadius: options.borderRadius } : {}),
  });
}

function addRect(container, position, fill, name, line = NONE) {
  return container.shapes.add({ geometry: "rect", name, position, fill, line });
}

function addText(container, name, text, position, style = {}, fill = "none", line = NONE) {
  const shape = container.shapes.add({ geometry: "textbox", name, position, fill, line });
  shape.text = text;
  shape.text.style = {
    typeface: style.typeface ?? FONT.body,
    fontSize: style.fontSize ?? 24,
    color: style.color ?? C.ink,
    bold: style.bold ?? false,
    italic: style.italic ?? false,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    lineSpacing: style.lineSpacing ?? 1.08,
    autoFit: style.autoFit ?? "none",
    insets: style.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
    ...(style.wrap ? { wrap: style.wrap } : {}),
  };
  return shape;
}

function addRule(container, left, top, width, fill, name = "rule", height = 2) {
  return addRect(container, { left, top, width, height }, fill, name);
}

function addPlaceholder(layout, type, index, position, prompt, style = {}, options = {}) {
  const normalizedStyle = {
    typeface: style.typeface ?? FONT.body,
    fontSize: style.fontSize ?? 24,
    color: style.color ?? C.ink,
    bold: style.bold ?? false,
    italic: style.italic ?? false,
    alignment: style.alignment ?? "left",
    verticalAlignment: style.verticalAlignment ?? "top",
    lineSpacing: style.lineSpacing ?? 1.08,
    autoFit: style.autoFit ?? "none",
    insets: style.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  };
  const placeholder = layout.placeholders.add({
    type,
    index,
    geometry: options.geometry ?? "textbox",
    position,
    text: prompt,
    fill: options.fill ?? "none",
    line: options.line ?? NONE,
  });
  placeholder.text.style = normalizedStyle;
  placeholderDefinitions.set(`${layout.id}|${type}|${index}`, {
    position: { ...position },
    style: normalizedStyle,
    geometry: options.geometry ?? "textbox",
    fill: options.fill ?? "none",
    line: options.line ?? NONE,
  });
  return placeholder;
}

function getPlaceholder(slide, type, index = 0) {
  const match = slide.placeholders.getAll().find(
    (item) => item.placeholderType === type && Number(item.placeholderIndex ?? 0) === index,
  );
  if (!match) throw new Error(`Placeholder not found: ${type}[${index}] on slide ${slide.slideNumber}`);
  return match;
}

function setPlaceholder(slide, type, index, value, styleOverride = null) {
  const key = `${slide.useLayoutId}|${type}|${index}`;
  const definition = placeholderDefinitions.get(key);
  if (!definition) throw new Error(`Placeholder definition not found: ${key}`);
  let slideMap = localPlaceholderShapes.get(slide);
  if (!slideMap) {
    slideMap = new Map();
    localPlaceholderShapes.set(slide, slideMap);
  }
  let placeholder = slideMap.get(`${type}|${index}`);
  if (!placeholder) {
    placeholder = slide.shapes.add({
      geometry: definition.geometry,
      name: `content-${type}-${index}`,
      position: definition.position,
      fill: definition.fill,
      line: definition.line,
    });
    placeholder.text = "";
    placeholder.text.style = definition.style;
    slideMap.set(`${type}|${index}`, placeholder);
  }
  if (Array.isArray(value) || (value && typeof value === "object")) placeholder.text.set(value);
  else placeholder.text = value;
  if (styleOverride) placeholder.text.style = { ...definition.style, ...styleOverride };
  return placeholder;
}

function bulletParagraphs(items, bullet = "•") {
  return items.map((item) => ({
    bulletCharacter: bullet,
    marginLeft: 22,
    indent: -12,
    spaceAfter: 10,
    runs: typeof item === "string" ? [item] : item,
  }));
}

function addNotes(slide, reuseNote, sources = []) {
  const lines = [reuseNote, "", "[Sources]", ...sources.map((s) => `- ${s}`)];
  slide.speakerNotes.textFrame.setText(lines.join("\n"));
  slide.speakerNotes.setVisible(true);
}

async function writeBlob(filePath, blob) {
  await fs.writeFile(filePath, new Uint8Array(await blob.arrayBuffer()));
}

function makeMaster(presentation, name, background, dark = false) {
  const master = presentation.masters.add(name);
  master.background.fill = background;
  addRule(master, M, 752, CW, dark ? C.lineDark : C.line, `${name}-footer-rule`, 1);
  addText(
    master,
    `${name}-footer-label`,
    "SEARULEA — Client presentation",
    { left: M, top: 765, width: 360, height: 18 },
    { typeface: FONT.body, fontSize: 13, color: dark ? C.foam : C.ink2, bold: true, lineSpacing: 1 },
  );
  return master;
}

function makeLayout(presentation, name, master) {
  const layout = presentation.layouts.add(name);
  layout.setParentLayoutId(master.id);
  return layout;
}

async function addContentChrome(layout, dark = false) {
  await addImage(
    layout,
    dark ? A.markWhite : A.markTeal,
    { left: 1317, top: 45, width: 44, height: 44 },
    { alt: "SEARULEA monogram" },
  );
}

async function makeContentLayout(presentation, name, master, options = {}) {
  const dark = options.dark ?? false;
  const layout = makeLayout(presentation, name, master);
  await addContentChrome(layout, dark);
  if (options.eyebrow !== false) {
    addPlaceholder(
      layout,
      "subtitle",
      0,
      { left: M, top: 62, width: 700, height: 24 },
      "SECTION / CONTEXT",
      { typeface: FONT.body, fontSize: 15, color: dark ? C.foam : C.tide, bold: true, lineSpacing: 1 },
    );
  }
  addPlaceholder(
    layout,
    "title",
    0,
    { left: M, top: 94, width: options.titleWidth ?? 1110, height: options.titleHeight ?? 62 },
    "Slide title",
    { typeface: FONT.display, fontSize: options.titleSize ?? 48, color: dark ? C.pearl : C.deep, bold: true, lineSpacing: 0.96 },
  );
  return layout;
}

async function createLayouts(presentation, masters) {
  const layouts = {};

  layouts.coverPhoto = makeLayout(presentation, "01 — Cover / Photo", masters.cover);
  await addImage(layouts.coverPhoto, A.logoWhite, { left: 82, top: 56, width: 312, height: 62 }, { alt: "SEARULEA horizontal logo" });
  addPlaceholder(layouts.coverPhoto, "body", 0, { left: 82, top: 246, width: 560, height: 24 }, "PRESENTATION / CLIENT", { fontSize: 15, color: C.foam, bold: true, lineSpacing: 1 });
  addPlaceholder(layouts.coverPhoto, "title", 0, { left: 82, top: 292, width: 650, height: 276 }, "Presentation title", { typeface: FONT.display, fontSize: 78, color: C.pearl, bold: true, lineSpacing: 0.92 });
  addPlaceholder(layouts.coverPhoto, "subtitle", 0, { left: 84, top: 604, width: 590, height: 72 }, "A concise, outcome-focused subtitle", { fontSize: 23, color: C.foam, lineSpacing: 1.1 });
  addPlaceholder(layouts.coverPhoto, "body", 1, { left: 84, top: 718, width: 540, height: 24 }, "Month Year · Presenter · Confidential", { fontSize: 14, color: C.foam, lineSpacing: 1 });

  layouts.coverDark = makeLayout(presentation, "02 — Cover / Deep Sea", masters.cover);
  await addImage(layouts.coverDark, A.logoWhite, { left: 82, top: 56, width: 312, height: 62 }, { alt: "SEARULEA horizontal logo" });
  await addImage(layouts.coverDark, A.spiralGradient, { left: 1040, top: 0, width: 400, height: 400 }, { alt: "SEARULEA gradient spiral" });
  addPlaceholder(layouts.coverDark, "body", 0, { left: 82, top: 238, width: 560, height: 24 }, "PRESENTATION / CLIENT", { fontSize: 15, color: C.foam, bold: true, lineSpacing: 1 });
  addPlaceholder(layouts.coverDark, "title", 0, { left: 82, top: 286, width: 820, height: 190 }, "Presentation title", { typeface: FONT.display, fontSize: 84, color: C.pearl, bold: true, lineSpacing: 0.92 });
  addPlaceholder(layouts.coverDark, "subtitle", 0, { left: 84, top: 510, width: 700, height: 78 }, "A concise, outcome-focused subtitle", { fontSize: 25, color: C.foam, lineSpacing: 1.12 });
  addPlaceholder(layouts.coverDark, "body", 1, { left: 84, top: 718, width: 540, height: 24 }, "Month Year · Presenter · Confidential", { fontSize: 14, color: C.foam, lineSpacing: 1 });

  layouts.guide = await makeContentLayout(presentation, "03 — Template Guide", masters.light, { titleWidth: 1020 });
  layouts.agenda = await makeContentLayout(presentation, "04 — Agenda", masters.light);

  layouts.section = makeLayout(presentation, "05 — Section Divider / Deep Sea", masters.deep);
  await addImage(layouts.section, A.markWhite, { left: M, top: 62, width: 54, height: 54 }, { alt: "SEARULEA monogram" });
  await addImage(layouts.section, A.spiralFoam, { left: 1020, top: -70, width: 540, height: 540 }, { alt: "SEARULEA Sea Foam spiral" });
  addPlaceholder(layouts.section, "subtitle", 0, { left: M, top: 270, width: 520, height: 24 }, "SECTION 01", { fontSize: 15, color: C.foam, bold: true, lineSpacing: 1 });
  addPlaceholder(layouts.section, "title", 0, { left: M, top: 316, width: 800, height: 150 }, "Section title", { typeface: FONT.display, fontSize: 82, color: C.pearl, bold: true, lineSpacing: 0.94 });
  addPlaceholder(layouts.section, "body", 0, { left: M, top: 510, width: 700, height: 72 }, "A short line that sets up the next chapter.", { fontSize: 25, color: C.foam, lineSpacing: 1.12 });

  layouts.statement = makeLayout(presentation, "06 — Statement / Deep Sea", masters.deep);
  await addImage(layouts.statement, A.markWhite, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });
  addPlaceholder(layouts.statement, "subtitle", 0, { left: M, top: 76, width: 600, height: 24 }, "VISION / POSITIONING", { fontSize: 15, color: C.foam, bold: true, lineSpacing: 1 });
  addPlaceholder(layouts.statement, "title", 0, { left: M, top: 184, width: 1050, height: 300 }, "One defining statement, written to be remembered.", { typeface: FONT.display, fontSize: 74, color: C.pearl, bold: true, lineSpacing: 0.96 });
  addPlaceholder(layouts.statement, "body", 0, { left: M, top: 592, width: 850, height: 86 }, "Use one supporting sentence to turn the statement into a clear business implication.", { fontSize: 24, color: C.foam, lineSpacing: 1.18 });

  layouts.single = await makeContentLayout(presentation, "07 — Narrative / Single Column", masters.light);
  addPlaceholder(layouts.single, "body", 0, { left: M, top: 210, width: 1030, height: 440 }, "Narrative body", { fontSize: 27, color: C.ink, lineSpacing: 1.22 });

  layouts.twoColumn = await makeContentLayout(presentation, "08 — Narrative / Two Column", masters.light);
  addPlaceholder(layouts.twoColumn, "body", 0, { left: M, top: 218, width: 590, height: 420 }, "Left column", { fontSize: 23, color: C.ink, lineSpacing: 1.18 });
  addPlaceholder(layouts.twoColumn, "body", 1, { left: 746, top: 218, width: 590, height: 420 }, "Right column", { fontSize: 23, color: C.ink, lineSpacing: 1.18 });

  layouts.imageLeft = await makeContentLayout(presentation, "09 — Image Left / Text Right", masters.light);
  addPlaceholder(layouts.imageLeft, "body", 0, { left: 760, top: 246, width: 565, height: 380 }, "Supporting copy", { fontSize: 23, color: C.ink, lineSpacing: 1.18 });

  layouts.imageRight = await makeContentLayout(presentation, "10 — Text Left / Image Right", masters.shore);
  addPlaceholder(layouts.imageRight, "body", 0, { left: M, top: 242, width: 540, height: 390 }, "Supporting copy", { fontSize: 23, color: C.ink, lineSpacing: 1.18 });

  layouts.photoQuote = makeLayout(presentation, "11 — Photo / Quote", masters.cover);
  await addImage(layouts.photoQuote, A.logoWhite, { left: 82, top: 56, width: 280, height: 56 }, { alt: "SEARULEA horizontal logo" });
  addPlaceholder(layouts.photoQuote, "subtitle", 0, { left: 82, top: 220, width: 600, height: 24 }, "PROOF / TESTIMONY", { fontSize: 15, color: C.foam, bold: true, lineSpacing: 1 });
  addPlaceholder(layouts.photoQuote, "title", 0, { left: 82, top: 274, width: 560, height: 360 }, "A quote or proof point that carries the slide.", { typeface: FONT.display, fontSize: 58, color: C.pearl, bold: true, lineSpacing: 0.98 });
  addPlaceholder(layouts.photoQuote, "body", 0, { left: 84, top: 692, width: 520, height: 44 }, "Name · Role · Organisation", { fontSize: 18, color: C.foam, bold: true, lineSpacing: 1.08 });

  layouts.metrics = await makeContentLayout(presentation, "12 — Key Figures / Sea Foam", masters.foam);
  layouts.process = await makeContentLayout(presentation, "13 — Process / Four Steps", masters.light);
  layouts.timeline = await makeContentLayout(presentation, "14 — Timeline / Milestones", masters.light);
  layouts.chartFull = await makeContentLayout(presentation, "15 — Chart / Full Width", masters.light);
  layouts.chartSplit = await makeContentLayout(presentation, "16 — Chart / Commentary", masters.light);
  addPlaceholder(layouts.chartSplit, "body", 0, { left: 1000, top: 238, width: 330, height: 385 }, "Chart commentary", { fontSize: 21, color: C.ink, lineSpacing: 1.17 });
  layouts.doughnut = await makeContentLayout(presentation, "17 — Chart / Doughnut", masters.light);
  addPlaceholder(layouts.doughnut, "body", 0, { left: 790, top: 236, width: 520, height: 360 }, "Headline and implication", { fontSize: 24, color: C.ink, lineSpacing: 1.18 });
  layouts.comparison = await makeContentLayout(presentation, "18 — Comparison / Two Options", masters.light);
  layouts.table = await makeContentLayout(presentation, "19 — Data Table", masters.light);
  layouts.location = await makeContentLayout(presentation, "20 — Location / Site", masters.light);
  addPlaceholder(layouts.location, "body", 0, { left: M, top: 238, width: 500, height: 390 }, "Location narrative", { fontSize: 22, color: C.ink, lineSpacing: 1.17 });
  layouts.profile = await makeContentLayout(presentation, "21 — Profile / Leadership", masters.shore);
  addPlaceholder(layouts.profile, "body", 0, { left: 750, top: 356, width: 565, height: 280 }, "Profile narrative", { fontSize: 22, color: C.ink, lineSpacing: 1.18 });
  layouts.gallery = await makeContentLayout(presentation, "22 — Gallery / Three Images", masters.light);

  layouts.closing = makeLayout(presentation, "23 — Closing / Deep Sea", masters.deep);
  await addImage(layouts.closing, A.spiralFoam, { left: -150, top: 80, width: 560, height: 560 }, { alt: "SEARULEA Sea Foam spiral" });
  await addImage(layouts.closing, A.stackedWhite, { left: 1040, top: 108, width: 280, height: 220 }, { alt: "SEARULEA stacked logo" });
  addPlaceholder(layouts.closing, "title", 0, { left: 600, top: 344, width: 720, height: 268 }, "Closing statement", { typeface: FONT.display, fontSize: 66, color: C.pearl, bold: true, alignment: "right", lineSpacing: 0.96 });
  addPlaceholder(layouts.closing, "body", 0, { left: 760, top: 636, width: 560, height: 58 }, "hello@searulea.com\nwww.searulea.com", { fontSize: 18, color: C.foam, alignment: "right", lineSpacing: 1.16 });

  return layouts;
}

function slideWithLayout(presentation, layout) {
  const slide = presentation.slides.add();
  slide.setLayout(layout);
  return slide;
}

function setHeader(slide, eyebrow, title) {
  setPlaceholder(slide, "subtitle", 0, eyebrow);
  setPlaceholder(slide, "title", 0, title);
}

async function createSlides(presentation, layouts) {
  const slides = [];

  // 01 — Photo cover
  {
    const slide = presentation.slides.add();
    await addImage(slide, A.hero, { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "Offshore aquaculture cages at sunrise" });
    addRect(slide, { left: 0, top: 0, width: 760, height: H }, C.deep, "cover-deep-panel");
    await addImage(slide, A.logoWhite, { left: 82, top: 56, width: 312, height: 62 }, { alt: "SEARULEA horizontal logo" });
    slide.setLayout(layouts.coverPhoto);
    setPlaceholder(slide, "body", 0, "CLIENT PRESENTATION / 2026");
    setPlaceholder(slide, "title", 0, "Tomorrow’s aquaculture. Built today.");
    setPlaceholder(slide, "subtitle", 0, "A reusable presentation system for SEARULEA’s clients, partners and institutions.");
    setPlaceholder(slide, "body", 1, "August 2026 · SEARULEA · Confidential");
    addNotes(slide, "Duplicate this slide for photo-led covers. Replace the full-slide image and keep the title to two lines maximum.", [
      "User-provided SEARULEA brand guideline",
      "User-provided hero-cages.jpg",
    ]);
    slides.push(slide);
  }

  // 02 — Deep Sea cover
  {
    const slide = slideWithLayout(presentation, layouts.coverDark);
    await addImage(slide, A.logoWhite, { left: 82, top: 56, width: 312, height: 62 }, { alt: "SEARULEA horizontal logo" });
    await addImage(slide, A.spiralGradient, { left: 1040, top: 0, width: 400, height: 400 }, { alt: "SEARULEA gradient spiral" });
    setPlaceholder(slide, "body", 0, "INVESTOR / TRADE / INSTITUTIONAL");
    setPlaceholder(slide, "title", 0, "From our sea to your port.");
    setPlaceholder(slide, "subtitle", 0, "Use the dark cover when the presentation needs a more formal, institutional opening.");
    setPlaceholder(slide, "body", 1, "Month Year · Presenter · Confidential");
    addNotes(slide, "Duplicate this slide for formal covers. The gradient spiral is the only approved use of amber in the identity.", [
      "User-provided SEARULEA brand guideline",
      "User-provided SEARULEA gradient spiral asset",
    ]);
    slides.push(slide);
  }

  // 03 — Template guide
  {
    const slide = slideWithLayout(presentation, layouts.guide);
    setHeader(slide, "TEMPLATE GUIDE / DELETE BEFORE PRESENTING", "A flexible system, one visual language.");
    const cols = [M, 516, 954];
    const nums = ["01", "02", "03"];
    const headings = ["Start with the closest layout", "Replace content, not the system", "Keep every slide decisive"];
    const bodies = [
      "Duplicate an example slide or choose its named layout from the New Slide menu.",
      "Keep the official logo, grid, type hierarchy and palette. Replace images, text and data in place.",
      "One Lora statement per slide. DM Sans carries the explanation, labels and numbers.",
    ];
    for (let i = 0; i < 3; i += 1) {
      addRule(slide, cols[i], 244, 350, C.tide, `guide-rule-${i}`, 3);
      addText(slide, `guide-num-${i}`, nums[i], { left: cols[i], top: 270, width: 100, height: 54 }, { typeface: FONT.display, fontSize: 50, color: C.tide, bold: true, lineSpacing: 1 });
      addText(slide, `guide-head-${i}`, headings[i], { left: cols[i], top: 350, width: 350, height: 78 }, { typeface: FONT.display, fontSize: 30, color: C.deep, bold: true, lineSpacing: 1.02 });
      addText(slide, `guide-body-${i}`, bodies[i], { left: cols[i], top: 458, width: 350, height: 136 }, { fontSize: 21, color: C.ink2, lineSpacing: 1.18 });
    }
    addText(slide, "guide-fallback", "Office-safe fallbacks: Lora → Georgia · DM Sans → Arial / Helvetica", { left: M, top: 674, width: 840, height: 24 }, { fontSize: 15, color: C.tide, bold: true, lineSpacing: 1 });
    addNotes(slide, "This is the only authoring guide slide. Delete it before sending or presenting the client deck.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 04 — Agenda
  {
    const slide = slideWithLayout(presentation, layouts.agenda);
    setHeader(slide, "PRESENTATION OVERVIEW", "Today’s conversation");
    const rows = [
      ["01", "Context", "Why the opportunity matters now"],
      ["02", "Approach", "How the integrated model works"],
      ["03", "Evidence", "Milestones, capacity and operating proof"],
      ["04", "Decision", "The partnership or action required"],
    ];
    rows.forEach((row, i) => {
      const y = 224 + i * 112;
      addRule(slide, M, y - 18, CW, i === 0 ? C.tide : C.line, `agenda-rule-${i}`, i === 0 ? 2 : 1);
      addText(slide, `agenda-no-${i}`, row[0], { left: M, top: y, width: 90, height: 44 }, { typeface: FONT.display, fontSize: 35, color: C.tide, bold: true, lineSpacing: 1 });
      addText(slide, `agenda-name-${i}`, row[1], { left: 230, top: y, width: 330, height: 44 }, { typeface: FONT.display, fontSize: 34, color: C.deep, bold: true, lineSpacing: 1 });
      addText(slide, `agenda-desc-${i}`, row[2], { left: 610, top: y + 4, width: 690, height: 40 }, { fontSize: 21, color: C.ink2, lineSpacing: 1.05 });
    });
    addNotes(slide, "Use for agendas of three to five sections. Keep section labels short and write the third column as an audience outcome.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 05 — Section divider
  {
    const slide = slideWithLayout(presentation, layouts.section);
    await addImage(slide, A.markWhite, { left: M, top: 62, width: 54, height: 54 }, { alt: "SEARULEA monogram" });
    await addImage(slide, A.spiralFoam, { left: 1020, top: -70, width: 540, height: 540 }, { alt: "SEARULEA Sea Foam spiral" });
    setPlaceholder(slide, "subtitle", 0, "SECTION 01 / CONTEXT");
    setPlaceholder(slide, "title", 0, "Why now");
    setPlaceholder(slide, "body", 0, "The market context that makes this chapter necessary.");
    addNotes(slide, "Duplicate for major section breaks. Use a short title—ideally one to four words.", [
      "User-provided SEARULEA brand guideline",
      "User-provided SEARULEA Sea Foam spiral asset",
    ]);
    slides.push(slide);
  }

  // 06 — Statement
  {
    const slide = slideWithLayout(presentation, layouts.statement);
    await addImage(slide, A.markWhite, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });
    setPlaceholder(slide, "subtitle", 0, "VISION / POSITIONING");
    setPlaceholder(slide, "title", 0, "Ras El Ma can become the reference point for Mediterranean aquaculture.");
    setPlaceholder(slide, "body", 0, "An integrated, traceable and biosafe model turns natural advantage into durable production capacity.");
    addNotes(slide, "Use for a single high-level claim, mission, vision or recommendation. Keep the supporting sentence to two lines.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 07 — Single-column narrative
  {
    const slide = slideWithLayout(presentation, layouts.single);
    setHeader(slide, "COMPANY / OVERVIEW", "SEARULEA builds the infrastructure behind Moroccan aquaculture.");
    const body = setPlaceholder(slide, "body", 0, [
      [{ run: "SEARULEA operates an integrated value chain at Ras El Ma, Oriental Region.", textStyle: { bold: true, color: C.deep } }],
      ["Offshore farming, fresh conditioning at port, refrigerated export and traceability are designed to operate as one system—not as separate businesses."],
      ["The result is a platform built for international standards from day one, with local capability and documentation at every stage."],
    ]);
    body.text.style = { ...body.text.style, typeface: FONT.body, fontSize: 28, color: C.ink, lineSpacing: 1.22 };
    addText(slide, "single-proof", "375 ha offshore concession · 2,790 t target capacity · 3 species", { left: M, top: 656, width: 940, height: 30 }, { fontSize: 18, color: C.tide, bold: true, lineSpacing: 1 });
    addNotes(slide, "Use for an executive narrative or company overview. Aim for three short paragraphs and one proof line.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 08 — Two-column narrative
  {
    const slide = slideWithLayout(presentation, layouts.twoColumn);
    setHeader(slide, "STRATEGY / OPERATING MODEL", "Integration creates control at every handoff.");
    addRule(slide, 708, 222, 2, C.line, "two-column-divider", 416);
    const left = setPlaceholder(slide, "body", 0, [
      [{ run: "One chain", textStyle: { bold: true, color: C.deep, fontSize: "26pt" } }],
      ...bulletParagraphs([
        "Offshore production at Ras El Ma",
        "Fresh conditioning at port",
        "Cold chain and lot-level traceability",
        "Export documentation through one operator",
      ]),
    ]);
    left.text.style = { ...left.text.style, fontSize: 22, color: C.ink, lineSpacing: 1.16 };
    const right = setPlaceholder(slide, "body", 1, [
      [{ run: "One standard", textStyle: { bold: true, color: C.deep, fontSize: "26pt" } }],
      ...bulletParagraphs([
        "ONSSA requirements built into operations",
        "European market documentation",
        "Biosafety designed into the CAPEX",
        "Clear ownership from cage to client",
      ]),
    ]);
    right.text.style = { ...right.text.style, fontSize: 22, color: C.ink, lineSpacing: 1.16 };
    addNotes(slide, "Use for two parallel arguments, current/future states or complementary workstreams. Keep the columns balanced.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 09 — Image left
  {
    const slide = slideWithLayout(presentation, layouts.imageLeft);
    setHeader(slide, "OPERATIONS / OFFSHORE", "Evidence starts where the work happens.");
    await addImage(slide, A.offshore, { left: M, top: 216, width: 620, height: 452 }, { fit: "cover", alt: "SEARULEA offshore operations" });
    addRule(slide, 760, 222, 118, C.tide, "image-left-accent", 3);
    const body = setPlaceholder(slide, "body", 0, [
      [{ run: "Production at Ras El Ma", textStyle: { bold: true, color: C.deep, fontSize: "26pt" } }],
      ...bulletParagraphs([
        "375-hectare government concession",
        "Sea bream, seabass and meagre",
        "Continuous monitoring and documented lots",
        "Built to scale in defined phases",
      ]),
    ]);
    body.text.style = { ...body.text.style, fontSize: 22, color: C.ink, lineSpacing: 1.16 };
    addNotes(slide, "Use for image-led evidence with four or fewer supporting bullets. Replace the image using Change Picture to preserve the crop.", [
      "User-provided SEARULEA brand guideline",
      "User-provided 1_offshore_ops.jpg",
    ]);
    slides.push(slide);
  }

  // 10 — Image right
  {
    const slide = slideWithLayout(presentation, layouts.imageRight);
    setHeader(slide, "QUALITY / COLD CHAIN", "Control continues after the harvest.");
    await addImage(slide, A.coldchain, { left: 700, top: 216, width: 662, height: 452 }, { fit: "cover", alt: "Cold-chain team loading product at port" });
    addRule(slide, M, 220, 118, C.tide, "image-right-accent", 3);
    const body = setPlaceholder(slide, "body", 0, [
      [{ run: "Fresh, documented, ready to move", textStyle: { bold: true, color: C.deep, fontSize: "26pt" } }],
      ...bulletParagraphs([
        "Fresh conditioning at port",
        "Refrigerated logistics and export documentation",
        "One point of contact for commercial partners",
        "Traceability carried through the chain",
      ]),
    ]);
    body.text.style = { ...body.text.style, fontSize: 22, color: C.ink, lineSpacing: 1.16 };
    addNotes(slide, "Use when the narrative should lead and the image should validate it. Replace the image using Change Picture.", [
      "User-provided SEARULEA brand guideline",
      "User-provided 6_team_coldchain.jpg",
    ]);
    slides.push(slide);
  }

  // 11 — Photo quote
  {
    const slide = presentation.slides.add();
    await addImage(slide, A.port, { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "Fresh operations at port" });
    addRect(slide, { left: 0, top: 0, width: 718, height: H }, C.deep, "photo-quote-panel");
    await addImage(slide, A.logoWhite, { left: 82, top: 56, width: 280, height: 56 }, { alt: "SEARULEA horizontal logo" });
    slide.setLayout(layouts.photoQuote);
    setPlaceholder(slide, "subtitle", 0, "PROOF / PARTNERSHIP");
    setPlaceholder(slide, "title", 0, "“One operator. One documented chain. One standard.”");
    setPlaceholder(slide, "body", 0, "Client or partner name · Role · Organisation");
    addNotes(slide, "Use for a verified testimonial, quotation or high-confidence proof point. Never invent quotes; replace the attribution before presenting.", [
      "User-provided SEARULEA brand guideline",
      "User-provided 2_fresh_at_port.jpg",
    ]);
    slides.push(slide);
  }

  // 12 — Key figures
  {
    const slide = slideWithLayout(presentation, layouts.metrics);
    setHeader(slide, "PROOF / KEY FIGURES", "The scale is visible in four numbers.");
    const metrics = [
      ["375", "hectares", "Offshore government concession"],
      ["2,790", "tonnes", "Target annual capacity by 2031"],
      ["40%", "women", "Workforce commitment"],
      ["3", "species", "Sea bream, seabass and meagre"],
    ];
    metrics.forEach((metric, i) => {
      const x = M + i * 322;
      if (i > 0) addRule(slide, x - 28, 258, 1, C.line, `metric-divider-${i}`, 300);
      addText(slide, `metric-value-${i}`, metric[0], { left: x, top: 252, width: 270, height: 92 }, { typeface: FONT.display, fontSize: 74, color: C.deep, bold: true, lineSpacing: 1 });
      addText(slide, `metric-unit-${i}`, metric[1].toUpperCase(), { left: x, top: 364, width: 270, height: 24 }, { fontSize: 15, color: C.tide, bold: true, lineSpacing: 1 });
      addText(slide, `metric-desc-${i}`, metric[2], { left: x, top: 420, width: 270, height: 90 }, { fontSize: 21, color: C.ink2, lineSpacing: 1.14 });
    });
    addRule(slide, M, 600, CW, C.tide, "metrics-bottom-rule", 3);
    addText(slide, "metrics-bottom", "Use verified numbers and write the meaning directly below each one.", { left: M, top: 626, width: 850, height: 30 }, { typeface: FONT.display, fontSize: 25, color: C.deep, bold: true, lineSpacing: 1.05 });
    addNotes(slide, "Use for three or four key figures. Keep units separate from values so the hierarchy stays clear.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 13 — Four-step process
  {
    const slide = slideWithLayout(presentation, layouts.process);
    setHeader(slide, "OPERATING MODEL / PROCESS", "One chain, four controlled handoffs.");
    const x = [170, 500, 830, 1160];
    addRule(slide, x[0], 316, x[3] - x[0], C.line, "process-connector", 3);
    const steps = [
      ["01", "Offshore farming", "Monitored production at Ras El Ma"],
      ["02", "Fresh at port", "Conditioning, quality and documentation"],
      ["03", "Cold chain", "Refrigerated handling with traceability"],
      ["04", "Export", "One commercial handoff to the client"],
    ];
    steps.forEach((step, i) => {
      const node = slide.shapes.add({
        geometry: "ellipse",
        name: `process-node-${i}`,
        position: { left: x[i] - 43, top: 274, width: 86, height: 86 },
        fill: i === 3 ? C.tide : C.foam,
        line: { style: "solid", fill: i === 3 ? C.tide : C.line, width: 2 },
      });
      node.text = step[0];
      node.text.style = { typeface: FONT.display, fontSize: 31, color: i === 3 ? C.white : C.deep, bold: true, alignment: "center", verticalAlignment: "middle", insets: { top: 0, right: 0, bottom: 0, left: 0 }, lineSpacing: 1 };
      addText(slide, `process-title-${i}`, step[1], { left: x[i] - 125, top: 400, width: 250, height: 70 }, { typeface: FONT.display, fontSize: 29, color: C.deep, bold: true, alignment: "center", lineSpacing: 1.02 });
      addText(slide, `process-body-${i}`, step[2], { left: x[i] - 132, top: 500, width: 264, height: 96 }, { fontSize: 19, color: C.ink2, alignment: "center", lineSpacing: 1.14 });
    });
    addText(slide, "process-outcome", "Our chain. Our commitments. Your certainty.", { left: 370, top: 654, width: 700, height: 40 }, { typeface: FONT.display, fontSize: 28, color: C.tide, bold: true, alignment: "center", lineSpacing: 1 });
    addNotes(slide, "Use for three to five sequential stages. Connectors sit behind nodes; keep every step to one short title and one explanation.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 14 — Timeline
  {
    const slide = slideWithLayout(presentation, layouts.timeline);
    setHeader(slide, "ROADMAP / MILESTONES", "Capacity grows in documented phases.");
    const y = 418;
    addRule(slide, 148, y, 1144, C.deep, "timeline-base", 4);
    const points = [
      { x: 190, year: "2026", title: "Build", body: "Infrastructure and certification" },
      { x: 500, year: "2028", title: "First sales", body: "605 t in the first commercial phase" },
      { x: 820, year: "2029–30", title: "Scale", body: "Production ramps to 1,744 t" },
      { x: 1190, year: "2031+", title: "Full capacity", body: "2,790 t and 71 direct jobs" },
    ];
    points.forEach((point, i) => {
      addRule(slide, point.x, y - 28, 4, i === 3 ? C.tide : C.deep, `timeline-tick-${i}`, 60);
      const dot = slide.shapes.add({ geometry: "ellipse", name: `timeline-dot-${i}`, position: { left: point.x - 10, top: y - 10, width: 24, height: 24 }, fill: i === 3 ? C.tide : C.pearl, line: { style: "solid", fill: i === 3 ? C.tide : C.deep, width: 3 } });
      dot.sendToBack?.();
      addText(slide, `timeline-year-${i}`, point.year, { left: point.x - 86, top: 255, width: 176, height: 50 }, { typeface: FONT.display, fontSize: 36, color: C.deep, bold: true, alignment: "center", lineSpacing: 1 });
      addText(slide, `timeline-title-${i}`, point.title, { left: point.x - 106, top: 492, width: 216, height: 38 }, { typeface: FONT.display, fontSize: 25, color: C.deep, bold: true, alignment: "center", lineSpacing: 1 });
      addText(slide, `timeline-body-${i}`, point.body, { left: point.x - 122, top: 548, width: 248, height: 88 }, { fontSize: 18, color: C.ink2, alignment: "center", lineSpacing: 1.14 });
    });
    addNotes(slide, "Use for three to five milestones. Keep dates above the line and implications below it.", ["User-provided SEARULEA presentation PDF"]);
    slides.push(slide);
  }

  // 15 — Editable bar chart
  {
    const slide = slideWithLayout(presentation, layouts.chartFull);
    setHeader(slide, "CAPACITY / SCALE-UP", "The operating plan reaches 2,790 tonnes by 2031.");
    slide.charts.add("bar", {
      position: { left: 96, top: 212, width: 1240, height: 452 },
      categories: ["2026", "2028", "2030", "2031"],
      series: [{ name: "Annual net capacity (t)", values: [0, 605, 1744, 2790], fill: C.tide }],
      barOptions: { direction: "column", grouping: "clustered", gapWidth: 64 },
      hasLegend: false,
      xAxis: { textStyle: { fill: C.ink2, fontSize: 15 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: null },
      yAxis: { title: "Tonnes", min: 0, max: 3000, majorUnit: 500, numberFormatCode: "#,##0", textStyle: { fill: C.ink2, fontSize: 14 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: { style: "solid", fill: "#DCE7EA", width: 1 } },
      dataLabels: { showValue: true, position: "outEnd", textStyle: { fill: C.deep, fontSize: 15, bold: true } },
      chartFill: "none",
      chartLine: NONE,
      plotAreaFill: "none",
      plotAreaLine: NONE,
    });
    addText(slide, "bar-chart-note", "Editable chart — right-click → Edit Data to replace the example series.", { left: 96, top: 686, width: 700, height: 22 }, { fontSize: 14, color: C.tide, bold: true, lineSpacing: 1 });
    addNotes(slide, "Use for categorical comparisons or phased scale-up. The chart is native and editable in PowerPoint.", ["User-provided SEARULEA presentation PDF"]);
    slides.push(slide);
  }

  // 16 — Editable line chart with commentary
  {
    const slide = slideWithLayout(presentation, layouts.chartSplit);
    setHeader(slide, "WORKFORCE / DEVELOPMENT", "Employment grows with operating capacity.");
    slide.charts.add("line", {
      position: { left: M, top: 218, width: 840, height: 430 },
      categories: ["2026", "2027", "2028", "2029", "2030", "2031"],
      series: [
        { name: "Direct jobs", values: [12, 18, 28, 42, 58, 71], line: { style: "solid", fill: C.tide, width: 4 }, marker: { symbol: "circle", size: 8 } },
        { name: "Women in workforce", values: [5, 8, 12, 18, 24, 30], line: { style: "solid", fill: C.amber, width: 3 }, marker: { symbol: "circle", size: 7 } },
      ],
      hasLegend: true,
      legend: { position: "bottom", overlay: false, textStyle: { fill: C.ink2, fontSize: 13 } },
      xAxis: { textStyle: { fill: C.ink2, fontSize: 13 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: null },
      yAxis: { min: 0, max: 80, majorUnit: 20, textStyle: { fill: C.ink2, fontSize: 13 }, line: { style: "solid", fill: C.line, width: 1 }, majorGridlines: { style: "solid", fill: "#DCE7EA", width: 1 } },
      chartFill: "none",
      chartLine: NONE,
      plotAreaFill: "none",
      plotAreaLine: NONE,
    });
    const body = setPlaceholder(slide, "body", 0, [
      [{ run: "What the chart means", textStyle: { bold: true, color: C.deep, fontSize: "24pt" } }],
      ...bulletParagraphs([
        "71 direct roles at full capacity",
        "A minimum 40% commitment for women",
        "Skills grow with each operating phase",
      ]),
    ]);
    body.text.style = { ...body.text.style, fontSize: 20, color: C.ink, lineSpacing: 1.15 };
    addText(slide, "line-chart-note", "Illustrative template data — replace with verified figures before presenting.", { left: M, top: 686, width: 760, height: 22 }, { fontSize: 14, color: C.tide, bold: true, lineSpacing: 1 });
    addNotes(slide, "Use for trends over time with one or two series. The example job progression is illustrative template data; replace before presenting.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 17 — Editable doughnut chart
  {
    const slide = slideWithLayout(presentation, layouts.doughnut);
    setHeader(slide, "PORTFOLIO / PRODUCT MIX", "Three species balance demand and operating resilience.");
    slide.charts.add("doughnut", {
      position: { left: 90, top: 210, width: 620, height: 440 },
      categories: ["Meagre", "Sea bream", "Seabass"],
      series: [{
        name: "Illustrative product mix",
        values: [50, 30, 20],
        points: [
          { idx: 0, fill: C.deep },
          { idx: 1, fill: C.tide },
          { idx: 2, fill: C.foam },
        ],
      }],
      doughnutOptions: { holeSize: 68, firstSliceAngle: 270 },
      hasLegend: true,
      legend: { position: "bottom", overlay: false, textStyle: { fill: C.ink2, fontSize: 14 } },
      dataLabels: { showPercent: true, showCategoryName: true, position: "outEnd", textStyle: { fill: C.deep, fontSize: 14, bold: true } },
      chartFill: "none",
      chartLine: NONE,
      plotAreaFill: "none",
      plotAreaLine: NONE,
    });
    const body = setPlaceholder(slide, "body", 0, [
      [{ run: "Use the headline to state the conclusion—not the chart type.", textStyle: { bold: true, color: C.deep, fontSize: "27pt" } }],
      ["This layout works for portfolio mix, allocation, audience composition or any whole-to-part story with three to five categories."],
      [{ run: "Right-click → Edit Data", textStyle: { bold: true, color: C.tide } }, " to replace the example values."],
    ]);
    body.text.style = { ...body.text.style, fontSize: 22, color: C.ink, lineSpacing: 1.18 };
    addNotes(slide, "Use for whole-to-part analysis with three to five segments. The chart is native and editable in PowerPoint.", ["User-provided SEARULEA presentation PDF"]);
    slides.push(slide);
  }

  // 18 — Comparison
  {
    const slide = slideWithLayout(presentation, layouts.comparison);
    setHeader(slide, "DECISION / COMPARISON", "Compare options against the criteria that matter.");
    const panels = [
      { x: M, label: "OPTION A", title: "Current approach", fill: C.pearl, accent: C.line, items: ["Fragmented responsibility", "Multiple handoffs", "Variable documentation"] },
      { x: 738, label: "OPTION B / RECOMMENDED", title: "Integrated chain", fill: C.foam, accent: C.tide, items: ["One accountable operator", "Controlled cold chain", "One documented standard"] },
    ];
    panels.forEach((panel, i) => {
      addRect(slide, { left: panel.x, top: 218, width: 624, height: 422 }, panel.fill, `compare-panel-${i}`, { style: "solid", fill: panel.accent, width: i === 1 ? 3 : 1 });
      addText(slide, `compare-label-${i}`, panel.label, { left: panel.x + 34, top: 250, width: 510, height: 22 }, { fontSize: 14, color: i === 1 ? C.tide : C.ink2, bold: true, lineSpacing: 1 });
      addText(slide, `compare-title-${i}`, panel.title, { left: panel.x + 34, top: 304, width: 520, height: 58 }, { typeface: FONT.display, fontSize: 35, color: C.deep, bold: true, lineSpacing: 1 });
      panel.items.forEach((item, j) => {
        addRule(slide, panel.x + 34, 400 + j * 66, 28, i === 1 ? C.tide : C.lineDark, `compare-dash-${i}-${j}`, 3);
        addText(slide, `compare-item-${i}-${j}`, item, { left: panel.x + 82, top: 386 + j * 66, width: 480, height: 40 }, { fontSize: 21, color: C.ink, lineSpacing: 1.05 });
      });
    });
    addNotes(slide, "Use for two alternatives, current/future states or build/buy choices. Keep both sides parallel and make the recommendation explicit only when appropriate.", ["User-provided SEARULEA brand guideline"]);
    slides.push(slide);
  }

  // 19 — Editable table
  {
    const slide = slideWithLayout(presentation, layouts.table);
    setHeader(slide, "PLAN / DELIVERY", "Make ownership and timing unambiguous.");
    const values = [
      ["Workstream", "Owner", "Timing", "Outcome"],
      ["Infrastructure", "Operations", "2026–27", "Port and offshore readiness"],
      ["Certification", "Quality", "2026–27", "ONSSA and export documentation"],
      ["Commercial launch", "Trade", "2028", "First client deliveries"],
      ["Scale-up", "Executive team", "2029–31", "Full operating capacity"],
    ];
    const table = slide.tables.add({
      rows: values.length,
      columns: 4,
      left: M,
      top: 222,
      width: CW,
      height: 398,
      columnTracks: [{ mode: "fr", value: 1.35 }, { mode: "fr", value: 1 }, { mode: "fr", value: 0.8 }, { mode: "fr", value: 2.1 }],
      values,
    });
    table.borders.assign({ style: "solid", fill: C.line, width: 1 });
    table.styleOptions = { headerRow: true, bandedRows: false };
    for (let c = 0; c < 4; c += 1) {
      const cell = table.getCell(0, c);
      cell.fill = C.deep;
      cell.text.style = { typeface: FONT.body, fontSize: 16, color: C.white, bold: true, verticalAlignment: "middle", insets: { top: 10, right: 12, bottom: 10, left: 12 } };
    }
    for (let r = 1; r < values.length; r += 1) {
      for (let c = 0; c < 4; c += 1) {
        const cell = table.getCell(r, c);
        cell.fill = r % 2 === 0 ? "#F0F5F5" : C.pearl;
        cell.text.style = { typeface: FONT.body, fontSize: 16, color: c === 0 ? C.deep : C.ink, bold: c === 0, verticalAlignment: "middle", insets: { top: 10, right: 12, bottom: 10, left: 12 } };
      }
    }
    addText(slide, "table-note", "Editable table — keep to five or fewer rows on a standard slide.", { left: M, top: 654, width: 670, height: 24 }, { fontSize: 14, color: C.tide, bold: true, lineSpacing: 1 });
    addNotes(slide, "Use for plans, responsibilities, requirements or concise data. The table is native and editable in PowerPoint.", ["User-provided SEARULEA presentation PDF"]);
    slides.push(slide);
  }

  // 20 — Location / site
  {
    const slide = slideWithLayout(presentation, layouts.location);
    setHeader(slide, "LOCATION / RAS EL MA", "The site connects natural advantage to export access.");
    await addImage(slide, A.coast, { left: 610, top: 214, width: 752, height: 454 }, { fit: "cover", alt: "Ras El Ma coastline" });
    addRule(slide, M, 222, 118, C.tide, "location-accent", 3);
    const body = setPlaceholder(slide, "body", 0, [
      [{ run: "Ras El Ma, Oriental Region", textStyle: { bold: true, color: C.deep, fontSize: "27pt" } }],
      ...bulletParagraphs([
        "Direct Mediterranean access",
        "375-hectare offshore concession",
        "Port connection for fresh logistics",
        "Proximity to European markets",
      ]),
    ]);
    body.text.style = { ...body.text.style, fontSize: 21, color: C.ink, lineSpacing: 1.16 };
    addNotes(slide, "Use for a location, facility or market-access story. Replace the image with a verified map or site photograph when available.", [
      "User-provided SEARULEA brand guideline",
      "User-provided 5_coast_sovereignty.jpg",
    ]);
    slides.push(slide);
  }

  // 21 — Profile
  {
    const slide = slideWithLayout(presentation, layouts.profile);
    setHeader(slide, "LEADERSHIP / PROFILE", "Leadership rooted in execution.");
    await addImage(slide, A.women, { left: M, top: 210, width: 590, height: 470 }, { fit: "cover", crop: { left: 0, top: 0.05, right: 0, bottom: 0.08 }, alt: "SEARULEA team member" });
    addText(slide, "profile-name", "Name Surname", { left: 750, top: 216, width: 565, height: 60 }, { typeface: FONT.display, fontSize: 39, color: C.deep, bold: true, lineSpacing: 1 });
    addText(slide, "profile-role", "TITLE / FUNCTION", { left: 750, top: 300, width: 565, height: 24 }, { fontSize: 14, color: C.tide, bold: true, lineSpacing: 1 });
    const body = setPlaceholder(slide, "body", 0, [
      ["Use a short biography focused on relevant experience, operating credibility and the person’s role in the decision at hand."],
      ["Add two or three proof points rather than a full career history."],
      ...bulletParagraphs(["Relevant experience", "Specific responsibility", "Decision or outcome owned"]),
    ]);
    body.text.style = { ...body.text.style, fontSize: 21, color: C.ink, lineSpacing: 1.17 };
    addNotes(slide, "Use for a founder, executive, project lead or client contact. Replace the placeholder name and verified photograph before presenting.", [
      "User-provided SEARULEA brand guideline",
      "User-provided 3_women_searulea.jpg",
    ]);
    slides.push(slide);
  }

  // 22 — Gallery
  {
    const slide = slideWithLayout(presentation, layouts.gallery);
    setHeader(slide, "PROOF / PHOTOGRAPHY", "Show the system through evidence, not decoration.");
    const gallery = [
      { file: A.offshore, x: M, title: "Offshore operations", alt: "Offshore aquaculture operations" },
      { file: A.traceability, x: 516, title: "Traceability", alt: "Lot-level traceability technology" },
      { file: A.coldchain, x: 954, title: "Cold chain", alt: "Cold-chain operations at port" },
    ];
    for (let i = 0; i < gallery.length; i += 1) {
      const item = gallery[i];
      await addImage(slide, item.file, { left: item.x, top: 220, width: 408, height: 330 }, { fit: "cover", alt: item.alt });
      addText(slide, `gallery-title-${i}`, item.title, { left: item.x, top: 578, width: 408, height: 42 }, { typeface: FONT.display, fontSize: 26, color: C.deep, bold: true, lineSpacing: 1 });
      addText(slide, `gallery-caption-${i}`, "One sentence that explains what the image proves.", { left: item.x, top: 634, width: 390, height: 50 }, { fontSize: 17, color: C.ink2, lineSpacing: 1.12 });
    }
    addNotes(slide, "Use for a three-image evidence sequence. Keep crops consistent and write captions that explain what each image proves.", [
      "User-provided SEARULEA brand guideline",
      "User-provided environment photography",
    ]);
    slides.push(slide);
  }

  // 23 — Closing
  {
    const slide = slideWithLayout(presentation, layouts.closing);
    await addImage(slide, A.spiralFoam, { left: -150, top: 80, width: 560, height: 560 }, { alt: "SEARULEA Sea Foam spiral" });
    await addImage(slide, A.stackedWhite, { left: 1040, top: 108, width: 280, height: 220 }, { alt: "SEARULEA stacked logo" });
    setPlaceholder(slide, "title", 0, "Let’s build the next chapter from Ras El Ma.");
    setPlaceholder(slide, "body", 0, "hello@searulea.com\nwww.searulea.com");
    addText(slide, "closing-signature", "From our sea to your port.", { left: 716, top: 708, width: 604, height: 28 }, { typeface: FONT.display, fontSize: 22, color: C.foam, italic: true, alignment: "right", lineSpacing: 1 });
    addNotes(slide, "Use as the closing synthesis and contact slide. Replace placeholder contact details with verified client information.", [
      "User-provided SEARULEA brand guideline",
      "User-provided SEARULEA Sea Foam spiral and logo assets",
    ]);
    slides.push(slide);
  }

  return slides;
}

async function main() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  await fs.mkdir(RENDER_DIR, { recursive: true });
  await fs.mkdir(LAYOUT_DIR, { recursive: true });

  const presentation = Presentation.create({ slideSize: { width: W, height: H } });
  presentation.theme.colorScheme = {
    name: "SEARULEA 2026",
    themeColors: {
      accent1: C.deep,
      accent2: C.tide,
      accent3: C.lagoon,
      accent4: C.foam,
      accent5: C.shore,
      accent6: C.amber,
      bg1: C.pearl,
      bg2: C.foam,
      tx1: C.ink,
      tx2: C.ink2,
      dk1: C.abyss,
      dk2: C.deep,
      lt1: C.white,
      lt2: C.pearl,
      hlink: C.tide,
      folHlink: C.lagoon,
    },
  };

  const cover = presentation.masters.add("SEARULEA / Cover");
  cover.background.fill = C.deep;
  const masters = {
    cover,
    deep: makeMaster(presentation, "SEARULEA / Deep Sea", C.deep, true),
    light: makeMaster(presentation, "SEARULEA / Pearl", C.pearl, false),
    foam: makeMaster(presentation, "SEARULEA / Sea Foam", C.foam, false),
    shore: makeMaster(presentation, "SEARULEA / Shore", C.shore, false),
  };
  await addImage(masters.light, A.markTeal, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });
  await addImage(masters.foam, A.markTeal, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });
  await addImage(masters.shore, A.markTeal, { left: 1317, top: 45, width: 44, height: 44 }, { alt: "SEARULEA monogram" });

  const layouts = await createLayouts(presentation, masters);
  const slides = await createSlides(presentation, layouts);

  for (let i = 0; i < slides.length; i += 1) {
    const stem = `slide-${String(i + 1).padStart(2, "0")}`;
    const png = await presentation.export({ slide: slides[i], format: "png", scale: 1 });
    await writeBlob(path.join(RENDER_DIR, `${stem}.png`), png);
    const layout = await slides[i].export({ format: "layout" });
    await fs.writeFile(path.join(LAYOUT_DIR, `${stem}.layout.json`), await layout.text());
  }

  const montage = await presentation.export({ format: "webp", montage: true, scale: 1 });
  await writeBlob(path.join(TMP_DIR, "qa", "SEARULEA-template-montage.webp"), montage);

  const snapshot = await presentation.inspect({
    kind: "deck,slide,textbox,shape,image,table,chart,notes,layout",
    maxChars: 120000,
  });
  await fs.writeFile(path.join(TMP_DIR, "qa", "presentation-inspect.ndjson"), snapshot.ndjson);

  const pptx = await PresentationFile.exportPptx(presentation);
  await pptx.save(FINAL_PPTX);
  console.log(`Created ${FINAL_PPTX}`);
  console.log(`Slides: ${slides.length}; layouts: ${presentation.layouts.items.length}; masters: ${presentation.masters.items.length}`);
}

if (path.resolve(process.argv[1] ?? "") === path.resolve(fileURLToPath(import.meta.url))) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export {
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
  addPlaceholder,
  setPlaceholder,
  bulletParagraphs,
  addNotes,
  writeBlob,
  makeMaster,
  createLayouts,
  slideWithLayout,
  setHeader,
};
