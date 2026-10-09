# Goutham Nidhi — Food, people & planet

A responsive, interactive portfolio for food systems research, sustainability and life cycle assessment. Built from Goutham's supplied CV, portfolio, report links and portrait, with an original cream-and-earth editorial design.

## Run locally

Requires Node.js 22.12+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. The development server is local to your computer.

## Production build

```sh
npm run build
npm run preview
```

Upload the contents of `dist/` to a static host. The relative Vite base supports hosting at a domain root or under a project path. Do not open `dist/index.html` directly with a `file://` URL; use an HTTP server.

## Deploy to GitHub Pages

1. In this **new** repository, open **Settings → Pages** and choose **GitHub Actions** as the source.
2. Open **Actions → Deploy GitHub Pages → Run workflow** on `main`.
3. Wait for success and use the URL returned by the deployment job.

The deployment workflow builds and publishes `dist/` automatically on pushes to `main`; it can also be run manually. The separate build workflow checks pushes and pull requests. Pages must use **GitHub Actions** as its source: publishing the repository root directly serves the development HTML and produces a blank page. This workflow only targets this repository and does not change the separate existing portfolio repository.

For Netlify, Cloudflare Pages or Vercel, use `npm run build` and output directory `dist`, with Node 22.12+.

## Content and design updates

- `src/content.js`: verified project summaries, exact report URLs, experience, education, contact details and the conceptual life-cycle stages.
- `src/courseworkData.js`: six coursework summaries, authorship, contribution notes and supplied report URLs. `src/Coursework.jsx` and `src/coursework.css` render the compact, responsive coursework section under the main projects.
- `src/main.jsx`: page sections, publications, certifications, contact area and accessible interactions.
- `src/styles.css` and `src/readability.css`: design tokens, typography, responsive layouts and supporting text sizes.
- `src/Ecosystem.jsx`: persistent React Three Fiber sculpture, studio lighting, refractive ribbons, instanced meadow, particles and damped pointer response.
- `src/sceneGeometry.js`: deterministic organic terrain, branched roots, contour paths and curved ribbon geometry.
- `src/motion.css`: focused scroll-story and project-depth refinements layered over the existing design.
- `src/ProjectArt.jsx`: original vector illustrations, with restrained pointer tilt and scroll depth for the grain and LCA artworks.
- `public/portrait.webp`: resized/encoded supplied portrait. The face has not been retouched or warped.
- `public/goutham-nidhi-cv.pdf`: supplied CV, available for download.

Keep supplied report URLs intact, including query parameters. External reports and LinkedIn open in new tabs with `noopener noreferrer`. Change document sharing in Google Drive if recruiters cannot open a report.

## Stack and accessibility

React 19, Vite, Three.js, React Three Fiber, GSAP ScrollTrigger, Lucide icons. Fonts (DM Sans and Libre Caslon Display) are bundled locally through Fontsource; no runtime font service or API keys are required.

One canvas stays with the opening narrative. GSAP ScrollTrigger coordinates food systems → environment → people → life cycle: planted terrain opens into lobes, resource ribbons move between them, and six connected nodes reorganise into a cycle. Camera, lighting and materials change gently with the same progress value. Perspective buttons also select each chapter directly. The artwork is conceptual, not an environmental dataset.

The sculpture can be paused, including its pointer response. Rendering stops offscreen or when the tab is hidden. Mobile uses fewer plants and particles, capped pixel density, and a compact layout without the long pinned story. Reduced motion and missing WebGL use a CSS specimen. Three.js is dynamically imported; no external models, texture downloads or HDR services are required. Native scrolling is retained.

Case studies use a native modal dialog with Escape, focus trapping and focus restoration. The life-cycle explorer supports arrow keys, Home and End. All controls are keyboard accessible, the page has a skip link, and mobile navigation supports Escape.

## Factual boundaries

See `CONTENT_SOURCES.md` for provenance. The LCA comparison is explicitly presented as a **proposal**; no comparative impact results or environmental statistics have been invented. Lingonträdgård and Eat Local Lund are proposals, not implemented outcomes. ESG is a career interest, not an unsupported claim of prior ESG employment. Dates are based on the supplied CV and portfolio. LinkedIn access was unavailable during development, so it is linked but not used as an independent factual source.

The downloaded original CV contains the personal and reference details supplied by its author. Replace that file if you prefer a version with fewer details before a public launch.

## Validation

Production build and Chromium browser checks cover desktop, phone and tablet widths; navigation; filters; case-study open/close/focus; keyboard life-cycle controls; experience/education switching; supplied URLs; downloadable CV; reduced motion; WebGL fallback; horizontal overflow and console errors. See `VERIFICATION.md` for the recorded results and limitations.
