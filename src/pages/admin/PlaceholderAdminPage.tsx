import React from 'react'
import { useLocation } from 'react-router-dom'
import {
  Plus,
  Filter,
  Download,
  Search,
  RefreshCw,
  FolderOpen,
} from 'lucide-react'
import { getBreadcrumbFromPath, ADMIN_NAV_GROUPS } from '@/config/admin-nav.config'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const PlaceholderAdminPage: React.FC = () => {
  const location = useLocation()
  const breadcrumb = getBreadcrumbFromPath(location.pathname)

  // Tìm icon tương ứng
  let CurrentIcon = FolderOpen
  let currentItem = null
  for (const g of ADMIN_NAV_GROUPS) {
    for (const item of g.items) {
      if (item.path === location.pathname) {
        CurrentIcon = item.icon
        currentItem = item
        break
      }
    }
  }

  const title = breadcrumb?.itemTitle || 'Trang Quản Trị'
  const description =
    currentItem?.description ||
    'Quản lý dữ liệu và cấu hình chi tiết cho chức năng này trong hệ thống phòng khám.'

  return (
    <div className="space-y-6">
      {/* 1. Header Trang & Thao tác chính */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mt-0.5">
            <CurrentIcon className="size-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                {title}
              </h1>
              {currentItem?.badge && (
                <Badge variant={currentItem.badge.variant as 'default' | 'secondary' | 'outline'}>
                  {currentItem.badge.text}
                </Badge>
              )}
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              {description}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <Download className="size-3.5" />
            <span className="hidden sm:inline">Xuất dữ liệu</span>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="size-3.5" />
            <span>Thêm mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Thanh lọc và tìm kiếm */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-card rounded-xl border border-border/70">
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
          <input
            type="text"
            placeholder={`Tìm kiếm trong ${title}...`}
            className="w-full h-8 pl-8 pr-3 rounded-lg bg-muted/40 border border-input text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" className="h-8 gap-1 text-xs">
            <Filter className="size-3 text-muted-foreground" />
            <span>Bộ lọc</span>
          </Button>
          <Button variant="ghost" size="sm" className="h-8 size-8 p-0" title="Tải lại">
            <RefreshCw className="size-3.5 text-muted-foreground" />
          </Button>
        </div>
      </div>

      {/* 3. Bảng nội dung dữ liệu mẫu (Sẵn sàng kết nối API) */}
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="p-8 text-center space-y-3">
          <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <CurrentIcon className="size-6" />
          </div>
          <div className="max-w-md mx-auto space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Mô-đun {title} đã sẵn sàng
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Khung giao diện, thanh điều hướng và quyền truy cập cho đường dẫn{' '}
              <code className="px-1.5 py-0.5 rounded bg-muted font-mono text-teal-600 dark:text-teal-400">
                {location.pathname}
              </code>{' '}
              đã được thiết lập thành công.
            </p>
          </div>

          <div className="pt-2 flex justify-center gap-2">
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-white text-xs">
              <Plus className="size-3.5 mr-1" /> Tạo bản ghi đầu tiên
            </Button>
            <Button variant="outline" size="sm" className="text-xs">
              Xem tài liệu API
            </Button>
          </div>
        </div>

        {/* Footer ghi chú mô-đun */}
        <div className="bg-muted/30 border-t border-border/60 px-4 py-2.5 text-xs text-muted-foreground flex justify-between items-center">
          <span>Trạng thái kết nối API: <strong className="text-emerald-600 font-medium">Ready</strong></span>
          <span className="font-mono text-[11px]">Endpoint: /api/v1{location.pathname.replace('/admin', '')}</span>
        </div>
      </div>
    </div>
  )
}
