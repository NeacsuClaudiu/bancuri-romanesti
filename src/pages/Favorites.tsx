import { useMemo, useRef } from 'react'
import { Download, Upload, Shuffle } from 'lucide-react'
import { jokeById } from '../data/jokesRepo'
import { JokeCard } from '../components/JokeCard'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { useStore } from '../store/useStore'
import { useReader } from '../store/useReader'
import { useNavigate } from 'react-router-dom'
import { exportBackup, importBackup } from '../lib/backup'
import { useToast } from '../store/useToast'
import type { Joke } from '../types'

export function Favorites() {
  const favorites = useStore((s) => s.favorites)
  const openReader = useReader((s) => s.openReader)
  const nav = useNavigate()
  const show = useToast((s) => s.show)
  const fileRef = useRef<HTMLInputElement>(null)

  const jokes = useMemo(
    () => favorites.map((id) => jokeById(id)).filter(Boolean) as Joke[],
    [favorites]
  )
  const ids = useMemo(() => jokes.map((j) => j.id), [jokes])

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await importBackup(file)
    if (res.ok) show(`${res.imported} favorite importate`, '✅')
    else show(res.error || 'Import eșuat', '⚠️')
    e.target.value = ''
  }

  return (
    <div>
      <PageHeader
        title="Favorite"
        subtitle={favorites.length ? `${favorites.length} bancuri salvate` : 'Bancurile tale preferate'}
        right={
          jokes.length > 0 ? (
            <button
              onClick={() => openReader(ids, 0, 'Favorite')}
              className="btn-icon h-10 w-10 bg-rose-500 text-white shadow-glow"
              aria-label="Amestecă favorite"
            >
              <Shuffle size={18} />
            </button>
          ) : undefined
        }
      />

      <div className="mb-4 flex gap-2">
        <button
          onClick={exportBackup}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-card press dark:bg-white/[0.06] dark:text-slate-200"
        >
          <Download size={17} /> Backup
        </button>
        <button
          onClick={() => fileRef.current?.click()}
          className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-2.5 text-sm font-semibold text-slate-700 shadow-card press dark:bg-white/[0.06] dark:text-slate-200"
        >
          <Upload size={17} /> Restaurează
        </button>
        <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
      </div>

      {jokes.length === 0 ? (
        <EmptyState
          emoji="❤️"
          title="Încă nu ai favorite"
          subtitle="Apasă pe inima de pe orice banc ca să-l salvezi aici."
          action={
            <button
              onClick={() => nav('/categorii')}
              className="rounded-2xl bg-brand-500 px-5 py-2.5 font-bold text-white shadow-glow press"
            >
              Explorează bancuri
            </button>
          }
        />
      ) : (
        <div className="space-y-3">
          {jokes.map((j, i) => (
            <JokeCard key={j.id} joke={j} index={i} onOpen={() => openReader(ids, ids.indexOf(j.id), 'Favorite')} />
          ))}
        </div>
      )}
    </div>
  )
}
