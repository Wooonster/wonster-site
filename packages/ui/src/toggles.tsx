"use client";

import { useTheme } from "next-themes";
import { dictionaries, type LocalePreference, type ThemePreference } from "@whatsmy/config";
import { useLocale } from "./providers";

type ToggleProps = {
  compact?: boolean;
};

export function LocaleToggle({ compact = false }: ToggleProps) {
  const { locale, setLocale } = useLocale();

  return (
    <div className="toggle-button-row" aria-label="Language switcher">
      {(["zh", "en"] as LocalePreference[]).map((entry) => (
        <button
          key={entry}
          className="chip-button"
          data-active={locale === entry}
          data-size={compact ? "compact" : "default"}
          onClick={() => setLocale(entry)}
          type="button"
        >
          {entry.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export function ThemeToggle({ compact = false }: ToggleProps) {
  const { theme, setTheme } = useTheme();
  const { locale } = useLocale();
  const dictionary = dictionaries[locale].toggle;

  return (
    <div className="toggle-button-row" aria-label={dictionary.theme}>
      {(["system", "light", "dark"] as ThemePreference[]).map((entry) => (
        <button
          key={entry}
          className="chip-button"
          data-active={theme === entry}
          data-size={compact ? "compact" : "default"}
          onClick={() => setTheme(entry)}
          type="button"
        >
          {dictionary[entry]}
        </button>
      ))}
    </div>
  );
}

export function PreferenceRail() {
  const { locale } = useLocale();
  const dictionary = dictionaries[locale].toggle;
  const summaryLabel = locale === "zh" ? "界面" : "UI";

  return (
    <div className="preference-rail-shell" aria-label={dictionary.theme} tabIndex={0}>
      <div className="preference-rail-summary" aria-hidden="true">
        <span className="preference-summary-label">{summaryLabel}</span>
        <span className="preference-summary-dot" />
      </div>

      <div className="preference-rail-panel">
        <div className="preference-rail">
          <div className="preference-group">
            <span className="preference-label">{dictionary.locale}</span>
            <LocaleToggle compact />
          </div>
          <span className="preference-divider" aria-hidden="true" />
          <div className="preference-group">
            <span className="preference-label">{dictionary.theme}</span>
            <ThemeToggle compact />
          </div>
        </div>
      </div>
    </div>
  );
}
