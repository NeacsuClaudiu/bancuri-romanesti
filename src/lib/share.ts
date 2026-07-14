// Share & copy helpers that work on web and inside a Capacitor WebView.

const APP_TAG = '\n\n— via Bancuri Românești 😂'

export function haptic(ms = 12) {
  try {
    if ('vibrate' in navigator) navigator.vibrate(ms)
  } catch {
    /* ignore */
  }
}

export async function shareText(text: string, title = 'Banc'): Promise<'shared' | 'copied' | 'cancel'> {
  const payload = text.trim() + APP_TAG
  if (typeof navigator !== 'undefined' && (navigator as any).share) {
    try {
      await (navigator as any).share({ title, text: payload })
      return 'shared'
    } catch (e: any) {
      if (e && e.name === 'AbortError') return 'cancel'
      // fall through to copy
    }
  }
  const ok = await copyText(payload)
  return ok ? 'copied' : 'cancel'
}

export async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    /* fall through */
  }
  // Legacy fallback
  try {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.position = 'fixed'
    ta.style.opacity = '0'
    document.body.appendChild(ta)
    ta.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(ta)
    return ok
  } catch {
    return false
  }
}
