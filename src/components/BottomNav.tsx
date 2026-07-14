import { NavLink } from 'react-router-dom'
import { Home, LayoutGrid, Search, Heart, Settings } from 'lucide-react'
import { motion } from 'framer-motion'
import { haptic } from '../lib/share'

const items = [
  { to: '/', label: 'Acasă', Icon: Home, end: true },
  { to: '/categorii', label: 'Categorii', Icon: LayoutGrid },
  { to: '/cauta', label: 'Caută', Icon: Search },
  { to: '/favorite', label: 'Favorite', Icon: Heart },
  { to: '/setari', label: 'Setări', Icon: Settings },
]

export function BottomNav() {
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 mx-auto max-w-lg px-3 pb-[calc(var(--safe-bottom)+10px)] pt-2"
      style={{ pointerEvents: 'none' }}
    >
      <div
        className="glass mx-auto flex items-center justify-around rounded-3xl px-2 py-1.5 shadow-glow"
        style={{ pointerEvents: 'auto' }}
      >
        {items.map(({ to, label, Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={() => haptic(8)}
            className="relative flex flex-1 flex-col items-center gap-0.5 rounded-2xl py-2 text-[0.68rem] font-semibold"
          >
            {({ isActive }) => (
              <>
                {isActive && (
                  <motion.span
                    layoutId="navpill"
                    className="absolute inset-0 rounded-2xl bg-brand-500/12 dark:bg-brand-400/15"
                    transition={{ type: 'spring', stiffness: 500, damping: 34 }}
                  />
                )}
                <Icon
                  size={22}
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 dark:text-slate-500'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`relative z-10 transition-colors ${
                    isActive ? 'text-brand-600 dark:text-brand-300' : 'text-slate-400 dark:text-slate-500'
                  }`}
                >
                  {label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}
