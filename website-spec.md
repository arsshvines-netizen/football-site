# Football Training Website: Full Build Specification

> **How to use this file:** Put it in the project folder and start Claude Code there. First message: *"Read website-spec.md fully. Summarise the plan back to me in 10 bullets, then wait for me to say GO before writing any code."* Then build one phase at a time (see Section 14).

---

## 1. Project Summary

I am a student building a football training website for my MYP Personal Project. The website is the main product. It is for **young aspiring footballers aged 12-15** and gives them structured training they can follow by themselves or with a coach.

The website must contain five content areas:

1. Training programmes (with progression)
2. Position-specific drills
3. Fitness guidance
4. Nutrition guidance
5. A player progress tracker

It must also have a **unique brand identity** (logo, colours, fonts, visual style). The website will later be supported by a marketing plan and three promotional materials, which I make separately. The website itself must look and feel like a real sports training brand.

**Hosting:** localhost only, on my laptop. There is no deployment, no database, no server-side code and no user accounts. It must work by running one simple command and opening a browser.

---

## 2. Rules for Claude Code (read before writing anything)

1. **Plain HTML, CSS and JavaScript only.** No frameworks, no npm packages, no build tools, no TypeScript. Vanilla JS with ES modules or plain script tags.
2. **No external dependencies at runtime.** No CDN scripts, no external fonts that break offline, no external images, no analytics, no trackers. The site must work with no internet. (System font stacks are fine. If using a web font, it must be saved locally in `assets/fonts/` with a system fallback.)
3. **Explain as you go.** I must understand my own code. After each phase, give me a 5-line plain-English explanation of what each new file does. Keep code readable, with clear comments, simple function names and no clever tricks.
4. **Work in phases** (Section 14). Stop at the end of each phase and wait for my review. Never build the whole site in one go.
5. **Ask before assuming** anything not in this file that would change the design or content.
6. **Safety for young users.** No collection of personal data. No sending data anywhere. Everything is stored in the user's own browser only. No weight-loss, calorie-restriction or supplement advice (see Section 8 and 9).
7. **Keep the brand easy to change.** The brand name, colours, fonts and logo must be defined in **one place** (a `config.js` file and CSS variables) so I can rename or recolour the whole site in minutes.
8. **Don't invent facts.** For fitness and nutrition content, write general, conservative, age-appropriate guidance. Add a `sources.html` page listing where information came from (see Section 10). Anything you are not sure is correct, flag it for me to check with my coach.
9. **Create a `CLAUDE.md`** file in the project root summarising rules 1-8 and the folder structure, so future sessions remember them.

---

## 3. How It Runs (localhost)

- The site is a static website. It is opened through a local web server (not by double-clicking files), because some browser features and module scripts need `http://`.
- **Start command (any laptop with Python):**
  - Mac/Linux: `python3 -m http.server 8000`
  - Windows: `python -m http.server 8000`
- **Open on the laptop:** `http://localhost:8000`
- **Test on my phone and tablet (same Wi-Fi):**
  1. Find the laptop's local IP address (e.g. 192.168.x.x).
  2. Start the server with `python -m http.server 8000 --bind 0.0.0.0`
  3. On the phone, open `http://<laptop-ip>:8000`
  4. If it doesn't load, allow Python through the laptop firewall for private networks.
- Create a `README.md` with these instructions in simple language, plus a one-line way to stop the server (Ctrl+C).
- All links and asset paths must be **relative** (e.g. `assets/css/styles.css`), so the site works from the root and in subfolders.

---

## 4. Brand Identity

The brand name is not final. Use **placeholder values stored in `assets/js/config.js`** and CSS variables in `assets/css/variables.css`.

- **Working brand name:** `PITCHPATH` (placeholder, easy to change)
- **Tagline (placeholder):** "Train with a plan."
- **Personality:** energetic, confident, modern, encouraging, clear. Aimed at teens, not at professionals. It should feel like a sports brand, not a school worksheet.
- **Logo:** create an **original** logo as an inline/standalone **SVG** in `assets/img/logo.svg` (and a smaller icon version `logo-icon.svg` for the favicon). It must be simple and recognisable at small sizes, use only the brand colours and must not copy any existing club, brand or sports logo. Provide a version for light backgrounds and for dark backgrounds.
- **Colour palette (defaults, change in one place):**
  - Primary (pitch green): `#0B6E4F`
  - Secondary (energy orange): `#F26B21`
  - Dark (night navy): `#0D1B2A`
  - Light (off-white): `#F7F9FA`
  - Accent (highlight yellow): `#FFC857`
  - Text on light: `#0D1B2A`, text on dark: `#F7F9FA`
- **Contrast rule:** every text and background pair must meet **WCAG 2.2 AA (at least 4.5:1 for normal text, 3:1 for large text)**. Check each pair, and adjust colours if one fails. Never use orange text on green, or yellow text on white.
- **Typography:** maximum **two font families**: one for headings (bold, sporty, e.g. a condensed or heavy sans-serif) and one for body text (highly readable sans-serif). Use system font stacks with fallbacks unless fonts are stored locally. Body text at least 16px, line height about 1.6.
- **Visual style:** bold headings, diagonal or angled section dividers, rounded cards, plenty of white space, strong buttons, subtle hover and focus effects. Use football-inspired shapes (pitch lines, circles, arrows) created in CSS/SVG. **No copyrighted images, no club crests, no real player photos.** Where photos would normally go, use CSS/SVG illustrations or labelled placeholders (`assets/img/placeholder-*.svg`) that I will replace with my own photos.
- **Consistency:** the same header, footer, buttons, cards and colours on every page. Reusable CSS classes, not one-off styling.

---

## 5. Site Map and Navigation (the 3-click rule)

**Every major section must be reachable within 3 clicks of the homepage.** In practice, all main pages are reachable in **1 click** from the main menu on every page.

```
Home (index.html)
├── Training Programmes (programmes.html)
│     └── Beginner / Intermediate / Advanced (tabs on the same page, with detail pages optional)
├── Position Drills (drills.html)
│     └── filter by position, level and focus
├── Fitness (fitness.html)
├── Nutrition (nutrition.html)
├── Progress Tracker (tracker.html)
├── About the Brand (about.html)
├── Feedback (feedback.html)       <- for my testers
└── Sources (sources.html)
```

- **Main navigation (on every page):** Home, Programmes, Drills, Fitness, Nutrition, Tracker, About. (Feedback and Sources may be in the footer.)
- **Same position and order on every page.** The current page must be visibly highlighted (use `aria-current="page"`).
- **Mobile:** the menu collapses into a hamburger button that opens a full-width menu. It must open and close by tap, keyboard (Enter/Space/Escape) and have a clear "Close" state. The logo always links to Home.
- **Footer on every page:** logo, short tagline, quick links to all main pages, Feedback and Sources, and the disclaimer text (Section 10).
- Include a **"skip to main content"** link as the first focusable element on every page.
- Include a custom **404 page** (`404.html`) with a link home.
- Use **breadcrumbs** on any page that is more than one level deep.

---

## 6. Page-by-Page Requirements

### 6.1 Home (`index.html`)
- Hero section: headline (e.g. "Train smarter. Play better."), one-sentence description for 12-15 year olds, and two big buttons: **Start Training** (to Programmes) and **Track My Progress** (to Tracker).
- "How it works" in three steps: Choose your level, Train with the programme and drills, Track your progress.
- Cards linking to each of the five content areas, each with an icon and one-line description.
- A "Pick your position" quick-selector that links to the Drills page pre-filtered (using URL parameters like `drills.html?position=winger`).
- A short "Why [brand name]?" section (structured, age-appropriate, built by a young player).
- A reminder/disclaimer strip (Section 10).

### 6.2 Training Programmes (`programmes.html`)
- Three levels: **Beginner, Intermediate, Advanced**, shown as tabs or a selector. The selected level is remembered in the URL (`?level=beginner`).
- Each level has **three weekly programmes** (one for each focus): **Technical Skills**, **Game Understanding**, and **Physical Development**. So 9 programmes in total.
- Each programme is a **4-week plan** with 3 sessions per week. Each session has: aim, total duration (45-75 min), warm-up, 2-4 main activities (linking to drills on the Drills page where possible), and a cool-down.
- Show **progression** clearly: what the player should be able to do before moving up a level, and what changes between weeks (e.g. more touches, less space, add opposition).
- Include a "Ready to level up?" checklist at the end of each level.
- Sessions can be expanded/collapsed (accordion) so the page isn't overwhelming.
- A "Print this plan" button using a print stylesheet.

### 6.3 Position Drills (`drills.html`)
- Positions: **Goalkeeper, Defender, Midfielder, Winger, Striker.** (Five positions.)
- **Minimum 8 drills per position (40 total)**, spread across Beginner, Intermediate and Advanced.
- Filters: **Position, Level, Focus** (e.g. passing, dribbling, shooting, defending, first touch, speed/agility, positioning, goalkeeping), plus a **text search** and a "Clear filters" button. Show the number of results. Show a friendly "no results" message.
- Drills are shown as cards. Clicking a card opens a detail view (modal or detail section) with: name, position, level, focus, duration, players needed, equipment, space needed, **setup**, **step-by-step instructions**, **coaching points**, **how to make it easier**, **how to make it harder**, and a simple **diagram** (SVG drawn in code: pitch lines, cones as circles/triangles, arrows for movement).
- Filters work from the URL so the Home page "Pick your position" links work.
- All drill data lives in **one data file** (`assets/js/data/drills.js`), not hard-coded in HTML, so I can edit drills easily. The page builds itself from that data.

**Drill data format (each drill is an object):**
```js
{
  id: "wing-01",
  name: "Cone Dribble to Cross",
  position: "winger",          // goalkeeper | defender | midfielder | winger | striker
  level: "beginner",           // beginner | intermediate | advanced
  focus: ["dribbling", "crossing"],
  durationMin: 15,
  players: "1 (plus a partner or goal)",
  equipment: "6 cones, 1 ball, 1 goal",
  space: "30m x 20m",
  setup: "...",
  steps: ["...", "..."],
  coachingPoints: ["...", "..."],
  easier: "...",
  harder: "...",
  diagram: "wing-01"            // key for a diagram drawing function
}
```

### 6.4 Fitness (`fitness.html`)
Content for ages 12-15, **bodyweight only, no maximal lifting, no heavy weights**.
- **Why fitness matters in football** (short, clear).
- **Warm-up routine** (dynamic: jogging, leg swings, high knees, walking lunges, etc.), with a step-by-step list and a timer-based "Start warm-up" helper.
- **Speed and agility** (ladder drills, cone shuttles, short sprints with full recovery).
- **Strength and stability** (squats, lunges, glute bridges, planks, push-ups, calf raises) with beginner / intermediate / advanced versions and sensible reps and sets.
- **Endurance** (age-appropriate interval running, small-sided-game style conditioning).
- **Mobility and cool-down** (static stretching, breathing).
- **Rest, sleep and recovery:** rest days, sleep for teenagers, listening to your body.
- **Injury prevention and safety:** warm up always, stop if there is pain, train on safe surfaces, tell a coach/parent if you feel unwell or injured, see a doctor for ongoing pain.
- A **weekly schedule example** for each level that fits in with school and club training.

### 6.5 Nutrition (`nutrition.html`)
Content must be **general, balanced and food-based**. **No calorie counting, no weight-loss advice, no supplement recommendations, no dieting.** Include a clear note that supplements, energy drinks and protein powders are not needed for young players.
- **Eat enough, eat balanced:** carbohydrates (main fuel), protein (muscle repair), healthy fats, fruits and vegetables, vitamins and minerals.
- **The "football plate":** simple visual (SVG) showing proportions of carbohydrates, protein, vegetables and fruit.
- **Hydration:** drink water through the day, before, during and after training. Simple urine-colour check explained in a respectful way.
- **Match day and training day timing:** what to eat a few hours before, a light snack close to training, what to eat afterwards. Show it as a timeline graphic.
- **Sample day of meals and snacks** for a training day and a rest day. Include **vegetarian and non-vegetarian options** and foods that are widely available and affordable.
- **Myths vs facts** (e.g. skipping meals, energy drinks, "more protein = more muscle").
- A note that every young person is different and growing, and that a doctor or registered dietitian should be asked about any special needs, allergies or concerns.
- Sources listed at the bottom, linking to `sources.html`.

### 6.6 Player Progress Tracker (`tracker.html`)
Works fully in the browser, with data saved in **`localStorage`** (no account, no server).
- **Profile (optional):** nickname (no real names needed), position, level, weekly goal (sessions per week).
- **Log a session:** date, session type (technical, fitness, match, other), duration (minutes), effort (1-10 scale with a simple description of each number), position, short notes.
- **Skill ratings:** the player rates themselves 1-5 on passing, dribbling, shooting, first touch, speed, stamina, and position-specific skill. Ratings can be updated over time and saved with a date so progress can be seen.
- **Dashboard:**
  - Total sessions, total minutes, current weekly streak, and "goal progress this week".
  - **Line chart** of skill ratings over time.
  - **Bar chart** of minutes trained per week.
  - **Session history table** (newest first) with the option to delete one entry.
- **Charts built from scratch with SVG or `<canvas>`**: no chart libraries. They must be readable on a phone, have labels, and include text alternatives for screen readers.
- **Export / Import:** download all data as a JSON file, and import it back. A confirm dialog before importing or resetting.
- **Reset** button with a clear "Are you sure?" dialog.
- **Validation:** do not accept empty dates, negative durations or ratings outside the valid range. Show friendly inline error messages.
- **Empty state:** when there's no data, show a helpful message and an example, not an empty box or errors.
- **Privacy note on the page:** "Your data stays on this device in your browser. Nothing is sent anywhere."
- Wrap all `localStorage` reads and writes in try/catch, and show a message if storage is unavailable.
- Keep the saved data in a versioned format (`{ version: 1, ... }`) so I can update it later without breaking old data.

### 6.7 About the Brand (`about.html`)
- The story: why the brand was created (a young player who saw that beginners struggle to find structured training).
- Mission, values, who it's for (the target audience), and what makes it different (structured progression, position-specific, free, tracks progress).
- A "Brand kit" section showing the **logo, colour palette (with hex codes), fonts and style rules**. I will screenshot this as evidence for my branding criterion.
- Placeholder area for "Meet the creator" (I will fill in).

### 6.8 Feedback (`feedback.html`)
For my testers (to gather evidence for my success criteria). Saves locally and can be exported. Nothing is sent online.
- Tester code (e.g. T1, T2; no real names), age group, position.
- Short questions with 1-5 ratings: content usefulness, content understandable, ease of navigation, visual appeal, professionalism, would you use it again.
- Navigation task log: for each task (find a winger programme, find nutrition guidance, open the progress tracker, find a defender drill, find the warm-up), record: completed unaided yes/no, number of clicks, time in seconds.
- Free-text boxes: what did you like, what was confusing, what would you change.
- "Save response" stores it in `localStorage`. A "Download all responses (JSON and CSV)" button exports everything.

### 6.9 Sources (`sources.html`)
- Lists all sources used for the content (author, title, organisation, date, link) in MLA 9 style.
- A short "How this site's content was checked" statement.
- Leave an easy-to-edit list (a data file) so I can add sources.

---

## 7. Responsiveness and Devices

The site must work on **laptop, tablet and phone**.

- Mobile-first CSS using flexbox and CSS grid.
- Breakpoints (approx.): phone up to 600px, tablet 601-1024px, laptop 1025px and above.
- `<meta name="viewport" content="width=device-width, initial-scale=1">` on every page.
- No horizontal scrolling on any screen from 320px wide.
- Tap targets at least 44x44px on touch screens.
- Images and diagrams scale (`max-width: 100%`).
- Tables become scrollable or stack into cards on narrow screens.
- Test in browser device mode at 360px, 768px and 1280px, and on a real phone and tablet over the local network.

---

## 8. Accessibility and Quality Requirements

- Semantic HTML5 (`header`, `nav`, `main`, `section`, `footer`, correct heading order: one `h1` per page).
- Keyboard accessible everywhere: logical tab order, visible focus outlines, no keyboard traps.
- `alt` text on meaningful images; decorative SVGs hidden from screen readers; form fields with proper `label`s; buttons are `<button>`, links are `<a>`.
- ARIA used only where needed (e.g. `aria-expanded` on the menu button and accordions, `aria-current` in nav, `aria-live` for filter result counts).
- Colour is never the only way to show information.
- Respect `prefers-reduced-motion` (turn off big animations).
- Text must be easy to read for a 12-year-old (short sentences, plain words, explain football terms).
- Fast: no heavy images, nothing over about 200KB unless necessary.
- No console errors, no broken links, no 404s for assets.

---

## 9. Content Safety Rules (important for under-16 users)

- Training advice is general and conservative. Include "ask your coach, parent or doctor" notes where relevant.
- **Never** include: weight-loss or dieting advice, calorie targets, supplement/creatine/protein-powder/energy-drink recommendations, extreme training volumes, training through pain, or maximal weightlifting.
- Training loads must increase **gradually**, with rest days built in.
- Keep language positive and inclusive. Don't use body-image comparisons.
- Where something may need professional checking (e.g. injury, nutrition for medical conditions), say so clearly.

---

## 10. Disclaimer Text (footer and relevant pages)

> This website gives general training information for young players. It is not medical advice. Always warm up, stop if something hurts, and talk to a coach, parent or doctor if you are unsure or injured.

---

## 11. Folder Structure

```
football-site/
├── CLAUDE.md                  (project rules and summary, auto-read by Claude Code)
├── README.md                  (how to run on localhost)
├── website-spec.md            (this file)
├── index.html
├── programmes.html
├── drills.html
├── fitness.html
├── nutrition.html
├── tracker.html
├── about.html
├── feedback.html
├── sources.html
├── 404.html
├── assets/
│   ├── css/
│   │   ├── variables.css      (brand colours, fonts, spacing)
│   │   ├── base.css           (reset, typography, layout)
│   │   ├── components.css     (buttons, cards, nav, accordion, modal)
│   │   └── pages.css          (page-specific styles)
│   ├── js/
│   │   ├── config.js          (brand name, tagline, nav links)
│   │   ├── layout.js          (injects the shared header and footer on every page)
│   │   ├── nav.js             (mobile menu)
│   │   ├── programmes.js
│   │   ├── drills.js          (filtering, search, detail view)
│   │   ├── diagrams.js        (draws drill diagrams in SVG)
│   │   ├── tracker.js         (logging, storage, charts)
│   │   ├── feedback.js
│   │   ├── storage.js         (safe localStorage helpers)
│   │   └── data/
│   │       ├── drills.js
│   │       ├── programmes.js
│   │       ├── fitness.js
│   │       ├── nutrition.js
│   │       └── sources.js
│   ├── img/                   (logo.svg, logo-icon.svg, placeholders, icons)
│   └── fonts/                 (only if using local web fonts)
└── docs/
    ├── functionality-checklist.md
    └── test-results/
```

- The header and footer are written **once** (in `layout.js`) and shared by every page, so navigation can never be inconsistent. If JavaScript is turned off, show a simple fallback nav in a `<noscript>` block.

---

## 12. Testing and Evidence (for my success criteria)

Create these in `docs/`:

1. **`functionality-checklist.md`**: a table listing every page, nav link, button, filter, form and tracker feature, with columns for Laptop / Tablet / Phone and Pass/Fail. This is my evidence for the Functionality criterion (target: 100% pass on all three devices).
2. **`navigation-test-tasks.md`**: the five test tasks for my testers (find a winger programme, find nutrition guidance, open the progress tracker, find a defender drill, find the warm-up), with a table to record unaided completion, number of clicks and time.
3. **`content-checklist.md`**: confirms the five content areas, the three progression levels and the minimum drills per position (at least 8 drills for each of the 5 positions).
4. **`branding-checklist.md`**: logo, colours, fonts and style rules, with a list of every page to check them against, and a table of contrast ratios for every colour pair used.
5. At the end of every phase, **run an automated check script** (a simple Node-free approach, e.g. a Python script) that scans for broken internal links and missing assets, and report the result.

---

## 13. Definition of Done (what a "Grade 4" website looks like)

- [ ] All 5 content areas complete: programmes (3 levels, 9 programmes), drills (40+ across 5 positions), fitness, nutrition, working tracker.
- [ ] Every page, link, button, filter, form and chart works with no console errors.
- [ ] Works on laptop, tablet and phone with no horizontal scrolling.
- [ ] Every major section is reachable in 3 clicks or fewer from Home (ideally 1).
- [ ] Consistent header, footer, navigation, logo, colours and fonts on every page.
- [ ] Original logo, defined palette, no more than two fonts, all text contrast at least 4.5:1.
- [ ] Tracker saves, loads, exports, imports and resets safely, with validation and empty states.
- [ ] Sources page complete; disclaimer on every page footer.
- [ ] All checklists in `docs/` created and filled in.
- [ ] `README.md` explains how to start the server on localhost and on a phone.

---

## 14. Build Order (stop after each phase for my review)

**Phase 1: Foundation.** Folder structure, `CLAUDE.md`, `README.md`, `config.js`, CSS variables, base styles, shared header and footer (`layout.js`), mobile nav, logo SVG, a basic Home page and the 404 page. *Check: runs on localhost, nav works on laptop and phone.*

**Phase 2: Brand and Home.** Finish the brand system (components, buttons, cards), complete the Home page, About page (with brand kit) and the contrast check table. *Check: branding checklist started.*

**Phase 3: Programmes and Drills data.** Programmes page with levels and accordions. Drill data file with all 40+ drills and diagram drawings. Drills page with filters, search and detail view. *Check: content checklist.*

**Phase 4: Fitness and Nutrition.** Both pages with all required sections and the data files. Sources page started. *Check: content safety rules (Section 9).*

**Phase 5: Progress Tracker.** Logging, skill ratings, dashboard, charts, export/import, reset, validation. *Check: test with empty, normal and large amounts of data.*

**Phase 6: Feedback, QA and Polish.** Feedback page, accessibility pass, responsive pass at 360 / 768 / 1280, broken-link script, functionality checklist, final fixes. *Check: Definition of Done (Section 13).*

---

## 15. First Message Checklist for Claude Code

After reading this file, reply with:
1. A 10-bullet summary of the plan.
2. Any questions that block you (maximum 5).
3. The proposed brand name options (3) if you think `PITCHPATH` should be changed, with a one-line reason each.
4. Confirmation that you will stop after each phase.

Then **wait for me to say GO** before creating any files.
