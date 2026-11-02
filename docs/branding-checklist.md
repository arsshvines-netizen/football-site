# Branding checklist

## Brand elements
| Element | Value | Where defined |
|---|---|---|
| Name | PITCHPATH (placeholder) | `assets/js/config.js` |
| Tagline | "Train with a plan." | `assets/js/config.js` |
| Logo | Original SVG: ball → curved sky-blue arrow path over a pitch centre circle | `assets/img/logo.svg`, `logo-dark.svg`, `logo-icon.svg` |
| Colours | "Sky & Navy": Royal blue #1565C0, Sky blue #7CC6F2, Deep navy #0A1F44, Off-white #F6F8FB, Pale sky #A9DCFA (+ deep sky #0B5C8E for text) | `assets/css/variables.css` |
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
| plans.html | | | | | |
| studio.html (creator only) | | | | | |
| about.html | | | | | |
| feedback.html | | | | | |
| sources.html | | | | | |
| 404.html | | | | | |

## Contrast ratios (WCAG 2.2 AA: at least 4.5:1 for normal text)
Version 6 palette: **"Sky & Navy"** (chosen by the creator). Calculated with the WCAG relative-luminance formula.

| Pair used on the site | Text | Background | Ratio | Result |
|---|---|---|---|---|
| Navy text on off-white page | #0A1F44 | #F6F8FB | 15.27:1 | PASS |
| Navy text on white card | #0A1F44 | #FFFFFF | 16.25:1 | PASS |
| Off-white text on navy header/footer | #F6F8FB | #0A1F44 | 15.27:1 | PASS |
| Grey footer text on navy | #B8C4CF | #0A1F44 | 9.16:1 | PASS |
| Pale-sky text on navy (highlights, selected tabs) | #A9DCFA | #0A1F44 | 11.07:1 | PASS |
| Navy text on pale sky (active nav, challenge box) | #0A1F44 | #A9DCFA | 11.07:1 | PASS |
| White text on royal blue (page heroes, blue button) | #FFFFFF | #1565C0 | 5.75:1 | PASS |
| Navy text on sky-blue button | #0A1F44 | #7CC6F2 | 8.68:1 | PASS |
| Royal-blue link text on off-white | #1565C0 | #F6F8FB | 5.40:1 | PASS |
| Deep sky text (kicker labels) on off-white | #0B5C8E | #F6F8FB | 6.72:1 | PASS |
| Deep sky text on white | #0B5C8E | #FFFFFF | 7.15:1 | PASS |
| Muted grey text on off-white | #4A5866 | #F6F8FB | 6.86:1 | PASS |
| Muted grey text on blue tint | #4A5866 | #E7F1FB | 6.38:1 | PASS |
| Dark blue on blue tint (badges, Undo link) | #0D47A1 | #E7F1FB | 7.55:1 | PASS |
| Navy on blue tint (today timeline, done rows) | #0A1F44 | #E7F1FB | 14.22:1 | PASS |
| Brown on pale yellow (intermediate badge) | #7A4A00 | #FFF1D6 | 6.70:1 | PASS |
| Dark orange on pale orange (advanced badge) | #8A3208 | #FDE3D3 | 6.73:1 | PASS |
| Error red on white | #B3261E | #FFFFFF | 6.54:1 | PASS |
| Pale sky on light navy (position picker) | #A9DCFA | #132C5A | 9.32:1 | PASS |
| Off-white on light navy | #F6F8FB | #132C5A | 12.85:1 | PASS |
| White text on footer card (light stripe) | #FFFFFF | #1A6FCF | 4.98:1 | PASS |
| Grey text on footer bottom bar | #B8C4CF | #06142E | 10.32:1 | PASS |
| Pale-sky 'Safety' label on footer bottom bar | #A9DCFA | #06142E | 12.47:1 | PASS |
| Navy on blue plate slice | #0A1F44 | #4A90C2 | 4.69:1 | PASS |
| White 'Done' pill on royal blue | #FFFFFF | #1565C0 | 5.75:1 | PASS |
| Off-white 'Up next' pill on navy | #F6F8FB | #0A1F44 | 15.27:1 | PASS |
| Navy 'Later' pill on grey | #0A1F44 | #D5DDE3 | 11.82:1 | PASS |
| Navy text on sky 'Session done!' chip | #0A1F44 | #7CC6F2 | 8.68:1 | PASS |
| Royal-blue 'Open →' on white tile | #1565C0 | #FFFFFF | 5.75:1 | PASS |
| Off-white text on plans banner (darkest point of gradient is navy; lightest is royal blue) | #F6F8FB | #1565C0 | 5.40:1 | PASS |
| White bold text on plans banner (royal-blue end) | #FFFFFF | #1565C0 | 5.75:1 | PASS |

### Pairs that FAIL, so the site never uses them for text
| Pair | Ratio | What we do instead |
|---|---|---|
| White on sky blue #7CC6F2 | 1.87:1 | Navy text on sky-blue buttons |
| Sky blue #7CC6F2 on white | 1.87:1 | Deep sky #0B5C8E for sky-coloured text |
| Pale sky #A9DCFA on white | 1.47:1 | Pale sky only on navy or royal blue |
