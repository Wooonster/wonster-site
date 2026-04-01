"use client";

import { useTheme } from "next-themes";
import { dictionaries, type LocalePreference, type ThemePreference } from "@whatsmy/config";
import { useLocale } from "./providers";

export function LocaleToggle() {
  const { locale, setLocale } = useLocale();

  return (
    <div className="stack-inline" aria-label="Language switcher">
      {(["zh", "en"] as LocalePreference[]).map((entry) => (
        <button
          key={entry}
          className="chip-button"
          data-active={locale === entry}
          onClick={() => setLocale(entry)}
          type="button"
        >
          {entry.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { locale } = useLocale();
  const dictionary = dictionaries[locale].toggle;

  return (
    <div className="stack-inline" aria-label={dictionary.theme}>
      {(["system", "light", "dark"] as ThemePreference[]).map((entry) => (
        <button
          key={entry}
          className="chip-button"
          data-active={theme === entry}
          onClick={() => setTheme(entry)}
          type="button"
        >
          {dictionary[entry]}
        </button>
      ))}
    </div>
  );
}

