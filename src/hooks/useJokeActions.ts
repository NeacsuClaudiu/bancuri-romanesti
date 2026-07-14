import { useCallback } from 'react'
import { useStore } from '../store/useStore'
import { useToast } from '../store/useToast'
import { copyText, haptic, shareText } from '../lib/share'
import type { Joke } from '../types'

export function useJokeActions() {
  const toggleFavorite = useStore((s) => s.toggleFavorite)
  const incShared = useStore((s) => s.incShared)
  const incCopied = useStore((s) => s.incCopied)
  const show = useToast((s) => s.show)

  const onCopy = useCallback(
    async (joke: Joke) => {
      haptic()
      const ok = await copyText(joke.t)
      if (ok) {
        incCopied()
        show('Banc copiat!', '📋')
      } else {
        show('Nu am putut copia', '⚠️')
      }
    },
    [incCopied, show]
  )

  const onShare = useCallback(
    async (joke: Joke) => {
      haptic()
      const res = await shareText(joke.t)
      if (res === 'shared') {
        incShared()
        show('Distribuit!', '📤')
      } else if (res === 'copied') {
        incShared()
        show('Copiat pentru distribuire', '📋')
      }
    },
    [incShared, show]
  )

  const onToggleFavorite = useCallback(
    (joke: Joke) => {
      haptic()
      const wasFav = useStore.getState().favorites.includes(joke.id)
      toggleFavorite(joke.id)
      show(wasFav ? 'Scos de la favorite' : 'Adăugat la favorite', wasFav ? '💔' : '❤️')
    },
    [toggleFavorite, show]
  )

  return { onCopy, onShare, onToggleFavorite }
}
