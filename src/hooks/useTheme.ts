import { useEffect } from 'react'
import { useStore } from '../store/useStore'

// Applies theme (light/dark/system) and font scale to <html>.
export function useThemeEffect() {
  const theme = useStore((s) => s.settings.theme)
  const fontScale = useStore((s) => s.settings.fontScale)
  const reduceMotion = useStore((s) => s.settings.reduceMotion)

  useEffect(() => {
    const root = document.documentElement
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      const dark = theme === 'dark' || (theme === 'system' && mq.matches)
      root.classList.toggle('dark', dark)
      const meta = document.querySelector('meta[name="theme-color"]')
      if (meta) meta.setAttribute('content', dark ? '#0d0e1a' : '#7c3aed')
    }
    apply()
    if (theme === 'system') {
      mq.addEventListener('change', apply)
      return () => mq.removeEventListener('change', apply)
    }
  }, [theme])

  useEffect(() => {
    document.documentElement.style.setProperty('--font-scale', String(fontScale))
  }, [fontScale])

  useEffect(() => {
    document.documentElement.classList.toggle('reduce-motion', reduceMotion)
  }, [reduceMotion])
}
