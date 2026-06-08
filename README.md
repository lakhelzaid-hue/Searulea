# SEARULEA — Homepage

Premium, editorial homepage for **SEARULEA**, a vertically integrated Mediterranean
aquaculture operator based at Ras El Ma, Morocco.

> _Tomorrow's aquaculture. Built today._

## Stack

Pure static site — no build step.

- `index.html` — semantic markup, SEO meta, JSON-LD Organization schema
- `styles/main.css` — design tokens, editorial type scale (Fraunces + DM Sans),
  responsive grid, brand palette
- `scripts/main.js` — GSAP + ScrollTrigger for intro timeline, parallax, scroll
  reveals, count-ups
- `assets/img/` — official wordmark (light + ink), hero photography, brand pattern
- `assets/svg/` — fallback mark + decorative SVGs

## Local preview

Any static server works. From the project root:

```bash
npx serve . -l 5173
```

Then open <http://localhost:5173>.

## Deploy

The project is ready for any static host. Recommended:

```bash
# Vercel
npx vercel --prod

# Netlify
npx netlify deploy --prod --dir=.

# Cloudflare Pages
# upload the folder via the dashboard at pages.cloudflare.com
```

## Brand voice

Vision-first, proof-second. Numbers and proper nouns do the persuading. No
conditionals, no "we believe in," no empty sustainability claims. Rooted in
Morocco by conviction.

---

© SEARULEA · All rights reserved.
Designed and built in Morocco · Standards for the world.
