import type { ReactNode } from "react";
import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { locales } from "@/i18n/config";
import { ThemeProvider } from "@/components/layout/ThemeProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import "@/styles/globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0a" },
  ],
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: "Croktile — The Next-Gen GPU & DSA Language. 5x Productivity.",
    template: "%s | Croktile",
  },
  description:
    "Croktile is the next-gen GPU & DSA programming language that achieves 5x productivity over CUDA with zero-cost abstractions.",
  metadataBase: new URL("https://croktile.io"),
  keywords: [
    "croktile",
    "tileflow",
    "GPU programming",
    "DSA programming",
    "domain-specific accelerator",
    "CUDA",
    "DSL",
    "C++ EDSL",
    "data movement",
    "DMA",
    "tensor",
    "machine learning",
    "kernel programming",
  ],
  authors: [{ name: "Croktile Team" }],
  openGraph: {
    type: "website",
    siteName: "Croktile",
    title: "Croktile — The Next-Gen GPU & DSA Language. 5x Productivity.",
    description:
      "The next-gen GPU & DSA language. 5x productivity over CUDA with zero-cost abstractions.",
    url: "https://croktile.io",
    locale: "en_US",
    images: [
      {
        url: "/logo-mascot.png",
        width: 1200,
        height: 630,
        alt: "Croktile — The Next-Gen GPU & DSA Language. 5x Productivity.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Croktile — The Next-Gen GPU & DSA Language. 5x Productivity.",
    description:
      "The next-gen GPU & DSA language. 5x productivity over CUDA with zero-cost abstractions.",
    images: ["/logo-mascot.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon.svg",
  },
};

type Props = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <ThemeProvider>
          <NextIntlClientProvider messages={messages}>
            <Navbar />
            <main className="pt-16">{children}</main>
            <Footer />
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
