/* eslint-disable @next/next/no-html-link-for-pages -- Native links preserve vinext navigation. */
import SiteNavigation from "./SiteNavigation";
import "../app/reading.css";

export default function ReadingLayout({ children }: { children: React.ReactNode }) {
  return <div className="reading-page">
    <a className="reading-skip" href="#reading-content">Skip to content</a>
    <header className="reading-header"><SiteNavigation current="archive" /></header>
    <main id="reading-content" className="reading-content">{children}</main>
    <footer className="reading-footer"><p>An independent guide to public records. Public release is not resolution.</p><nav aria-label="More about this archive"><a href="/archive">Explore archive</a><a href="/guide">New to UAP?</a><a href="/sources">Sources &amp; credits</a><a href="/cases">Case directory</a></nav></footer>
  </div>;
}
