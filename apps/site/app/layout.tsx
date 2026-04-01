import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/700.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@whatsmy/ui/styles.css";
import "./globals.css";
import { AppProviders, LocaleScript, PageShell, SurfaceGrid } from "@whatsmy/ui";

export const metadata: Metadata = {
  metadataBase: new URL("https://whatsmy.fun"),
  title: "whatsmy.fun",
  description: "A research-flavored personal index for paper notes, lightweight tools, and long-form thinking."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="zh">
      <body>
        <LocaleScript />
        <AppProviders>
          <SurfaceGrid />
          <PageShell>{children}</PageShell>
        </AppProviders>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
