"use client";
/* eslint-disable @next/next/no-html-link-for-pages -- Native links avoid a vinext hydration conflict. */
/* eslint-disable @next/next/no-img-element -- Public source previews have explicit unavailable states. */
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";
import { archiveCases, archiveRecords, archiveReleases, archiveCheckedAt, latestRelease, primaryAsset, previewAsset, recordCategory, type ArchiveRecord } from "../../lib/archive";
import "./archive.css";

const PAGE_SIZE = 24;
const mediaOptions = ["all", "video", "image", "pdf", "audio"] as const;
type MediaFilter = (typeof mediaOptions)[number];
type Sort = "featured" | "released" | "newest" | "oldest" | "title";
const byId = new Map(archiveRecords.map(record => [record.id, record]));
const entries = archiveCases.map(caseFile => {
  const records = caseFile.recordIds.map(id => byId.get(id)).filter((r): r is ArchiveRecord => Boolean(r));
  const cover = records.find(r => r.fileType === "video") ?? records.find(r => r.fileType === "image") ?? records.find(r => r.fileType === "audio") ?? records[0];
  return { caseFile, records, cover, releaseIds: [...new Set(records.map(r => r.releaseId))], released: records.map(r => r.releaseDate).sort().at(-1) ?? "", searchText: [caseFile.title, caseFile.summary, caseFile.eventDate, caseFile.location.label, ...caseFile.agencies, ...records.flatMap(r => [r.id, r.title, r.descriptionOriginal])].join(" ").toLowerCase() };
});
type Entry = (typeof entries)[number];
function text(value: string) { return value.replaceAll("\u2014", ","); }
function title(value: string) { return text(value.replace(/^[A-Z]{2,}-UAP-[A-Z0-9]+[a-z]?,\s*/, "")); }
function mediaLabel(kind: string) { return ({ pdf: "Document", image: "Image", video: "Video", audio: "Audio" } as Record<string,string>)[kind] ?? kind; }
function releaseLabel(id: string) { return archiveReleases.find(r => r.id === id)?.label ?? id; }
function displayDate(value: string | null) {
  if (!value) return "Date not provided";
  if (/^\d{4}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return new Intl.DateTimeFormat("en", { month: "short", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}-01T00:00:00Z`));
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" }).format(new Date(`${value}T00:00:00Z`));
}
function eventKey(entry: Entry) {
  const value=entry.caseFile.eventDate;
  if (!value) return null;
  const year=value.match(/\b(18|19|20)\d{2}\b/)?.[0];
  return year ? (/^\d{4}(?:-\d{2})?(?:-\d{2})?/.exec(value)?.[0] ?? year) : null;
}
function FileIcon({ kind }: { kind: string }) {
  return <svg viewBox="0 0 32 32" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">{kind === "video" ? <><rect x="3" y="6" width="26" height="20" rx="2" /><path d="m13 11 8 5-8 5Z" /></> : kind === "audio" ? <path d="M5 13v6m5-11v16m6-20v24m6-19v14m5-10v6" /> : kind === "image" ? <><rect x="3" y="4" width="26" height="24" rx="2" /><circle cx="11" cy="11" r="3" /><path d="m3 24 8-7 6 5 6-10 6 9" /></> : <><path d="M7 3h12l6 6v20H7Z" /><path d="M19 3v7h6M11 16h10M11 21h10" /></>}</svg>;
}
function Preview({ record, active=false }: { record: ArchiveRecord; active?: boolean }) {
  const [failed,setFailed]=useState(false);
  const preview=previewAsset(record),media=primaryAsset(record);
  const motion=active && record.fileType === "video" && media && typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return <span className={`library-preview is-${record.fileType}`}>
    {preview && !failed ? <img src={preview.url} alt="" loading="lazy" decoding="async" onError={()=>setFailed(true)} /> : <span className="library-preview-fallback"><FileIcon kind={record.fileType} /><span>{record.id}</span><small>{record.fileType === "pdf" ? "Original document" : "Open source material"}</small></span>}
    {motion && <video src={media.url} muted autoPlay loop playsInline preload="none" aria-hidden="true" onError={e=>{e.currentTarget.style.display="none";}} />}
    <span className="library-media-label"><FileIcon kind={record.fileType} />{mediaLabel(record.fileType)}</span><span className="library-preview-action">{record.fileType === "video" ? "Inspect footage" : record.fileType === "audio" ? "Listen to recording" : "Open material"}</span>
  </span>;
}
function EvidenceViewer({ record }: { record: ArchiveRecord }) {
  const [failed,setFailed]=useState(false),[readPdf,setReadPdf]=useState(false);
  const asset=primaryAsset(record),preview=previewAsset(record);
  const isMirror=asset ? new URL(asset.url).hostname.endsWith("uap.silv.app") : false;
  return <div className="library-viewer"><div className={`library-media-stage is-${record.fileType}`}>
    {failed ? <div className="library-media-unavailable"><FileIcon kind={record.fileType} /><h3>This preview could not load.</h3><p>The source host may restrict embedded media. You can still read the description and open the official record.</p><button type="button" onClick={()=>setFailed(false)}>Try preview again</button></div>
    : asset?.kind === "video" ? <video src={asset.url} poster={preview?.url} controls playsInline preload="metadata" onError={()=>setFailed(true)} />
    : asset?.kind === "audio" ? <div className="library-audio"><FileIcon kind="audio" /><span>FROM THE ORIGINAL RECORDING</span><h3>{title(record.title)}</h3><audio src={asset.url} controls preload="metadata" onError={()=>setFailed(true)} /><p>Press play to listen. No ambient soundtrack is added.</p></div>
    : asset?.kind === "image" ? <img src={asset.url} alt={title(record.title)} onError={()=>setFailed(true)} />
    : asset?.kind === "pdf" && readPdf ? <iframe src={asset.url} title={`Original PDF: ${title(record.title)}`} />
    : preview ? <img className="library-document-preview" src={preview.url} alt={`Preview of ${title(record.title)}`} onError={()=>setFailed(true)} />
    : <div className="library-media-unavailable"><FileIcon kind={record.fileType} /><h3>{mediaLabel(record.fileType)} record</h3><p>{asset ? "Open the original file to read the full material." : "A direct file link has not been verified. The official record is available below."}</p></div>}
    </div><div className="library-viewer-caption"><span>{recordCategory(record)}</span><span>{isMirror ? "Media hosted by UAP gallery mirror" : "Official release asset"}</span></div>
    <div className="library-source-actions">{asset?.kind === "pdf" && <button type="button" onClick={()=>{setReadPdf(!readPdf);setFailed(false);}}>{readPdf ? "Show preview" : "Read PDF here"}</button>}{asset && <a href={asset.url} target="_blank" rel="noreferrer">{isMirror ? "Open media file" : "Open original file"}</a>}<a href={record.sourcePageUrl} target="_blank" rel="noreferrer">View official record</a></div>
    {readPdf && <p className="library-help">If the document is blocked or blank here, choose Open original file or View official record.</p>}
  </div>;
}

export default function ArchivePage() {
  const [query,setQuery]=useState("");
  const [releaseFilter,setReleaseFilter]=useState("all");
  const [mediaFilter,setMediaFilter]=useState<MediaFilter>("all");
  const [sort,setSort]=useState<Sort>("featured");
  const [visibleCount,setVisibleCount]=useState(PAGE_SIZE);
  const [selectedId,setSelectedId]=useState<string|null>(null);
  const [recordId,setRecordId]=useState<string|null>(null);
  const [hoveredId,setHoveredId]=useState<string|null>(null);
  const [copyState,setCopyState]=useState("Copy case link");
  const [filtersOpen,setFiltersOpen]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null),trigger=useRef<HTMLElement|null>(null);
  const deferredQuery=useDeferredValue(query.trim().toLowerCase());
  const selected=entries.find(entry=>entry.caseFile.id===selectedId)??null;
  const activeRecord=selected?.records.find(r=>r.id===recordId)??selected?.cover??null;
  const activeIndex=selected && activeRecord ? selected.records.indexOf(activeRecord) : 0;
  const filtered=useMemo(()=>entries.filter(entry=>{
    if(deferredQuery && !entry.searchText.includes(deferredQuery))return false;
    if(releaseFilter==="new" && !entry.releaseIds.some(id=>id>="release-05"))return false;
    if(!["all","new"].includes(releaseFilter)&&!entry.releaseIds.includes(releaseFilter))return false;
    return mediaFilter==="all"||entry.caseFile.mediaKinds.includes(mediaFilter);
  }).sort((a,b)=>{
    if(sort==="title")return a.caseFile.title.localeCompare(b.caseFile.title);
    if(sort==="released")return b.released.localeCompare(a.released)||(a.cover.fileType==="video"?-1:1)-(b.cover.fileType==="video"?-1:1)||a.caseFile.title.localeCompare(b.caseFile.title);
    const aDate=eventKey(a),bDate=eventKey(b);
    const dates=(!aDate?1:!bDate?-1:sort==="oldest"?aDate.localeCompare(bDate):bDate.localeCompare(aDate));
    if(sort==="newest"||sort==="oldest")return (!aDate&&!bDate?0:dates)||a.caseFile.title.localeCompare(b.caseFile.title);
    return (a.caseFile.featuredRank??999)-(b.caseFile.featuredRank??999)||b.released.localeCompare(a.released)||a.caseFile.title.localeCompare(b.caseFile.title);
  }),[deferredQuery,releaseFilter,mediaFilter,sort]);
  useEffect(()=>{
    const sync=()=>{
      const params=new URLSearchParams(window.location.search),entry=entries.find(e=>e.caseFile.slug===params.get("case"));
      setSelectedId(entry?.caseFile.id??null);setRecordId(params.get("record"));setQuery(params.get("q")??"");
      const release=params.get("release")??"all";setReleaseFilter(["all","new",...archiveReleases.map(r=>r.id)].includes(release)?release:"all");
      const media=params.get("media") as MediaFilter;setMediaFilter(mediaOptions.includes(media)?media:"all");
      const order=params.get("sort") as Sort;setSort(["featured","released","newest","oldest","title"].includes(order)?order:"featured");
    };sync();window.addEventListener("popstate",sync);return()=>window.removeEventListener("popstate",sync);
  },[]);
  useEffect(()=>{
    const modal=dialog.current;if(!modal)return;
    if(selectedId&&!modal.open)modal.showModal();
    if(!selectedId&&modal.open){modal.close();trigger.current?.focus();}
    const previous=document.body.style.overflow;if(selectedId)document.body.style.overflow="hidden";
    return()=>{document.body.style.overflow=previous;};
  },[selectedId]);
  const updateFilter=(next: {q?:string;release?:string;media?:MediaFilter;sort?:Sort})=>{
    const values={q:query,release:releaseFilter,media:mediaFilter,sort,...next};
    setQuery(values.q);setReleaseFilter(values.release);setMediaFilter(values.media);setSort(values.sort);setVisibleCount(PAGE_SIZE);
    const url=new URL(window.location.href);for(const [key,value] of Object.entries(values)){if(value&&value!=="all"&&value!=="featured")url.searchParams.set(key,value);else url.searchParams.delete(key);}window.history.replaceState({},"",url);
  };
  const openCase=(entry: Entry)=>{
    trigger.current=document.activeElement instanceof HTMLElement?document.activeElement:null;
    setSelectedId(entry.caseFile.id);setRecordId(entry.cover.id);setCopyState("Copy case link");
    const url=new URL(window.location.href);url.searchParams.set("case",entry.caseFile.slug);url.searchParams.delete("record");window.history.pushState({},"",url);
  };
  const closeCase=()=>{setSelectedId(null);setRecordId(null);const url=new URL(window.location.href);url.searchParams.delete("case");url.searchParams.delete("record");window.history.pushState({},"",url);};
  const selectRecord=(record: ArchiveRecord)=>{setRecordId(record.id);setCopyState("Copy case link");const url=new URL(window.location.href);url.searchParams.set("record",record.id);window.history.replaceState({},"",url);};
  const clearFilters=()=>updateFilter({q:"",release:"all",media:"all",sort:"featured"});
  const hasFilters=Boolean(query||releaseFilter!=="all"||mediaFilter!=="all");
  const releaseNewCount=archiveReleases.filter(r=>r.id>="release-05").reduce((n,r)=>n+r.recordCount,0);
  return <main className="archive-page evidence-library">
    <a className="library-skip" href="#case-index">Skip to archive search</a>
    <header className="archive-system-bar"><div className="archive-brand"><span className="brand-mark" aria-hidden="true" /><nav className="mode-switch" aria-label="Choose site mode"><a href="/"><span className="mode-label-long">THE REDACTED SKY</span><span className="mode-label-short">EXPERIENCE</span></a><span className="mode-separator">/</span><a className="is-active" href="/archive" aria-current="page"><span className="mode-label-long">DECLASSIFIED UAP ARCHIVE</span><span className="mode-label-short">ARCHIVE</span></a></nav></div><a className="library-back-field" href="/#field">Enter the Field</a></header>
    <div className="library-container">
      <header className="library-heading"><div><h1>OPEN THE<br /><span>EVIDENCE.</span></h1><p>Footage, photographs, voices and files.<br /> Look closer. Keep the source in view.</p></div><div className="library-update"><span>{archiveRecords.length} records · {archiveCases.length} case files</span><strong>{releaseNewCount} records added since July.</strong><p>Releases 05 + 06 are here.<br /> Index checked {displayDate(archiveCheckedAt.slice(0,10))}.</p><button type="button" onClick={()=>updateFilter({q:"",release:"new",media:"all",sort:"released"})}>Explore the new releases</button></div></header>
      <section className="library-index" id="case-index" aria-label="Search and explore the archive">
        <div className="library-controls">
          <label className="library-search"><span>Search the archive</span><input type="search" placeholder="Try Tremonton, Colorado, AAWSAP…" value={query} onChange={e=>updateFilter({q:e.target.value})}/></label>
          <button className="library-filter-toggle" type="button" aria-expanded={filtersOpen} aria-controls="library-more-filters" onClick={()=>setFiltersOpen(!filtersOpen)}>{filtersOpen ? "Hide filters" : "Filters and sort"}{hasFilters ? " · Active" : ""}</button>
          <div id="library-more-filters" className={`library-more-filters ${filtersOpen ? "is-open" : ""}`}>
            <label><span>Release</span><select value={releaseFilter} onChange={e=>updateFilter({release:e.target.value})}><option value="all">All releases</option><option value="new">New since July</option>{[...archiveReleases].reverse().map(r=><option key={r.id} value={r.id}>{r.label} · {r.recordCount} records</option>)}</select></label>
            <label><span>Material</span><select value={mediaFilter} onChange={e=>updateFilter({media:e.target.value as MediaFilter})}>{mediaOptions.map(kind=><option key={kind} value={kind}>{kind==="all"?"All materials":mediaLabel(kind)}</option>)}</select></label>
            <label><span>Sort by</span><select value={sort} onChange={e=>updateFilter({sort:e.target.value as Sort})}><option value="featured">Featured first</option><option value="released">Recently released</option><option value="newest">Event date: newest</option><option value="oldest">Event date: oldest</option><option value="title">Title A to Z</option></select></label>
          </div>
        </div>
        <div className="library-explore"><div><button type="button" aria-pressed={mediaFilter==="video"} onClick={()=>updateFilter({media:mediaFilter==="video"?"all":"video"})}>Start with footage</button><button type="button" aria-pressed={releaseFilter===latestRelease.id} onClick={()=>updateFilter({release:releaseFilter===latestRelease.id?"all":latestRelease.id,sort:"released"})}>{latestRelease.label}</button><button type="button" disabled={!filtered.length} onClick={()=>openCase(filtered[Math.floor(Math.random()*filtered.length)])}>Surprise me</button></div><p role="status">{filtered.length} {filtered.length===1?"case file":"case files"}{hasFilters&&<button type="button" onClick={clearFilters}>Clear filters</button>}</p></div>
        {filtered.length ? <div className="library-grid">{filtered.slice(0,visibleCount).map(entry=><button type="button" className="library-card" key={entry.caseFile.id} aria-label={`Open ${title(entry.caseFile.title)}, ${entry.records.length} ${entry.records.length===1?"record":"records"}`} onClick={()=>openCase(entry)} onPointerEnter={()=>setHoveredId(entry.caseFile.id)} onPointerLeave={()=>setHoveredId(null)} onFocus={()=>setHoveredId(entry.caseFile.id)} onBlur={()=>setHoveredId(null)}><Preview record={entry.cover} active={hoveredId===entry.caseFile.id}/><span className="library-card-content"><span className="library-card-meta"><span>{displayDate(entry.caseFile.eventDate)}</span><span>{entry.releaseIds.some(id=>id>="release-05")?"NEW RELEASE":entry.caseFile.featuredRank?"CURATED":"SOURCE FILE"}</span></span><h2>{title(entry.caseFile.title)}</h2><span className="library-card-location">{entry.caseFile.location.label??"Location not provided"}</span><span className="library-card-description">{text(entry.caseFile.summary)}</span><span className="library-card-footer"><span>{entry.records.length} {entry.records.length===1?"record":"records"}</span><span>{entry.caseFile.mediaKinds.map(mediaLabel).join(" + ")}</span></span></span></button>)}</div> : <div className="library-empty"><h2>No records match this search.</h2><p>Try a broader place name, a year, or a different material type.</p><button type="button" onClick={clearFilters}>Clear filters</button></div>}
        {visibleCount<filtered.length&&<button className="library-load" type="button" onClick={()=>setVisibleCount(n=>n+PAGE_SIZE)}>Load {Math.min(PAGE_SIZE,filtered.length-visibleCount)} more case files <span>{visibleCount} of {filtered.length} shown</span></button>}
      </section>
      <footer className="library-footer"><p>Public release is not resolution. Case files are editorial groupings of source records, not a count of confirmed sightings.</p><p>PRIMARY SOURCE / U.S. GOVERNMENT PURSUE<br />Descriptions and media enrichment: pursue.report (01–04), uap.silv.app (05–06). Chinese translations: chinleez, CC BY 4.0.</p><a href="https://www.war.gov/UFO/" target="_blank" rel="noreferrer">Official archive</a><a href="https://github.com/moonbow166/the-redacted-sky" target="_blank" rel="noreferrer">Source and provenance</a></footer>
    </div>
    <dialog ref={dialog} className="library-dialog" aria-labelledby="library-detail-title" onCancel={e=>{e.preventDefault();closeCase();}}>{selected&&activeRecord&&<>
      <header className="library-detail-bar"><span>{selected.records.length} {selected.records.length===1?"source record":"connected records"}</span><div><button type="button" onClick={async()=>{try{await navigator.clipboard.writeText(window.location.href);setCopyState("Link copied");}catch{setCopyState("Copy the address-bar URL");}}}>{copyState}</button><button type="button" className="library-close" onClick={closeCase} autoFocus>Close <kbd>Esc</kbd></button></div></header>
      <div className="library-detail-content"><div className="library-evidence-column"><div className="library-record-nav"><button type="button" disabled={activeIndex===0} onClick={()=>selectRecord(selected.records[activeIndex-1])}>Previous material</button><span aria-live="polite">{activeIndex+1} / {selected.records.length}</span><button type="button" disabled={activeIndex===selected.records.length-1} onClick={()=>selectRecord(selected.records[activeIndex+1])}>Next material</button></div><EvidenceViewer key={activeRecord.id} record={activeRecord}/>{selected.records.length>1&&<div className="library-record-strip" aria-label="Materials in this case">{selected.records.map((record,index)=><button type="button" key={record.id} className={record.id===activeRecord.id?"is-selected":""} aria-pressed={record.id===activeRecord.id} onClick={()=>selectRecord(record)}><FileIcon kind={record.fileType}/><span><strong>{String(index+1).padStart(2,"0")} · {mediaLabel(record.fileType)}</strong><small>{record.id}</small></span></button>)}</div>}</div>
      <article className="library-detail-copy"><p className="library-file-id">{activeRecord.id} · {releaseLabel(activeRecord.releaseId)}</p><h2 id="library-detail-title">{title(activeRecord.title)}</h2><dl className="library-facts"><div><dt>Source date</dt><dd>{displayDate(activeRecord.incidentDate)}</dd></div><div><dt>Location</dt><dd>{activeRecord.location.label??"Not provided"}</dd></div><div><dt>Agency</dt><dd>{activeRecord.agency}</dd></div><div><dt>Released</dt><dd>{displayDate(activeRecord.releaseDate)}</dd></div></dl>{activeRecord.metadataNote&&<p className="library-source-warning">Source discrepancy: {activeRecord.metadataNote}</p>}<h3>What the source says</h3><div className="library-description">{activeRecord.descriptionOriginal?text(activeRecord.descriptionOriginal).split(/\n\s*\n/).map((paragraph,index)=><p key={index}>{paragraph}</p>):<p>The source does not provide a description for this material.</p>}</div><details className="library-provenance"><summary>Source, context and grouping</summary><p>{selected.caseFile.groupingBasis}</p><p>{activeRecord.sourceAttribution?.startsWith("silv")?"Description transcribed by the UAP gallery mirror; index identity checked against PURSUE on October 1, 2026.":activeRecord.sourceAttribution==="war-pursue-20261001"?"Description captured from the official PURSUE detail panel on October 1, 2026.":"Description enriched from the pursue.report mirror; original Release 01–04 index verification dated July 18, 2026."}</p><p>Source status: {activeRecord.officialStatus==="not-stated"?"No explicit disposition stated":activeRecord.officialStatus}. Historical is a date category, not an official resolution. Public release does not establish an extraterrestrial origin.</p>{activeRecord.officialAssessment&&<p>{activeRecord.officialAssessment}</p>}</details></article></div>
    </>}</dialog>
  </main>;
}
