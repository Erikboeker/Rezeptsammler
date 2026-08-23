"use client";

// ====================================================
// AutoTextarea – Textfeld, das automatisch mit dem
// Inhalt wächst (kein inneres Scrollen bei langen
// Texten, z.B. Zubereitungsschritten).
// ====================================================

import { useLayoutEffect, useRef } from "react";

export function AutoTextarea(
  props: React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  const ref = useRef<HTMLTextAreaElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Erst zurücksetzen, damit das Feld auch schrumpfen kann
    el.style.height = "auto";
    el.style.height = `${el.scrollHeight + 2}px`; // +2 für den Rahmen
  }, [props.value]);

  return (
    <textarea
      ref={ref}
      rows={2}
      {...props}
      className={`${props.className ?? ""} overflow-hidden`}
    />
  );
}
