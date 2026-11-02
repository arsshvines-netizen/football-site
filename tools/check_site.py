"""
check_site.py: scans the website for broken internal links and missing files.

How to run (from the football-site folder):
    python3 tools/check_site.py        (Mac/Linux)
    python tools/check_site.py         (Windows)

It checks:
  - every href="..." and src="..." in every .html file
  - every import "./something.js" in every JavaScript file
  - every url(...) in every CSS file
  - links built inside JavaScript like href="drills.html?..." or "fitness.html#speed"
  - that #anchor links point to an id that exists on the target page
  - that no file loads anything from the internet (http:// or https://)
It prints a report and saves it to docs/test-results/link-check.txt
"""

import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

HTML_LINK = re.compile(r'(?:href|src)="([^"]+)"')
JS_IMPORT = re.compile(r'(?:import|from)\s+["\'](\.{1,2}/[^"\']+)["\']')
CSS_URL = re.compile(r'url\(["\']?([^"\')]+)["\']?\)')
# Page names mentioned inside JavaScript strings, e.g. "fitness.html#speed"
JS_PAGE = re.compile(r'["\'`=]([a-z0-9\-]+\.html(?:#[a-z0-9\-]+)?)')
# Asset paths mentioned inside JavaScript strings, e.g. "assets/img/logo.svg"
JS_ASSET = re.compile(r'["\'`](assets/[^"\'`$]+\.(?:svg|png|jpg|css|js))["\'`]')
ID_ATTR = re.compile(r'id="([^"]+)"')
# External things that LOAD (scripts, styles, images). Plain links to sources are allowed.
EXTERNAL_LOAD = re.compile(r'(?:src="https?://|<link[^>]+href="https?://|@import\s+["\']?https?://|url\(["\']?https?://)')

problems = []
checked = 0


def all_files(extension):
    for folder, _dirs, files in os.walk(ROOT):
        if "/." in folder.replace(ROOT, ""):
            continue
        for name in files:
            if name.endswith(extension):
                yield os.path.join(folder, name)


def ids_in(page_path):
    """All id="..." values written directly in a page's HTML."""
    with open(page_path, encoding="utf-8") as f:
        return set(ID_ATTR.findall(f.read()))


def check_target(source_file, link):
    """Check that one link points to a file (and anchor) that exists."""
    global checked
    if link.startswith(("http://", "https://", "mailto:", "tel:", "data:", "javascript:")):
        return
    if "${" in link:  # a template in JavaScript, checked separately
        return
    checked += 1
    path_part, _, anchor = link.partition("#")
    path_part = path_part.split("?")[0]
    if path_part == "":
        target = source_file  # link to an anchor on the same page
    elif source_file.endswith(".js") and not link.startswith("."):
        target = os.path.join(ROOT, path_part)  # JS strings are relative to the page (site root)
    else:
        target = os.path.normpath(os.path.join(os.path.dirname(source_file), path_part))
    rel_source = os.path.relpath(source_file, ROOT)
    if not os.path.exists(target):
        problems.append(f"MISSING  {rel_source}: '{link}' -> file not found")
        return
    if anchor and target.endswith(".html") and anchor not in ids_in(target):
        problems.append(f"ANCHOR?  {rel_source}: '{link}' -> no id=\"{anchor}\" written in the HTML (may be added by JavaScript)")


def main():
    for page in all_files(".html"):
        with open(page, encoding="utf-8") as f:
            text = f.read()
        for link in HTML_LINK.findall(text):
            check_target(page, link)
        if EXTERNAL_LOAD.search(text):
            problems.append(f"EXTERNAL {os.path.relpath(page, ROOT)}: loads something from the internet")

    for script in all_files(".js"):
        with open(script, encoding="utf-8") as f:
            text = f.read()
        for link in JS_IMPORT.findall(text):
            check_target(script, link)
        for link in JS_PAGE.findall(text):
            check_target(script, link)
        for link in JS_ASSET.findall(text):
            check_target(script, link)
        if EXTERNAL_LOAD.search(text):
            problems.append(f"EXTERNAL {os.path.relpath(script, ROOT)}: loads something from the internet")

    for sheet in all_files(".css"):
        with open(sheet, encoding="utf-8") as f:
            text = f.read()
        for link in CSS_URL.findall(text):
            if not link.startswith("#"):
                check_target(sheet, link)

    lines = [f"Checked {checked} internal links and file references."]
    if problems:
        lines.append(f"Found {len(problems)} problem(s):")
        lines.extend("  " + p for p in problems)
    else:
        lines.append("PASS: no broken links, no missing files, nothing loaded from the internet.")
    report = "\n".join(lines)
    print(report)

    out_dir = os.path.join(ROOT, "docs", "test-results")
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "link-check.txt"), "w", encoding="utf-8") as f:
        f.write(report + "\n")

    hard_problems = [p for p in problems if not p.startswith("ANCHOR?")]
    sys.exit(1 if hard_problems else 0)


if __name__ == "__main__":
    main()
