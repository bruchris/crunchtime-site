# Custom Cursor Effect — Design

**Date:** 2026-05-01
**Branch:** `feat/custom-cursor-effect`
**Status:** Approved (pending written review)

## Goal

Port the dot-and-trailing-ring cursor effect from the `crunchtime-landingsside (1).html` draft into the live Next.js site so it runs across all pages, with sensible behavior on touch devices and an opt-out for users who prefer reduced motion.

## Behavior

The effect has three modes, decided at runtime from `matchMedia` queries.

### 1. Fine pointer (mouse / trackpad)

- Native cursor is hidden site-wide.
- A small accent-colored dot snaps to the pointer position.
- A larger ring lerps toward the dot at ~12% per animation frame, producing a soft trailing effect.
- When the pointer is over an interactive element (`a`, `button`, `input`, `textarea`, `select`, `label`, `[role="button"]`), the ring scales to ~1.6× to signal interactivity.

### 2. Coarse pointer (touch)

- Native cursor / touch behavior is left alone (no `cursor: none`).
- Dot and ring are hidden by default (opacity 0, no pointer events).
- On `touchstart`, both fade in at the touch point (~120 ms).
- On `touchmove`, they follow the first active touch, with the ring using the same lerp easing as the mouse case.
- On `touchend` / `touchcancel`, both fade out (~200 ms).
- Multi-touch is ignored beyond the first touch — keeps interaction simple.
- The ring briefly pulses (1.0 → 1.4× → 1.0) on `touchstart` to give a tap feel, since there is no hover concept on touch.

### 3. Reduced motion

- If `prefers-reduced-motion: reduce` matches, the effect is not rendered at all — native cursor remains, no event listeners attached, no rAF loop running.

### Mode switching

`matchMedia` listeners watch `(pointer: fine)`, `(pointer: coarse)`, and `(prefers-reduced-motion: reduce)`. When any change fires (e.g., user plugs a mouse into a tablet), the component re-evaluates and re-mounts the appropriate behavior. SSR renders nothing; mode is determined only client-side.

## Architecture

One client component, one CSS block, no new dependencies.

### Component: `app/_components/CursorEffect.tsx`

- `"use client"` directive.
- Renders two absolutely-positioned `div`s: `.cursor-dot` and `.cursor-ring`. Both are wrapped in a parent that is hidden until the component decides a mode.
- Internal state: current mode (`"fine" | "coarse" | "off"`), and `isTouching` boolean for coarse mode.
- Refs hold the dot and ring DOM nodes; positions are written directly via `style.transform` to avoid React re-renders on every mousemove/touchmove.
- Single `requestAnimationFrame` loop runs only while the effect is active (fine mode always; coarse mode only between `touchstart` and `touchend`'s fade-out completion).
- Cleanup: all listeners + rAF cancelled on unmount and on mode change.

### Mounting

Imported and rendered once at the bottom of `<body>` in [app/layout.tsx](../../../app/layout.tsx), after `<footer>`, so it overlays everything.

### Styles

Added to [app/globals.css](../../../app/globals.css):

- `.cursor-dot` — 10×10 px, accent color, border-radius 50%, `position: fixed`, `pointer-events: none`, `z-index: 9999`, `will-change: transform`. Uses `transform: translate3d(...)` for positioning.
- `.cursor-ring` — 36×36 px, 1px accent-colored border at 0.4 alpha, otherwise same fixed/no-pointer-events/z-index setup. `transition: transform 0.2s, opacity 0.2s` for the hover scale and fade.
- `.cursor-effect-host` — wrapper around both, controls visibility via `opacity` and a CSS transition for the touch fade in/out.
- `html.cursor-effect-fine` — sets `cursor: none` site-wide. The class is toggled by the component only when fine-pointer mode activates. Without this class (SSR, no-JS, touch, reduced-motion) the native cursor is preserved.
- `.cursor-ring--hover` — modifier class for the 1.6× hover scale.
- `.cursor-ring--tap` — short-lived modifier for the touch tap pulse, removed via `setTimeout` after the animation completes.

### Hover detection (fine mode)

A delegated `mouseover` / `mouseout` handler on `document` checks `event.target.closest('a, button, input, textarea, select, label, [role="button"]')` and toggles `.cursor-ring--hover`. Avoids per-element listeners and works for content rendered after the component mounts.

## Files Changed

- `app/_components/CursorEffect.tsx` — new client component.
- `app/layout.tsx` — render `<CursorEffect />` once inside `<body>`.
- `app/globals.css` — add cursor styles and the `html.cursor-effect-fine` rule.

No changes to `package.json`. No new dependencies.

## Edge Cases

- **SSR / first paint:** Component renders nothing on the server. On the client, mode is decided in `useEffect`, so there is no flash of `cursor: none` before JS hydrates.
- **Hybrid devices:** A device that matches both `pointer: fine` and `pointer: coarse` (or switches between them) is treated as fine when `(pointer: fine)` matches; coarse-only when only `(pointer: coarse)` matches. Users who switch input methods see the mode change live.
- **`prefers-reduced-motion` toggled mid-session:** The matchMedia listener catches it; if it flips to `reduce`, the component tears down listeners, removes `html.cursor-effect-fine`, and renders nothing.
- **Performance:** `transform`-only writes, single rAF loop, no React state churn on movement. Touch loop only runs while a finger is down.
- **Pointer leaving the window (fine mode):** The dot/ring stay where they were on `mouseleave` — visually fine. Re-engages on `mouseenter`.
- **Long-press / scroll on touch:** `touchmove` fires during scrolls; the effect simply tracks the finger and fades out on release. No interference with native scroll.

## Out of Scope

- Hover scaling on touch — covered indirectly by the `--tap` pulse.
- Different cursor styles per page or section.
- Cursor-following text labels or interactive cursor states beyond hover scale.
- Settings / user toggle to disable. (Reduced-motion preference is the only opt-out.)

## Testing

Manual verification:

1. Desktop (mouse): native cursor hidden, dot snaps, ring trails, scales over nav links and buttons.
2. Desktop with `prefers-reduced-motion`: native cursor visible, no overlay rendered.
3. Touch device (phone or browser devtools touch emulation): native touch behavior unchanged; tapping shows the dot+ring blooming, dragging shows the ring trailing the finger, releasing fades it out.
4. Hybrid device: unplug/plug mouse on a Surface or iPad with trackpad — confirm mode switches without reload.
5. Lighthouse / no console errors during navigation between `/`, `/consulting`, `/contact`, `/back-office/finance`.
