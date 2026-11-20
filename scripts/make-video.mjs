// Video promo Bancuri Românești (1080x1920, vertical) din aplicația reală.
// Rulează cu dev server-ul pornit (port 5219): node scripts/make-video.mjs
// 1) înregistrează aplicația (puppeteer screencast) în timp ce o folosim ca un om
// 2) ffmpeg: aplicația în rama galbenă pe fundal mov + titluri sincronizate + ecran final cu logo
import puppeteer from 'puppeteer-core';
import sharp from 'sharp';
import fs from 'fs';
import { execFileSync } from 'child_process';

const CHROME = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const FFMPEG = 'D:/Claude workshop/tools/ffmpeg/node_modules/ffmpeg-static/ffmpeg.exe';
const BASE = 'http://localhost:5219';
const DIR = 'store/promo/video';
fs.rmSync(DIR, { recursive: true, force: true });
fs.mkdirSync(DIR, { recursive: true });
const W = 1080, H = 1920, SW = 842, SH = 1497, SX = (W - SW) / 2, SY = 400;

// ---------- 1. înregistrare ----------
const browser = await puppeteer.launch({
  executablePath: CHROME, headless: 'new',
  defaultViewport: { width: 360, height: 640, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
});
const page = await browser.newPage();
await page.emulateMediaFeatures([{ name: 'prefers-color-scheme', value: 'dark' }]);
await page.goto(BASE, { waitUntil: 'networkidle0' });
// pornim mereu de la zero (fără favorite / temă salvate de rulări anterioare)
await page.evaluate(async () => {
  localStorage.clear();
  for (const db of (await indexedDB.databases?.()) || []) indexedDB.deleteDatabase(db.name);
});
await page.reload({ waitUntil: 'networkidle0' });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
await wait(2000);

const rec = await page.screencast({ path: `${DIR}/app.webm`, ffmpegPath: FFMPEG, fps: 30 });
const t0 = Date.now();
const caps = [];
let cur = null;
const caption = (a, b) => { const t = (Date.now() - t0) / 1000; if (cur) cur.to = t; cur = { from: t, a, b }; caps.push(cur); };

async function clickText(sel, re) {
  await page.evaluate((s, src) => {
    const r = new RegExp(src);
    const all = [...document.querySelectorAll(s)].filter((e) => r.test(e.textContent.trim()) || r.test(e.getAttribute('aria-label') || ''));
    const el = all.find((e) => !all.some((o) => o !== e && e.contains(o)));
    el?.click();
  }, sel, re.source);
}
const tab = (label) => clickText('a', new RegExp('^' + label + '$'));
const swipe = (dx) => page.evaluate((dx) => {
  const el = document.querySelector('.scroll-area');
  const mk = (x) => new Touch({ identifier: 1, target: el, clientX: x, clientY: 320 });
  el.dispatchEvent(new TouchEvent('touchstart', { bubbles: true, touches: [mk(250)], changedTouches: [mk(250)] }));
  el.dispatchEvent(new TouchEvent('touchend', { bubbles: true, touches: [], changedTouches: [mk(250 + dx)] }));
}, dx);
const smoothScroll = (y, ms) => page.evaluate((y, ms) => new Promise((res) => {
  const s = window.scrollY, t = performance.now();
  const f = (n) => { const k = Math.min(1, (n - t) / ms); window.scrollTo(0, s + (y - s) * (k < .5 ? 2 * k * k : 1 - (-2 * k + 2) ** 2 / 2)); k < 1 ? requestAnimationFrame(f) : res(); };
  requestAnimationFrame(f);
}), y, ms);

// acasă
caption('PESTE 6.400', 'DE BANCURI ROMÂNEȘTI');
await wait(1500);
await smoothScroll(420, 1300);
await wait(500);
await smoothScroll(0, 900);
await wait(300);

// căutare
caption('GĂSEȘTI ORICE', 'BANC ÎN SECUNDE');
await tab('Caută');
await wait(600);
await page.click('input');
await page.keyboard.type('ardelean', { delay: 140 });
await wait(1400);

// cititor + swipe
await clickText('article, button, div', /No ham/);
caption('RÂZI LA FIECARE', 'BANC, CU UN SWIPE');
await wait(2200);
await swipe(-160);
await wait(3000);

// favorite
caption('SALVEAZĂ-ȚI', 'BANCURILE PREFERATE');
await page.evaluate(() => document.querySelector('[aria-label="Favorite"]')?.click());
await wait(1800);
await page.evaluate(() => document.querySelector('[aria-label="Închide"]')?.click());
await wait(600);

// categorii
caption('17 CATEGORII', 'BULĂ, OLTENI, ARDELENI…');
await tab('Categorii');
await wait(900);
await smoothScroll(700, 2000);
await wait(700);

// temă luminoasă
caption('TEMĂ LUMINOASĂ', 'SAU ÎNTUNECATĂ');
await tab('Setări');
await wait(900);
await clickText('button', /Luminos/);
await wait(900);
await tab('Acasă');
await page.evaluate(() => window.scrollTo(0, 0));
await wait(1800);
cur.to = (Date.now() - t0) / 1000;
await rec.stop();
await browser.close();
const appDur = cur.to;
console.log('înregistrat', appDur.toFixed(1), 's');

// ---------- 2. grafică ----------
const font = 'font-family="Arial Black, Segoe UI Black, sans-serif" font-weight="900"';
const fit = (t) => Math.min(96, Math.floor(1000 / (t.length * 0.74)));
const svg = (body) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">${body}</svg>`);
const defs = `<defs>
  <linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#3a168f"/><stop offset="0.45" stop-color="#200E57"/><stop offset="1" stop-color="#120733"/></linearGradient>
  <radialGradient id="y" cx="50%" cy="0%" r="60%"><stop offset="0" stop-color="#FCBA0A" stop-opacity="0.28"/><stop offset="1" stop-color="#FCBA0A" stop-opacity="0"/></radialGradient>
  <filter id="gl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="18"/></filter></defs>`;
await sharp(svg(`${defs}<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#y)"/>
  <rect x="${SX - 8}" y="${SY - 8}" width="${SW + 16}" height="${SH + 16}" rx="62" fill="#FCBA0A" filter="url(#gl)" opacity="0.55"/>
  <rect x="${SX - 7}" y="${SY - 7}" width="${SW + 14}" height="${SH + 14}" rx="60" fill="#FCBA0A"/>`)).png().toFile(`${DIR}/bg.png`);
await sharp(Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}"><rect width="${SW}" height="${SH}" rx="54" fill="#fff"/></svg>`)).png().toFile(`${DIR}/mask.png`);
for (const [i, c] of caps.entries()) {
  await sharp(svg(`<text x="${W / 2}" y="190" text-anchor="middle" ${font} font-size="${fit(c.a)}" fill="#ffffff">${c.a}</text>
    <text x="${W / 2}" y="312" text-anchor="middle" ${font} font-size="${fit(c.b)}" fill="#FCBA0A">${c.b}</text>`)).png().toFile(`${DIR}/cap${i}.png`);
}
// ecranul final: logo + îndemn
const logo = await sharp('public/logo.png').resize(620, 620, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } }).png().toBuffer();
await sharp(svg(`${defs}<rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#y)"/>
  <text x="${W / 2}" y="1300" text-anchor="middle" ${font} font-size="74" fill="#ffffff">DESCARCĂ GRATUIT</text>
  <rect x="215" y="1380" width="650" height="120" rx="60" fill="#FCBA0A"/>
  <text x="${W / 2}" y="1462" text-anchor="middle" ${font} font-size="50" fill="#200E57">▶ GOOGLE PLAY</text>`))
  .composite([{ input: logo, left: 230, top: 470 }]).png().toFile(`${DIR}/end.png`);

// ---------- 3. ffmpeg ----------
const inputs = ['-i', `${DIR}/bg.png`, '-i', `${DIR}/app.webm`, '-i', `${DIR}/mask.png`];
caps.forEach((_, i) => inputs.push('-i', `${DIR}/cap${i}.png`));
const endIdx = 3 + caps.length;
inputs.push('-loop', '1', '-t', '3', '-i', `${DIR}/end.png`);
let f = `[1:v]scale=${SW}:${SH},format=rgba[app];[2:v]format=gray[m];[app][m]alphamerge[appr];` +
  `[0:v][appr]overlay=${SX}:${SY}:shortest=1[v0]`;
caps.forEach((c, i) => {
  const a = c.from.toFixed(2), b = c.to.toFixed(2);
  f += `;[${3 + i}:v]format=rgba[c${i}];[v${i}][c${i}]overlay=0:0:enable='between(t,${a},${b})'[v${i + 1}]`;
});
f += `;[v${caps.length}]trim=0:${appDur.toFixed(2)},setpts=PTS-STARTPTS,fps=30,format=yuv420p,setsar=1[main]` +
  `;[${endIdx}:v]fps=30,format=yuv420p,setsar=1,fade=in:st=0:d=0.4[end];[main][end]concat=n=2:v=1[out]`;
execFileSync(FFMPEG, ['-y', '-loop', '1', ...inputs, '-f', 'lavfi', '-i', 'anullsrc=r=44100:cl=stereo',
  '-filter_complex', f, '-map', '[out]', '-map', `${endIdx + 1}:a`, '-shortest',
  '-c:v', 'libx264', '-preset', 'slow', '-crf', '18', '-c:a', 'aac', '-movflags', '+faststart',
  'store/promo/bancuri-promo.mp4'], { stdio: ['ignore', 'ignore', 'inherit'] });
console.log('scris store/promo/bancuri-promo.mp4');
