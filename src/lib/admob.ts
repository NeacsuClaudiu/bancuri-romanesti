// AdMob + Google Play Billing integration.
//
// - Interstitial: called every 15 jokes read (readsUntilAd counter).
// - Rewarded: "unlock premium jokes pack" / "24h ad-free" / other unlockables.
// - IAP: `remove_ads` product, permanently disables ads on cumpărare.
// - On web, all functions are no-ops (safe to call from React components).
// - When Capacitor detects the native platform, real ads and billing kick in.

// Real AdMob unit ids for Bancuri Românești (fill after AdMob app creation).
// Fallback = Google TEST ids (safe during development, always work).
export const AD_UNITS = {
  banner: 'ca-app-pub-3940256099942544/6300978111',
  interstitial: 'ca-app-pub-3940256099942544/1033173712',
  rewarded: 'ca-app-pub-3940256099942544/5224354917',
}

// ---- IAP config ----
const IAP_REMOVE_ADS = 'remove_ads'
const NO_ADS_KEY = 'bancuri-no-ads'
const AD_FREE_UNTIL_KEY = 'bancuri-adfree-until'
const READS_COUNTER_KEY = 'bancuri-reads-until-ad'
const AD_INTERVAL = 15

// ---- Runtime state ----
let admob: any = null
let admobInitialized = false
let rewardReady = false
let interstitialReady = false
let readsUntilAd = 0
let premium = false
let rewardCb: ((ok: boolean) => void) | null = null
let rewardGot = false

// ---- Environment detection ----
function isNative(): boolean {
  const cap = (window as any).Capacitor
  return !!(cap && typeof cap.isNativePlatform === 'function' && cap.isNativePlatform())
}

// ---- localStorage helpers ----
function readNumber(key: string, def = 0): number {
  try {
    const v = localStorage.getItem(key)
    return v == null ? def : Number(v) || def
  } catch { return def }
}
function writeNumber(key: string, v: number) {
  try { localStorage.setItem(key, String(v)) } catch { /* ignore */ }
}
function readBool(key: string): boolean {
  try { return localStorage.getItem(key) === '1' } catch { return false }
}
function writeBool(key: string, v: boolean) {
  try { localStorage.setItem(key, v ? '1' : '0') } catch { /* ignore */ }
}

// ---- Bootstrap: call once at app start ----
export async function initAds(): Promise<void> {
  // Hydrate flags from localStorage
  premium = readBool(NO_ADS_KEY)
  readsUntilAd = readNumber(READS_COUNTER_KEY, AD_INTERVAL)
  const adfreeUntil = readNumber(AD_FREE_UNTIL_KEY, 0)
  if (Date.now() < adfreeUntil) premium = true

  if (!isNative()) return
  try {
    const mod = await import('@capacitor-community/admob')
    admob = (mod as any).AdMob
    if (!admobInitialized) {
      await admob.initialize({})
      admobInitialized = true

      // Consent (UMP) - only shown to EU users, no-op otherwise
      try {
        const ci = await admob.requestConsentInfo({})
        if (ci && ci.isConsentFormAvailable && ci.status === 'REQUIRED') {
          await admob.showConsentForm()
        }
      } catch { /* ignore */ }

      // Listen for reward events
      try {
        admob.addListener('onRewardedVideoAdReward', () => { rewardGot = true })
        admob.addListener('onRewardedVideoAdDismissed', () => {
          if (rewardCb) {
            const cb = rewardCb
            rewardCb = null
            try { cb(rewardGot) } catch { /* ignore */ }
          }
          rewardGot = false
          rewardReady = false
          prepareRewarded()
        })
      } catch { /* ignore */ }

      prepareInterstitial()
      prepareRewarded()
    }
  } catch { /* ignore */ }

  // Initialize IAP on device ready
  document.addEventListener('deviceready', initIAP)
  initIAP()
}

// ---- Interstitial (every 15 jokes) ----
async function prepareInterstitial() {
  if (!admob || premium || interstitialReady) return
  try {
    await admob.prepareInterstitial({ adId: AD_UNITS.interstitial })
    interstitialReady = true
  } catch { /* ignore */ }
}

/** Call after every joke read. Shows an interstitial once every AD_INTERVAL reads. */
export async function onJokeRead(): Promise<void> {
  if (premium) return
  readsUntilAd -= 1
  if (readsUntilAd > 0) { writeNumber(READS_COUNTER_KEY, readsUntilAd); return }
  readsUntilAd = AD_INTERVAL
  writeNumber(READS_COUNTER_KEY, readsUntilAd)
  if (!admob || !interstitialReady) { prepareInterstitial(); return }
  try {
    interstitialReady = false
    await admob.showInterstitial()
  } catch { /* ignore */ }
  prepareInterstitial()
}

// ---- Rewarded (unlock features) ----
async function prepareRewarded() {
  if (!admob || rewardReady) return
  try {
    await admob.prepareRewardVideoAd({ adId: AD_UNITS.rewarded })
    rewardReady = true
  } catch { /* ignore */ }
}

/** Show rewarded ad. Resolves true if user watched to completion, false otherwise. */
export function showRewarded(): Promise<boolean> {
  return new Promise((resolve) => {
    if (!admob || !rewardReady) { prepareRewarded(); resolve(false); return }
    rewardCb = resolve
    rewardGot = false
    rewardReady = false
    admob.showRewardVideoAd().catch(() => {
      rewardCb = null
      resolve(false)
      prepareRewarded()
    })
  })
}

/** Grant N hours of ad-free reading after a rewarded ad. */
export function grantAdFreeHours(hours: number) {
  const until = Date.now() + hours * 3600 * 1000
  writeNumber(AD_FREE_UNTIL_KEY, until)
  premium = true
}

// ---- Banner (unused in Bancuri, keep for API compat) ----
export async function showBanner(): Promise<void> {
  if (premium || !admob) return
  try {
    await admob.showBanner({ adId: AD_UNITS.banner, position: 'BOTTOM_CENTER', margin: 0 })
  } catch { /* ignore */ }
}
export async function hideBanner(): Promise<void> {
  if (!admob) return
  try { await admob.hideBanner() } catch { /* ignore */ }
}
/** Legacy alias — same as onJokeRead(). */
export async function showInterstitial(): Promise<void> { return onJokeRead() }

// ---- Premium flag ----
export function setPremium(v: boolean) {
  premium = v
  writeBool(NO_ADS_KEY, v)
  if (v) hideBanner().catch(() => { /* ignore */ })
}
export function isPremium(): boolean { return premium }
export function isNativePlatform(): boolean { return isNative() }

// ---- Google Play Billing (remove_ads IAP) ----
let iapReady = false
let iapPrice = ''

function initIAP() {
  const CP = (window as any).CdvPurchase
  const St = CP && CP.store
  if (!St || iapReady) return
  try {
    St.register([{ id: IAP_REMOVE_ADS, type: CP.ProductType.NON_CONSUMABLE, platform: CP.Platform.GOOGLE_PLAY }])
    St.when()
      .approved((tr: any) => {
        try {
          if (tr.products && tr.products.some((p: any) => p.id === IAP_REMOVE_ADS)) setPremium(true)
        } catch { /* ignore */ }
        tr.verify()
      })
      .verified((r: any) => r.finish())
      .productUpdated((p: any) => {
        if (p.id !== IAP_REMOVE_ADS) return
        try {
          const o = p.getOffer()
          if (o && o.pricingPhases && o.pricingPhases[0]) iapPrice = o.pricingPhases[0].price
        } catch { /* ignore */ }
        if (p.owned) setPremium(true) // restore purchase after reinstall
      })
    St.initialize([CP.Platform.GOOGLE_PLAY]).then(() => { iapReady = true })
  } catch { /* ignore */ }
}

/** Trigger the Play Store purchase dialog for `remove_ads`. */
export function buyRemoveAds(): void {
  const CP = (window as any).CdvPurchase
  const St = CP && CP.store
  if (!St || !iapReady) return
  try {
    const p = St.get(IAP_REMOVE_ADS, CP.Platform.GOOGLE_PLAY)
    const o = p && p.getOffer()
    if (o) o.order()
  } catch { /* ignore */ }
}

/** Get localized price (e.g. "1.99 EUR") or "" while loading. */
export function getRemoveAdsPrice(): string { return iapPrice }
