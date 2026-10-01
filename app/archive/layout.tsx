import type { Metadata } from "next";
import { archiveCases, archiveRecords } from "../../lib/archive";

const description = `Search, view and listen to ${archiveRecords.length} public-release UAP records in ${archiveCases.length} case files, with original sources and provenance.`;

export const metadata: Metadata = {
  title: "UAP Case Archive | The Redacted Sky",
  description,
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "UAP Case Archive | The Redacted Sky",
    description,
    type: "website",
    url: "/archive",
    images: [{ url: "/og-v8.png", width: 1736, height: 909, alt: "The Redacted Sky UAP Case Archive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UAP Case Archive | The Redacted Sky",
    description,
    images: ["/og-v8.png"],
  },
};

export default function ArchiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
