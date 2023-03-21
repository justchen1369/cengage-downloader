## A quick and dirty downloader for Cengage textbooks


## Notes:
- This utility will only download the first "eTextbook" that shows up in the dashboard.
- PRs to help streamline the download process welcome!
- Chrome/Chromium is required for Puppeteer.

## Steps:
1. `npm install`
2. Create `.env` and define `EMAIL`, `PASSWORD`, and `EBOOK_BASE_URL`
    - note: you can get `EBOOK_BASE_URL` by navigating to your textbook from Cengage, and then opening the textbook iframe url in a new tab. Copy everything before `content/{[insert page].html}`
    - With Firefox, you can right click somewhere within the textbook, then in the context menu click on This Frame > Open Frame In New Tab
3. run `index.js`. This will create a pdf file for each page in the textbook within `download/`. If the download is interrupted, you should be able to continue by running it again. 
4. delete all empty files within `download/`. If you have `find` installed you can just run ` find . -size 0 -delete`. 
5. run `merge-pdf.js`, which should create `merged.pdf`. 
6. any extra processing (deleting metadata, lineralizing, etc.)