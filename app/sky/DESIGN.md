---
name: The Redacted Sky / My sky
description: A scoped record of My sky's inherited visual system and built local components.
colors:
  archive-bg: "#040909"
  sky-ground: "#07100d"
  sky-text: "#e1e9e3"
  sky-dim: "#afc2b8"
  sky-mint: "#b9ead8"
  sky-warm: "#e3ba85"
  sky-line: "#2c4539"
  sky-map: "#07110e"
  source-line: "#80b19a"
typography:
  display:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "42px"
    fontWeight: 450
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "23px"
    fontWeight: 450
    lineHeight: 1.25
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "14px"
  action:
    fontFamily: "Geist, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.6
rounded:
  action: "6px"
  circle: "50%"
spacing:
  tight: "8px"
  related: "12px"
  group: "16px"
  region: "24px"
components:
  keep-primary:
    backgroundColor: "{colors.sky-mint}"
    textColor: "{colors.sky-ground}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "10px 17px"
  keep-selected:
    backgroundColor: "#0e2117"
    textColor: "{colors.sky-mint}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "10px 17px"
  undo-control:
    backgroundColor: "transparent"
    textColor: "{colors.sky-text}"
    typography: "{typography.action}"
    rounded: "{rounded.action}"
    padding: "10px 17px"
  companion-select:
    backgroundColor: "#101d16"
    textColor: "{colors.sky-text}"
    typography: "{typography.label}"
    rounded: "4px"
    padding: "6px 24px 6px 8px"
  relation-option:
    backgroundColor: "transparent"
    textColor: "{colors.sky-dim}"
    typography: "{typography.label}"
    rounded: "5px"
    padding: "9px 12px"
  relation-selected:
    backgroundColor: "#201b13"
    textColor: "{colors.sky-warm}"
    typography: "{typography.label}"
    rounded: "5px"
    padding: "9px 12px"
  clue-node:
    backgroundColor: "#0c1c14"
    textColor: "{colors.sky-mint}"
    rounded: "{rounded.circle}"
    size: "38px"
---

# Design System: The Redacted Sky / My sky

## Overview

**Creative North Star: "The Redacted Sky"**

This is a bounded extension of the [root design system](../../DESIGN.md), not a replacement. My sky keeps the established deep-green environment, Geist reading voice, pale text, restrained mint actions, real archive material, and shared line icons. The global identity remains authoritative; these extracted values and components apply to the My sky surface and its contextual Archive invitation only.

The built interface makes personal curiosity tangible without claiming an answer. Real materials remain inspectable, personal questions remain reversible, and source-listed relationships remain visually distinct. The route uses tonal separation and small controls rather than introducing a new palette, component family, or branding metaphor.

**Key Characteristics:**

- Inherited dark-green materials and Geist typography.
- Mint actions, solid source links, and warm dashed personal questions.
- Native controls, readable labels, and explicit source recovery.
- Immediate phone feedback through a small pocket sky.

Ground truth is [the route](page.tsx), [its stylesheet](sky.css), [MySky](../../components/MySky.tsx), [ArchiveIcon](../../components/ArchiveIcon.tsx), the inherited global and archive styles, and the scoped entry in [ExploreGallery](../../components/ExploreGallery.tsx). The frontmatter uses documentation aliases for observed values, not new CSS variables. My sky's six local CSS properties are scoped to the page, not declared globally. The sidecar resolves them to literal values so its specimens work without the application runtime. It does not synthesize a new tonal palette.

The [surface brief](../../.impeccable/surfaces/app-sky-page-tsx.md) owns Experience mode, candidate 4 of 5, seed 1c4bd728, and the bench-above-constellation composition. Those decisions are not site-wide rules. The existing [finish verdict](../../.impeccable/my-sky-finish-review.md) is ship, with both material findings resolved; this documentation pass did not repeat QA.

## Colors

The palette inherits the Archive ground, Archive text, and soft mint, with already-built route-local dim text, warm personal links, and green boundaries.

### Primary

- **Soft mint** (sky-mint): keep actions, selected-clue feedback, focus rings, source links, and the phone's View sky link. This is the root system's mint-fill value.
- **Source green** (source-line): solid source-listed edges and their legend key. It is not a confidence score.

### Secondary

- **Personal warm** (sky-warm): personal connection choices, dashed question edges, and relation text. It is an observed My sky value, not a replacement for the root amber token.

### Neutral

- **Archive ground** (archive-bg) and **Archive text** (sky-text): inherited page ground and readable foreground.
- **Clue ground** (sky-ground): media backing and dark text on filled actions.
- **Sky ground** (sky-map): the constellation region and the backing behind node labels.
- **Quiet text** (sky-dim): supporting copy, metadata, limits, and source context.
- **Fine boundary** (sky-line): thin region dividers, controls, and the material shelf.

**The Two Kinds of Line Rule.** Source-listed relationships are solid green; a person's own questions are dashed warm lines. Keep the text legend and source disclosure with them. Neither line establishes a shared cause.

## Typography

**Display and body:** inherited Geist Sans through the root-loaded font variable, with Arial and sans-serif fallbacks. My sky introduces no new typeface. Geist Mono remains part of the global system, but this route does not introduce a mono reading role.

### Hierarchy

- **Display:** the frontmatter role describes the route title, reduced on phones (36px).
- **Headline:** the frontmatter role is the default section heading. Built local variants include the connection-maker heading (22px), constellation heading (26px desktop, 24px phone), and shelf heading (28px).
- **Body:** the frontmatter role is the main reading voice. Clue notes have tighter leading (1.5) and a maximum measure (65ch); expanded source text has more leading (1.7).
- **Label:** controls, node names, evidence limits, source keys, and status metadata remain readable. Node labels use leading (1.3); pocket supporting text uses leading (1.4).
- **Action:** the effective button size is the frontmatter role. The inherited button font shorthand wins over the lower-specificity local weight declaration, so the observed cascade remains normal weight, not a new shared medium-button token.

**The Readable Node Rule.** Keep complete node names visible at the observed label size. On phones, allocate space to the nodes instead of shrinking the text or requiring hover to read it.

## Layout

This section records the local route, not a reusable site template. The main content has a maximum width (1440px) and desktop padding (22px 40px 0). The paired bench uses equal columns and a gap (48px). Each wide-screen clue places media beside its context. The bench remains before the growing constellation.

Below the bench, desktop uses a map-and-controls split (minmax(0, 2fr) and minmax(270px, 1fr)), separated by a gap (30px). The map region has padding (22px 24px 18px) and the plotted area is initially (300px) tall. A five-column material shelf follows the state feedback.

At the intermediate breakpoint (1050px), outer padding becomes (24px 28px 0), individual clue content stacks, the map height becomes (380px), and the shelf uses four columns. At the phone breakpoint (760px), the material pair stacks in reading order; each keep action moves immediately below its media, before contextual copy. Connection controls follow the bench, then the full constellation, then discovery. The shelf uses two columns.

The phone map uses two columns of readable nodes at (26%) and (74%) horizontal positions. Its height is the larger of (240px) or the row count multiplied by (126px). Each node target has width (116px), minimum height (76px), and a circular point (44px); labels have a maximum width (112px). The desktop node target is wider (128px) with minimum height (64px) and a smaller point (38px). These are layout positions, not sky coordinates.

The phone-only pocket sky stays at the bottom with minimum height (82px), safe-area-aware padding, and a stacking level (30). Main content reserves bottom space (108px), while controls carry bottom scroll margin (120px). The cue shows up to three schematic points, the total kept count, a short next step, and View sky. It is feedback and navigation, not a second editable map.

## Elevation & Depth

My sky is flat and tonal. It uses deep-green grounds, thin borders, real media, and a sparse dot field. There is no local box-shadow vocabulary. The dot field and the empty-state radial fade belong to this constellation only; they are not default backgrounds for every route.

The pocket sky is a solid bottom surface with a top border, not a floating glass card. Source media remains contain-fit in the comparison bench. Small shelf previews use cover-fit except for documents, which remain contained.

Connection arrival has one brief stroke/opacity animation (420ms, cubic-bezier(.16, 1, .3, 1)). Action colors transition (160ms ease-out), and node color/border feedback transitions (180ms ease-out). There is no ambient loop, automatic media playback, or forced animated journey. Reduced-motion preferences disable animation, transitions, and smooth scrolling. Keyboard input disables transitions and animation for the route; pointer input restores ordinary feedback. Programmatic revisit and connect navigation scroll instantly.

## Shapes

Actions and full media use lightly softened corners; native selects and relation choices keep their own smaller radii. Circular points carry the shared SVG material icons. Borders, not elevation, communicate controls and selection.

The functional icon family stays [ArchiveIcon](../../components/ArchiveIcon.tsx): an authored SVG viewBox (32 × 32), stroke width (1.5), and round caps and joins. Typical route icons are (18–22px), with larger marks only for title, fallback, or empty-state roles. These are SVG paths, not glyph substitutes.

## Components

### Buttons

Keep this clue is mint-filled with dark text. Kept in my sky switches to a dark-green fill, mint text, a visible border, a check icon, and pressed semantics; activating it removes the clue and its personal links. Undo is a quiet outlined action beside the constellation heading. Primary and retained controls have minimum height (46px).

Disabled actions use reduced opacity (.55) and native disabled behavior. Primary hover becomes a lighter mint (#d4f7e7); kept hover darkens the green fill (#192e23) and brightens the border. Focus is a mint outline (2px) with offset (5px). Undo restores the saved relation and its visible radio selection together.

### Inputs / Fields

The companion picker is a labeled native select, not a custom popup. Its minimum height changes from (38px) to (44px) on phones. Connection choices are native radios in a fieldset with a meaningful legend, a minimum label target (44px), and three real options: Might connect, Looks different, and Not sure yet.

The selected relation uses warm text, a warm border (#846643), and dark warm fill. The fieldset remains disabled until both materials are kept. Saving is disabled when the current stored relation already matches the selected one. Native radio and select keyboard behavior is retained.

### Media and source disclosure

Video and audio retain native controls and preload none; video plays inline. They do not autoplay. Preview failure exposes an explicit Preview unavailable state and a Try the official source link. Open original and Source and context remain available beside or below the media, with original-record and full-case links in native details/summary disclosure.

The compare view does not crop away evidence context. Missing source relationships are stated in words; they are not silently replaced by a suggested personal edge.

### Constellation and connection key

Stars are native buttons with explicit Inspect labels. Activating a star or saved connection revisits the pair and moves focus to the bench. Connecting moves focus to the constellation. Both section targets are programmatically focusable. A polite live region announces keep, connect, remove, and Undo results.

The main map draws source links with a thin solid stroke (1.5px at .75 opacity) and personal questions with a thicker dashed stroke (2px; 5 6 dash pattern). The phone cue uses the same distinction, with its own smaller (3 3) dash pattern. Source relationships also have a text disclosure; personal relationships have a revisitable text list. The map explicitly says that a line is not proof of a shared cause.

### Pocket sky

The mobile cue gives immediate, visible first-run feedback. Empty state says Your sky is empty and Keep a clue to begin. One kept material fills one point and changes the copy to 1 clue kept and Keep one more clue. More kept materials update the total and next step; a saved personal connection changes the message to Your questions, connected.

Its schematic preview represents only the first three saved materials. Keep the count and View sky action, so the small cue never suggests it displays every saved node.

### Discovery and navigation

The ten-material shelf uses native buttons, shared media-kind icons, readable titles, and kept markers. Its selected item exposes aria-pressed. The ExploreGallery invitation is one source-linked entry into My sky, not a replacement for existing archive paths.

The shared SiteNavigation remains unchanged, with Explore archive current on this route. A skip link reaches the clue bench. My sky uses explicit text links for See my sky, View sky, Sources and method, and Back to archive; icon recognition is not required.

## Do's and Don'ts

### Do:

- **Do** inherit the root visual world and keep this extension scoped to My sky and its Archive invitation.
- **Do** retain readable node labels, the phone pocket cue, and keep actions immediately below phone media.
- **Do** preserve native media, select, radio, button, and disclosure behavior, visible focus, and official-source fallback.
- **Do** keep source-listed relationships separate from personal questions in line style, labels, and disclosure.
- **Do** retain device-local wording, storage-failure feedback, and reversible keep/connect actions.

### Don't:

- **Don't** add a drag requirement, timer, score, correct-answer gate, autoplay, or hover-only information to this surface.
- **Don't** imply that a line proves a shared cause or that node positions are sky coordinates.
- **Don't** imply accounts, shared boards, cloud saving, or cross-device persistence; the current sky is browser-local only.
- **Don't** promote the paired bench, node topology, pocket dock, local warm tint, or route dimensions into site-wide rules.
- **Don't** overwrite the root design system or invent new canonical primitives from these route specimens.

**Not canonized:** overwritten font declarations, one-off optical adjustments, and the route's plotted coordinates are not global tokens. The root's already-documented inherited exceptions remain its own boundary; no new global icon, palette, or composition rule is created here.

