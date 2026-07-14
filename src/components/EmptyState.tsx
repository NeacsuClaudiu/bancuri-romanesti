import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

export function EmptyState({
  emoji,
  title,
  subtitle,
  action,
}: {
  emoji: string
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center px-8 py-16 text-center"
    >
      <div className="mb-4 grid h-24 w-24 place-items-center rounded-4xl bg-gradient-to-br from-brand-100 to-brand-50 text-5xl dark:from-white/10 dark:to-white/5">
        <span className="animate-float">{emoji}</span>
      </div>
      <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">{title}</h3>
      {subtitle && <p className="mt-1 max-w-xs text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      {action && <div className="mt-5">{action}</div>}
    </motion.div>
  )
}
