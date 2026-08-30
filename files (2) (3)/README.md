# MY BRAND — Cinematic Agency Site

A premium, scroll-driven one-pager built with vanilla HTML/CSS/JS, GSAP + ScrollTrigger, and Lenis for smooth scrolling. Inspired by the motion quality of high-end interactive agency sites — original design, copy, and visual identity (no assets or branding copied from any reference site).

## Run locally

No build step. Any static server works, e.g.:

```bash
npx serve .
# or
python3 -m http.server 5500
```

Then open the printed local URL. (Opening `index.html` directly via `file://` also works, but a local server avoids any browser CORS quirks with fonts/images.)

## Deploy

**Vercel**
```bash
npm i -g vercel
vercel
```
Framework preset: "Other" — it's a static site, no build command needed.

**Netlify**
Drag-and-drop the project folder onto https://app.netlify.com/drop, or:
```bash
npm i -g netlify-cli
netlify deploy --prod
```

## Structure

```
index.html    → markup for all 8 sections + nav + footer
style.css     → design tokens, layout, all section styling
script.js     → Lenis + GSAP setup, ScrollTrigger animations, image config
assets/       → reserved for your own images/video once ready
```

## Swapping in real images

All imagery is centralized at the top of `script.js`:

```js
const IMAGES = {
  hero:    "...",
  feature: "...",
  story1:  "...",
  story2:  "...",
  story3:  "...",
};
```

Replace each URL with your own asset path (e.g. `assets/hero.jpg`) — nothing else needs to change. Placeholder images are royalty-free Unsplash photos for development only.

## Design tokens (edit at the top of `style.css`)

- `--bg` / `--bg-alt` / `--panel` — layered near-black backgrounds with a cool cast
- `--ink` / `--ink-dim` — warm off-white text and its muted secondary
- `--brass` — the single accent color (glows, underlines, the timecode HUD)
- Type: **Fraunces** (editorial display serif), **Inter** (body), **IBM Plex Mono** (timecode/labels)

## Notable interactions

- Custom ring-and-dot cursor (desktop only; disabled on touch)
- Bottom-left film-timecode HUD that ticks with scroll progress — the page's signature motif
- Pinned "Featured Project" section that scales a frame from a thumbnail to near full-bleed
- Three distinct image treatments in the cinematic story section: scale/fade, slide-in, clip-path reveal
- Horizontal "Process" track driven by vertical scroll, pinned via ScrollTrigger
- Magnetic CTA button that follows the cursor within its bounds

## Accessibility & performance

- Respects `prefers-reduced-motion`: Lenis and scrub/pin ScrollTrigger instances are skipped, and content is set to its final, fully visible state.
- Custom cursor and horizontal scroll are automatically disabled on touch/coarse-pointer devices.
- Images are lazy-loaded except the hero.
- Visible keyboard focus states on all interactive elements.
- No horizontal overflow at any breakpoint; mobile nav collapses to a full-screen menu.

## Before going live

- Swap placeholder copy (studio name "MY BRAND", email, social links) for the real ones.
- Replace Unsplash placeholders with licensed/final imagery.
- Update `mailto:` address in the footer and CTA button.
