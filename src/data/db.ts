// Local persistence via IndexedDB (offline-first user data).
// A single key/value store keeps favorites, history, settings and stats.
import { openDB, type IDBPDatabase } from 'idb'
import type { JokesDB, Settings, Stats } from '../types'

const DB_NAME = 'bancuri-db'
const DB_VERSION = 1
const KV = 'kv'
const JOKES = 'jokes'

let dbp: Promise<IDBPDatabase> | null = null

function db() {
  if (!dbp) {
    dbp = openDB(DB_NAME, DB_VERSION, {
      upgrade(d) {
        if (!d.objectStoreNames.contains(KV)) d.createObjectStore(KV)
        if (!d.objectStoreNames.contains(JOKES)) d.createObjectStore(JOKES)
      },
    })
  }
  return dbp
}

async function get<T>(key: string, fallback: T): Promise<T> {
  try {
    const v = await (await db()).get(KV, key)
    return v === undefined ? fallback : (v as T)
  } catch {
    return fallback
  }
}

async function set(key: string, value: unknown): Promise<void> {
  try {
    await (await db()).put(KV, value, key)
  } catch {
    /* ignore quota / private-mode errors */
  }
}

export const store = {
  getFavorites: () => get<string[]>('favorites', []),
  setFavorites: (v: string[]) => set('favorites', v),

  getHistory: () => get<string[]>('history', []),
  setHistory: (v: string[]) => set('history', v),

  getSettings: () => get<Partial<Settings>>('settings', {}),
  setSettings: (v: Settings) => set('settings', v),

  getStats: () => get<Partial<Stats>>('stats', {}),
  setStats: (v: Stats) => set('stats', v),

  // Cache the parsed jokes DB so repeat loads are instant & fully offline.
  async getCachedDB(): Promise<JokesDB | null> {
    try {
      const v = await (await db()).get(JOKES, 'db')
      return (v as JokesDB) ?? null
    } catch {
      return null
    }
  },
  async setCachedDB(v: JokesDB): Promise<void> {
    try {
      await (await db()).put(JOKES, v, 'db')
    } catch {
      /* ignore */
    }
  },
}
