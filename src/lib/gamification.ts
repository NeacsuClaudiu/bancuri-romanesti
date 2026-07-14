import type { Achievement, Stats } from '../types'

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'first', name: 'Primul zâmbet', desc: 'Citește primul banc', emoji: '🙂', goal: 1, metric: 'readCount' },
  { id: 'read10', name: 'Bine dispus', desc: 'Citește 10 bancuri', emoji: '😄', goal: 10, metric: 'readCount' },
  { id: 'read50', name: 'Glumeț', desc: 'Citește 50 de bancuri', emoji: '😁', goal: 50, metric: 'readCount' },
  { id: 'read200', name: 'Comediant', desc: 'Citește 200 de bancuri', emoji: '🤣', goal: 200, metric: 'readCount' },
  { id: 'read1000', name: 'Legendă a hazului', desc: 'Citește 1000 de bancuri', emoji: '👑', goal: 1000, metric: 'readCount' },
  { id: 'fav5', name: 'Colecționar', desc: 'Salvează 5 favorite', emoji: '❤️', goal: 5, metric: 'favorites' },
  { id: 'fav25', name: 'Arhivar', desc: 'Salvează 25 de favorite', emoji: '📚', goal: 25, metric: 'favorites' },
  { id: 'streak3', name: 'Constant', desc: '3 zile la rând', emoji: '🔥', goal: 3, metric: 'streak' },
  { id: 'streak7', name: 'O săptămână de râs', desc: '7 zile la rând', emoji: '⚡', goal: 7, metric: 'streak' },
  { id: 'streak30', name: 'Neobosit', desc: '30 de zile la rând', emoji: '🏆', goal: 30, metric: 'streak' },
  { id: 'share5', name: 'Vestitorul', desc: 'Distribuie 5 bancuri', emoji: '📤', goal: 5, metric: 'sharedCount' },
]

export const defaultStats: Stats = {
  readCount: 0,
  readIds: [],
  streak: 0,
  bestStreak: 0,
  lastActiveDay: '',
  totalDaysActive: 0,
  sharedCount: 0,
  copiedCount: 0,
}

export function todayKey(d = new Date()): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function dayDiff(a: string, b: string): number {
  const [ay, am, ad] = a.split('-').map(Number)
  const [by, bm, bd] = b.split('-').map(Number)
  const da = Date.UTC(ay, am - 1, ad)
  const dbb = Date.UTC(by, bm - 1, bd)
  return Math.round((dbb - da) / 86400000)
}

// Updates streak state given the current day. Returns new stats (immutable).
export function touchStreak(stats: Stats, today = todayKey()): Stats {
  if (stats.lastActiveDay === today) return stats
  let streak = stats.streak
  let total = stats.totalDaysActive
  if (!stats.lastActiveDay) {
    streak = 1
  } else {
    const diff = dayDiff(stats.lastActiveDay, today)
    if (diff === 1) streak += 1
    else if (diff > 1) streak = 1
    else if (diff <= 0) streak = Math.max(1, streak) // clock skew guard
  }
  total += 1
  return {
    ...stats,
    streak,
    bestStreak: Math.max(stats.bestStreak, streak),
    lastActiveDay: today,
    totalDaysActive: total,
  }
}

export function metricValue(
  a: Achievement,
  stats: Stats,
  favoritesCount: number
): number {
  if (a.metric === 'favorites') return favoritesCount
  return stats[a.metric] as number
}

export function unlockedAchievements(stats: Stats, favoritesCount: number): Set<string> {
  const set = new Set<string>()
  for (const a of ACHIEVEMENTS) {
    if (metricValue(a, stats, favoritesCount) >= a.goal) set.add(a.id)
  }
  return set
}
