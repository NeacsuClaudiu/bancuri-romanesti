import { Link } from 'react-router-dom'
import { BarChart3 } from 'lucide-react'
import { allCategories, allJokes } from '../data/jokesRepo'
import { CategoryCard } from '../components/CategoryCard'
import { PageHeader } from '../components/PageHeader'

export function Categories() {
  const categories = allCategories()
  const total = allJokes().length

  return (
    <div>
      <PageHeader
        title="Categorii"
        subtitle={`${categories.length} categorii · ${total.toLocaleString('ro-RO')} bancuri`}
        right={
          <Link
            to="/statistici"
            className="btn-icon h-10 w-10 bg-white text-brand-600 shadow-card dark:bg-white/10 dark:text-brand-300"
            aria-label="Statistici"
          >
            <BarChart3 size={20} />
          </Link>
        }
      />
      <div className="grid grid-cols-2 gap-3">
        {categories.map((c, i) => (
          <CategoryCard key={c.id} category={c} index={i} />
        ))}
      </div>
    </div>
  )
}
