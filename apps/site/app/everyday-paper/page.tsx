import { Localized } from "@whatsmy/ui";
import { SiteHeader } from "../../components/site-header";
import { getEverydayPapers } from "../../lib/everyday-paper";
import { PaperQueue } from "./paper-queue";

export default function EverydayPaperPage() {
  const dailyPaperPicks = getEverydayPapers();

  return (
    <main className="site-home everyday-paper-page">
      <SiteHeader active="everyday-paper" />

      <section className="page-intro everyday-paper-hero enter-rise delay-1">
        <Localized className="eyebrow" zh="Everyday Paper" en="Everyday Paper" />
        <h1 className="display-title everyday-paper-display">Paper Queue</h1>
      </section>

      <section className="everyday-paper-archive enter-rise delay-2">
        <div className="section-head everyday-paper-archive-head">
          <Localized className="section-title" zh="Paper Queue" en="Paper Queue" />
          <div className="mono-kicker">{`Recent ${String(dailyPaperPicks.length).padStart(2, "0")}`}</div>
        </div>
        <PaperQueue papers={dailyPaperPicks} />
      </section>
    </main>
  );
}
