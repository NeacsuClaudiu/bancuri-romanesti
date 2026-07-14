import { create } from 'zustand'
import type { Settings, Stats } from '../types'
import { store } from '../data/db'
import { defaultStats, todayKey, touchStreak, unlockedAchievements } from '../lib/gamification'

const HISTORY_MAX = 60
const READIDS_MAX = 3000

const defaultSettings: Settings = {
  theme: 'system',
  fontScale: 1,
  language: 'ro',
  reduceMotion: false,
  shake: true,
  premium: false,
}

interface AppState {
  ready: boolean
  favorites: string[]
  history: string[]
  settings: Settings
  stats: Stats
  unlocked: Set<string>
  newlyUnlocked: string | null

  init: () => Promise<void>
  toggleFavorite: (id: string) => void
  isFavorite: (id: string) => boolean
  markRead: (id: string) => void
  pushHistory: (id: string) => void
  incShared: () => void
  incCopied: () => void
  updateSettings: (patch: Partial<Settings>) => void
  clearNewlyUnlocked: () => void
  importFavorites: (ids: string[]) => void
  resetProgress: () => void
}

function recomputeUnlocked(
  set: (partial: Partial<AppState>) => void,
  get: () => AppState
) {
  const prev = get().unlocked
  const next = unlockedAchievements(get().stats, get().favorites.length)
  let fresh: string | null = null
  for (const id of next) if (!prev.has(id)) fresh = id
  set({ unlocked: next, newlyUnlocked: fresh ?? get().newlyUnlocked })
}

export const useStore = create<AppState>((set, get) => ({
  ready: false,
  favorites: [],
  history: [],
  settings: defaultSettings,
  stats: defaultStats,
  unlocked: new Set(),
  newlyUnlocked: null,

  init: async () => {
    const [fav, hist, s, st] = await Promise.all([
      store.getFavorites(),
      store.getHistory(),
      store.getSettings(),
      store.getStats(),
    ])
    const settings = { ...defaultSettings, ...s }
    let stats = { ...defaultStats, ...st }
    stats = touchStreak(stats, todayKey())
    store.setStats(stats)
    set({
      favorites: fav,
      history: hist,
      settings,
      stats,
      unlocked: unlockedAchievements(stats, fav.length),
      ready: true,
    })
  },

  toggleFavorite: (id) => {
    const cur = get().favorites
    const next = cur.includes(id) ? cur.filter((x) => x !== id) : [id, ...cur]
    set({ favorites: next })
    store.setFavorites(next)
    recomputeUnlocked(set, get)
  },

  isFavorite: (id) => get().favorites.includes(id),

  markRead: (id) => {
    const st = get().stats
    if (st.readIds.includes(id)) return
    const readIds = [id, ...st.readIds].slice(0, READIDS_MAX)
    const next: Stats = { ...st, readCount: st.readCount + 1, readIds }
    set({ stats: next })
    store.setStats(next)
    recomputeUnlocked(set, get)
  },

  pushHistory: (id) => {
    const cur = get().history.filter((x) => x !== id)
    const next = [id, ...cur].slice(0, HISTORY_MAX)
    set({ history: next })
    store.setHistory(next)
  },

  incShared: () => {
    const st = get().stats
    const next = { ...st, sharedCount: st.sharedCount + 1 }
    set({ stats: next })
    store.setStats(next)
    recomputeUnlocked(set, get)
  },

  incCopied: () => {
    const st = get().stats
    const next = { ...st, copiedCount: st.copiedCount + 1 }
    set({ stats: next })
    store.setStats(next)
  },

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch }
    set({ settings: next })
    store.setSettings(next)
  },

  clearNewlyUnlocked: () => set({ newlyUnlocked: null }),

  importFavorites: (ids) => {
    const merged = Array.from(new Set([...ids, ...get().favorites]))
    set({ favorites: merged })
    store.setFavorites(merged)
    recomputeUnlocked(set, get)
  },

  resetProgress: () => {
    const stats = { ...defaultStats, lastActiveDay: todayKey(), streak: 1, totalDaysActive: 1 }
    set({ favorites: [], history: [], stats, unlocked: new Set() })
    store.setFavorites([])
    store.setHistory([])
    store.setStats(stats)
  },
}))
