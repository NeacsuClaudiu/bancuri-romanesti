import { AnimatePresence, motion } from 'framer-motion'
import { useToast } from '../store/useToast'

export function ToastHost() {
  const toasts = useToast((s) => s.toasts)
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-28 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-slate-900/92 px-4 py-2.5 text-sm font-semibold text-white shadow-glow backdrop-blur dark:bg-white/95 dark:text-slate-900"
          >
            {t.emoji && <span className="text-base">{t.emoji}</span>}
            {t.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
