import { useRef } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
}

// Lightweight horizontal swipe detection for the reader (prev/next).
// Vertical drags are left alone on purpose: they only scroll the joke text.
// (Swipe-down-to-close was removed - it kept closing jokes by accident.)
export function useSwipe({ onSwipeLeft, onSwipeRight }: SwipeHandlers) {
  const start = useRef<{ x: number; y: number; t: number } | null>(null)

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0]
      start.current = { x: t.clientX, y: t.clientY, t: Date.now() }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      const dt = Date.now() - start.current.t
      start.current = null
      if (dt > 800) return
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      if (absX > 60 && absX > absY * 1.4) {
        if (dx < 0) onSwipeLeft?.()
        else onSwipeRight?.()
      }
    },
  }
}
