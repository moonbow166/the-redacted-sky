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
  assert.match(html, /450 source records, grouped into 387 case files/);
  assert.match(html, /A sky full/);
  assert.match(html, /Look closer/);
  assert.match(html, /What do you see/);
  assert.match(html, /Enter the field/);
  assert.match(html, /Find a story/);
  assert.match(html, /Return to the field/);
  assert.match(html, /Choose site mode/);
  assert.match(html, /Explore archive/);
  assert.match(html, /Sound off/);
  for (const kind of ["video", "image", "audio", "pdf"]) {
    assert.match(html, new RegExp(`href="/archive\\?media=${kind}"`));
  }
  assert.match(html, /Watch the footage/);
  assert.match(html, /Hear the voices/);
  assert.match(html, /Follow the paper trail/);
  assert.match(html, /og-v8\.png/);
  assert.doesNotMatch(html, /codex-preview|Codex is working|Your site is taking shape/i);

  const fieldIndex = html.indexOf('id="field"');
  const demosIndex = html.indexOf('id="signals"');
  const overviewIndex = html.indexOf('id="releases"');
  assert.ok(fieldIndex > 0 && demosIndex > fieldIndex && overviewIndex > demosIndex);
});

test("server-renders curated journeys with access to the full case archive", async () => {
  const response = await render("/archive");
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = (await response.text()).replace(/<!--[\s\S]*?-->/g, "");
  assert.match(html, /<title>UAP Case Archive \| The Redacted Sky<\/title>/i);
  assert.match(html, /rel="canonical" href="http:\/\/localhost(?::3000)?\/archive"/i);
  assert.match(html, /Follow your curiosity/);
  assert.match(html, /Curated journeys/);
  assert.match(html, /Search all records/);
  assert.match(html, /10 curious starting points/);
  assert.match(html, /Let me listen/);
  assert.match(html, /Give me a rabbit hole/);
  assert.match(html, /Why start here/);
  assert.match(html, /not a credibility ranking/);
  assert.equal((html.match(/aria-label="Explore /g) ?? []).length, 10);
  assert.match(html, /class="library-index"[^>]*hidden/);
  assert.match(html, /387 case files/);
  assert.match(html, /Search the archive/);
  assert.match(html, /Featured first/);
  assert.match(html, /Inspect footage/);
  assert.match(html, /Load[\s\S]*24[\s\S]*more case files/);
  assert.match(html, /Release 06/);
  assert.match(html, /<dialog/);
  assert.match(html, /Surprise me/);
  assert.match(html, /Primary source: U\.S\. government PURSUE/);
  assert.match(html, /Choose site mode/);
  assert.match(html, /aria-current="page"[^>]*>[\s\S]*Explore archive/);
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
  assert.match(page, /What do you think you saw/);
  assert.match(page, /Explore the next signal/);
  assert.match(scene, /recordKinds\.length/);
  assert.match(scene, /Hero reconstruction/);
});

test("every editorial story points to a material in its real source case", async () => {
  const [picksText, recordsText, casesText] = await Promise.all([
    readFile(new URL("../lib/explore.ts", import.meta.url), "utf8"),
    readFile(new URL("../data/records.json", import.meta.url), "utf8"),
    readFile(new URL("../data/cases.json", import.meta.url), "utf8"),
  ]);
  const records = JSON.parse(recordsText);
  const cases = JSON.parse(casesText);
  const picks = [...picksText.matchAll(/caseId: "([^"]+)"[^\n]+recordId: "([^"]+)"/g)];
  assert.equal(picks.length, 10);
  assert.equal(new Set(picks.map(match => match[1])).size, 10);
  for (const [, caseId, recordId] of picks) {
    const caseFile = cases.find(item => item.id === caseId);
    assert.ok(caseFile, `Missing editorial case: ${caseId}`);
    assert.ok(caseFile.recordIds.includes(recordId), `${recordId} does not belong to ${caseId}`);
    assert.ok(records.some(item => item.id === recordId), `Missing material: ${recordId}`);
  }
});
