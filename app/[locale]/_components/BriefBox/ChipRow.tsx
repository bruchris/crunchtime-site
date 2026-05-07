"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";

const PINNED = "ar" as const;
const POOL = [
  "leads",
  "inbox",
  "support",
  "marketing",
  "reporting",
  "onboarding",
  "meetings",
  "proposals",
  "followup",
  "data",
  "scheduling",
  "handover",
  "hiring",
  "manualWork"
] as const;

const ROTATING = 3;
type ChipKey = typeof PINNED | (typeof POOL)[number];

// Stable initial set used for SSR and the first client render so hydration
// matches. After mount, useEffect swaps in a random sample.
const INITIAL: ChipKey[] = [PINNED, ...POOL.slice(0, ROTATING)];

function sample<T>(arr: readonly T[], n: number): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a.slice(0, n);
}

export function ChipRow({
  hidden,
  onPick
}: {
  hidden: boolean;
  onPick: (label: string) => void;
}) {
  const t = useTranslations("briefBox.chips");
  const [keys, setKeys] = useState<ChipKey[]>(INITIAL);

  useEffect(() => {
    setKeys([PINNED, ...sample(POOL, ROTATING)]);
  }, []);

  if (hidden) return null;
  return (
    <div className={styles.chips}>
      {keys.map((key) => {
        const label = t(key);
        return (
          <button
            key={key}
            type="button"
            className={styles.chip}
            onClick={() => onPick(label)}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
