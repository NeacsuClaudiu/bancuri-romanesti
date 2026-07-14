import { Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import { haptic } from '../lib/share'

export function SurpriseButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-[calc(var(--safe-bottom)+84px)] z-40 mx-auto flex max-w-lg justify-end px-5">
      <motion.button
        initial={{ scale: 0, rotate: -30 }}
        animate={{ scale: 1, rotate: 0 }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: 'spring', stiffness: 400, damping: 18 }}
        onClick={() => {
          haptic(14)
          onClick()
        }}
        className="pointer-events-auto flex items-center gap-2 rounded-full bg-gradient-to-r from-brand-500 to-accent-pink px-5 py-3.5 text-sm font-bold text-white shadow-glow"
        aria-label="Surprinde-mă"
      >
        <Sparkles size={20} className="animate-pulse" />
        Surprinde-mă
      </motion.button>
    </div>
  )
}
