import { SiteHeader } from "../../components/site-header";
import { getEverydayPapers } from "../../lib/everyday-paper";
import { PaperQueue } from "./paper-queue";

export default function EverydayPaperPage() {
  const dailyPaperPicks = getEverydayPapers();

  return (
    <main className="site-home everyday-paper-page">
      <SiteHeader active="everyday-paper" />
      <PaperQueue papers={dailyPaperPicks} />
    </main>
  );
}
