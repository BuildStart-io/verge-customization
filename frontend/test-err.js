const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  await page.goto('http://localhost:8080/dashboard');
  await page.waitForTimeout(2000);
  const content = await page.content();
  if (content.includes("Something went wrong")) {
    console.log("Error boundary triggered!");
  }
  await browser.close();
})();
