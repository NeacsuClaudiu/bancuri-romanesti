import { create } from 'zustand'

export interface Toast {
  id: number
  message: string
  emoji?: string
}

interface ToastState {
  toasts: Toast[]
  show: (message: string, emoji?: string) => void
  dismiss: (id: number) => void
}

let seq = 1

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],
  show: (message, emoji) => {
    const id = seq++
    set({ toasts: [...get().toasts, { id, message, emoji }] })
    setTimeout(() => get().dismiss(id), 2200)
  },
  dismiss: (id) => set({ toasts: get().toasts.filter((t) => t.id !== id) }),
}))
