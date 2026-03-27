import { getAllContent } from "@/lib/mdx";
import { MdxContent } from "@/components/mdx/MdxContent";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function ChangelogPage({ params }: Props) {
  const { locale } = await params;
  const entries = getAllContent("changelog", locale);

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Changelog</h1>
      <p className="text-[var(--muted-foreground)] mb-10">
        What&apos;s new in Croktile. Latest updates, improvements, and fixes.
      </p>

      {entries.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          <p className="text-lg">No changelog entries yet. Check back soon!</p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[var(--border)]" />
          <div className="space-y-12">
            {entries.map((entry) => (
                <div key={entry.meta.slug} className="relative pl-8">
                  <div className="absolute left-0 top-1.5 w-4 h-4 rounded-full border-2 border-mint-500 bg-[var(--background)]" />
                  <div className="text-sm text-[var(--muted-foreground)] mb-1">
                    {entry.meta.date &&
                      new Date(entry.meta.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                  </div>
                  <h2 className="text-xl font-semibold mb-3">
                    {entry.meta.title}
                  </h2>
                  <MdxContent source={entry.content} />
                </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
