"use client";

import { Link } from "@/i18n/routing";
import { ScrollReveal } from "./ScrollReveal";

type ChangelogEntry = {
  title: string;
  date: string;
  slug: string;
};

type Props = {
  entries: ChangelogEntry[];
};

export function HomeChangelog({ entries }: Props) {
  if (entries.length === 0) return null;

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-bold">Changelog</h2>
            <Link
              href="/changelog"
              className="text-sm text-mint-600 dark:text-mint-400 hover:underline"
            >
              See what&apos;s new in Croktile →
            </Link>
          </div>
        </ScrollReveal>
        <div className="space-y-4">
          {entries.slice(0, 4).map((entry, i) => (
            <ScrollReveal key={entry.slug} delay={i * 0.08}>
              <Link
                href={`/changelog/${entry.slug}`}
                className="group flex items-center gap-4 p-4 rounded-xl border
                           hover:border-mint-500/50 hover:bg-[var(--muted)] transition-all"
              >
                <span className="text-sm text-[var(--muted-foreground)] shrink-0 w-32">
                  {new Date(entry.date).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="font-medium group-hover:text-mint-600 dark:group-hover:text-mint-400 transition-colors">
                  {entry.title}
                </span>
              </Link>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
