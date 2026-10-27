# Circular workflow visual

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

The same image anchors the hero, framed by the FASTA input at the upper left and
the example sensorgram at the lower right. The old B node and floating dot were
removed. Fine orbital geometry, a restrained blue halo, floating layers and a
repeated curve reveal establish the sequence-to-data narrative. This is a 3D
rendered image with animation, not an interactive scientific structure viewer.
No additional image generation or external runtime was needed. Offscreen and
background states pause the animation; reduced motion presents a static scene.
