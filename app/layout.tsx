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
        <StructuredData value={{ "@context": "https://schema.org", "@type": "WebSite", "@id": `${SITE_URL}/#website`, name: SITE_NAME, url: SITE_URL, inLanguage: "en", description: "An independent, source-linked guide to released UAP records." }} />
        {children}
      </body>
    </html>
  );
}
