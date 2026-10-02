import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { archiveCases, archiveRecords } from "../lib/archive";
import { SITE_URL, SITE_NAME } from "../lib/site";
import StructuredData from "../components/StructuredData";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export async function generateMetadata(): Promise<Metadata> {
  const origin = SITE_URL;
  const title = "The Redacted Sky | Declassified UAP Archive";
  const description =
    `Enter a field of UAP morphologies, inspect source footage, then explore ${archiveRecords.length} public-release records grouped into ${archiveCases.length} case files.`;

  return {
    metadataBase: new URL(origin),
    alternates: { canonical: "/" },
    robots: { index: true, follow: true },
    title,
    description,
    icons: {
      icon: "/favicon.png",
      shortcut: "/favicon.png",
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: origin,
      images: [{ url: `${origin}/og-v8.png`, width: 1736, height: 909, alt: title }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [`${origin}/og-v8.png`],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <template id="my-sky-design-contract" dangerouslySetInnerHTML={{ __html: `<!--
THESIS: Two real materials grow a personal constellation, not a quiz or reading-card sequence.
OWN-WORLD: Inherited deep green, Geist, mint controls, warm personal links, real source media, shared line icons.
STORY: Keep two clues, name a tentative connection, revisit or undo. Source listings and personal guesses stay distinct.
FIRST VIEWPORT: Paired source observation bench above a visible constellation, with keep actions and one state-aware invitation.
FORM: Candidate 4 of 5, paired observation bench above a growing constellation. Seed 1c4bd728. Sites direct-preview workflow; no comp-selection gate.
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, and DESIGN.md
-->` }} />
        <StructuredData value={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, inLanguage: "en", description: "An independent, source-linked guide to released UAP records." }} />
        {children}
      </body>
    </html>
  );
}
