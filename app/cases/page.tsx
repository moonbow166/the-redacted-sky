/* eslint-disable @next/next/no-html-link-for-pages -- The directory is readable without JavaScript. */
import ReadingLayout from "../../components/ReadingLayout";
import ArchiveIcon from "../../components/ArchiveIcon";
import StructuredData from "../../components/StructuredData";
import { archiveCases } from "../../lib/archive";
import { absoluteUrl, casePath, pageMetadata, recordTitle } from "../../lib/site";

export const metadata = pageMetadata("UAP case directory", "Find every source-linked case page in The Redacted Sky, with released material, dates, agencies and source descriptions.", "/cases");

export default function CaseDirectory() {
  const entries = [...archiveCases].sort((a,b)=>a.title.localeCompare(b.title));
  return <ReadingLayout><StructuredData value={{ "@context": "https://schema.org", "@type": "CollectionPage", name: "UAP case directory", url: absoluteUrl("/cases"), mainEntity: { "@type": "ItemList", numberOfItems: entries.length, itemListElement: entries.map((entry,index)=>({ "@type": "ListItem", position: index+1, name: recordTitle(entry.title), url: absoluteUrl(casePath(entry.slug)) })) } }} /><h1>Every case, a place to begin.</h1><p className="reading-intro">{archiveCases.length} source-linked case pages, listed by title. Read a case here, or open its material in the interactive archive.</p><div className="reading-actions"><a className="reading-primary" href="/archive">Find a curated story</a><a href="/archive?view=all">Search and filter the archive</a></div><ul className="reading-directory">{entries.map(entry=><li key={entry.id}><a href={casePath(entry.slug)}><ArchiveIcon kind={entry.mediaKinds[0]} /><span><strong>{recordTitle(entry.title)}</strong><small>{entry.eventDate??"Date not provided"} · {entry.recordIds.length} {entry.recordIds.length===1?"record":"records"}</small></span></a></li>)}</ul></ReadingLayout>;
}
