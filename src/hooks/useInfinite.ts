import { useEffect, useMemo, useRef, useState } from 'react'

// Incrementally reveals a large array as the user scrolls (lazy loading).
export function useInfinite<T>(items: T[], step = 20, initial = 20) {
  const [count, setCount] = useState(initial)
  const sentinel = useRef<HTMLDivElement | null>(null)

  // Reset when the source list identity changes.
  useEffect(() => {
    setCount(initial)
  }, [items, initial])

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setCount((c) => Math.min(c + step, items.length))
        }
      },
      { rootMargin: '600px 0px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [items.length, step])

  const visible = useMemo(() => items.slice(0, count), [items, count])
  return { visible, sentinel, hasMore: count < items.length, count }
}
