---
version: alpha
name: OJI — The Floating Atelier
description: An original illustrated sky-island world framing authentic graphic design and 3D artwork.
colors:
  primary: "#111110"
  neutral: "#EDEAE3"
  accent: "#FF4D1F"
  paper: "#F7F3E9"
  sky: "#A9D9E7"
  cyan: "#D7F0EB"
  yellow: "#F4D885"
  peach: "#F1B99D"
  green: "#506C55"
  lavender: "#C3BDD8"
  success: "#285239"
  danger: "#A32920"
typography:
  h1:
    fontFamily: Archivo
    fontSize: 6rem
    fontWeight: 800
    lineHeight: 0.95
    letterSpacing: "-0.06em"
  body-md:
    fontFamily: Archivo
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.6
  editorial:
    fontFamily: Instrument Serif
    fontSize: 3rem
    fontWeight: 400
    lineHeight: 1.1
  metadata:
    fontFamily: JetBrains Mono
    fontSize: 0.75rem
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "0.06em"
rounded:
  sm: 4px
  md: 12px
  pill: 999px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 40px
  xl: 64px
  scene: 120px
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.primary}"
    rounded: "{rounded.pill}"
    padding: 16px
  button-primary-hover:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.neutral}"
  paper:
    backgroundColor: "{colors.paper}"
    textColor: "{colors.primary}"
  sky:
    backgroundColor: "{colors.sky}"
    textColor: "{colors.primary}"
  cyan:
    backgroundColor: "{colors.cyan}"
    textColor: "{colors.primary}"
  yellow:
    backgroundColor: "{colors.yellow}"
    textColor: "{colors.primary}"
  peach:
    backgroundColor: "{colors.peach}"
    textColor: "{colors.primary}"
  green:
    backgroundColor: "{colors.green}"
    textColor: "{colors.paper}"
  lavender:
    backgroundColor: "{colors.lavender}"
    textColor: "{colors.primary}"
  success:
    backgroundColor: "{colors.success}"
    textColor: "{colors.paper}"
  danger:
    backgroundColor: "{colors.danger}"
    textColor: "{colors.paper}"
---

## Overview

**The Floating Atelier.** OJI is a small creative workshop suspended between sky and landscape. Visitors enter through a blue-sky opening, travel past an orange-roofed atelier and cloud banks, arrive at a paper-like exhibition, meet the maker in a green garden atmosphere, and leave through a peach sunset. The orange roof, wind-bent vegetation, paper glider and rounded clouds form a recurring original vocabulary. No franchise, studio or recognizable existing character is a reference for the environment.

Public website: **Explore** surface, with an editorial art exhibition as the secondary mode. CMS: **Operate** surface, with compact navigation, clear actions and no parallax. Tactile Digital Exhibition remains the brand foundation: paper, ink, orange, oversized display type, editorial contrasts, restrained print-like rules. Illustration now drives the spatial composition instead of decorating a conventional hero.

Authentic artwork is content. Environment illustrations are branding. Never mix those roles. Never generate a substitute mascot, render or project photograph. Retain project attribution and the exact supplied image composition; use contain on renders and a lightbox for full-resolution viewing. Missing category content stays hidden. Project years, roles, experience and tools come from the repository, not the illustration concept.

## Colors

Brand anchors are immutable: warm off-white `#EDEAE3`, near-black `#111110`, signal orange `#FF4D1F`. Supporting illustration palette: sky `#A9D9E7`, soft cyan `#D7F0EB`, warm yellow `#F4D885`, peach `#F1B99D`, muted green `#506C55`, lavender `#C3BDD8`, paper `#F7F3E9`.

Use one dominant atmosphere per scene, not all supporting colors in every block. Daylight hero is sky/cyan/cream with orange roofs and green foliage. Artwork exhibition is neutral paper; the work provides the color. Identity is green/cream. Ending is peach/orange/ink. Orange buttons use ink labels: do not use small white text on orange. Semantic success/danger colors are restricted to administrative status feedback.

## Typography

Archivo 400/600/800/900: body, navigation, asymmetric oversized display typography and wordmark. Instrument Serif regular/italic: short editorial statements and expressive contrast. JetBrains Mono 400: chapter markers, categories, project facts, upload state, captions and controls. Fonts must be loaded, not merely named in CSS. English is the primary language. No decorative Japanese text.

Headlines use tight negative tracking and short lines. Body text uses 1.6 line-height and roughly 60-character measure. Metadata is never below 11px. On 320px screens, headings scale down without clipping and controls retain 44px targets. Typography can occupy its own depth plane but actionable content must remain stable enough to use.

## Layout

Maximum content width 1680px. Desktop outer margin clamps from 24px to 80px. Gallery uses a 12-column editorial grid: dominant lead project, offset secondary artwork, then mixed aspect ratios. Do not place all projects in identical rounded cards. Original renders fit within visible media windows; metadata and hover controls sit outside the artwork rather than covering essential pixels.

Homepage order: entering the world / illustrated atelier; creative-environment interlude; selected artwork; 3D exhibition link; maker introduction; sunset contact. No scroll hijacking or virtual scrolling. Every page has a route, heading, skip link and working next action.

| Viewport | Composition |
| --- | --- |
| 1920px | Wide sky, full islands, long landscape silhouette, generous 12-column gallery. |
| 1440px | Flagship composition, integrated OJI letters, foreground cloud overlap. |
| 1024px | Reduced side decoration, tighter art/metadata alignment. |
| 768px | Two-column gallery, shorter scene, tablet motion amplitude 55%. |
| 390px | Single-column editorial flow, atelier recentered, stacked intro, three moving planes maximum. |
| 320px | Smaller wordmark, wrapping metadata, full-width controls, no sideways scroll. |

## Elevation & Depth

Depth is painted, not simulated by expensive geometry. Original inline SVG scenery uses independent planes, cel-shaded rock/foliage, irregular hand-drawn-looking contours, warm windows, layered mountains and small narrative details. Gradients are atmospheric lighting only. Texture is subtle static CSS grain; never filter the portfolio images. The house, orange roof and cloud contours recur in alternate scene palettes.

### Parallax contract

Movement is measured in CSS pixels over normalized scene progress `p` in `[0,1]`. Each scene defines progress from its document position and viewport, not an unrelated autoplay timeline. Hero starts at `p=0` at the top of the document. Other scenes enter at `p=0` below the viewport and reach `p=1` after leaving it. Transform is `translate3d(p*x, p*y, 0) rotate(p*r) scale(1+p*s)`. All animations use transform only. Pointer offset is bounded to 10px on fine-pointer desktop devices and is separate from scroll progress.

| Layer | Depth / z | Direction | x / y at p=1 | Scale delta | Rotation | Behavior |
| --- | --- | --- | --- | --- | --- | --- |
| Sky | 0 / 0 | Stationary | 0 / 0px | 0 | 0° | Static atmospheric field. |
| Distant landscape | .08 / 1 | Slowly upward | -8 / -22px | .015 | 0° | Mountain silhouettes stay visually anchored. |
| Background clouds | .15 / 2 | Right and down | 100 / 28px | 0 | 0° | Inner cloud group drifts slowly; pause control stops drift. |
| Far islands / structures | .3 / 3 | Left and up | -45 / -55px | .025 | -1° | Small atelier structures and vegetation. |
| Main island / atelier | .5 / 5 | Right and up | 38 / -100px | .035 | 1° | Orange-roofed building, rock planes and windmill. |
| Foreground clouds / foliage | 1 / 8 | Left and up | -105 / -175px | .06 | -2° | Closest depth occludes edges, never links. |
| Floating glider / particles | .8 / 7 | Diagonal right/up | 135 / -145px | .04 | 12° | Small original objects with independent trajectory. |
| OJI typography | .35 / 4 | Slightly left/up | -20 / -65px | -.015 | 0° | Behind closest landscape; readable semantic heading. |
| Introduction / metadata | 0 / 10 | Stationary | 0 / 0px | 0 | 0° | Stable controls, no hit-target movement. |

Garden, sunset and night reuse the same depth contract, with different palette and scenery density. Compact scenes retain the exact contract but clip decoration to their local container; text is outside or above the art. Desktop motion amplitude is 100%, tablet 55%, mobile 24%. On mobile only distant clouds, main island and glider animate; all other planes and typography are static. There is no WebGL dependency.

A single requestAnimationFrame callback coalesces passive scroll/pointer updates. No endless JS animation loop. Cache scene bounds between resizes, skip scenes outside the viewport, and clear transforms when reduced motion or the motion toggle is enabled. Watch media-query changes during the session. A visible motion toggle must stop both scroll movement and continuous cloud drift.

### Transitions

Sky ends in a cloud-shaped paper edge. The atelier interlude uses the same cloud/vegetation motif to lead into real artwork, not a different wallpaper. Paper sections introduce orange chapter marks and hand-drawn orbit lines sparingly. Garden shifts the palette, not the identity. The sunset finale reuses the atelier silhouette and paper glider to close the journey. Content remains readable without JavaScript.

## Shapes

Organic irregular island/leaf/cloud contours are the main visual shapes. Buttons are compact pills with a fine ink border. Artwork frames use minimal corners and no faux glass. CMS fields use 4px corners; panels use 12px maximum and restrained hard-edged shadows only where functional elevation is required. Native dialog surfaces have explicit close controls, initial focus and Escape behavior.

## Components

- Header: OJI wordmark, Work / Gallery / About / Contact, motion preference, mobile menu. Current page is marked semantically. Mobile uses a native modal dialog with large labels, home link, close button, focus containment and Escape support.
- Project card: original artwork, number, category/year, title and directional link. Hover changes framing/underline, never repaints the work. Keyboard focus gets an equivalent affordance.
- Gallery filter: native buttons with `aria-pressed`; available categories derive from published projects. Result count is live-announced. Empty categories do not appear.
- Project detail: title, introduction, role/year/tools, hero, full gallery, captions, native video only when an actual video is provided, previous/next links. No invented video source.
- Motion toggle: remembers explicit preference locally when storage is available; operating-system reduced motion always takes precedence.
- Footer: illustrated ending invitation, actual email/social URLs, public route links and clearly identified CMS prototype link.

## Do's and Don'ts

Do preserve source artwork, make motion proportional to actual scroll, vary directional depth, use semantic links/forms, preserve focus, keep keyboard paths complete, test all six widths and stop moving when requested. Do not add fake client names, metrics, awards, projects or placeholder categories. Do not replace missing original artwork with environment illustration. Do not use delayed navigation, scroll hijacking, cursor replacement, parallax in the CMS, WebGL on mobile or hover-only essential actions.

## CMS visual system and handoff boundary

Implement the public experience before the administration suite. The requested CMS is an **interactive local prototype**, not a deployed content service. Label that boundary on login and every admin workspace. Local changes must never claim to update the public build. No password or credentials should be stored. Local prototype state may be stored in browser storage, with errors surfaced if unavailable.

Required admin routes/screens: Login, Dashboard, Projects, Editor, Media Library, Image Upload, Video Upload, Gallery Arrangement, Project Preview, Homepage Editor, About Editor, Contact Editor, Settings. Required state vocabulary: Draft / Published / Archived; Uploading / Upload complete / Upload failed / Retrying; Empty / Loading; Save and discard confirmations. Upload demonstrations must use local files, validate type/size, show truthful local progress, and never claim a remote transfer. Publish must explain it changes prototype state only. A production implementation separately requires authenticated sessions, server authorization, validation, signed uploads, safe media processing, persistent storage, actual publish/rebuild and audit logging.

## Implementation references

- Source: `src/components/WorldScene.astro`, `src/scripts/parallax.ts`, `src/styles/tokens.css`, `src/styles/global.css`.
- Native interaction primitives: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/dialog
- Motion preference: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
- Passive scroll scheduling: https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame
- Pointer capability: https://developer.mozilla.org/en-US/docs/Web/CSS/@media/pointer
- Accessibility baseline: https://www.w3.org/WAI/WCAG22/quickref/

These are implementation references, not visual artwork references. All environment artwork is original code-authored decoration for this project.
