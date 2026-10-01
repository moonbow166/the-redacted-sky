import { jsonLd } from "../lib/site";

export default function StructuredData({ value }: { value: unknown }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(value) }} />;
}
