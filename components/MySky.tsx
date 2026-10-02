"use client";
/* eslint-disable @next/next/no-img-element, @next/next/no-html-link-for-pages -- Original media and progressive native navigation. */
import { useEffect, useRef, useState, type CSSProperties } from "react";
import ArchiveIcon from "./ArchiveIcon";
import type { SkyClue, SourceConnection } from "../lib/my-sky";
import { SKY_STORAGE_KEY, connectClues, disconnectClues, emptySky, linkLabels, pairKey, sanitizeSky, toggleClue } from "../lib/my-sky-state.mjs";

type SkyState = ReturnType<typeof emptySky>;
type LinkKind = "wonder" | "contrast" | "unsure";

function ClueMedia({ clue, small = false }: { clue: SkyClue; small?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = clue.kind === "image" && !small ? clue.mediaUrl : clue.previewUrl;
  return <div className={`sky-media sky-media-${clue.kind}${small ? " sky-media-small" : ""}`}>
    {!small && clue.kind === "video" && clue.mediaUrl && !failed
      ? <video key={clue.id} controls playsInline preload="none" poster={clue.previewUrl ?? undefined} onError={() => setFailed(true)} aria-label={clue.title}><source src={clue.mediaUrl} type="video/mp4" /><track kind="captions" /></video>
      : <>{src && !failed ? <img src={src} alt={small ? "" : `Official preview: ${clue.title}`} loading={small ? "lazy" : "eager"} onError={() => setFailed(true)} /> : <div className="sky-media-fallback"><ArchiveIcon kind={clue.kind} />{!small && <span>{failed ? "Preview unavailable" : "Open the original material"}</span>}</div>}
        {!small && clue.kind === "audio" && clue.mediaUrl && <audio controls preload="none" src={clue.mediaUrl} onError={() => setFailed(true)} aria-label={clue.title} />}</>}
    {small && <span className="sky-tiny-kind"><ArchiveIcon kind={clue.kind} /></span>}
    {!small && failed && <a className="sky-media-recovery" href={clue.sourceUrl} target="_blank" rel="noreferrer">Try the official source</a>}
  </div>;
}

function CluePanel({ clue, kept, onKeep, ready, second, children }: { clue: SkyClue; kept: boolean; onKeep: () => void; ready: boolean; second?: boolean; children?: React.ReactNode }) {
  return <article className={`sky-clue${kept ? " is-kept" : ""}`} aria-label={`${second ? "Companion" : "Selected"} clue: ${clue.title}`}>
    <div className="sky-clue-heading"><div><h2>{clue.title}</h2><span>{clue.year} · {({ video: "Film", image: "Photograph", audio: "Audio", pdf: "Document" })[clue.kind]}</span></div>{children}</div>
    <ClueMedia key={clue.id} clue={clue} />
    <div className="sky-clue-context"><p>{clue.note}</p><p className="sky-clue-limit">{clue.limit}</p></div>
    <div className="sky-clue-actions"><button className={kept ? "sky-button sky-kept" : "sky-button sky-primary"} type="button" disabled={!ready} onClick={onKeep} aria-pressed={kept} aria-label={`${kept ? "Remove" : "Keep"} ${clue.title}${kept ? " from" : " in"} my sky`}><ArchiveIcon kind={kept ? "check" : "plus"} /><span>{kept ? "Kept in my sky" : "Keep this clue"}</span></button><a href={clue.mediaUrl ?? clue.sourceUrl} target="_blank" rel="noreferrer">Open original</a></div>
    <details className="sky-source-detail"><summary>Source and context</summary><p>{clue.summary}</p><a href={clue.sourceUrl} target="_blank" rel="noreferrer">{clue.id} on PURSUE</a><a href={clue.caseUrl}>Full case file</a></details>
  </article>;
}

export default function MySky({ clues, sourceConnections }: { clues: SkyClue[]; sourceConnections: SourceConnection[] }) {
  const [sky, setSky] = useState<SkyState>(emptySky);
  const [history, setHistory] = useState<SkyState[]>([]);
  const [ready, setReady] = useState(false);
  const [storageOK, setStorageOK] = useState(true);
  const [leftId, setLeftId] = useState(clues[0].id);
  const [rightId, setRightId] = useState(clues[1].id);
  const [kind, setKind] = useState<LinkKind>("unsure");
  const [message, setMessage] = useState("Start with either clue. Keep anything that makes you curious.");
  const [help, setHelp] = useState(false);
  const [inputMode, setInputMode] = useState("pointer");
  const mapRef = useRef<HTMLElement>(null);
  const benchRef = useRef<HTMLElement>(null);
  const lastSaved = useRef<string | null>(null);
  const allowed = clues.map(clue => clue.id);

  useEffect(() => {
    let restored = emptySky();
    let available = true;
    try {
      const saved = localStorage.getItem(SKY_STORAGE_KEY);
      if (saved) restored = sanitizeSky(JSON.parse(saved), clues.map(clue => clue.id));
    } catch { available = false; }
    // Hydrate browser-only state after deterministic server rendering.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSky(restored);
    setStorageOK(available);
    setReady(true);
    setKind(restored.links.find(link => pairKey(link.a, link.b) === pairKey(clues[0].id, clues[1].id))?.kind ?? "unsure");
    if (restored.ids.length) setMessage("Welcome back. Your clues are still here.");
  }, [clues]);

  useEffect(() => {
    if (!ready) return;
    const serialized = JSON.stringify(sky);
    if (lastSaved.current === serialized) return;
    try {
      localStorage.setItem(SKY_STORAGE_KEY, serialized);
      lastSaved.current = serialized;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setStorageOK(true);
    } catch { setStorageOK(false); }
  }, [ready, sky]);

  const left = clues.find(clue => clue.id === leftId)!;
  const right = clues.find(clue => clue.id === rightId)!;
  const bothKept = sky.ids.includes(leftId) && sky.ids.includes(rightId);
  const existing = sky.links.find(link => pairKey(link.a, link.b) === pairKey(leftId, rightId));
  const officialPair = sourceConnections.find(link => pairKey(link.a, link.b) === pairKey(leftId, rightId));
  const savedClues = clues.filter(clue => sky.ids.includes(clue.id));
  const pocketPositions = [{ x: 14, y: 38 }, { x: 47, y: 15 }, { x: 71, y: 44 }];
  const pocketClues = savedClues.slice(0, 3);
  const visibleSourceLinks = sourceConnections.filter(link => sky.ids.includes(link.a) && sky.ids.includes(link.b));
  const stage = sky.links.length ? 3 : sky.ids.length >= 2 ? 2 : 1;
  const mobileRows = Math.max(1, Math.ceil(savedClues.length / 2));
  const mobilePoint = (id: string) => { const index = savedClues.findIndex(clue => clue.id === id); return { x: index % 2 ? 74 : 26, y: (Math.floor(index / 2) + .5) / mobileRows * 100 }; };

  function connectionLines(mobile: boolean) {
    const point = (id: string) => mobile ? mobilePoint(id) : clues.find(clue => clue.id === id)!;
    return <svg className={`sky-map-lines ${mobile ? "sky-mobile-lines" : "sky-desktop-lines"}`} viewBox="0 0 1000 340" preserveAspectRatio="none" aria-hidden="true">
      {visibleSourceLinks.map(link => { const a = point(link.a); const b = point(link.b); return <line className="sky-source-line" key={pairKey(link.a, link.b)} x1={a.x * 10} y1={a.y * 3.4} x2={b.x * 10} y2={b.y * 3.4} />; })}
      {sky.links.map(link => { const a = point(link.a); const b = point(link.b); return <path className="sky-own-line" key={`${pairKey(link.a, link.b)}-${link.kind}`} d={`M ${a.x * 10} ${a.y * 3.4} Q ${(a.x + b.x) * 5} ${(a.y + b.y) * 1.7 - 38} ${b.x * 10} ${b.y * 3.4}`} />; })}
    </svg>;
  }

  function commit(next: SkyState, status: string) {
    setHistory(previous => [...previous.slice(-19), sky]);
    setSky(next);
    setMessage(status);
  }
  function keep(clue: SkyClue) {
    const removed = sky.ids.includes(clue.id);
    commit(toggleClue(sky, clue.id, allowed), removed ? `${clue.title} removed. Undo brings it and its links back.` : `${clue.title} is in your sky. ${sky.ids.length === 0 ? "Keep another clue to make a connection." : "You can connect two clues without knowing the answer."}`);
  }
  function inspect(id: string, companion?: string) {
    const nextRight = companion ?? (id === rightId ? leftId : rightId);
    setLeftId(id);
    setRightId(nextRight === id ? clues.find(clue => clue.id !== id)!.id : nextRight);
    const link = sky.links.find(item => pairKey(item.a, item.b) === pairKey(id, nextRight));
    setKind(link?.kind ?? "unsure");
    setMessage("Look at the pair. Keep what interests you, or choose a different companion.");
    benchRef.current?.scrollIntoView({ behavior: "instant", block: "start" });
    benchRef.current?.focus({ preventScroll: true });
  }
  function connect() {
    if (!bothKept) return;
    commit(connectClues(sky, { a: leftId, b: rightId, kind }), sky.links.length ? "Your connection is saved. You can change your mind at any time." : "Your first constellation. A question is enough to start one.");
    mapRef.current?.scrollIntoView({ behavior: "instant", block: "center" });
    mapRef.current?.focus({ preventScroll: true });
  }
  function undo() {
    const restored = history[history.length - 1];
    if (!restored) return;
    setSky(restored);
    setHistory(history.slice(0, -1));
    setKind(restored.links.find(link => pairKey(link.a, link.b) === pairKey(leftId, rightId))?.kind ?? "unsure");
    setMessage("Undone. Your sky is back to the previous step.");
  }

  return <main className="sky-main" data-input={inputMode} onPointerDown={() => setInputMode("pointer")} onKeyDown={() => setInputMode("keyboard")}>
    <header className="sky-intro"><div><h1>My sky<span className="sky-title-mark" aria-hidden="true"><ArchiveIcon kind="constellation" /></span></h1><p>No right answers. Just a little curiosity.</p></div><div className="sky-intro-actions"><a className="sky-text-action" href="#my-constellation"><ArchiveIcon kind="constellation" />See my sky</a><button className="sky-text-action" type="button" aria-expanded={help} aria-controls="sky-help" onClick={() => setHelp(!help)}><ArchiveIcon kind="help" />How to play</button></div></header>
    {help && <aside id="sky-help" className="sky-help"><h2>You already know how.</h2><p>Look at a clue. Keep it if you are curious. Keep a second one, then choose what made you connect them.</p><p>“Not sure yet” is a complete answer. No score, no timer, no dragging. Tap a star to revisit it. Tap “Kept in my sky” to remove it. Undo is always nearby.</p><p>This small playground has 10 real materials. Your sky stays in this browser, not on our servers. Clearing browser data removes it. <a href="/archive">The full archive is still open.</a></p></aside>}
    <ol className="sky-steps" aria-label="Getting started"><li className={stage >= 1 ? "is-current" : ""}><span>{sky.ids.length ? <ArchiveIcon kind="check" /> : "1"}</span>Keep a clue</li><li className={stage >= 2 ? "is-current" : ""}><span>{sky.links.length ? <ArchiveIcon kind="check" /> : "2"}</span>Make a connection</li><li className={stage >= 3 ? "is-current" : ""}><span>3</span>Follow your curiosity</li></ol>
    <section id="sky-workbench" className="sky-bench" aria-label="Compare two clues" ref={benchRef} tabIndex={-1}>
      <CluePanel clue={left} kept={sky.ids.includes(leftId)} onKeep={() => keep(left)} ready={ready} />
      <div className="sky-pair-seam" aria-hidden="true"><ArchiveIcon kind="link" /></div>
      <CluePanel clue={right} kept={sky.ids.includes(rightId)} onKeep={() => keep(right)} ready={ready} second>
        <label className="sky-choose"><span>Compare with</span><select aria-label="Choose a companion clue" value={rightId} onChange={event => { const id = event.target.value; setRightId(id); setKind(sky.links.find(link => pairKey(link.a, link.b) === pairKey(leftId, id))?.kind ?? "unsure"); }}>{clues.filter(clue => clue.id !== leftId).map(clue => <option key={clue.id} value={clue.id}>{clue.title}</option>)}</select></label>
      </CluePanel>
    </section>
    <div className="sky-play-space">
    <section className="sky-link-maker" aria-labelledby="sky-link-title"><div><h2 id="sky-link-title">{existing ? "Your connection" : "What connects them for you?"}</h2><p>{bothKept ? "A hunch, a difference, or simply a question." : "Keep both clues above, then give your connection a name."}</p></div><div className="sky-link-controls"><fieldset disabled={!bothKept}><legend className="sky-sr-only">Your personal connection</legend>{(["wonder", "contrast", "unsure"] as LinkKind[]).map(value => <label className={kind === value ? "is-selected" : ""} key={value}><input type="radio" name="link-kind" value={value} checked={kind === value} onChange={() => setKind(value)} /><ArchiveIcon kind={value === "wonder" ? "link" : value === "contrast" ? "compare" : "help"} />{linkLabels[value]}</label>)}</fieldset><button className="sky-button sky-primary" disabled={!bothKept || !!existing && existing.kind === kind} type="button" onClick={connect}><ArchiveIcon kind={existing ? "check" : "constellation"} />{existing ? existing.kind === kind ? "Connection saved" : "Update my connection" : "Connect these clues"}</button>{existing && <button className="sky-text-action" type="button" onClick={() => commit(disconnectClues(sky, leftId, rightId), "Your connection was removed. The clues and source links remain.")}>Remove my connection</button>}</div></section>
    <div className="sky-source-pair"><ArchiveIcon kind="pdf" /><p>{officialPair ? <><a href={officialPair.url} target="_blank" rel="noreferrer">{officialPair.label}</a>. This is separate from your own connection.</> : <>No source link is shown for this pair. A connection you make is your question, not an official finding.</>}</p></div>
    <section id="my-constellation" className="sky-constellation" ref={mapRef} tabIndex={-1} aria-labelledby="constellation-title">
      <div className="sky-map-heading"><div><h2 id="constellation-title">{sky.links.length ? "A constellation of your own." : "Your sky starts here."}</h2><p>{sky.ids.length ? `${sky.ids.length} ${sky.ids.length === 1 ? "clue" : "clues"} kept · Tap a star to look again` : "Keep a clue above to light your first star."}</p></div><button className="sky-button sky-undo" type="button" disabled={!history.length} onClick={undo}><ArchiveIcon kind="undo" />Undo</button></div>
      <div className="sky-map" role="group" aria-label="Your saved clues and connections" style={{ "--sky-mobile-height": `${Math.max(240, mobileRows * 126)}px` } as CSSProperties}>
        {connectionLines(false)}{connectionLines(true)}
        {!savedClues.length && <div className="sky-map-empty"><ArchiveIcon kind="constellation" /><p>Nothing to solve.<br /><span>Something to wonder about.</span></p></div>}
        {savedClues.map(clue => <button type="button" className={`sky-star${clue.id === leftId || clue.id === rightId ? " is-inspected" : ""}`} style={{ "--x": `${clue.x}%`, "--y": `${clue.y}%`, "--mobile-x": `${mobilePoint(clue.id).x}%`, "--mobile-y": `${mobilePoint(clue.id).y}%` } as CSSProperties} key={clue.id} onClick={() => inspect(clue.id)} aria-label={`Inspect ${clue.title}`}><span className="sky-star-point"><ArchiveIcon kind={clue.kind} /></span><span className="sky-star-name">{clue.title}</span></button>)}
      </div>
      <div className="sky-map-legend"><span><i className="sky-legend-source" />Source-listed link</span><span><i className="sky-legend-own" />Your question</span><span className="sky-save-state"><ArchiveIcon kind={storageOK ? "lock" : "help"} />{ready ? storageOK ? "Saved in this browser" : "This visit only: browser storage is unavailable" : "Opening your sky…"}</span></div>
      <p className="sky-map-note">An idea map, not sky coordinates. A line is not proof of a shared cause.</p>
      {sky.links.length > 0 && <div className="sky-connection-list" aria-label="Your connections">{sky.links.map(link => <button key={pairKey(link.a, link.b)} type="button" onClick={() => inspect(link.a, link.b)}><ArchiveIcon kind="link" /><span>{clues.find(clue => clue.id === link.a)!.title}<span className="sky-connection-relation">{linkLabels[link.kind]}</span>{clues.find(clue => clue.id === link.b)!.title}</span></button>)}</div>}
      {visibleSourceLinks.length > 0 && <details className="sky-source-list"><summary>Check the source-listed links ({visibleSourceLinks.length})</summary><ul>{visibleSourceLinks.map(link => <li key={pairKey(link.a, link.b)}><a href={link.url} target="_blank" rel="noreferrer">{clues.find(clue => clue.id === link.a)!.title} + {clues.find(clue => clue.id === link.b)!.title}</a><span>{link.label}. A source listing does not establish a common explanation.</span></li>)}</ul></details>}
    </section>
    </div>
    <p className="sky-status" role="status" aria-live="polite"><ArchiveIcon kind="spark" />{message}</p>
    <section className="sky-discover" aria-labelledby="sky-discover-title"><div className="sky-discover-heading"><div><h2 id="sky-discover-title">Which clue pulls you in?</h2><p>These are editorial starting points. Your next connection is yours.</p></div><a href="/archive">Explore the full archive</a></div><div className="sky-shelf">{clues.map(clue => <button type="button" className={clue.id === leftId ? "is-selected" : ""} key={clue.id} onClick={() => inspect(clue.id)} aria-pressed={clue.id === leftId}><ClueMedia clue={clue} small /><span className="sky-shelf-title">{clue.title}</span><span className="sky-shelf-meta">{clue.year}{sky.ids.includes(clue.id) && <span><ArchiveIcon kind="check" />Kept</span>}</span></button>)}</div></section>
    <footer className="sky-footer"><p>Real materials. Your own questions.</p><a href="/sources">Sources and method</a><a href="/archive">Back to archive</a></footer>
    <aside className="sky-pocket" aria-label="Your pocket sky">
      <svg className="sky-pocket-preview" viewBox="0 0 84 62" fill="none" aria-hidden="true">
        {visibleSourceLinks.filter(link => pocketClues.some(clue => clue.id === link.a) && pocketClues.some(clue => clue.id === link.b)).map(link => { const a = pocketPositions[pocketClues.findIndex(clue => clue.id === link.a)]; const b = pocketPositions[pocketClues.findIndex(clue => clue.id === link.b)]; return <line key={pairKey(link.a, link.b)} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#80b19a" />; })}
        {sky.links.filter(link => pocketClues.some(clue => clue.id === link.a) && pocketClues.some(clue => clue.id === link.b)).map(link => { const a = pocketPositions[pocketClues.findIndex(clue => clue.id === link.a)]; const b = pocketPositions[pocketClues.findIndex(clue => clue.id === link.b)]; return <path key={pairKey(link.a, link.b)} d={`M${a.x} ${a.y} Q${(a.x+b.x)/2} ${(a.y+b.y)/2-12} ${b.x} ${b.y}`} stroke="#e3ba85" strokeDasharray="3 3" />; })}
        {pocketPositions.map((point,index) => <circle key={index} cx={point.x} cy={point.y} r={pocketClues[index] ? 6 : 4} stroke={pocketClues[index] ? "#b9ead8" : "#496454"} fill={pocketClues[index] ? "#b9ead8" : "#0b1912"} />)}
      </svg>
      <div><strong>{sky.ids.length ? `${sky.ids.length} ${sky.ids.length === 1 ? "clue" : "clues"} kept` : "Your sky is empty"}</strong><span>{sky.links.length ? "Your questions, connected." : sky.ids.length >= 2 ? "Ready to make a connection." : sky.ids.length ? "Keep one more clue." : "Keep a clue to begin."}</span></div>
      <a href="#my-constellation">View sky</a>
    </aside>
  </main>;
}
