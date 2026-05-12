import type { Metadata } from "next/types";

const SITE_NAME = "John Ray Loh";
const rawSiteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/[^\x20-\x7E]/g, "").trim();
const siteUrl = rawSiteUrl.replace(/\/$/, "");
const SITE_DESCRIPTION =
  "Engineering Science student in Singapore working at the intersection of deep-tech research and practical, human-centred engineering. CO₂ adsorption research, open-source medical devices, multimodal AI tooling.";

export const OpenGraph: Metadata = {
  metadataBase: new URL(rawSiteUrl),
  title: {
    default: SITE_NAME,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "John Ray Loh",
    "Singapore",
    "Ngee Ann Polytechnic",
    "Engineering Science",
    "CO2 adsorption",
    "Direct Air Capture",
    "packed-bed columns",
    "polymer sorbents",
    "AI",
    "FastAPI",
    "Next.js",
    "open-source medical devices",
    "Lifeline",
    "SENTINEL",
    "ContextGuard",
    "research",
    "hackathons",
    "sustainability",
  ],
  authors: [{ name: "John Ray Loh", url: "https://github.com/lohjo" }],
  creator: "John Ray Loh",
  openGraph: {
    type: "website",
    locale: "en_SG",
    url: process.env.NEXT_PUBLIC_SITE_URL,
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${siteUrl}/api/og`],
    siteName: SITE_NAME,
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [`${siteUrl}/api/og`],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};
