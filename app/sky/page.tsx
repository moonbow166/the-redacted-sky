import SiteNavigation from "../../components/SiteNavigation";
import MySky from "../../components/MySky";
import { makeSkyClues, makeSourceConnections } from "../../lib/my-sky";
import { pageMetadata } from "../../lib/site";
import "../archive/archive.css";
import "./sky.css";

export const metadata = pageMetadata("My sky", "Keep real UAP materials, compare clues, and build a personal constellation of questions. A gentle, source-linked exploration with no right answers.", "/sky");

export default function MySkyPage() {
  return <div className="evidence-library sky-page">
    <a className="library-skip" href="#sky-workbench">Skip to the clues</a>
    <header className="archive-system-bar"><SiteNavigation current="archive" /></header>
    <MySky clues={makeSkyClues()} sourceConnections={makeSourceConnections()} />
  </div>;
}
