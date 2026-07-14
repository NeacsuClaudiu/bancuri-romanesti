// Compact on-disk shape (kept small for the ~2.7MB bundle).
export interface RawJoke {
  id: string
  c: string // category id
  t: string // text
  q: 0 | 1 // question/answer style
}

export interface Category {
  id: string
  name: string
  emoji: string
  color: string
  count: number
}

export interface JokesDB {
  generatedAt: string
  total: number
  categories: Category[]
  jokes: RawJoke[]
}

// Runtime joke (same as RawJoke, aliased for clarity in the UI layer).
export type Joke = RawJoke

export type ThemeMode = 'light' | 'dark' | 'system'

export interface Settings {
  theme: ThemeMode
  fontScale: number // 0.9 .. 1.4
  language: string // 'ro' (architecture ready for more)
  reduceMotion: boolean
  shake: boolean // shake phone for a random joke
  premium: boolean // removes ads
}

export interface Stats {
  readCount: number
  readIds: string[] // unique ids read (capped)
  streak: number
  bestStreak: number
  lastActiveDay: string // YYYY-MM-DD
  totalDaysActive: number
  sharedCount: number
  copiedCount: number
}

export interface Achievement {
  id: string
  name: string
  desc: string
  emoji: string
  goal: number
  metric: keyof Pick<Stats, 'readCount' | 'streak' | 'sharedCount'> | 'favorites'
}
