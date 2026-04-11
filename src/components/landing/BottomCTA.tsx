"use client";

import { useTranslations } from "next-intl";
import { motion } from "framer-motion";
import { ScrollReveal } from "./ScrollReveal";

const metrics = [
  { value: "62%", label: "less code than CUDA+CuTe" },
  { value: "353", label: "compile-time checks" },
  { value: "~500", label: "tokens/iter — 70% less than CUDA tuning" },
];

export function BottomCTA() {
  const t = useTranslations("hero");

  return (
    <section className="relative py-28 overflow-hidden">
      <div className="absolute inset-0 bg-grid opacity-30 dark:opacity-15" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full bg-mint-400/15 dark:bg-mint-500/10 blur-3xl" />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <ScrollReveal>
          <img
            src="/logo-mascot.png"
            alt="CroqTile mascot"
            className="mx-auto h-24 w-24 mb-8 rounded-xl object-contain"
          />
          <h2 className="text-4xl sm:text-5xl font-extrabold tracking-tight">
            Try <span className="text-gradient">CroqTile</span> today.
          </h2>
          <p className="mt-4 text-lg text-[var(--muted-foreground)] max-w-xl mx-auto">
            {t("subtitle")}
          </p>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-6 mt-10 mb-10">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + i * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-mint-500">{m.value}</div>
                <div className="text-xs text-[var(--muted-foreground)] mt-1">{m.label}</div>
              </motion.div>
            ))}
          </div>
        </ScrollReveal>

        <ScrollReveal delay={0.2}>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://codes1gn.github.io/croqtile-tutorial/"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-sm font-semibold bg-mint-500 text-white rounded-xl
                         hover:bg-mint-600 transition-all shadow-lg shadow-mint-500/25
                         hover:shadow-mint-500/40 hover:scale-[1.02] active:scale-[0.98]"
            >
              {t("cta")}
            </a>
            <a
              href="https://github.com/LancerLab/croqtile"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-sm font-semibold border rounded-xl
                         hover:bg-[var(--muted)] transition-all flex items-center justify-center gap-2
                         hover:scale-[1.02] active:scale-[0.98]"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
              </svg>
              View on GitHub
            </a>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
