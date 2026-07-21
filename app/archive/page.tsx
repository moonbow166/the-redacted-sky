"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native links avoid a vinext hydration conflict. */

import { useDeferredValue, useEffect, useMemo, useState } from "react";
import { archiveCases, archiveRecords, archiveReleases, type ArchiveCase, type ArchiveRecord } from "../../lib/archive";

const PAGE_SIZE = 24;
const mediaOptions = ["all", "video", "image", "pdf", "audio"] as const;
const sortOptions = [
  { value: "featured", label: "FEATURED FIRST" },
  { value: "newest", label: "NEWEST FIRST" },
  { value: "oldest", label: "OLDEST FIRST" },
  { value: "title", label: "TITLE A TO Z" },
] as const;

type IndexedCase = {
  caseFile: ArchiveCase;
  records: ArchiveRecord[];
  releaseIds: string[];
  searchText: string;
};

function displayDate(value: string | null) {
  if (!value) return "DATE WITHHELD";
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value.toUpperCase()
    : new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(date).toUpperCase();
}

function cleanDisplayText(value: string) {
  return value.replaceAll("\u2014", ",");
}

function compareDates(a: ArchiveCase, b: ArchiveCase) {
  return (a.eventDate ?? "0000").localeCompare(b.eventDate ?? "0000");
}

function mediaLabel(kind: string) {
  return kind === "pdf" ? "DOCUMENT" : kind.toUpperCase();
}

export default function ArchivePage() {
  const [query, setQuery] = useState("");
  const [releaseFilter, setReleaseFilter] = useState("all");
  const [mediaFilter, setMediaFilter] = useState<(typeof mediaOptions)[number]>("all");
  const [sort, setSort] = useState<(typeof sortOptions)[number]["value"]>("featured");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [copyState, setCopyState] = useState("COPY CASE LINK");
  const deferredQuery = useDeferredValue(query.trim().toLowerCase());

  const indexedCases = useMemo<IndexedCase[]>(() => {
    const recordById = new Map(archiveRecords.map((record) => [record.id, record]));
    return archiveCases.map((caseFile) => {
      const records = caseFile.recordIds
        .map((id) => recordById.get(id))
        .filter((record): record is ArchiveRecord => Boolean(record));
      const releaseIds = Array.from(new Set(records.map((record) => record.releaseId)));
      const searchText = [
        caseFile.title,
        caseFile.summary,
        caseFile.eventDate ?? "",
        caseFile.location.label ?? "",
        ...caseFile.agencies,
        ...caseFile.mediaKinds,
        ...records.flatMap((record) => [record.id, record.title, record.descriptionOriginal]),
      ].join(" ").toLowerCase();
      return { caseFile, records, releaseIds, searchText };
    });
  }, []);

  const filteredCases = useMemo(() => {
    const filtered = indexedCases.filter(({ caseFile, releaseIds, searchText }) => {
      if (deferredQuery && !searchText.includes(deferredQuery)) return false;
      if (releaseFilter !== "all" && !releaseIds.includes(releaseFilter)) return false;
      if (mediaFilter !== "all" && !caseFile.mediaKinds.includes(mediaFilter)) return false;
      return true;
    });

    return filtered.sort((a, b) => {
      if (sort === "title") return a.caseFile.title.localeCompare(b.caseFile.title);
      if (sort === "newest") return compareDates(b.caseFile, a.caseFile);
      if (sort === "oldest") return compareDates(a.caseFile, b.caseFile);
      const aRank = a.caseFile.featuredRank ?? Number.POSITIVE_INFINITY;
      const bRank = b.caseFile.featuredRank ?? Number.POSITIVE_INFINITY;
      return aRank - bRank || compareDates(b.caseFile, a.caseFile);
    });
  }, [deferredQuery, indexedCases, mediaFilter, releaseFilter, sort]);

  const selectedEntry = useMemo(
    () => indexedCases.find(({ caseFile }) => caseFile.id === selectedId) ?? null,
    [indexedCases, selectedId],
  );

  const selectedVisual = (() => {
    if (!selectedEntry) return null;
    for (const record of selectedEntry.records) {
      const asset = record.assetUrls.find((item) => item.kind === "video" || item.kind === "image");
      if (asset) return { record, asset };
    }
    return null;
  })();

  useEffect(() => {
    const readLocation = () => {
      const slug = new URLSearchParams(window.location.search).get("case");
      const match = slug ? archiveCases.find((caseFile) => caseFile.slug === slug) : null;
      setSelectedId(match?.id ?? null);
    };
    readLocation();
    window.addEventListener("popstate", readLocation);
    return () => window.removeEventListener("popstate", readLocation);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedEntry ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedEntry]);

  useEffect(() => {
    if (!selectedEntry) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setSelectedId(null);
      const url = new URL(window.location.href);
      url.searchParams.delete("case");
      window.history.pushState({}, "", url);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selectedEntry]);

  const openCase = (caseFile: ArchiveCase) => {
    setSelectedId(caseFile.id);
    setCopyState("COPY CASE LINK");
    const url = new URL(window.location.href);
    url.searchParams.set("case", caseFile.slug);
    window.history.pushState({}, "", url);
  };

  const closeCase = () => {
    setSelectedId(null);
    const url = new URL(window.location.href);
    url.searchParams.delete("case");
    window.history.pushState({}, "", url);
  };

  const copyCaseLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopyState("LINK COPIED");
      window.setTimeout(() => setCopyState("COPY CASE LINK"), 1600);
    } catch {
      setCopyState("COPY URL FROM ADDRESS BAR");
    }
  };

  const visibleCases = filteredCases.slice(0, visibleCount);

  return (
    <main className="archive-page">
      <header className="archive-system-bar">
        <a className="archive-brand" href="/">
          <span className="brand-mark" aria-hidden="true" />
          <span>THE REDACTED SKY</span>
        </a>
        <div className="archive-system-status">
          <span className="status-light" />
          <span>ARCHIVE ONLINE</span>
          <span className="archive-hide-mobile">334 RECORDS / 279 CASES</span>
        </div>
      </header>

      <section className="archive-hero">
        <div className="archive-hero-copy">
          <p className="archive-kicker">PURSUE ARCHIVE / PUBLIC RELEASE INDEX</p>
          <h1>THE FIELD<br />BECOMES<br /><span>SEARCHABLE.</span></h1>
          <p className="archive-intro">
            The 3D Field holds every official record row as a signal. This index groups those 334 rows into 279 cases so the evidence can be searched, filtered, opened, and shared.
          </p>
          <div className="archive-hero-actions">
            <a href="/#field">RETURN TO THE FIELD</a>
            <a href="#case-index">BROWSE THE CASES</a>
          </div>
        </div>
        <div className="archive-hero-metrics" aria-label="Archive totals">
          <div><strong>334</strong><span>OFFICIAL RECORD ROWS</span></div>
          <div><strong>279</strong><span>GROUPED CASES</span></div>
          <div><strong>04</strong><span>PUBLIC RELEASES</span></div>
          <div><strong>15</strong><span>FEATURED CASES</span></div>
        </div>
      </section>

      <section className="archive-index" id="case-index">
        <div className="archive-index-heading">
          <div>
            <p className="archive-kicker">CASE INDEX / SOURCE PRECISION PRESERVED</p>
            <h2>279 CASE FILES</h2>
          </div>
          <p><strong>{filteredCases.length}</strong> MATCHING CASES</p>
        </div>

        <div className="archive-controls">
          <label className="archive-search">
            <span>SEARCH THE ARCHIVE</span>
            <input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(PAGE_SIZE); }} placeholder="TITLE, LOCATION, YEAR, AGENCY, KEYWORD" type="search" />
          </label>
          <label>
            <span>RELEASE</span>
            <select value={releaseFilter} onChange={(event) => { setReleaseFilter(event.target.value); setVisibleCount(PAGE_SIZE); }}>
              <option value="all">ALL RELEASES</option>
              {archiveReleases.map((release) => <option key={release.id} value={release.id}>{release.label.toUpperCase()} / {release.recordCount} ROWS</option>)}
            </select>
          </label>
          <label>
            <span>MEDIA</span>
            <select value={mediaFilter} onChange={(event) => { setMediaFilter(event.target.value as (typeof mediaOptions)[number]); setVisibleCount(PAGE_SIZE); }}>
              {mediaOptions.map((kind) => <option key={kind} value={kind}>{kind === "all" ? "ALL MEDIA" : mediaLabel(kind)}</option>)}
            </select>
          </label>
          <label>
            <span>SORT</span>
            <select value={sort} onChange={(event) => { setSort(event.target.value as (typeof sortOptions)[number]["value"]); setVisibleCount(PAGE_SIZE); }}>
              {sortOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
            </select>
          </label>
        </div>

        {visibleCases.length > 0 ? (
          <div className="archive-case-grid">
            {visibleCases.map(({ caseFile, records, releaseIds }, index) => (
              <button className={`archive-case-card ${caseFile.featuredRank ? "is-featured" : ""}`} type="button" key={caseFile.id} onClick={() => openCase(caseFile)}>
                <span className="archive-case-number">CASE {String(index + 1).padStart(3, "0")}</span>
                {caseFile.featuredRank && <span className="archive-featured-mark">FEATURED {String(caseFile.featuredRank).padStart(2, "0")}</span>}
                <div className="archive-card-meta">
                  <span>{displayDate(caseFile.eventDate)}</span>
                  <span>{caseFile.location.label ?? "LOCATION WITHHELD"}</span>
                </div>
                <h3>{caseFile.title}</h3>
                <p>{cleanDisplayText(caseFile.summary)}</p>
                <div className="archive-card-footer">
                  <span>{records.length} RECORD{records.length === 1 ? "" : "S"}</span>
                  <span>{caseFile.mediaKinds.map(mediaLabel).join(" / ")}</span>
                  <span>{releaseIds.length > 1 ? `${releaseIds.length} RELEASES` : releaseIds[0]?.toUpperCase()}</span>
                </div>
                <span className="archive-open-label">OPEN CASE FILE</span>
              </button>
            ))}
          </div>
        ) : (
          <div className="archive-empty">
            <span>NO SIGNAL MATCHES THE CURRENT FILTERS.</span>
            <button type="button" onClick={() => { setQuery(""); setReleaseFilter("all"); setMediaFilter("all"); }}>CLEAR FILTERS</button>
          </div>
        )}

        {visibleCount < filteredCases.length && (
          <button className="archive-load-more" type="button" onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}>
            LOAD {Math.min(PAGE_SIZE, filteredCases.length - visibleCount)} MORE CASES
            <span>{visibleCount} / {filteredCases.length} SHOWN</span>
          </button>
        )}
      </section>

      <footer className="archive-footer">
        <span>PRIMARY SOURCE / U.S. GOVERNMENT PURSUE</span>
        <span>EDITORIAL GROUPING / SOURCE PRECISION PRESERVED</span>
        <a href="https://github.com/moonbow166/the-redacted-sky" target="_blank" rel="noreferrer">SOURCE CODE</a>
      </footer>

      <section className={`archive-case-detail ${selectedEntry ? "is-open" : ""}`} aria-hidden={!selectedEntry}>
        {selectedEntry && (
          <div className="archive-detail-shell" role="dialog" aria-modal="true" aria-labelledby="archive-detail-title">
            <div className="archive-detail-topbar">
              <span>CASE FILE / {selectedEntry.caseFile.id.toUpperCase()}</span>
              <div>
                <button type="button" onClick={copyCaseLink}>{copyState}</button>
                <button type="button" onClick={closeCase}>CLOSE [ESC]</button>
              </div>
            </div>
            <div className="archive-detail-body">
              <div className="archive-detail-evidence">
                {selectedVisual?.asset.kind === "video" ? (
                  <video src={selectedVisual.asset.url} controls playsInline preload="metadata" />
                ) : selectedVisual?.asset.kind === "image" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={selectedVisual.asset.url} alt={selectedEntry.caseFile.title} />
                ) : (
                  <div className="archive-document-placeholder"><span>DOCUMENT CASE</span><strong>{selectedEntry.records.length}</strong><small>OFFICIAL RECORD{selectedEntry.records.length === 1 ? "" : "S"}</small></div>
                )}
                <p>MEDIA PREVIEW / OFFICIAL RELEASE ASSET</p>
              </div>
              <article className="archive-detail-copy">
                <p className="archive-kicker">{selectedEntry.caseFile.officialStatus.toUpperCase()} / {displayDate(selectedEntry.caseFile.eventDate)}</p>
                <h2 id="archive-detail-title">{selectedEntry.caseFile.title}</h2>
                <div className="archive-detail-facts">
                  <div><span>LOCATION</span><strong>{selectedEntry.caseFile.location.label ?? "WITHHELD / UNKNOWN"}</strong></div>
                  <div><span>AGENCY</span><strong>{selectedEntry.caseFile.agencies.join(" / ")}</strong></div>
                  <div><span>MEDIA</span><strong>{selectedEntry.caseFile.mediaKinds.map(mediaLabel).join(" / ")}</strong></div>
                  <div><span>COMPLETENESS</span><strong>{selectedEntry.caseFile.evidenceCompleteness.toUpperCase()}</strong></div>
                </div>
                <p className="archive-detail-summary">{cleanDisplayText(selectedEntry.caseFile.summary)}</p>
                <div className="archive-record-list">
                  <div className="archive-record-heading"><span>OFFICIAL RECORDS IN THIS CASE</span><strong>{selectedEntry.records.length}</strong></div>
                  {selectedEntry.records.map((record) => (
                    <a href={record.sourcePageUrl} target="_blank" rel="noreferrer" key={record.id}>
                      <span>{record.id}</span>
                      <strong>{record.title}</strong>
                      <small>{releaseLabel(record.releaseId)} / {mediaLabel(record.fileType)} / OPEN SOURCE</small>
                    </a>
                  ))}
                </div>
              </article>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function releaseLabel(id: string) {
  return archiveReleases.find((release) => release.id === id)?.label.toUpperCase() ?? id.toUpperCase();
}
