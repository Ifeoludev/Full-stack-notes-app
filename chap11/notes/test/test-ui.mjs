import { assert } from "chai";
import puppeteer from "puppeteer";
import app from "../app.mjs";
import http from "http";

describe("UI Testing", function () {
  let server;
  let browser;
  let page;
  let port = 3002;

  this.timeout(10000);

  before(async function () {
    // Start Server
    server = http.createServer(app);
    await new Promise((resolve) => {
      server.listen(port, resolve);
    });

    // Launch Browser
    browser = await puppeteer.launch({
      headless: "new", // Use new headless mode
    });
    page = await browser.newPage();
  });

  after(async function () {
    if (browser) await browser.close();
    if (server) server.close();
  });

  it('should show the title "Notes"', async () => {
    await page.goto(`http://localhost:${port}`);
    const title = await page.title();
    assert.equal(title, "Notes");
  });

  it('should meet the "Log in" requirement', async () => {
    await page.goto(`http://localhost:${port}`);
    // Check for text "Sign in" on the page usually in the navbar
    const content = await page.content();
    // Simple check if "Sign in" text exists
    assert.include(content, "Log in");
  });
});
