import { ChevronLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { ReactNode } from 'react'

export function PageHeader({
  title,
  subtitle,
  back = false,
  right,
}: {
  title: string
  subtitle?: string
  back?: boolean
  right?: ReactNode
}) {
  const nav = useNavigate()
  return (
    <header className="sticky top-0 z-30 -mx-4 mb-2 bg-slate-50/80 px-4 pb-2 pt-[calc(var(--safe-top)+14px)] backdrop-blur-xl dark:bg-[#0d0e1a]/80">
      <div className="flex items-center gap-3">
        {back && (
          <button
            onClick={() => nav(-1)}
            className="btn-icon h-10 w-10 bg-white text-slate-600 shadow-card dark:bg-white/10 dark:text-slate-200"
            aria-label="Înapoi"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h1>
          {subtitle && <p className="truncate text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
        </div>
        {right}
      </div>
    </header>
  )
}
