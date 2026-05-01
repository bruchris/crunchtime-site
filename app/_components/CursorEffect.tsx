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