"use client";
import { useRef, useState } from "react";
import ArchiveIcon from "./ArchiveIcon";

export default function TremontonPlayer({ src, poster, sourceUrl }: { src: string; poster?: string; sourceUrl: string }) {
  const video = useRef<HTMLVideoElement>(null);
  const [chapter, setChapter] = useState(0);
  const [failed, setFailed] = useState(false);
  const [message, setMessage] = useState("");
  const [started, setStarted] = useState(false);
  async function seek(time: number) {
    setChapter(time); setMessage("");
    if (!video.current) return;
    try { video.current.currentTime = time; await video.current.play(); } catch { setMessage("Press play in the video to continue."); }
  }
  return <div className="path-player">
    {failed ? <div className="path-media-fallback"><ArchiveIcon kind="video" /><p>The source video could not load here.</p><a href={sourceUrl} target="_blank" rel="noreferrer">Watch on the official site</a><button onClick={() => { setFailed(false); setStarted(false); }}>Try again</button></div> : <div className="path-video-stage"><video ref={video} src={src} poster={poster} controls playsInline preload="metadata" aria-label="Tremonton film, July 2, 1952. Official archival footage." onPlay={() => setStarted(true)} onError={() => setFailed(true)} />{!started && <button className="path-play" type="button" onClick={() => seek(0)}><ArchiveIcon kind="video" /><span>Play the official film<small>July 2, 1952 · Tremonton, Utah</small></span></button>}</div>}
    <div className="path-chapters" aria-label="Film chapters"><button type="button" disabled={failed} aria-pressed={chapter === 0} onClick={() => seek(0)}><ArchiveIcon kind="video" /><span>First look <small>0:00</small></span></button><button type="button" disabled={failed} aria-pressed={chapter === 52} onClick={() => seek(52)}><ArchiveIcon kind="compass" /><span>Find the cut <small>0:52</small></span></button></div>
    <p className="path-caption">Official digitization · 70 seconds · DVIDS</p>
    <p className="path-player-prompt" aria-live="polite">{message || (chapter === 52 ? "Watch the next few seconds. What changes at about 0:55?" : "Look for a horizon or a fixed point. What could you use to judge distance?")}</p>
  </div>;
}
