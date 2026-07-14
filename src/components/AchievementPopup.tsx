import { AnimatePresence, motion } from 'framer-motion'
import { useEffect } from 'react'
import { useStore } from '../store/useStore'
import { ACHIEVEMENTS } from '../lib/gamification'
import { haptic } from '../lib/share'

export function AchievementPopup() {
  const newlyUnlocked = useStore((s) => s.newlyUnlocked)
  const clear = useStore((s) => s.clearNewlyUnlocked)
  const ach = ACHIEVEMENTS.find((a) => a.id === newlyUnlocked)

  useEffect(() => {
    if (newlyUnlocked) {
      haptic(30)
      const t = setTimeout(clear, 3200)
      return () => clearTimeout(t)
    }
  }, [newlyUnlocked, clear])

  return (
    <AnimatePresence>
      {ach && (
        <motion.div
          initial={{ opacity: 0, y: -60, scale: 0.85 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -40, scale: 0.9 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="fixed inset-x-0 top-[calc(var(--safe-top)+14px)] z-[70] mx-auto flex max-w-sm justify-center px-4"
          onClick={clear}
        >
          <div className="flex items-center gap-3 rounded-3xl bg-gradient-to-r from-amber-400 to-accent-orange px-4 py-3 text-white shadow-glow">
            <span className="grid h-12 w-12 place-items-center rounded-2xl bg-white/25 text-2xl">{ach.emoji}</span>
            <div>
              <p className="text-[0.7rem] font-bold uppercase tracking-wide text-white/80">Realizare deblocată!</p>
              <p className="text-sm font-extrabold leading-tight">{ach.name}</p>
              <p className="text-xs text-white/85">{ach.desc}</p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
