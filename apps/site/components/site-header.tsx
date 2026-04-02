import Link from "next/link";
import { PreferenceRail } from "@whatsmy/ui";
import { getCurrentSiteDateLabel } from "../lib/current-date";

type SiteHeaderProps = {
  active: "home" | "everyday-paper";
};

export function SiteHeader({ active }: SiteHeaderProps) {
  const currentDate = getCurrentSiteDateLabel();

  return (
    <header className="topbar enter-rise">
      <div className="brand-column">
        <Link className="wordmark" href="/">
          what's <mark>my</mark>
        </Link>
        <nav className="topbar-nav" aria-label="Primary">
          <Link data-active={active === "home"} href="/">
            Home
          </Link>
          <Link data-active={active === "everyday-paper"} href="/everyday-paper">
            Everyday Paper
          </Link>
          <Link href="https://blog.whatsmy.fun">Blog</Link>
        </nav>
      </div>
      <div className="topbar-tools">
        <div className="topbar-date" aria-label={`Current date ${currentDate}`}>
          {currentDate}
        </div>
        <PreferenceRail />
      </div>
    </header>
  );
}
