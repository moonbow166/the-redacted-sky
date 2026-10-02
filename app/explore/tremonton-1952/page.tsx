/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element -- Native source-linked reading path. */
import SiteNavigation from "../../../components/SiteNavigation";
import ArchiveIcon from "../../../components/ArchiveIcon";
import StructuredData from "../../../components/StructuredData";
import TremontonPlayer from "../../../components/TremontonPlayer";
import { archiveCases, archiveRecords, primaryAsset, previewAsset } from "../../../lib/archive";
import { absoluteUrl, casePath, pageMetadata, readableText } from "../../../lib/site";
import "../../archive/archive.css";
import "./path.css";

export const metadata = pageMetadata("The 1952 film with a missing piece", "Watch the Tremonton film, notice its unexpected cut, and compare the official investigation records. A short, source-linked UAP exploration.", "/explore/tremonton-1952");
const getRecord = (id: string) => archiveRecords.find(record => record.id === id)!;
const film = getRecord("DOW-UAP-PR159");
const analysis = getRecord("DOW-UAP-D098");
const investigation = getRecord("DOW-UAP-D102");
const photos = getRecord("DOW-UAP-D103");
const caseFile = archiveCases.find(entry => entry.recordIds.includes(film.id))!;
const pathRecords = [film, analysis, investigation, photos];

function Source({ id, children }: { id: string; children: React.ReactNode }) {
  return <a className="path-source" href={getRecord(id).sourcePageUrl} target="_blank" rel="noreferrer">{children} <span aria-hidden="true">↗</span></a>;
}
function Summary({ id, label }: { id: string; label: string }) {
  const record = getRecord(id);
  return <details className="path-detail"><summary>{label}</summary><div>{readableText(record.descriptionOriginal).split(/\n\s*\n/).map((paragraph, index) => <p key={index}>{paragraph}</p>)}<Source id={id}>{id} on PURSUE</Source></div></details>;
}

export default function TremontonPath() {
  return <div className="evidence-library exploration-path">
    <a className="library-skip" href="#watch">Skip to the film</a>
    <header className="archive-system-bar"><SiteNavigation current="archive" /></header>
    <StructuredData value={{ "@context": "https://schema.org", "@type": "Article", headline: "The 1952 film with a missing piece", description: "An editorial exploration of the Tremonton film and official release summaries, not an independent finding about the objects.", inLanguage: "en", url: absoluteUrl("/explore/tremonton-1952"), datePublished: "2026-10-02", isPartOf: { "@id": absoluteUrl("/#website") }, citation: pathRecords.map(record => record.sourcePageUrl), about: { "@type": "Event", name: "Tremonton film", startDate: "1952-07-02", location: { "@type": "Place", name: "Tremonton, Utah" } } }} />
    <main className="path-container">
      <header className="path-intro"><a href="/archive">← All starting points</a><h1>The film has<br />a missing piece.</h1><p>Utah, 1952. Bright points in the sky.<br />Then the reel takes an unexpected turn.<small>A guided exploration · About 5 minutes</small></p></header>
      <nav className="path-stations" aria-label="Steps in this exploration"><a href="#watch"><ArchiveIcon kind="video" /><span>Watch</span></a><a href="#cut"><ArchiveIcon kind="compass" /><span>Notice</span></a><a href="#compare"><ArchiveIcon kind="pdf" /><span>Compare</span></a><a href="#limits"><ArchiveIcon kind="search" /><span>Question</span></a></nav>
      <section id="watch" className="path-watch" aria-labelledby="watch-title"><div className="path-section-heading"><span className="path-number">01</span><div><h2 id="watch-title">What do you see?</h2><p>Start with the film. No verdict yet.</p></div></div><TremontonPlayer src={primaryAsset(film)!.url} poster="/source-images/tremonton-official-preview.jpg" sourceUrl={film.mediaSourcePageUrl ?? film.sourcePageUrl} /><Source id={film.id}>Film: DOW-UAP-PR159</Source></section>
      <section id="cut" className="path-section" aria-labelledby="cut-title"><div className="path-section-heading"><span className="path-number">02</span><div><h2 id="cut-title">Wait. Is this the same reel?</h2><p>A change in the film becomes a clue of its own.</p></div></div>
        <div className="path-reel" aria-label="The digitized film shows bright objects before an unrelated sewing-equipment sequence at about 55 seconds"><div><ArchiveIcon kind="field" /><span>Bright objects<small>Start of the released film</small></span></div><span className="path-splice">0:55<br /><b>Cut</b></span><div><ArchiveIcon kind="video" /><span>Sewing equipment<small>Unrelated footage</small></span></div></div>
        <div className="path-two-up"><div><h3>What the official record says</h3><p>The submitted reel originally included mountain scenery from Idaho. That scenery is not in this digitization.</p><Source id={investigation.id}>Investigation summary: D102</Source></div><div><h3>What remains unknown</h3><p>The surviving print may be a composite or a reused print. The record does not establish when or how the footage was combined.</p><Source id={film.id}>Film summary: PR159</Source></div></div><Summary id={film.id} label="Read the film’s official release summary (PR159)" />
      </section>
      <section id="compare" className="path-section" aria-labelledby="compare-title"><div className="path-section-heading"><span className="path-number">03</span><div><h2 id="compare-title">How did the explanations change?</h2><p>Different documents preserve different assessments.</p></div></div>
        <div className="path-comparison"><figure><img src={previewAsset(photos)?.url} alt="Official preview from the Blue Book photo file showing a balloon demonstration." loading="lazy" /><figcaption>Comparison material from D103. This is not a photograph of the reported objects.</figcaption><a href={primaryAsset(photos)?.url ?? photos.sourcePageUrl} target="_blank" rel="noreferrer">Open the photo file ↗</a></figure><div className="path-assessments"><article><h3>An unusual result, with limits.</h3><span>Naval film analysis · 1953</span><p>Reviewing both the Utah and Montana films, naval analysts tentatively found features inconsistent with natural phenomena or familiar aircraft. They called for more work to test that view.</p><Source id={analysis.id}>Read the context in D098</Source></article><article><h3>Birds became the favored explanation.</h3><span>Air Force investigation · Evolving assessment</span><p>Earlier work considered birds, balloons and a mirage. Later assessments leaned toward seabirds reflecting sunlight.</p><Source id={investigation.id}>Follow the assessment in D102</Source></article></div></div>
        <details className="path-detail"><summary>And what about balloons?</summary><div><p>The photo-file summary describes consultation with General Mills about pillow balloons. Most participants thought the appearance and motion fit, but one raised reservations. Investigators found no matching release.</p><p>Even the camera mattered: calculations based on a perfectly still camera were questioned.</p><Source id={photos.id}>Official summary: D103</Source></div></details><Summary id={analysis.id} label="Read the naval analysis release summary (D098)" /><Summary id={investigation.id} label="Read the Air Force investigation release summary (D102)" />
      </section>
      <section id="limits" className="path-section path-ending" aria-labelledby="limits-title"><div className="path-section-heading"><span className="path-number">04</span><div><h2 id="limits-title">A bright point is not a measurement.</h2><p>What would you need before calling something fast, large or far away?</p></div></div>
        <div className="path-two-up path-evidence-boundary"><div><ArchiveIcon kind="video" /><h3>In the record</h3><ul><li>A witness report and a surviving film</li><li>Different explanations considered</li><li>A visible cut to unrelated footage</li></ul></div><div><ArchiveIcon kind="search" /><h3>Not established by this film alone</h3><ul><li>Reliable distance or size</li><li>Reliable altitude or linear speed</li><li>A conclusive identification</li></ul></div></div><p className="path-boundary-note">The official summary says the lack of detail and fixed reference points limits these measurements. “Unidentified” does not mean “extraterrestrial.” <Source id={investigation.id}>Source: D102</Source></p>
        <h3 className="path-next-heading">Which clue would you follow?</h3><div className="path-branches"><a href={`${casePath(caseFile.slug)}#DOW-UAP-D102`}><ArchiveIcon kind="pdf" /><span><strong>The reel’s history</strong><small>Read the investigation record</small></span><span aria-hidden="true">→</span></a><a href="/archive?trail=camera"><ArchiveIcon kind="video" /><span><strong>What the camera changes</strong><small>Find another visual puzzle</small></span><span aria-hidden="true">→</span></a></div>
        <p className="path-method">Our questions and connections are editorial. Source statements here come from the official release summaries, not an exhaustive review of every page in the underlying files. <a href="/sources">Sources and method</a></p>
      </section>
    </main>
  </div>;
}
