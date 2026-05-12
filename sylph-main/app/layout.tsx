import "@/styles/main.css";

import clsx from "clsx";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Source_Serif_4 } from "next/font/google";
import { Providers } from "@/components/providers";
import { OpenGraph } from "@/lib/og";

export const metadata: Metadata = {
  ...OpenGraph,
};

export const viewport: Viewport = {
  colorScheme: "dark light",
};

const geist = Geist({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});

const sourceSerif = Source_Serif_4({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-serif",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-mono",
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={clsx(geist.variable, sourceSerif.variable, geistMono.variable)} suppressHydrationWarning>
      <body className="font-sans">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded focus:bg-background focus:px-3 focus:py-2 focus:text-foreground"
        >
          Skip to main content
        </a>
        <Providers>
          <main id="main-content" className="mx-auto max-w-screen-sm overflow-x-hidden px-6 py-24 md:overflow-x-visible">
            <article className="article">{children}</article>
          </main>
        </Providers>
      </body>
    </html>
  );
}
