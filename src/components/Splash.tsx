import { motion } from 'framer-motion'

export function Splash({ error }: { error?: string }) {
  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-gradient-to-b from-[#2a1560] to-[#150a33] text-white">
      <div className="flex flex-col items-center gap-5 px-8 text-center">
        <motion.img
          src={`${import.meta.env.BASE_URL}logo.png`}
          alt="Bancuri Românești"
          initial={{ scale: 0.7, opacity: 0, y: 8 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
          className="h-40 w-40 drop-shadow-2xl"
          draggable={false}
        />
        {error ? (
          <p className="mt-1 max-w-xs rounded-2xl bg-white/15 px-4 py-2 text-sm">{error}</p>
        ) : (
          <motion.div
            className="h-1.5 w-40 overflow-hidden rounded-full bg-white/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <motion.div
              className="h-full w-1/2 rounded-full bg-gradient-to-r from-amber-400 to-accent-pink"
              animate={{ x: ['-100%', '250%'] }}
              transition={{ repeat: Infinity, duration: 1.1, ease: 'easeInOut' }}
            />
          </motion.div>
        )}
      </div>
    </div>
  )
}
