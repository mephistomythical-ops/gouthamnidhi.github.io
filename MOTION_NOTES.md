# Motion refinement — 5 October 2026

## Preserved

The existing cream and earth palette, DM Sans and Libre Caslon typography, editorial grid, project order, research summaries, report links and recruiter navigation remain. Content in `src/content.js` is unchanged. A life-cycle perspective extends the existing opening controls using wording already present in the portfolio.

## Reference comparison

Both supplied recordings were reviewed using sampled frames across their full durations, then compared with browser renders of the portfolio.

- Reference 1 informed the dominant treatment: light backgrounds, organic detail, a floating ecological specimen and separation into connected forms as the page scrolls. This implementation uses an irregular planted landscape rather than an Earth globe. Roots, grain heads, layered terrain and gently moving foliage replace the earlier smooth stacked discs.
- Reference 2 informed only material and spatial treatment: a locally generated studio environment, curved transmissive ribbons, reflective nodes, soft rim light and damped pointer/camera response. Its dark palette and dramatic camera moves were not adopted.

The result is an original procedural sculpture, not a recreation of either reference's assets. The reference split describes the art direction, not a measurable visual-equivalence score.

## Choreography

The desktop opening uses one persistent canvas and one continuous phase value. Food introduces the planted specimen; environment opens its terrain and resource ribbons; people emphasises the six connected nodes; life cycle reorganises the network into a closed path. Subtle camera position, scale, material roughness, lighting and particles follow that progression. Perspective buttons override the chapter until the next scroll.

Project dimensionality is deliberately limited to the grain and LCA illustrations. Both keep their original vector compositions and gain a small pointer tilt, soft light response and restrained vertical scroll motion. Other illustrations remain still.

## Practical limits

Vegetation uses instancing and deterministic geometry. Pixel density is capped at 1.35 on desktop and 1 on mobile; transmissive rendering uses half resolution. Reduced motion uses the static fallback, and the long desktop narrative collapses on mobile and without WebGL. Software-rendered browser checks validate appearance and behaviour, but do not establish frame rates on physical devices.
