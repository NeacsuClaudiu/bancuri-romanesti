// Generates every app image asset from the official logo.
//   Source : src-data/logo-source.png  (the "Bancuri Românești" logo)
// The source logo sits on a solid black background, so we trim it, square it,
// and apply a rounded-corner alpha mask to get clean transparent corners.
//
// Outputs:
//   public/icons/icon-192.png, icon-512.png, icon-512-maskable.png
//   public/favicon.png, public/apple-touch-icon.png, public/logo.png
//   resources/icon.png, resources/splash.png, resources/splash-dark.png  (for @capacitor/assets)
import sharp from 'sharp'
import { writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SRC = [
  process.env.LOGO_SRC,
  resolve(ROOT, 'src-data', 'logo-source.png'),
  'D:/Descarcari/ChatGPT Image Jul 14, 2026, 08_26_24 AM.png',
].filter(Boolean).find((p) => existsSync(p))

if (!SRC) {
  console.error('❌ Nu găsesc logo-ul sursă (src-data/logo-source.png).')
  process.exit(1)
}

const ICONS_DIR = resolve(ROOT, 'public', 'icons')
const PUBLIC_DIR = resolve(ROOT, 'public')
const RES_DIR = resolve(ROOT, 'resources')
for (const d of [ICONS_DIR, RES_DIR]) if (!existsSync(d)) mkdirSync(d, { recursive: true })

const YELLOW = { r: 252, g: 186, b: 10, alpha: 1 } // logo frame yellow #FCBA0A
const PURPLE = { r: 32, g: 14, b: 87, alpha: 1 } // logo band purple #200E57

// 1) Trim the black background, then pad to a perfect square (transparent).
const trimmed = await sharp(SRC).trim({ background: '#000000', threshold: 30 }).png().toBuffer()
const tm = await sharp(trimmed).metadata()
const side = Math.max(tm.width, tm.height)
const squared = await sharp(trimmed)
  .resize(side, side, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toBuffer()

// Rounded-rect alpha mask (a touch rounder than the source so no black corner remains).
function roundedMask(size, ratio = 0.225) {
  const r = Math.round(size * ratio)
  return Buffer.from(
    `<svg width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${r}" ry="${r}"/></svg>`
  )
}

async function roundedIcon(size) {
  const base = await sharp(squared).resize(size, size, { fit: 'fill' }).png().toBuffer()
  return sharp(base).composite([{ input: roundedMask(size), blend: 'dest-in' }]).png().toBuffer()
}

// Full-bleed icon on a solid background (for maskable / adaptive / apple-touch).
async function filled(size, inset = 0.84, bg = YELLOW) {
  const inner = Math.round(size * inset)
  const icon = await roundedIcon(inner)
  return sharp({ create: { width: size, height: size, channels: 4, background: bg } })
    .composite([{ input: icon, gravity: 'center' }])
    .png()
    .toBuffer()
}

async function splash(size) {
  const logo = await roundedIcon(Math.round(size * 0.3))
  return sharp({ create: { width: size, height: size, channels: 4, background: PURPLE } })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toBuffer()
}

// ---- Write everything -------------------------------------------------------
writeFileSync(resolve(ICONS_DIR, 'icon-192.png'), await roundedIcon(192))
writeFileSync(resolve(ICONS_DIR, 'icon-512.png'), await roundedIcon(512))
writeFileSync(resolve(ICONS_DIR, 'icon-512-maskable.png'), await filled(512, 0.84))
writeFileSync(resolve(PUBLIC_DIR, 'favicon.png'), await roundedIcon(96))
writeFileSync(resolve(PUBLIC_DIR, 'apple-touch-icon.png'), await filled(180, 0.92))
writeFileSync(resolve(PUBLIC_DIR, 'logo.png'), await roundedIcon(512))
writeFileSync(resolve(RES_DIR, 'icon.png'), await filled(1024, 0.86))
writeFileSync(resolve(RES_DIR, 'splash.png'), await splash(2732))
writeFileSync(resolve(RES_DIR, 'splash-dark.png'), await splash(2732))

console.log('✅ Logo oficial procesat →')
console.log('   public/icons/icon-192.png, icon-512.png, icon-512-maskable.png')
console.log('   public/favicon.png, apple-touch-icon.png, logo.png')
console.log('   resources/icon.png, splash.png, splash-dark.png')
console.log(`   (sursă trim: ${tm.width}×${tm.height} → pătrat ${side}×${side})`)
