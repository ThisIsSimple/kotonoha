"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import {
  THEME_STORAGE_KEY,
  normalizeTheme,
  type ThemePreference,
  themeOptions,
} from "@/lib/theme";

function applyTheme(preference: ThemePreference) {
  const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const shouldDark = preference === "dark" || (preference === "system" && prefersDark);
  const root = document.documentElement;
  root.classList.toggle("dark", shouldDark);
  root.style.colorScheme = shouldDark ? "dark" : "light";
}

export function ThemeSelector() {
  const [preference, setPreference] = useState<ThemePreference>("system");
  const [isReady, setIsReady] = useState(false);
  const preferenceRef = useRef<ThemePreference>(preference);

  useEffect(() => {
    const stored = normalizeTheme(localStorage.getItem(THEME_STORAGE_KEY));
    setPreference(stored);
    setIsReady(true);
  }, []);

  useEffect(() => {
    preferenceRef.current = preference;
    if (!isReady) {
      return;
    }
    localStorage.setItem(THEME_STORAGE_KEY, preference);
    applyTheme(preference);
  }, [preference, isReady]);

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (preferenceRef.current === "system") {
        applyTheme("system");
      }
    };

    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
      return () => {
        media.removeEventListener("change", handleChange);
      };
    }

    media.addListener(handleChange);
    return () => {
      media.removeListener(handleChange);
    };
  }, []);

  const options = useMemo(() => themeOptions, []);

  return (
    <div className="grid gap-3 md:grid-cols-3" role="radiogroup" aria-label="テーマの選択">
      {options.map((option) => {
        const isActive = preference === option.value;

        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => setPreference(option.value)}
            className={cn(
              "rounded-xl border border-border/70 bg-card p-4 text-left transition hover:border-primary/60 hover:bg-accent/40",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "focus-visible:ring-offset-background",
              isActive && "border-primary/70 bg-primary/10 shadow-sm",
            )}
          >
            <div className="text-sm font-semibold">{option.label}</div>
            <div className="mt-1 text-xs text-muted-foreground">{option.description}</div>
          </button>
        );
      })}
    </div>
  );
}
