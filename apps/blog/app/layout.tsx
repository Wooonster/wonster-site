import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Analytics } from "@vercel/analytics/next";
import Link from "next/link";
import "@fontsource/instrument-sans/400.css";
import "@fontsource/instrument-sans/500.css";
import "@fontsource/instrument-sans/700.css";
import "@fontsource/syne/700.css";
import "@fontsource/syne/800.css";
import "@whatsmy/ui/styles.css";
import "katex/dist/katex.min.css";
import "./globals.css";
import { dictionaries } from "@whatsmy/config";
import { AppProviders, LocaleScript, Localized, PageShell, PreferenceRail, SurfaceGrid } from "@whatsmy/ui";

export const metadata: Metadata = {
  metadataBase: new URL("https://blog.whatsmy.fun"),
  title: {
    default: "blog.whatsmy.fun",
    template: "%s | blog.whatsmy.fun"
  },
  description: "Markdown-first blog with bilingual UI, system theme support, math rendering, and syntax-highlighted code."
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html suppressHydrationWarning lang="zh">
      <body>
        <LocaleScript />
        <AppProviders>
          <SurfaceGrid />
          <PageShell>
            <div className="blog-frame">
              <header className="topbar">
                <div className="brand-column">
                  <Link className="wordmark" href="/">
                    what's <mark>my</mark>
                  </Link>
                  <nav className="topbar-nav" aria-label="Primary">
                    <Link href="https://whatsmy.fun">
                      <Localized zh={dictionaries.zh.nav.home} en={dictionaries.en.nav.home} />
                    </Link>
                    <Link href="https://whatsmy.fun/everyday-paper">
                      <Localized zh="Everyday Paper" en="Everyday Paper" />
                    </Link>
                    <Link data-active="true" href="/">
                      <Localized zh={dictionaries.zh.nav.blog} en={dictionaries.en.nav.blog} />
                    </Link>
                    <Link href="/archive">
                      <Localized zh={dictionaries.zh.nav.archive} en={dictionaries.en.nav.archive} />
                    </Link>
                  </nav>
                </div>

                <PreferenceRail />
              </header>
              {children}
              <footer className="footer-bar">
                <div className="footer-stack">
                  <Localized zh={dictionaries.zh.footer.copyright} en={dictionaries.en.footer.copyright} />
                  <Localized zh={dictionaries.zh.footer.builtWith} en={dictionaries.en.footer.builtWith} />
                </div>
                <p className="footer-traffic-note">
                  <Localized
                    zh="博客已启用 Vercel Analytics，用来观察文章访问趋势与读者关注内容。"
                    en="The blog uses Vercel Analytics to understand reading trends and which notes draw attention."
                  />
                </p>
              </footer>
            </div>
          </PageShell>
        </AppProviders>
        <Analytics />
      </body>
    </html>
  );
}
