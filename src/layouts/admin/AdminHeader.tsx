// ================= FILE: src/layouts/admin/AdminHeader.tsx =================
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Menu,
  PanelLeftClose,
  PanelLeft,
  Search,
  Sun,
  Moon,
  LogOut,
  User as UserIcon,
  ShieldCheck,
  Shield,
  Stethoscope,
} from 'lucide-react'
import { useThemeStore, useUIStore } from '@/stores'
import { useAuth } from '@/hooks/useAuth'
import { AdminBreadcrumb } from './AdminBreadcrumb'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from 'react-toastify'

export const AdminHeader: React.FC = () => {
  const navigate = useNavigate()

  // 1. Quản lý trạng thái UI
  const {
    isSidebarCollapsed,
    toggleSidebarCollapse,
    openMobileSidebar,
  } = useUIStore()

  // 2. Quản lý Theme Sáng/Tối
  const { theme, toggleTheme } = useThemeStore()

  // 3. Quản lý Auth & Thông tin User
  const { user, role, isAdmin, isDoctor, logout } = useAuth()

  const [searchQuery, setSearchQuery] = useState('')

  // Xử lý đăng xuất: Gọi logout, xóa Cookie/Session và chuyển hướng về /login
  const handleLogout = () => {
    logout()
    localStorage.removeItem('auth_user')
    sessionStorage.clear()

    const cookiesToClear = ['token', 'accessToken', 'refreshToken', 'jwt']
    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
    })

    toast.info('Đã đăng xuất khỏi hệ thống')
    navigate('/login', { replace: true })
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-border/80 bg-background/95 px-4 sm:px-6 backdrop-blur-md transition-colors duration-200">
      {/* Khối bên trái: Nút Toggle Sidebar & Breadcrumb */}
      <div className="flex items-center gap-3">
        {/* Nút Hamburger cho Mobile (< 1024px) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={openMobileSidebar}
          className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          aria-label="Mở menu điều hướng"
        >
          <Menu className="size-5" />
        </Button>

        {/* Nút Thu gọn/Mở rộng Sidebar cho Desktop (>= 1024px) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapse}
          className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-muted/80 cursor-pointer"
          aria-label={isSidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
          title={isSidebarCollapsed ? 'Mở rộng sidebar (Ctrl+B)' : 'Thu gọn sidebar (Ctrl+B)'}
        >
          {isSidebarCollapsed ? (
            <PanelLeft className="size-5 text-teal-600 dark:text-teal-400" />
          ) : (
            <PanelLeftClose className="size-5" />
          )}
        </Button>

        {/* Dynamic Breadcrumbs */}
        <div className="hidden sm:block pl-1 border-l border-border/60">
          <AdminBreadcrumb />
        </div>
      </div>

      {/* Khối bên phải: Role Badge, Quick Search, Theme toggle, Avatar Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Visual Role Badge trực quan */}
        {isAdmin && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20 shadow-2xs">
            <Shield className="size-3.5 text-purple-600 dark:text-purple-400" />
            <span>Quản trị viên</span>
          </span>
        )}

        {isDoctor && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 shadow-2xs">
            <Stethoscope className="size-3.5 text-teal-600 dark:text-teal-400" />
            <span>Bác sĩ chuyên khoa</span>
          </span>
        )}

        {/* Quick Search Bar */}
        <div className="relative hidden md:block w-48 lg:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={isDoctor ? "Tìm bệnh nhân, ca khám... (⌘K)" : "Tìm bệnh nhân, bác sĩ... (⌘K)"}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 dark:focus:border-teal-400 transition-all"
          />
        </div>

        {/* Nút chuyển đổi giao diện Sáng / Tối */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg relative cursor-pointer"
          aria-label={theme === 'dark' ? 'Chuyển sang nền sáng' : 'Chuyển sang nền tối'}
          title={theme === 'dark' ? 'Giao diện Sáng' : 'Giao diện Tối'}
        >
          {theme === 'dark' ? (
            <Sun className="size-4 text-amber-400 transition-transform duration-200 rotate-0 hover:rotate-45" />
          ) : (
            <Moon className="size-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
          )}
        </Button>

        <div className="h-6 w-px bg-border/60 mx-1 hidden sm:block" />

        {/* Avatar & Dropdown Quản lý Tài khoản */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer select-none">
              <Avatar size="sm" className={isDoctor ? "ring-2 ring-teal-500/30" : "ring-2 ring-purple-500/30"}>
                <AvatarImage src={user?.avatar || user?.avatarUrl} alt={user?.full_name || 'User'} />
                <AvatarFallback className={isDoctor ? "bg-teal-600 text-white font-medium text-xs" : "bg-purple-600 text-white font-medium text-xs"}>
                  {(user?.full_name || 'U').split(' ').slice(-1)[0]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[130px]">
                  {user?.full_name || 'Người dùng'}
                </span>
                <span className={`text-[10px] font-medium ${isDoctor ? 'text-teal-600 dark:text-teal-400' : 'text-purple-600 dark:text-purple-400'}`}>
                  {isDoctor ? 'Bác sĩ chuyên khoa' : role === 'ADMIN' ? 'Quản trị viên' : role}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 p-2 shadow-xl border-border">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-1">
                <p className="text-xs font-bold text-foreground">{user?.full_name || 'Người dùng'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user?.email || ''}</p>
                <div className="pt-1">
                  {isDoctor ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      <Stethoscope className="size-3" />
                      <span>Bác sĩ chuyên khoa</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                      <Shield className="size-3" />
                      <span>Quản trị viên (ADMIN)</span>
                    </span>
                  )}
                </div>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate(isAdmin ? '/admin/settings' : '/doctor/dashboard')}
                className="cursor-pointer gap-2 py-1.5 text-xs text-foreground"
              >
                <UserIcon className="size-3.5 text-muted-foreground" />
                <span>Hồ sơ cá nhân</span>
              </DropdownMenuItem>
              {isAdmin && (
                <DropdownMenuItem
                  onClick={() => navigate('/admin/settings')}
                  className="cursor-pointer gap-2 py-1.5 text-xs text-foreground"
                >
                  <ShieldCheck className="size-3.5 text-muted-foreground" />
                  <span>Bảo mật & Cài đặt hệ thống</span>
                </DropdownMenuItem>
              )}
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={handleLogout}
              className="cursor-pointer gap-2 py-1.5 text-xs text-destructive focus:bg-destructive/10"
            >
              <LogOut className="size-3.5" />
              <span>Đăng xuất hệ thống</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Nút Đăng xuất nhanh */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 rounded-lg shrink-0 cursor-pointer"
          title="Đăng xuất hệ thống"
          aria-label="Đăng xuất hệ thống"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}

export default AdminHeader
