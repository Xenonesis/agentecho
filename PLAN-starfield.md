# Plan: starfield background + full responsive coverage

## Context
Landing page currently has one breakpoint (760px). User wants tighter responsiveness across small/medium screens and a starfield canvas behind the page in both themes, sourced from the shadcn.io Starfield background (canvas, z-depth projection, twinkling).

## Approach

### 1. Starfield canvas
- Add `<canvas id="starfield">` as a sibling of content, `position: fixed; inset: 0; z-index: 0; pointer-events: none;`
- Body bg → transparent so canvas shows through. Cards (`.demo`, `.code-wrap`, `.setting-card`, `.arch-card`, `.compare-col`, `.license`, `.privacy`) keep opaque `--bg-elev` so content stays readable.
- Canvas fills with the theme bg color each frame, then draws stars. Theme switch repaints instantly (canvas reads `data-theme` attribute live).
- Vanilla JS starfield: 400 stars desktop / 150 mobile, each with `(x, y, z)`. Projection: `screenX = (x/z) * focal + cx`. Streak rendered as line from previous projected pos to current. Twinkle via sin() on alpha. z decreases per frame; on `z <= 0`, respawn at far depth.
- DPR-aware (cap at 2). Resize handler. `prefers-reduced-motion` → render one static frame, no animation. Pause via `visibilitychange`.
- Color per theme:
  - Light: `rgba(10,10,10,α)` faint (alpha 0.15–0.5)
  - Dark: `rgba(255,255,255,α)` bright (alpha 0.4–1.0)
- Sit canvas + content in z-stack: canvas at 0, `.topbar .wrap section footer` at 1.

### 2. Responsive breakpoints
Add two new breakpoints between current 760px and `min-width: 0`:

- `@media (max-width: 480px)` — phone portrait
  - topbar: hide brand text or `.repo-name`, shrink padding
  - hero h1: clamp lower bound 28px
  - hero buttons: full-width stack
  - demo card: full-width, padding 16px
  - `.step`, `.setting-card`, `.arch-card`: tighter padding (20px)
  - footer row: center, column on flex
- `@media (max-width: 380px)` — small phones
  - topbar: hide brand dot+text? No — keep brand visible. Hide `.repo-badge .repo-stars`, leave icon+name OR icon-only
  - reduce wrap padding to 16px
  - `.eyebrow` font-size 11px
- `@media (min-width: 761px) and (max-width: 1024px)` — tablet (optional)
  - steps: 3 cols (keep), tighter padding
  - compare/privacy: 2 cols (keep), tighter gap

Also fix:
- `.topbar` should not overflow horizontally — set `min-width: 0` and let children shrink
- `.repo-badge` truncate name gracefully (already has ellipsis)
- Hero `.hero-actions` already wraps — confirm gap stays clean
- Demo card: ensure `max-width: 100%` + internal padding doesn't overflow on 320px screens

## Files to modify
- `landing.html` only (single-file site). No other files touched.

## Reuse
- Existing CSS tokens (`--bg`, `--code-bg`, etc.) — canvas clears with `var(--bg)` resolved via `getComputedStyle`.
- Existing `.demo`, `.code-wrap`, `.compare-col`, `.setting-card`, `.arch-card`, `.license`, `.privacy`, `.note` already have opaque `--bg-elev` backgrounds → content readability preserved over canvas.
- Existing `prefers-reduced-motion` block in CSS → JS reads same MQ.
- Existing theme toggle JS (already toggles `data-theme`) → starfield JS watches the same attribute via `MutationObserver`.

## Steps
- [ ] Body bg → transparent, add stacking (`position: relative`, z-index on topbar/wrap/section/footer)
- [ ] Add `<canvas id="starfield">` right after `<div class="topbar">` close OR as first child of body
- [ ] CSS: starfield canvas rules
- [ ] CSS: add `@media (max-width: 480px)` and `@media (max-width: 380px)` blocks; tighten tablet block
- [ ] JS: starfield class — `init`, `animate`, theme observer, resize, visibility, reduced-motion
- [ ] JS: hook into existing IIFE (append, don't duplicate)
- [ ] Verify: open file, check no layout overflow at 320/375/414/768/1024/1440

## Verification
- Manually open `landing.html` in browser
- Resize from 320px → 1920px, confirm: topbar doesn't overflow, hero h1 stays legible, demo card stays inside `.demo`, code block scrolls horizontally, all cards stack cleanly
- Toggle theme: canvas re-fills with new bg, stars re-draw in new color
- DevTools → Performance: confirm starfield ~60fps on desktop, ~30fps acceptable on mobile
- DevTools → Rendering: emulate `prefers-reduced-motion: reduce` → canvas shows static frame, no animation