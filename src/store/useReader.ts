import { create } from 'zustand'

interface ReaderState {
  open: boolean
  queue: string[] // joke ids
  index: number
  title: string
  openReader: (queue: string[], index: number, title?: string) => void
  close: () => void
  next: () => void
  prev: () => void
  goto: (i: number) => void
  setQueue: (queue: string[]) => void
}

export const useReader = create<ReaderState>((set, get) => ({
  open: false,
  queue: [],
  index: 0,
  title: 'Banc',
  openReader: (queue, index, title = 'Banc') =>
    set({ open: true, queue, index: Math.max(0, Math.min(index, queue.length - 1)), title }),
  close: () => set({ open: false }),
  next: () => {
    const { index, queue } = get()
    if (index < queue.length - 1) set({ index: index + 1 })
  },
  prev: () => {
    const { index } = get()
    if (index > 0) set({ index: index - 1 })
  },
  goto: (i) => {
    const { queue } = get()
    if (i >= 0 && i < queue.length) set({ index: i })
  },
  setQueue: (queue) => set({ queue }),
}))
