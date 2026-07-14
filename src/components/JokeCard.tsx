import { memo } from 'react'
import { motion } from 'framer-motion'
import { Copy, Heart, Share2 } from 'lucide-react'
import type { Joke } from '../types'
import { categoryById } from '../data/jokesRepo'
import { useStore } from '../store/useStore'
import { useJokeActions } from '../hooks/useJokeActions'
import { preview } from '../lib/text'

interface Props {
  joke: Joke
  onOpen: (joke: Joke) => void
  index?: number
  clamp?: boolean
  showCategory?: boolean
}

function JokeCardBase({ joke, onOpen, index = 0, clamp = true, showCategory = true }: Props) {
  const isFav = useStore((s) => s.favorites.includes(joke.id))
  const { onCopy, onShare, onToggleFavorite } = useJokeActions()
  const cat = categoryById(joke.c)

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, delay: Math.min(index * 0.03, 0.25) }}
      className="card p-4 press cursor-pointer select-none"
      onClick={() => onOpen(joke)}
    >
      {showCategory && cat && (
        <div className="mb-2 flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold"
            style={{ background: `${cat.color}1f`, color: cat.color }}
          >
            <span>{cat.emoji}</span>
            {cat.name}
          </span>
        </div>
      )}

      <p
        className={`whitespace-pre-line text-[0.98rem] leading-relaxed text-slate-700 dark:text-slate-200 ${
          clamp ? 'line-clamp-5' : ''
        }`}
      >
        {clamp ? preview(joke.t, 320) : joke.t}
      </p>

      <div className="mt-3 flex items-center justify-end gap-1 text-slate-400">
        <button
          aria-label="Favorite"
          className={`btn-icon h-9 w-9 ${isFav ? 'text-rose-500' : 'hover:text-rose-500'}`}
          onClick={(e) => {
            e.stopPropagation()
            onToggleFavorite(joke)
          }}
        >
          <Heart size={19} fill={isFav ? 'currentColor' : 'none'} />
        </button>
        <button
          aria-label="Copiază"
          className="btn-icon h-9 w-9 hover:text-brand-500"
          onClick={(e) => {
            e.stopPropagation()
            onCopy(joke)
          }}
        >
          <Copy size={18} />
        </button>
        <button
          aria-label="Distribuie"
          className="btn-icon h-9 w-9 hover:text-brand-500"
          onClick={(e) => {
            e.stopPropagation()
            onShare(joke)
          }}
        >
          <Share2 size={18} />
        </button>
      </div>
    </motion.article>
  )
}

export const JokeCard = memo(JokeCardBase)
