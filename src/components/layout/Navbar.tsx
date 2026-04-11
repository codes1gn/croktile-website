"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/routing";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { LangSwitch } from "./LangSwitch";
import { useEffect, useState } from "react";

const TUTORIAL_BASE = "https://codes1gn.github.io/croqtile-tutorial";

const navLinks = [
  { href: "/", labelKey: "product" },
  { href: `${TUTORIAL_BASE}/`, labelKey: "tutorials", external: true },
  { href: `${TUTORIAL_BASE}/`, labelKey: "docs", external: true },
  { href: "/changelog", labelKey: "changelog" },
  { href: "/roadmap", labelKey: "roadmap" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const isActive = (href: string) => {
    const stripped = pathname.replace(/^\/(en|cn)/, "") || "/";
    if (href === "/") return stripped === "/";
    return stripped.startsWith(href);
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[var(--background)]/80 backdrop-blur-xl border-b"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <img
              src="/logo-mascot.png"
              alt="CroqTile"
              className="h-9 w-9 rounded-md object-contain"
            />
            <span className="text-lg font-bold tracking-tight">
              <span className="text-mint-500">Croq</span>
              <span className="text-[var(--foreground)]">Tile</span>
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ href, labelKey, ...rest }) => {
              const isExt = "external" in rest && rest.external;
              const cls = `px-3 py-2 text-sm font-medium transition-colors rounded-lg ${
                !isExt && isActive(href)
                  ? "text-mint-500 bg-mint-500/10"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`;
              return isExt ? (
                <a key={labelKey} href={href} target="_blank" rel="noopener noreferrer" className={cls}>
                  {t(labelKey)}
                </a>
              ) : (
                <Link key={labelKey} href={href} className={cls}>
                  {t(labelKey)}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-1">
            <LangSwitch />
            <ThemeToggle />
            <a
              href="https://github.com/LancerLab/croqtile"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden sm:inline-flex ml-2 px-4 py-2 text-sm font-medium
                         bg-mint-500 text-white rounded-lg hover:bg-mint-600
                         transition-colors items-center gap-2"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              GitHub
            </a>
            <button
              className="md:hidden ml-1 p-2 rounded-lg hover:bg-[var(--muted)] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                {mobileOpen ? (
                  <path d="M18 6L6 18M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {mobileOpen && (
          <div className="md:hidden border-t py-4 space-y-1">
            {navLinks.map(({ href, labelKey, ...rest }) => {
              const isExt = "external" in rest && rest.external;
              const cls = `block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                !isExt && isActive(href)
                  ? "text-mint-500 bg-mint-500/10"
                  : "text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]"
              }`;
              return isExt ? (
                <a key={labelKey} href={href} target="_blank" rel="noopener noreferrer" className={cls} onClick={() => setMobileOpen(false)}>
                  {t(labelKey)}
                </a>
              ) : (
                <Link key={labelKey} href={href} className={cls} onClick={() => setMobileOpen(false)}>
                  {t(labelKey)}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </nav>
  );
}
