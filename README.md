# Press Tools (page only)

The Press Tools page for Specialty Roll Products, hosted on GitHub Pages:
https://willlrigdon-lab.github.io/press-tools-app/

This repo holds only the page. Data and server code live in the Google Sheet and its Apps Script
project (private repo `Press-tools`). The page is built there with `node tools/build-site.js`;
don't edit `index.html` here by hand. `sw.js` (keeps a copy of the page so it opens on weak wifi; never data)
and `version.json` (lets an open page offer "New version ready") are built with it. `maintenance/` is
Maintenance Tools, built the same way from its own private repo.
