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
    {preview && !failed && <img src={preview.url} alt="" loading={eager ? "eager" : "lazy"} decoding="async" onError={() => setFailed(true)} />}
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
  const openStory = (event: MouseEvent<HTMLAnchorElement>, pick: CuriosityPick) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    onOpen(pick);
  };
  return <section className="curiosity-gallery" aria-label="Curated paths through the archive">
    <nav className="curiosity-trails" aria-label="What would you like to explore?">
      {curiosityTrails.map(item => <button key={item.id} type="button" aria-pressed={trail === item.id} onClick={() => onTrailChange(item.id)}><ArchiveIcon kind={item.icon} /><span>{item.label}</span></button>)}
    </nav>
    <div className="curiosity-collection-heading"><h2>{collection.title}</h2><p>{collection.description}</p></div>
    <a href={casePath(materialForPick(lead).caseFile.slug)} className="curiosity-lead" onClick={event => openStory(event, lead)} aria-label={`Explore ${lead.title}`}>
      <StoryImage key={lead.caseId} pick={lead} eager />
      <span className="curiosity-lead-copy"><span className="story-cue">{lead.cue}</span><strong>{lead.title}</strong><span>{lead.invitation}</span><span className="story-why"><b>Why start here</b>{lead.why}</span><span className="story-open">Explore this story<ArchiveIcon kind="compass" /></span></span>
    </a>
    <div className="curiosity-grid">{rest.map(pick => <a href={casePath(materialForPick(pick).caseFile.slug)} key={pick.caseId} className="curiosity-card" onClick={event => openStory(event, pick)} aria-label={`Explore ${pick.title}`}>
      <StoryImage pick={pick} /><span className="curiosity-card-copy"><span className="story-cue">{pick.cue}</span><strong>{pick.title}</strong><span>{pick.invitation}</span><span className="story-open">Take a closer look<ArchiveIcon kind="compass" /></span></span>
    </a>)}</div>
  </section>;
}
