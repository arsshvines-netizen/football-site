# Functionality checklist

**Target:** 100% pass on all three devices.
The "Auto" column was filled by an automated browser test (Chromium, emulated at 320/360/768/1280px) on 2 Nov 2026. **You still need to test on your real laptop, tablet and phone** and fill in the last three columns with Pass/Fail.

| # | Page / feature | What to check | Auto | Laptop | Tablet | Phone |
|---|---|---|---|---|---|---|
| 1 | All pages | Load with no console errors, no sideways scrolling, one H1 | Pass | | | |
| 2 | Header | Same menu, same order, on every page; current page highlighted | Pass | | | |
| 3 | Logo | Clicking the logo goes to Home | Pass | | | |
| 4 | Mobile menu | Opens/closes by tap, Enter/Space, Escape; shows "Close" | Pass | | | |
| 5 | Skip link | Tab once on any page → "Skip to main content" appears and works | Pass | | | |
| 6 | Footer | Links to all pages + Feedback + Sources; disclaimer shown | Pass | | | |
| 7 | Home | Start Training → Programmes; Track My Progress → Tracker | Pass | | | |
| 8 | Home | 5 content cards link to the right pages | Pass | | | |
| 9 | Home | "Pick your position" opens Drills already filtered | Pass | | | |
| 10 | Programmes | Level tabs switch content; level saved in URL (?level=) | Pass | | | |
| 11 | Programmes | Arrow keys move between tabs | Pass | | | |
| 12 | Programmes | Session accordions open/close | Pass | | | |
| 13 | Programmes | Drill links in sessions open that drill | Pass | | | |
| 14 | Programmes | Level-up checklist ticks are remembered after reload | Pass | | | |
| 15 | Programmes | Print this plan → print preview shows all sessions, no menu | Pass* | | | |
| 16 | Drills | Position / Level / Focus filters work | Pass | | | |
| 17 | Drills | Text search works; result count updates | Pass | | | |
| 18 | Drills | "No results" message + Clear filters | Pass | | | |
| 19 | Drills | Card opens detail popup with diagram; Escape/× closes it | Pass | | | |
| 20 | Drills | URL links work (?position=winger, ?drill=gk-07) | Pass | | | |
| 21 | Fitness | Contents links jump to each section | Pass | | | |
| 22 | Fitness | Warm-up timer: Start, Pause, Resume, Reset | Pass | | | |
| 23 | Fitness | Strength table stacks into cards on phone | Pass | | | |
| 24 | Nutrition | Plate picture and key show | Pass | | | |
| 25 | Nutrition | Vegetarian / non-vegetarian switch changes meals | Pass | | | |
| 26 | Tracker | Empty state shown when no data | Pass | | | |
| 27 | Tracker | Log session saves; empty date / negative minutes rejected | Pass | | | |
| 28 | Tracker | Skill ratings save; line chart draws | Pass | | | |
| 29 | Tracker | Bar chart of minutes per week draws | Pass | | | |
| 30 | Tracker | Stats: sessions, minutes, streak, weekly goal | Pass | | | |
| 31 | Tracker | History newest first; delete one entry (with confirm) | Pass | | | |
| 32 | Tracker | Export downloads JSON | Pass | | | |
| 33 | Tracker | Import JSON (with confirm); broken entries skipped | Pass | | | |
| 34 | Tracker | Reset (with "Are you sure?") clears everything | Pass | | | |
| 35 | Tracker | Large data: 600 sessions load and chart correctly | Pass | | | |
| 36 | Tracker | Data still there after closing and reopening browser | | | | |
| 37 | Feedback | Validation shows errors for missing answers | Pass | | | |
| 38 | Feedback | Save response; summary table updates | Pass | | | |
| 39 | Feedback | Download gives JSON and CSV files | Pass | | | |
| 40 | Sources | List shows in MLA format, A-Z | Pass | | | |
| 41 | 404 | Unknown page shows custom 404 (when using tools/serve.py) | Pass | | | |
| 43 | Plans | 3 plan cards show; Starter → Programmes; Launching soon → Feedback; FAQ opens | Pass | | | |
| 44 | Home | Challenge of the month shows current month; buttons work | Pass | | | |
| 45 | Tracker | Badges show earned/locked and update after logging | Pass | | | |
| 46 | Feedback | Market research answers saved and summarised | Pass | | | |
| 42 | Links | `python3 tools/check_site.py` reports PASS | Pass | | | |

\* Print layout checked by CSS review only. Do a real print preview to confirm.
