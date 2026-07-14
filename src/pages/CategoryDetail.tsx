import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { Shuffle } from 'lucide-react'
import { categoryById, jokesInCategory } from '../data/jokesRepo'
import { JokeCard } from '../components/JokeCard'
import { PageHeader } from '../components/PageHeader'
import { EmptyState } from '../components/EmptyState'
import { useReader } from '../store/useReader'
import { useInfinite } from '../hooks/useInfinite'
import { haptic } from '../lib/share'

export function CategoryDetail() {
  const { id = '' } = useParams()
  const cat = categoryById(id)
  const jokes = useMemo(() => jokesInCategory(id), [id])
  const openReader = useReader((s) => s.openReader)
  const { visible, sentinel, hasMore } = useInfinite(jokes, 16, 16)

  const ids = useMemo(() => jokes.map((j) => j.id), [jokes])

  if (!cat) {
    return (
      <div>
        <PageHeader title="Categorie" back />
        <EmptyState emoji="🤷" title="Categorie negăsită" />
      </div>
    )
  }

  const shuffle = () => {
    haptic(10)
    const start = Math.floor(Math.random() * jokes.length)
    openReader(ids, start, cat.name)
  }

  return (
    <div>
      <PageHeader
        title={`${cat.emoji} ${cat.name}`}
        subtitle={`${cat.count.toLocaleString('ro-RO')} bancuri`}
        back
        right={
          <button
            onClick={shuffle}
            className="btn-icon h-10 w-10 text-white shadow-glow"
            style={{ background: cat.color }}
            aria-label="Amestecă"
          >
            <Shuffle size={18} />
          </button>
        }
      />
      <div className="space-y-3">
        {visible.map((j, i) => (
          <JokeCard
            key={j.id}
            joke={j}
            index={i % 16}
            showCategory={false}
            onOpen={() => openReader(ids, ids.indexOf(j.id), cat.name)}
          />
        ))}
      </div>
      {hasMore && <div ref={sentinel} className="h-16" />}
    </div>
  )
}
