import type { MetadataRoute } from "next";
import { getContentSlugs } from "@/lib/mdx";
import { locales } from "@/i18n/config";

export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://croqtile.io";

  const staticRoutes = ["", "/docs", "/tutorials", "/changelog", "/roadmap"];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const route of staticRoutes) {
      entries.push({
        url: `${baseUrl}/${locale}${route}`,
        lastModified: new Date(),
        changeFrequency: route === "" ? "weekly" : "daily",
        priority: route === "" ? 1 : 0.8,
      });
    }

    const docSlugs = getContentSlugs("docs", locale);
    for (const slug of docSlugs) {
      entries.push({
        url: `${baseUrl}/${locale}/docs/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    const tutorialSlugs = getContentSlugs("tutorials", locale);
    for (const slug of tutorialSlugs) {
      entries.push({
        url: `${baseUrl}/${locale}/tutorials/${slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }

    const blogSlugs = getContentSlugs("blog", locale);
    for (const slug of blogSlugs) {
      entries.push({
        url: `${baseUrl}/${locale}/blog/${slug}`,
        lastModified: new Date(),
        changeFrequency: "monthly",
        priority: 0.6,
      });
    }
  }

  return entries;
}
