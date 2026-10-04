# Verification — 4 October 2026

## Passed

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
