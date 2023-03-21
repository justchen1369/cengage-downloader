import * as pup from 'puppeteer'
import fetch from 'node-fetch'
import * as dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();
import cliProgress from 'cli-progress'
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

console.log("launching browser");
const browser = await pup.launch();

let page = await browser.newPage();
console.log("logging in")
await page.goto("https://www.cengage.com/dashboard/")
await page.waitForSelector("#idp-discovery-username").then(() => page.click("#idp-discovery-username"))
await page.waitForSelector("#idp-discovery-username").then(() => page.type("#idp-discovery-username", process.env.EMAIL))
await page.click("#idp-discovery-submit")
await page.waitForSelector("#okta-signin-password").then(() => page.type("#okta-signin-password", process.env.PASSWORD))
await sleep(500);
await page.waitForSelector("#okta-signin-submit").then(() => page.click("#okta-signin-submit"))
console.log("waiting for dashboard to load")
await page.waitForNavigation();
let num = 0

await page.waitForSelector(`#tile${num} > a > div > div.tile-figure > div.tile-links > div > button`)
await page.evaluate(`[...document.querySelectorAll('b')].filter(elem => elem.textContent.startsWith("eText"))[0].parentElement.parentElement.parentElement.parentElement.parentElement.querySelector("button").click()`)

console.log("waiting for ebook to load")
while (!((await browser.pages()).filter(maybe => maybe.url().startsWith("https://ebooks")).length > 0)) {
    await sleep(500);
}
page = (await browser.pages()).filter(maybe => maybe.url().startsWith("https://ebooks"))[0]
page.reload();
const request = await page.waitForResponse(response => /https:\/\/\w+?\.cloudfront\.net\/.+?structure\.json/.test(response.url()))

console.log(request.url())
const book = await fetch(request.url()).then(req => req.json())
const pagesList = book.book.pagesList

//horray!

fs.writeFileSync('./pages.json', JSON.stringify(pagesList, null, 2))
const bar = new cliProgress.SingleBar({format: 'downloading pages ({value}/{total}) {percentage}% {eta}s {duration}s'}, {total: pagesList.length})

let i = 0;

while (fs.existsSync(`./download/${i}.pdf`)) {
    i++
}
bar.start(pagesList.length, i);
for (; i < pagesList.length; i++) {
    if (i > 0 && pagesList[i].target.split("#")[0] === pagesList[i - 1].target.split("#")[0]) {
        console.warn(`warning: duplicate targets (${pagesList[i-1].target}) (${pagesList[i].target})`)
        fs.openSync(`./download/${i}.pdf`, 'a')
        bar.increment();
        continue;
    }
    page = await browser.newPage();
    await page.goto(process.env.EBOOK_BASE_URL + pagesList[i].target);
    await page.waitForNetworkIdle()
    await page.pdf({
        margin: {
            bottom: "0.5in",
            left: "0.5in",
            right: "0.5in",
            top: "0.5in"
        },
        width: "8.5in",
        height: "11in",
        path: `./download/${i}.pdf`
    })  

    // avoid https:website.coom/path/to/file/#[etc] not redirecting
    await page.close();
    bar.increment();
}

browser.close();
