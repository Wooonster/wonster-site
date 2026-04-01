"use client";

import type { ElementType, ReactNode } from "react";
import { dictionaries, type Dictionary } from "@whatsmy/config";
import { useLocale } from "./providers";

type LocalizedProps = {
  zh: ReactNode;
  en: ReactNode;
  as?: ElementType;
  className?: string;
};

export function Localized({
  zh,
  en,
  as: Component = "span",
  className
}: LocalizedProps) {
  const { locale } = useLocale();

  return (
    <Component className={className} suppressHydrationWarning>
      {locale === "zh" ? zh : en}
    </Component>
  );
}

type TProps = {
  section: keyof Dictionary;
  keyName: string;
  as?: ElementType;
  className?: string;
};

export function T({ section, keyName, as: Component = "span", className }: TProps) {
  const { locale } = useLocale();
  const entry = dictionaries[locale][section] as Record<string, string>;

  return (
    <Component className={className} suppressHydrationWarning>
      {entry[keyName]}
    </Component>
  );
}
