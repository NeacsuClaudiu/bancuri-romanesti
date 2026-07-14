import { useEffect, useRef } from 'react'

// Detects a phone "shake" via the device accelerometer.
// On iOS, DeviceMotion needs a user-gesture permission grant (handled in Settings).
export function useShake(onShake: () => void, enabled = true, threshold = 16) {
  const last = useRef(0)
  const lastShake = useRef(0)
  const cb = useRef(onShake)
  cb.current = onShake

  useEffect(() => {
    if (!enabled) return
    if (typeof window === 'undefined' || !('DeviceMotionEvent' in window)) return

    let lastX = 0
    let lastY = 0
    let lastZ = 0
    let primed = false

    const handler = (e: DeviceMotionEvent) => {
      const acc = e.accelerationIncludingGravity
      if (!acc || acc.x == null || acc.y == null || acc.z == null) return
      const now = Date.now()
      if (now - last.current < 100) return
      last.current = now

      if (!primed) {
        lastX = acc.x
        lastY = acc.y
        lastZ = acc.z
        primed = true
        return
      }
      const delta = Math.abs(acc.x - lastX) + Math.abs(acc.y - lastY) + Math.abs(acc.z - lastZ)
      lastX = acc.x
      lastY = acc.y
      lastZ = acc.z
      if (delta > threshold && now - lastShake.current > 900) {
        lastShake.current = now
        cb.current()
      }
    }

    window.addEventListener('devicemotion', handler)
    return () => window.removeEventListener('devicemotion', handler)
  }, [enabled, threshold])
}

// Requests iOS motion permission; resolves true if granted or not required.
export async function requestMotionPermission(): Promise<boolean> {
  const anyMotion = (window as any).DeviceMotionEvent
  if (anyMotion && typeof anyMotion.requestPermission === 'function') {
    try {
      const res = await anyMotion.requestPermission()
      return res === 'granted'
    } catch {
      return false
    }
  }
  return true
}
