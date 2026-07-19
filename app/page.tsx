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
const chapterLabels = ["ENCOUNTER", "DESCENT", "SIGNALS", "DISCLOSURE", "RELEASES", "ARCHIVE"];

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
  const [entered, setEntered] = useState(false);
  const [scrollStage, setScrollStage] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [verdict, setVerdict] = useState<string | null>(null);

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
        } else if (entered) {
          setEntered(false);
          window.setTimeout(() => window.scrollTo({ top: window.innerHeight * 5, behavior: "smooth" }), 60);
        }
      }
      if (event.key === "Enter" && scrollStage === 0 && !entered) {
        window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered, scrollStage, selectedIndex]);

  useEffect(() => {
    const onScroll = () => {
      const unit = Math.max(window.innerHeight, 1);
      const nextStage = Math.max(0, Math.min(5, Math.floor((window.scrollY + unit * 0.28) / unit)));
      setScrollStage((current) => (current === nextStage ? current : nextStage));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = entered || selectedIndex !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [entered, selectedIndex]);

  useEffect(() => {
    if (!soundOn || (!entered && scrollStage === 0)) return;
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
  }, [entered, scrollStage, soundOn]);

  const openRecord = (index: number) => {
    setSelectedIndex(index);
    setVerdict(null);
  };

  const closeCase = () => {
    setSelectedIndex(null);
    setVerdict(null);
  };

  const enterArchive = () => {
    setEntered(true);
    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const leaveArchive = () => {
    closeCase();
    setEntered(false);
    window.setTimeout(() => window.scrollTo({ top: window.innerHeight * 5, behavior: "smooth" }), 60);
  };

  const hoveredKind = hoveredIndex === null ? "" : archiveRecords[hoveredIndex]?.fileType.toUpperCase() ?? "RECORD";
  const selectedCase = selectedEntry?.caseFile;
  const selectedRecord = selectedEntry?.record;
  const selectedVisual = selectedEntry?.visualAsset;

  return (
    <main className={`experience stage-${scrollStage} ${entered ? "is-archive" : "is-story"}`}>
      <SkyScene
        active={entered}
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
          <span className="dim">/ 天空被涂黑的部分</span>
        </div>
        <div className="system-status">
          <span className="status-light" />
          <span>{entered ? "FIELD ACTIVE" : scrollStage < 2 ? "UNKNOWN CONTACT" : "PURSUE ARCHIVE"}</span>
          <span className="dim hide-mobile">334 RECORDS / 279 CASES / 04 RELEASES</span>
          {entered && (
            <button className="archive-exit" type="button" onClick={leaveArchive}>EXIT FIELD [ESC]</button>
          )}
          <button className="sound-toggle" type="button" aria-label={soundOn ? "Mute ambient signal" : "Enable ambient signal"} onClick={() => setSoundOn((value) => !value)}>
            SOUND {soundOn ? "ON" : "OFF"}
          </button>
        </div>
      </header>

      <section className="intro-copy" aria-hidden={entered || scrollStage !== 0}>
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

      <div className="craft-callout" aria-hidden={entered || scrollStage !== 0}>
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

      <div className="story-rail" aria-hidden={entered}>
        <div className="story-spacer" aria-hidden="true" />

        <section className="story-chapter deep-space-chapter" id="descent">
          <div className="depth-copy">
            <div className="chapter-index">01 / DESCENT</div>
            <p>FIRST, THERE WAS ONLY<br />A SHAPE AGAINST THE DARK.</p>
            <h2>NO SOUND.<br /><span>NO VISIBLE PROPULSION.</span></h2>
            <div className="depth-telemetry">
              <span>RANGE / UNKNOWN</span><span>VELOCITY / INDETERMINATE</span><span>ORIGIN / WITHHELD</span>
            </div>
          </div>
          <div className="fall-line" aria-hidden="true"><i /></div>
        </section>

        <section className="story-chapter signals-chapter" id="signals">
          <div className="signal-heading">
            <div className="chapter-index">02 / OFFICIAL FOOTAGE</div>
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
          <div className="chapter-index">04 / THE SCALE OF DISCLOSURE</div>
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
        </section>

        <section className="story-chapter archive-chapter" id="archive">
          <div className="archive-gate">
            <div className="chapter-index">05 / THE EVIDENCE FIELD</div>
            <p className="archive-count">334 RECORDS / 279 CASES / 15 FEATURED DOSSIERS</p>
            <h2>NOW ENTER<br /><span>THE RECORD.</span></h2>
            <p>Move through the released documents, footage, images and audio. Each point is an official record; linked records open as one evolving case.</p>
            <button className="archive-enter" type="button" onClick={enterArchive}><span>ENTER THE EVIDENCE FIELD</span><i aria-hidden="true" /></button>
            <div className="archive-source-line">PRIMARY SOURCE / U.S. GOVERNMENT PURSUE · CHINESE INDEX / CHINLEEZ CC BY 4.0</div>
          </div>
        </section>
      </div>

      <aside className="field-index" aria-hidden={!entered || selectedIndex !== null}>
        <div className="index-kicker">CURRENT FIELD</div>
        <div className="index-number">{archiveRecords.length}</div>
        <div className="index-label">OFFICIAL RECORD ROWS</div>
        <div className="index-rule" />
        <dl>
          <div><dt>CASES</dt><dd>{archiveCases.length}</dd></div>
          <div><dt>DOCUMENTS</dt><dd>{archiveTotals.pdf}</dd></div>
          <div><dt>VIDEO</dt><dd>{archiveTotals.video}</dd></div>
          <div><dt>IMAGERY</dt><dd>{archiveTotals.image}</dd></div>
          <div><dt>AUDIO</dt><dd>{archiveTotals.audio}</dd></div>
        </dl>
      </aside>

      <div className={`target-readout ${entered && hoveredIndex !== null && selectedIndex === null ? "is-visible" : ""}`} aria-live="polite">
        <span className="target-bracket">[</span>
        <div><small>SIGNAL ACQUIRED</small><strong>RECORD {String((hoveredIndex ?? 0) + 1).padStart(3, "0")}</strong><small>{hoveredKind} · CLICK TO INSPECT</small></div>
        <span className="target-bracket">]</span>
      </div>

      <div className={`scan-instruction ${entered && selectedIndex === null ? "is-visible" : ""}`}><span className="mouse-icon" aria-hidden="true" />MOVE TO SCAN THE FIELD</div>
      <div className={`coordinates ${entered ? "is-visible" : ""}`} aria-hidden="true"><span>OBSERVATION MODE / COORDINATE PRECISION PRESERVED</span><span>FIELD / 334</span></div>

      <section className={`case-file ${selectedEntry ? "is-open" : ""}`} aria-hidden={!selectedEntry}>
        {selectedEntry && selectedRecord && (
          <>
            <div className="case-topline">
              <span>{selectedCase?.id.toUpperCase() ?? selectedRecord.id}</span>
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
                </div>
                <p className="source-note">OFFICIAL SOURCE RECORD · DESCRIPTION IS NOT AN ANALYTICAL JUDGMENT</p>
              </div>
              <article className="case-copy">
                <div className="case-eyebrow">OPEN EVIDENCE FILE</div>
                <h2>{selectedCase?.title ?? selectedRecord.title}</h2>
                <div className="case-meta">
                  <div><span>LOCATION</span><strong>{selectedCase?.location.label ?? selectedRecord.location.label ?? "WITHHELD / UNKNOWN"}</strong></div>
                  <div><span>INCIDENT</span><strong>{displayDate(selectedCase?.eventDate ?? selectedRecord.incidentDate)}</strong></div>
                  <div><span>REPORTING BODY</span><strong>{selectedCase?.agencies.join(" / ") ?? selectedRecord.agency}</strong></div>
                  <div><span>OFFICIAL STATUS</span><strong>{selectedCase?.officialAssessment ?? selectedRecord.officialAssessment ?? selectedRecord.officialStatus}</strong></div>
                </div>
                <p className="case-description">{selectedCase?.summary ?? selectedRecord.descriptionOriginal}</p>
                {(selectedCase?.summary.endsWith("…") || selectedCase?.summary.endsWith("...")) && <p className="excerpt-warning">OFFICIAL DESCRIPTION EXCERPT · CONTINUE AT SOURCE</p>}
                <a className="official-source-link" href={selectedRecord.sourcePageUrl} target="_blank" rel="noreferrer">OPEN OFFICIAL SOURCE ↗</a>
                <div className="assessment">
                  <div className="assessment-title"><span>WHAT DO YOU THINK YOU SAW?</span><small>YOUR RESPONSE REMAINS ON THIS DEVICE</small></div>
                  <div className="verdicts">
                    {verdicts.map((item) => <button key={item} type="button" className={verdict === item ? "is-selected" : ""} onClick={() => setVerdict(item)}><span className="verdict-dot" />{item}</button>)}
                  </div>
                  {verdict && <div className="verdict-response">ASSESSMENT LOGGED: <strong>{verdict}</strong></div>}
                </div>
              </article>
            </div>
          </>
        )}
      </section>

      <footer className="credit-line">VISUAL EXPERIENCE V0.7 · PURSUE RELEASES 01–04 · CHINLEEZ / CC BY 4.0</footer>
      <p className="sr-only">An immersive three-dimensional field containing 334 official UAP record rows grouped into 279 cases.</p>
    </main>
  );
}
