# The Redacted Sky

**An immersive interface for exploring newly released UAP records without turning uncertainty into certainty.**

[Launch the experience](https://the-redacted-sky.moonbow166.chatgpt.site/)

[Browse the 387-case archive](https://the-redacted-sky.moonbow166.chatgpt.site/archive)

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
2. **Field:** enter a deep-space visualization of the official record collection.
3. **Capture:** hover and lock onto live video signals embedded in the field.
4. **Declassify:** open a cinematic evidence chapter with official footage and source context.
5. **Judge:** record a device-local assessment: Ordinary, Sensor Ambiguity, Insufficient, or Anomalous.
6. **Scale:** reveal the full archive: 450 records grouped into 387 editorial cases across six releases.
7. **Explore:** follow ten editorial starting points through footage, voices and connected documents, or search every grouped case and share a direct case link.

Three featured signals form the polished demo path:

- Yellow Sea, 2025: “The Six-Point Signal”
- East China Sea, 2025: “The Centered Object”
- Western United States, 1996: “The Lost Sensor Record”

## What is technically distinctive

- A deterministic ingestion pipeline normalizes six official releases into reproducible JSON.
- Official records inform the interactive Three.js field without overwhelming its curated video path.
- 134 videos, 30 images, 270 PDFs, and 16 audio records retain their source types.
- Missing coordinates remain missing; no locations are invented to make a map look complete.
- Featured evidence uses live official media URLs while reconstructed craft remain explicitly labeled.
- The cinematic case flow is stateful but privacy-preserving: assessments remain in local browser storage.
- A visual case archive makes all 387 grouped cases searchable by title, location, year, agency, media type, and keyword.
- Every case opens into a shareable deep link with a switcher for all its source materials, not just its first record.
- Video and image previews, an audio player, optional PDF embedding, release filters, and a random-case entry make the material easier to explore.
- The persistent header switches directly between the cinematic Experience and searchable Archive.
- Four curiosity paths offer ten source-backed editorial stories, each with a reason to look closer, an open question and a next-story suggestion.
- Shared media icons and real archive previews turn the numerical overview into four direct entrances: video, images, audio and documents.
- User-activated Web Audio provides a stage-responsive ambient signal without misleading autoplay state.
- The deployment is a Cloudflare-compatible React server build hosted with OpenAI Codex Sites.

## Data integrity

The primary index is the U.S. government PURSUE release page. The dataset includes:

- **450 records**
- **387 grouped cases**
- **6 releases**, with 158 / 64 / 72 / 40 / 41 / 75 records
- **15 featured cases**

On October 1, 2026, all 116 Release 05 and 06 index rows were checked in the official browser-rendered archive. Release 05 was announced August 7; Release 06 was announced September 18. The older 334 rows retain their July 18 verification history rather than being represented as newly rechecked. Descriptions and asset URLs were enriched from pursue.report for Releases 01–04 and uap.silv.app for Releases 05–06 when direct retrieval was restricted. Mirror-hosted media is labeled in the viewer; its bytes have not been verified against official originals. Release 01 Chinese translations are attributed to [`chinleez/uap-disclosure-2026`](https://github.com/chinleez/uap-disclosure-2026) under CC BY 4.0. No third-party scoring or conclusions were imported.

Three new Colorado transcripts (LLE-UAP-D002, D003, and D004) have verified official record links and descriptions but no verified direct PDF link. The viewer states that limitation. LLE-UAP-PR004 has a conflict between its January 2024 title and October 2023 index date; both are preserved and flagged. Research reports and witness reconstructions are not presented as confirmed sightings.

The previous July sample checked 171 resource URLs and found no confirmed 404/410 responses. That is a historical sample, not a claim that all 450 records or newly added media links have been tested.

Full provenance, normalization policies, hashes, and manual grouping decisions live in [`data/provenance.json`](data/provenance.json) and [`data/ingest-report.json`](data/ingest-report.json). The non-cryptographic row checks in [`data/source/official-row-checks-20261001.json`](data/source/official-row-checks-20261001.json) detect metadata mismatches with the browser-captured new index rows; they are not content authenticity checks.

## October 2026 reading update

The original cinematic identity is preserved. Main reading text is now at least 16px, regular control labels use 14px, and smaller 12–13px text is reserved for secondary metadata. Primary titles and controls use normal capitalization, while source IDs and agency acronyms remain intact. Material viewers support keyboard dismissal and return focus to the opened card. Missing media has a source-link fallback.

The default archive now opens with curated journeys instead of the full search index. Visitors can choose footage, recordings or a document trail without knowing a case name. Every editorial pick links to an existing source record, explains why it is worth exploring, and distinguishes our invitation from the official description. The selection is not a credibility score or a measured popularity ranking; no audience analytics or community votes are fabricated. Search remains one click away, with mobile filters behind an expandable control. Home-page media entrances deep-link to the relevant archive filter.

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

1. Open the deployed experience on desktop and click **Sound off** to unlock the ambient signal.
2. Scroll once from the hero into **Field**.
3. Hover a large video object until the click-to-open prompt appears.
4. Click to trigger target capture and declassification.
5. Watch the official video, inspect its metadata, and choose an assessment.
6. Use **Explore the next signal** to move through the three featured cases.
7. Close the file and continue scrolling to see the full archive scale.
8. Open **Explore archive**, try each curiosity path, and open a story to inspect its reason, question and linked source material.
9. Follow a next-story suggestion, close the viewer, and choose **Search all records** to filter the complete archive or copy a direct case link.

## Scope and next steps

The cinematic path deliberately perfects three cases instead of pretending all 387 deserve identical editorial treatment. The searchable index provides access to the complete archive without crowding the 3D Field. Future work can add an interactive globe, timeline, cross-case relationships, and opt-in aggregate voting.

## Sources and attribution

- Primary official source: [U.S. government PURSUE](https://www.war.gov/UFO/)
- Auxiliary public mirror: [pursue.report](https://pursue.report/)
- Release 05–06 enrichment and some media hosting: [UAP gallery mirror](https://uap.silv.app/)
- Chinese index and Release 01 translations: [chinleez/uap-disclosure-2026](https://github.com/chinleez/uap-disclosure-2026), CC BY 4.0

Official records remain subject to their per-asset markings. The Redacted Sky adds no extraterrestrial conclusion or official analytical judgment.

## License

The application code is available under the [MIT License](LICENSE). Government records, third-party media, translations, and source data retain their original terms and per-asset markings as described above.
