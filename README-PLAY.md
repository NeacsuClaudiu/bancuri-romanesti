# Bancuri Românești — ghid publicare Google Play

## Ce e deja făcut ✅

- **Proiect Capacitor + Android** (`com.polarbearstudio.bancuri`, nume „Bancuri Românești"), portrait, cu splash screen.
- **Iconițe și splash** generate din logo-ul galben cu emoji „Ha Ha!" (74 asset-uri).
- **Reclame AdMob**: interstitial la fiecare 15 bancuri citite + rewarded (24h ad-free), cu **ID-uri de TEST** Google.
- **Buton REMOVE ADS** în Setări → Premium: plată unică prin Google Play Billing, produs `remove_ads` (1.99 EUR).
- **Consimțământ GDPR (UMP)**: apelat la pornire; formularul apare doar după ce îl configurezi în consola AdMob.
- **Salvare persistentă** în localStorage (favorite, istoric, achievements).
- **Politică de confidențialitate** în `privacy.html` — de urcat pe GitHub Pages.

## Comenzi utile

```powershell
# după orice modificare la aplicație:
npm run build                         # rebuild web (dist/)
npx cap sync android                  # copiază în proiectul Android
node scripts/patch-android.mjs        # re-adaugă meta AdMob + orientation

# build APK de test (instalabil direct pe telefon):
$env:JAVA_HOME = "D:\Claude workshop\tools\jdk-21.0.11+10"
cd android
.\gradlew.bat assembleDebug

# build pentru Play Store (AAB semnat):
.\gradlew.bat bundleRelease
# rezultat: android\app\build\outputs\bundle\release\app-release.aab
```

## Pași rămași pentru publicare

### 1. AdMob (creezi aplicația nouă)
- [admob.google.com](https://admob.google.com) → Apps → Add app → Android → primești **App ID** real (`ca-app-pub-XXXX~YYYY`).
- Creezi **2 ad units**: Interstitial + Rewarded.
- Înlocuiești în cod:
  - `src/lib/admob.ts` → `AD_UNITS.interstitial` și `AD_UNITS.rewarded`
  - `scripts/patch-android.mjs` → `ADMOB_META` value cu App ID-ul real
- Rulezi `node scripts/patch-android.mjs` ca să re-scrie manifest-ul.
- Rulezi `npm run build && npx cap sync android` + rebuild AAB.

### 2. Play Console (aplicație nouă)
- **Create app** → nume `Bancuri Românești`, Game/App: **App**, Free.
- **Package name:** `com.polarbearstudio.bancuri`
- Refolosești același setup ca Gravity Flip pentru:
  - Content rating (IARC) — aici alegi **„Other" / „News & Entertainment"** în loc de Game
  - Target audience: 13-17, 18+
  - Data safety: același răspuns ca Gravity Flip (Location + Device or other IDs, ambele Collected + Shared, Advertising or marketing)
  - Ads: YES
  - Privacy policy: **`https://neacsuclaudiu.github.io/gravity-flip/privacy.html`** SAU host separat `bancuri/privacy.html` dacă vrei
- **Store listing:**
  - Iconiță 512×512 din logo (folosește `assets/icon.png`)
  - Feature graphic 1024×500
  - Capturi de ecran din aplicație (min 2)
  - Descrieri (RO + EN)

### 3. IAP `remove_ads`
- Play Console → Monetize with Play → Products → In-app products → Create product.
- **Product ID: exact `remove_ads`**, tip: One-time, preț: **1.99 EUR**.

### 4. Semnare
Se folosește **același keystore** ca Gravity Flip (copiat aici ca `bancuri.keystore`).
Deja configurat în `android/app/build.gradle`.

### 5. Închisă testare (14 zile)
Folosești aceeași listă de testeri „My testers" din Gravity Flip — testerii tăi primesc și această aplicație. La invitare, aleg contul Google logat pe telefon.

## Detalii implementare

| Ce | Unde |
|---|---|
| Contor 15 bancuri citite → interstitial | `onJokeRead()` în `src/lib/admob.ts`, apelat din `src/components/Reader.tsx` |
| Rewarded → 24h ad-free | `showRewarded()` + `grantAdFreeHours()` |
| Cumpărare Remove Ads | `buyRemoveAds()` din `src/pages/Settings.tsx` |
| Prețul afișat automat | `getRemoveAdsPrice()` (din Play Store real; fallback „1.99 EUR") |
| Restaurare cumpărătură după reinstalare | `productUpdated` cu `p.owned` |
