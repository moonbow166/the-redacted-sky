"use client";

/* eslint-disable @next/next/no-html-link-for-pages -- Native links avoid a vinext hydration conflict. */

import { useEffect, useMemo, useState } from "react";
import SkyScene from "../components/SkyScene";
import SiteNavigation from "../components/SiteNavigation";
import ArchiveIcon from "../components/ArchiveIcon";
import ArchiveOverview from "../components/ArchiveOverview";
import {
  archiveCases,
  archiveRecords,
  archiveReleases,
  connectedVideoIndexes,
  featuredSignals,
  getArchiveEntry,
  recordKinds,
} from "../lib/archive";

const verdicts = ["ORDINARY", "SENSOR AMBIGUITY", "INSUFFICIENT", "ANOMALOUS"];
const chapterLabels = ["Encounter", "Field", "Signals", "Disclosure", "Explore"];
const verdictLabels: Record<string,string> = { ORDINARY: "Ordinary", "SENSOR AMBIGUITY": "Sensor ambiguity", INSUFFICIENT: "Not enough to tell", ANOMALOUS: "Anomalous" };

function displayDate(value: string | null) {
  if (!value) return "Date not provided";
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(date);
}

function releaseLabel(id: string) {
  return archiveReleases.find((release) => release.id === id)?.label ?? id;
}

export default function Home() {
  const [scrollStage, setScrollStage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [verdict, setVerdict] = useState<string | null>(null);
  const [caseRevealed, setCaseRevealed] = useState(false);

  const selectedEntry = useMemo(
    () => (selectedIndex === null ? null : getArchiveEntry(selectedIndex)),
    [selectedIndex],
  );

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (selectedIndex !== null) {
          setSelectedIndex(null);
          setVerdict(null);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [scrollStage, selectedIndex]);

  useEffect(() => {
    const onScroll = () => {
      const unit = Math.max(window.innerHeight, 1);
      const nextStage = Math.max(0, Math.min(4, Math.floor((window.scrollY + unit * 0.28) / unit)));
      setScrollStage((current) => (current === nextStage ? current : nextStage));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = selectedIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [selectedIndex]);

  useEffect(() => {
    if (selectedIndex === null) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(() => setCaseRevealed(true), reduceMotion ? 80 : 980);
    return () => window.clearTimeout(timer);
  }, [selectedIndex]);

  const openRecord = (index: number) => {
    setSelectedIndex(index);
    setCaseRevealed(false);
    const stored = window.localStorage.getItem(`redacted-sky-verdict-${archiveRecords[index]?.id ?? index}`);
    setVerdict(stored && verdicts.includes(stored) ? stored : null);
  };

  const closeCase = () => {
    setSelectedIndex(null);
    setVerdict(null);
    setCaseRevealed(false);
  };

  const hoveredKind = hoveredIndex === null ? "" : archiveRecords[hoveredIndex]?.fileType.toUpperCase() ?? "RECORD";
  const selectedCase = selectedEntry?.caseFile;
  const selectedRecord = selectedEntry?.record;
  const selectedVisual = selectedEntry?.visualAsset;
  const selectedFeatureIndex = selectedIndex === null ? -1 : featuredSignals.findIndex((item) => item.recordIndex === selectedIndex);
  const selectedFeature = selectedFeatureIndex >= 0 ? featuredSignals[selectedFeatureIndex] : null;

  const recordVerdict = (value: string) => {
    setVerdict(value);
    if (selectedRecord) window.localStorage.setItem(`redacted-sky-verdict-${selectedRecord.id}`, value);
  };

  const openNextSignal = () => {
    if (selectedFeatureIndex < 0) return;
    const next = featuredSignals[(selectedFeatureIndex + 1) % featuredSignals.length];
    openRecord(next.recordIndex);
  };

  return (
    <main className={`experience stage-${scrollStage}`}>
      <SkyScene
        active={scrollStage === 1}
        stage={scrollStage}
        recordKinds={recordKinds}
        featuredIndexes={connectedVideoIndexes}
        selected={selectedIndex}
        onHover={setHoveredIndex}
        onSelect={openRecord}
      />

      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />
      <div className="event-horizon" aria-hidden="true" />

      <header className="system-bar">
        <SiteNavigation current="experience" />
      </header>

      <section className="intro-copy" aria-hidden={scrollStage !== 0} inert={scrollStage !== 0}>
        <h1>
          <span>The</span>
          <span className="redacted-word">Redacted</span>
          <span>Sky</span>
        </h1>
        <p className="intro-statement">
          Real UAP records. Unfinished questions.
          <br />Start with a little curiosity.
        </p>
        <div className="entry-choices"><button className="entry-choice" type="button" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}><ArchiveIcon kind="field"/><span><strong>Enter the field</strong><small>Move through the signals</small></span></button><a className="entry-choice" href="/archive"><ArchiveIcon kind="compass"/><span><strong>Find a story</strong><small>Let curiosity choose the way</small></span></a></div>
        <div className="entry-note">Scroll to explore the field. No expertise needed.</div>
      </section>

      <div className="craft-callout" aria-hidden={scrollStage !== 0}>
        <strong>The Black Manta</strong>
        <small>Artist reconstruction, not evidence</small>
      </div>

      <nav className="story-progress" aria-label="Experience chapters">
        {chapterLabels.map((label, index) => (
          <button key={label} type="button" aria-label={label} aria-current={scrollStage === index ? "step" : undefined} className={scrollStage === index ? "is-current" : ""} onClick={() => window.scrollTo({ top: window.innerHeight * index, behavior: "smooth" })}>
            <i />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="story-rail">
        <div className="story-spacer" aria-hidden="true" />

        <section className="story-chapter field-chapter" id="field">
          <div className="field-chapter-copy">
            <h2>A sky full<br /><span>of questions.</span></h2>
            <p>Move over a signal. Select it to see what was recorded.</p>
          </div>
          <div className="field-morphology-legend" aria-hidden="true">
            <span>Orb</span><span>Tic-tac</span><span>Manta</span><span>Triangle</span><span>Cylinder</span><span>Boomerang</span>
          </div>
          <div className="field-depth-cue" aria-hidden="true"><i /><i /><i /></div>
        </section>

        <section className="story-chapter signals-chapter" id="signals">
          <div className="signal-heading">
            <h2>Look closer.<br /><span>What do you see?</span></h2>
            <p>Three places to begin. Open a video, read the context, and make up your own mind.</p>
          </div>
          <div className="cinema-signals">
            {featuredSignals.map((item, index) => (
              <button className={`cinema-signal signal-${index + 1}`} type="button" key={item.id} onClick={() => openRecord(item.recordIndex)}>
                <video src={item.video} muted loop autoPlay playsInline preload="metadata" crossOrigin="anonymous" />
                <span className="sensor-reticle" aria-hidden="true" />
                <span className="signal-code">{item.signal}</span>
                <span className="signal-place">{item.location.label} / {displayDate(item.eventDate)}</span>
                <strong>{item.title}</strong>
                <span className="signal-action"><ArchiveIcon kind="video"/>Watch and explore</span>
              </button>
            ))}
          </div>
        </section>

        <section className="story-chapter declassification-chapter" id="disclosure">
          <div className="chapter-copy chapter-copy-left">
            <h2>The files are open.<br /><span>The questions remain.</span></h2>
            <p>UAP means unidentified anomalous phenomena. It is a description of uncertainty, not an answer about what something is.</p>
          </div>
          <div className="declassified-sheet" aria-label="Animated declassified document">
            <div className="sheet-topline"><span>Public release</span><span>PURSUE / 2026</span></div>
            <div className="release-stamp">Declassified</div>
            <div className="sheet-heading">Observation of anomalous aerial phenomena</div>
            <div className="sheet-line long" /><div className="sheet-line medium" /><div className="sheet-line long" /><div className="sheet-line short" />
            <div className="redaction-strip strip-a">Source identity</div>
            <div className="redaction-strip strip-b">Sensor platform</div>
            <div className="redaction-strip strip-c">Exact location</div>
            <div className="sheet-coordinates">██°██′██″ N &nbsp; / &nbsp; ███°██′██″ W</div>
            <div className="sheet-footer">Public release is not a conclusion</div>
          </div>
        </section>

        <section className="story-chapter release-chapter" id="releases">
          <div className="media-overview-heading"><h2>More than one<br /><span>way into the unknown.</span></h2><p>Follow a voice. Inspect a frame. See where a document leads.</p></div>
          <ArchiveOverview />
          <p className="release-disclaimer">{archiveRecords.length} source records, grouped into {archiveCases.length} case files across {archiveReleases.length} releases. A record is a starting point, not a verdict.</p>
          <div className="overview-actions">
            <a className="overview-open-archive" href="/archive"><ArchiveIcon kind="compass"/>Find your next story</a>
            <button className="overview-return" type="button" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>Return to the field</button>
          </div>
          <div className="archive-source-line"><a href="/guide">New to UAP?</a><a href="/sources">Sources &amp; credits</a><a href="/cases">Case directory</a></div>
        </section>
      </div>

      <aside className="field-index field-guide" aria-hidden={scrollStage !== 1 || selectedIndex !== null} inert={scrollStage !== 1 || selectedIndex !== null}>
        <ArchiveIcon kind="video"/><h3>Follow a signal.</h3><p>The shapes are reconstructions. Select a signal to open its source material.</p><a href="/archive">Prefer a guided story?</a>
      </aside>

      <div className={`target-readout ${hoveredKind === "VIDEO" ? "is-video" : ""} ${scrollStage === 1 && hoveredIndex !== null && selectedIndex === null ? "is-visible" : ""}`} aria-live="polite">
        <span className="target-bracket">[</span>
        <div><small>Signal found</small><strong>Record {String((hoveredIndex ?? 0) + 1).padStart(3, "0")}</strong><small>{hoveredKind === "VIDEO" ? "Video ready. Select to watch." : "Select to open the source record."}</small></div>
        <span className="target-bracket">]</span>
      </div>

      <div className={`scan-instruction ${scrollStage === 1 && selectedIndex === null ? "is-visible" : ""}`}><span className="mouse-icon" aria-hidden="true" />Move to explore. Tap or click a signal.</div>
      <div className={`coordinates ${scrollStage === 1 ? "is-visible" : ""}`} aria-hidden="true"><span>Spatial field, not a map</span><span>Reconstructed forms</span></div>

      <section className={`case-file ${selectedEntry ? "is-open" : ""} ${caseRevealed ? "is-revealed" : ""} ${selectedFeature ? "is-featured" : ""}`} aria-hidden={!selectedEntry}>
        {selectedEntry && selectedRecord && (
          <>
            <div className="case-capture-sequence" aria-hidden="true">
              <div className="capture-orbit orbit-one" /><div className="capture-orbit orbit-two" /><div className="capture-orbit orbit-three" />
              <div className="capture-crosshair"><i /><i /></div>
              <div className="capture-readout">
                <span>TARGET LOCK / {selectedFeature ? `0${selectedFeatureIndex + 1}` : "UNINDEXED"}</span>
                <strong>{selectedFeature?.signal ?? selectedRecord.fileType.toUpperCase()}</strong>
                <small>Opening the source record</small>
              </div>
            </div>
            <div className="case-reveal-flash" aria-hidden="true" />
            <div className="case-topline">
              <span>{selectedFeature ? `EVIDENCE 0${selectedFeatureIndex + 1} / 03` : selectedCase?.id.toUpperCase() ?? selectedRecord.id}</span>
              <span className="classification">{selectedRecord.officialStatus.toUpperCase()} / {releaseLabel(selectedRecord.releaseId)}</span>
              <button type="button" onClick={closeCase} aria-label="Close evidence file">Close [Esc]</button>
            </div>
            <div className="case-layout">
              <div className="evidence-visual">
                <div className="video-frame">
                  {selectedVisual?.kind === "video" ? (
                    <video src={selectedVisual.url} autoPlay muted loop playsInline controls crossOrigin="anonymous" />
                  ) : selectedVisual?.kind === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selectedVisual.url} alt={selectedCase?.title ?? selectedRecord.title} />
                  ) : (
                    <div className="signal-placeholder"><div className="pending-document" aria-hidden="true"><i /><i /><i /><b /><b /></div><span>{selectedRecord.fileType.toUpperCase()} RECORD / OPEN OFFICIAL SOURCE</span></div>
                  )}
                  <span className="frame-corner corner-a" /><span className="frame-corner corner-b" /><span className="frame-corner corner-c" /><span className="frame-corner corner-d" />
                  <div className="video-overlay"><span>{selectedEntry.visualRecord.fileType.toUpperCase()} / OFFICIAL RELEASE</span><span>REC ●</span><span>{selectedCase?.recordIds.length ?? 1} RECORD{(selectedCase?.recordIds.length ?? 1) > 1 ? "S" : ""}</span></div>
                  {selectedFeature && <div className="signal-chapter-tag"><span>{selectedFeature.signal}</span><strong>{selectedFeature.location.label} / {displayDate(selectedFeature.eventDate)}</strong></div>}
                </div>
                <p className="source-note">Source record. The description is not an analytical judgment.</p>
              </div>
              <article className="case-copy">
                <div className="declassification-wipe" aria-hidden="true"><i /><i /><i /><i /></div>
                <div className="case-eyebrow">{selectedFeature ? `Selected signal ${selectedFeatureIndex + 1}` : "Source material"}</div>
                <h2>{selectedFeature?.title ?? selectedCase?.title ?? selectedRecord.title}</h2>
                {selectedFeature && <p className="official-case-title">Official file: {selectedCase?.title ?? selectedRecord.title}</p>}
                <div className="case-meta">
                  <div><span>Location</span><strong>{selectedCase?.location.label ?? selectedRecord.location.label ?? "Not provided"}</strong></div>
                  <div><span>Source date</span><strong>{displayDate(selectedCase?.eventDate ?? selectedRecord.incidentDate)}</strong></div>
                  <div><span>Reporting body</span><strong>{selectedCase?.agencies.join(" / ") ?? selectedRecord.agency}</strong></div>
                  <div><span>Official status</span><strong>{selectedCase?.officialAssessment ?? selectedRecord.officialAssessment ?? selectedRecord.officialStatus}</strong></div>
                </div>
                <p className="case-description">
                  {(selectedCase?.summary ?? selectedRecord.descriptionOriginal).replaceAll("\u2014", ",")}
                </p>
                {(selectedCase?.summary.endsWith("…") || selectedCase?.summary.endsWith("...")) && <p className="excerpt-warning">Description excerpt. Continue at the source.</p>}
                <a className="official-source-link" href={selectedRecord.sourcePageUrl} target="_blank" rel="noreferrer">Open official source</a>
                {selectedCase && <a className="official-source-link full-case-link" href={`/archive?case=${encodeURIComponent(selectedCase.slug)}&record=${encodeURIComponent(selectedRecord.id)}`}>Explore {selectedCase.recordIds.length===1?"this record":`all ${selectedCase.recordIds.length} materials`}</a>}
                <div className="assessment">
                  <div className="assessment-title"><span>What do you think you saw?</span><small>Your response stays on this device</small></div>
                  <div className="verdicts">
                    {verdicts.map((item) => <button key={item} type="button" className={verdict === item ? "is-selected" : ""} onClick={() => recordVerdict(item)}><span className="verdict-dot" />{verdictLabels[item]}</button>)}
                  </div>
                  {verdict && (
                    <div className="verdict-response">
                      <span>Your assessment: <strong>{verdictLabels[verdict]}</strong></span>
                      {selectedFeature && <button type="button" onClick={openNextSignal}>{selectedFeatureIndex === featuredSignals.length - 1 ? "Return to the first signal" : "Explore the next signal"}</button>}
                    </div>
                  )}
                </div>
              </article>
            </div>
          </>
        )}
      </section>

      <footer className="credit-line"><a href="/sources">Sources &amp; credits</a></footer>
      <p className="sr-only">An immersive three-dimensional field containing {archiveRecords.length} official UAP record rows grouped into {archiveCases.length} case files.</p>
    </main>
  );
}
