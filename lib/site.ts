import type { Metadata } from "next";

// The verified public origin, never a visitor-controlled Host header.
export const SITE_URL = "https://the-redacted-sky.moonbow166.chatgpt.site";
export const SITE_NAME = "The Redacted Sky";
export const SOURCE_CODE_URL = "https://github.com/moonbow166/the-redacted-sky";

export function absoluteUrl(path: string) { return new URL(path, SITE_URL).href; }
export function casePath(slug: string) { return `/cases/${encodeURIComponent(slug)}`; }
export function readableText(value: string) { return value.replaceAll("\u2014", ","); }
export function recordTitle(value: string) { return readableText(value.replace(/^[A-Z]{2,}-UAP-[A-Z0-9]+[a-z]?,\s*/, "").replaceAll("_", " ")); }
export function metadataDescription(value: string) {
  const normalized = readableText(value).replace(/\s+/g, " ").trim();
  return normalized.length <= 165 ? normalized : `${normalized.slice(0, 162).replace(/\s+\S*$/, "")}…`;
}
export function pageMetadata(title: string, description: string, path: string): Metadata {
  const fullTitle = `${title} | ${SITE_NAME}`;
  return {
    title: fullTitle, description, alternates: { canonical: absoluteUrl(path) },
    openGraph: { title: fullTitle, description, url: absoluteUrl(path), type: "website", images: [{ url: absoluteUrl("/og-v8.png"), width: 1736, height: 909, alt: SITE_NAME }] },
    twitter: { card: "summary_large_image", title: fullTitle, description, images: [absoluteUrl("/og-v8.png")] },
  };
}
export function jsonLd(value: unknown) { return JSON.stringify(value).replace(/</g, "\\u003c"); }
