import { useRef, useState, type ReactNode } from 'react'
import { RefreshCw } from 'lucide-react'

// Pull-to-refresh: when the user drags down from the top, trigger onRefresh().
export function PullToRefresh({ onRefresh, children }: { onRefresh: () => void; children: ReactNode }) {
  const [pull, setPull] = useState(0)
  const startY = useRef<number | null>(null)
  const active = useRef(false)
  const THRESHOLD = 72

  return (
    <div
      onTouchStart={(e) => {
        // Only engage when scrolled to the very top.
        const scroller = document.scrollingElement || document.documentElement
        if (scroller.scrollTop <= 0) {
          startY.current = e.touches[0].clientY
          active.current = true
        }
      }}
      onTouchMove={(e) => {
        if (!active.current || startY.current == null) return
        const dy = e.touches[0].clientY - startY.current
        if (dy > 0) {
          setPull(Math.min(dy * 0.5, 90))
        }
      }}
      onTouchEnd={() => {
        if (pull >= THRESHOLD) onRefresh()
        setPull(0)
        startY.current = null
        active.current = false
      }}
    >
      <div
        className="pointer-events-none flex items-center justify-center overflow-hidden transition-[height] duration-150"
        style={{ height: pull }}
      >
        <RefreshCw
          size={24}
          className="text-brand-500"
          style={{ transform: `rotate(${pull * 4}deg)`, opacity: Math.min(pull / THRESHOLD, 1) }}
        />
      </div>
      {children}
    </div>
  )
}
