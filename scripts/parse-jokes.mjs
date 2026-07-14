// Parses the raw Romanian jokes archive into a structured JSON database.
// Input : ../../bancuri_romanesti.txt (or BANCURI_SRC env override)
// Output: public/data/jokes.json  { generatedAt, categories[], jokes[] }
//
// The archive is organized as:
//   ============================================================
//   <Category name> (<N> bancuri)
//   ============================================================
//   --- Banc 1 ---
//   <joke lines...>
//   --- Banc 2 ---
//   ...
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const SRC_CANDIDATES = [
  process.env.BANCURI_SRC,
  resolve(ROOT, 'src-data', 'bancuri_romanesti.txt'),
  resolve(ROOT, '..', '..', 'Descarcari', 'bancuri_romanesti.txt'),
  'D:/Descarcari/bancuri_romanesti.txt',
].filter(Boolean)

const SRC = SRC_CANDIDATES.find((p) => existsSync(p))
if (!SRC) {
  console.error('❌ Nu găsesc arhiva de bancuri. Locuri verificate:\n' + SRC_CANDIDATES.join('\n'))
  process.exit(1)
}

const OUT_DIR = resolve(ROOT, 'public', 'data')
const OUT = resolve(OUT_DIR, 'jokes.json')

// ---- Category display metadata ---------------------------------------------
// Maps raw archive names -> {id, name (with diacritics), emoji, gradient, color}
// Some raw categories are merged (e.g. "Animale 2" into "Animale").
const CATEGORY_META = {
  'Bancuri cu Alinuta': { id: 'alinuta', name: 'Alinuța', emoji: '👧', color: '#ff5db1' },
  'Bancuri cu Animale': { id: 'animale', name: 'Animale', emoji: '🐾', color: '#2dd4bf' },
  'Bancuri cu Animale 2': { id: 'animale', name: 'Animale', emoji: '🐾', color: '#2dd4bf' },
  'Bancuri cu Ardeleni': { id: 'ardeleni', name: 'Ardeleni', emoji: '🏔️', color: '#38bdf8' },
  'Bancuri din Armata': { id: 'armata', name: 'Armată', emoji: '🪖', color: '#84cc16' },
  'Bancuri cu Betivi': { id: 'betivi', name: 'Bețivi', emoji: '🍺', color: '#f59e0b' },
  'Bancuri cu Blonde': { id: 'blonde', name: 'Blonde', emoji: '👱‍♀️', color: '#f472b6' },
  'Bancuri cu Bula': { id: 'bula', name: 'Bulă', emoji: '😜', color: '#7c3aed' },
  'Bancuri cu Calculatoare': { id: 'it', name: 'IT & Calculatoare', emoji: '💻', color: '#06b6d4' },
  'Culmi': { id: 'culmi', name: 'Culmi', emoji: '🎯', color: '#ef4444' },
  'Bancuri cu Ion si Maria': { id: 'ion-maria', name: 'Ion și Maria', emoji: '💑', color: '#fb7185' },
  'Bancuri cu Ion si Maria 2': { id: 'ion-maria', name: 'Ion și Maria', emoji: '💑', color: '#fb7185' },
  'Bancuri Diverse': { id: 'diverse', name: 'Diverse', emoji: '🎲', color: '#8b5cf6' },
  'Bancuri Deochiate': { id: 'deochiate', name: 'Deochiate', emoji: '🔞', color: '#e11d48' },
  'Bancuri cu Moldoveni': { id: 'moldoveni', name: 'Moldoveni', emoji: '🌻', color: '#eab308' },
  'Bancuri cu Olteni': { id: 'olteni', name: 'Olteni', emoji: '🌶️', color: '#f97316' },
  'Bancuri Politice': { id: 'politica', name: 'Politică', emoji: '🏛️', color: '#64748b' },
  'Bancuri cu Politisti': { id: 'politisti', name: 'Poliţişti', emoji: '👮', color: '#3b82f6' },
  'Bancuri cu Popi': { id: 'popi', name: 'Popi', emoji: '⛪', color: '#a855f7' },
}

function fallbackMeta(rawName) {
  const clean = rawName.replace(/\s*\(\d+\s*bancuri\)\s*$/i, '').trim()
  const id = clean
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  return { id: id || 'diverse', name: clean, emoji: '😄', color: '#7c3aed' }
}

// ---- Read & split by category ----------------------------------------------
const raw = readFileSync(SRC, 'utf8').replace(/\r\n/g, '\n')
const lines = raw.split('\n')

const SEP = /^={5,}\s*$/
const HEADER = /^(.+?)\s*\((\d+)\s*bancuri\)\s*$/i
const BANC = /^---\s*Banc\s+\d+\s*---\s*$/i

// Walk the file, tracking the current category and collecting joke blocks.
const rawCategories = new Map() // id -> {meta, jokes: string[][]}
let currentMetaKey = null
let currentBlock = null // string[] accumulating a single joke

function flushBlock() {
  if (currentBlock && currentMetaKey) {
    const cat = rawCategories.get(currentMetaKey)
    if (cat) cat.jokes.push(currentBlock)
  }
  currentBlock = null
}

for (let i = 0; i < lines.length; i++) {
  const line = lines[i]

  // Detect a category header: a line matching HEADER that sits between separators.
  const headerMatch = line.match(HEADER)
  const prevSep = i > 0 && SEP.test(lines[i - 1])
  const nextSep = i < lines.length - 1 && SEP.test(lines[i + 1])
  if (headerMatch && (prevSep || nextSep) && !BANC.test(line)) {
    flushBlock()
    const rawName = line.trim()
    const meta = CATEGORY_META[headerMatch[1].trim()] || fallbackMeta(rawName)
    currentMetaKey = meta.id
    if (!rawCategories.has(meta.id)) {
      rawCategories.set(meta.id, { meta, jokes: [] })
    }
    continue
  }

  if (SEP.test(line)) continue

  if (BANC.test(line)) {
    flushBlock()
    currentBlock = []
    continue
  }

  if (currentBlock) currentBlock.push(line)
}
flushBlock()

// ---- Clean a joke block into text ------------------------------------------
function cleanJoke(blockLines) {
  // Trim leading/trailing empty lines.
  let arr = blockLines.slice()
  while (arr.length && arr[0].trim() === '') arr.shift()
  while (arr.length && arr[arr.length - 1].trim() === '') arr.pop()
  if (!arr.length) return null

  // Normalize whitespace per line, drop leading "I:"/"R:" markers (question/answer).
  arr = arr.map((l) => l.replace(/\s+$/g, '').replace(/^\s+/g, (m) => (m.length > 2 ? '  ' : m)))

  let hadQA = false
  const cleaned = arr.map((l) => {
    const t = l.trim()
    if (/^I\s*:/.test(t)) {
      hadQA = true
      return t.replace(/^I\s*:\s*/, '')
    }
    if (/^R\s*:/.test(t)) {
      hadQA = true
      return t.replace(/^R\s*:\s*/, '')
    }
    return l
  })

  const text = cleaned.join('\n').replace(/\n{3,}/g, '\n\n').trim()
  if (!text) return null
  return { text, isQA: hadQA }
}

// ---- Build final structures ------------------------------------------------
const categories = []
const jokes = []
let globalIndex = 0

// Preserve archive order for categories.
for (const { meta, jokes: blocks } of rawCategories.values()) {
  let catCount = 0
  for (const block of blocks) {
    const parsed = cleanJoke(block)
    if (!parsed) continue
    // Skip degenerate 1-2 char fragments.
    if (parsed.text.replace(/\s/g, '').length < 3) continue
    const id = `j${globalIndex}`
    jokes.push({
      id,
      c: meta.id, // category id
      t: parsed.text, // text
      q: parsed.isQA ? 1 : 0, // question/answer style flag
    })
    globalIndex++
    catCount++
  }
  categories.push({
    id: meta.id,
    name: meta.name,
    emoji: meta.emoji,
    color: meta.color,
    count: catCount,
  })
}

// De-duplicate exact repeated jokes (archives often repeat).
const seen = new Set()
const deduped = []
for (const j of jokes) {
  const key = j.t.toLowerCase().replace(/\s+/g, ' ').trim()
  if (seen.has(key)) continue
  seen.add(key)
  deduped.push(j)
}

// Recompute category counts after de-dup.
const countById = {}
for (const j of deduped) countById[j.c] = (countById[j.c] || 0) + 1
for (const c of categories) c.count = countById[c.id] || 0

const db = {
  generatedAt: new Date().toISOString(),
  total: deduped.length,
  categories: categories.filter((c) => c.count > 0),
  jokes: deduped,
}

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })
writeFileSync(OUT, JSON.stringify(db))

const sizeKb = (Buffer.byteLength(JSON.stringify(db)) / 1024).toFixed(0)
console.log(`✅ Sursă: ${SRC}`)
console.log(`✅ ${db.total} bancuri în ${db.categories.length} categorii -> ${OUT} (${sizeKb} KB)`)
console.log(
  'Categorii:\n' +
    db.categories.map((c) => `   ${c.emoji}  ${c.name.padEnd(20)} ${c.count}`).join('\n')
)
