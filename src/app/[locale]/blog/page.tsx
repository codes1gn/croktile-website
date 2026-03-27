import { getAllContent } from "@/lib/mdx";
import { Link } from "@/i18n/routing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function BlogListPage({ params }: Props) {
  const { locale } = await params;
  const posts = getAllContent("blog", locale);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold mb-2">Blog</h1>
      <p className="text-[var(--muted-foreground)] mb-10">
        News, updates, and technical deep dives from the Croktile team.
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-20 text-[var(--muted-foreground)]">
          <p className="text-lg">No blog posts yet. Check back soon!</p>
        </div>
      ) : (
        <div className="space-y-8">
          {posts.map((post) => (
            <article
              key={post.meta.slug}
              className="group block p-6 rounded-xl border hover:border-mint-500/50 transition-colors"
            >
              <Link href={`/blog/${post.meta.slug}`}>
                <div className="flex items-center gap-3 text-sm text-[var(--muted-foreground)] mb-2">
                  {post.meta.date && (
                    <time dateTime={post.meta.date}>
                      {new Date(post.meta.date).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </time>
                  )}
                  {post.meta.author && (
                    <>
                      <span>·</span>
                      <span>{post.meta.author}</span>
                    </>
                  )}
                </div>
                <h2 className="text-xl font-semibold group-hover:text-mint-600 dark:group-hover:text-mint-400 transition-colors">
                  {post.meta.title}
                </h2>
                {post.meta.description && (
                  <p className="mt-2 text-[var(--muted-foreground)] line-clamp-2">
                    {post.meta.description}
                  </p>
                )}
                {post.meta.tags && (
                  <div className="flex gap-2 mt-3">
                    {post.meta.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-0.5 text-xs rounded-full bg-mint-500/10 text-mint-600 dark:text-mint-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </Link>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
