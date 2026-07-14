import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import type { Category } from '../types'
import { haptic } from '../lib/share'

export function CategoryCard({ category, index = 0 }: { category: Category; index?: number }) {
  const nav = useNavigate()
  return (
    <motion.button
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: Math.min(index * 0.035, 0.4) }}
      whileTap={{ scale: 0.95 }}
      onClick={() => {
        haptic(8)
        nav(`/categorie/${category.id}`)
      }}
      className="relative overflow-hidden rounded-3xl p-4 text-left shadow-card"
      style={{
        background: `linear-gradient(135deg, ${category.color}26, ${category.color}0d)`,
      }}
    >
      <div
        className="absolute -right-4 -top-5 h-20 w-20 rounded-full opacity-20 blur-2xl"
        style={{ background: category.color }}
      />
      <div
        className="mb-3 grid h-12 w-12 place-items-center rounded-2xl text-2xl shadow-sm"
        style={{ background: `${category.color}26` }}
      >
        {category.emoji}
      </div>
      <h3 className="text-[0.98rem] font-bold leading-tight text-slate-800 dark:text-slate-100">{category.name}</h3>
      <p className="mt-0.5 text-xs font-semibold" style={{ color: category.color }}>
        {category.count} bancuri
      </p>
    </motion.button>
  )
}
