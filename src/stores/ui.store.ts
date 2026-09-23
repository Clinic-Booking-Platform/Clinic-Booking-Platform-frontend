import { create } from 'zustand'

interface UIState {
  // Sidebar state
  isSidebarCollapsed: boolean
  toggleSidebarCollapse: () => void
  setSidebarCollapsed: (collapsed: boolean) => void

  // Mobile Drawer state
  isMobileSidebarOpen: boolean
  openMobileSidebar: () => void
  closeMobileSidebar: () => void
  toggleMobileSidebar: () => void

  // Notifications state
  unreadNotifications: number
  markNotificationsAsRead: () => void
  incrementNotifications: () => void
}

export const useUIStore = create<UIState>((set) => ({
  isSidebarCollapsed: false,
  toggleSidebarCollapse: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  setSidebarCollapsed: (collapsed: boolean) =>
    set({ isSidebarCollapsed: collapsed }),

  isMobileSidebarOpen: false,
  openMobileSidebar: () => set({ isMobileSidebarOpen: true }),
  closeMobileSidebar: () => set({ isMobileSidebarOpen: false }),
  toggleMobileSidebar: () =>
    set((state) => ({ isMobileSidebarOpen: !state.isMobileSidebarOpen })),

  unreadNotifications: 3,
  markNotificationsAsRead: () => set({ unreadNotifications: 0 }),
  incrementNotifications: () =>
    set((state) => ({ unreadNotifications: state.unreadNotifications + 1 })),
}))
