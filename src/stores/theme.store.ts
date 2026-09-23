import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'
  const saved = localStorage.getItem('clinic_admin_theme') as ThemeMode | null
  if (saved === 'dark' || saved === 'light') return saved
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const useThemeStore = create<ThemeState>((set) => ({
  theme: getInitialTheme(),

  setTheme: (theme: ThemeMode) => {
    localStorage.setItem('clinic_admin_theme', theme)
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    set({ theme })
  },

  toggleTheme: () =>
    set((state) => {
      const nextTheme = state.theme === 'light' ? 'dark' : 'light'
      localStorage.setItem('clinic_admin_theme', nextTheme)
      if (nextTheme === 'dark') {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
      return { theme: nextTheme }
    }),
}))
