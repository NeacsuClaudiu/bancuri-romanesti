// Capturi de ecran pentru Google Play store listing.
// Rulează cu dev server-ul pornit: node scripts/shots.mjs
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5219';
const OUT = 'store/screenshots';

const browser = await puppeteer.launch({
  executablePath: CHROME,
  headless: 'new',
  defaultViewport: { width: 1080, height: 1920, deviceScaleFactor: 1 },
});
const page = await browser.newPage();
await page.goto(BASE, { waitUntil: 'networkidle0' });

const settle = () => new Promise((r) => setTimeout(r, 1400));

// tab-urile din bara de jos, după textul lor
async function tab(label) {
  await page.evaluate((l) => {
    const el = [...document.querySelectorAll('a,button')].find(
      (e) => e.textContent.trim() === l
    );
    el?.click();
  }, label);
  await settle();
}

await settle();
await page.screenshot({ path: `${OUT}/01-home.png` });

await tab('Categorii');
await page.screenshot({ path: `${OUT}/02-categorii.png` });

// intră în categoria Bulă
const card = await page.evaluateHandle(() =>
  [...document.querySelectorAll('button')].find((e) =>
    e.textContent.includes('Bulă')
  )
);
await card.asElement().click();
await settle();
await page.screenshot({ path: `${OUT}/03-categorie.png` });

await tab('Caută');
await page.screenshot({ path: `${OUT}/04-cauta.png` });

await tab('Setări');
await page.screenshot({ path: `${OUT}/05-setari.png` });

await browser.close();
console.log('gata');
