# Devpost submission draft

## Project name

The Redacted Sky

## Tagline

Enter the files. Watch the evidence. Decide what you saw.

## Recommended track

**Education**

The project teaches public-data literacy and critical interpretation through an immersive experience. It helps people distinguish official evidence, missing information, artistic reconstruction, and personal judgment.

## Short description

The Redacted Sky turns 334 recently released UAP records into an immersive 3D evidence field. Visitors capture official video signals, enter cinematic declassification chapters, inspect source context, and record their own assessment, without the interface deciding for them.

## Inspiration

UAP disclosure creates an unusual public-information problem: the source material is fascinating, but it is fragmented across hundreds of videos, images, PDFs, audio files, terse government descriptions, and incomplete metadata. Raw disclosure is not the same as public understanding.

We wanted to make the archive accessible without making it sensational. The design principle became: **experience first, evidence second, judgment last**.

## What it does

The experience begins with a realistic 3D UAP form explicitly labeled as an artist reconstruction. Scrolling descends into a deep-space field containing all 334 official record rows. Video, image, and document objects retain their real media types.

Hovering a live video signal produces a visible target lock. Clicking freezes the field and begins a cinematic capture sequence: scanning rings collapse, the file declassifies, and official footage fills the evidence view. Source metadata and original links remain visible. The visitor can classify what they saw as Ordinary, Sensor Ambiguity, Insufficient, or Anomalous, with the response stored only on their device.

Three featured signals form a complete demo journey, while the underlying archive contains 279 grouped cases across four releases.

## How we built it

The Redacted Sky uses React, Next.js, TypeScript, and Three.js. A deterministic ingestion script turns the official release index into normalized, reproducible JSON. It preserves missing coordinates, source precision, release membership, media types, and provenance instead of filling gaps for visual convenience.

The browser experience renders the 334 records as spatial artifacts, six reconstructed UAP morphologies as contextual forms, and three official videos as live featured signals. The final build is Cloudflare Workers-compatible and deployed through OpenAI Codex Sites.

Codex supported the project end to end: product framing, interaction design, Three.js modeling, data-pipeline implementation, provenance review, UI iteration, testing, and deployment. The strongest decisions emerged through the conversation. For example, we moved the full data overview behind the experiential field, pushed decorative craft into the background, and concentrated editorial effort on a three-case golden path instead of superficially polishing 279 cases.

## How Codex accelerated the work

Codex made it possible to move continuously between emotional direction and production detail. A comment like “the hero object feels like an instrument” became a redesigned UAP silhouette; “the main object is stealing focus” became a corrected 3D depth hierarchy; “users cannot tell what is clickable” became object lift, scan rings, target-lock copy, and verified click behavior.

It also handled the less visible work: deterministic ingest scripts, record grouping, source attribution, link audits, regression tests, responsive behavior, build validation, and private deployment. The commit history and primary `/feedback` Session ID document that progression.

## GPT-5.6 usage

We used GPT-5.6 Sol High inside Codex as the primary design-engineering collaborator. It translated subjective visual feedback into concrete Three.js and interaction changes, reasoned across the full 334-record dataset, and helped compress a broad product vision into a polished three-signal submission path under deadline.

## Challenges

- Making 334 records feel spatial without turning them into meaningless particles.
- Keeping 3D reconstruction visually dramatic while never confusing it with official evidence.
- Working with official sources that restrict non-browser retrieval.
- Grouping related records without inventing relationships or coordinates.
- Maintaining performance while mixing live video textures, 3D geometry, particles, and scroll-driven chapters.
- Choosing depth over breadth under a one-week deadline.

## Accomplishments

- A complete immersive journey from encounter to evidence to judgment.
- 334 verified official rows grouped into 279 cases with deterministic output hashes.
- Three polished cinematic evidence chapters using official video.
- Six original 3D UAP morphology reconstructions.
- Explicit provenance and a visible separation between evidence and reconstruction.
- A production deployment prepared for immediate judge access.

## What we learned

The central lesson was that disclosure is an interface problem as much as a data problem. A public archive can still be inaccessible, and an immersive interface can easily imply more certainty than the evidence supports. The most important design work was not making the experience dramatic; it was preserving uncertainty while making people want to look closer.

## What is next

Future phases can add an interactive globe, a 1947–2026 time slider, linked case relationships, a historical timeline, and opt-in aggregate assessments. The editorial model will remain selective: the full archive provides depth, while carefully chosen cases receive richer storytelling.

## Links to paste into Devpost

- Live demo: https://the-redacted-sky.moonbow166.chatgpt.site/
- Devpost project: https://devpost.com/software/the-redacted-sky
- Code repository: https://github.com/moonbow166/the-redacted-sky
- Public YouTube demo: **ADD VIDEO URL**
- Primary Codex Session ID: `019f6951-7262-7600-a63a-4faeeca4458f`

## Judge-only testing instructions

> Open the live demo on desktop with sound enabled. Scroll once to enter FIELD, hover one of the three large live-video objects until the target lock appears, then click to open the cinematic evidence chapter. Choose an assessment to reveal the CONTINUE TO SIGNAL control. No test account or sample input is required after public access is enabled.
