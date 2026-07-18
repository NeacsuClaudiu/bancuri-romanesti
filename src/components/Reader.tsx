import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, Copy, Heart, Share2, X } from 'lucide-react'
import { useReader } from '../store/useReader'
import { jokeById, categoryById, randomJoke } from '../data/jokesRepo'
import { useStore } from '../store/useStore'
import { useJokeActions } from '../hooks/useJokeActions'
import { useSwipe } from '../hooks/useSwipe'
import { haptic } from '../lib/share'
import { onJokeRead } from '../lib/admob'

export function Reader() {
  const { open, queue, index, title, close, next, prev } = useReader()
  const id = queue[index]
  const joke = id ? jokeById(id) : undefined
  const isFav = useStore((s) => (id ? s.favorites.includes(id) : false))
  const markRead = useStore((s) => s.markRead)
  const pushHistory = useStore((s) => s.pushHistory)
  const { onCopy, onShare, onToggleFavorite } = useJokeActions()

  // Record read + history whenever the visible joke changes.
  // Also ping AdMob counter (shows interstitial every 15 jokes read).
  useEffect(() => {
    if (open && id) {
      markRead(id)
      pushHistory(id)
      onJokeRead().catch(() => { /* ignore */ })
    }
  }, [open, id, markRead, pushHistory])

  // Keyboard navigation (desktop / web).
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') next()
      else if (e.key === 'ArrowLeft') prev()
      else if (e.key === 'Escape') close()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, next, prev, close])

  const swipe = useSwipe({
    onSwipeLeft: () => {
      haptic(8)
      next()
    },
    onSwipeRight: () => {
      haptic(8)
      prev()
    },
    onSwipeDown: close,
  })

  const cat = joke ? categoryById(joke.c) : undefined
  const atStart = index <= 0
  const atEnd = index >= queue.length - 1

  return (
    <AnimatePresence>
      {open && joke && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-slate-50/95 backdrop-blur-xl dark:bg-[#0b0c16]/95"
          {...swipe}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 pb-2 pt-[calc(var(--safe-top)+12px)]">
            <button onClick={close} className="btn-icon h-11 w-11 bg-slate-200/60 text-slate-600 dark:bg-white/10 dark:text-slate-200" aria-label="Închide">
              <X size={22} />
            </button>
            <div className="flex flex-col items-center">
              {cat && (
                <span className="text-xs font-semibold" style={{ color: cat.color }}>
                  {cat.emoji} {cat.name}
                </span>
              )}
              <span className="text-[0.7rem] text-slate-400">
                {index + 1} / {queue.length}
              </span>
            </div>
            <button
              onClick={() => onToggleFavorite(joke)}
              className={`btn-icon h-11 w-11 ${isFav ? 'bg-rose-500/15 text-rose-500' : 'bg-slate-200/60 text-slate-500 dark:bg-white/10'}`}
              aria-label="Favorite"
            >
              <Heart size={22} fill={isFav ? 'currentColor' : 'none'} />
            </button>
          </div>

          {/* Joke body */}
          <div className="scroll-area flex-1 overflow-y-auto px-6 py-4">
            <AnimatePresence mode="wait">
              <motion.div
                key={joke.id}
                initial={{ opacity: 0, x: 30 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.22 }}
                className="mx-auto flex min-h-full max-w-md items-center"
              >
                <p className="whitespace-pre-line text-[1.35rem] font-medium leading-relaxed text-slate-800 dark:text-slate-100">
                  {joke.t}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-center gap-3 px-6 pb-2">
            <button onClick={() => onCopy(joke)} className="flex items-center gap-2 rounded-2xl bg-slate-200/70 px-4 py-2.5 text-sm font-semibold text-slate-700 press dark:bg-white/10 dark:text-slate-200">
              <Copy size={17} /> Copiază
            </button>
            <button onClick={() => onShare(joke)} className="flex items-center gap-2 rounded-2xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white press shadow-glow">
              <Share2 size={17} /> Distribuie
            </button>
          </div>

          {/* Prev / Next */}
          <div className="flex items-center justify-between gap-3 px-4 pb-[calc(var(--safe-bottom)+16px)] pt-3">
            <button
              disabled={atStart}
              onClick={prev}
              className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-white py-3 text-sm font-bold text-slate-700 shadow-card press disabled:opacity-40 dark:bg-white/[0.06] dark:text-slate-200"
            >
              <ChevronLeft size={20} /> Înapoi
            </button>
            {atEnd ? (
              <button
                onClick={() => {
                  const r = randomJoke(joke.id)
                  if (r) useReader.getState().openReader([r.id], 0, 'Surpriză')
                }}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-gradient-to-r from-brand-500 to-accent-pink py-3 text-sm font-bold text-white shadow-glow press"
              >
                Încă unul 🎲
              </button>
            ) : (
              <button
                onClick={next}
                className="flex flex-1 items-center justify-center gap-1 rounded-2xl bg-brand-500 py-3 text-sm font-bold text-white shadow-glow press"
              >
                Următorul <ChevronRight size={20} />
              </button>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
