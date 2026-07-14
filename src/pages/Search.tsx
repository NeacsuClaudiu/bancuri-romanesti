import { useMemo, useState, useEffect, useRef } from 'react'
import { Search as SearchIcon, X, Dices } from 'lucide-react'
import { searchJokes, randomJoke, allCategories } from '../data/jokesRepo'
import { JokeCard } from '../components/JokeCard'
import { EmptyState } from '../components/EmptyState'
import { useReader } from '../store/useReader'
import { useNavigate } from 'react-router-dom'
import { useInfinite } from '../hooks/useInfinite'

const SUGGESTIONS = ['Bulă', 'soacră', 'blonda', 'doctor', 'șofer', 'școală', 'nevastă', 'popa']

export function Search() {
  const [q, setQ] = useState('')
  const [debounced, setDebounced] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const openReader = useReader((s) => s.openReader)
  const nav = useNavigate()
  const categories = allCategories()

  useEffect(() => {
    const t = setTimeout(() => setDebounced(q.trim()), 160)
    return () => clearTimeout(t)
  }, [q])

  const results = useMemo(() => (debounced.length >= 2 ? searchJokes(debounced, 300) : []), [debounced])
  const ids = useMemo(() => results.map((r) => r.id), [results])
  const { visible, sentinel, hasMore } = useInfinite(results, 16, 16)

  const active = debounced.length >= 2

  return (
    <div>
      <div className="sticky top-0 z-30 -mx-4 bg-slate-50/85 px-4 pb-3 pt-[calc(var(--safe-top)+14px)] backdrop-blur-xl dark:bg-[#0d0e1a]/85">
        <h1 className="mb-3 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">Caută</h1>
        <div className="flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-card dark:bg-white/[0.06]">
          <SearchIcon size={20} className="text-slate-400" />
          <input
            ref={inputRef}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Caută în toate bancurile…"
            autoFocus
            className="flex-1 bg-transparent text-[0.98rem] font-medium text-slate-800 outline-none placeholder:text-slate-400 dark:text-slate-100"
            enterKeyHint="search"
          />
          {q && (
            <button onClick={() => setQ('')} className="btn-icon h-7 w-7 text-slate-400" aria-label="Șterge">
              <X size={18} />
            </button>
          )}
        </div>
        {active && (
          <p className="mt-2 px-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
            {results.length > 0
              ? `${results.length}${results.length >= 300 ? '+' : ''} rezultate`
              : 'Niciun rezultat'}
          </p>
        )}
      </div>

      {!active && (
        <div className="mt-2 space-y-6">
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Încearcă</p>
            <div className="flex flex-wrap gap-2">
              {SUGGESTIONS.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className="rounded-full bg-white px-3.5 py-2 text-sm font-semibold text-slate-700 shadow-card press dark:bg-white/[0.06] dark:text-slate-200"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-2 text-sm font-bold text-slate-700 dark:text-slate-300">Explorează categorii</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => nav(`/categorie/${c.id}`)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-sm font-semibold press"
                  style={{ background: `${c.color}1f`, color: c.color }}
                >
                  <span>{c.emoji}</span> {c.name}
                </button>
              ))}
            </div>
          </div>
          <button
            onClick={() => {
              const r = randomJoke()
              if (r) openReader([r.id], 0, 'Surpriză')
            }}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-pink py-3.5 font-bold text-white shadow-glow press"
          >
            <Dices size={20} /> Banc aleatoriu
          </button>
        </div>
      )}

      {active && results.length === 0 && (
        <EmptyState emoji="🔍" title="Niciun banc găsit" subtitle={`Nu am găsit nimic pentru „${debounced}”. Încearcă alt cuvânt.`} />
      )}

      {active && results.length > 0 && (
        <div className="mt-3 space-y-3">
          {visible.map((j, i) => (
            <JokeCard key={j.id} joke={j} index={i % 16} onOpen={() => openReader(ids, ids.indexOf(j.id), 'Căutare')} />
          ))}
          {hasMore && <div ref={sentinel} className="h-16" />}
        </div>
      )}
    </div>
  )
}
