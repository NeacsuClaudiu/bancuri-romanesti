import { motion } from 'framer-motion'
import { Flame, BookOpenText, Heart, Layers, Share2, Trophy } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useStore } from '../store/useStore'
import { allCategories, allJokes } from '../data/jokesRepo'
import { ACHIEVEMENTS, metricValue } from '../lib/gamification'

export function Stats() {
  const stats = useStore((s) => s.stats)
  const favorites = useStore((s) => s.favorites)
  const unlocked = useStore((s) => s.unlocked)
  const totalJokes = allJokes().length
  const cats = allCategories().length

  const readPct = Math.min(100, Math.round((stats.readCount / totalJokes) * 100))

  const tiles = [
    { icon: BookOpenText, label: 'Bancuri citite', value: stats.readCount, color: '#7c3aed' },
    { icon: Heart, label: 'Favorite', value: favorites.length, color: '#f43f5e' },
    { icon: Flame, label: 'Zile la rând', value: stats.streak, color: '#f97316' },
    { icon: Trophy, label: 'Record zile', value: stats.bestStreak, color: '#eab308' },
    { icon: Share2, label: 'Distribuite', value: stats.sharedCount, color: '#06b6d4' },
    { icon: Layers, label: 'Categorii', value: cats, color: '#22c55e' },
  ]

  return (
    <div>
      <PageHeader title="Statistici" subtitle="Progresul tău în lumea bancurilor" back />

      {/* Read progress ring-ish bar */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 overflow-hidden rounded-4xl bg-gradient-to-br from-brand-500 to-accent-pink p-5 text-white shadow-glow"
      >
        <div className="flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-white/85">Ai citit</p>
            <p className="text-4xl font-extrabold">{stats.readCount.toLocaleString('ro-RO')}</p>
            <p className="text-sm text-white/85">din {totalJokes.toLocaleString('ro-RO')} bancuri</p>
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold">{readPct}%</p>
            <p className="text-xs text-white/80">explorat</p>
          </div>
        </div>
        <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/25">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(readPct, 2)}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="h-full rounded-full bg-white"
          />
        </div>
      </motion.div>

      {/* Stat tiles */}
      <div className="mb-6 grid grid-cols-2 gap-3">
        {tiles.map((t, i) => (
          <motion.div
            key={t.label}
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.04 }}
            className="card p-4"
          >
            <div
              className="mb-2 grid h-10 w-10 place-items-center rounded-2xl"
              style={{ background: `${t.color}1f`, color: t.color }}
            >
              <t.icon size={20} />
            </div>
            <p className="text-2xl font-extrabold text-slate-900 dark:text-white">{t.value.toLocaleString('ro-RO')}</p>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{t.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Achievements */}
      <h2 className="mb-3 flex items-center gap-2 text-lg font-extrabold text-slate-900 dark:text-white">
        <Trophy size={20} className="text-amber-500" /> Realizări
        <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
          {unlocked.size}/{ACHIEVEMENTS.length}
        </span>
      </h2>
      <div className="grid gap-3">
        {ACHIEVEMENTS.map((a) => {
          const got = unlocked.has(a.id)
          const cur = Math.min(a.goal, metricValue(a, stats, favorites.length))
          const pct = Math.round((cur / a.goal) * 100)
          return (
            <div
              key={a.id}
              className={`flex items-center gap-3 rounded-3xl border p-3.5 transition ${
                got
                  ? 'border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 dark:border-amber-400/20 dark:from-amber-400/10 dark:to-orange-400/5'
                  : 'card border-transparent'
              }`}
            >
              <div
                className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl text-2xl ${
                  got ? 'bg-amber-400/25' : 'bg-slate-100 grayscale dark:bg-white/5'
                }`}
              >
                {a.emoji}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-bold text-slate-800 dark:text-slate-100">{a.name}</p>
                  {got && <span className="text-xs font-bold text-amber-600 dark:text-amber-300">✓ Deblocat</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{a.desc}</p>
                {!got && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
                      <div className="h-full rounded-full bg-amber-400" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[0.68rem] font-semibold text-slate-400">
                      {cur}/{a.goal}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
