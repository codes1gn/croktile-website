"use client";

import { type ReactNode } from "react";
import { ScrollReveal } from "./ScrollReveal";

type Props = {
  icon: ReactNode;
  title: string;
  subtitle: string;
  description?: string;
  descBullets?: string[];
  leftFooter?: ReactNode;
  bottomContent?: ReactNode;
  children?: ReactNode;
  reversed?: boolean;
};

export function FeatureCard({
  icon,
  title,
  subtitle,
  description,
  descBullets,
  leftFooter,
  bottomContent,
  children,
  reversed = false,
}: Props) {
  return (
    <section className="py-20 sm:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex flex-col ${
            reversed ? "lg:flex-row-reverse" : "lg:flex-row"
          } gap-12 lg:gap-20 items-center`}
        >
          <div className="flex-1 max-w-xl">
            <ScrollReveal>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mint-500/10 text-mint-600 dark:text-mint-400 text-sm font-medium mb-6">
                {icon}
                {subtitle}
              </div>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
                {title}
              </h2>
              {descBullets && descBullets.length > 0 ? (
                <ul className="space-y-2">
                  {descBullets.map((bullet, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-base text-[var(--muted-foreground)] leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-mint-500 shrink-0 mt-2.5" />
                      {bullet}
                    </li>
                  ))}
                </ul>
              ) : description ? (
                <p className="text-lg text-[var(--muted-foreground)] leading-relaxed">
                  {description}
                </p>
              ) : null}
              {leftFooter && <div className="mt-6">{leftFooter}</div>}
            </ScrollReveal>
          </div>
          <div className="flex-1 w-full max-w-xl">
            <ScrollReveal delay={0.15}>{children}</ScrollReveal>
          </div>
        </div>
        {bottomContent && (
          <ScrollReveal delay={0.3}>
            <div className="mt-12">{bottomContent}</div>
          </ScrollReveal>
        )}
      </div>
    </section>
  );
}
