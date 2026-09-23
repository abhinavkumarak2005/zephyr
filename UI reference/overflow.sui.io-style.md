# Design System — Sui | Overflow 2026 (overflow.sui.io)

> Source: https://overflow.sui.io

## Typography

**Font Families**
- `sans-serif`
- `monospace`
- `webflow-icons`
- `webflow-icons !important`
- `Arial`
- `serif`
**CSS Font Variables**
```css
--size-font: calc(var(--size-container) / (var(--size-container-ideal) / var(--size-unit)));
```
**Size Scale**: `.65em` · `.7em` · `.725em` · `.75em` · `.8em` · `.85em` · `.875em` · `.875rem` · `.884em` · `.9em` · `.95em` · `1em` · `1rem` · `1.125rem` · `1.125em` · `1.25em`

## Colors

**CSS Color Variables**
```css
--color--light: #f7f7f7;
--color--blue-900: #000f1d;
--color--orange-200: #f2eee4;
--color--pink-400: #e9ccff;
--color--blue-500: deepskyblue;
--color--blue-700: #4da2ff;
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
--color--yellow-700: #fffc4d;
--color--green-300: #beff4d;
--color--orange-400: #f79f4d;
--color--gray-400: #bbbec0;
--color--gray-700: #61686d;
```
**Palette** (by frequency)
`#3898ec` · `#7c838a` · `#fafafa` · `#c8c8c8` · `#bbbec0` · `#5d6c7b` · `#0082f3` · `#31404e` · `#55db9c` · `#aaadb0` · `#e2e2e2` · `#ffdede` · `#f3f3f3` · `#ea384c` · `#758696` · `#2895f7` · `#f7f7f7` · `#000f1d` · `#f2eee4` · `#e9ccff`

## Spacing & Sizing

```css
--size-unit: 16;
--size-container-ideal: 1440;
--size-container-min: 992px;
--size-container-max: 2560px;
--size-container: clamp(var(--size-container-min), 100vw, var(--size-container-max));
--spacer-title: 4.5em;
--page-padding: 1em;
--gap-xxs: .5em;
--size-nav: 4.75em;
--gap-xl: 2em;
--gap-l: 1.5em;
--gap-xs: .75em;
--size-block-large: 1.6875em;
--gap-s: .875em;
--gap-ml: 1.25em;
--size-block-small: .875em;
--gap-m: 1em;
--gap-xxl: 3em;
```

## Border Radius

**Values found**: `.15625rem` · `1em` · `2px` · `3px` · `100em`

## Shadows

- `unset`
- `0 0 0 1px #0000001a, 0 1px 3px #0000001a`
- `0 0 3px #3336`
- `0 0 0 2px #fff`
- `0 0 3px 1px #3898ec`

## Other Tokens

```css
--cubic-default: cubic-bezier(0.525, 0, 0, 1);
--duration-default: 0.525s;
--animation-default: var(--duration-default) var(--cubic-default);
```

## All CSS Custom Properties

```css
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
--color--gray-400: #bbbec0;
--color--gray-700: #61686d;
--size-block-small: .875em;
--gap-m: 1em;
--gap-xxl: 3em;
```