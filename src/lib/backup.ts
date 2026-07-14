import { useStore } from '../store/useStore'

interface BackupFile {
  app: 'bancuri-romanesti'
  version: 1
  exportedAt: string
  favorites: string[]
  stats: ReturnType<typeof useStore.getState>['stats']
  settings: ReturnType<typeof useStore.getState>['settings']
}

export function exportBackup(): void {
  const s = useStore.getState()
  const data: BackupFile = {
    app: 'bancuri-romanesti',
    version: 1,
    exportedAt: new Date().toISOString(),
    favorites: s.favorites,
    stats: s.stats,
    settings: s.settings,
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `bancuri-backup-${new Date().toISOString().slice(0, 10)}.json`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export async function importBackup(file: File): Promise<{ ok: boolean; imported: number; error?: string }> {
  try {
    const text = await file.text()
    const data = JSON.parse(text) as Partial<BackupFile>
    if (data.app !== 'bancuri-romanesti' || !Array.isArray(data.favorites)) {
      return { ok: false, imported: 0, error: 'Fișier de backup nevalid.' }
    }
    const s = useStore.getState()
    s.importFavorites(data.favorites)
    if (data.settings) s.updateSettings(data.settings)
    return { ok: true, imported: data.favorites.length }
  } catch (e: any) {
    return { ok: false, imported: 0, error: 'Nu am putut citi fișierul.' }
  }
}
