---
name: The Redacted Sky
description: An immersive, source-linked interface for public UAP records.
colors:
  ink: "#020405"
  paper: "#dce4de"
  muted: "#a0afa7"
  signal: "#a9fff2"
  amber: "#c7a56e"
  line: "rgba(194, 218, 209, 0.18)"
  mint-fill: "#b9ead8"
  archive-bg: "#040909"
  archive-text: "#e1e9e3"
  library-dim: "#a3b3ac"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontWeight: 450
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 450
    lineHeight: 1.3
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.6
  mono:
    fontFamily: "Geist Mono, monospace"
rounded:
  control: "2px"
  record: "3px"
  soft: "6px"
  media: "8px"
  navigation: "12px"
spacing:
  micro: "4px"
  tight: "8px"
  group: "12px"
  control: "16px"
  stack: "24px"
  section: "32px"
  region: "48px"
components:
  reading-primary:
    backgroundColor: "{colors.mint-fill}"
    textColor: "#07100d"
    rounded: "{rounded.soft}"
    padding: "10px 18px"
  catalogue-field:
    backgroundColor: "#0b1411"
    textColor: "{colors.archive-text}"
    typography: "{typography.body}"
    rounded: "{rounded.control}"
    padding: "0 0.875rem"
    height: "52px"
  mode-link:
    backgroundColor: "transparent"
    textColor: "#baccc3"
    rounded: "{rounded.media}"
    padding: "8px 16px"
  mode-link-active:
    backgroundColor: "{colors.mint-fill}"
    textColor: "#052019"
    rounded: "{rounded.media}"
    padding: "8px 16px"
  curiosity-chip:
    backgroundColor: "#07110e"
    textColor: "#b8cdbf"
    rounded: "{rounded.soft}"
    padding: "0.65rem 1rem"
  record-card:
    backgroundColor: "#09110e"
    textColor: "{colors.archive-text}"
    rounded: "{rounded.record}"
    padding: "0"
---

# Design System: The Redacted Sky

## Overview

**Creative North Star: "The Redacted Sky"**

The Redacted Sky is an immersive interface for public UAP records. Preserve its established near-black, deep-green environment, real archival material, restrained mint controls, warm source context, and shared line icons. This is an incumbent system, not a new visual identity.

Experience is the cinematic, spatial expression of that identity. Archive and Read surfaces keep the same materials while making evidence easier to inspect: readable sentence-case type, short copy, explicit source links, and optional deeper detail. Decorative treatments in the existing Experience do not set the reading style for new pages.

**Key Characteristics:**

- Dark, green-tinted surfaces with pale readable text.
- Mint for actions and navigation; warm accents for context.
- Real source media, thin boundaries, and restrained controls.
- Geist Sans for reading; Geist Mono for identifiers and measurements.

This scan records the built system after the Tremonton extension. Authority is `PRODUCT.md`, the active cascade in `app/globals.css`, `app/archive/archive.css`, and `app/reading.css`, plus `SiteNavigation`, `ArchiveIcon`, and `ReadingLayout`. The route and `ExploreGallery` demonstrate its scoped extension. No new metaphor, seed, generated comp, or catalogue card was chosen. The extension contract was documented late, after implementation; this file does not claim pre-build compliance.

The frontmatter records existing shared colors and extracted reusable values. Extracted names such as spacing steps are documentation aliases, not new CSS custom properties. Local route values remain local; the sidecar's synthesized tonal ramps are preview aids, not additional approved colors.

## Colors

Near-black green surfaces hold pale text, with cool mint interaction and a restrained warm contextual accent.

### Primary

- **Signal mint** (`signal`): existing links, action cues, selection borders, and Archive focus rings.
- **Soft mint fill** (`mint-fill`): the current site-mode segment and filled reading actions. Dark text preserves the visible active state.

### Secondary

- **Warm amber** (`amber`): inherited source and instrument context in the Experience. The Tremonton route uses its own warmer contextual tint; it is not a replacement for the shared token.

### Neutral

- **Ink** (`ink`): the immersive root canvas.
- **Paper** (`paper`): shared light foreground and wordmark.
- **Muted green** (`muted`): secondary inherited text.
- **Fine line** (`line`): translucent separators, not a raised shadow.
- **Archive ground** (`archive-bg`), **Archive text** (`archive-text`), and **Library dim** (`library-dim`): the catalogue's established surface and text hierarchy. Read pages have their own close green-toned surface values; there is no single enforced background for every route.

**The Signal Marks Action Rule.** Mint identifies a way to act, navigate, or focus. It is not a credibility score or a claim that a record has been resolved.

## Typography

**Display and body:** Geist Sans, loaded by `app/layout.tsx` through `--font-geist-sans`; Arial and sans-serif are fallbacks, not the display identity.

**Identifiers and measurements:** Geist Mono through `--font-geist-mono`, with monospace fallback.

The hierarchy is optical and role-based rather than a strict modular ratio. Large titles are lightly weighted and compact; body copy has generous leading. The frontmatter's headline role represents repeated archive section headings, not every route's H1.

### Hierarchy

- **Display:** regular-light weight (450). Current Experience H1 scales to (6rem); Archive, generic Read, and guided-path H1 sizes are independently scoped.
- **Headline:** repeated archive collection and browse headings use the frontmatter role. Reading section headings vary with depth.
- **Title:** card and comparison titles generally sit around (1.375–1.5rem), with line heights around (1.22–1.3) and weights (450–500).
- **Body:** catalogue text uses the frontmatter role. Reading pages use (1rem / 1.8); the guided path's main explanatory paragraphs use (1.0625rem / 1.7). Reading measures are typically (65–72ch).
- **Label:** regular controls and captions use approximately (0.875–0.9375rem). Smaller (0.75–0.8125rem) text is secondary metadata, not the reading voice.
- **Mono:** source IDs, timecodes, coordinates, and sequence markers where the values carry meaning.

Headings commonly use modest negative tracking. The built Tremonton H1 is scoped at (-0.03em); it is not a new universal title token. Active overrides matter: older global rules do not describe the final Experience H1.

**The Reading Voice Rule.** New Read headings and controls use sentence case and short English. Preserve proper names, source IDs, and agency acronyms; do not turn them into decorative labels.

Existing Experience assets may retain uppercase source stamps or instrument-like decorative text. This is a preservation boundary, not permission to uppercase new Read headings. Authored interface copy follows the product's no-em-dash commitment.

## Layout

Use a shared top navigation and generous outer margins. Archive is a wide browsing surface with a maximum content width (1480px), while the existing ReadingLayout has a narrower maximum (1120px). These are distinct containers, not competing versions of one universal width.

Related media and explanation sit beside each other when space allows, then stack for reading. The catalogue uses three columns by default, two below (1100px), one below (520px), and four above (1700px). Read layouts and paired comparisons stack at (760px). Site navigation changes to a wordmark over a two-column mode switch at (680px); its header height changes from (80px) to (116px).

The observed rhythm repeatedly uses the frontmatter spacing steps, with local optical adjustments. Controls group tightly; sections gain wider separation and a thin divider. Do not force every observed gap onto a fabricated strict scale.

The guided route's (1160px) container, four stations, film-splice diagram, and desktop/mobile lead ordering are scoped composition decisions. Its mobile title, invitation, and action precede the lead image. Preserve that built behavior when changing this route, without requiring all future stories to share its layout.

## Elevation & Depth

Archive and Read are primarily flat. Slightly different green grounds, real media, thin borders, and whitespace define their layers. The archive viewer uses a dark backdrop with blur (8px) to isolate media; it is a focused viewer, not a decorative glass card.

Experience retains its 3D scene, vignette, redaction treatment, and localized optical effects. Existing signal halos are decoration, not a reusable elevation scale. There is no shared card-shadow token for Read surfaces.

**The Read Surface Rule.** Archive and Read surfaces separate content with tone, whitespace, and thin borders. The existing Experience's optical depth is not a default effect for reading panels.

Archive card feedback uses short color/border transitions (0.2s ease). Reduced-motion rules remove those transitions and substantially reduce inherited animation. New reading content is already visible and does not require animation, hover, or audio to be understood.

## Shapes

The inherited vocabulary is lightly softened, not uniformly pill-shaped: compact catalogue controls, small-radius record cards, softer reading actions and story media, and a rounded mode-switch frame. The frontmatter records these distinct radii rather than prescribing one radius for all components.

Thin borders provide edges and selection. Circular media symbols and orbital geometry belong to the archive/Experience icon vocabulary. The wordmark's small rotated square is retained. Media uses real imagery; contain-fit is used where cropping would remove evidence or document context.

## Components

### Buttons

Restrained, clearly actionable controls. Filled reading actions pair soft mint with dark green text and the soft radius. Source actions are compact outlined or underlined links. Their exact variants remain surface-specific; there is no generic gradient or floating-pill button.

Most primary controls provide at least (44px) of target height. Reading action hover uses a lighter mint fill. Archive hover emphasizes the border; focus uses a visible outline (2px) with offset (5px). Disabled controls visibly reduce opacity and reject interaction.

### Chips

Curiosity choices pair a line icon with a sentence-case question. They use the soft radius, a thin green border, and a minimum height (52px). The selected state changes both fill and border and is exposed with `aria-pressed`; it is not conveyed by color alone in markup. On mobile, the choices form two columns.

### Cards / Containers

Catalogue record cards have a small radius, a media preview, compact metadata, readable title, description, and source context. Hover and keyboard focus brighten the border. Missing previews keep an icon and record identifier visible rather than substituting invented evidence.

Story leads are larger media-and-copy compositions; secondary story cards are quieter, with an exposed image and bottom rule. Real-media aspect ratios vary by role (16:10 for catalogue/story previews, 4:3 for document context). A source viewer contains media rather than cropping it.

### Inputs / Fields

Catalogue search and filters use dark-green fields, a thin border, the control radius, a mint caret, and visible placeholder text. Desktop height is (52px), reduced to (48px) in the compact layout. On mobile, search remains exposed and additional filters can be revealed. Keep the input's visible label and native select behavior.

### Navigation

The shared wordmark and Experience / Explore archive switch are authoritative across both worlds. The active segment is mint-filled with dark text and `aria-current`. Each destination has a line icon and text; navigation does not depend on recognizing an icon.

`ArchiveIcon` is the functional icon source: authored SVG on a (32 × 32) viewBox, stroke width (1.5), with round caps and joins. Rendered sizes vary with component context. Do not replace it with a second icon family or a glyph-based icon system.

### Evidence and disclosure

Reading sections put the meaningful heading first, source context below it, and a direct source link near the claim. Native `details` / `summary` elements reveal longer official text. Source statements, editorial prompts, and missing information remain visibly distinct.

The guided film player preserves native controls, an explicit play action, labeled chapter buttons, a polite status message, and an official-site fallback. Sequence numbers indicate actual ordered steps. The splice graphic is a labeled diagram, not an archival photograph.

## Do's and Don'ts

### Do:

- **Do** preserve the incumbent dark environment, shared navigation, and authored line-icon family.
- **Do** keep real source imagery visible and label comparison material or reconstruction by what it is.
- **Do** give new Read headings sentence case, short supporting copy, and metadata below the heading.
- **Do** retain visible source links, keyboard focus, responsive reflow, and a recoverable media fallback.
- **Do** use disclosure for additional source text without hiding the main evidence limitation.

### Don't:

- **Don't** replace the Experience identity as a side effect of extending the archive.
- **Don't** apply the Experience's decorative uppercase, wide tracking, grain, glow, or spatial choreography to new reading text.
- **Don't** use a new eyebrow above a heading, or treat inherited eyebrow styles as a reusable primitive.
- **Don't** use color, a generated image, or a reconstruction as proof of a source claim.
- **Don't** promote Tremonton's splice diagram, four-step composition, local warm colors, or route-specific dimensions into universal rules.

**Not canonized:** inherited eyebrow/kicker styles and glyph arrows are carried implementation exceptions, not approved future primitives. Experience-only decorative uppercase and optical effects remain scoped to that preserved world. Unused root declarations, one-off route colors, and legacy declarations overridden by the active cascade are not new shared tokens.

