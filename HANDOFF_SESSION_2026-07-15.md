# SEARULEA — Session Handoff (2026-07-14 → 07-15)

Paste this file (or reference its path) at the start of a new chat to continue the work.
Project root: `~/Documents/Claude/Projects/SEARULEA/` · Asset source: `~/Desktop/BELDOCH CONCIERGERIE/SEARULEA/`

---

## 1. What SEARULEA is

Vertically-integrated Mediterranean aquaculture operator at Ras El Ma, Oriental Region, Morocco (founder: Abdellah Mansouri). 375-ha offshore government concession, sea bream / seabass / meagre, documented phases to 2,790 t by 2031, 40% women in workforce, ONSSA + European standards, export via Ras Kebdana. Positioning: "builds the infrastructure of Moroccan aquaculture", never competes on price.

**Brand system**
- Palette: Deep Sea `#074154` (Pantone 3035C) · Tide `#0A6887` (7706C) · Lagoon `#0C7190` (7708C) · Sea Foam `#D0E7ED` (656C) · Shore `#EFE8D8` (7527C) · Pearl `#FBF9F4` (9184C). Amber exists ONLY inside the spiral motif, never a flat brand colour. Logo ink on light: `#09566C`.
- Type: **Lora** (display/headlines/numbers) + **DM Sans** (body/labels, caps +220 tracking). Fallbacks: Georgia / Arial.
- Logo: droplet-triangle monogram + letterspaced serif wordmark whose final A is a bare apex (the monogram "lives inside" the logotype). 4 lockups: horizontal (default), stacked (cards/covers), wordmark alone, monogram alone (<32px). Clearspace = symbol height X; monogram clearspace = one droplet row; min sizes 32px/24mm logo, 16px/8mm monogram.
- Motifs: dotted phyllotaxis **spiral** (gradient teal→amber + solid Deep Sea + solid Sea Foam colourways) and dotted **fish**.
- **TAGLINE RULE (user decision, emphatic): the ONLY tagline on assets is "From our sea to your port."** — "Rooted in Morocco. Built for the world." and "The aquaculture of tomorrow. Built today." are editorial copy only, never on assets. NOTE: the live website hero (`index.html`) still says "Tomorrow's aquaculture. Built today." — user was offered the change, hasn't decided.
- Voice: demonstrates not declares; Direct/Factual/Confident/Precise; never "passion for the sea", never "we believe in…", never on price.

## 2. Deliverable 1 — Figma brand book (DONE, minor leftovers)

File: `Searulea_Brand_Guidelines` key **NyXhUlzICcdgNkHTJjPL93**, "Pages" board = page id `0:1`, 145 slides 1920×1080 (grid x=slideCol*2120, y=row*1280). A second, fully-personalized file exists: key `Q6VN2T69poTfGahExTI5H8` ("Brand Building Design System").
- Figma MCP account: Story Design `storydesign@um6p.ma` (user granted it editor access on 07-14).
- All 145 slides carry SEARULEA content: storytelling copy injected (Foreword 2, Mission 6, Story 9, Purpose 10, Audience 12, Personas 13-14 = Pieter Van Doorn / Salma Benjelloun matched to photos, ToV 16-20, Resources 145); ~105 image slots filled (env photos, premium mockups, HTML-rendered flats, Frame*.png deck slides); packaging renamed Export Crates / Branded Wrapping / Stickers; posters+banner re-uploaded with single tagline (slides 74, 96).
- English storytelling source: `SEARULEA_Brand_Storytelling_ENGLISH_Content.md` (extracted from the 24-p PDF).
- Known leftovers: slide 17 characteristics slider dots unverified; slides 41/63-64 typography specimens still say "Innovative User-Centric…"; wayfinding slides 104-108 still architecture office names; ToC slide 4 has "Logo atonomy" typo (user's own export).
- Techniques/gotchas: `use_figma` needs `await figma.setCurrentPageAsync`; unloadable "Overused Grotesk" on untouched nodes → set node.fontName to Lora(≥44px)/DM Sans then setCharacters; `upload_assets` with nodeId sets fill directly but REJECTS instance sub-ids (`I…;…`) → upload canvas-level, grab imageHash, set fills via use_figma, delete temp frames; reuse imageHash for duplicate slots; request one upload URL per node (never invent URLs).

## 3. Deliverable 2 — Online brand guidelines page (CURRENT FOCUS, v7 live)

**Artifact URL (stable): https://claude.ai/code/artifact/389f0f35-c6c1-4029-91f5-8e0f39029ca3**
To update from a NEW chat: edit + reassemble, then call Artifact with `url:` set to that URL.

- Final HTML: `searulea-brand-guidelines-online.html` (in project root; ~7.97 MB — **hard cap ≈ 8 MB**, watch size!).
- Editable source: `searulea-brand-guidelines-template.html` (= scratchpad `site/template_v5.html`) with placeholders `{{FONT_*}} {{SVG_*}} {{DL_ZIP}} {{IMG_REGISTRY}}` and images referenced by `data-i="key"` / download buttons `data-dl="key"`.
- Assembly: python script embeds fonts (handoff TTFs), inline SVG logos, a JS `const IMG={key:dataURI}` registry (dedup — each image embedded once), zip → data URI. Compressed JPGs live in scratchpad `web_assets/`, `web_assets2/`, `web_assets3/` (session-local; **regenerate from originals if scratchpad is gone** — sources all under project assets + Desktop folders + `SEARULEA_Handoff/`).
- Structure mirrors the printed book ToC exactly: Foreword → Strategic Foundation 1.1-1.8 → Tone of Voice 1.1-1.5 → Visual Identity (1 Logo 1.1-1.8 incl. lockup-decision system 1.7 + size ladder + contrast ratios; 2 Monogram; 3 Typography; 4 Colors incl. tints/proportion; 5 Photography; 6 Brand Elements incl. spiral 3 colourways; 7 Grids) → Applications (1 Print … 9 Vehicle) → Downloads.
- Design language (v7): Editorial Luxury — floating glass pill topbar, eyebrow pill badges, double-bezel cards (7px shell, 18-24px radii, diffused teal shadows `--soft`), film grain 3.2%, ease `cubic-bezier(0.32,0.72,0,1)`, blur-up staggered reveals (90ms siblings), dark/light theme, reduced-motion safe.
- Downloads: 16 HD logo PNGs + spiral colourways + per-asset JPG buttons (78 verified data: hrefs) + `SEARULEA_Brand_Assets_v2.zip` (also in project root).

## 4. Asset inventory (originals)

- `SEARULEA_Handoff/` (Desktop folder): Logos PNG+SVG ×16 (horizontal/stacked/wordmark/logomark × teal/white/sky/black), Motifs (fish SVG ×3, spiral PNG), Fonts (Lora + DM Sans variable TTFs).
- `4x/4x/`: Asset 1-36 @4x + **SPIRALE_ 1/2/3.png** (official gradient spirals; SPIRALE_2 = master). Solid recolours made via PIL alpha-fill: `assets/img/spirale_deep.png`, `assets/img/spirale_foam.png`.
- `assets/img/environment/`: 6 env photos (1_offshore, 2_fresh_at_port, 3_women, 4_traceability, 5_coast, 6_team).
- `assets/img/mockups/`: original 12 premium mockups + stationery/ subfolder (4 flats-photos).
- `assets/img/mockups_v2/` (**newest, travertine/mocha Akoya direction, Magnific nano-banana**): mk_cards, mk_flatlay, mk_poster, mk_billboard, mk_laptop, mk_phone(IG), mk_tote, mk_tshirt, mk_container, mk_flag, mupi(OLD TAGLINE — do not use), + gen3 set: pers1 (Pieter portrait), pers2 (Salma portrait), mk2_office, mk2_totem, mk2_crate, mk2_appphone, mk2_truck, mk2_rollup, mk2_polocap.
- Higgsfield set (gen/): hg_bottle, hg_stickers, hg_wrap, hg_aboard, hg_fence.
- `assets/img/social_kit/`: pfp1-3, cover_li/fb/x, ig1-9 + ig_grid, posters 1-3, covers(reports) 1-3, banners, news1/2, emailsig, broch1-4, flats (letterhead/envelope/slip), templates (tpl_*). HTML artboard generators in scratchpad `art/build*.sh` (Chrome headless pipeline).
- Business cards print PDF: `~/Desktop/Business cards Searulea.pdf` (59 pp; p1 front, p2 back with UV-spot logo).

## 5. Services / MCP state

- **Figma MCP**: works (Story Design account). Screenshot via get_screenshot → curl URL.
- **Magnific MCP**: works, `images_generate` mode `imagen-nano-banana-2` with `references:[{type:"image",identifier:…}]`. Uploaded refs: logo_white `jSKPqd5LD0`, logo_teal `rlbOFewxtc`, stacked_white `XtME0PRBfo`, stacked_teal `aQIkacbfSh`, spirale `0pzI2gKTfW`, card_front `y6UXTBhPW9`, card_back `sw1i8T2l8e`, ig_grid `MXWhM4ADCm`, web_hero `62yc61viJO`. Balance was ~31k credits.
- **Higgsfield**: daily grace-period limit hits after ~5 gens/day. Logo refs uploaded: teal `9d183bfa-…`, white `514007ee-…`, stacked white `366b99ee-…`.
- **Freepik**: 401 Unauthorized — needs re-auth in claude.ai connectors.
- **Adobe Express import**: previously blocked by full CC storage.
- **Machine gotchas**: DNS drops entirely for 1-2 min at random (all lookups incl. DoH) — poll `curl -sI https://mcp.figma.com` until non-000 then retry; no poppler (use venv+pypdf for PDFs); render HTML via Chrome headless `--headless=new --virtual-time-budget=15000` (site needs loader disabled: inject `#loader{display:none}` into a copy); Bash sandbox blocks some hosts — retry with dangerouslyDisableSandbox.

## 6. Open items / next steps

1. Website hero headline still "Tomorrow's aquaculture. Built today." — ask user whether the tagline rule applies to the site, then update `index.html` + re-render `mk_laptop`/web captures.
2. Figma leftovers (§2): wayfinding text 104-108, typography specimen slides 41/63-64, slider dots 17.
3. User may request tweaks to v7 page sections after reviewing — template + assembler make single-section edits cheap.
4. Nice-to-have: favicon/app icons from monogram; FR version of the online page; upscale key mockups (Magnific images_upscale) for print use.

## 7. Key session decisions (do not re-litigate)

- Structure of everything follows the printed book ToC (user-supplied image).
- One tagline on assets (see §1). Personas are Pieter Van Doorn & Salma Benjelloun with the generated portraits (pers1/pers2).
- Art direction for all mockups: warm travertine/mocha, hard low sun, precise shadows (akoyamockups.com reference).
- Exact assets only — never redraw/stretch the logo, spiral or fish; recolour via alpha-fill only.
