import { create } from 'zustand'

export type ThemeMode = 'light' | 'dark'

interface ThemeState {
  theme: ThemeMode
  setTheme: (theme: ThemeMode) => void
  toggleTheme: () => void
}

const THEME_STORAGE_KEY = 'clinic_admin_theme'
const THEME_FALLBACK_KEY = 'theme'

/**
 * Hàm áp dụng class 'dark' và style colorScheme trực tiếp vào thẻ html
 */
export function applyThemeToDOM(theme: ThemeMode) {
  if (typeof document === 'undefined') return

  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
    root.style.colorScheme = 'dark'
  } else {
    root.classList.remove('dark')
    root.style.colorScheme = 'light'
  }
}

/**
 * Lấy theme khởi tạo từ localStorage hoặc prefers-color-scheme của hệ thống
 * Đồng thời áp dụng ngay lập tức vào DOM để chống mất theme
 */
function getInitialTheme(): ThemeMode {
  if (typeof window === 'undefined') return 'light'

  try {
    const saved = (localStorage.getItem(THEME_STORAGE_KEY) ||
      localStorage.getItem(THEME_FALLBACK_KEY)) as ThemeMode | null

    if (saved === 'dark' || saved === 'light') {
      applyThemeToDOM(saved)
      return saved
    }

    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
    const systemTheme: ThemeMode = prefersDark ? 'dark' : 'light'
    applyThemeToDOM(systemTheme)
    return systemTheme
  } catch {
    applyThemeToDOM('light')
    return 'light'
  }
}

// Áp dụng theme ngay khi file store được nạp
const initialTheme = getInitialTheme()

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,

  setTheme: (theme: ThemeMode) => {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
      localStorage.setItem(THEME_FALLBACK_KEY, theme)
    } catch {
      // Bỏ qua nếu browser chặn localStorage
    }
    applyThemeToDOM(theme)
    set({ theme })
  },

  toggleTheme: () =>
    set((state) => {
      const nextTheme: ThemeMode = state.theme === 'light' ? 'dark' : 'light'
      try {
        localStorage.setItem(THEME_STORAGE_KEY, nextTheme)
        localStorage.setItem(THEME_FALLBACK_KEY, nextTheme)
      } catch {
        // Bỏ qua nếu browser chặn localStorage
      }
      applyThemeToDOM(nextTheme)
      return { theme: nextTheme }
    }),
}))

// Đồng bộ theme giữa nhiều tab trình duyệt khi có sự kiện storage
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (event) => {
    if (event.key === THEME_STORAGE_KEY || event.key === THEME_FALLBACK_KEY) {
      const newTheme = event.newValue as ThemeMode | null
      if (newTheme === 'dark' || newTheme === 'light') {
        applyThemeToDOM(newTheme)
        useThemeStore.setState({ theme: newTheme })
      }
    }
  })
}
