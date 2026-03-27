import { getContentBySlug, getContentSlugs, getSidebarItems } from "@/lib/mdx";
import { MdxContent } from "@/components/mdx/MdxContent";
import { Sidebar } from "@/components/mdx/Sidebar";
import { locales } from "@/i18n/config";

export function generateStaticParams() {
  return locales.flatMap((locale) => {
    const slugs = getContentSlugs("docs", locale);
    return [
      { locale, slug: [] },
      ...slugs.map((s) => ({ locale, slug: [s] })),
    ];
  });
}

type Props = {
  params: Promise<{ locale: string; slug?: string[] }>;
};

export default async function DocsPage({ params }: Props) {
  const { locale, slug } = await params;
  const currentSlug = slug?.[0] ?? "index";
  const sidebarItems = getSidebarItems("docs", locale);
  const content = getContentBySlug("docs", currentSlug, locale);

  if (!content) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex gap-12">
          <Sidebar items={sidebarItems} basePath="/docs" title="Documentation" />
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-bold mb-4">Documentation</h1>
            <p className="text-[var(--muted-foreground)]">
              Select a topic from the sidebar to get started.
            </p>
            {sidebarItems.length > 0 && (
              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {sidebarItems.map((item) => (
                  <a
                    key={item.slug}
                    href={`/docs/${item.slug}`}
                    className="block p-4 rounded-xl border hover:border-mint-500/50 hover:bg-[var(--muted)] transition-colors"
                  >
                    <span className="font-medium">{item.title}</span>
                  </a>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex gap-12">
        <Sidebar items={sidebarItems} basePath="/docs" title="Documentation" />
        <article className="flex-1 min-w-0">
          <h1 className="text-3xl font-bold mb-2">{content.meta.title}</h1>
          {content.meta.description && (
            <p className="text-[var(--muted-foreground)] mb-8 text-lg">
              {content.meta.description}
            </p>
          )}
          <MdxContent source={content.content} />
        </article>
      </div>
    </div>
  );
}
