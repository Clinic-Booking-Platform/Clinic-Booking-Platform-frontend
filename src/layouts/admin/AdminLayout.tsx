import React from 'react'
import { Outlet } from 'react-router-dom'
import { AdminSidebar } from './AdminSidebar'
import { AdminHeader } from './AdminHeader'

export const AdminLayout: React.FC = () => {
  return (
    <div className="flex min-h-screen w-full bg-background text-foreground antialiased selection:bg-teal-500/20 selection:text-teal-700 dark:selection:text-teal-300">
      {/* 1. Mobile Drawer Sidebar (< 1024px) */}
      <AdminSidebar isMobile={true} />

      {/* 2. Desktop Fixed/Collapsible Sidebar (>= 1024px) */}
      <AdminSidebar isMobile={false} />

      {/* 3. Main Content Container Wrapper */}
      <div className="flex flex-1 flex-col min-w-0 min-h-screen">
        {/* Topbar Header */}
        <AdminHeader />

        {/* Dynamic Route Content */}
        <main className="flex-1 overflow-y-auto bg-muted/25 p-4 sm:p-6 lg:p-8 transition-colors duration-200">
          <div className="mx-auto max-w-7xl animate-in fade-in duration-200">
            <Outlet />
          </div>
        </main>

        {/* Minimalist Medical Footer */}
        <footer className="border-t border-border/60 bg-background/80 px-4 sm:px-6 py-3 text-center text-xs text-muted-foreground flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            © 2026 <strong>MediCare Clinic</strong> • Nền tảng Đặt lịch khám bệnh trực tuyến.
          </span>
          <span className="text-[11px] text-muted-foreground/80">
            Môi trường: <span className="text-teal-600 dark:text-teal-400 font-medium">Staging v1.2</span> • Đường dây nóng kỹ thuật: 1900 8899
          </span>
        </footer>
      </div>
    </div>
  )
}
