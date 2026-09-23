---
name: overflow-sui-io-design-system
source: https://overflow.sui.io/
extracted: 2026-08-28
theme: light  # measured from neutral usage weight
colors:  # roles inferred from usage frequency + luminance; names verified against values
  canvas: "#ffffff"
  ink: "#222222"
  text-muted: "#7c838a"
  surface: "#eeeeee"
  hairline: "#dddddd"
  accent: "#3898ec"  # cyan
  accent-2: "#5d6c7b"  # cyan
  accent-3: "#0082f3"  # cyan
fonts:
  primary: "TWK Everett"  # low-confidence: usage counts are low and close
  mono: "TWK Everett Mono"
---

# Sui | Overflow 2026 — Design System

Extracted from **https://overflow.sui.io/** on 2026-08-28.

Every value below is mined from the site's live CSS (45 native custom properties, ranked usage counts). Role assignments are inferred from usage and luminance and marked as such — treat them as a strong starting point, not gospel.

## Overview

The system reads as light: measured neutral usage weighs 46 light against 19 dark. The palette is chromatic: 12 saturated values against 11 neutrals, led by cyan (`#3898ec`). Font usage counts are low and close together (TWK Everett: 4, TWK Everett Mono: 4, webflow-icons: 2) — the extractor can't confidently call a primary face from CSS alone. Geometry mixes sharp corners (3px) with full pills.

## Usage rules

Derived from the measured usage below — each rule cites its evidence.

- Chromatic color is only 24% of measured color usage. Reserve `accent` (`#3898ec`) for primary actions, links, and emphasis — spreading it into body text or large surfaces breaks the ratio that defines this look.
- The theme is light (measured neutral weight 46:19). Don't flip individual sections to the opposite mode.
- `3px` is the workhorse radius (x4); treat the other radii as exceptions, not options.
- The only shadows are blur-less hairline offsets — this system barely uses elevation; don't add soft drop shadows.
- `TWK Everett Mono` is the monospace — keep it for code, data, and metadata roles.

## Colors

### Neutrals (light → dark)

| Token | Value | Usage | Inferred role |
| --- | --- | --- | --- |
| `neutral-50` | `#ffffff` | 26 | **canvas** — lightest neutral, matches the measured light-leaning theme |
| `neutral-100` | `#eeeeee` | 3 | **surface** — neutral closest to canvas luminance |
| `neutral-200` | `#dddddd` | 8 | **hairline** — next neutral near canvas, hairline-border weight |
| `neutral-300` | `#cccccc` | 9 | — |
| `neutral-400` | `#bbbec0` | 2 | — |
| `neutral-500` | `#aaadb0` | 1 | — |
| `neutral-600` | `#999999` | 2 | — |
| `neutral-700` | `#7c838a` | 6 | **text-muted** — most-used mid-luminance neutral |
| `neutral-800` | `#555555` | 1 | — |
| `neutral-900` | `#333333` | 5 | — |
| `neutral-950` | `#222222` | 8 | **ink** — darkest neutral, highest contrast against canvas |

### Accents

| Token | Value | Usage | Inferred role |
| --- | --- | --- | --- |
| `cyan` | `#3898ec` | 6 | **accent** — most-used chromatic color |
| `cyan-2` | `#5d6c7b` | 3 | **accent-2** — supporting chromatic color |
| `cyan-3` | `#0082f3` | 2 | **accent-3** — supporting chromatic color |
| `cyan-4` | `#31404e` | 2 | — |
| `green` | `#55db9c` | 2 | — |
| `yellow` | `#ffff00` | 1 | — |
| `pale-red` | `#ffdede` | 1 | — |
| `red` | `#ea384c` | 1 | — |
| `deep-cyan` | `#000f1d` | 1 | — |
| `pale-indigo` | `#e9ccff` | 1 | — |
| `cyan-5` | `#4da2ff` | 1 | — |
| `pale-indigo-2` | `#dbcdeb` | 1 | — |

## Typography

Usage counts here are low and close together, so no family can be confidently called primary from CSS declarations alone — sites that set fonts via shorthand or JS under-count. Verify visually. Full list by usage:

| Family | Usage |
| --- | --- |
| TWK Everett | 4 |
| TWK Everett Mono | 4 |
| webflow-icons | 2 |
| Arial | 1 |
| Helvetica Neue | 1 |

**Size scale (px):** `12`, `12.8`, `14`, `16`, `18`, `24`, `30`, `32`, `34`, `40`, `64`, `120`

**Weights in use:** `300` (x1), `400` (x21), `500` (x18), `700` (x6)

**Line-heights (unitless):** `0.85`, `1`, `1.1`, `1.2`, `1.25`, `1.3`, `1.38`, `1.43`

**Letter-spacing values:** `-.08em`, `-.05em`, `-.03em`, `-.0225em`, `-.02em`, `.01em`

## Spacing

Most-used values (px): `1`, `2`, `4`, `5`, `6`, `8`, `9`, `10`, `12`, `15`, `16`, `20`

## Border radius

| Token | Value | Usage |
| --- | --- | --- |
| `radius-sm` | `3px` | 4 |
| `radius-md` | `100%` | 1 |
| `radius-full` | `50%` | 2 |

## Shadows (ordered by blur radius)

- `shadow-sm` — `unset` (x1)
- `shadow-md` — `0 0 3px #3336` (x1)
- `shadow-lg` — `0 0 3px 1px #3898ec` (x1)

### Focus rings (spread-only box-shadows, kept out of the elevation scale)

- `0 0 0 1px #0000001a, 0 1px 3px #0000001a` (x1)
- `0 0 0 2px #fff` (x1)

## Breakpoints

`479px`, `767px`, `768px`, `991px`

## Starter recipes

Tokens composed into components. The source site's real components were **not** inspected — these are starting points built from the extracted values, with contrast ratios computed rather than assumed.

```css
.button-primary {
  background: var(--color-accent); /* #3898ec */
  color: var(--color-ink); /* #222222 — contrast 5.2:1 */
  border-radius: 9999px; /* pill — mined as 50% */
  font-weight: 500;
}

.card {
  background: var(--color-surface); /* #eeeeee */
  border: 1px solid var(--color-hairline); /* #dddddd */
  border-radius: 3px; /* most-used finite radius */
  box-shadow: var(--shadow-sm);
}

.input {
  background: var(--color-canvas); /* #ffffff */
  color: var(--color-ink); /* #222222 — contrast 15.9:1 */
  border: 1px solid var(--color-hairline); /* #dddddd */
  border-radius: 3px;
  /* placeholder color: var(--color-text-muted) #7c838a */
}

.nav {
  background: var(--color-canvas); /* #ffffff */
  border-bottom: 1px solid var(--color-hairline); /* #dddddd */
  color: var(--color-ink); /* #222222 */
  /* inactive links: var(--color-text-muted) #7c838a */
  /* active link: var(--color-accent) #3898ec — contrast vs canvas 3.1:1 */
}

.modal {
  background: var(--color-surface); /* #eeeeee */
  border-radius: 3px;
  box-shadow: var(--shadow-lg); /* largest mined shadow */
}

.modal-backdrop {
  background: color-mix(in srgb, var(--color-ink) 55%, transparent); /* scrim from #222222 */
}

.input-error {
  border-color: #ffdede; /* mined token: pale-red */
  /* error text: #ffdede on canvas — contrast 1.3:1, below AA; darken for message text */
}

.input-success {
  border-color: #55db9c; /* mined token: green */
}
```

## Observations

- 11 of 23 extracted colors are neutrals.
- 3 distinct shadows; the softest reaches 0px blur.
- 4 breakpoints, from 479px to 991px.

## Native CSS custom properties

First 40 of 45:

```css
:root {
  --size-unit: 16;
  --size-container-ideal: 1440;
  --size-container-min: 992px;
  --size-container-max: 2560px;
  --size-container: clamp(var(--size-container-min), 100vw, var(--size-container-max));
  --size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));
  --cubic-default: cubic-bezier(0.525, 0, 0, 1);
  --duration-default: 0.525s;
  --animation-default: var(--duration-default) var(--cubic-default);
  --spacer-title: 4.5em;
  --page-padding: 1em;
  --color--light: #f7f7f7;
  --color--blue-900: #000f1d;
  --color--orange-200: #f2eee4;
  --color--pink-400: #e9ccff;
  --gap-xxs: .5em;
  --size-nav: 4.75em;
  --color--blue-500: deepskyblue;
  --color--blue-700: #4da2ff;
  --gap-xl: 2em;
  --gap-l: 1.5em;
  --color--gray-200: #dfdfdf;
  --color--pink-200: #dbcdeb;
  --color--gray-800: #31404e;
  --color--purple-700: #5c4ade;
  --color--blue-400: #6de6f8;
  --color--green-200: #55db9c;
  --color--orange-700: #ff7a00;
  --color--dark: black;
  --color--pink-700: #ff6ada;
  --color--green-700: #3e512f;
  --color--green-400: #4df766;
  --color--yellow-900: #ffd731;
  --gap-xs: .75em;
  --size-block-large: 1.6875em;
  --color--yellow-700: #fffc4d;
  --color--green-300: #beff4d;
  --color--orange-400: #f79f4d;
  --gap-s: .875em;
  --gap-ml: 1.25em;
}
```

## Components

6 UI components were detected and rebuilt from the site's own CSS (see `components.html` for the rendered gallery):

- **Buttons** (3) — `View Overflow 2025 Winners`, `What is Sui Overflow 2026?`, `View Projects`
- **Inputs** (1) — `Follow on X`
- **Cards** (1) — `Card`
- **Navigation** (1) — `5 links`

Each is a reconstruction: real component classes matched against the extracted stylesheet with custom properties resolved. Hover/focus states are not captured.

## Files

- `tailwind.css` — Tailwind v4 `@theme` block; tokens become utilities (e.g. `bg-neutral-900`, `text-cyan`). Semantic roles alias the base palette; sizes carry line-heights; dark mode included.
- `preview.html` — a visual style-guide of this system: palette cards, type scale, spacing tables, and do/don't guidelines.
- `components.html` — a rendered gallery of the detected UI components, each with a copyable snippet.
- `variables.css` — framework-agnostic `:root` variables with semantic aliases and a `data-theme="dark"` block.
- `tokens.json` — W3C DTCG design tokens: semantic aliases, composite shadow and typography tokens, for Figma plugins, Style Dictionary, etc.
