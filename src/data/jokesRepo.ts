// Loads the jokes database once and exposes fast lookups + search.
import type { Category, Joke, JokesDB } from '../types'
import { normalize, tokens } from '../lib/text'
import { store } from './db'

interface Indexed {
  db: JokesDB
  byId: Map<string, Joke>
  byCat: Map<string, Joke[]>
  catById: Map<string, Category>
  search: { id: string; hay: string }[] // pre-folded haystack for instant search
}

let cache: Indexed | null = null
let loading: Promise<Indexed> | null = null

function build(db: JokesDB): Indexed {
  const byId = new Map<string, Joke>()
  const byCat = new Map<string, Joke[]>()
  const catById = new Map<string, Category>()
  const search: { id: string; hay: string }[] = []

  for (const c of db.categories) {
    catById.set(c.id, c)
    byCat.set(c.id, [])
  }
  for (const j of db.jokes) {
    byId.set(j.id, j)
    const arr = byCat.get(j.c)
    if (arr) arr.push(j)
    else byCat.set(j.c, [j])
    search.push({ id: j.id, hay: normalize(j.t) })
  }
  return { db, byId, byCat, catById, search }
}

export async function loadJokes(base = import.meta.env.BASE_URL): Promise<Indexed> {
  if (cache) return cache
  if (loading) return loading

  loading = (async () => {
    // Try the network/precache first (fresh); fall back to IndexedDB cache offline.
    try {
      const res = await fetch(`${base}data/jokes.json`, { cache: 'force-cache' })
      if (!res.ok) throw new Error(String(res.status))
      const db = (await res.json()) as JokesDB
      store.setCachedDB(db)
      cache = build(db)
      return cache
    } catch {
      const cached = await store.getCachedDB()
      if (cached) {
        cache = build(cached)
        return cache
      }
      throw new Error('Nu am putut încărca baza de bancuri.')
    }
  })()

  return loading
}

export function getIndex(): Indexed | null {
  return cache
}

export function jokeById(id: string): Joke | undefined {
  return cache?.byId.get(id)
}

export function categoryById(id: string): Category | undefined {
  return cache?.catById.get(id)
}

export function jokesInCategory(catId: string): Joke[] {
  return cache?.byCat.get(catId) ?? []
}

export function allCategories(): Category[] {
  return cache?.db.categories ?? []
}

export function allJokes(): Joke[] {
  return cache?.db.jokes ?? []
}

// Fast, forgiving, diacritic-insensitive AND-search.
export function searchJokes(query: string, limit = 60): Joke[] {
  if (!cache) return []
  const terms = tokens(query)
  if (!terms.length) return []
  const out: Joke[] = []
  for (const { id, hay } of cache.search) {
    let ok = true
    for (const t of terms) {
      if (!hay.includes(t)) {
        ok = false
        break
      }
    }
    if (ok) {
      const j = cache.byId.get(id)
      if (j) out.push(j)
      if (out.length >= limit) break
    }
  }
  return out
}

// Deterministic "joke of the day" — stable per calendar day.
export function dailyJoke(dayKey: string): Joke | undefined {
  const jokes = allJokes()
  if (!jokes.length) return undefined
  let h = 2166136261
  for (let i = 0; i < dayKey.length; i++) {
    h ^= dayKey.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  const idx = Math.abs(h) % jokes.length
  return jokes[idx]
}

export function randomJoke(exclude?: string): Joke | undefined {
  const jokes = allJokes()
  if (!jokes.length) return undefined
  if (jokes.length === 1) return jokes[0]
  let j = jokes[Math.floor(Math.random() * jokes.length)]
  let guard = 0
  while (exclude && j.id === exclude && guard++ < 5) {
    j = jokes[Math.floor(Math.random() * jokes.length)]
  }
  return j
}

// A handful of featured jokes for the Home hero, stable per day.
export function featuredJokes(dayKey: string, n = 6): Joke[] {
  const jokes = allJokes()
  if (!jokes.length) return []
  const out: Joke[] = []
  const used = new Set<string>()
  let h = 5381
  for (let i = 0; i < dayKey.length; i++) h = (h * 33) ^ dayKey.charCodeAt(i)
  for (let k = 0; k < n * 4 && out.length < n; k++) {
    h = Math.imul(h ^ (h >>> 15), 2246822519)
    const idx = Math.abs(h) % jokes.length
    const j = jokes[idx]
    if (!used.has(j.id)) {
      used.add(j.id)
      out.push(j)
    }
  }
  return out
}
