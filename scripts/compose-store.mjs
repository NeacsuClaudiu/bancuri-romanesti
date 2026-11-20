// Poze finale pentru Google Play: 1080x1920, titlu mare sus + captura în ramă galbenă.
// Culori din logo: mov #200E57, galben #FCBA0A.  node scripts/compose-store.mjs
import sharp from 'sharp';
import fs from 'fs';
const RAW = 'store/promo/raw', OUT = 'store/promo/final';
fs.mkdirSync(OUT, { recursive: true });
const SHOTS = [
  ['home',       'PESTE 6.400',     'DE BANCURI ROMÂNEȘTI'],
  ['reader',     'RÂZI LA FIECARE', 'BANC, CU UN SWIPE'],
  ['categories', '17 CATEGORII',    'BULĂ, OLTENI, ARDELENI…'],
  ['search',     'GĂSEȘTI ORICE',   'BANC ÎN SECUNDE'],
  ['category',   'TOATE BANCURILE', 'CU BULĂ, ÎNTR-UN LOC'],
  ['favorites',  'SALVEAZĂ-ȚI',     'BANCURILE PREFERATE'],
  ['home-light', 'TEMĂ LUMINOASĂ',  'SAU ÎNTUNECATĂ'],
];
const W = 1080, H = 1920, SW = 842, SH = 1497, SX = (W - SW) / 2, SY = 400;
const font = 'font-family="Arial Black, Segoe UI Black, sans-serif" font-weight="900"';
const fit = (t) => Math.min(96, Math.floor(1000 / (t.length * 0.74)));
for (const [i, [name, a, b]] of SHOTS.entries()) {
  const bg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="#3a168f"/><stop offset="0.45" stop-color="#200E57"/><stop offset="1" stop-color="#120733"/>
      </linearGradient>
      <radialGradient id="y" cx="50%" cy="0%" r="60%">
        <stop offset="0" stop-color="#FCBA0A" stop-opacity="0.28"/><stop offset="1" stop-color="#FCBA0A" stop-opacity="0"/>
      </radialGradient>
      <filter id="gl" x="-10%" y="-10%" width="120%" height="120%"><feGaussianBlur stdDeviation="18"/></filter>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/><rect width="${W}" height="${H}" fill="url(#y)"/>
    <rect x="${SX - 8}" y="${SY - 8}" width="${SW + 16}" height="${SH + 16}" rx="62" fill="#FCBA0A" filter="url(#gl)" opacity="0.55"/>
    <rect x="${SX - 7}" y="${SY - 7}" width="${SW + 14}" height="${SH + 14}" rx="60" fill="#FCBA0A"/>
    <text x="${W / 2}" y="190" text-anchor="middle" ${font} font-size="${fit(a)}" fill="#ffffff">${a}</text>
    <text x="${W / 2}" y="312" text-anchor="middle" ${font} font-size="${fit(b)}" fill="#FCBA0A">${b}</text>
  </svg>`;
  const mask = Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${SW}" height="${SH}"><rect width="${SW}" height="${SH}" rx="54" fill="#fff"/></svg>`);
  const shot = await sharp(`${RAW}/${name}.png`).resize(SW, SH).png().toBuffer();
  const rounded = await sharp(shot).composite([{ input: mask, blend: 'dest-in' }]).png().toBuffer();
  const file = `${OUT}/${String(i + 1).padStart(2, '0')}-${name}.png`;
  await sharp(Buffer.from(bg)).composite([{ input: rounded, left: SX, top: SY }]).png().toFile(file);
  console.log(file);
}
