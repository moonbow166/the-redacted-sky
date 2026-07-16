"use client";

import { useEffect, useMemo, useState } from "react";
import SkyScene from "../components/SkyScene";

const featuredCases = [
  {
    index: 105,
    id: "CONTACT 106",
    title: "TWO OBJECTS / RAPID ZOOM CYCLE",
    location: "NORTH AMERICA",
    date: "2026",
    agency: "DEPARTMENT OF THE ARMY / AARO",
    duration: "00:01:49",
    classification: "UNRESOLVED / 2026 RELEASE",
    assessment: "NO REPORTER DESCRIPTION",
    description:
      "An Army infrared sensor shifts from an initial area of interest to two areas of contrast, repeatedly changing zoom and contrast while keeping both objects centered. This is among the newest records in the release.",
    video:
      "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111689168/DOD_111689168-1280x720-3000k.mp4",
    isPreview: false,
  },
  {
    index: 85,
    id: "CONTACT 086",
    title: "DIAMOND FORM / SWIR ONLY",
    location: "GREECE",
    date: "JAN 2024",
    agency: "U.S. CENTRAL COMMAND / AARO",
    duration: "00:01:06",
    classification: "UNRESOLVED / MULTI-SENSOR",
    assessment: "REPORTED 434 KNOTS",
    description:
      "A diamond-shaped object is reported at approximately 434 knots. It appears in short-wave infrared, then disappears when the operator switches to the visible spectrum.",
    video:
      "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111688954/DOD_111688954-1280x720-3000k.mp4",
    isPreview: false,
  },
  {
    index: 102,
    id: "CONTACT 103",
    title: "FOOTBALL BODY / THREE PROJECTIONS",
    location: "EAST CHINA SEA",
    date: "2024",
    agency: "U.S. INDO-PACIFIC COMMAND / AARO",
    duration: "00:00:09",
    classification: "UNRESOLVED / INFRARED",
    assessment: "MORPHOLOGY UNDETERMINED",
    description:
      "An infrared sensor holds on a football-shaped body with three radial projections: one vertical and two descending at roughly forty-five degrees from the main axis.",
    video:
      "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111689133/DOD_111689133-1280x720-3000k.mp4",
    isPreview: false,
  },
  {
    index: 86,
    id: "CONTACT 087",
    title: "INVERTED TEARDROP / WATERLINE",
    location: "GULF OF OMAN",
    date: "JUN 2024",
    agency: "U.S. NORTHERN COMMAND / AARO",
    duration: "00:00:21",
    classification: "UNRESOLVED / INFRARED",
    assessment: "POSSIBLE WATER REFLECTION",
    description:
      "An inverted teardrop-like area of contrast with a vertical mass below remains centered in the sensor view. The report also preserves the possibility of a reflection from an object in the water.",
    video:
      "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111688964/DOD_111688964-1280x720-3000k.mp4",
    isPreview: false,
  },
  {
    index: 80,
    id: "CONTACT 081",
    title: "TWO AREAS OF CONTRAST",
    location: "IRAQ",
    date: "MAY 2022",
    agency: "U.S. CENTRAL COMMAND",
    duration: "00:00:10",
    classification: "UNRESOLVED / REDACTED",
    assessment: "PROBABLE SU-27 / SU-35",
    description:
      "Two areas of contrast move together near the center of an infrared sensor's field of view. The accompanying mission report offers a probable identification. The visual record alone does not settle it.",
    video:
      "https://d34w7g4gy10iej.cloudfront.net/video/2605/DOD_111688762/DOD_111688762-1280x720-3000k.mp4",
    isPreview: false,
  },
];

const featuredByIndex = new Map(featuredCases.map((item) => [item.index, item]));

const verdicts = ["ORDINARY", "SENSOR AMBIGUITY", "INSUFFICIENT", "ANOMALOUS"];

export default function Home() {
  const [entered, setEntered] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);
  const [verdict, setVerdict] = useState<string | null>(null);

  const selectedCase = useMemo(() => {
    if (selectedIndex === null) return null;
    const connectedCase = featuredByIndex.get(selectedIndex);
    if (connectedCase) return connectedCase;
    const type = selectedIndex < 119 ? "DOCUMENT" : selectedIndex < 147 ? "VIDEO" : "IMAGERY";
    return {
      id: `CONTACT ${String(selectedIndex + 1).padStart(3, "0")}`,
      title: "FILE INDEXED / CONNECTION PENDING",
      location: "SOURCE INDEX",
      date: "RELEASE 01",
      agency: "U.S. GOVERNMENT ARCHIVE",
      duration: type,
      classification: "VISUAL PROTOTYPE",
      assessment: "NOT YET INGESTED",
      description:
        "This contact is present in the 161-record source index. Its full document, media and translated metadata have not yet been connected to this visual prototype.",
      video: "",
      isPreview: true,
    };
  }, [selectedIndex]);

  const hoveredType =
    hoveredIndex === null
      ? ""
      : featuredByIndex.has(hoveredIndex)
        ? "VIDEO"
      : hoveredIndex < 119
        ? "DOCUMENT"
        : hoveredIndex < 147
          ? "VIDEO"
          : "IMAGERY";

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setSelectedIndex(null);
        setVerdict(null);
      }
      if (event.key === "Enter" && !entered) setEntered(true);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [entered]);

  useEffect(() => {
    if (!entered || !soundOn) return;
    const AudioContextClass =
      window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AudioContextClass) return;

    const context = new AudioContextClass();
    const master = context.createGain();
    master.gain.setValueAtTime(0.0001, context.currentTime);
    master.gain.exponentialRampToValueAtTime(0.035, context.currentTime + 1.8);
    master.connect(context.destination);

    const low = context.createOscillator();
    const lowGain = context.createGain();
    low.type = "sine";
    low.frequency.value = 48;
    lowGain.gain.value = 0.15;
    low.connect(lowGain).connect(master);

    const carrier = context.createOscillator();
    const carrierGain = context.createGain();
    carrier.type = "triangle";
    carrier.frequency.value = 164;
    carrierGain.gain.value = 0.025;
    carrier.connect(carrierGain).connect(master);

    const lfo = context.createOscillator();
    const lfoGain = context.createGain();
    lfo.frequency.value = 0.11;
    lfoGain.gain.value = 0.018;
    lfo.connect(lfoGain).connect(carrierGain.gain);

    low.start();
    carrier.start();
    lfo.start();

    return () => {
      master.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.15);
      window.setTimeout(() => context.close(), 180);
    };
  }, [entered, soundOn]);

  const closeCase = () => {
    setSelectedIndex(null);
    setVerdict(null);
  };

  return (
    <main className={`experience ${entered ? "is-entered" : "is-intro"}`}>
      <SkyScene
        active={entered}
        selected={selectedIndex}
        onHover={setHoveredIndex}
        onSelect={(index) => {
          if (!entered) return;
          setSelectedIndex(index);
          setVerdict(null);
        }}
      />

      <div className="grain" aria-hidden="true" />
      <div className="vignette" aria-hidden="true" />

      <header className="system-bar">
        <div className="brand-lockup">
          <span className="brand-mark" aria-hidden="true" />
          <span>THE REDACTED SKY</span>
          <span className="dim">/ 天空被涂黑的部分</span>
        </div>
        <div className="system-status">
          <span className="status-light" />
          <span>FIELD ACTIVE</span>
          <span className="dim hide-mobile">5 INGESTED / 156 INDEXED</span>
          <button
            className="sound-toggle"
            type="button"
            aria-label={soundOn ? "Mute ambient signal" : "Enable ambient signal"}
            onClick={() => setSoundOn((value) => !value)}
          >
            SOUND {soundOn ? "ON" : "OFF"}
          </button>
        </div>
      </header>

      <section className="intro-copy" aria-hidden={entered}>
        <div className="eyebrow">REPORTED MORPHOLOGIES / DECLASSIFIED FIELD 01</div>
        <h1>
          <span>THE</span>
          <span className="redacted-word">REDACTED</span>
          <span>SKY</span>
        </h1>
        <p className="intro-statement">
          You are not here to find the answer.
          <br />
          You are here to notice how you decide what is real.
        </p>
        <button
          className="signal-lock"
          type="button"
          onClick={() => setEntered(true)}
          aria-label="Acquire the signal and enter the field"
        >
          <span className="lock-orbit orbit-a" aria-hidden="true" />
          <span className="lock-orbit orbit-b" aria-hidden="true" />
          <span className="lock-cross" aria-hidden="true" />
          <span className="lock-core">
            <small>ACQUIRE</small>
            <strong>SIGNAL</strong>
          </span>
        </button>
        <div className="entry-note">
          HEADPHONES RECOMMENDED · MOVE TO SCAN · CLICK TO INSPECT
        </div>
      </section>

      <aside className="morphology-index" aria-hidden={entered}>
        <div className="morphology-heading">REPORTED FORMS / NOT VERIFIED CONSTRUCTION</div>
        <ol>
          <li><span>01</span> ORB</li>
          <li><span>02</span> TIC-TAC</li>
          <li><span>03</span> DISK</li>
          <li><span>04</span> TRIANGLE</li>
          <li><span>05</span> CYLINDER</li>
          <li><span>06</span> BOOMERANG</li>
        </ol>
      </aside>

      <div className="craft-callout" aria-hidden={entered}>
        <span>PRIMARY RECONSTRUCTION / 03</span>
        <strong>DISK FORM</strong>
        <small>REALTIME 3D · UNKNOWN SCALE</small>
      </div>

      <aside className="field-index" aria-hidden={!entered || selectedIndex !== null}>
        <div className="index-kicker">CURRENT FIELD</div>
        <div className="index-number">161</div>
        <div className="index-label">DECLASSIFIED CONTACTS</div>
        <div className="index-rule" />
        <dl>
          <div>
            <dt>DOCUMENTS</dt>
            <dd>119</dd>
          </div>
          <div>
            <dt>VIDEO</dt>
            <dd>028</dd>
          </div>
          <div>
            <dt>IMAGERY</dt>
            <dd>014</dd>
          </div>
          <div>
            <dt>REDACTED</dt>
            <dd>108</dd>
          </div>
          <div>
            <dt>CONNECTED</dt>
            <dd>005</dd>
          </div>
        </dl>
      </aside>

      <div
        className={`target-readout ${entered && hoveredIndex !== null && selectedIndex === null ? "is-visible" : ""}`}
        aria-live="polite"
      >
        <span className="target-bracket">[</span>
        <div>
          <small>SIGNAL ACQUIRED</small>
          <strong>
            CONTACT {String((hoveredIndex ?? 0) + 1).padStart(3, "0")}
          </strong>
          <small>{hoveredType} · CLICK TO INSPECT</small>
        </div>
        <span className="target-bracket">]</span>
      </div>

      <div className={`scan-instruction ${entered && selectedIndex === null ? "is-visible" : ""}`}>
        <span className="mouse-icon" aria-hidden="true" />
        MOVE TO SCAN THE FIELD
      </div>

      <div className="coordinates" aria-hidden="true">
        <span>OBSERVATION NODE 34.0522° N / 118.2437° W</span>
        <span>T+ {entered ? "00:00:17:26" : "STANDBY"}</span>
      </div>

      <section className={`case-file ${selectedCase ? "is-open" : ""}`} aria-hidden={!selectedCase}>
        {selectedCase && (
          <>
            <div className="case-topline">
              <span>{selectedCase.id}</span>
              <span className={`classification ${selectedCase.isPreview ? "is-preview" : ""}`}>
                {selectedCase.classification}
              </span>
              <button type="button" onClick={closeCase} aria-label="Close evidence file">
                CLOSE [ESC]
              </button>
            </div>

            <div className="case-layout">
              <div className="evidence-visual">
                <div className="video-frame">
                  {selectedCase.video ? (
                    <video
                      src={selectedCase.video}
                      autoPlay
                      muted
                      loop
                      playsInline
                      controls
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className={`signal-placeholder ${selectedCase.isPreview ? "pending-record" : ""}`}>
                      <div className="pending-document" aria-hidden="true">
                        <i />
                        <i />
                        <i />
                        <b />
                        <b />
                      </div>
                      <span>
                        {selectedCase.isPreview
                          ? "FULL RECORD CONNECTION PENDING"
                          : "VISUAL RECORD RESTRICTED"}
                      </span>
                    </div>
                  )}
                  <span className="frame-corner corner-a" />
                  <span className="frame-corner corner-b" />
                  <span className="frame-corner corner-c" />
                  <span className="frame-corner corner-d" />
                  <div className="video-overlay">
                    <span>IR / EO SENSOR</span>
                    <span>REC ●</span>
                    <span>{selectedCase.duration}</span>
                  </div>
                </div>
                <p className="source-note">
                  OFFICIAL SOURCE RECORD · IMAGE DESCRIPTION IS NOT AN ANALYTICAL JUDGMENT
                </p>
              </div>

              <article className="case-copy">
                <div className="case-eyebrow">OPEN EVIDENCE FILE</div>
                <h2>{selectedCase.title}</h2>
                <div className="case-meta">
                  <div>
                    <span>LOCATION</span>
                    <strong>{selectedCase.location}</strong>
                  </div>
                  <div>
                    <span>INCIDENT</span>
                    <strong>{selectedCase.date}</strong>
                  </div>
                  <div>
                    <span>REPORTING BODY</span>
                    <strong>{selectedCase.agency}</strong>
                  </div>
                  <div>
                    <span>OFFICIAL NOTE</span>
                    <strong>{selectedCase.assessment}</strong>
                  </div>
                </div>
                <p className="case-description">{selectedCase.description}</p>

                <div className={`assessment ${selectedCase.isPreview ? "is-disabled" : ""}`}>
                  <div className="assessment-title">
                    <span>WHAT DO YOU THINK YOU SAW?</span>
                    <small>YOUR RESPONSE REMAINS ON THIS DEVICE</small>
                  </div>
                  {selectedCase.isPreview ? (
                    <div className="ingestion-notice">
                      THIS FILE WILL BECOME INTERACTIVE WHEN ITS SOURCE MATERIAL IS CONNECTED.
                    </div>
                  ) : (
                    <div className="verdicts">
                      {verdicts.map((item) => (
                        <button
                          key={item}
                          type="button"
                          className={verdict === item ? "is-selected" : ""}
                          onClick={() => setVerdict(item)}
                        >
                          <span className="verdict-dot" />
                          {item}
                        </button>
                      ))}
                    </div>
                  )}
                  {verdict && (
                    <div className="verdict-response">
                      ASSESSMENT LOGGED: <strong>{verdict}</strong>
                    </div>
                  )}
                </div>
              </article>
            </div>
          </>
        )}
      </section>

      <footer className="credit-line">
        VISUAL PROTOTYPE V0.3 · SOURCE: U.S. GOVERNMENT RELEASE 01 · CHINESE INDEX: CHINLEEZ / CC BY 4.0
      </footer>

      <p className="sr-only">
        An immersive three-dimensional field containing 161 declassified UAP records. Move
        through the field and select a signal to inspect the associated evidence.
      </p>
    </main>
  );
}
