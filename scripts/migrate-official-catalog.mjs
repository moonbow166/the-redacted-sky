// One-time compatibility migration. No descriptions or translations are copied.
// Existing first-party file links are retained as links, not newly verified bytes.
import { readFileSync, writeFileSync } from 'node:fs';
const old = JSON.parse(readFileSync('data/source/pursue.snapshot.json', 'utf8'));
const allowed = new Set(['www.war.gov', 'd34w7g4gy10iej.cloudfront.net', 'd1ldvf68ux039x.cloudfront.net']);
const official = value => {
  if (!value) return null;
  const url = new URL(/^https?:/.test(value) ? value : `https://${value}`);
  return allowed.has(url.hostname) ? url.href : null;
};
const records = old.records.map(row => ({
  title: row.title,
  dvidsId: row.dvidsId ?? null,
  assetUrl: official(row.assetUrl),
  mediaUrl: official(row.mediaUrl),
  thumbnailUrl: official(row.thumbnailUrl),
  metadataNote: row.metadataNote ?? null,
}));
writeFileSync('data/source/official-link-catalog.json', JSON.stringify({
  method: 'Compatibility-only first-party URL catalog, extracted from the earlier ingestion. Original discovery used community indexes. No descriptions, translations, ratings or analysis retained. These URLs are not all newly opened or byte-verified.',
  records,
}, null, 2) + '\n');
