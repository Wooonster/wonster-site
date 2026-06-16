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
      <div className="topbar-brand-block">
        <Link className="wordmark" href="/">
          what's <mark>my</mark>
        </Link>
        <span className="topbar-edition">research folio</span>
      </div>
      <div className="topbar-rail">
        <nav className="topbar-nav" aria-label="Primary">
          <Link data-active={active === "home"} href="/">
            <span className="topbar-nav-label">Home</span>
          </Link>
          <Link data-active={active === "everyday-paper"} href="/everyday-paper">
            <span className="topbar-nav-label">Everyday Paper</span>
          </Link>
          <Link href="https://blog.whatsmy.fun">
            <span className="topbar-nav-label">Blog</span>
          </Link>
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
