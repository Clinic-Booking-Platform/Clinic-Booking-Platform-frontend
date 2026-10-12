// ================= FILE: src/layouts/admin/AdminBreadcrumb.tsx =================
import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight, Home } from 'lucide-react'
import { getNavBreadcrumb } from '@/config/navigation.config'
import { useAuth } from '@/hooks/useAuth'

export const AdminBreadcrumb: React.FC = () => {
  const location = useLocation()
  const { isDoctor } = useAuth()
  const breadcrumb = getNavBreadcrumb(location.pathname)

  const isDashboard =
    location.pathname === '/admin/dashboard' || location.pathname === '/doctor/dashboard'

  if (!breadcrumb) {
    return (
      <div className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
        <Link
          to={isDoctor ? '/doctor/dashboard' : '/admin/dashboard'}
          className="hover:text-foreground transition-colors flex items-center gap-1"
        >
          <Home className="size-3.5" />
          <span>{isDoctor ? 'Bàn làm việc Bác sĩ' : 'Admin'}</span>
        </Link>
        <ChevronRight className="size-3 text-muted-foreground/60" />
        <span className="text-foreground font-semibold">Cổng Portal</span>
      </div>
    )
  }

  return (
    <nav aria-label="Breadcrumb" className="flex items-center text-xs text-muted-foreground gap-1.5 font-medium">
      <Link
        to={isDoctor ? '/doctor/dashboard' : '/admin/dashboard'}
        className="hover:text-foreground transition-colors flex items-center gap-1 p-0.5 rounded hover:bg-muted/50"
        title="Về Dashboard"
      >
        <Home className="size-3.5 text-teal-600 dark:text-teal-400" />
        <span className="hidden sm:inline">{isDoctor ? 'Bàn làm việc' : 'Hệ thống'}</span>
      </Link>

      {!isDashboard && (
        <>
          <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
          <span className="text-muted-foreground/80 hidden md:inline truncate max-w-[140px]">
            {breadcrumb.groupName}
          </span>
          <ChevronRight className="size-3 text-muted-foreground/50 shrink-0 hidden md:inline" />
          <span className="text-foreground font-semibold truncate max-w-[200px]">
            {breadcrumb.itemTitle}
          </span>
        </>
      )}

      {isDashboard && (
        <>
          <ChevronRight className="size-3 text-muted-foreground/50 shrink-0" />
          <span className="text-foreground font-semibold">
            {isDoctor ? 'Bàn làm việc Bác sĩ' : 'Dashboard Tổng quan'}
          </span>
        </>
      )}
    </nav>
  )
}

export default AdminBreadcrumb
