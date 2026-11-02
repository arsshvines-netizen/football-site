# CLAUDE.md: project rules (football training website, MYP Personal Project)

Full spec: `website-spec.md`. Read it before big changes.

## Rules
1. Plain HTML, CSS and vanilla JavaScript (ES modules) only. No frameworks, npm, build tools or TypeScript.
2. No runtime internet: no CDNs, external fonts or images, analytics or trackers. System font stacks only.
3. Explain changes in plain English. Keep the code readable and commented. No clever tricks: the student must understand it.
4. Work in phases and stop for review after each one (spec Section 14).
5. Ask before assuming anything that changes design or content.
6. Users are 12-15. No personal data collection, nothing sent anywhere (localStorage only). No weight-loss, calorie, dieting or supplement advice, no maximal lifting, no training through pain.
7. Brand lives in ONE place: `assets/js/config.js` (name, tagline, nav) and `assets/css/variables.css` (colours, fonts).
8. Don't invent facts. Keep fitness/nutrition general and conservative, list sources in `assets/js/data/sources.js`, and flag anything uncertain for the coach to check.
9. Every text/background pair must meet WCAG 2.2 AA (4.5:1). White text on orange FAILS: use navy text on orange buttons and #B8460C for orange text.
10. All paths relative. Run `python3 tools/check_site.py` after changes.

## Structure
- `*.html`: one file per page. Header and footer are injected by `assets/js/layout.js` into `#site-header` / `#site-footer`, with a `<noscript>` fallback nav.
- `assets/css/`: `variables.css` (brand), `base.css` (reset/layout), `components.css` (shared pieces), `pages.css` (page-specific + print).
- `assets/js/`: `config.js`, `layout.js`, `nav.js`, `storage.js` (safe localStorage), page scripts (`plans.js` for pricing/challenge/FAQ on Home + Plans, `programmes.js`, `drills.js`, `diagrams.js`, `fitness.js`, `nutrition.js`, `tracker.js`, `feedback.js`, `sources-page.js`).
- `assets/js/data/`: all editable content (drills, programmes, fitness, nutrition, sources, plans = business model/prices/monthly challenge, feedback = tester questions).
- `assets/js/effects.js`: animations for every page (scroll reveal, counters, progress bar, tilt, back-to-top). Always respect prefers-reduced-motion.
- `assets/js/drill-modal.js`: shared drill popup (Drills + Programmes pages).
- `studio.html` + `studio.js`: creator-only page (brand kit, business plan, tester results). Unlinked, noindex, simple code gate. NOT real security: never put private info there.
- `tools/`: `check_site.py` (link checker), `serve.py` (optional server with custom 404).
- `docs/`: checklists and test results.

## Programmes page flow
A simple app, one screen at a time (programmes.js): 1) "What's your level?" 2) "What do you want to get better at?" 3) My plan (next session button, progress ring, 4x3 session grid, level-up checklist) 4) Session mode (one step at a time with a timer: warm-up, activities, cool-down) 5) Celebration (saved to tracker, effort pick). The chosen plan is remembered in localStorage (pitchpath-my-plan). Keep it simple: one question or one task per screen.

## Public vs creator content
Public pages are customer-facing only. Brand kit, colours, marketing strategy and positioning belong in studio.html, not on About. About is the founder's football story (Arssh Gupta: Mumbai City FC club footballer, school team captain, represented Mumbai and ISSO at the SGFI National Games). Don't invent specific stats, dates or trophies.

## Business layer
The site is presented as a real football training business (MYP project Criterion A learning goal: market research, value proposition, branding, pricing, marketing, customer engagement). Freemium model: Starter free; Plus and Team shown as 'Launching soon'. No payments and no data collection, so paid plans link to the Feedback page's market-research questions. Never invent testimonials or reviews.

## Run
`python3 -m http.server 8000` then open http://localhost:8000
