import React from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  X,
  Stethoscope,
  ChevronRight,
} from 'lucide-react'
import { cn } from 'cn'
import { ADMIN_NAV_GROUPS, type NavItem } from '@/config/admin-nav.config'
import { useUIStore } from '@/stores'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'


interface AdminSidebarProps {
  isMobile?: boolean
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ isMobile = false }) => {

  const location = useLocation()
  const {
    isSidebarCollapsed,
    isMobileSidebarOpen,
    closeMobileSidebar,
  } = useUIStore()



  // Helper render Badge
  const renderBadge = (badge?: NavItem['badge']) => {
    if (!badge) return null

    let colorClasses = 'bg-muted text-muted-foreground'
    if (badge.variant === 'destructive') {
      colorClasses = 'bg-rose-500/15 text-rose-600 dark:text-rose-400 font-semibold'
    } else if (badge.variant === 'secondary') {
      colorClasses = 'bg-teal-500/15 text-teal-700 dark:text-teal-300'
    } else if (badge.variant === 'teal') {
      colorClasses = 'bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 font-semibold'
    } else if (badge.variant === 'outline') {
      colorClasses = 'border border-border text-muted-foreground text-[10px]'
    }

    return (
      <span
        className={cn(
          'ml-auto text-[10px] px-1.5 py-0.5 rounded-full shrink-0 font-medium',
          colorClasses
        )}
      >
        {badge.text}
      </span>
    )
  }

  // Sidebar Inner Content
  const sidebarContent = (
    <TooltipProvider delay={100}>
      <div className="flex h-full flex-col bg-card border-r border-border/70 select-none">
        {/* Brand / Logo Header */}
        <div
          className={cn(
            'flex h-16 items-center border-b border-border/60 px-4 transition-all duration-300',
            !isMobile && isSidebarCollapsed ? 'justify-center px-2' : 'justify-between'
          )}
        >
          <NavLink
            to="/admin/dashboard"
            onClick={() => isMobile && closeMobileSidebar()}
            className="flex items-center gap-2.5 overflow-hidden"
          >
            {/* Clinic Medical Icon with glowing effect */}
            <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-teal-500 to-teal-700 text-white shadow-md shadow-teal-500/20">
              <Stethoscope className="size-5" />
            </div>

            {/* Brand Text (Hidden when collapsed on desktop) */}
            {(isMobile || !isSidebarCollapsed) && (
              <div className="flex flex-col text-left leading-none transition-opacity duration-200">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-sm tracking-tight text-foreground">
                    MediCare
                  </span>
                  <span className="text-[10px] font-semibold bg-teal-500/15 text-teal-600 dark:text-teal-400 px-1 py-0.2 rounded">
                    ADMIN
                  </span>
                </div>
                <span className="text-[10px] text-muted-foreground mt-0.5">
                  Clinic Booking Platform
                </span>
              </div>
            )}
          </NavLink>

          {/* Nút đóng dành riêng cho Mobile Drawer */}
          {isMobile && (
            <button
              onClick={closeMobileSidebar}
              className="flex size-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Đóng menu"
            >
              <X className="size-5" />
            </button>
          )}
        </div>

        {/* Navigation Groups List */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6 scrollbar-thin scrollbar-thumb-muted">
          {ADMIN_NAV_GROUPS.map((group, groupIndex) => {
            const showTitle = isMobile || !isSidebarCollapsed

            return (
              <div key={groupIndex} className="space-y-1">
                {/* Group Title */}
                {showTitle ? (
                  <h3 className="px-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">
                    {group.groupTitle}
                  </h3>
                ) : (
                  <div className="h-px bg-border/40 mx-2 my-2" />
                )}

                {/* Items in Group */}
                <div className="space-y-0.5 pt-1">
                  {group.items.map((item) => {
                    const isActive =
                      location.pathname === item.path ||
                      (item.path !== '/admin/dashboard' &&
                        location.pathname.startsWith(`${item.path}/`))

                    const Icon = item.icon

                    // Nội dung của nút Link
                    const navLinkNode = (
                      <NavLink
                        to={item.path}
                        onClick={() => isMobile && closeMobileSidebar()}
                        className={cn(
                          'group relative flex items-center gap-3 rounded-lg text-xs font-medium transition-all duration-150',
                          !isMobile && isSidebarCollapsed
                            ? 'justify-center size-10 mx-auto'
                            : 'px-2.5 py-2 w-full',
                          isActive
                            ? 'bg-teal-500/15 text-teal-800 dark:text-teal-200 font-semibold shadow-xs'
                            : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                        )}
                      >
                        {/* Thanh chỉ thị active bên mép trái */}
                        {isActive && (
                          <span
                            className={cn(
                              'absolute left-0 top-1.5 bottom-1.5 w-1 rounded-r-md bg-teal-600 dark:bg-teal-400',
                              !isMobile && isSidebarCollapsed && '-left-1'
                            )}
                          />
                        )}

                        <Icon
                          className={cn(
                            'size-4 shrink-0 transition-transform duration-150 group-hover:scale-105',
                            isActive
                              ? 'text-teal-600 dark:text-teal-400'
                              : 'text-muted-foreground group-hover:text-foreground'
                          )}
                        />

                        {/* Tiêu đề & Badge (ẩn khi collapsed trên desktop) */}
                        {(isMobile || !isSidebarCollapsed) && (
                          <>
                            <span className="truncate flex-1 text-left">{item.title}</span>
                            {renderBadge(item.badge)}
                            {!item.badge && isActive && (
                              <ChevronRight className="size-3 text-teal-600/70 dark:text-teal-400/70 ml-auto shrink-0" />
                            )}
                          </>
                        )}
                      </NavLink>
                    )

                    // Nếu đang thu gọn trên desktop, bọc trong Tooltip để hiển thị tên khi hover
                    if (!isMobile && isSidebarCollapsed) {
                      return (
                        <Tooltip key={item.path}>
                          <TooltipTrigger render={navLinkNode} />
                          <TooltipContent side="right" sideOffset={12} className="text-xs font-medium">
                            <div className="flex items-center gap-1.5">
                              <span>{item.title}</span>
                              {item.badge && (
                                <span className="text-[10px] px-1 rounded bg-teal-500/20 text-teal-400">
                                  {item.badge.text}
                                </span>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      )
                    }

                    return <React.Fragment key={item.path}>{navLinkNode}</React.Fragment>
                  })}
                </div>
              </div>
            )
          })}
        </div>

        {/* Footer / Status Area */}
        {isMobile || !isSidebarCollapsed ? (
          <div className="border-t border-border/60 p-3 bg-muted/20">
            <div className="flex items-center justify-between rounded-lg bg-card/60 border border-border/60 px-3 py-2 text-[11px]">
              <div className="flex items-center gap-2">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex size-2 rounded-full bg-emerald-500"></span>
                </span>
                <span className="text-muted-foreground font-medium">Cổng Khám Chữa Bệnh</span>
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/80">v1.2.0</span>
            </div>
          </div>
        ) : (
          /* Compact Status Indicator when collapsed */
          <div className="border-t border-border/60 p-2 flex justify-center">
            <span className="relative flex size-2.5 my-2" title="Hệ thống trực tuyến">
              <span className="relative inline-flex size-2.5 rounded-full bg-emerald-500"></span>
            </span>
          </div>
        )}
      </div>
    </TooltipProvider>
  )

  // 1. Giao diện Mobile Drawer (mở khi isMobileSidebarOpen = true)
  if (isMobile) {
    if (!isMobileSidebarOpen) return null

    return (
      <div className="fixed inset-0 z-50 lg:hidden">
        {/* Backdrop mờ nền */}
        <div
          onClick={closeMobileSidebar}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
          aria-hidden="true"
        />

        {/* Drawer trượt từ bên trái */}
        <div className="fixed inset-y-0 left-0 w-72 max-w-[85vw] shadow-2xl animate-in slide-in-from-left duration-250">
          {sidebarContent}
        </div>
      </div>
    )
  }

  // 2. Giao diện Desktop Sidebar (cố định bên trái)
  return (
    <aside
      className={cn(
        'hidden lg:block shrink-0 transition-all duration-300 ease-in-out',
        isSidebarCollapsed ? 'w-[72px]' : 'w-64'
      )}
    >
      <div
        className={cn(
          'fixed inset-y-0 left-0 z-30 transition-all duration-300 ease-in-out',
          isSidebarCollapsed ? 'w-[72px]' : 'w-64'
        )}
      >
        {sidebarContent}
      </div>
    </aside>
  )
}
