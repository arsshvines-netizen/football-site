# PITCHPATH: football training website (MYP Personal Project)

A static website (HTML, CSS and JavaScript only). There's no database, no accounts and no internet needed.

## Start it on your laptop

1. Open a terminal (Mac: Terminal; Windows: Command Prompt or PowerShell).
2. Go into this folder, for example: `cd Desktop/football-site`
3. Start the server:
   - **Mac/Linux:** `python3 -m http.server 8000`
   - **Windows:** `python -m http.server 8000`
4. Open your browser at **http://localhost:8000**

**To stop the server:** click in the terminal and press **Ctrl + C**.

> Don't open the files by double-clicking them. The site needs `http://` to work, because it uses JavaScript modules.

**Optional:** `python3 tools/serve.py` (Windows: `python tools/serve.py`) does the same, and also shows the custom "Page not found" page for broken links.

## Test it on your phone or tablet (same Wi-Fi)

1. Find your laptop's local IP address:
   - Mac: System Settings → Wi-Fi → Details (looks like `192.168.x.x`)
   - Windows: run `ipconfig` and look for "IPv4 Address"
2. Start the server so other devices can see it:
   `python -m http.server 8000 --bind 0.0.0.0` (use `python3` on Mac)
3. On your phone, open `http://<laptop-ip>:8000`, e.g. `http://192.168.1.23:8000`
4. If it doesn't load, allow Python through your laptop's firewall for **private** networks.

## Check for broken links

```
python3 tools/check_site.py
```
The result is also saved to `docs/test-results/link-check.txt`.

## Change the brand

- Name, tagline, menu links: `assets/js/config.js`
- Colours and fonts: `assets/css/variables.css`
- Logo: `assets/img/logo.svg`, `logo-dark.svg`, `logo-icon.svg` (the full logos have the name written inside them, so edit the text there too)
- Page `<title>` tags also contain the name, but `layout.js` overwrites them from `config.js` when the page loads.

## Edit content

| What | File |
|---|---|
| Drills (40) | `assets/js/data/drills.js` |
| Programmes (9) | `assets/js/data/programmes.js` |
| Fitness lists | `assets/js/data/fitness.js` |
| Nutrition lists | `assets/js/data/nutrition.js` |
| Sources | `assets/js/data/sources.js` |
