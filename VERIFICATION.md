# Verification — updated 5 October 2026

## Second-pass motion refinement

- Production build passed after the final geometry and fallback changes.
- Reviewed the supplied reference videos through full-duration frame samples and compared the new hero, environment, life-cycle, project and mobile renders.
- Scroll-driven food, environment, people and life-cycle chapters all reached their expected state. Final screenshots waited for settled frames rather than capturing midway through a transition.
- Pause was checked by comparing canvas screenshots before and after a pointer move: identical pixels. Resuming produced changed pixels.
- Manual perspective selection works. The grain artwork responds with small pointer tilt values; only grain and LCA receive dimensional project motion.
- Regression checks passed for project filtering, case-study open/Escape close, life-cycle keyboard control, education switching, external-link attributes, CV response, reduced motion and missing-WebGL fallback.
- No horizontal overflow at 1440, 768, 390 or 320 px. Mobile menu closure passed. A follow-up anchor check waited for native smooth scrolling to settle and measured the work section at 82.08 px beneath the header, matching the 82 px offset.
- Final production-preview motion checks recorded zero page or console errors.
- `src/content.js`, `src/styles.css` and `src/readability.css` remain unchanged from the first version.
- Final core application: approximately 129 KB gzip; optional 3D module: approximately 244 KB gzip. No new runtime dependencies or remote artwork services.

## Original full-portfolio validation — 4 October

- Production build with Vite and the lockfile-resolved dependencies.
- Chromium render and visual review of the hero, project layouts, life-cycle explorer, portrait/about, journey, publications, methods, contact and case-study modal.
- Viewports: 1440 × 1000 desktop, 390 × 844 phone; horizontal overflow also checked at 320 px and 768 px.
- All four project filters and all five case-study dialogs; Escape dismissal and focus restoration.
- Life-cycle stage selection with pointer and arrow keys.
- Experience and education switching.
- Mobile menu navigation, correct anchor position and automatic menu closure.
- Motion pause/play, perspective selection and separated scene composition.
- Reduced-motion static specimen and simulated WebGL-unavailable fallback.
- External anchors use a new tab and `noopener noreferrer`.
- All **nine supplied Drive URLs**, including original query parameters, appear intact in their relevant case studies or thesis entries.
- Downloadable original CV returns successfully.
- No page errors or major console errors in development and production-preview browser checks.
- Fonts are served locally; portrait is approximately 61 KB WebP.
- Core application is approximately 128 KB gzip; optional 3D module approximately 240 KB gzip. Reduced-motion and no-WebGL visitors do not request the 3D module.

## Scope and limits

Browser checks used desktop Chromium with mobile viewport/touch emulation. Physical iOS/Android hardware and Safari were not available. Software WebGL was used for deterministic screenshots, so no hardware-specific frame-rate claim is made.

The nine Drive files were readable through the user's connected Drive account. Exact URL verification does not certify that each file is shared publicly; report access remains governed by Google Drive permissions. LinkedIn could not be independently retrieved.

Public hosting is not claimed as verified. The repository includes an automatic build workflow and a manually triggered GitHub Pages deployment workflow; enable Pages in the new repository and run the deployment to publish it. The existing portfolio repository was not modified.
