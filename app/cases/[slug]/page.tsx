/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element -- Source-linked, server-readable case pages. */
import { notFound } from "next/navigation";
import ReadingLayout from "../../../components/ReadingLayout";
import StructuredData from "../../../components/StructuredData";
import { archiveCases, archiveRecords, primaryAsset, previewAsset, recordCategory, sourceDescriptionNote } from "../../../lib/archive";
import { curiosityPicks } from "../../../lib/explore";
import { absoluteUrl, casePath, metadataDescription, pageMetadata, readableText, recordTitle } from "../../../lib/site";

type Props = { params: Promise<{ slug: string }> };
const recordById = new Map(archiveRecords.map(record => [record.id, record]));

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const entry = archiveCases.find(item => item.slug === slug);
  if (!entry) return { title: "Case not found | The Redacted Sky", robots: { index: false, follow: true } };
  return pageMetadata(recordTitle(entry.title), metadataDescription(entry.summary), casePath(entry.slug));
}

export default async function CasePage({ params }: Props) {
  const { slug } = await params;
  const entry = archiveCases.find(item => item.slug === slug);
  if (!entry) notFound();
  const records = entry.recordIds.map(id => recordById.get(id)!);
  const pick = curiosityPicks.find(item => item.caseId === entry.id);
  const cover = records.find(record => record.id === pick?.recordId) ?? records.find(record => previewAsset(record)) ?? records[0];
  const preview = previewAsset(cover);
  const name = recordTitle(entry.title), url = absoluteUrl(casePath(entry.slug));
  const viewerUrl = `/archive?case=${encodeURIComponent(entry.slug)}`;
  const schema = {
    "@context": "https://schema.org", "@type": "CollectionPage", "@id": url, url, name,
    description: readableText(entry.summary), inLanguage: "en", isPartOf: { "@id": absoluteUrl("/#website") },
    citation: records.map(record => record.sourcePageUrl),
    mainEntity: { "@type": "ItemList", numberOfItems: records.length, itemListElement: records.map((record, index) => ({ "@type": "ListItem", position: index + 1, item: { "@type": "CreativeWork", name: recordTitle(record.title), identifier: record.id, url: record.sourcePageUrl, datePublished: record.releaseDate, description: readableText(record.descriptionOriginal), ...(primaryAsset(record)?.mimeType ? { encodingFormat: primaryAsset(record)!.mimeType } : {}) } })) },
    breadcrumb: { "@type": "BreadcrumbList", itemListElement: [{ "@type": "ListItem", position: 1, name: "Case directory", item: absoluteUrl("/cases") }, { "@type": "ListItem", position: 2, name, item: url }] },
  };
  return <ReadingLayout>
    <StructuredData value={schema} />
    <nav className="reading-breadcrumb" aria-label="Breadcrumb"><a href="/archive">Explore archive</a><span>/</span><a href="/cases">Case directory</a></nav>
    <div className="reading-case-intro"><div><h1>{name}</h1><p className="reading-intro">{readableText(entry.summary)}</p><p className="reading-meta">A source-based summary, not an independent finding. This case groups {records.length} {records.length === 1 ? "released record" : "released records"}.</p><div className="reading-actions"><a className="reading-primary" href={viewerUrl}>Open the media viewer</a><a href="#source-material">Read the source material</a></div></div>{preview&&<figure><img className="reading-preview" src={preview.url} alt={`Source preview: ${recordTitle(cover.title)}`} /><figcaption className="reading-caption">Preview from {cover.id}. {recordCategory(cover)}.</figcaption></figure>}</div>
    <dl className="reading-facts"><div><dt>Reported date</dt><dd>{entry.eventDate ?? "Not provided"}</dd></div><div><dt>Reported location</dt><dd>{entry.location.label ?? "Not provided"}</dd></div><div><dt>Agencies in the records</dt><dd>{entry.agencies.join(", ")}</dd></div><div><dt>Available material</dt><dd>{entry.mediaKinds.map(kind => ({ video: "Video", image: "Images", audio: "Audio", pdf: "Documents" })[kind] ?? kind).join(", ")}</dd></div></dl>
    {entry.id === "case-tremonton-film-1952" && <p className="reading-actions"><a className="reading-primary" href="/explore/tremonton-1952">Follow the guided film exploration</a></p>}
    {pick&&<section className="reading-editorial"><h2>Why look closer?</h2><p>{pick.why}</p><p className="reading-question">{pick.question}</p><p className="reading-meta">Our editorial invitation, not an official assessment.</p></section>}
    <section id="source-material"><h2>Source material</h2><p>The descriptions below retain the source wording, with display punctuation normalized. Open the official record to check its current context and markings.</p>{records.map((record,index)=>{
      const asset = primaryAsset(record), mirror = asset ? new URL(asset.url).hostname.endsWith("uap.silv.app") : false;
      const sourceNote = sourceDescriptionNote(record);
      return <article className="reading-source" id={record.id} key={record.id}><h3>{recordTitle(record.title)}</h3><p className="reading-meta"><code>{record.id}</code><br />{recordCategory(record)} · {record.agency} · Released {record.releaseDate}</p>{record.metadataNote&&<p className="reading-warning">Source discrepancy: {record.metadataNote}</p>}<details open={index===0}><summary>What the source says</summary><div className="reading-description">{record.descriptionOriginal ? readableText(record.descriptionOriginal).split(/\n\s*\n/).map((paragraph,i)=><p key={i}>{paragraph}</p>) : <p>The source does not provide a description for this material.</p>}</div></details><p className="reading-meta">{sourceNote}</p>{record.officialAssessment&&<p><strong>Official assessment:</strong> {readableText(record.officialAssessment)}</p>}<div className="reading-actions"><a href={record.sourcePageUrl} target="_blank" rel="noreferrer">View official record</a>{asset&&<a href={asset.url} target="_blank" rel="noreferrer">{record.previewOnly ? "Open official preview" : mirror ? "Open mirror-hosted media" : "Open original file"}</a>}<a href={`${viewerUrl}&record=${encodeURIComponent(record.id)}`}>View this material in the archive</a></div>{!asset&&<p className="reading-meta">A direct file link has not been verified. Use the official record link above.</p>}{mirror&&<p className="reading-meta">This media is hosted by the UAP gallery mirror; its bytes have not been verified against the official original.</p>}</article>;
    })}</section>
    <section><h2>How this case is grouped</h2><p>{readableText(entry.groupingBasis)}</p><p>Public release is not a finding of extraterrestrial origin. A case file is an editorial grouping, not a count of confirmed sightings. A historical label describes a time period, not a resolved explanation.</p><p>Read our <a href="/sources">sources, verification dates and limitations</a>, or <a href="/archive">follow another story</a>.</p></section>
  </ReadingLayout>;
}
