import { useRef } from 'react'

interface SwipeHandlers {
  onSwipeLeft?: () => void
  onSwipeRight?: () => void
  onSwipeDown?: () => void
}

// Returns true if the touch started inside an element that can actually scroll
// vertically (e.g. the body of a long joke). Such a drag is a scroll, not a swipe.
function startedInScrollable(target: EventTarget | null, root: Element): boolean {
  let el = target instanceof Element ? target : null
  while (el && el !== root) {
    const oy = getComputedStyle(el).overflowY
    if ((oy === 'auto' || oy === 'scroll') && el.scrollHeight > el.clientHeight + 1) return true
    el = el.parentElement
  }
  return false
}

// Lightweight touch swipe detection for the reader (prev/next) and cards.
export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeDown }: SwipeHandlers) {
  const start = useRef<{ x: number; y: number; t: number; scroll: boolean } | null>(null)

  return {
    onTouchStart: (e: React.TouchEvent) => {
      const t = e.touches[0]
      start.current = {
        x: t.clientX,
        y: t.clientY,
        t: Date.now(),
        scroll: startedInScrollable(e.target, e.currentTarget),
      }
    },
    onTouchEnd: (e: React.TouchEvent) => {
      if (!start.current) return
      const t = e.changedTouches[0]
      const dx = t.clientX - start.current.x
      const dy = t.clientY - start.current.y
      const dt = Date.now() - start.current.t
      const inScrollable = start.current.scroll
      start.current = null
      if (dt > 800) return
      const absX = Math.abs(dx)
      const absY = Math.abs(dy)
      if (absX > 60 && absX > absY * 1.4) {
        if (dx < 0) onSwipeLeft?.()
        else onSwipeRight?.()
      } else if (absY > 80 && absY > absX * 1.4 && dy > 0 && !inScrollable) {
        // Swipe-down closes only when the drag didn't start in scrollable text:
        // pulling a long joke down to get back to its beginning must NOT close it.
        onSwipeDown?.()
      }
    },
  }
}
