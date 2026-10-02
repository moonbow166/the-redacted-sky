/* eslint-disable @next/next/no-img-element -- Real archive previews retain their source and fallback. */
/* eslint-disable @next/next/no-html-link-for-pages -- Links progressively enhance into the media viewer. */
import { useState } from "react";
import type { MouseEvent } from "react";
import ArchiveIcon from "./ArchiveIcon";
import { curiosityTrails, materialForPick, picksForTrail, type CuriosityPick, type CuriosityTrailId } from "../lib/explore";
import { casePath } from "../lib/site";

export function StoryImage({ pick, eager = false }: { pick: CuriosityPick; eager?: boolean }) {
  const [failed, setFailed] = useState(false);
  const { record, preview } = materialForPick(pick);
  return <span className={`story-image story-image-${record.fileType}`}>
    {preview && !failed && <img src={record.id === "DOW-UAP-PR159" ? "/source-images/tremonton-official-preview.jpg" : preview.url} alt="" loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />}
    <span className="story-media-symbol"><ArchiveIcon kind={record.fileType} /></span>
    <span className="story-media-kind">{({ video: "Watch", audio: "Listen", image: "Look closer", pdf: "Read" })[record.fileType]}</span>
  </span>;
}

export default function ExploreGallery({ trail, onTrailChange, onOpen }: {
  trail: CuriosityTrailId;
  onTrailChange: (trail: CuriosityTrailId) => void;
  onOpen: (pick: CuriosityPick) => void;
}) {
  const collection = curiosityTrails.find(item => item.id === trail)!;
  const [lead, ...rest] = picksForTrail(trail);
  const guided = lead.recordId === "DOW-UAP-PR159";
  const pickUrl = (pick: CuriosityPick) => pick.recordId === "DOW-UAP-PR159" ? "/explore/tremonton-1952" : casePath(materialForPick(pick).caseFile.slug);
  const openStory = (event: MouseEvent<HTMLAnchorElement>, pick: CuriosityPick) => {
    if (pick.recordId === "DOW-UAP-PR159") return;
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(pick);
  };
  return <section className="curiosity-gallery" aria-label="Curated paths through the archive">
    <nav className="curiosity-trails" aria-label="What would you like to explore?">
      {curiosityTrails.map(item => <button key={item.id} type="button" aria-pressed={trail === item.id} onClick={() => onTrailChange(item.id)}><ArchiveIcon kind={item.icon} /><span>{item.label}</span></button>)}
    </nav>
    <div className="curiosity-collection-heading"><h2>{collection.title}</h2><p>{collection.description}</p></div>
    <a href={pickUrl(lead)} className={`curiosity-lead${guided ? " curiosity-guided" : ""}`} onClick={event => openStory(event, lead)} aria-label={`Explore ${lead.title}`}>
      <StoryImage key={lead.caseId} pick={lead} eager />
      <span className="curiosity-lead-copy"><strong>{guided ? "The film has a missing piece." : lead.title}</strong><span className="story-cue">{guided ? "Utah, 1952 · About 5 minutes" : lead.cue}</span><span>{guided ? "Watch a strange reel. Notice the cut. Follow the investigation." : lead.invitation}</span>{guided ? <span className="guided-route"><span><ArchiveIcon kind="video" />Watch</span><span><ArchiveIcon kind="compass" />Notice</span><span><ArchiveIcon kind="pdf" />Compare</span></span> : <span className="story-why"><b>A question to take with you</b>{lead.question}</span>}<span className="story-open">{guided ? "Follow the film" : "Explore this story"}<ArchiveIcon kind="compass" /></span></span>
    </a>
    <div className="curiosity-grid">{rest.map(pick => <a href={pickUrl(pick)} key={pick.caseId} className="curiosity-card" onClick={event => openStory(event, pick)} aria-label={`Explore ${pick.title}`}>
      <StoryImage pick={pick} /><span className="curiosity-card-copy"><strong>{pick.title}</strong><span className="story-cue">{pick.cue}</span><span>{pick.invitation}</span><span className="story-open">Take a closer look<ArchiveIcon kind="compass" /></span></span>
    </a>)}</div>
  </section>;
}
