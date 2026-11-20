// Capturi brute pentru noile poze din magazin (1080x1920 = 360x640 @3x).
// Rulează cu dev server-ul pornit (port 5219): node scripts/shots-store.mjs
// Navigarea se face prin click-uri pe tab-uri: deep-link direct randează gol în headless.
import puppeteer from 'puppeteer-core';
import fs from 'fs';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const BASE = 'http://localhost:5219';
const OUT = 'store/promo/raw';
fs.mkdirSync(OUT, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  defaultViewport: { width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
});
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
page.on('pageerror', (e) => console.log('PAGEERR', e.message));
await page.goto(BASE, { waitUntil: 'networkidle0' });
const settle = (ms = 1300) => new Promise((r) => setTimeout(r, ms));
const shot = (n) => page.screenshot({ path: `${OUT}/${n}.png` });
await settle(2000);

async function clickText(sel, re) {
  const ok = await page.evaluate((s, src) => {
    const r = new RegExp(src);
    const all = [...document.querySelectorAll(s)].filter((e) => r.test(e.textContent.trim()) || r.test(e.getAttribute('aria-label') || ''));
    // cel mai "adânc" element care se potrivește (nu containerul mare al listei)
    const el = all.find((e) => !all.some((o) => o !== e && e.contains(o)));
    if (el) el.click();
    return !!el;
  }, sel, re.source);
  if (!ok) throw new Error('nu gasesc ' + re);
  await settle();
}
const tab = (label) => clickText('a', new RegExp('^' + label + '$'));
async function search(q) {
  await tab('Caută');
  await page.click('input');
  await page.keyboard.down('Control'); await page.keyboard.press('KeyA'); await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(q, { delay: 20 });
  await settle(900);
}

// 1. acasă (întunecat)
await shot('home');

// 2. cititorul cu un banc scurt și curat + inimă (favorite)
await search('cine a furat toate creioanele');
await clickText('article, button, div', /cine a furat toate creioanele/);
await settle();
await page.evaluate(() => document.querySelector('[aria-label="Favorite"]')?.click());
await settle(700);
await shot('reader');
await page.evaluate(() => document.querySelector('[aria-label="Închide"]')?.click());
await settle();

// mai salvăm câteva la favorite, pentru ecranul de favorite
for (const q of ['mi le tot rupe unu', 'Universitatea Craiova ca ea nu bate', 'peste strada']) {
  await search(q);
  try { await clickText('article, button, div', new RegExp(q)); } catch (e) { console.log('sar peste', q); continue; }
  await page.evaluate(() => document.querySelector('[aria-label="Favorite"]')?.click());
  await settle(500);
  await page.evaluate(() => document.querySelector('[aria-label="Închide"]')?.click());
  await settle();
}

// 3. căutare cu rezultate
await search('ardelean');
await shot('search');

// 4. categorii
await tab('Categorii');
await shot('categories');

// 5. categoria Bulă
await clickText('button, a', /^.{0,4}Bulă/);
await shot('category');

// 6. favorite
await tab('Favorite');
await shot('favorites');

// 7. temă luminoasă
await tab('Setări');
await clickText('button', /Luminos/);
await tab('Acasă');
await page.evaluate(() => window.scrollTo(0, 0));
await settle();
await shot('home-light');

await browser.close();
console.log('gata');
