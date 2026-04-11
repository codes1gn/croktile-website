import { getAllContent } from "@/lib/mdx";
import {
  Hero,
  FeatureEasyToUse,
  FeatureZeroCost,
  FeatureSafety,
  FeatureDynamic,
  FeatureAI,
  BottomCTA,
  HomeChangelog,
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

  return (
    <>
      <Hero />
      <div id="features">
        <FeatureEasyToUse />
        <FeatureZeroCost />
        <FeatureSafety />
        <FeatureDynamic />
        <FeatureAI />
      </div>
      <HomeChangelog entries={changelogEntries} />
      <BottomCTA />
    </>
  );
}
