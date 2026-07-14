import { useMemo } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Copy, Dices, Flame, Share2, Sparkles, ChevronRight } from 'lucide-react'
import { allCategories, dailyJoke, featuredJokes, randomJoke, jokeById } from '../data/jokesRepo'
import { JokeCard } from '../components/JokeCard'
import { CategoryCard } from '../components/CategoryCard'
import { useStore } from '../store/useStore'
import { useReader } from '../store/useReader'
import { useJokeActions } from '../hooks/useJokeActions'
import { todayKey } from '../lib/gamification'
import type { Joke } from '../types'

export function Home() {
  const dayKey = todayKey()
  const stats = useStore((s) => s.stats)
  const history = useStore((s) => s.history)
  const openReader = useReader((s) => s.openReader)
  const { onCopy, onShare } = useJokeActions()

  const daily = useMemo(() => dailyJoke(dayKey), [dayKey])
  const featured = useMemo(() => featuredJokes(dayKey, 6), [dayKey])
  const categories = allCategories()
  const recent = useMemo(
    () => history.map((id) => jokeById(id)).filter(Boolean).slice(0, 6) as Joke[],
    [history]
  )

  const openFeatured = (joke: Joke) => {
    openReader(
      featured.map((j) => j.id),
      featured.findIndex((j) => j.id === joke.id),
      'Recomandate'
    )
  }

  const surprise = () => {
    const r = randomJoke()
    if (r) openReader([r.id], 0, 'Surpriză')
  }

  const hour = new Date().getHours()
  const greeting = hour < 5 ? 'Noapte bună' : hour < 12 ? 'Bună dimineața' : hour < 18 ? 'Salut' : 'Bună seara'

  return (
    <div className="space-y-6">
      {/* Greeting + streak */}
      <div className="flex items-start justify-between pt-[calc(var(--safe-top)+16px)]">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{greeting} 👋</p>
          <h1 className="text-[1.7rem] font-extrabold leading-tight tracking-tight text-slate-900 dark:text-white">
            Bancuri Românești
          </h1>
        </div>
        <Link
          to="/statistici"
          className="flex items-center gap-1.5 rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500 px-3 py-2 text-sm font-extrabold text-white shadow-glow press"
        >
          <Flame size={18} fill="currentColor" />
          {stats.streak}
        </Link>
      </div>

      {/* Daily joke hero */}
      {daily && (
        <motion.section
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-4xl bg-gradient-to-br from-brand-500 via-brand-600 to-accent-pink p-5 text-white shadow-glow"
        >
          <div className="absolute -right-8 -top-10 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
          <div className="relative">
            <div className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white/85">
              <Sparkles size={15} /> Bancul zilei
            </div>
            <button onClick={() => openReader([daily.id], 0, 'Bancul zilei')} className="block text-left">
              <p className="line-clamp-6 whitespace-pre-line text-[1.05rem] font-semibold leading-relaxed">
                {daily.t}
              </p>
            </button>
            <div className="mt-4 flex items-center gap-2">
              <button
                onClick={() => onShare(daily)}
                className="flex items-center gap-1.5 rounded-2xl bg-white/20 px-3.5 py-2 text-sm font-bold backdrop-blur press"
              >
                <Share2 size={16} /> Distribuie
              </button>
              <button
                onClick={() => onCopy(daily)}
                className="flex items-center gap-1.5 rounded-2xl bg-white/20 px-3.5 py-2 text-sm font-bold backdrop-blur press"
              >
                <Copy size={16} /> Copiază
              </button>
            </div>
          </div>
        </motion.section>
      )}

      {/* Random joke button */}
      <button
        onClick={surprise}
        className="flex w-full items-center justify-between rounded-3xl border-2 border-dashed border-brand-300/60 bg-brand-50/50 p-4 press dark:border-brand-400/25 dark:bg-white/[0.03]"
      >
        <span className="flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-brand-500 to-accent-pink text-white shadow-glow">
            <Dices size={22} />
          </span>
          <span className="text-left">
            <span className="block font-bold text-slate-800 dark:text-slate-100">Banc aleatoriu</span>
            <span className="block text-xs text-slate-500 dark:text-slate-400">Apasă pentru o glumă la întâmplare</span>
          </span>
        </span>
        <ChevronRight className="text-brand-400" />
      </button>

      {/* Categories preview */}
      <section>
        <SectionTitle title="Categorii" to="/categorii" />
        <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
          {categories.slice(0, 8).map((c, i) => (
            <div key={c.id} className="w-32 shrink-0">
              <CategoryCard category={c} index={i} />
            </div>
          ))}
        </div>
      </section>

      {/* Recently viewed */}
      {recent.length > 0 && (
        <section>
          <SectionTitle title="Văzute recent" to="/statistici" />
          <div className="space-y-3">
            {recent.slice(0, 3).map((j, i) => (
              <JokeCard
                key={j.id}
                joke={j}
                index={i}
                onOpen={() =>
                  openReader(recent.map((x) => x.id), recent.findIndex((x) => x.id === j.id), 'Recent')
                }
              />
            ))}
          </div>
        </section>
      )}

      {/* Featured */}
      <section>
        <SectionTitle title="Recomandate azi" />
        <div className="space-y-3">
          {featured.map((j, i) => (
            <JokeCard key={j.id} joke={j} index={i} onOpen={openFeatured} />
          ))}
        </div>
      </section>
    </div>
  )
}

function SectionTitle({ title, to }: { title: string; to?: string }) {
  return (
    <div className="mb-3 flex items-center justify-between">
      <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{title}</h2>
      {to && (
        <Link to={to} className="flex items-center gap-0.5 text-sm font-semibold text-brand-600 dark:text-brand-300">
          Vezi tot <ChevronRight size={16} />
        </Link>
      )}
    </div>
  )
}
