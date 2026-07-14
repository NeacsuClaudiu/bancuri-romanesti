// AdMob integration wrapper.
//
// This is a thin, safe abstraction so the UI can call showBanner()/showInterstitial()/
// showRewarded() without caring whether it runs on the Web (no-op) or Android
// (via @capacitor-community/admob). Ads are automatically suppressed for premium users.
//
// To enable real ads on Android:
//   1) npm i @capacitor-community/admob
//   2) Replace the TEST ids below with your real AdMob unit ids.
//   3) Add your AdMob App ID to android/app/src/main/AndroidManifest.xml.
//   4) Uncomment the dynamic import block in `ensureAdMob()`.
//
// Google TEST ad unit ids (safe to ship during development):
export const AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
}

let admob: any = null
let initialized = false

function isNative(): boolean {
  const cap = (window as any).Capacitor
  return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform())
}

async function ensureAdMob(): Promise<any | null> {
  if (!isNative()) return null
  if (admob) return admob
  try {
    // Uncomment after installing @capacitor-community/admob:
    // const mod = await import('@capacitor-community/admob')
    // admob = mod.AdMob
    // if (!initialized) {
    //   await admob.initialize({ initializeForTesting: true })
    //   initialized = true
    // }
    return admob
  } catch {
    return null
  }
}

let premium = false
export function setPremium(v: boolean) {
  premium = v
  if (v) hideBanner().catch(() => {})
}

export async function showBanner(): Promise<void> {
  if (premium) return
  const m = await ensureAdMob()
  if (!m) return
  try {
    await m.showBanner({
      adId: AD_UNITS.banner,
      position: 'BOTTOM_CENTER',
      margin: 0,
    })
  } catch {
    /* ignore */
  }
}

export async function hideBanner(): Promise<void> {
  const m = await ensureAdMob()
  if (!m) return
  try {
    await m.hideBanner()
  } catch {
    /* ignore */
  }
}

export async function showInterstitial(): Promise<void> {
  if (premium) return
  const m = await ensureAdMob()
  if (!m) return
  try {
    await m.prepareInterstitial({ adId: AD_UNITS.interstitial })
    await m.showInterstitial()
  } catch {
    /* ignore */
  }
}

export async function showRewarded(): Promise<boolean> {
  const m = await ensureAdMob()
  if (!m) return false
  try {
    await m.prepareRewardVideoAd({ adId: AD_UNITS.rewarded })
    await m.showRewardVideoAd()
    return true
  } catch {
    return false
  }
}
