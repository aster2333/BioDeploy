# Circular workflow visual

Updated positioning: 2026-10-29. Product direction follows [New-intro.md](New-intro.md) and [PRD.md](PRD.md). Vision: **The physical bedrock for bio-intelligence: Converting wet-lab reality into fuel for generative biology.**

The workflow now targets functional enzyme ground-truth: scope and substrate confirmation → materials → expression → continuous catalytic measurements → QC and ML data release. Calibration plates, blinded positive/negative controls, method versions and pseudonymized dispatch are network design requirements, pending operational verification. The existing five-stage animation and protein asset remain reusable. Historical browser checks below describe the existing visual, not a validated enzyme assay workflow.

The existing site design system remains the primary visual reference: Geist type,
white canvas, fine neutral borders and blue for the selected stage. The user's
reference supplies the circular composition, central protein and automatic step
sequence. The Refero motion craft guide supplies short state transitions,
explicit pause and reduced-motion behavior. Live Refero research was unavailable
because its subscription was inactive.

| Decision | Source | Implementation |
| --- | --- | --- |
| Protein at the center, steps around a circle | User's competitor description | Five existing stages retained |
| Neutral canvas and blue selected state | Existing DESIGN_SPEC.md | Existing color tokens retained |
| Sequential demonstration | User request | 4.2 seconds per step; loops from 05 to 01 |
| Pause and reduced motion | Motion craft guidance | Pause button, keyboard focus pause, offscreen/background pause |
| Illustrative folded protein | User request | Local transparent PNG; no specific protein identity claimed |

## Image asset

Saved to `public/images/workflow-protein.png`, resized to 640px for the website.
Generated with the built-in image_gen tool, using this prompt:

> Use case: scientific-educational. Asset type: central illustration for a premium biotechnology website workflow diagram. Create a single beautiful folded globular protein ribbon molecular structure, a complex compact fold with several clearly recognizable alpha helices and beta sheets linked by fine loops. Polished scientific 3D ribbon rendering with physical depth, satin material, cool cobalt blue and pale silver blue, soft studio lighting. Transparent background. Centered square composition with generous 12% empty margin around entire molecule; entire protein fully visible. No text, no labels, no circles, no diagram, no UI, no shadows on background, no DNA double helix, no spheres or ball-and-stick. This is an illustrative protein fold, not a claim of a particular known protein. Suitable for a clean white biotech site.

## Verification

Browser checks verified the full 01→02→03→04→05→01 cycle, paused state held
beyond a complete interval, manual selection and keyboard wraparound, and
reduced-motion default pause. At 390px all four locales fit without horizontal
overflow. Desktop (1440px) and mobile (390px) layouts were visually inspected.

## Homepage reuse

The same image anchors the hero, centered, framed by the FASTA input at the upper left and
the example sensorgram at the lower right. The old B node and floating dot were
removed. Fine orbital geometry, a restrained blue halo, floating layers and a
repeated curve reveal establish the sequence-to-data narrative. This is a 3D
rendered image with animation, not an interactive scientific structure viewer.
No additional image generation or external runtime was needed. Offscreen and
background states pause the animation; reduced motion presents a static scene.

The cards form an upper-left / lower-right diagonal with opposite subtle tilts.
Mobile uses a taller scene, independent card sizes and wider vertical spacing
to reveal the central protein fold rather than shrinking the desktop overlap.
The molecular orbit and halo follow the centered protein. The redundant protein subtitle and input
number prefix are removed in all four locales. Verified at 320–1440px.

## Kinetics visual target

Replace the hero output sensorgram with a Michaelis–Menten plot (substrate concentration vs initial velocity), paired with FASTA / substrate SMILES and an ML schema preview. Continuous absorbance / fluorescence traces use time on the x-axis in a separate workspace view. Current binder curves remain binding examples until real synthetic enzyme data and consistent exports are implemented. No new image asset is required by this documentation update.

## Enzyme example implemented (2026-10-29)

The hero output now renders the shared synthetic Michaelis–Menten curve with initial-rate points. The workspace separates continuous product-versus-time traces from substrate-versus-initial-rate fitting; it no longer shows a binding sensorgram. Input cards use enzyme_001 and explicitly identify the sequence and substrate as synthetic placeholders. Data contract: [ENZYME_DATA.md](ENZYME_DATA.md). Earlier sensorgram descriptions are historical visual records.
