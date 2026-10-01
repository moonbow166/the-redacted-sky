/* eslint-disable @next/next/no-img-element -- Source thumbnails are not decorative reconstructions. */
/* eslint-disable @next/next/no-html-link-for-pages -- Native navigation is intentional. */
import { archiveRecords, archiveTotals, previewAsset } from "../lib/archive";
import ArchiveIcon from "./ArchiveIcon";

const materials = [
  { kind: "video", id: "DOW-UAP-PR104", action: "Watch the footage", label: "videos" },
  { kind: "image", id: "NASA-UAP-D030", action: "Look a little closer", label: "images" },
  { kind: "audio", id: "NASA-UAP-D003A", action: "Hear the voices", label: "recordings" },
  { kind: "pdf", id: "DOE-UAP-D004", action: "Follow the paper trail", label: "documents" },
] as const;

export default function ArchiveOverview() {
  return <div className="archive-media-doors">{materials.map(item => {
    const record = archiveRecords.find(record => record.id === item.id)!;
    const preview = previewAsset(record);
    return <a href={`/archive?media=${item.kind}`} key={item.kind} className={`archive-media-door door-${item.kind}`}>
      <span className="media-door-image">{preview && <img src={preview.url} alt="" loading="lazy" onError={event => {event.currentTarget.hidden = true;}} />}<ArchiveIcon kind={item.kind}/></span>
      <strong>{item.action}</strong><span>{archiveTotals[item.kind]} {item.label}</span>
    </a>;
  })}</div>;
}
