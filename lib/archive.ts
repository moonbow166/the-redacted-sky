import casesSource from "../data/cases.json";
import recordsSource from "../data/records.json";
import releasesSource from "../data/releases.json";

export type Asset = {
  kind: string;
  url: string;
  mimeType: string | null;
  width: number | null;
  height: number | null;
  durationSeconds: number | null;
};

export type ArchiveRecord = {
  id: string;
  releaseId: string;
  title: string;
  agency: string;
  fileType: "audio" | "image" | "pdf" | "video";
  releaseDate: string;
  incidentDate: string | null;
  incidentDatePrecision: string;
  location: {
    label: string | null;
    lat: number | null;
    lng: number | null;
    precision: string;
  };
  officialStatus: string;
  officialAssessment: string | null;
  descriptionOriginal: string;
  descriptionZh: string | null;
  sourcePageUrl: string;
  assetUrls: Asset[];
};

export type ArchiveCase = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  eventDate: string | null;
  eventDatePrecision: string;
  location: ArchiveRecord["location"];
  agencies: string[];
  recordIds: string[];
  mediaKinds: string[];
  officialStatus: string;
  officialAssessment: string | null;
  evidenceCompleteness: string;
  featuredRank: number | null;
  groupingBasis: string;
};

export type Release = {
  id: string;
  label: string;
  clearedDate: string;
  recordCount: number;
  isLatestAsOfFetch: boolean;
};

export const archiveRecords = recordsSource as ArchiveRecord[];
export const archiveCases = casesSource as ArchiveCase[];
export const archiveReleases = releasesSource as Release[];

const caseByRecordId = new Map<string, ArchiveCase>();
archiveCases.forEach((caseFile) => {
  caseFile.recordIds.forEach((recordId) => caseByRecordId.set(recordId, caseFile));
});

const recordById = new Map(archiveRecords.map((record) => [record.id, record]));

export const archiveTotals = archiveRecords.reduce(
  (totals, record) => {
    totals[record.fileType] += 1;
    return totals;
  },
  { audio: 0, image: 0, pdf: 0, video: 0 },
);

export const recordKinds = archiveRecords.map((record) => record.fileType);

export const connectedVideoIndexes = ["DOW-UAP-PR104", "DOW-UAP-PR105", "DOW-UAP-PR113"]
  .map((id) => archiveRecords.findIndex((record) => record.id === id))
  .filter((index) => index >= 0);

const editorialTitles: Record<string, { signal: string; title: string }> = {
  "case-dow-uap-pr104": { signal: "SIGNAL 01 / 18 SECONDS", title: "THE SIX-POINT SIGNAL" },
  "case-dow-uap-pr105": { signal: "SIGNAL 02 / 05 MINUTES", title: "THE CENTERED OBJECT" },
  "case-dow-uap-pr113": { signal: "SIGNAL 03 / 1996 TAPE", title: "THE LOST SENSOR RECORD" },
};

export const featuredSignals = archiveCases
  .filter((caseFile) => Object.hasOwn(editorialTitles, caseFile.id))
  .sort((a, b) => connectedVideoIndexes.indexOf(archiveRecords.findIndex((record) => a.recordIds.includes(record.id))) - connectedVideoIndexes.indexOf(archiveRecords.findIndex((record) => b.recordIds.includes(record.id))))
  .map((caseFile) => {
    const record = caseFile.recordIds
      .map((id) => recordById.get(id))
      .find((item) => item?.fileType === "video") ?? recordById.get(caseFile.recordIds[0]);
    const video = record?.assetUrls.find((asset) => asset.kind === "video")?.url ?? "";
    return {
      ...caseFile,
      ...editorialTitles[caseFile.id],
      video,
      recordIndex: record ? archiveRecords.indexOf(record) : -1,
      releaseId: record?.releaseId ?? "",
    };
  });

export function getArchiveEntry(index: number) {
  const record = archiveRecords[index];
  if (!record) return null;
  const caseFile = caseByRecordId.get(record.id) ?? null;
  const caseRecords = caseFile
    ? caseFile.recordIds.map((id) => recordById.get(id)).filter((item): item is ArchiveRecord => Boolean(item))
    : [record];
  const visualRecord = caseRecords.find((item) => item.fileType === "video" || item.fileType === "image") ?? record;
  const visualAsset = visualRecord.assetUrls.find((asset) => asset.kind === "video" || asset.kind === "image") ?? null;
  return { record, caseFile, caseRecords, visualRecord, visualAsset };
}
