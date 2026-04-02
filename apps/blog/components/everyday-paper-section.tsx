import { dictionaries } from "@whatsmy/config";
import { Localized } from "@whatsmy/ui";
import { type DailyPaperEntry, type DailyPaperGroup } from "../lib/content";

function formatEditorialDate(date: string, locale: "zh-CN" | "en-US") {
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC"
  }).format(new Date(`${date}T00:00:00Z`));
}

function EverydayPaperCard({ paper, index }: { paper: DailyPaperEntry; index: number }) {
  const content = (
    <>
      <div className="everyday-paper-card-topline">
        <span className="everyday-paper-card-source">{paper.primarySource ?? "Paper"}</span>
        {paper.primaryHref ? (
          <Localized
            className="everyday-paper-card-action"
            zh={`打开 ${paper.primarySource} ↗`}
            en={`Open ${paper.primarySource} ↗`}
          />
        ) : null}
      </div>
      <h3 className="everyday-paper-card-title">{paper.title}</h3>
      <p className="everyday-paper-card-summary">{paper.summary}</p>
      <div className="everyday-paper-card-meta" aria-label="paper metadata">
        <Localized
          as="span"
          zh={formatEditorialDate(paper.recommendedAt, "zh-CN")}
          en={formatEditorialDate(paper.recommendedAt, "en-US")}
        />
        <Localized
          as="span"
          zh={`${dictionaries.zh.blog.readingTime} ${paper.readingMinutes} 分钟`}
          en={`${paper.readingMinutes} min read`}
        />
        <Localized as="span" zh={`作者 ${paper.author}`} en={`Author ${paper.author}`} />
      </div>
    </>
  );

  const animationClass = `enter-rise delay-${Math.min(index + 1, 4)}`;

  if (paper.primaryHref) {
    return (
      <a
        className={`everyday-paper-card everyday-paper-card-shell ${animationClass}`}
        href={paper.primaryHref}
        target="_blank"
        rel="noreferrer"
        aria-label={`Open ${paper.title} on ${paper.primarySource}`}
      >
        {content}
      </a>
    );
  }

  return <article className={`everyday-paper-card ${animationClass}`}>{content}</article>;
}

export function EverydayPaperSection({ groups }: { groups: DailyPaperGroup[] }) {
  return (
    <section className="section-band everyday-paper-section">
      <div className="everyday-paper-heading enter-rise delay-2">
        <div className="section-head everyday-paper-head">
          <Localized
            className="section-title"
            zh={dictionaries.zh.blog.everydayPaper}
            en={dictionaries.en.blog.everydayPaper}
          />
          <div className="mono-kicker everyday-paper-kicker">Daily paper trail</div>
        </div>
        <p className="kicker everyday-paper-intro">
          <Localized
            zh={dictionaries.zh.blog.everydayPaperIntro}
            en={dictionaries.en.blog.everydayPaperIntro}
          />
        </p>
      </div>

      <div className="everyday-paper-groups">
        {groups.map((group, groupIndex) => (
          <section key={group.date} className={`everyday-paper-group enter-rise delay-${Math.min(groupIndex + 2, 4)}`}>
            <div className="everyday-paper-date-row">
              <Localized
                className="everyday-paper-date"
                zh={formatEditorialDate(group.date, "zh-CN")}
                en={formatEditorialDate(group.date, "en-US")}
              />
              <div className="everyday-paper-date-rule" aria-hidden="true" />
            </div>

            <div className="everyday-paper-list">
              {group.items.map((paper, paperIndex) => (
                <EverydayPaperCard
                  key={paper.id}
                  paper={paper}
                  index={Math.min(groupIndex + paperIndex + 1, 4)}
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </section>
  );
}
