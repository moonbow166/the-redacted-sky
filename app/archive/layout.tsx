import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "UAP Case Archive | The Redacted Sky",
  description:
    "Search, filter, inspect, and share 279 UAP cases grouped from 334 official public-release records.",
  alternates: {
    canonical: "/archive",
  },
  openGraph: {
    title: "UAP Case Archive | The Redacted Sky",
    description:
      "Search, filter, inspect, and share 279 UAP cases grouped from 334 official public-release records.",
    type: "website",
    images: [{ url: "/og-v8.png", width: 1736, height: 909, alt: "The Redacted Sky UAP Case Archive" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "UAP Case Archive | The Redacted Sky",
    description:
      "Search, filter, inspect, and share 279 UAP cases grouped from 334 official public-release records.",
    images: ["/og-v8.png"],
  },
};

export default function ArchiveLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return children;
}
