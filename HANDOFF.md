# SEARULEA — Project Handoff

**Prepared:** 2026-06-17
**Type:** Marketing homepage (single-page, static site)
**Status:** Built, in GitHub, deployed on Vercel

> _Tomorrow's aquaculture. Built today. — From our shores, for the world._

---

## 1. What this is

A premium, editorial **one-page homepage** for **SEARULEA**, a vertically
integrated Mediterranean aquaculture operator based at **Ras El Ma, Nador,
Morocco**. The page targets three audiences at once — distributors/clients,
investors, and press/institutions — and is written to read as B2B/credibility-first.

Key business facts surfaced on the page:
- **375 ha** offshore concession at Ras El Ma (government-signed)
- **2,790 t** annual volume target by 2031
- **ONSSA-certified**, built to European norms
- Species: **sea bream, sea bass, meagre**
- **IoT lot-by-lot traceability**, cold chain from cage to truck
- Export via the **port of Ras Kebdana**
- Target of **at least 40% women in direct employment**
- Biosecurity + solar energy designed into the CAPEX

---

## 2. Links & accounts

| What | Value |
|---|---|
| **GitHub repo** | https://github.com/lakhelzaid-hue/Searulea |
| **Default branch** | `main` |
| **Hosting** | Vercel (auto-deploys on every push to `main`) |
| **Live URL** | ⚠️ Find the real one in the [Vercel dashboard](https://vercel.com/dashboard) → Searulea project. `searulea.vercel.app` does **not** resolve (that base name was taken); the real URL is likely `searulea-<suffix>.vercel.app`. |
| **Local project path** | `~/Documents/Claude/Projects/SEARULEA` |

**Deploy pipeline:** local edit → `git push` → Vercel rebuilds & publishes in ~20s.
No build step (static files served as-is).

---

## 3. Tech stack

- **Plain static site** — no framework, no bundler, no build step.
- **HTML** — single `index.html`, semantic, with SEO meta + JSON-LD Organization schema.
- **CSS** — one `styles/main.css`, design tokens via CSS custom properties.
- **JS** — one `scripts/main.js`, vanilla + **GSAP 3.12.5** (loaded from jsDelivr CDN) with the **ScrollTrigger** plugin.
- **Fonts** — Google Fonts: **Fraunces** (serif display) + **DM Sans** (body). `Canela Deck` wired as a `local()` fallback for licensed installs.

Cache-busting: `index.html` references `main.css?v=NN` and `main.js?v=NN`.
**Bump the `v` number whenever you edit CSS/JS** so browsers fetch the new file.
Currently `css?v=27`, `js?v=23`.

---

## 4. File structure

```
SEARULEA/
├── index.html              # the whole page (markup + inline SVGs + SEO)
├── styles/main.css         # design system + all section styles + loader
├── scripts/main.js         # GSAP loader intro + scroll animations
├── README.md
├── HANDOFF.md              # this file
├── .gitignore
├── .claude/launch.json     # local preview server config (gitignored)
└── assets/
    ├── img/
    │   ├── hero-cages.jpg       # ✅ USED — hero background photo
    │   ├── spirale-teal.png     # ✅ USED — spiral motif (Why Morocco + Manifesto)
    │   ├── wordmark-ink.png     # ✅ USED — footer wordmark (dark teal)
    │   ├── spirale.png          # ⛔ unused — original mono spiral
    │   ├── spirale-color.png    # ⛔ unused — colorful teal→gold spiral
    │   └── wordmark-light.png   # ⛔ unused — cream wordmark (was loader, now fish→A)
    └── svg/
        ├── mark.svg            # ✅ USED — favicon
        ├── wordmark.svg        # ✅ referenced in JSON-LD logo URL
        ├── mark-official.svg   # ⛔ reference copy (nav uses inline paths)
        ├── fish-official.svg   # ⛔ reference copy (loader uses inline paths)
        ├── fish.svg            # ⛔ unused (early placeholder)
        └── mark.svg            # (favicon)
```

**Note on inline SVGs:** the nav "A" dot-mark and the loader fish + "A" are
embedded directly in `index.html` as `<path>` data (not file references) so GSAP
can animate the individual dots. The standalone `.svg` files in `assets/svg/`
are kept as source/reference.

**Unused assets** (safe to delete to slim the repo): `spirale.png`,
`spirale-color.png`, `wordmark-light.png`, `fish.svg`, `fish-official.svg`,
`mark-official.svg`. Left in place intentionally in case design direction reverts.

---

## 5. Design system

### Colors (CSS variables in `:root`)

| Token | Hex | Use |
|---|---|---|
| `--ink-100` | `#074154` | Deepest teal — dark section backgrounds, primary text |
| `--ink-90`  | `#09546D` | Mid-dark teal |
| `--ink-80`  | `#0A6887` | Mid teal — accents, `em` highlights |
| `--sky`     | `#D0E7ED` | Pale blue — italic highlights on dark |
| `--sand`    | `#EFE8D8` | Cream — text/marks on dark surfaces, primary CTA |
| `--paper`   | `#FBF9F4` | Off-white — page background, nav-scrolled background |
| `--line`    | `rgba(7,65,84,.14)` | Hairline borders |
| `--muted`   | `rgba(7,65,84,.62)` | Secondary text |

Spiral motif color (in `spirale-teal.png`): `#0C7190`.

### Typography

- **Display / headings:** Fraunces (weights 300–500, italic available). Tight tracking, low line-height for editorial feel.
- **Body / UI / eyebrows:** DM Sans (300–600). Eyebrows are uppercase, 0.22em tracking.
- Fluid scale via `clamp()` — see `--fs-*` tokens. Hero title `clamp(48px, 8.8vw, 156px)`.

### Layout

- Max content width `--max: 1640px`, fluid gutter `clamp(20px, 4vw, 64px)`.
- Sections pad `clamp(72px, 9vw, 144px)` vertically.
- Easing: `--ease-out: cubic-bezier(.22,1,.36,1)`.

---

## 6. Brand voice (copy rules)

From the SEARULEA Brand Storytelling guide — **follow these when editing copy**:

- **Lead with vision, prove with facts.** Numbers and proper nouns do the persuading — not adjectives.
- **Present/future tense, never conditional.** "We build…", not "we would…".
- **Never** use: "passion for the sea", empty "sustainable development", "innovative solutions", corporate filler, or "we believe in…" (use "we build…").
- **Pride in Morocco, unapologetic.** "Rooted in Morocco by conviction."
- Signature lines: _"Our chain. Our commitments. Your certainty."_ · _"From our shores, for the world."_ · _"Tomorrow's aquaculture. Built today."_

**Positioning note (important):** the product is positioned as **fresh, cold-chain**
seafood — NOT frozen/IQF. Copy says "fresh conditioning at port" and "cold chain
& traceability". Do not reintroduce "IQF" or "onshore processing".

---

## 7. Page sections (top → bottom)

| # | Section | Anchor | Nav label | Notes |
|---|---|---|---|---|
| — | **Loading intro** | — | — | GSAP: dot cloud → fish → "A" mark → "A" flies to navbar + curtain opens. Plays every reload (~3.4s). Skipped on `prefers-reduced-motion`. |
| — | **Nav** | — | — | Transparent over hero, fades to off-white (`--paper`) on scroll past 24px. Centered dot-mark between split menu links; "Speak to our trade desk" CTA right. |
| 1 | **Hero** | `#hero-title` | — | Full-bleed `hero-cages.jpg` photo + teal veil overlay. 3-line title, deck, dual CTA. **No spiral** (removed per client). |
| — | **Marquee** | — | — | Scrolling proof strip: 375 ha · 2,790 t · ONSSA · 40% Women in Direct Employment · IoT · Ras Kebdana. |
| 2 | **Our Process** | `#chain` | Our Process | 4 steps: Offshore farming → Fresh conditioning at port → Cold chain & traceability → Export. Title "From cage to port." |
| 3 | **Why Morocco** | `#sovereignty` | Why Morocco | Dark teal. Pull quote + sovereignty thesis. **Spiral motif** (rotates on scroll). Mentions hatchery + feed on the roadmap. |
| 4 | **Engineered to Last** | `#proof` | Engineered to Last | Pale-blue. 4 number cards w/ count-up: 375 · 2,790 t · ≥40% · 100% IoT. |
| 5 | **Our Commitment** | `#audiences` | Our Commitment | 3 audience doors: Distributors / Investors / Press (hover → teal). |
| — | **Manifesto** | — | — | Dark teal, centered long-form. **Spiral motif** (rotates on scroll). |
| — | **Footer** | `#contact` | — | Wordmark (ink), Ras El Ma / Morocco / ONSSA, contact emails, "All rights reserved". |

**Footer contact emails are placeholders** — `trade@`, `investors@`, `press@searulea.com`. Replace with real addresses.

---

## 8. Animations

All in `scripts/main.js`, guarded by `prefers-reduced-motion`.

**Loader intro** (GSAP timeline, ~3.4s, plays every page load):
1. 27 dots fade in at random positions (cloud)
2. Dots travel to form the **fish** silhouette
3. Fish dissolves outward while the 10-dot **"A" mark** grows in its place
4. "A" flies to the navbar position; split curtain (two teal panels) opens; nav's "A" crossfades in on arrival
- Safety timeout (8s) removes the loader if GSAP fails to load.

**Scroll animations** (GSAP ScrollTrigger):
- Hero photo: parallax drift + slight zoom
- Section reveals: fade/translate up (`.reveal`, `.reveal-line`)
- Number count-ups on the proof cards
- **Spiral rotation**: `.sovereignty__bg` + `.manifesto__bg` rotate ~60° as you scroll through them (`scrub: 1`)
- Nav: toggles `.is-scrolled` past 24px

> The hero used to have a spinning spiral too — **removed** at client request (commit `a55891b`). The rotation pattern still lives on the Why Morocco / Manifesto spirals if you ever want to re-add it.

---

## 9. SEO / metadata

- `<title>`, meta description, keywords, theme-color (`#074154`)
- Open Graph + Twitter card tags
- JSON-LD `Organization` schema (name, location MA/Nador/Ras El Ma, areaServed, knowsAbout)
- ⚠️ **No `og:image` set** — social shares show no preview image. Add a 1200×630 JPG at `assets/img/og.jpg` + `<meta property="og:image">`.
- Favicon: `assets/svg/mark.svg`.

---

## 10. Run locally

Any static server works (no build). From the project root:

```bash
npx serve . -l 5173
# then open http://localhost:5173
```

The repo's `.claude/launch.json` uses `npx serve` on port 5173 for the Claude
Code preview tool.

---

## 11. Update & deploy

```bash
cd ~/Documents/Claude/Projects/SEARULEA
# ...edit files...
# bump ?v=NN in index.html for any CSS/JS change
git add .
git commit -m "your message"
git push          # Vercel auto-deploys main in ~20s
```

Auth: pushes use a GitHub Personal Access Token stored in macOS Keychain
(set up during initial deploy). If a push asks for credentials, username is
`lakhelzaid-hue`, password is the PAT.

---

## 12. Known issues / things to finish

- [ ] **Real Vercel URL** — confirm and document it (the `searulea.vercel.app` guess fails DNS).
- [ ] **Custom domain** — if SEARULEA owns `searulea.com`, add it in Vercel → Settings → Domains.
- [ ] **Footer emails** — replace placeholder `@searulea.com` addresses with real ones.
- [ ] **og:image** — add a branded 1200×630 social-share image.
- [ ] **Favicon set** — add `favicon.ico` + `apple-touch-icon.png` for full coverage (currently SVG only).
- [ ] **Copy consistency on the 40% claim** — marquee says "40% Women in Direct Employment"; the proof card + press door still say "target / at least 40%". Align wording if desired.
- [ ] **Delete unused assets** (see §4) to slim the repo.
- [ ] **Canela Deck** — the licensed display font is wired as a `local()` fallback only; Fraunces is the live font. Install Canela on the build machine or self-host if exact brand type is required.

---

## 13. Backlog / next phase ideas

- Inner pages: About, Sustainability brief, Trade brief, Investor pack (download).
- Real site photography of the Ras El Ma concession (replace/augment hero).
- Contact form (currently CTAs are mailto/anchor only).
- FR/EN language toggle (brand operates bilingually; current site is EN).
- Analytics (Vercel Web Analytics is one click in the dashboard).

---

## 14. Source brand materials

The build was derived from two client documents (not in the repo):
- **SEARULEA V4.pdf** — visual brand guideline (logo, color system, typography, brand assets/spirals)
- **SEARULEA - Brand Storytelling.pdf** — tone of voice, do/don't, key messages per audience, manifesto, vocabulary

Original brand asset source folder on the designer's machine:
`~/Desktop/BELDOCH CONCIERGERIE/SEARULEA/` (logo system, mockups, spiral/fish/mark vectors, .ai/.psd files).

---

_Built with Claude Code. Static, fast, framework-free — designed to last._
