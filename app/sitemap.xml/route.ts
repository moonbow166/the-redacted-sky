import { archiveCases } from "../../lib/archive";
import { absoluteUrl, casePath } from "../../lib/site";

export function GET() {
  const paths = ["/", "/archive", "/guide", "/sources", "/cases", "/explore/tremonton-1952", ...archiveCases.map(entry => casePath(entry.slug))];
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${paths.map(path => `<url><loc>${absoluteUrl(path).replaceAll("&", "&amp;")}</loc></url>`).join("")}</urlset>`;
  return new Response(body, { headers: { "Content-Type": "application/xml; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
