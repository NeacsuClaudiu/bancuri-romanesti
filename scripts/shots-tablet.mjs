// Capturi pentru tablete (Google Play cere 7-inch si 10-inch, raport 9:16).
// Rulează cu dev server-ul pornit: node scripts/shots-tablet.mjs
import puppeteer from 'puppeteer-core';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5219';

const SIZES = [
  { dir: 'store/screenshots-tablet7', width: 1080, height: 1920 },
  { dir: 'store/screenshots-tablet10', width: 1440, height: 2560 },
];

const settle = () => new Promise((r) => setTimeout(r, 1400));

const browser = await puppeteer.launch({ executablePath: CHROME, headless: 'new' });

for (const { dir, width, height } of SIZES) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.goto(BASE, { waitUntil: 'networkidle0' });
  await settle();

  async function tab(label) {
    await page.evaluate((l) => {
      [...document.querySelectorAll('a,button')]
        .find((e) => e.textContent.trim() === l)
        ?.click();
    }, label);
    await settle();
  }

  await page.screenshot({ path: `${dir}/01-home.png` });
  await tab('Categorii');
  await page.screenshot({ path: `${dir}/02-categorii.png` });

  const card = await page.evaluateHandle(() =>
    [...document.querySelectorAll('button')].find((e) => e.textContent.includes('Bulă'))
  );
  await card.asElement().click();
  await settle();
  await page.screenshot({ path: `${dir}/03-categorie.png` });

  await tab('Setări');
  await page.screenshot({ path: `${dir}/04-setari.png` });

  await page.close();
  console.log(dir, width + 'x' + height, 'gata');
}

await browser.close();
