# The Redacted Sky — PURSUE data ingestion work order

## Objective

Build a provenance-first, static data package for the website from all U.S. government PURSUE releases available as of 2026-07-17. Do not edit the website UI in this task. The output must let a later UI task render release summaries, filterable records, grouped case files, source assets, and location uncertainty without inventing missing facts.

## Verified release baseline

The official PURSUE page currently lists four release waves:

| Release | Cleared date | Official download sizes shown |
| --- | --- | --- |
| 01 | 2026-05-08 | Documents 1.2 GB / Videos 1.3 GB |
| 02 | 2026-05-22 | Documents 70.1 MB / Videos 5.6 GB |
| 03 | 2026-06-12 | Documents 826 MB / Videos 4.6 GB |
| 04 | 2026-07-10 | Documents 227 MB / Videos 1.4 GB |

Release 04 is the latest verified release as of this work order. The official page says additional tranches will be posted on a rolling basis, so the ingest must record `fetchedAt` and must not hard-code “latest” permanently.

Primary source: <https://www.war.gov/UFO/>

Release 01 bilingual community index and translations: <https://github.com/chinleez/uap-disclosure-2026>

Release 04 high-priority records visible in the official index include:

- `DOW-UAP-PR104` — unresolved video, Yellow Sea, 2025
- `DOW-UAP-PR105` — unresolved video, East China Sea, 2025
- `DOW-UAP-PR113` — unresolved video, Western United States, 1996
- `DOW-UAP-PR115` — unresolved video, Gulf of America, 2019
- `NASA-UAP-D030` through `D032` — STS-80 imagery, low-Earth orbit, 1996
- `DOE-UAP-D004` — Los Alamos conference on aerial phenomena, 1949
- `DOW-UAP-D094` — analysis of U.S. flying-object incidents, 1949
- `DOW-UAP-D097` — Project Sign progress report, 1948

Treat these as ingest priorities, not as claims about extraterrestrial origin.

## Deliverables

Create these deterministic UTF-8 JSON files:

```text
data/releases.json
data/records.json
data/cases.json
data/provenance.json
data/ingest-report.json
```

Also add a repeatable script:

```text
scripts/ingest-pursue-data.mjs
```

The script must be safe to rerun. It must preserve raw identifiers and source URLs, sort output deterministically, and never overwrite an editorial field with an inferred value without recording that inference.

## Record schema

Every government row or asset remains a `record` even when several records are grouped into one case.

```ts
type PursueRecord = {
  id: string;
  releaseId: "release-01" | "release-02" | "release-03" | "release-04";
  title: string;
  agency: string;
  fileType: "video" | "audio" | "image" | "pdf" | "other";
  releaseDate: string | null;
  incidentDate: string | null;
  incidentDatePrecision: "day" | "month" | "year" | "range" | "unknown";
  location: {
    label: string | null;
    lat: number | null;
    lng: number | null;
    precision: "exact" | "approximate" | "regional" | "withheld" | "unknown";
  };
  officialStatus: "unresolved" | "resolved" | "under-analysis" | "historical" | "not-stated";
  officialAssessment: string | null;
  descriptionOriginal: string | null;
  descriptionZh: string | null;
  sourcePageUrl: string;
  assetUrls: Array<{
    kind: "video" | "audio" | "image" | "thumbnail" | "pdf" | "other";
    url: string;
    mimeType: string | null;
    width: number | null;
    height: number | null;
    durationSeconds: number | null;
  }>;
  sourceHash: string;
};
```

## Case schema

A `case` is an editorial grouping of records that clearly refer to the same event or source package. Never assume one record equals one case.

```ts
type UapCase = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  eventDate: string | null;
  eventDatePrecision: PursueRecord["incidentDatePrecision"];
  location: PursueRecord["location"];
  agencies: string[];
  recordIds: string[];
  mediaKinds: PursueRecord["fileType"][];
  officialStatus: PursueRecord["officialStatus"];
  officialAssessment: string | null;
  evidenceCompleteness: "high" | "medium" | "low" | "unknown";
  featuredRank: number | null;
  groupingBasis: string;
  reconstructionAllowed: boolean;
  reconstructionDisclosure: string | null;
};
```

## Grouping rules

1. Group only when records share a named event/package, matching official identifier family, or a clearly matching incident date + region + description.
2. Preserve every original `recordId` inside the group.
3. Broad regional series such as “Middle East 2020” must not be collapsed into one event unless the official source links them.
4. NASA mission excerpts may group by mission and incident, but different mission dates remain separate cases.
5. Duplicated descriptions are not proof of a duplicated event.
6. Record the human-readable reason in `groupingBasis`.
7. When uncertain, keep records separate and add an ingest warning.

## Location policy

- Never geocode `Middle East`, `North America`, `Various`, `N/A`, or withheld locations to a precise point.
- Use `regional` for named broad areas and oceans.
- Use `withheld` when the source explicitly conceals the location.
- Coordinates may be added only when the official source provides them or a named place resolves unambiguously. Record the geocoding source in provenance.
- The future globe must render regional uncertainty as an area/halo, not a false pin.

## Status and interpretation policy

- Preserve official wording and probability qualifiers.
- “Unresolved” means the available official material does not support definitive attribution; it does not mean extraterrestrial.
- Keep `officialAssessment`, editorial summary, reconstruction, and future community vote as separate layers.
- Never promote user sentiment into an official status.
- Do not label a case `credible` or `debunked` unless that exact claim is sourced and attributed.

## Featured-case selection

Recommend 12–16 cases for the first gallery. Balance:

- Release wave (include Releases 01–04)
- Media type (video, image, audio, document)
- Era (1940s, NASA era, modern military sensor cases)
- Geography and location precision
- Official outcome (unresolved, resolved, under analysis)
- Visual impact and source completeness

Prioritize cases with playable official media plus at least one accompanying source document. Do not rank only by sensationalism.

## Provenance requirements

`provenance.json` must include:

- exact source URLs
- fetch timestamps
- HTTP status and final redirect URL
- source license/public-domain note
- parser version
- content hashes
- translation origin and license
- every manual override with reason

Government originals should be labeled public domain where applicable. Release 01 Chinese translations and index structure require attribution to `chinleez/uap-disclosure-2026` under CC BY 4.0.

## Validation and acceptance criteria

- All four releases appear in `releases.json`.
- Counts by release, agency, and file type are computed from data rather than copied into code.
- No duplicate record IDs.
- Every case references existing record IDs.
- Every asset URL is syntactically valid; sample-check at least 10% per media kind and all featured cases.
- Missing data stays `null`; do not use invented placeholders in normalized JSON.
- Dates are ISO-like where possible and retain precision separately.
- Regional/withheld locations have null coordinates.
- The ingest report lists parse failures, dead links, ambiguous groupings, and manual decisions.
- Outputs are deterministic across two consecutive runs.

## Out of scope

- Do not redesign the website.
- Do not build the Railway voting backend.
- Do not download the full multi-gigabyte media archives unless explicitly authorized; use metadata and original remote URLs for this pass.
- Do not publish or deploy.

## Handoff

When complete, report:

1. Record and case counts by release.
2. The 12–16 recommended featured cases.
3. Ambiguous groupings requiring Bubble/editorial review.
4. Dead or access-restricted assets.
5. Exact files changed and the command to rerun ingestion.
