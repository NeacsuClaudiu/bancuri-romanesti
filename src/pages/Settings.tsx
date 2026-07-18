import { useRef } from 'react'
import { Sun, Moon, Smartphone, Type, Zap, Vibrate, Crown, Download, Upload, Globe, Trash2, Github, Heart } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useStore } from '../store/useStore'
import { useToast } from '../store/useToast'
import { exportBackup, importBackup } from '../lib/backup'
import { requestMotionPermission } from '../hooks/useShake'
import { setPremium, isNativePlatform, buyRemoveAds, getRemoveAdsPrice, showRewarded, grantAdFreeHours } from '../lib/admob'
import { allJokes } from '../data/jokesRepo'
import type { ThemeMode } from '../types'

export function Settings() {
  const settings = useStore((s) => s.settings)
  const update = useStore((s) => s.updateSettings)
  const resetProgress = useStore((s) => s.resetProgress)
  const show = useToast((s) => s.show)
  const fileRef = useRef<HTMLInputElement>(null)

  const themes: { value: ThemeMode; label: string; Icon: typeof Sun }[] = [
    { value: 'light', label: 'Luminos', Icon: Sun },
    { value: 'dark', label: 'Întunecat', Icon: Moon },
    { value: 'system', label: 'Sistem', Icon: Smartphone },
  ]

  const onImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const res = await importBackup(file)
    show(res.ok ? `${res.imported} favorite importate` : res.error || 'Import eșuat', res.ok ? '✅' : '⚠️')
    e.target.value = ''
  }

  const toggleShake = async (v: boolean) => {
    if (v) {
      const ok = await requestMotionPermission()
      if (!ok) {
        show('Permisiune refuzată pentru senzor', '⚠️')
        return
      }
    }
    update({ shake: v })
  }

  const onBuyRemoveAds = () => {
    if (!isNativePlatform()) {
      show('Cumpărături disponibile doar în aplicația Android', 'ℹ️')
      return
    }
    buyRemoveAds()
  }

  const onWatchAdForFreeDay = async () => {
    if (!isNativePlatform()) {
      show('Reclamele apar doar în aplicația Android', 'ℹ️')
      return
    }
    show('Se încarcă reclama…', '🎬')
    const ok = await showRewarded()
    if (ok) {
      grantAdFreeHours(24)
      update({ premium: true })
      show('Ai primit 24 de ore fără reclame!', '🎉')
    } else {
      show('Reclama nu s-a putut afișa. Încearcă din nou.', '⚠️')
    }
  }

  return (
    <div>
      <PageHeader title="Setări" subtitle="Personalizează experiența" />

      {/* Theme */}
      <Section title="Aspect" icon={<Sun size={18} />}>
        <div className="grid grid-cols-3 gap-2">
          {themes.map(({ value, label, Icon }) => {
            const active = settings.theme === value
            return (
              <button
                key={value}
                onClick={() => update({ theme: value })}
                className={`flex flex-col items-center gap-1.5 rounded-2xl border-2 py-3 text-xs font-bold transition ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-600 dark:border-brand-400 dark:bg-brand-400/10 dark:text-brand-300'
                    : 'border-transparent bg-white text-slate-500 shadow-card dark:bg-white/[0.06] dark:text-slate-300'
                }`}
              >
                <Icon size={20} />
                {label}
              </button>
            )
          })}
        </div>
      </Section>

      {/* Font size */}
      <Section title="Mărime text" icon={<Type size={18} />}>
        <div className="card p-4">
          <div className="mb-3 flex items-center justify-between">
            <span className="text-sm text-slate-400">A</span>
            <span
              className="font-bold text-slate-800 dark:text-slate-100"
              style={{ fontSize: `${settings.fontScale}rem` }}
            >
              Bancul zilei 😄
            </span>
            <span className="text-lg font-bold text-slate-500 dark:text-slate-300">A</span>
          </div>
          <input
            type="range"
            min={0.9}
            max={1.4}
            step={0.05}
            value={settings.fontScale}
            onChange={(e) => update({ fontScale: parseFloat(e.target.value) })}
            className="w-full accent-brand-500"
          />
          <div className="mt-1 flex justify-between text-[0.68rem] font-semibold text-slate-400">
            <span>Mic</span>
            <span>{Math.round(settings.fontScale * 100)}%</span>
            <span>Mare</span>
          </div>
        </div>
      </Section>

      {/* Toggles */}
      <Section title="Preferințe" icon={<Zap size={18} />}>
        <div className="card divide-y divide-slate-100 dark:divide-white/5">
          <ToggleRow
            icon={<Vibrate size={19} />}
            title="Scutură pentru banc aleatoriu"
            subtitle="Agită telefonul ca să vezi o glumă"
            value={settings.shake}
            onChange={toggleShake}
          />
          <ToggleRow
            icon={<Zap size={19} />}
            title="Reduce animațiile"
            subtitle="Mai puțină mișcare în interfață"
            value={settings.reduceMotion}
            onChange={(v) => update({ reduceMotion: v })}
          />
        </div>
      </Section>

      {/* Premium */}
      <Section title="Premium" icon={<Crown size={18} />}>
        {settings.premium ? (
          <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-white shadow-glow">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/25 text-xl">👑</span>
              <div>
                <p className="font-extrabold">Premium activ</p>
                <p className="text-xs text-white/85">Fără reclame. Mulțumim că susții aplicația!</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <button
              onClick={onBuyRemoveAds}
              className="w-full overflow-hidden rounded-3xl bg-gradient-to-br from-amber-400 to-orange-500 p-4 text-left text-white shadow-glow transition active:scale-[0.98]"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/25 text-xl">👑</span>
                  <div>
                    <p className="font-extrabold">Elimină reclamele</p>
                    <p className="text-xs text-white/85">Plată unică, fără reclame pentru totdeauna</p>
                  </div>
                </div>
                <span className="whitespace-nowrap rounded-2xl bg-white/25 px-3 py-1.5 text-sm font-extrabold">
                  {getRemoveAdsPrice() || '1.99 EUR'}
                </span>
              </div>
            </button>
            <button
              onClick={onWatchAdForFreeDay}
              className="w-full rounded-3xl border-2 border-brand-500 bg-brand-50 p-4 text-left text-brand-700 shadow-card transition active:scale-[0.98] dark:border-brand-400 dark:bg-brand-400/10 dark:text-brand-200"
            >
              <div className="flex items-center gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-2xl bg-brand-500/15 text-xl">🎬</span>
                <div>
                  <p className="font-extrabold">Vezi o reclamă → 24h fără reclame</p>
                  <p className="text-xs opacity-75">Alternativa gratuită</p>
                </div>
              </div>
            </button>
          </div>
        )}
      </Section>

      {/* Language */}
      <Section title="Limbă" icon={<Globe size={18} />}>
        <div className="card divide-y divide-slate-100 dark:divide-white/5">
          <div className="flex items-center justify-between p-4">
            <span className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-100">
              🇷🇴 Română
            </span>
            <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-bold text-brand-600 dark:bg-brand-400/15 dark:text-brand-300">
              Activ
            </span>
          </div>
          <div className="flex items-center justify-between p-4 opacity-50">
            <span className="flex items-center gap-3 font-semibold text-slate-800 dark:text-slate-100">🌍 Alte limbi</span>
            <span className="text-xs font-semibold text-slate-400">În curând</span>
          </div>
        </div>
      </Section>

      {/* Backup */}
      <Section title="Backup & Restaurare" icon={<Download size={18} />}>
        <div className="flex gap-2">
          <button
            onClick={exportBackup}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-slate-700 shadow-card press dark:bg-white/[0.06] dark:text-slate-200"
          >
            <Download size={18} /> Exportă
          </button>
          <button
            onClick={() => fileRef.current?.click()}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-white py-3 text-sm font-semibold text-slate-700 shadow-card press dark:bg-white/[0.06] dark:text-slate-200"
          >
            <Upload size={18} /> Importă
          </button>
          <input ref={fileRef} type="file" accept="application/json,.json" hidden onChange={onImport} />
        </div>
      </Section>

      {/* Danger */}
      <Section title="Date" icon={<Trash2 size={18} />}>
        <button
          onClick={() => {
            if (confirm('Sigur vrei să ștergi tot progresul, favoritele și statisticile?')) {
              resetProgress()
              show('Progres resetat', '🧹')
            }
          }}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 py-3 text-sm font-semibold text-rose-600 press dark:border-rose-400/20 dark:bg-rose-400/10 dark:text-rose-300"
        >
          <Trash2 size={18} /> Resetează progresul
        </button>
      </Section>

      {/* About */}
      <div className="mb-4 mt-8 flex flex-col items-center gap-1 text-center text-sm text-slate-400">
        <p className="flex items-center gap-1.5 font-semibold text-slate-500 dark:text-slate-400">
          Bancuri Românești <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs dark:bg-white/10">v1.0.0</span>
        </p>
        <p>{allJokes().length.toLocaleString('ro-RO')} bancuri · funcționează offline</p>
        <p className="mt-1 flex items-center gap-1">
          Făcut cu <Heart size={13} className="text-rose-500" fill="currentColor" /> pentru râs
        </p>
      </div>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="mb-6">
      <h2 className="mb-2.5 flex items-center gap-2 px-1 text-sm font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        <span className="text-brand-500">{icon}</span>
        {title}
      </h2>
      {children}
    </section>
  )
}

function ToggleRow({
  icon,
  title,
  subtitle,
  value,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  subtitle: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between p-4">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand-50 text-brand-500 dark:bg-brand-400/10">
          {icon}
        </span>
        <div>
          <p className="font-semibold text-slate-800 dark:text-slate-100">{title}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">{subtitle}</p>
        </div>
      </div>
      <Switch value={value} onChange={onChange} />
    </div>
  )
}

function Switch({ value, onChange, light }: { value: boolean; onChange: (v: boolean) => void; light?: boolean }) {
  return (
    <button
      role="switch"
      aria-checked={value}
      onClick={() => onChange(!value)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        value ? (light ? 'bg-white/90' : 'bg-brand-500') : light ? 'bg-white/30' : 'bg-slate-300 dark:bg-white/15'
      }`}
    >
      <span
        className={`absolute top-0.5 h-6 w-6 rounded-full shadow transition-all ${
          value ? 'left-[22px]' : 'left-0.5'
        } ${light && value ? 'bg-amber-500' : 'bg-white'}`}
      />
    </button>
  )
}
