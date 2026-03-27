import { getAllContent } from "@/lib/mdx";
import {
  Hero,
  FeatureEasyToUse,
  FeatureSafety,
  FeatureDynamic,
  FeatureAI,
  BottomCTA,
  HomeChangelog,
  HomeBlog,
} from "@/components/landing";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;

  const changelogEntries = getAllContent("changelog", locale).map((e) => ({
    title: e.meta.title,
    date: e.meta.date ?? "",
    slug: e.meta.slug,
  }));

  const blogPosts = getAllContent("blog", locale).map((p) => ({
    title: p.meta.title,
    description: p.meta.description,
    date: p.meta.date,
    author: p.meta.author,
    slug: p.meta.slug,
    tags: p.meta.tags,
  }));

  return (
    <>
      <Hero />
      <div id="features">
        <FeatureEasyToUse />
        <FeatureSafety />
        <FeatureDynamic />
        <FeatureAI />
      </div>
      <HomeChangelog entries={changelogEntries} />
      <HomeBlog posts={blogPosts} />
      <BottomCTA />
    </>
  );
}
