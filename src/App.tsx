import { useEffect, useState } from 'react'
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { loadJokes, randomJoke } from './data/jokesRepo'
import { useStore } from './store/useStore'
import { useReader } from './store/useReader'
import { useThemeEffect } from './hooks/useTheme'
import { useShake } from './hooks/useShake'
import { setPremium } from './lib/admob'

import { Splash } from './components/Splash'
import { BottomNav } from './components/BottomNav'
import { Reader } from './components/Reader'
import { ToastHost } from './components/ToastHost'
import { AchievementPopup } from './components/AchievementPopup'
import { SurpriseButton } from './components/SurpriseButton'
import { PullToRefresh } from './components/PullToRefresh'

import { Home } from './pages/Home'
import { Categories } from './pages/Categories'
import { CategoryDetail } from './pages/CategoryDetail'
import { Search } from './pages/Search'
import { Favorites } from './pages/Favorites'
import { Settings } from './pages/Settings'
import { Stats } from './pages/Stats'

// FAB + pull-to-refresh only make sense on browsing screens.
const FAB_ROUTES = ['/', '/categorii', '/favorite']

function Shell() {
  const location = useLocation()
  const openReader = useReader((s) => s.openReader)
  const shakeEnabled = useStore((s) => s.settings.shake)

  const openRandom = () => {
    const r = randomJoke()
    if (r) openReader([r.id], 0, 'Surpriză')
  }

  useShake(openRandom, shakeEnabled)

  const showFab = FAB_ROUTES.includes(location.pathname) && !useReader.getState().open

  return (
    <div className="app-scope mx-auto min-h-[100dvh] max-w-lg px-4 pb-28">
      <PullToRefresh onRefresh={openRandom}>
        {/* Enter-only transition, re-keyed per route. Avoids AnimatePresence
            mode="wait" exit deadlocks and stays robust with long lists. */}
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          <Routes location={location}>
            <Route path="/" element={<Home />} />
            <Route path="/categorii" element={<Categories />} />
            <Route path="/categorie/:id" element={<CategoryDetail />} />
            <Route path="/cauta" element={<Search />} />
            <Route path="/favorite" element={<Favorites />} />
            <Route path="/statistici" element={<Stats />} />
            <Route path="/setari" element={<Settings />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </motion.div>
      </PullToRefresh>

      {showFab && <SurpriseButton onClick={openRandom} />}
      <BottomNav />
      <Reader />
      <ToastHost />
      <AchievementPopup />
    </div>
  )
}

export default function App() {
  const init = useStore((s) => s.init)
  const ready = useStore((s) => s.ready)
  const premium = useStore((s) => s.settings.premium)
  const [dbReady, setDbReady] = useState(false)
  const [error, setError] = useState<string | undefined>()

  useThemeEffect()

  useEffect(() => {
    let alive = true
    Promise.all([loadJokes(), init()])
      .then(() => {
        if (alive) setDbReady(true)
      })
      .catch((e) => {
        if (alive) setError(e?.message || 'Ceva n-a mers bine.')
      })
    return () => {
      alive = false
    }
  }, [init])

  useEffect(() => {
    setPremium(premium)
  }, [premium])

  if (error) return <Splash error={error} />
  if (!dbReady || !ready) return <Splash />

  return (
    <HashRouter>
      <Shell />
    </HashRouter>
  )
}
