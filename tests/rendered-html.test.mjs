import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render(pathname = "/") {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request(`http://localhost${pathname}`, { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished UAP experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = (await response.text()).replace(/<!--[\s\S]*?-->/g, "");
  assert.match(html, /<title>The Redacted Sky \| Declassified UAP Archive<\/title>/i);
  assert.match(html, /450 OFFICIAL RECORD ROWS/);
  assert.match(html, /387 EDITORIALLY GROUPED CASE FILES/);
  assert.match(html, /APPROACH/);
  assert.match(html, /THE UNKNOWN/);
  assert.match(html, /THEN THE/);
  assert.match(html, /SENSORS SPOKE/);
  assert.match(html, /MOVE BEFORE/);
  assert.match(html, /YOU DECIDE/);
  assert.match(html, /THREE SIGNALS/);
  assert.match(html, /RETURN TO THE FIELD/);
  assert.match(html, /Choose site mode/);
  assert.match(html, /DECLASSIFIED UAP ARCHIVE/);
  assert.match(html, /SOUND\s*(?:<!-- -->)?\s*START/);
  assert.match(html, /og-v8\.png/);
  assert.doesNotMatch(html, /codex-preview|Codex is working|Your site is taking shape/i);

  const fieldIndex = html.indexOf("01 / THE FIELD");
  const demosIndex = html.indexOf("02 / THREE SIGNALS");
  const overviewIndex = html.indexOf("04 / NOW, THE SCALE");
  assert.ok(fieldIndex > 0 && demosIndex > fieldIndex && overviewIndex > demosIndex);
});

test("server-renders the searchable case archive", async () => {
  const response = await render("/archive");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = (await response.text()).replace(/<!--[\s\S]*?-->/g, "");
  assert.match(html, /<title>UAP Case Archive \| The Redacted Sky<\/title>/i);
  assert.match(html, /rel="canonical" href="http:\/\/localhost(?::3000)?\/archive"/i);
  assert.match(html, /OPEN THE/);
  assert.match(html, /EVIDENCE/);
  assert.match(html, /387 case files/);
  assert.match(html, /Search the archive/);
  assert.match(html, /Featured first/);
  assert.match(html, /Inspect footage/);
  assert.match(html, /Load[\s\S]*24[\s\S]*more case files/);
  assert.match(html, /Release 06/);
  assert.match(html, /116 records added since July/);
  assert.match(html, /<dialog/);
  assert.match(html, /Surprise me/);
  assert.match(html, /PRIMARY SOURCE \/ U\.S\. GOVERNMENT PURSUE/);
  assert.match(html, /Choose site mode/);
  assert.match(html, /aria-current="page"[^>]*>[\s\S]*DECLASSIFIED UAP ARCHIVE/);
});

test("ships the complete deterministic archive dataset", async () => {
  const [recordsText, casesText, releasesText, page, scene] = await Promise.all([
    readFile(new URL("../data/records.json", import.meta.url), "utf8"),
    readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
    readFile(new URL("../data/releases.json", import.meta.url), "utf8"),
    readFile(new URL("../app/page.tsx", import.meta.url), "utf8"),
    readFile(new URL("../components/SkyScene.tsx", import.meta.url), "utf8"),
  ]);

  const records = JSON.parse(recordsText);
  const cases = JSON.parse(casesText);
  const releases = JSON.parse(releasesText);
  assert.equal(records.length, 450);
  assert.equal(cases.length, 387);
  assert.equal(releases.length, 6);
  assert.deepEqual(releases.map(release => release.recordCount), [158,64,72,40,41,75]);
  assert.equal(cases.filter((item) => item.featuredRank !== null).length, 15);
  assert.equal(new Set(records.map((item) => item.id)).size, records.length);
  const groupedIds = cases.flatMap(item => item.recordIds);
  assert.equal(groupedIds.length, records.length);
  assert.equal(new Set(groupedIds).size, records.length);
  assert.ok(records.find(item => item.id === "LLE-UAP-PR004").metadataNote.includes("October 2023"));
  assert.equal(records.find(item => item.id === "DOW-UAP-PR160").fileType, "audio");
  assert.equal(cases.find(item => item.id === "case-tremonton-film-1952").recordIds.length, 4);
  assert.match(page, /archiveRecords\.length/);
  assert.match(page, /featuredSignals/);
  assert.match(page, /TARGET LOCK/);
  assert.match(page, /WHAT DO YOU THINK YOU SAW/);
  assert.match(page, /CONTINUE TO SIGNAL/);
  assert.match(scene, /recordKinds\.length/);
  assert.match(scene, /Hero reconstruction/);
});
