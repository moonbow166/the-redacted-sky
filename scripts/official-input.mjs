import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';

export async function loadOfficialSnapshot(root) {
  const directory = path.join(root, 'data/source');
  const capture = JSON.parse(await readFile(path.join(directory, 'pursue.official-capture.json'), 'utf8'));
  const catalog = JSON.parse(await readFile(path.join(directory, 'official-link-catalog.json'), 'utf8'));
  const media = JSON.parse(await readFile(path.join(directory, 'pursue.official-media.json'), 'utf8'));
  const key = title => title.replace(/\s+/g, ' ').trim().toLowerCase();
  const links = new Map(catalog.records.map(row => [key(row.title), row]));
  const field = (row, name) => row.indexCells.find(cell => cell.startsWith(name + ' '))?.slice(name.length + 1) ?? '';
  if (capture.records.length !== 450 || new Set(capture.records.map(row => key(row.title))).size !== 450) throw new Error('Official capture coverage mismatch');
  const records = capture.records.map(row => {
    const prior = links.get(key(row.title));
    if (!prior) throw new Error(`Unmatched official record: ${row.title}`);
    const fresh = media.records.find(item => row.title.startsWith(item.id + ','));
    const type = field(row, 'File Type');
    const preview = row.images.find(image => image.url.startsWith('https://www.war.gov/'));
    const assetUrl = fresh?.sources.find(url => url.endsWith('.mp4')) ?? prior.assetUrl ?? (type === '.img' ? preview?.url : null);
    return {
      title: row.title,
      type,
      agency: field(row, 'Agency'),
      release: `release_${field(row, 'Release').match(/Release (\d+)$/)?.[1]}`,
      incidentDate: field(row, 'Incident Date'),
      incidentLocation: field(row, 'Incident Location'),
      descriptionOriginal: row.description,
      descriptionZh: null,
      sourceAttribution: 'war-pursue-independent-20261002',
      sourcePageUrl: row.sourcePageUrl,
      capturedAt: row.capturedAt,
      captureHash: row.captureHash,
      assetUrl,
      mediaUrl: fresh ? assetUrl : prior.mediaUrl,
      thumbnailUrl: fresh?.poster ?? preview?.url ?? prior.thumbnailUrl,
      dvidsId: fresh?.videoId ?? prior.dvidsId,
      mediaSourcePageUrl: fresh?.sourcePageUrl ?? null,
      metadataNote: prior.metadataNote,
      assetProvenance: fresh ? 'Player source and poster independently read from the official DVIDS page; record identifier matched against PURSUE.' : 'Official preview captured from PURSUE where available. Other first-party file links retained from the prior URL catalog; not all binaries newly opened or verified.',
      relatedOfficialTitles: row.related,
      previewOnly: type === '.img' && !prior.assetUrl,
    };
  });
  return {
    snapshotVersion: 1,
    fetchedAt: capture.capturedAt,
    records,
    sources: [
      { id: 'pursue', url: capture.source, role: 'All 450 record titles, index fields, descriptions and related-record labels independently captured from public rendered official pages.' },
      { id: 'dvids', url: 'https://www.dvidshub.net/', role: '32 replacement media URLs and posters independently captured from official player source elements.' },
    ],
    officialVerification: { records: 450, indexPages: 38, releases: 6, method: capture.method, checkedAt: capture.capturedAt, mediaLinksIndependentlyRecaptured: media.records.length, fullDocumentContentReview: false, allBinaryHashesVerified: false },
    inputHashes: Object.fromEntries(await Promise.all(['pursue.official-capture.json', 'pursue.official-media.json', 'official-link-catalog.json'].map(async name => [name, createHash('sha256').update(await readFile(path.join(directory, name))).digest('hex')]))),
  };
}
