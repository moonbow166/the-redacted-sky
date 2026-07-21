"use client";

import { useEffect, useMemo, useState } from "react";
import SkyScene from "../components/SkyScene";
import {
  archiveCases,
  archiveRecords,
  archiveReleases,
  archiveTotals,
  connectedVideoIndexes,
  featuredSignals,
  getArchiveEntry,
  recordKinds,
} from "../lib/archive";

const verdicts = ["ORDINARY", "SENSOR AMBIGUITY", "INSUFFICIENT", "ANOMALOUS"];
const chapterLabels = ["ENCOUNTER", "FIELD", "SIGNALS", "DISCLOSURE", "OVERVIEW"];

function displayDate(value: string | null) {
  if (!value) return "DATE WITHHELD";
  if (/^\d{4}$/.test(value)) return value;
  const date = new Date(`${value}T00:00:00Z`);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en", { month: "short", day: "2-digit", year: "numeric", timeZone: "UTC" }).format(date).toUpperCase();
}

function releaseLabel(id: string) {
  return archiveReleases.find((release) => release.id === id)?.label.toUpperCase() ?? id.toUpperCase();
}

export default function Home() {
  const [scrollStage, setScrollStage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
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
      if (event.key === "Enter" && scrollStage === 0) {
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
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

  useEffect(() => {
    if (!soundOn || scrollStage === 0) return;
    const AudioContextClass = window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.028, context.currentTime + 1.8);
    master.connect(context.destination);

    const low = context.createOscillator();
    const lowGain = context.createGain();
    low.type = "sine";
    low.frequency.value = scrollStage === 1 ? 37 : 48;
    lowGain.gain.value = 0.18;
    low.connect(lowGain).connect(master);

    const carrier = context.createOscillator();
    const carrierGain = context.createGain();
    carrier.type = "triangle";
    carrier.frequency.value = 164;
    carrierGain.gain.value = 0.02;
    carrier.connect(carrierGain).connect(master);
    low.start();
    carrier.start();

    return () => {
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.12);
      window.setTimeout(() => context.close(), 150);
    };
  }, [scrollStage, soundOn]);

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
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <span>THE REDACTED SKY</span>
          <span className="dim">/ DECLASSIFIED UAP ARCHIVE</span>
        </div>
        <div className="system-status">
          <span className="status-light" />
          <span>{scrollStage === 1 ? "FIELD ACTIVE" : scrollStage === 0 ? "UNKNOWN CONTACT" : scrollStage < 4 ? "EVIDENCE STREAM" : "PURSUE ARCHIVE"}</span>
          {scrollStage >= 4 && <span className="dim hide-mobile">334 RECORDS / 279 CASES / 04 RELEASES</span>}
          <button className="sound-toggle" type="button" aria-label={soundOn ? "Mute ambient signal" : "Enable ambient signal"} onClick={() => setSoundOn((value) => !value)}>
            SOUND {soundOn ? "ON" : "OFF"}
          </button>
        </div>
      </header>

      <section className="intro-copy" aria-hidden={scrollStage !== 0}>
        <div className="eyebrow">VISUAL RECONSTRUCTION / ORIGIN UNCONFIRMED</div>
        <h1>
          <span>THE</span>
          <span className="redacted-word">REDACTED</span>
          <span>SKY</span>
        </h1>
        <p className="intro-statement">
          Something entered the frame.
          <br />
          The files arrived later.
        </p>
        <button className="descent-trigger" type="button" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>
          <span className="descent-ring" aria-hidden="true" />
          <span>APPROACH<br />THE UNKNOWN</span>
          <i aria-hidden="true" />
        </button>
        <div className="entry-note">SCROLL TO DESCEND · HEADPHONES RECOMMENDED</div>
      </section>

      <div className="craft-callout" aria-hidden={scrollStage !== 0}>
        <span>CONTACT / FORM UNRESOLVED</span>
        <strong>THE BLACK MANTA</strong>
        <small>ARTIST RECONSTRUCTION · NOT EVIDENCE</small>
      </div>

      <nav className="story-progress" aria-label="Experience chapters">
        {chapterLabels.map((label, index) => (
          <button key={label} type="button" className={scrollStage === index ? "is-current" : ""} onClick={() => window.scrollTo({ top: window.innerHeight * index, behavior: "smooth" })}>
            <i />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="story-rail">
        <div className="story-spacer" aria-hidden="true" />

        <section className="story-chapter field-chapter" id="field">
          <div className="field-chapter-copy">
            <div className="chapter-index">01 / THE FIELD</div>
            <p>DO NOT NAME IT YET.</p>
            <h2>MOVE BEFORE<br /><span>YOU DECIDE.</span></h2>
          </div>
          <div className="field-morphology-legend" aria-hidden="true">
            <span>ORB</span><span>TIC-TAC</span><span>MANTA</span><span>TRIANGLE</span><span>CYLINDER</span><span>BOOMERANG</span>
          </div>
          <div className="field-depth-cue" aria-hidden="true"><i /><i /><i /></div>
        </section>

        <section className="story-chapter signals-chapter" id="signals">
          <div className="signal-heading">
            <div className="chapter-index">02 / THREE SIGNALS</div>
            <h2>THEN THE<br /><span>SENSORS SPOKE.</span></h2>
            <p>Three newly released records. No reconstruction inside the frames. No verdict added.</p>
          </div>
          <div className="cinema-signals">
            {featuredSignals.map((item, index) => (
              <button className={`cinema-signal signal-${index + 1}`} type="button" key={item.id} onClick={() => openRecord(item.recordIndex)}>
                <video src={item.video} muted loop autoPlay playsInline preload="metadata" crossOrigin="anonymous" />
                <span className="sensor-reticle" aria-hidden="true" />
                <span className="signal-code">{item.signal}</span>
                <span className="signal-place">{item.location.label} / {displayDate(item.eventDate)}</span>
                <strong>{item.title}</strong>
                <span className="signal-action">INSPECT ORIGINAL RECORD ↗</span>
              </button>
            ))}
          </div>
        </section>

        <section className="story-chapter declassification-chapter" id="disclosure">
          <div className="chapter-copy chapter-copy-left">
            <div className="chapter-index">03 / DISCLOSURE</div>
            <p className="chapter-overline">CLEARED FOR PUBLIC RELEASE</p>
            <h2>THE FILES<br />ARE OPEN.<br /><span>THE ANSWER IS NOT.</span></h2>
            <p>Release is not resolution. Every missing coordinate, clipped frame and black bar changes what remains possible.</p>
          </div>
          <div className="declassified-sheet" aria-label="Animated declassified document">
            <div className="sheet-topline"><span>UNCLASSIFIED // RELEASE AUTHORIZED</span><span>PURSUE / 2026</span></div>
            <div className="release-stamp">DECLASSIFIED</div>
            <div className="sheet-heading">OBSERVATION OF ANOMALOUS AERIAL PHENOMENA</div>
            <div className="sheet-line long" /><div className="sheet-line medium" /><div className="sheet-line long" /><div className="sheet-line short" />
            <div className="redaction-strip strip-a">SOURCE IDENTITY</div>
            <div className="redaction-strip strip-b">SENSOR PLATFORM</div>
            <div className="redaction-strip strip-c">EXACT LOCATION</div>
            <div className="sheet-coordinates">██°██′██″ N &nbsp; / &nbsp; ███°██′██″ W</div>
            <div className="sheet-footer">PUBLIC RELEASE DOES NOT CONSTITUTE ANALYTICAL JUDGMENT</div>
          </div>
        </section>

        <section className="story-chapter release-chapter" id="releases">
          <div className="chapter-index">04 / NOW, THE SCALE</div>
          <div className="release-headline">
            <span>OFFICIAL ROWS RELEASED</span><strong>{archiveRecords.length}</strong><span>GROUPED INTO {archiveCases.length} CASES</span>
          </div>
          <div className="release-stats">
            <div><strong>{String(archiveTotals.pdf).padStart(3, "0")}</strong><span>PDF DOCUMENTS</span></div>
            <div><strong>{String(archiveTotals.video).padStart(3, "0")}</strong><span>VIDEOS</span></div>
            <div><strong>{String(archiveTotals.image).padStart(3, "0")}</strong><span>IMAGES</span></div>
            <div><strong>{String(archiveTotals.audio).padStart(3, "0")}</strong><span>AUDIO</span></div>
          </div>
          <div className="release-tape">
            {archiveReleases.map((release, index) => (
              <div className={release.isLatestAsOfFetch ? "is-latest" : ""} key={release.id}>
                <span>0{index + 1}</span><strong>{displayDate(release.clearedDate)}</strong><small>{release.recordCount} RECORDS{release.isLatestAsOfFetch ? " / LATEST" : " / VERIFIED"}</small>
              </div>
            ))}
          </div>
          <p className="release-disclaimer">334 OFFICIAL RECORD ROWS · 279 EDITORIALLY GROUPED CASES · LOCATION PRECISION PRESERVED</p>
          <div className="overview-actions">
            <a className="overview-open-archive" href="/archive">OPEN THE 279-CASE ARCHIVE ↗</a>
            <button className="overview-return" type="button" onClick={() => window.scrollTo({ top: window.innerHeight, behavior: "smooth" })}>RETURN TO THE FIELD ↑</button>
          </div>
          <div className="archive-source-line">PRIMARY SOURCE / U.S. GOVERNMENT PURSUE · CHINESE INDEX / CHINLEEZ CC BY 4.0</div>
        </section>
      </div>

      <aside className="field-index morphology-readout" aria-hidden={scrollStage !== 1 || selectedIndex !== null}>
        <div className="index-kicker">FORMS IN VIEW</div>
        <div className="index-number">06</div>
        <div className="index-label">RECONSTRUCTED MORPHOLOGIES</div>
        <div className="index-rule" />
        <dl>
          <div><dt>ORB</dt><dd>01</dd></div>
          <div><dt>TIC-TAC</dt><dd>02</dd></div>
          <div><dt>BLACK MANTA</dt><dd>03</dd></div>
          <div><dt>TRIANGLE</dt><dd>04</dd></div>
          <div><dt>CYLINDER</dt><dd>05</dd></div>
          <div><dt>BOOMERANG</dt><dd>06</dd></div>
        </dl>
      </aside>

      <div className={`target-readout ${hoveredKind === "VIDEO" ? "is-video" : ""} ${scrollStage === 1 && hoveredIndex !== null && selectedIndex === null ? "is-visible" : ""}`} aria-live="polite">
        <span className="target-bracket">[</span>
        <div><small>SIGNAL ACQUIRED</small><strong>RECORD {String((hoveredIndex ?? 0) + 1).padStart(3, "0")}</strong><small>{hoveredKind === "VIDEO" ? "VIDEO READY · CLICK TO OPEN EVIDENCE" : `${hoveredKind} · CLICK TO OPEN RECORD`}</small></div>
        <span className="target-bracket">]</span>
      </div>

      <div className={`scan-instruction ${scrollStage === 1 && selectedIndex === null ? "is-visible" : ""}`}><span className="mouse-icon" aria-hidden="true" />MOVE TO SCAN · CLICK A SIGNAL</div>
      <div className={`coordinates ${scrollStage === 1 ? "is-visible" : ""}`} aria-hidden="true"><span>LIVE FIELD / SCALE INDETERMINATE</span><span>DO NOT ASSUME FORM</span></div>

      <section className={`case-file ${selectedEntry ? "is-open" : ""} ${caseRevealed ? "is-revealed" : ""} ${selectedFeature ? "is-featured" : ""}`} aria-hidden={!selectedEntry}>
        {selectedEntry && selectedRecord && (
          <>
            <div className="case-capture-sequence" aria-hidden="true">
              <div className="capture-orbit orbit-one" /><div className="capture-orbit orbit-two" /><div className="capture-orbit orbit-three" />
              <div className="capture-crosshair"><i /><i /></div>
              <div className="capture-readout">
                <span>TARGET LOCK / {selectedFeature ? `0${selectedFeatureIndex + 1}` : "UNINDEXED"}</span>
                <strong>{selectedFeature?.signal ?? selectedRecord.fileType.toUpperCase()}</strong>
                <small>ISOLATING SOURCE · VERIFYING CHAIN OF CUSTODY</small>
              </div>
            </div>
            <div className="case-reveal-flash" aria-hidden="true" />
            <div className="case-topline">
              <span>{selectedFeature ? `EVIDENCE 0${selectedFeatureIndex + 1} / 03` : selectedCase?.id.toUpperCase() ?? selectedRecord.id}</span>
              <span className="classification">{selectedRecord.officialStatus.toUpperCase()} / {releaseLabel(selectedRecord.releaseId)}</span>
              <button type="button" onClick={closeCase} aria-label="Close evidence file">CLOSE [ESC]</button>
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
                <p className="source-note">OFFICIAL SOURCE RECORD · DESCRIPTION IS NOT AN ANALYTICAL JUDGMENT</p>
              </div>
              <article className="case-copy">
                <div className="declassification-wipe" aria-hidden="true"><i /><i /><i /><i /></div>
                <div className="case-eyebrow">{selectedFeature ? `DECLASSIFIED SIGNAL 0${selectedFeatureIndex + 1}` : "OPEN EVIDENCE FILE"}</div>
                <h2>{selectedFeature?.title ?? selectedCase?.title ?? selectedRecord.title}</h2>
                {selectedFeature && <p className="official-case-title">OFFICIAL FILE / {selectedCase?.title ?? selectedRecord.title}</p>}
                <div className="case-meta">
                  <div><span>LOCATION</span><strong>{selectedCase?.location.label ?? selectedRecord.location.label ?? "WITHHELD / UNKNOWN"}</strong></div>
                  <div><span>INCIDENT</span><strong>{displayDate(selectedCase?.eventDate ?? selectedRecord.incidentDate)}</strong></div>
                  <div><span>REPORTING BODY</span><strong>{selectedCase?.agencies.join(" / ") ?? selectedRecord.agency}</strong></div>
                  <div><span>OFFICIAL STATUS</span><strong>{selectedCase?.officialAssessment ?? selectedRecord.officialAssessment ?? selectedRecord.officialStatus}</strong></div>
                </div>
                <p className="case-description">
                  {(selectedCase?.summary ?? selectedRecord.descriptionOriginal).replaceAll("\u2014", ",")}
                </p>
                {(selectedCase?.summary.endsWith("…") || selectedCase?.summary.endsWith("...")) && <p className="excerpt-warning">OFFICIAL DESCRIPTION EXCERPT · CONTINUE AT SOURCE</p>}
                <a className="official-source-link" href={selectedRecord.sourcePageUrl} target="_blank" rel="noreferrer">OPEN OFFICIAL SOURCE ↗</a>
                <div className="assessment">
                  <div className="assessment-title"><span>WHAT DO YOU THINK YOU SAW?</span><small>YOUR RESPONSE REMAINS ON THIS DEVICE</small></div>
                  <div className="verdicts">
                    {verdicts.map((item) => <button key={item} type="button" className={verdict === item ? "is-selected" : ""} onClick={() => recordVerdict(item)}><span className="verdict-dot" />{item}</button>)}
                  </div>
                  {verdict && (
                    <div className="verdict-response">
                      <span>ASSESSMENT LOGGED: <strong>{verdict}</strong></span>
                      {selectedFeature && <button type="button" onClick={openNextSignal}>{selectedFeatureIndex === featuredSignals.length - 1 ? "RETURN TO SIGNAL 01" : `CONTINUE TO SIGNAL 0${selectedFeatureIndex + 2}`} <b>→</b></button>}
                    </div>
                  )}
                </div>
              </article>
            </div>
          </>
        )}
      </section>

      <footer className="credit-line">BUILD WEEK CUT · PURSUE RELEASES 01–04 · CHINLEEZ / CC BY 4.0</footer>
      <p className="sr-only">An immersive three-dimensional field containing 334 official UAP record rows grouped into 279 cases.</p>
    </main>
  );
}
