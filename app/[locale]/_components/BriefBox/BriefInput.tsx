"use client";

import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import styles from "./briefBox.module.css";

interface Props {
  dimmed: boolean;
  analyzing: boolean;
  onSubmit: (text: string) => void;
  noscriptAction: string;
  lang: "no" | "en";
}

export function BriefInput({ dimmed, analyzing, onSubmit, noscriptAction, lang }: Props) {
  const t = useTranslations("briefBox");
  const [value, setValue] = useState("");
  const [tooltip, setTooltip] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!dimmed) inputRef.current?.focus();
  }, [dimmed]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setTooltip(t("tooltipEmpty"));
      return;
    }
    setTooltip("");
    onSubmit(trimmed);
  }

  return (
    <form
      onSubmit={handleSubmit}
      action={noscriptAction}
      method="post"
    >
      <input type="hidden" name="lang" value={lang} />
      <div className={`${styles.inputWrap} ${dimmed ? styles.inputDimmed : ""}`}>
        <input
          ref={inputRef}
          className={styles.input}
          name="brief"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={t("inputPlaceholder")}
          aria-label={t("inputAriaLabel")}
          maxLength={500}
          disabled={dimmed}
          autoComplete="off"
        />
        <button type="submit" hidden>{t("submit")}</button>
      </div>
      {tooltip && <p className={styles.analyzing} role="alert">{tooltip}</p>}
      {analyzing && <p className={styles.analyzing}>{t("analyzing")}</p>}
    </form>
  );
}
