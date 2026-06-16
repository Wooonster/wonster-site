"use client";

import { useTheme } from "next-themes";
import { dictionaries, type LocalePreference, type ThemePreference } from "@whatsmy/config";
import { useLocale } from "./providers";

function LanguageGlyph({ locale }: { locale: LocalePreference }) {
  return (
    <span className="toggle-icon toggle-icon-language" aria-hidden="true" suppressHydrationWarning>
      {locale === "zh" ? "文" : "A"}
    </span>
  );
}

function SunIcon() {
  return (
    <svg className="toggle-icon" aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="3.25" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M10 2.2v2M10 15.8v2M4.48 4.48l1.42 1.42M14.1 14.1l1.42 1.42M2.2 10h2M15.8 10h2M4.48 15.52l1.42-1.42M14.1 5.9l1.42-1.42"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg className="toggle-icon" aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <path
        d="M14.9 12.85A6.25 6.25 0 0 1 7.15 5.1a6.75 6.75 0 1 0 7.75 7.75Z"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="1.6"
      />
    </svg>
  );
}

function MonitorIcon() {
  return (
    <svg className="toggle-icon" aria-hidden="true" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="4.25" width="14" height="9.5" rx="1.3" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 16h4M10 13.75V16" stroke="currentColor" strokeLinecap="round" strokeWidth="1.6" />
    </svg>
  );
}

function ThemeIcon({ theme }: { theme: ThemePreference }) {
  if (theme === "light") return <SunIcon />;
  if (theme === "dark") return <MoonIcon />;
  return <MonitorIcon />;
}

export function PreferenceRail() {
  const { locale, setLocale } = useLocale();
  const { resolvedTheme, setTheme, theme } = useTheme();
  const dictionary = dictionaries[locale].toggle;
  const nextLocale: LocalePreference = locale === "zh" ? "en" : "zh";
  const resolvedMode = resolvedTheme === "dark" || theme === "dark" ? "dark" : "light";
  const nextTheme: Extract<ThemePreference, "light" | "dark"> = resolvedMode === "dark" ? "light" : "dark";

  return (
    <div className="preference-rail preference-rail-cycle" aria-label={dictionary.theme} suppressHydrationWarning>
      <button
        className="chip-button preference-cycle-button"
        data-size="compact"
        onClick={() => setLocale(nextLocale)}
        title={nextLocale === "zh" ? "切换到中文" : "Switch to English"}
        aria-label={nextLocale === "zh" ? "Switch to Chinese" : "Switch to English"}
        suppressHydrationWarning
        type="button"
      >
        <LanguageGlyph locale={locale} />
      </button>
      <button
        className="chip-button preference-cycle-button"
        data-size="compact"
        onClick={() => setTheme(nextTheme)}
        title={nextTheme === "dark" ? dictionary.dark : dictionary.light}
        aria-label={nextTheme === "dark" ? dictionary.dark : dictionary.light}
        suppressHydrationWarning
        type="button"
      >
        {resolvedMode === "dark" ? <MoonIcon /> : <SunIcon />}
      </button>
    </div>
  );
}
