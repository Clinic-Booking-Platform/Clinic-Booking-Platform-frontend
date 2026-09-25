import React, { useState } from 'react'
import {
  Pencil,
  Trash2,
  ExternalLink,
  Eye,
  Image as ImageIcon,
  Layers,
  Inbox,
  Loader2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Pagination } from '@/components/ui/pagination'
import { formatDate } from './banner.utils'
import type { Banner, PaginationMeta } from '@/types/banner.types'

interface BannerTableProps {
  banners: Banner[]
  pagination: PaginationMeta | null
  isLoading?: boolean
  onPageChange: (page: number) => void
  onPreview: (banner: Banner) => void
  onEdit: (banner: Banner) => void
  onDelete: (banner: Banner) => void
  onToggleStatus: (banner: Banner, newStatus: boolean) => Promise<void>
  onResetFilter?: () => void
}

export const BannerTable: React.FC<BannerTableProps> = ({
  banners,
  pagination,
  isLoading = false,
  onPageChange,
  onPreview,
  onEdit,
  onDelete,
  onToggleStatus,
  onResetFilter,
}) => {
  const [togglingIds, setTogglingIds] = useState<Set<number>>(new Set())

  const handleToggle = async (banner: Banner, newStatus: boolean) => {
    setTogglingIds((prev) => new Set(prev).add(banner.id))
    try {
      await onToggleStatus(banner, newStatus)
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev)
        next.delete(banner.id)
        return next
      })
    }
  }

  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 pl-4 pr-3">Ảnh banner</th>
                <th className="px-3 py-3.5">Tiêu đề chiến dịch</th>
                <th className="px-3 py-3.5">Liên kết đích</th>
                <th className="px-3 py-3.5 text-center">Thứ tự</th>
                <th className="px-3 py-3.5 text-center">Hiển thị</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 pl-4 pr-3">
                    <div className="h-12 w-24 rounded-lg bg-muted" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-48 rounded bg-muted mb-2" />
                    <div className="h-3 w-28 rounded bg-muted/60" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-3.5 w-32 rounded bg-muted" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="h-5 w-10 rounded-full bg-muted mx-auto" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="h-5 w-9 rounded-full bg-muted mx-auto" />
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right">
                    <div className="h-8 w-16 rounded bg-muted ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // 2. Empty State
  if (!banners || banners.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card p-12 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-3">
          <Inbox className="size-7" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Không tìm thấy banner nào</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
          Chưa có banner nào phù hợp với điều kiện tìm kiếm hoặc hệ thống chưa có dữ liệu.
        </p>
        {onResetFilter && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilter}
            className="mt-4 gap-1.5 text-xs cursor-pointer"
          >
            <span>Đặt lại bộ lọc</span>
          </Button>
        )}
      </div>
    )
  }

  // 3. Render Table
  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
            <tr>
              <th className="py-3.5 pl-4 pr-3 w-[120px]">Ảnh Banner</th>
              <th className="px-3 py-3.5 min-w-[200px]">Tiêu đề chiến dịch</th>
              <th className="px-3 py-3.5 min-w-[160px]">Liên kết đích</th>
              <th className="px-3 py-3.5 text-center w-[90px]">Thứ tự</th>
              <th className="px-3 py-3.5 text-center w-[120px]">Hiển thị</th>
              <th className="py-3.5 pl-3 pr-4 text-right w-[110px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {banners.map((banner) => {
              const isToggling = togglingIds.has(banner.id)

              return (
                <tr
                  key={banner.id}
                  className="group hover:bg-muted/30 transition-colors"
                >
                  {/* Cột 1: Ảnh Banner (Thumbnail chữ nhật bo góc kèm hover zoom) */}
                  <td className="py-3 pl-4 pr-3 align-middle">
                    <div
                      onClick={() => onPreview(banner)}
                      className="relative h-12 w-24 rounded-lg overflow-hidden border border-border/60 bg-muted cursor-pointer group/img shrink-0 shadow-2xs"
                      title="Bấm để phóng to xem ảnh"
                    >
                      {banner.image_url ? (
                        <img
                          src={banner.image_url}
                          alt={banner.title}
                          className="size-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center text-muted-foreground/60">
                          <ImageIcon className="size-5" />
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center text-white">
                        <Eye className="size-4" />
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Tiêu đề banner & Ngày tạo */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col gap-0.5 max-w-md">
                      <button
                        type="button"
                        onClick={() => onPreview(banner)}
                        className="text-left font-semibold text-foreground hover:text-teal-600 dark:hover:text-teal-400 transition-colors line-clamp-2 cursor-pointer"
                      >
                        {banner.title}
                      </button>
                      <span className="text-[11px] text-muted-foreground">
                        Ngày tạo: {formatDate(banner.created_at)}
                      </span>
                    </div>
                  </td>

                  {/* Cột 3: Đường dẫn liên kết (link_url) */}
                  <td className="px-3 py-3 align-middle">
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline max-w-[200px] truncate font-mono bg-teal-500/10 px-2 py-0.5 rounded-md"
                        title={banner.link_url}
                      >
                        <span className="truncate">{banner.link_url}</span>
                        <ExternalLink className="size-3 shrink-0" />
                      </a>
                    ) : (
                      <span className="text-muted-foreground/60 text-xs italic">-</span>
                    )}
                  </td>

                  {/* Cột 4: Thứ tự hiển thị (sort_order) */}
                  <td className="px-3 py-3 text-center align-middle">
                    <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-semibold text-foreground border border-border/60">
                      <Layers className="size-3 text-muted-foreground" />
                      <span>#{banner.sort_order}</span>
                    </span>
                  </td>

                  {/* Cột 5: Bật / Tắt trạng thái hiển thị (Switch Toggle) */}
                  <td className="px-3 py-3 text-center align-middle">
                    <div className="flex items-center justify-center gap-2">
                      {isToggling ? (
                        <Loader2 className="size-4 animate-spin text-teal-600" />
                      ) : (
                        <Switch
                          checked={banner.is_active}
                          disabled={isToggling}
                          onCheckedChange={(checked) => handleToggle(banner, checked)}
                          title={banner.is_active ? 'Bấm để ẩn banner' : 'Bấm để hiển thị banner'}
                        />
                      )}
                      <span
                        className={`text-[11px] font-medium hidden sm:inline ${
                          banner.is_active
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : 'text-muted-foreground'
                        }`}
                      >
                        {banner.is_active ? 'Bật' : 'Tắt'}
                      </span>
                    </div>
                  </td>

                  {/* Cột 6: Thao tác (Edit / Delete) */}
                  <td className="py-3 pl-3 pr-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(banner)}
                        className="size-8 p-0 text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 cursor-pointer"
                        title="Chỉnh sửa banner"
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(banner)}
                        className="size-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                        title="Xóa vĩnh viễn banner"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang (Pagination) */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          itemLabel="banner"
        />
      )}
    </div>
  )
}
