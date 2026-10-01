/* eslint-disable @next/next/no-html-link-for-pages -- Native links preserve vinext navigation. */
import ArchiveIcon from "./ArchiveIcon";

export default function SiteNavigation({ current }: { current: "experience" | "archive" }) {
  return <div className="site-navigation">
    <a href="/" className="site-wordmark"><span className="brand-mark" aria-hidden="true" />The Redacted Sky</a>
    <nav className="site-mode-switch" aria-label="Choose site mode">
      <a href="/" className={current === "experience" ? "is-active" : ""} aria-current={current === "experience" ? "page" : undefined}><ArchiveIcon kind="field" /><span>Experience</span></a>
      <a href="/archive" className={current === "archive" ? "is-active" : ""} aria-current={current === "archive" ? "page" : undefined}><ArchiveIcon kind="compass" /><span>Explore archive</span></a>
    </nav>
  </div>;
}
