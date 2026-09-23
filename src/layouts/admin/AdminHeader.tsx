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
  User,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react'
import { useAuthStore, useThemeStore, useUIStore } from '@/stores'
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

  // 3. Quản lý Auth & Thông tin Admin
  const { user: adminUser, setLogout } = useAuthStore()

  const [searchQuery, setSearchQuery] = useState('')

  // Xử lý đăng xuất: Gọi setLogout từ Store, xóa Cookie và chuyển hướng về /login
  const handleLogout = () => {
    setLogout()
    localStorage.removeItem('auth_user')
    sessionStorage.clear()

    // Xóa Cookie chứa token (nếu có)
    const cookiesToClear = ['token', 'accessToken', 'refreshToken', 'jwt']
    cookiesToClear.forEach((name) => {
      document.cookie = `${name}=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax`
    })

    toast.info('Đã đăng xuất thành công')

    // Điều hướng về trang đăng nhập
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
          className="lg:hidden text-muted-foreground hover:text-foreground hover:bg-muted/80"
          aria-label="Mở menu quản trị"
        >
          <Menu className="size-5" />
        </Button>

        {/* Nút Thu gọn/Mở rộng Sidebar cho Desktop (>= 1024px) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebarCollapse}
          className="hidden lg:flex text-muted-foreground hover:text-foreground hover:bg-muted/80"
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

      {/* Khối bên phải: Tìm kiếm nhanh, Theme toggle, Thông báo, Avatar Dropdown */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Quick Search Bar */}
        <div className="relative hidden md:block w-56 lg:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bệnh nhân, bác sĩ... (⌘K)"
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-muted/50 border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-600 dark:focus:border-teal-400 transition-all"
          />
        </div>

        {/* Nút chuyển đổi giao diện Sáng / Tối (Light/Dark Mode) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="text-muted-foreground hover:text-foreground hover:bg-muted/80 rounded-lg relative"
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

        {/* Avatar Admin & Dropdown Quản lý Tài khoản */}
        <DropdownMenu>
          <DropdownMenuTrigger className="outline-none">
            <div className="flex items-center gap-2 p-1 pl-1.5 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer select-none">
              <Avatar size="sm" className="ring-2 ring-teal-500/20">
                <AvatarImage src={adminUser?.avatar || adminUser?.avatarUrl} alt={adminUser?.full_name || adminUser?.name || 'Admin'} />
                <AvatarFallback className="bg-teal-600 text-white font-medium text-xs">
                  {(adminUser?.full_name || adminUser?.name || 'A').split(' ').slice(-1)[0]?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="hidden lg:flex flex-col text-left">
                <span className="text-xs font-semibold text-foreground leading-tight truncate max-w-[120px]">
                  {adminUser?.full_name || adminUser?.name || 'Quản trị viên'}
                </span>
                <span className="text-[10px] text-teal-600 dark:text-teal-400 font-medium">
                  {adminUser?.role === 'ADMIN' ? 'Quản trị viên Hệ thống' : adminUser?.role || 'Quản trị viên'}
                </span>
              </div>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 p-1.5 shadow-xl border-border">
            <DropdownMenuLabel className="p-2">
              <div className="flex flex-col space-y-0.5">
                <p className="text-xs font-bold text-foreground">{adminUser?.full_name || adminUser?.name || 'Quản trị viên'}</p>
                <p className="text-[11px] text-muted-foreground truncate">{adminUser?.email || ''}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem
                onClick={() => navigate('/admin/settings')}
                className="cursor-pointer gap-2 py-1.5 text-xs text-foreground"
              >
                <User className="size-3.5 text-muted-foreground" />
                <span>Hồ sơ quản trị viên</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => navigate('/admin/settings')}
                className="cursor-pointer gap-2 py-1.5 text-xs text-foreground"
              >
                <ShieldCheck className="size-3.5 text-muted-foreground" />
                <span>Bảo mật & Phân quyền</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="cursor-pointer gap-2 py-1.5 text-xs text-foreground"
              >
                <HelpCircle className="size-3.5 text-muted-foreground" />
                <span>Trợ giúp & Tài liệu API</span>
              </DropdownMenuItem>
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

        {/* Nút Đăng xuất nhanh trên Header */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleLogout}
          className="text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 dark:hover:text-rose-400 dark:hover:bg-rose-500/15 rounded-lg shrink-0"
          title="Đăng xuất hệ thống"
          aria-label="Đăng xuất hệ thống"
        >
          <LogOut className="size-4" />
        </Button>
      </div>
    </header>
  )
}
