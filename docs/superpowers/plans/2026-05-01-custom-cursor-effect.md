# Custom Cursor Effect Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a dot-and-trailing-ring custom cursor across the site, with mouse, touch, and reduced-motion modes.

**Architecture:** A single client component `CursorEffect` renders two fixed-positioned divs (dot + ring), is mounted once in the root layout, and decides its mode at runtime via `matchMedia`. CSS lives in `app/globals.css`; positions are written via `transform` in a single `requestAnimationFrame` loop to avoid React re-renders on movement.

**Tech Stack:** Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript.

**Spec:** [docs/superpowers/specs/2026-05-01-custom-cursor-effect-design.md](../specs/2026-05-01-custom-cursor-effect-design.md)

**Note on testing:** This project has no unit-test framework configured (no jest/vitest in `package.json`). For a UI-only visual effect, adding one would be disproportionate. Verification per task uses `npm run typecheck`, `npm run lint`, `npm run build`, and explicit manual browser checks. Each task ends with a commit so progress is reversible.

---

### Task 1: Add cursor CSS to globals

**Files:**
- Modify: `app/globals.css` (append at end)

- [ ] **Step 1: Append cursor styles to `app/globals.css`**

Append the following block to the end of `app/globals.css`. Do not modify any existing rules.

```css
/* Custom cursor effect — see docs/superpowers/specs/2026-05-01-custom-cursor-effect-design.md */
.cursor-effect-host {
  opacity: 0;
  pointer-events: none;
  position: fixed;
  inset: 0;
  z-index: 9999;
  transition: opacity 200ms ease;
}

.cursor-effect-host[data-active="true"] {
  opacity: 1;
}

/* Position layer — moved every frame by JS, no transitions to avoid fighting rAF. */
.cursor-dot,
.cursor-ring-wrap {
  left: 0;
  pointer-events: none;
  position: fixed;
  top: 0;
  will-change: transform;
}

.cursor-dot {
  background: var(--color-accent);
  border-radius: 50%;
  height: 10px;
  margin-left: -5px;
  margin-top: -5px;
  width: 10px;
}

/* Visual layer — scaled via CSS with transition; sits inside the wrap. */
.cursor-ring {
  border: 1px solid color-mix(in srgb, var(--color-accent) 40%, transparent);
  border-radius: 50%;
  height: 36px;
  margin-left: -18px;
  margin-top: -18px;
  transition: transform 200ms ease;
  width: 36px;
}

.cursor-ring[data-hover="true"] {
  transform: scale(1.6);
}

.cursor-ring[data-tap="true"] {
  animation: cursorTap 280ms ease-out;
}

@keyframes cursorTap {
  0% { transform: scale(1); }
  50% { transform: scale(1.4); }
  100% { transform: scale(1); }
}

html.cursor-effect-fine,
html.cursor-effect-fine body,
html.cursor-effect-fine a,
html.cursor-effect-fine button,
html.cursor-effect-fine input,
html.cursor-effect-fine textarea,
html.cursor-effect-fine select,
html.cursor-effect-fine label {
  cursor: none;
}

@media (prefers-reduced-motion: reduce) {
  .cursor-effect-host {
    display: none;
  }
}
```

- [ ] **Step 2: Verify CSS still compiles**

Run: `npm run build`
Expected: Build succeeds with no CSS errors. (The build output will mention compiling `app/globals.css`.)

If `npm run build` is too slow for a quick check, run `npm run lint` and `npm run typecheck` instead and skip the full build until the end of Task 3.

- [ ] **Step 3: Commit**

```bash
git add app/globals.css
git commit -m "Add custom cursor styles to globals.css"
```

---

### Task 2: Create the CursorEffect client component

**Files:**
- Create: `app/_components/CursorEffect.tsx`

- [ ] **Step 1: Create the component file**

Create `app/_components/CursorEffect.tsx` with the following exact contents:

```tsx
"use client";

import { useEffect, useRef, useState } from "react";

type Mode = "off" | "fine" | "coarse";

const HOVER_SELECTOR = "a, button, input, textarea, select, label, [role=\"button\"]";
const RING_LERP = 0.18;
const TOUCH_FADE_OUT_MS = 220;
const TAP_DURATION_MS = 300;

export function CursorEffect() {
  const [mode, setMode] = useState<Mode>("off");
  const hostRef = useRef<HTMLDivElement | null>(null);
  const dotRef = useRef<HTMLDivElement | null>(null);
  const ringWrapRef = useRef<HTMLDivElement | null>(null);
  const ringRef = useRef<HTMLDivElement | null>(null);

  // Decide and update mode based on matchMedia.
  useEffect(() => {
    const mqlReduce = window.matchMedia("(prefers-reduced-motion: reduce)");
    const mqlFine = window.matchMedia("(pointer: fine)");
    const mqlCoarse = window.matchMedia("(pointer: coarse)");

    const decide = () => {
      if (mqlReduce.matches) {
        setMode("off");
        return;
      }
      if (mqlFine.matches) {
        setMode("fine");
        return;
      }
      if (mqlCoarse.matches) {
        setMode("coarse");
        return;
      }
      setMode("off");
    };

    decide();
    mqlReduce.addEventListener("change", decide);
    mqlFine.addEventListener("change", decide);
    mqlCoarse.addEventListener("change", decide);

    return () => {
      mqlReduce.removeEventListener("change", decide);
      mqlFine.removeEventListener("change", decide);
      mqlCoarse.removeEventListener("change", decide);
    };
  }, []);

  // Wire up the active mode's behavior.
  useEffect(() => {
    const host = hostRef.current;
    const dot = dotRef.current;
    const ringWrap = ringWrapRef.current;
    const ring = ringRef.current;
    if (!host || !dot || !ringWrap || !ring) return;

    if (mode === "off") {
      document.documentElement.classList.remove("cursor-effect-fine");
      host.dataset.active = "false";
      return;
    }

    let dotX = window.innerWidth / 2;
    let dotY = window.innerHeight / 2;
    let ringX = dotX;
    let ringY = dotY;
    let rafId = 0;
    let running = false;

    const writeDot = () => {
      dot.style.transform = `translate3d(${dotX}px, ${dotY}px, 0)`;
    };
    const writeRingWrap = () => {
      ringWrap.style.transform = `translate3d(${ringX}px, ${ringY}px, 0)`;
    };
    const tick = () => {
      ringX += (dotX - ringX) * RING_LERP;
      ringY += (dotY - ringY) * RING_LERP;
      writeRingWrap();
      rafId = requestAnimationFrame(tick);
    };
    const startLoop = () => {
      if (running) return;
      running = true;
      rafId = requestAnimationFrame(tick);
    };
    const stopLoop = () => {
      running = false;
      cancelAnimationFrame(rafId);
    };

    writeDot();
    writeRingWrap();

    if (mode === "fine") {
      document.documentElement.classList.add("cursor-effect-fine");
      host.dataset.active = "true";

      const onMove = (e: MouseEvent) => {
        dotX = e.clientX;
        dotY = e.clientY;
        writeDot();
      };
      const onOver = (e: MouseEvent) => {
        const target = e.target as Element | null;
        if (target?.closest?.(HOVER_SELECTOR)) {
          ring.dataset.hover = "true";
        }
      };
      const onOut = (e: MouseEvent) => {
        const target = e.target as Element | null;
        if (target?.closest?.(HOVER_SELECTOR)) {
          ring.dataset.hover = "false";
        }
      };

      window.addEventListener("mousemove", onMove, { passive: true });
      document.addEventListener("mouseover", onOver, { passive: true });
      document.addEventListener("mouseout", onOut, { passive: true });
      startLoop();

      return () => {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseover", onOver);
        document.removeEventListener("mouseout", onOut);
        stopLoop();
        document.documentElement.classList.remove("cursor-effect-fine");
        host.dataset.active = "false";
      };
    }

    // mode === "coarse"
    document.documentElement.classList.remove("cursor-effect-fine");
    let fadeOutTimer: ReturnType<typeof setTimeout> | null = null;
    let tapTimer: ReturnType<typeof setTimeout> | null = null;

    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      if (fadeOutTimer) {
        clearTimeout(fadeOutTimer);
        fadeOutTimer = null;
      }
      dotX = t.clientX;
      dotY = t.clientY;
      ringX = t.clientX;
      ringY = t.clientY;
      writeDot();
      writeRingWrap();
      host.dataset.active = "true";
      ring.dataset.tap = "true";
      if (tapTimer) clearTimeout(tapTimer);
      tapTimer = setTimeout(() => {
        ring.dataset.tap = "false";
      }, TAP_DURATION_MS);
      startLoop();
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (!t) return;
      dotX = t.clientX;
      dotY = t.clientY;
      writeDot();
    };
    const onTouchEnd = () => {
      stopLoop();
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
      fadeOutTimer = setTimeout(() => {
        host.dataset.active = "false";
        fadeOutTimer = null;
      }, TOUCH_FADE_OUT_MS);
    };

    document.addEventListener("touchstart", onTouchStart, { passive: true });
    document.addEventListener("touchmove", onTouchMove, { passive: true });
    document.addEventListener("touchend", onTouchEnd, { passive: true });
    document.addEventListener("touchcancel", onTouchEnd, { passive: true });

    return () => {
      document.removeEventListener("touchstart", onTouchStart);
      document.removeEventListener("touchmove", onTouchMove);
      document.removeEventListener("touchend", onTouchEnd);
      document.removeEventListener("touchcancel", onTouchEnd);
      if (fadeOutTimer) clearTimeout(fadeOutTimer);
      if (tapTimer) clearTimeout(tapTimer);
      stopLoop();
      host.dataset.active = "false";
    };
  }, [mode]);

  if (mode === "off") return null;

  return (
    <div ref={hostRef} className="cursor-effect-host" aria-hidden="true">
      <div ref={ringWrapRef} className="cursor-ring-wrap">
        <div ref={ringRef} className="cursor-ring" data-hover="false" data-tap="false" />
      </div>
      <div ref={dotRef} className="cursor-dot" />
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: Exit code 0, no errors mentioning `CursorEffect.tsx`.

- [ ] **Step 3: Verify linter passes**

Run: `npm run lint`
Expected: No errors. Warnings about react-hooks deps (none expected here) would need fixing; the dependency arrays above are intentional (`[]` for matchMedia setup, `[mode]` for the behavior effect).

- [ ] **Step 4: Commit**

```bash
git add app/_components/CursorEffect.tsx
git commit -m "Add CursorEffect client component"
```

---

### Task 3: Mount CursorEffect in the root layout

**Files:**
- Modify: `app/layout.tsx`

- [ ] **Step 1: Import the component at the top of `app/layout.tsx`**

Add this import after the existing `import "./globals.css";` line:

```tsx
import { CursorEffect } from "./_components/CursorEffect";
```

The import block at the top of the file should now read:

```tsx
import type { Metadata, Viewport } from "next";
import { DM_Sans, Syne } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import { CursorEffect } from "./_components/CursorEffect";
```

- [ ] **Step 2: Render `<CursorEffect />` inside `<body>`, after `<footer>`**

In the `RootLayout` return value, add `<CursorEffect />` as the last child of `<body>`, immediately after the closing `</footer>` tag:

```tsx
        <footer className="border-t border-white/8 bg-[var(--color-surface)]">
          {/* ...existing footer contents unchanged... */}
        </footer>
        <CursorEffect />
      </body>
```

(Do not modify any other JSX. The full file should still match the existing structure with these two additions only.)

- [ ] **Step 3: Verify TypeScript compiles**

Run: `npm run typecheck`
Expected: Exit code 0, no errors.

- [ ] **Step 4: Verify build succeeds**

Run: `npm run build`
Expected: Build completes successfully. Note that `app/layout.tsx` remains a server component; `CursorEffect` is a client component due to its `"use client"` directive.

- [ ] **Step 5: Manual verification — desktop with mouse**

Run: `npm run dev`
Open `http://localhost:3000` in a desktop browser.

Verify:
- [ ] Native cursor is hidden anywhere over the page.
- [ ] Small accent-yellow dot follows the mouse exactly.
- [ ] Larger ring trails the dot smoothly.
- [ ] Hovering nav links, the "Get started" button, the "Book a call" link, or any form input scales the ring up (~1.6×).
- [ ] Browser console has no errors.

Visit `/consulting`, `/contact`, `/back-office/finance` — confirm the effect persists across routes.

- [ ] **Step 6: Manual verification — reduced motion**

In OS settings (or via Chrome DevTools: Rendering panel → "Emulate CSS media feature prefers-reduced-motion: reduce"), enable reduced motion.

Reload the page and verify:
- [ ] Native cursor is visible again.
- [ ] No dot or ring is rendered (inspect: `.cursor-effect-host` element should not be in the DOM).

Disable the emulation when done.

- [ ] **Step 7: Manual verification — touch**

In Chrome DevTools, open the device toolbar (Ctrl+Shift+M) and select a phone profile (e.g., iPhone 14 Pro). Reload.

Verify:
- [ ] Native touch behavior is unchanged (page scrolls normally, taps register on links).
- [ ] No cursor visible while idle.
- [ ] Tapping anywhere shows the dot + ring blooming in at the touch point with the tap-pulse animation.
- [ ] Dragging a finger shows the ring trailing the touch point.
- [ ] Releasing the touch fades the dot/ring out within ~200ms.

If you have a real phone available, confirm the same behavior there — devtools emulation is not perfect for touch.

- [ ] **Step 8: Commit**

```bash
git add app/layout.tsx
git commit -m "Mount CursorEffect in root layout"
```

---

## Verification Summary

After all three tasks:

- `npm run typecheck` passes.
- `npm run lint` passes.
- `npm run build` passes.
- All four manual verification scenarios in Task 3 (mouse, hover, reduced-motion, touch) behave as described in the spec.

## Files Created / Modified

- **Created:** `app/_components/CursorEffect.tsx`
- **Created:** `docs/superpowers/specs/2026-05-01-custom-cursor-effect-design.md` (already committed)
- **Modified:** `app/globals.css` (cursor styles appended)
- **Modified:** `app/layout.tsx` (import + `<CursorEffect />` mount)
- **No changes:** `package.json` (no new dependencies)
