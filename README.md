# 😂 Bancuri Românești

O aplicație modernă **Web + Android (PWA)** cu cea mai tare colecție de bancuri românești —
**6.500+ bancuri** în **17 categorii**, importate automat din arhiva text. Rapidă, elegantă,
funcționează **complet offline** și este pregătită pentru Google Play și ca Progressive Web App.

Design premium în stil Material Design 3: carduri rotunjite, gradienți fini, animații line,
Dark/Light mode, navigație de jos și micro-interacțiuni plăcute.

---

## ✨ Funcționalități

**Navigare & conținut**
- 🏠 **Acasă** — bancul zilei, banc aleatoriu, categorii, recomandate, văzute recent
- 😂 **Categorii** — 17 categorii cu emoji și culori proprii (Bulă, Blonde, Animale, Poliţişti…)
- 🔍 **Căutare instant** — caută în toate bancurile, insensibil la diacritice, cu lazy-loading
- ❤️ **Favorite** — salvează bancurile preferate (persistente, offline)
- ⚙️ **Setări** — temă, mărime text, backup, premium

**Citire**
- Pagină de citire cu text mare, navigare **înapoi / următorul**
- **Swipe** stânga/dreapta pentru banc precedent/următor, swipe jos pentru închidere
- Butoane **Copiază**, **Distribuie** (Web Share API), **Favorite** pe fiecare card

**Distracție & gamificare**
- 🔥 **Streak zilnic** (zile consecutive)
- 🏆 **11 realizări** deblocabile (citite, favorite, streak, distribuiri)
- 📊 **Statistici**: total bancuri, categorii, favorite, citite, streak, procent explorat
- 🎲 **Banc aleatoriu**, buton flotant **„Surprinde-mă”**
- 📱 **Scutură telefonul** pentru un banc la întâmplare
- ⬇️ **Pull-to-refresh** pentru un banc surpriză

**Sistem**
- 🌙 **Dark / Light / System**
- 🔤 Mărime text ajustabilă (90%–140%)
- 💾 **Backup & Restore** favorite (fișier JSON)
- 📴 **Offline complet** — datele sunt cache-uite (Service Worker + IndexedDB)
- 🌍 Română (arhitectură pregătită pentru mai multe limbi)
- 👑 Comutator **Premium** (elimină reclamele)

---

## 🛠️ Stack tehnologic

| Zonă | Tehnologie |
|------|-----------|
| UI | React 18 + TypeScript |
| Build | Vite 5 |
| Stil | Tailwind CSS 3 (Material 3-inspired) |
| Animații | Framer Motion |
| Iconițe | Lucide React |
| State | Zustand |
| Rutare | React Router (HashRouter — compatibil Capacitor) |
| Stocare | IndexedDB (`idb`) — favorite, istoric, setări, statistici |
| PWA | vite-plugin-pwa (Workbox) |
| Android | Capacitor 6 |
| Reclame | AdMob (`@capacitor-community/admob`) — pregătit, opțional |

---

## 🚀 Pornire rapidă

```bash
npm install         # instalează dependențele
npm run parse       # (opțional) regenerează baza din arhiva .txt
npm run dev         # server de dezvoltare  → http://localhost:5173
npm run build       # build de producție    → dist/
npm run preview     # previzualizează build-ul
```

`npm run build` rulează automat `parse` (import bancuri) + type-check + build Vite + generare PWA.

---

## 📁 Structura proiectului

```
bancuri-romanesti/
├── scripts/
│   ├── parse-jokes.mjs      # arhivă .txt  ->  public/data/jokes.json
│   └── gen-icons.mjs        # generează iconițele PWA (fără dependențe)
├── public/
│   ├── data/jokes.json      # baza de bancuri (generată)
│   ├── icons/               # iconițe 192/512/maskable
│   └── favicon.svg
├── src/
│   ├── data/                # jokesRepo (căutare, index), db (IndexedDB)
│   ├── store/               # zustand: useStore, useReader, useToast
│   ├── hooks/               # useTheme, useShake, useSwipe, useInfinite, useJokeActions
│   ├── lib/                 # text, share, backup, gamification, admob
│   ├── components/          # JokeCard, Reader, BottomNav, CategoryCard, ...
│   ├── pages/               # Home, Categories, CategoryDetail, Search, Favorites, Settings, Stats
│   └── App.tsx
├── capacitor.config.ts
├── tailwind.config.js
└── vite.config.ts
```

---

## 🔄 Actualizarea bancurilor

Baza de date este generată din arhivă. Pentru a o schimba:

1. Înlocuiește `D:/Descarcari/bancuri_romanesti.txt` (sau setează `BANCURI_SRC`), ori copiază
   arhiva în `src-data/bancuri_romanesti.txt`.
2. Rulează `npm run parse`.
3. Gata — `public/data/jokes.json` este regenerat, cu categorii și număr recalculate.

**Format arhivă** (detectat automat):
```
============================================================
Bancuri cu Bula (653 bancuri)
============================================================

--- Banc 1 ---
Textul bancului...

--- Banc 2 ---
I: Întrebare?
R: Răspuns.
```
Parserul detectează categoriile, elimină duplicatele și normalizează textul.

---

## 📱 Build Android (Capacitor)

```bash
npm install @capacitor/core @capacitor/cli @capacitor/android
npm run build
npx cap add android
npx cap sync
npx cap open android      # deschide în Android Studio → Run / Build APK/AAB
```

`capacitor.config.ts` este deja configurat (`appId: ro.bancuri.app`, `webDir: dist`).

### Iconiță & splash Android (logo oficial)

Logo-ul oficial este în `src-data/logo-source.png`. `npm run icons` regenerează toate
imaginile (favicon, iconițe PWA, splash) în `public/` și pregătește sursele în `resources/`
(`icon.png` 1024×1024, `splash.png` 2732×2732). Pentru iconițele native Android:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate --android   # folosește resources/icon.png + splash.png
```

Ca să schimbi logo-ul: înlocuiește `src-data/logo-source.png`, apoi `npm run icons`.

### Reclame AdMob (opțional)

1. `npm install @capacitor-community/admob`
2. În `src/lib/admob.ts`, decomentează blocul `ensureAdMob()` și înlocuiește ID-urile de test
   cu ID-urile tale reale.
3. Adaugă App ID-ul AdMob în `android/app/src/main/AndroidManifest.xml`:
   ```xml
   <meta-data android:name="com.google.android.gms.ads.APPLICATION_ID"
              android:value="ca-app-pub-XXXXXXXX~YYYYYYYY"/>
   ```
4. Apelurile sunt deja integrate: `showBanner()`, `showInterstitial()`, `showRewarded()`.
   Reclamele se ascund automat pentru utilizatorii **Premium** (`setPremium(true)`).

Pe Web, funcțiile AdMob sunt no-op (nu se întâmplă nimic), deci același cod rulează peste tot.

---

## 🌐 PWA

- Manifest + Service Worker generate automat la build.
- Instalabilă pe telefon și desktop („Add to Home Screen”).
- După prima încărcare, funcționează **100% offline** (bancuri, imagini, UI cache-uite).

---

## 📄 Licență

Cod: MIT. Bancurile provin dintr-o colecție publică de umor românesc.
