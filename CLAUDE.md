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
- `assets/js/`: `config.js` (brand, nav, footer link groups), `layout.js` (header + footer), `nav.js`, `storage.js` (safe localStorage + in-page confirm box), page scripts (`home.js` (Home screen), `plans.js` for pricing/challenge/FAQ on Plans, `programmes.js`, `planner.js` (Plus), `drills.js`, `diagrams.js`, `fitness.js`, `nutrition.js`, `tracker.js`, `feedback.js`, `sources-page.js`, `studio.js`).
- Shared helpers: `video.js` (video player + popup), `tabs.js` (tabs + level switchers), `effects.js` (animations: scroll reveal, `data-in-view`, counters, progress bar, tilt, back-to-top; always respect prefers-reduced-motion), `drill-modal.js` (drill popup with save + copy link), `favourites.js` (saved drills), `quiz.js` (position quiz popup), `plus.js` (Plus membership + unlock popup), `food-helper.js` (Nutrition chat, Plus).
- `assets/js/data/`: all editable content (drills, programmes, fitness, nutrition, sources, plans = business model/prices/monthly challenge, feedback = tester questions, quiz = position quiz, videos = training video file names).
- Videos: clips live in `assets/video/` (MP4, under 1 min, under ~10MB) and are switched on by typing the file name in `assets/js/data/videos.js`. `video.js` shows them in the drill popup, the Fitness warm-up and programme sessions. Empty name = nothing shown. Studio lists missing videos. Only film the founder or players with parental consent.
- `studio.html` + `studio.js`: creator-only page (brand kit, business plan, tester results, sources still to check). Unlinked, noindex, simple code gate. NOT real security: never put private info there.
- `tools/`: `check_site.py` (links, missing files, external loads, duplicate @keyframes names), `serve.py` (optional server with custom 404).
- `docs/`: checklists and test results.

## Keep pages short and tidy
- App feel, not an info website. Home (`index.html` + `home.js`) is an app home screen: greeting, a TODAY card (your next programme session from localStorage, or "Get your free plan"), THIS WEEK (days trained, from the tracker), 6 app tiles, challenge + Plus cards, a small founder strip. No long sections on Home.
- Phones/tablets get a bottom tab bar (Home, Train, Drills, Planner, Tracker) built by `layout.js`.
- Not text heavy: page intros are one short line. Big, bold headings.
- The header keeps a fixed height (it must not shrink on scroll: that moves the page). Height lives in `--header-height` (88px desktop, 76px tablet, 70px phone); sticky tabs use it.
- Long topics use tabs (`tabs.js`): Fitness, Nutrition and Tracker show one topic at a time, and `page.html#panel-id` opens a tab directly.
- Drills shows 12 cards at a time ("Show more"). The Feedback form is step-by-step.
- Notes for the creator (to-dos, flags) go on studio.html, never on public pages.
- Every page gets the same footer from `layout.js` (next-step card, link groups from `FOOTER_GROUPS`, safety disclaimer).
- Every `@keyframes` name must be unique (a second one silently replaces the first). `check_site.py` checks this.
- Photos: only licensed images (own photos, or Unsplash / Pexels / Wikimedia Commons with a free licence), saved in `assets/img` (never hot-linked), compressed under ~200KB, credited on the Sources page. Never real professional players' photos or club crests.

## Programmes page flow
A simple app, one screen at a time (programmes.js): 1) "What's your level?" 2) "What do you want to get better at?" 3) My plan (a "Today" card with Start button and a short timeline, then "Your 4 weeks": week buttons, each showing 3 session rows with Done / Up next / Later, plus the level-up checklist) 4) Session mode (one step at a time with a timer: warm-up, activities, cool-down) 5) Celebration (saved to tracker, effort pick). The chosen plan is remembered in localStorage (pitchpath-my-plan). Keep it simple: one question or one task per screen.

## Public vs creator content
Public pages are customer-facing only. Brand kit, colours, marketing strategy and positioning belong in studio.html, not on About. About is the founder's football story (Arssh Gupta: Mumbai City FC club footballer, school team captain, represented Mumbai and ISSO at the SGFI National Games). Don't invent specific stats, dates or trophies.

## Business layer
The site is presented as a real football training business (MYP project Criterion A learning goal: market research, value proposition, branding, pricing, marketing, customer engagement). Freemium model: Starter free; Team shown as 'Launching soon'. Never invent testimonials, reviews or sales claims (no "most popular").

## Plus (paid plan)
- Plus (₹99/month, monthly only) = ALL 35 drills on the Drills page (25 normal + 10 Plus-only, `plus: true` in `data/drills.js`) + the Weekly Planner (`planner.html` + `planner.js`) + the Food Helper chat on Nutrition (`food-helper.js` + `data/food-helper.js`) + a gold ★ PLUS badge in the header. Gold (`--plus-gold`) is the Plus colour: navy text on gold, gold text only on navy.
- Free players: Drills page cards are locked, BUT drills inside Programme sessions stay free (`openDrillModal(id, opener, { free: true })` in programmes.js). Nutrition tips, Fitness, Programmes and Tracker are free.
- Food Helper is NOT a real AI: keyword matching over answers built from `data/nutrition.js`. Nothing is saved or sent. Safety replies (weight, dieting, calories, health worries) are checked first. Keep every answer sourced and conservative.
- `plus.js`: `isPlus()` / `setPlus()` (localStorage `pitchpath-plus`), the "Unlock with Plus" popup. `drill-modal.js` refuses Plus drills for non-members, so every route is locked.
- Only the founder has Plus: switched on per device in studio.html ("My Plus membership"). It is a DEMO LOCK, not real security; real paid access needs payments plus a server.
- No payment link yet: `PLUS_BUY_LINK` in `data/plans.js` is empty, so buttons say payments open soon. The founder will supply the link. Always tell players to ask a parent before buying.

## Restore point: "BANANA"
If the user says BANANA, put the site back EXACTLY as it was before Plus: restore `main` to the branch `banana-restore-point` (commit 525f0d1), for example `git checkout banana-restore-point -- . && git clean` of files added since, commit, push, and check the Vercel deploy.

## Run
`python3 -m http.server 8000` then open http://localhost:8000
