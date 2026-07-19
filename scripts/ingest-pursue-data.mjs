#!/usr/bin/env node

import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const PARSER_VERSION = "1.0.0";
const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const DATA_DIR = path.join(PROJECT_ROOT, "data");
const SOURCE_PATH = path.join(DATA_DIR, "source", "pursue.snapshot.json");

const RELEASE_METADATA = [
  {
    id: "release-01",
    label: "Release 01",
    clearedDate: "2026-05-08",
    documents: {
      url: "https://www.war.gov/medialink/ufo/bundle/Release_1.zip",
      displayedSize: "1.2 GB",
    },
    videos: {
      url: "https://d34w7g4gy10iej.cloudfront.net/uapvideos.zip",
      displayedSize: "1.3 GB",
    },
  },
  {
    id: "release-02",
    label: "Release 02",
    clearedDate: "2026-05-22",
    documents: {
      url: "https://www.war.gov/medialink/ufo/052226/release_02/release_02_document_bundle.zip",
      displayedSize: "70.1 MB",
    },
    videos: {
      url: "https://d34w7g4gy10iej.cloudfront.net/uap052226.zip",
      displayedSize: "5.6 GB",
    },
  },
  {
    id: "release-03",
    label: "Release 03",
    clearedDate: "2026-06-12",
    documents: {
      url: "https://www.war.gov/medialink/ufo/061226/release_03/release_03_documents.zip",
      displayedSize: "826 MB",
    },
    videos: {
      url: "https://d34w7g4gy10iej.cloudfront.net/release_03/uap_videos_061226.zip",
      displayedSize: "4.6 GB",
    },
  },
  {
    id: "release-04",
    label: "Release 04",
    clearedDate: "2026-07-10",
    documents: {
      url: "https://www.war.gov/medialink/ufo/071026/release_04/release_04_documents_071026.zip",
      displayedSize: "227 MB",
    },
    videos: {
      url: "https://d34w7g4gy10iej.cloudfront.net/release_04/uap_release04_videos_071026.zip",
      displayedSize: "1.4 GB",
    },
  },
];

const FEATURED_TARGETS = [
  "sts-80-1996",
  "DOW-UAP-PR104",
  "DOW-UAP-PR105",
  "DOW-UAP-PR113",
  "DOE-UAP-D004",
  "DOW-UAP-D094",
  "dvids-1006056",
  "NASA-UAP-D003A",
  "fbi-62-hq-83894",
  "DOW-UAP-PR050",
  "dvids-1007720",
  "ODNI-UAP-D001",
  "western-us-event-2023",
  "colorado-springs-2022",
  "apollo-16-scientific-debriefing",
];

const MANUAL_GROUPS = [
  {
    key: "sts-80-1996",
    title: "STS-80 unidentified-object imagery, 1996",
    rawIds: ["NASA-UAP-D030", "NASA-UAP-D031", "NASA-UAP-D032"],
    eventDate: "1996",
    eventDatePrecision: "year",
    locationLabel: "Low-Earth Orbit",
    locationPrecision: "regional",
    groupingBasis: "The official titles identify three consecutively numbered images from the same STS-80 mission incident and source package.",
  },
  {
    key: "colorado-springs-2022",
    title: "Colorado Springs UAP incident, 2022",
    rawIds: ["FBI-UAP-D001", "FBI-UAP-D002", "FBI-UAP-D003", "ICA-UAP-D001"],
    eventDate: "2022",
    eventDatePrecision: "year",
    locationLabel: "Colorado Springs, Colorado",
    locationPrecision: "approximate",
    groupingBasis: "All four official titles name the Colorado Springs 2022 incident; the ICA record is explicitly an analysis of that incident.",
  },
  {
    key: "western-us-event-2023",
    title: "Western United States Event, 2023",
    titleIncludes: ["Western United States Event", "Western US Event"],
    releases: ["release-01", "release-03"],
    eventDate: "2023",
    eventDatePrecision: "year",
    locationLabel: "Western United States",
    locationPrecision: "regional",
    groupingBasis: "The records share the official event name, 2023 date, region, narrative numbering, and update/source-package language across Releases 01 and 03.",
  },
  {
    key: "apollo-16-scientific-debriefing",
    title: "Apollo 16 scientific debriefing excerpts",
    rawIds: ["NASA-UAP-D024", "NASA-UAP-D025"],
    eventDate: "1972",
    eventDatePrecision: "year",
    locationLabel: null,
    locationPrecision: "unknown",
    groupingBasis: "Both official records use the identical Apollo 16 Scientific Debriefing source-package title and adjacent identifiers.",
  },
  {
    key: "fbi-62-hq-83894",
    title: "FBI 62-HQ-83894 case-file package",
    titleIncludes: ["65_HS1-834228961_62-HQ-83894_"],
    releases: ["release-01"],
    eventDate: null,
    eventDatePrecision: "unknown",
    locationLabel: null,
    locationPrecision: "unknown",
    groupingBasis: "The official filenames identify sections, serials, and a subfile of the same FBI 62-HQ-83894 source package.",
  },
  {
    key: "usaf-flying-objects-analysis-1-172",
    title: "U.S. Air Force analysis of flying objects, records 1–172",
    rawIds: ["DOW-UAP-D087", "DOW-UAP-D088"],
    eventDate: null,
    eventDatePrecision: "unknown",
    locationLabel: null,
    locationPrecision: "unknown",
    groupingBasis: "The official titles label the records as consecutive 1–100 and 101–172 parts of one U.S. Air Force analysis package.",
  },
  {
    key: "cia-unconventional-aircraft-1955",
    title: "CIA unconventional-aircraft sightings package, 1955",
    rawIds: ["CIA-UAP-D020", "CIA-UAP-D021"],
    eventDate: "1955",
    eventDatePrecision: "year",
    locationLabel: "Azerbaijan",
    locationPrecision: "regional",
    groupingBasis: "The D020 description explicitly points to D021 as the contemporary analysis of the same 1955 sightings package.",
  },
];

function sha256(value) {
  return createHash("sha256").update(value).digest("hex");
}

function stableStringify(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function cleanText(value) {
  const text = String(value ?? "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").trim();
  return text || null;
}

function normalizeUrl(value) {
  const text = cleanText(value);
  if (!text) return null;
  const withScheme = /^https?:\/\//i.test(text) ? text : `https://${text.replace(/^\/+/, "")}`;
  return new URL(withScheme).toString();
}

function rawIdentifier(title) {
  const match = cleanText(title)?.match(/^([A-Z]{2,}(?:-[A-Z0-9]+)+[a-z]?)/);
  return match?.[1] ?? cleanText(title);
}

function releaseIdFromSource(value) {
  const match = String(value).match(/(?:release[_ -]?|Release\s+)(\d+)/i);
  if (!match) throw new Error(`Cannot parse release identifier: ${value}`);
  return `release-${match[1].padStart(2, "0")}`;
}

function titleHash(title) {
  return String(title ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^A-Za-z0-9\-_]/g, "")
    .replace(/-+/g, "-");
}

function slugify(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 90) || "untitled";
}

function mapFileType(value) {
  const type = String(value ?? "").replace(/^\./, "").toLowerCase();
  if (type === "vid" || type === "video") return "video";
  if (type === "aud" || type === "audio") return "audio";
  if (type === "img" || type === "image") return "image";
  if (type === "pdf") return "pdf";
  return "other";
}

function mimeFromUrl(url, fallbackKind) {
  const pathname = new URL(url).pathname.toLowerCase();
  if (pathname.endsWith(".pdf")) return "application/pdf";
  if (pathname.endsWith(".mp4")) return "video/mp4";
  if (pathname.endsWith(".mov")) return "video/quicktime";
  if (pathname.endsWith(".png")) return "image/png";
  if (pathname.endsWith(".webp")) return "image/webp";
  if (pathname.match(/\.jpe?g$/)) return "image/jpeg";
  if (fallbackKind === "audio") return "audio/*";
  return null;
}

const MONTHS = new Map(
  ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
    .map((month, index) => [month.toLowerCase(), String(index + 1).padStart(2, "0")]),
);

function fourDigitYear(value) {
  const year = Number(value);
  if (String(value).length === 4) return year;
  return year <= 30 ? 2000 + year : 1900 + year;
}

function isoDay(month, day, year) {
  return `${fourDigitYear(year)}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function parseIncidentDate(value) {
  const raw = cleanText(value);
  if (!raw || /^(?:N\/?A|NA|unknown)$/i.test(raw)) return { value: null, precision: "unknown", warning: null };

  let match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
  if (match) return { value: isoDay(match[1], match[2], match[3]), precision: "day", warning: null };

  match = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})-(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (match) {
    return {
      value: `${isoDay(match[1], match[2], match[3])}/${isoDay(match[4], match[5], match[6])}`,
      precision: "range",
      warning: null,
    };
  }

  if (/^\d{4}$/.test(raw)) return { value: raw, precision: "year", warning: null };
  match = raw.match(/^(\d{4})s$/);
  if (match) return { value: `${match[1]}/${Number(match[1]) + 9}`, precision: "range", warning: null };
  match = raw.match(/^(\d{4})[-–](\d{4})$/);
  if (match) return { value: `${match[1]}/${match[2]}`, precision: "range", warning: null };

  match = raw.match(/^([A-Za-z]+),?\s+(\d{4})$/);
  if (match && MONTHS.has(match[1].toLowerCase())) {
    return { value: `${match[2]}-${MONTHS.get(match[1].toLowerCase())}`, precision: "month", warning: null };
  }

  match = raw.match(/^Late\s+(\d{4})$/i);
  if (match) return { value: match[1], precision: "range", warning: "Source gives only a relative part of the year (Late)." };

  match = raw.match(/^([A-Za-z]+)\s+(\d{1,2})\s*-\s*([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (match && MONTHS.has(match[1].toLowerCase()) && MONTHS.has(match[3].toLowerCase())) {
    return {
      value: `${isoDay(MONTHS.get(match[1].toLowerCase()), match[2], match[5])}/${isoDay(MONTHS.get(match[3].toLowerCase()), match[4], match[5])}`,
      precision: "range",
      warning: null,
    };
  }

  match = raw.match(/^([A-Za-z]+)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})$/);
  if (match && MONTHS.has(match[1].toLowerCase())) {
    const month = MONTHS.get(match[1].toLowerCase());
    return {
      value: `${isoDay(month, match[2], match[4])}/${isoDay(month, match[3], match[4])}`,
      precision: "range",
      warning: null,
    };
  }

  if (/[-–]/.test(raw)) return { value: raw, precision: "range", warning: "Range retained verbatim because the source omits an exact endpoint." };
  return { value: raw, precision: "unknown", warning: "Date retained verbatim because it could not be normalized without inference." };
}

function locationFromLabel(value) {
  const label = cleanText(value);
  if (!label || /^(?:N\/?A|NA)$/i.test(label)) {
    return { label: null, lat: null, lng: null, precision: "unknown" };
  }
  if (/redact|withheld|classified/i.test(label)) {
    return { label, lat: null, lng: null, precision: "withheld" };
  }
  if (/^various$/i.test(label)) {
    return { label, lat: null, lng: null, precision: "unknown" };
  }
  const regional = /(?:ocean|sea|gulf|orbit|space|moon|earth|middle east|north america|united states|africa|europe|asia|various|pacific|centcom|eucom|indopacom|pacom|cislunar|ussr|australia|hungary|germany|iraq|iran|syria|japan|azerbaijan|bhutan|nepal|india|zimbabwe|mediterranean|afghanistan|djibouti|kuwait|oman|emirates|texas|virginia|new mexico)$/i.test(label);
  return { label, lat: null, lng: null, precision: regional ? "regional" : "approximate" };
}

function statusFor(source, parsedDate) {
  const title = cleanText(source.title) ?? "";
  const description = cleanText(source.descriptionOriginal) ?? "";
  if (/unresolved (?:uap|case)/i.test(`${title} ${description}`)) {
    return { status: "unresolved", assessment: null, basis: "Official title or description explicitly says unresolved." };
  }
  const resolvedSentence = description.match(/NASA later determined that [^.]+\./i)?.[0] ?? null;
  if (resolvedSentence) {
    return { status: "resolved", assessment: resolvedSentence, basis: "Official NASA description states a determination." };
  }
  const firstYear = parsedDate.value?.match(/\d{4}/)?.[0];
  if (firstYear && Number(firstYear) < 2000 && mapFileType(source.type) !== "video") {
    return {
      status: "historical",
      assessment: null,
      basis: "Temporal classification: pre-2000 non-video source, not a resolution claim.",
    };
  }
  return { status: "not-stated", assessment: null, basis: "No explicit official disposition was found." };
}

function buildAssets(source, fileType) {
  const assets = [];
  const add = (asset) => {
    if (!asset.url || assets.some((existing) => existing.url === asset.url)) return;
    assets.push(asset);
  };
  const primaryUrl = normalizeUrl(source.assetUrl);
  const mediaUrl = normalizeUrl(source.mediaUrl);
  const thumbnailUrl = normalizeUrl(source.thumbnailUrl);

  if (primaryUrl) {
    const pathname = new URL(primaryUrl).pathname.toLowerCase();
    const kind = pathname.endsWith(".pdf") ? "pdf" : fileType === "other" ? "other" : fileType;
    add({
      kind,
      url: primaryUrl,
      mimeType: mimeFromUrl(primaryUrl, kind),
      width: mediaUrl === primaryUrl ? source.mediaWidth ?? null : null,
      height: mediaUrl === primaryUrl ? source.mediaHeight ?? null : null,
      durationSeconds: mediaUrl === primaryUrl ? source.durationSeconds ?? null : null,
    });
  }
  if (mediaUrl) {
    const kind = fileType === "audio" ? "audio" : "video";
    add({
      kind,
      url: mediaUrl,
      mimeType: source.mediaMimeType ?? mimeFromUrl(mediaUrl, kind),
      width: source.mediaWidth ?? null,
      height: source.mediaHeight ?? null,
      durationSeconds: source.durationSeconds ?? null,
    });
  }
  if (thumbnailUrl) {
    add({
      kind: "thumbnail",
      url: thumbnailUrl,
      mimeType: mimeFromUrl(thumbnailUrl, "image"),
      width: source.thumbnailWidth ?? null,
      height: source.thumbnailHeight ?? null,
      durationSeconds: null,
    });
  }
  return assets.sort((a, b) => `${a.kind}:${a.url}`.localeCompare(`${b.kind}:${b.url}`));
}

function countsBy(items, getter) {
  return Object.fromEntries(
    [...items.reduce((map, item) => {
      const key = getter(item);
      map.set(key, (map.get(key) ?? 0) + 1);
      return map;
    }, new Map())].sort(([a], [b]) => a.localeCompare(b)),
  );
}

function shortSummary(value, fallback) {
  const text = cleanText(value)?.replace(/\s+/g, " ") ?? fallback;
  if (text.length <= 420) return text;
  const cut = text.slice(0, 417).replace(/\s+\S*$/, "");
  return `${cut}…`;
}

function caseStatus(records) {
  const statuses = new Set(records.map((record) => record.officialStatus));
  if (statuses.has("unresolved")) return "unresolved";
  if (statuses.has("under-analysis")) return "under-analysis";
  if (statuses.has("resolved") && statuses.size === 1) return "resolved";
  if ([...statuses].every((status) => status === "historical")) return "historical";
  return "not-stated";
}

function representativeDate(records) {
  const known = records.filter((record) => record.incidentDate);
  if (!known.length) return { value: null, precision: "unknown" };
  const order = new Map([["day", 0], ["month", 1], ["year", 2], ["range", 3], ["unknown", 4]]);
  known.sort((a, b) => (order.get(a.incidentDatePrecision) ?? 9) - (order.get(b.incidentDatePrecision) ?? 9));
  return { value: known[0].incidentDate, precision: known[0].incidentDatePrecision };
}

function representativeLocation(records) {
  const known = records.map((record) => record.location).filter((location) => location.label);
  if (!known.length) return { label: null, lat: null, lng: null, precision: "unknown" };
  const counts = countsBy(known, (location) => location.label);
  const label = Object.entries(counts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0][0];
  return known.find((location) => location.label === label);
}

function evidenceCompleteness(records) {
  const kinds = new Set(records.flatMap((record) => record.assetUrls.map((asset) => asset.kind)));
  const hasDescription = records.some((record) => record.descriptionOriginal);
  if (records.length > 1 && hasDescription && (kinds.has("video") || kinds.has("audio") || kinds.has("image"))) return "high";
  if (hasDescription && records.every((record) => record.assetUrls.length > 0)) return "medium";
  if (records.some((record) => record.assetUrls.length > 0 || record.descriptionOriginal)) return "low";
  return "unknown";
}

function recordMatchesGroup(source, record, definition) {
  if (definition.releases && !definition.releases.includes(record.releaseId)) return false;
  if (definition.rawIds?.includes(source.rawId)) return true;
  return definition.titleIncludes?.some((fragment) => cleanText(source.title)?.includes(fragment)) ?? false;
}

function buildCase(key, title, members, sourcesById, options = {}) {
  const sortedMembers = [...members].sort((a, b) => a.id.localeCompare(b.id));
  const date = options.eventDate !== undefined
    ? { value: options.eventDate, precision: options.eventDatePrecision }
    : representativeDate(sortedMembers);
  const location = options.locationPrecision
    ? { label: options.locationLabel ?? null, lat: null, lng: null, precision: options.locationPrecision }
    : representativeLocation(sortedMembers);
  const assessments = [...new Set(sortedMembers.map((record) => record.officialAssessment).filter(Boolean))];
  const featureIndex = FEATURED_TARGETS.indexOf(key);
  return {
    id: `case-${slugify(key)}`,
    slug: slugify(title),
    title,
    summary: options.summary ?? shortSummary(
      sortedMembers.find((record) => record.descriptionOriginal)?.descriptionOriginal,
      `Official PURSUE source package containing ${sortedMembers.length} record${sortedMembers.length === 1 ? "" : "s"}.`,
    ),
    eventDate: date.value,
    eventDatePrecision: date.precision,
    location,
    agencies: [...new Set(sortedMembers.map((record) => record.agency))].sort(),
    recordIds: sortedMembers.map((record) => record.id),
    mediaKinds: [...new Set(sortedMembers.map((record) => record.fileType))].sort(),
    officialStatus: caseStatus(sortedMembers),
    officialAssessment: assessments.length === 1 ? assessments[0] : null,
    evidenceCompleteness: evidenceCompleteness(sortedMembers),
    featuredRank: featureIndex >= 0 ? featureIndex + 1 : null,
    groupingBasis: options.groupingBasis ?? "Kept as a singleton because no explicit same-event or same-package link was found in the available official metadata.",
    reconstructionAllowed: false,
    reconstructionDisclosure: null,
  };
}

async function atomicWrite(target, value) {
  const temporary = `${target}.tmp`;
  await writeFile(temporary, stableStringify(value), "utf8");
  await rename(temporary, target);
}

async function main() {
  const snapshot = JSON.parse(await readFile(SOURCE_PATH, "utf8"));
  if (snapshot.snapshotVersion !== 1) throw new Error(`Unsupported snapshot version: ${snapshot.snapshotVersion}`);
  await mkdir(DATA_DIR, { recursive: true });

  const baseIdCounts = countsBy(snapshot.records, (source) => rawIdentifier(source.title));
  const dateWarnings = [];
  const statusDecisions = [];
  const sourcesById = new Map();

  const records = snapshot.records.map((source) => {
    const releaseId = releaseIdFromSource(source.release);
    const rawId = rawIdentifier(source.title);
    const id = baseIdCounts[rawId] > 1 ? `${rawId}@${releaseId}` : rawId;
    const date = parseIncidentDate(source.incidentDate);
    if (date.warning) dateWarnings.push({ recordId: id, sourceValue: cleanText(source.incidentDate), warning: date.warning });
    const fileType = mapFileType(source.type);
    const descriptionOriginal = cleanText(source.descriptionOriginal);
    const status = statusFor({ ...source, descriptionOriginal }, date);
    statusDecisions.push({ recordId: id, status: status.status, basis: status.basis });
    const normalizedSource = {
      rawId,
      title: cleanText(source.title),
      releaseId,
      dvidsId: cleanText(source.dvidsId),
      translationMatch: source.translationMatch ?? null,
    };
    sourcesById.set(id, normalizedSource);
    return {
      id,
      releaseId,
      title: cleanText(source.title),
      agency: cleanText(source.agency),
      fileType,
      releaseDate: RELEASE_METADATA.find((release) => release.id === releaseId)?.clearedDate ?? null,
      incidentDate: date.value,
      incidentDatePrecision: date.precision,
      location: locationFromLabel(source.incidentLocation),
      officialStatus: status.status,
      officialAssessment: status.assessment,
      descriptionOriginal,
      descriptionZh: cleanText(source.descriptionZh),
      sourcePageUrl: `https://www.war.gov/UFO/#${titleHash(source.title)}`,
      assetUrls: buildAssets(source, fileType),
      sourceHash: sha256(JSON.stringify(source)),
    };
  }).sort((a, b) => a.id.localeCompare(b.id));

  const recordsById = new Map(records.map((record) => [record.id, record]));
  const assigned = new Set();
  const cases = [];
  const appliedGroups = [];

  for (const definition of MANUAL_GROUPS) {
    const members = records.filter((record) => !assigned.has(record.id) && recordMatchesGroup(sourcesById.get(record.id), record, definition));
    if (members.length < 2) throw new Error(`Manual group ${definition.key} matched ${members.length} records`);
    members.forEach((record) => assigned.add(record.id));
    cases.push(buildCase(definition.key, definition.title, members, sourcesById, definition));
    appliedGroups.push({ key: definition.key, recordIds: members.map((record) => record.id).sort(), reason: definition.groupingBasis });
  }

  const dvidsGroups = new Map();
  for (const record of records) {
    if (assigned.has(record.id)) continue;
    const dvidsId = sourcesById.get(record.id).dvidsId;
    if (!dvidsId) continue;
    if (!dvidsGroups.has(dvidsId)) dvidsGroups.set(dvidsId, []);
    dvidsGroups.get(dvidsId).push(record);
  }
  for (const [dvidsId, members] of [...dvidsGroups].sort(([a], [b]) => a.localeCompare(b))) {
    if (members.length < 2) continue;
    members.forEach((record) => assigned.add(record.id));
    const videoRecord = members.find((record) => record.fileType === "video") ?? members[0];
    const title = videoRecord.title;
    const groupingBasis = `The official source rows share DVIDS video ID ${dvidsId}, an explicit media/source-package pairing.`;
    cases.push(buildCase(`dvids-${dvidsId}`, title, members, sourcesById, { groupingBasis }));
    appliedGroups.push({ key: `dvids-${dvidsId}`, recordIds: members.map((record) => record.id).sort(), reason: groupingBasis });
  }

  for (const record of records) {
    if (assigned.has(record.id)) continue;
    cases.push(buildCase(record.id, record.title, [record], sourcesById));
  }
  cases.sort((a, b) => a.id.localeCompare(b.id));

  const featuredCases = cases.filter((item) => item.featuredRank !== null).sort((a, b) => a.featuredRank - b.featuredRank);
  if (featuredCases.length !== FEATURED_TARGETS.length) {
    const found = new Set(featuredCases.map((item) => item.featuredRank));
    throw new Error(`Featured case selection incomplete; found ranks: ${[...found].sort((a, b) => a - b).join(", ")}`);
  }

  const counts = {
    byRelease: countsBy(records, (record) => record.releaseId),
    byAgency: countsBy(records, (record) => record.agency),
    byFileType: countsBy(records, (record) => record.fileType),
  };
  const latestDate = [...RELEASE_METADATA].sort((a, b) => b.clearedDate.localeCompare(a.clearedDate))[0].clearedDate;
  const releases = RELEASE_METADATA.map((release) => ({
    ...release,
    officialSourcePageUrl: "https://www.war.gov/UFO/",
    fetchedAt: snapshot.fetchedAt,
    isLatestAsOfFetch: release.clearedDate === latestDate,
    recordCount: counts.byRelease[release.id] ?? 0,
    agencyCounts: countsBy(records.filter((record) => record.releaseId === release.id), (record) => record.agency),
    fileTypeCounts: countsBy(records.filter((record) => record.releaseId === release.id), (record) => record.fileType),
  }));

  const ambiguousGroupings = [
    {
      records: ["Western US Event", "DOW-UAP-D077–D083", "FBI-UAP-D014–D023", "FBI-UAP-PR005–PR006"],
      decision: "Grouped",
      reason: "The event name, 2023 date, region, narrative numbering, and update language align across Releases 01 and 03.",
      reviewRequested: "Confirm that Bubble wants the Release 01 summary and Release 03 package presented as one evolving case.",
    },
    {
      records: ["DOW-UAP-PR049", "FBI Photo A001"],
      decision: "Grouped",
      reason: "Both rows share official DVIDS video ID 1006111, but their agencies and identifier styles differ.",
      reviewRequested: "Confirm the cross-agency presentation and preferred public-facing case title.",
    },
    {
      records: ["CIA-UAP-D020", "CIA-UAP-D021"],
      decision: "Grouped",
      reason: "D020 explicitly names D021 as the contemporary analysis of the same incident.",
      reviewRequested: "Confirm whether to present these as one case or as linked historical documents.",
    },
    {
      records: ["Broad Middle East / Arabian Gulf series"],
      decision: "Kept separate",
      reason: "Shared region and repeated description language do not establish a single event.",
      reviewRequested: "No action required unless an official package-level relationship is found later.",
    },
  ];

  const duplicateIds = Object.entries(baseIdCounts).filter(([, count]) => count > 1).map(([rawId, count]) => ({ rawId, count }));
  const provenance = {
    generatedAt: snapshot.fetchedAt,
    parserVersion: PARSER_VERSION,
    sourceSnapshot: {
      path: "data/source/pursue.snapshot.json",
      sha256: sha256(await readFile(SOURCE_PATH)),
    },
    sources: snapshot.sources,
    licenseNotes: [
      "U.S. federal-government originals are labeled public domain where 17 U.S.C. §105 applies; individual asset markings and third-party material must still be checked.",
      "Release 01 Chinese translations and community index structure are attributed to chinleez/uap-disclosure-2026 under CC BY 4.0.",
    ],
    normalizationPolicies: {
      identifiers: "Official identifier prefixes are preserved. Only the one identifier reused in multiple releases receives an @release-NN collision suffix.",
      dates: "Dates are normalized only when the source supplies enough precision; otherwise the source value is retained and reported.",
      locations: "No coordinates were inferred. Regional, withheld, and unknown locations always retain null coordinates.",
      statuses: "Unresolved and resolved require explicit official wording. Historical is a temporal class for pre-2000 non-video material, not a resolution claim.",
      summaries: "Case summaries are source descriptions shortened to 420 characters; no extraterrestrial interpretation is added.",
    },
    manualOverrides: [
      {
        field: "source enrichment",
        reason: "The official CSV rejected non-browser retrieval with HTTP 403. Official browser-rendered rows were used to verify all 334 index entries; descriptions and asset URLs were enriched from the public pursue.report mirror and kept separately attributed.",
      },
      {
        field: "descriptionZh",
        reason: "Release 01 translations were matched by official asset URL, thumbnail URL, DVIDS ID, or unique raw identifier; translation origin is recorded per source snapshot.",
      },
      {
        field: "record id",
        reason: `Collision suffixes were added only for reused identifiers: ${duplicateIds.map((item) => `${item.rawId} (${item.count})`).join(", ")}.`,
      },
      {
        field: "coordinates",
        reason: "All coordinates remain null because the official index supplies place labels but no authoritative coordinates.",
      },
      ...appliedGroups.map((group) => ({ field: `case grouping ${group.key}`, recordIds: group.recordIds, reason: group.reason })),
    ],
    statusDecisions,
  };

  const recordIds = new Set(records.map((record) => record.id));
  const duplicateRecordIds = records.length - recordIds.size;
  const missingCaseReferences = cases.flatMap((item) => item.recordIds.filter((id) => !recordIds.has(id)));
  const invalidAssetUrls = records.flatMap((record) => record.assetUrls.flatMap((asset) => {
    try {
      const url = new URL(asset.url);
      return url.protocol === "https:" || url.protocol === "http:" ? [] : [{ recordId: record.id, url: asset.url }];
    } catch {
      return [{ recordId: record.id, url: asset.url }];
    }
  }));
  const invalidRegionalCoordinates = records.filter((record) =>
    ["regional", "withheld"].includes(record.location.precision) && (record.location.lat !== null || record.location.lng !== null));

  if (duplicateRecordIds || missingCaseReferences.length || invalidAssetUrls.length || invalidRegionalCoordinates.length) {
    throw new Error("Ingest validation failed before output");
  }

  await atomicWrite(path.join(DATA_DIR, "releases.json"), releases);
  await atomicWrite(path.join(DATA_DIR, "records.json"), records);
  await atomicWrite(path.join(DATA_DIR, "cases.json"), cases);
  await atomicWrite(path.join(DATA_DIR, "provenance.json"), provenance);

  const outputHashes = {};
  for (const name of ["releases.json", "records.json", "cases.json", "provenance.json"]) {
    outputHashes[name] = sha256(await readFile(path.join(DATA_DIR, name)));
  }

  const caseReleaseCounts = {};
  for (const release of RELEASE_METADATA) {
    caseReleaseCounts[release.id] = cases.filter((item) => item.recordIds.some((id) => recordsById.get(id)?.releaseId === release.id)).length;
  }

  const report = {
    generatedAt: snapshot.fetchedAt,
    parserVersion: PARSER_VERSION,
    status: "complete-with-access-restrictions",
    totals: { records: records.length, cases: cases.length, featuredCases: featuredCases.length },
    counts: { ...counts, casesByRelease: caseReleaseCounts },
    featuredCases: featuredCases.map((item) => ({ rank: item.featuredRank, caseId: item.id, title: item.title, recordIds: item.recordIds })),
    validation: {
      releaseCount: releases.length,
      duplicateRecordIds,
      missingCaseReferences,
      invalidAssetUrls,
      invalidRegionalCoordinates: invalidRegionalCoordinates.map((record) => record.id),
      consecutiveRunDeterminism: "Run this script twice and compare the listed output hashes; fetchedAt is pinned to the source snapshot.",
      outputHashes,
    },
    parseFailures: [],
    dateNormalizationWarnings: dateWarnings,
    ambiguousGroupings,
    deadLinks: snapshot.assetChecks?.deadLinks ?? [],
    accessRestrictedAssets: snapshot.assetChecks?.accessRestricted ?? [],
    assetChecks: snapshot.assetChecks?.checks ?? [],
    assetCheckCoverage: snapshot.assetChecks?.coverage ?? null,
    manualDecisions: provenance.manualOverrides,
  };
  await atomicWrite(path.join(DATA_DIR, "ingest-report.json"), report);

  console.log(`PURSUE ingest complete: ${records.length} records, ${cases.length} cases, ${featuredCases.length} featured cases.`);
}

main().catch((error) => {
  console.error(error.stack ?? error.message);
  process.exitCode = 1;
});
