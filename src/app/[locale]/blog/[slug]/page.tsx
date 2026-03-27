import { getContentBySlug, getContentSlugs } from "@/lib/mdx";
import { MdxContent } from "@/components/mdx/MdxContent";
import { notFound } from "next/navigation";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    getContentSlugs("blog", locale).map((slug) => ({ locale, slug }))
  );
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export default async function BlogPostPage({ params }: Props) {
  const { locale, slug } = await params;
  const content = getContentBySlug("blog", slug, locale);

  if (!content) notFound();

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <article>
        <div className="mb-8">
          <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] mb-3">
            {content.meta.date && (
              <time dateTime={content.meta.date}>
                {new Date(content.meta.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            )}
            {content.meta.author && (
              <>
                <span>·</span>
                <span>{content.meta.author}</span>
              </>
            )}
          </div>
          <h1 className="text-4xl font-bold tracking-tight">
            {content.meta.title}
          </h1>
          {content.meta.description && (
            <p className="mt-3 text-lg text-[var(--muted-foreground)]">
              {content.meta.description}
            </p>
          )}
          {content.meta.tags && (
            <div className="flex gap-2 mt-4">
              {content.meta.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2.5 py-0.5 text-xs rounded-full bg-mint-500/10 text-mint-600 dark:text-mint-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        <MdxContent source={content.content} />
      </article>
    </div>
  );
}
