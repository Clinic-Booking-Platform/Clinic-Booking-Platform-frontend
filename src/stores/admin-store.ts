/**
 * File này re-export lại từ các store chuyên biệt nhằm giữ tính tương thích ngược.
 * Khuyến nghị: Import trực tiếp từ '@/stores' (useAuthStore, useThemeStore, useUIStore).
 */
export * from './auth.store'
export * from './theme.store'
export * from './ui.store'

import { useAuthStore } from './auth.store'
import { useThemeStore } from './theme.store'
import { useUIStore } from './ui.store'

// Hook tổng hợp (Facade) nếu component nào muốn gọi nhanh tất cả
export const useAdminStore = () => {
  const auth = useAuthStore()
  const theme = useThemeStore()
  const ui = useUIStore()

  return {
    ...auth,
    ...theme,
    ...ui,
  }
}
