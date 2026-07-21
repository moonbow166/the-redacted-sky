# The Redacted Sky

**An immersive interface for exploring newly released UAP records without turning uncertainty into certainty.**

[Launch the experience](https://the-redacted-sky.moonbow166.chatgpt.site/)

[Browse the 279-case archive](https://the-redacted-sky.moonbow166.chatgpt.site/archive)

[View the Build Week project draft](https://devpost.com/software/the-redacted-sky)

The Redacted Sky transforms a dense government disclosure archive into a cinematic, evidence-first experience. Visitors begin with an unidentified form, descend into a spatial field of records, capture three featured video signals, inspect the source context, and make their own assessment.

The experience never labels a reconstruction as evidence and never presents release as resolution.

## Why this exists

Recently released UAP material is technically public but difficult to explore. It is distributed across hundreds of videos, images, PDFs, audio files, terse descriptions, missing coordinates, and uneven metadata.

The Redacted Sky asks a simple design question:

> What if public disclosure felt explorable without becoming sensationalized?

The result is part interactive documentary, part public-data interface, and part media-literacy exercise. Its goal is not to decide what a user saw. Its goal is to make the boundary between observation, source material, reconstruction, and interpretation visible.

## The experience

1. **Encounter:** approach a realistic 3D UAP reconstruction clearly labeled as non-evidence.
2. **Field:** enter a deep-space visualization containing all 334 official record rows.
3. **Capture:** hover and lock onto live video signals embedded in the field.
4. **Declassify:** open a cinematic evidence chapter with official footage and source context.
5. **Judge:** record a device-local assessment: Ordinary, Sensor Ambiguity, Insufficient, or Anomalous.
6. **Scale:** reveal the full archive: 334 records grouped into 279 editorial cases across four releases.
7. **Investigate:** search and filter every grouped case, inspect its official records, and share a direct case link.

Three featured signals form the polished demo path:

- Yellow Sea, 2025: “The Six-Point Signal”
- East China Sea, 2025: “The Centered Object”
- Western United States, 1996: “The Lost Sensor Record”

## What is technically distinctive

- A deterministic ingestion pipeline normalizes four official releases into reproducible JSON.
- 334 official rows are represented as interactive Three.js artifacts rather than decorative particles.
- 103 videos, 27 images, 189 PDFs, and 15 audio records retain their source types.
- Missing coordinates remain missing; no locations are invented to make a map look complete.
- Featured evidence uses live official media URLs while reconstructed craft remain explicitly labeled.
- The cinematic case flow is stateful but privacy-preserving: assessments remain in local browser storage.
- A separate case archive makes all 279 grouped cases searchable by title, location, year, agency, media type, and keyword.
- Every case opens into a shareable deep link with its source records and official release assets.
- The deployment is a Cloudflare-compatible React server build hosted with OpenAI Codex Sites.

## Data integrity

The primary index is the U.S. government PURSUE release page. The dataset includes:

- **334 records**
- **279 grouped cases**
- **4 releases**
- **15 featured cases**
- **0 confirmed 404/410 media links** during ingestion validation

The official browser-rendered rows were verified against the release index. Descriptions and asset URLs were enriched from a public mirror when direct non-browser retrieval was restricted. Release 01 Chinese translations are attributed to [`chinleez/uap-disclosure-2026`](https://github.com/chinleez/uap-disclosure-2026) under CC BY 4.0. No third-party scoring or conclusions were imported.

Full provenance, normalization policies, hashes, and manual grouping decisions live in [`data/provenance.json`](data/provenance.json) and [`data/ingest-report.json`](data/ingest-report.json).

## Built with Codex and GPT-5.6

GPT-5.6 Sol High inside Codex was the design-engineering collaborator across the project, not a final code generator. The workflow included:

- turning an emotional visual direction into a staged interaction system;
- iterating on six 3D UAP morphologies and the deep-space evidence field;
- building and validating the deterministic ingestion pipeline;
- making evidence/reconstruction boundaries explicit in product language;
- diagnosing interaction hierarchy through repeated hover and click tests;
- shaping the final three-signal golden path under the Build Week deadline;
- running build, render, dataset, and deployment checks after each major cut.

The model translated subjective visual feedback into concrete Three.js and interaction changes, reasoned across the complete 334-record dataset, and helped compress a broad product vision into a polished three-signal path under deadline. The commit history preserves the evolution from prototype to the cinematic Build Week cut.

Primary Codex task Session ID: `019f6951-7262-7600-a63a-4faeeca4458f`

## Architecture

- Next.js 16 / React 19
- Three.js
- TypeScript
- vinext / Vite
- Static, deterministic JSON archive
- OpenAI Codex Sites
- Cloudflare Workers-compatible output

No backend is required for the current phase. The complete archive ships with the application, and personal assessments use browser-local storage.

## Run locally

Prerequisites: Node.js `>=22.13.0`

```bash
npm install
npm run dev
```

Open the local URL printed in the terminal.

To run the production build and archive checks:

```bash
npm test
```

To regenerate the normalized archive from its pinned source snapshot:

```bash
npm run ingest:pursue
```

## How to test the golden path

1. Open the deployed experience on desktop with sound enabled.
2. Scroll once from the hero into **Field**.
3. Hover a large video object until `VIDEO READY · CLICK TO OPEN EVIDENCE` appears.
4. Click to trigger target capture and declassification.
5. Watch the official video, inspect its metadata, and choose an assessment.
6. Use `CONTINUE TO SIGNAL` to move through the three featured cases.
7. Close the file and continue scrolling to see the full archive scale.
8. Open the **279-case archive**, search or filter the index, and copy a direct case link.

## Scope and next steps

The cinematic path deliberately perfects three cases instead of pretending all 279 deserve identical editorial treatment. The searchable index provides access to the complete archive without crowding the 3D Field. Future work can add an interactive globe, timeline, cross-case relationships, and opt-in aggregate voting.

## Sources and attribution

- Primary official source: [U.S. government PURSUE](https://www.war.gov/UFO/)
- Auxiliary public mirror: [pursue.report](https://pursue.report/)
- Chinese index and Release 01 translations: [chinleez/uap-disclosure-2026](https://github.com/chinleez/uap-disclosure-2026), CC BY 4.0

Official records remain subject to their per-asset markings. The Redacted Sky adds no extraterrestrial conclusion or official analytical judgment.

## License

The application code is available under the [MIT License](LICENSE). Government records, third-party media, translations, and source data retain their original terms and per-asset markings as described above.
