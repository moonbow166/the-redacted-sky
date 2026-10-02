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
  assert.doesNotMatch(html, /Sound off|Sound on|Start ambient signal|chinleez/);
  assert.match(html, /href="\/sources"/);
  assert.match(html, /href="\/guide"/);
  assert.match(html, /rel="canonical" href="https:\/\/the-redacted-sky\.moonbow166\.chatgpt\.site\/"/);
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
  assert.match(html, /rel="canonical" href="https:\/\/the-redacted-sky\.moonbow166\.chatgpt\.site\/archive"/i);
  assert.match(html, /Follow your curiosity/);
  assert.match(html, /Curated journeys/);
  assert.match(html, /Search all records/);
  assert.match(html, /Start with a question/);
  assert.match(html, /Can cameras fool us/);
  assert.match(html, /What did people report/);
  assert.match(html, /How was it investigated/);
  assert.match(html, /Follow the film/);
  assert.match(html, /href="\/explore\/tremonton-1952"/);
  assert.match(html, /not a credibility ranking/);
  assert.equal((html.match(/aria-label="Explore /g) ?? []).length, 10);
  assert.equal((html.match(/<a href="\/cases\/[^\"]+"[^>]*class="curiosity-(?:lead|card)"/g) ?? []).length, 9);
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
  assert.doesNotMatch(page, /AudioContext|createAmbientAudio|soundOn|sound-toggle/);
  assert.match(scene, /recordKinds\.length/);
  assert.match(scene, /Hero reconstruction/);
});

function structuredData(html) {
  return [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
}

test("serves crawlable case pages with matching canonical, source text and structured data", async () => {
  const cases = JSON.parse(await readFile(new URL("../data/cases.json", import.meta.url), "utf8"));
  const records = JSON.parse(await readFile(new URL("../data/records.json", import.meta.url), "utf8"));
  const wanted = ["DOW-UAP-PR104", "NASA-UAP-D003A", "NASA-UAP-D030", "DOE-UAP-D004", "DOW-UAP-PR159", "LLE-UAP-PR004", "LLE-UAP-D002"];
  for (const recordId of wanted) {
    const entry = cases.find(item => item.recordIds.includes(recordId));
    assert.ok(entry, recordId);
    const response = await render(`/cases/${entry.slug}`);
    assert.equal(response.status, 200, entry.slug);
    const html = await response.text();
    assert.match(html, /What the source says/);
    assert.match(html, /How this case is grouped/);
    assert.ok(html.includes(`rel="canonical" href="https://the-redacted-sky.moonbow166.chatgpt.site/cases/${entry.slug}"`));
    const schema = structuredData(html).find(item => item["@type"] === "CollectionPage");
    assert.equal(schema.mainEntity.numberOfItems, entry.recordIds.length);
    assert.deepEqual(schema.mainEntity.itemListElement.map(item => item.item.identifier), entry.recordIds);
    const record = records.find(item => item.id === recordId);
    assert.ok(schema.citation.includes(record.sourcePageUrl));
    assert.equal(schema.mainEntity.itemListElement.find(item => item.item.identifier === recordId).item.description, record.descriptionOriginal.replaceAll("\u2014", ","));
    if (recordId === "LLE-UAP-PR004") assert.match(html, /Source discrepancy:/);
    if (recordId === "LLE-UAP-D002") assert.match(html, /A direct file link has not been verified/);
  }
  assert.equal((await render("/cases/not-a-real-case")).status, 404);
});

test("sitemap and directory expose every unique case without requiring JavaScript", async () => {
  const cases = JSON.parse(await readFile(new URL("../data/cases.json", import.meta.url), "utf8"));
  assert.equal(new Set(cases.map(item=>item.slug)).size, cases.length);
  const sitemap = await render("/sitemap.xml");
  assert.equal(sitemap.status, 200);
  assert.match(sitemap.headers.get("content-type"), /application\/xml/);
  const xml = await sitemap.text();
  assert.equal((xml.match(/<loc>/g) ?? []).length, cases.length + 6);
  assert.ok(xml.includes('/explore/tremonton-1952</loc>'));
  const directory = await render("/cases");
  assert.equal(directory.status, 200);
  const html = await directory.text();
  for (const entry of cases) {
    assert.ok(xml.includes(`/cases/${entry.slug}</loc>`), entry.slug);
    assert.ok(html.includes(`href="/cases/${entry.slug}"`), entry.slug);
  }
  const robots = await render("/robots.txt");
  assert.equal(robots.status, 200);
  assert.match(await robots.text(), /User-agent: \*\nAllow: \/[\s\S]*Sitemap: https:\/\/the-redacted-sky\.moonbow166\.chatgpt\.site\/sitemap.xml/);
});

test("keeps attribution discoverable and newcomer answers server-readable", async () => {
  const sources = await render("/sources");
  assert.equal(sources.status, 200);
  const sourceHtml = await sources.text();
  assert.match(sourceHtml, /HISTORICAL-CREDITS.md/);
  assert.match(sourceHtml, /independently collected/);
  assert.match(sourceHtml, /not reviewed every PDF page/);
  assert.match(sourceHtml, /October 1, 2026/);
  const historical = await readFile(new URL('../data/source/HISTORICAL-CREDITS.md', import.meta.url), 'utf8');
  assert.match(historical, /chinleez\/uap-disclosure-2026/);
  assert.match(historical, /creativecommons.org\/licenses\/by\/4.0/);
  const guide = await render("/guide");
  assert.equal(guide.status, 200);
  const guideHtml = await guide.text();
  assert.match(guideHtml, /What does UAP mean/);
  assert.match(guideHtml, /Are the 3D objects real evidence/);
  assert.match(guideHtml, /https:\/\/science.nasa.gov\/uap\/faqs\//);
});

test("current dataset is independently sourced without mirror text or media", async () => {
  const records = JSON.parse(await readFile(new URL('../data/records.json', import.meta.url), 'utf8'));
  const capture = JSON.parse(await readFile(new URL('../data/source/pursue.official-capture.json', import.meta.url), 'utf8'));
  const media = JSON.parse(await readFile(new URL('../data/source/pursue.official-media.json', import.meta.url), 'utf8'));
  assert.equal(capture.records.length, records.length);
  assert.equal(media.records.length, 32);
  const allowed = new Set(['www.war.gov', 'd34w7g4gy10iej.cloudfront.net', 'd1ldvf68ux039x.cloudfront.net']);
  for (const record of records) {
    const raw = capture.records.find(row => row.title === record.title);
    assert.ok(raw, record.id);
    assert.equal(record.descriptionOriginal, raw.description.replace(/\u00a0/g, ' ').replace(/[ \t]+/g, ' ').trim());
    assert.equal(record.captureHash, raw.captureHash);
    assert.equal(record.descriptionZh, null);
    assert.equal(record.sourceAttribution, 'war-pursue-independent-20261002');
    for (const asset of record.assetUrls) assert.ok(allowed.has(new URL(asset.url).hostname), asset.url);
  }
});

test("guided film path is source-linked, accessible and server-readable", async () => {
  const response = await render('/explore/tremonton-1952');
  assert.equal(response.status, 200);
  const html = await response.text();
  for (const id of ['watch', 'cut', 'compare', 'limits']) assert.ok(html.includes(`id="${id}"`));
  assert.match(html, /Find the cut/);
  assert.match(html, /Official digitization/);
  assert.match(html, /controls/);
  assert.match(html, /DOD_111985807\.mp4/);
  assert.match(html, /not a photograph of the reported objects/);
  assert.match(html, /not an exhaustive review/);
  assert.match(html, /href="\/archive\?trail=camera"/);
  const schema = structuredData(html).find(item => item['@type'] === 'Article');
  assert.equal(schema.citation.length, 4);
  assert.equal(schema.url, 'https://the-redacted-sky.moonbow166.chatgpt.site/explore/tremonton-1952');
  assert.doesNotMatch(html, /media\.uap\.silv\.app|\u2014/);
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
