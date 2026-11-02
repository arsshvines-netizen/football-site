# Branding checklist

## Brand elements
| Element | Value | Where defined |
|---|---|---|
| Name | PITCHPATH (placeholder) | `assets/js/config.js` |
| Tagline | "Train with a plan." | `assets/js/config.js` |
| Logo | Original SVG: ball → curved orange arrow path over a pitch centre circle | `assets/img/logo.svg`, `logo-dark.svg`, `logo-icon.svg` |
| Colours | Green #0B6E4F, Orange #F26B21, Navy #0D1B2A, Off-white #F7F9FA, Yellow #FFC857 (+ deep orange #B8460C for text) | `assets/css/variables.css` |
| Heading font | Arial Black / Segoe UI Black (heavy system sans-serif) | `--font-heading` |
| Body font | System UI sans-serif, 16px, line height 1.6 | `--font-body` |
| Style | Bold uppercase headings, diagonal section edges, rounded cards with coloured top edge, pill buttons, pitch-line SVGs | `components.css` |

Brand kit evidence: screenshot the **Brand kit** section on `about.html`.

## Check every page
| Page | Logo in header + footer | Same nav | Brand colours | Two fonts only | Disclaimer in footer |
|---|---|---|---|---|---|
| index.html | | | | | |
| programmes.html | | | | | |
| drills.html | | | | | |
| fitness.html | | | | | |
| nutrition.html | | | | | |
| tracker.html | | | | | |
| about.html | | | | | |
| feedback.html | | | | | |
| sources.html | | | | | |
| 404.html | | | | | |

## Contrast ratios (WCAG 2.2 AA: at least 4.5:1 for normal text)
Calculated with the WCAG relative-luminance formula.

| Pair used on the site | Text | Background | Ratio | Result |
|---|---|---|---|---|
| Navy text on off-white page | #0D1B2A | #F7F9FA | 16.47:1 | PASS |
| Navy text on white card | #0D1B2A | #FFFFFF | 17.39:1 | PASS |
| Off-white text on navy header/footer | #F7F9FA | #0D1B2A | 16.47:1 | PASS |
| Grey footer text on navy | #B8C4CF | #0D1B2A | 9.80:1 | PASS |
| Yellow text on navy (highlights) | #FFC857 | #0D1B2A | 11.31:1 | PASS |
| Navy text on yellow (active nav, disclaimer) | #0D1B2A | #FFC857 | 11.31:1 | PASS |
| White text on green (page heroes, green button) | #FFFFFF | #0B6E4F | 6.25:1 | PASS |
| Navy text on orange button | #0D1B2A | #F26B21 | 5.72:1 | PASS |
| Green link text on off-white | #0B6E4F | #F7F9FA | 5.92:1 | PASS |
| Deep orange text on white | #B8460C | #FFFFFF | 5.36:1 | PASS |
| Muted grey text on off-white | #4A5866 | #F7F9FA | 6.91:1 | PASS |
| Dark green on light-green tint (badges) | #08573E | #E6F2ED | 7.49:1 | PASS |
| Brown on pale yellow (intermediate badge) | #7A4A00 | #FFF1D6 | 6.70:1 | PASS |
| Dark orange on pale orange (advanced badge) | #8A3208 | #FDE3D3 | 6.73:1 | PASS |
| Error red on white | #B3261E | #FFFFFF | 6.54:1 | PASS |
| Error red on pale red | #B3261E | #FDECEA | 5.72:1 | PASS |
| Navy on blue plate slice | #0D1B2A | #4A90C2 | 5.02:1 | PASS |
| Yellow on light navy (position picker) | #FFC857 | #1B2D40 | 9.13:1 | PASS |
| Off-white on light navy | #F7F9FA | #1B2D40 | 13.29:1 | PASS |
| Navy on green tint (empty states) | #0D1B2A | #E6F2ED | 15.15:1 | PASS |

### Pairs that FAIL, so the site never uses them for text
| Pair | Ratio | What we do instead |
|---|---|---|
| White on orange #F26B21 | 3.04:1 | Navy text on orange buttons |
| Orange #F26B21 on white | 3.04:1 | Deep orange #B8460C for orange text |
| Orange on green | 2.06:1 | Never used |
| Yellow on white | 1.54:1 | Yellow only on navy |
| Yellow on green | 4.07:1 | Never used for normal text |
