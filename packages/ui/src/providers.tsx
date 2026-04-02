"use client";

import {
  createContext,
  type ReactNode,
  useContext,
  useEffect,
  useMemo,
  useState
} from "react";
import { ThemeProvider as NextThemeProvider, useTheme } from "next-themes";
import type { LocalePreference, ThemePreference } from "@whatsmy/config";

const LOCALE_STORAGE_KEY = "whatsmy-locale";
const LOCALE_COOKIE_KEY = "whatsmy-locale";
const THEME_STORAGE_KEY = "whatsmy-theme";
const THEME_COOKIE_KEY = "whatsmy-theme";

type LocaleContextValue = {
  locale: LocalePreference;
  setLocale: (locale: LocalePreference) => void;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function resolveInitialLocale(): LocalePreference {
  if (typeof document !== "undefined") {
    const locale = document.documentElement.dataset.locale;
    if (locale === "zh" || locale === "en") {
      return locale;
    }
  }

  return "zh";
}

export function AppProviders({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<LocalePreference>(resolveInitialLocale);

  useEffect(() => {
    const maxAge = 60 * 60 * 24 * 365;
    const isProdDomain = window.location.hostname === "whatsmy.fun" || window.location.hostname.endsWith(".whatsmy.fun");
    const domain = isProdDomain ? "; domain=.whatsmy.fun" : "";

    document.documentElement.dataset.locale = locale;
    document.documentElement.lang = locale;
    window.localStorage.setItem(LOCALE_STORAGE_KEY, locale);
    document.cookie = `${LOCALE_COOKIE_KEY}=${encodeURIComponent(locale)}; path=/; max-age=${maxAge}; samesite=lax${domain}`;
  }, [locale]);

  const value = useMemo(
    () => ({
      locale,
      setLocale: setLocaleState
    }),
    [locale]
  );

  return (
    <NextThemeProvider attribute="data-theme" defaultTheme="system" enableSystem storageKey={THEME_STORAGE_KEY}>
      <ThemePreferenceSync />
      <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
    </NextThemeProvider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within AppProviders.");
  }

  return context;
}

export function LocaleScript() {
  const script = `
    (() => {
      const readCookie = (key) => {
        const value = document.cookie
          .split("; ")
          .find((entry) => entry.startsWith(key + "="))
          ?.split("=")[1];
        return value ? decodeURIComponent(value) : null;
      };

      const writeCookie = (key, value) => {
        const maxAge = 60 * 60 * 24 * 365;
        const isProdDomain = window.location.hostname === "whatsmy.fun" || window.location.hostname.endsWith(".whatsmy.fun");
        const domain = isProdDomain ? "; domain=.whatsmy.fun" : "";
        document.cookie = key + "=" + encodeURIComponent(value) + "; path=/; max-age=" + maxAge + "; samesite=lax" + domain;
      };

      const resolveTheme = (preference) => {
        if (preference === "light" || preference === "dark") {
          return preference;
        }

        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      };

      const storedTheme = window.localStorage.getItem("${THEME_STORAGE_KEY}");
      const cookieTheme = readCookie("${THEME_COOKIE_KEY}");
      const themePreference =
        cookieTheme === "light" || cookieTheme === "dark" || cookieTheme === "system"
          ? cookieTheme
          : storedTheme === "light" || storedTheme === "dark" || storedTheme === "system"
            ? storedTheme
            : "system";
      const resolvedTheme = resolveTheme(themePreference);

      window.localStorage.setItem("${THEME_STORAGE_KEY}", themePreference);
      document.documentElement.dataset.theme = resolvedTheme;
      document.documentElement.style.colorScheme = resolvedTheme;

      const query = new URLSearchParams(window.location.search).get("locale");
      const cookieLocale = readCookie("${LOCALE_COOKIE_KEY}");
      const stored = window.localStorage.getItem("${LOCALE_STORAGE_KEY}");
      const browser = navigator.language.toLowerCase().startsWith("zh") ? "zh" : "en";
      const locale =
        query === "zh" || query === "en"
          ? query
          : cookieLocale === "zh" || cookieLocale === "en"
            ? cookieLocale
            : stored === "zh" || stored === "en"
              ? stored
              : browser;

      window.localStorage.setItem("${LOCALE_STORAGE_KEY}", locale);
      writeCookie("${LOCALE_COOKIE_KEY}", locale);
      document.documentElement.dataset.locale = locale;
      document.documentElement.lang = locale;
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}

function ThemePreferenceSync() {
  const { theme } = useTheme();

  useEffect(() => {
    const preference: ThemePreference = theme === "light" || theme === "dark" || theme === "system" ? theme : "system";
    const maxAge = 60 * 60 * 24 * 365;
    const isProdDomain = window.location.hostname === "whatsmy.fun" || window.location.hostname.endsWith(".whatsmy.fun");
    const domain = isProdDomain ? "; domain=.whatsmy.fun" : "";

    window.localStorage.setItem(THEME_STORAGE_KEY, preference);
    document.cookie = `${THEME_COOKIE_KEY}=${encodeURIComponent(preference)}; path=/; max-age=${maxAge}; samesite=lax${domain}`;
  }, [theme]);

  return null;
}
