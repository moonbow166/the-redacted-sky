import { archiveCases, archiveRecords, previewAsset, primaryAsset } from "./archive";
import { casePath, readableText } from "./site";

const selections = [
  { id: "DOW-UAP-PR159", title: "Lights over Utah", year: "1952", note: "Bright points, a handheld camera, then an unexpected cut at 0:55.", limit: "The film alone cannot establish size, distance, or speed.", prompt: "What would help you understand these lights?", x: 24, y: 39 },
  { id: "DOW-UAP-D103", title: "A balloon comparison", year: "1952", note: "Investigators compared pillow balloons with the Utah film.", limit: "Comparison material, not a photograph of the reported objects.", prompt: "A resemblance is a question, not an identification.", x: 48, y: 60 },
  { id: "DOW-UAP-D102", title: "The investigation changes", year: "1952", note: "Birds, balloons and a mirage were considered. Later assessments favored seabirds.", limit: "This is a summary of an evolving investigation, not a new finding.", prompt: "What changed the investigators’ minds?", x: 30, y: 77 },
  { id: "DOW-UAP-D098", title: "Another analysis", year: "1953", note: "Naval analysts found unusual features in the Utah and Montana films and asked for more work.", limit: "Their assessment was tentative and covered two different films.", prompt: "What evidence could change an assessment?", x: 12, y: 64 },
  { id: "DOW-UAP-PR057a", title: "One clip, two titles", year: "2023", note: "A sphere-like contrast feature moves through clouds. This upload has a second title.", limit: "AARO identifies PR057a and PR057b as duplicate uploads, not two sightings.", prompt: "Would a different title change what you think you saw?", x: 65, y: 27 },
  { id: "DOW-UAP-PR057b", title: "The same clip again", year: "2023", note: "The other upload names the East China Sea. The official description says likely Yellow Sea.", limit: "The titles differ, but the two releases use the same video.", prompt: "Two files do not always mean two events.", x: 80, y: 48 },
  { id: "NASA-UAP-D030", title: "Beside Earth’s edge", year: "1996", note: "An object appears near Earth’s limb in this STS-80 image.", limit: "Its appearance alone does not identify it.", prompt: "What changes when you see the next image?", x: 42, y: 22 },
  { id: "NASA-UAP-D031", title: "A second orbital view", year: "1996", note: "The STS-80 description notes apparent rotation or tumbling.", limit: "Motion consistent with a floating object does not establish what it is.", prompt: "A second view can add context without settling the question.", x: 61, y: 80 },
  { id: "NASA-UAP-D003A", title: "A voice from Gemini 7", year: "1965", note: "Listen to a short exchange including the word “bogey”. What context would you want?", limit: "A word in a brief excerpt does not identify an object.", prompt: "What would the surrounding conversation add?", x: 87, y: 76 },
  { id: "DOW-UAP-PR104", title: "A shape in infrared", year: "2025", note: "A short infrared clip shows a changing, high-contrast feature over the Yellow Sea.", limit: "The image’s visible shape need not be the object’s physical shape.", prompt: "What might the camera be adding?", x: 14, y: 18 },
];

export type SkyClue = ReturnType<typeof makeSkyClues>[number];
export type SourceConnection = { a: string; b: string; label: string; url: string };

export function makeSkyClues() {
  return selections.map(item => {
    const record = archiveRecords.find(entry => entry.id === item.id)!;
    const caseFile = archiveCases.find(entry => entry.recordIds.includes(item.id))!;
    return { ...item, kind: record.fileType, agency: record.agency, sourceUrl: record.sourcePageUrl, sourceTitle: record.title,
      summary: readableText(record.descriptionOriginal), caseUrl: `${casePath(caseFile.slug)}#${record.id}`,
      mediaUrl: primaryAsset(record)?.url ?? null,
      previewUrl: record.id === "DOW-UAP-PR159" ? "/source-images/tremonton-official-preview.jpg" : previewAsset(record)?.url ?? null };
  });
}

export function makeSourceConnections(): SourceConnection[] {
  const records = selections.map(item => archiveRecords.find(record => record.id === item.id)!);
  const edges: SourceConnection[] = [];
  for (let i = 0; i < records.length; i++) for (let j = i + 1; j < records.length; j++) {
    const a = records[i]; const b = records[j];
    const listing = a.relatedOfficialTitles?.includes(b.title) ? a : b.relatedOfficialTitles?.includes(a.title) ? b : null;
    if (listing) edges.push({ a: a.id, b: b.id, label: "Listed together by the source", url: listing.sourcePageUrl });
  }
  // The official PR057 release descriptions explicitly identify the duplicated uploads.
  edges.push({ a: "DOW-UAP-PR057a", b: "DOW-UAP-PR057b", label: "Source identifies duplicate uploads", url: records.find(item => item.id === "DOW-UAP-PR057a")!.sourcePageUrl });
  return edges;
}
