"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const sections = [
    {
      title: t("product"),
      links: [
        { label: t("tutorials"), href: "/tutorials" },
        { label: t("docs"), href: "/docs" },
      ],
    },
    {
      title: t("resources"),
      links: [
        { label: t("changelog"), href: "/changelog" },
        { label: t("blog"), href: "/blog" },
      ],
    },
    {
      title: t("community"),
      links: [
        { label: t("github"), href: "https://github.com/codes1gn/croktile", external: true },
      ],
    },
  ];

  return (
    <footer className="border-t bg-[var(--card)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5">
              <img
                src="/logo-mascot.png"
                alt="Croktile"
                className="h-8 w-auto rounded-md"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-mint-500">Crok</span>Tile
              </span>
            </Link>
            <p className="mt-3 text-sm text-[var(--muted-foreground)] max-w-xs">
              The TileFlow language for GPU programming.
            </p>
          </div>
          {sections.map((section) => (
            <div key={section.title}>
              <h3 className="text-sm font-semibold mb-3">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.label}>
                    {"external" in link && link.external ? (
                      <a
                        href={link.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {link.label}
                      </a>
                    ) : (
                      <Link
                        href={link.href}
                        className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                      >
                        {link.label}
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t text-center text-sm text-[var(--muted-foreground)]">
          {t("copyright", { year })}
        </div>
      </div>
    </footer>
  );
}
