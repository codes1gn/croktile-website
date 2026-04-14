"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  const tutorialBase = "https://lancerlab.github.io/croqtile-tutorial";

  const sections = [
    {
      title: t("product"),
      links: [
        { label: t("tutorials"), href: `${tutorialBase}/`, external: true },
        { label: t("docs"), href: `${tutorialBase}/`, external: true },
      ],
    },
    {
      title: t("resources"),
      links: [{ label: t("changelog"), href: "/changelog" }],
    },
    {
      title: t("community"),
      links: [
        { label: t("github"), href: "https://github.com/LancerLab/croqtile", external: true },
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
              alt="CroqTile"
              className="h-8 w-8 rounded-md object-contain"
              />
              <span className="text-lg font-bold tracking-tight">
                <span className="text-mint-500">Croq</span>Tile
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
        <div className="mt-12 pt-8 border-t flex flex-col items-center gap-4">
          <a
            href="https://github.com/LancerLab/croqtile"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border hover:bg-[var(--muted)] transition-colors text-sm"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            Star on GitHub
          </a>
          <p className="text-xs text-[var(--muted-foreground)]">
            Built with care by the CroqTile Team
          </p>
          <p className="text-sm text-[var(--muted-foreground)]">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
