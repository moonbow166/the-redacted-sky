import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", { headers: { accept: "text/html" } }),
    { ASSETS: { fetch: async () => new Response("Not found", { status: 404 }) } },
    { waitUntil() {}, passThroughOnException() {} },
  );
}

test("server-renders the finished UAP experience", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>The Redacted Sky — 天空被涂黑的部分<\/title>/i);
  assert.match(html, /334 OFFICIAL RECORD ROWS/);
  assert.match(html, /279 EDITORIALLY GROUPED CASES/);
  assert.match(html, /APPROACH/);
  assert.match(html, /THE UNKNOWN/);
  assert.match(html, /THEN THE/);
  assert.match(html, /SENSORS SPOKE/);
  assert.match(html, /MOVE BEFORE/);
  assert.match(html, /YOU DECIDE/);
  assert.match(html, /THREE SIGNALS/);
  assert.match(html, /RETURN TO THE FIELD/);
  assert.match(html, /og-v8\.png/);
  assert.doesNotMatch(html, /codex-preview|Codex is working|Your site is taking shape/i);

  const fieldIndex = html.indexOf("01 / THE FIELD");
  const demosIndex = html.indexOf("02 / THREE SIGNALS");
  const overviewIndex = html.indexOf("04 / NOW, THE SCALE");
  assert.ok(fieldIndex > 0 && demosIndex > fieldIndex && overviewIndex > demosIndex);
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
  assert.equal(records.length, 334);
  assert.equal(cases.length, 279);
  assert.equal(releases.length, 4);
  assert.equal(cases.filter((item) => item.featuredRank !== null).length, 15);
  assert.equal(new Set(records.map((item) => item.id)).size, records.length);
  assert.match(page, /archiveRecords\.length/);
  assert.match(page, /featuredSignals/);
  assert.match(page, /TARGET LOCK/);
  assert.match(page, /WHAT DO YOU THINK YOU SAW/);
  assert.match(page, /CONTINUE TO SIGNAL/);
  assert.match(scene, /recordKinds\.length/);
  assert.match(scene, /Hero reconstruction/);
});
