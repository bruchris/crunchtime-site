"use client";

import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";

const CHIP_KEYS = ["ar", "leads", "inbox", "support"] as const;
// Spec mentions 5 chips with 4 surfaced. We surface a stable 4 in v1.
// The 5th ("marketing") is in the catalog and reserved for a future cycle/rotation.

export function ChipRow({
  hidden,
  onPick
}: {
  hidden: boolean;
  onPick: (label: string) => void;
}) {
  const t = useTranslations("briefBox.chips");
  if (hidden) return null;
  return (
    <div className={styles.chips}>
      {CHIP_KEYS.map((key) => {
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
