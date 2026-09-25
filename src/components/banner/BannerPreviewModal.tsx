import React, { useEffect } from 'react'
import {
  X,
  ExternalLink,
  Pencil,
  CheckCircle2,
  EyeOff,
  Calendar,
  Layers,
  Image as ImageIcon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatDate } from './banner.utils'
import type { Banner } from '@/types/banner.types'

interface BannerPreviewModalProps {
  isOpen: boolean
  banner: Banner | null
  onClose: () => void
  onEdit?: (banner: Banner) => void
}

export const BannerPreviewModal: React.FC<BannerPreviewModalProps> = ({
  isOpen,
  banner,
  onClose,
  onEdit,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !banner) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
              <ImageIcon className="size-5" />
            </div>
            <div>
              <h3 className="font-semibold text-base sm:text-lg text-foreground line-clamp-1">
                Xem chi tiết banner quảng cáo
              </h3>
              <p className="text-xs text-muted-foreground">
                Mã định danh #{banner.id} • Thứ tự hiển thị: #{banner.sort_order}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onEdit(banner)
                }}
                className="gap-1.5 text-xs cursor-pointer"
              >
                <Pencil className="size-3.5" />
                <span>Chỉnh sửa</span>
              </Button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Content Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* 1. Large Image Display */}
          <div className="relative overflow-hidden rounded-xl border border-border/80 bg-black/5 dark:bg-black/20 flex items-center justify-center shadow-inner group">
            {banner.image_url ? (
              <img
                src={banner.image_url}
                alt={banner.title}
                className="w-full max-h-[460px] object-contain rounded-lg transition-transform duration-300"
              />
            ) : (
              <div className="py-24 text-center text-muted-foreground">
                <ImageIcon className="size-12 mx-auto text-muted-foreground/40 mb-2" />
                <p className="text-sm">Không có ảnh banner</p>
              </div>
            )}

            {/* Badges overlay on image */}
            <div className="absolute top-3 left-3 flex flex-wrap gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold shadow-md ${
                  banner.is_active
                    ? 'bg-emerald-500/90 text-white backdrop-blur-xs'
                    : 'bg-zinc-700/90 text-zinc-100 backdrop-blur-xs'
                }`}
              >
                {banner.is_active ? (
                  <>
                    <CheckCircle2 className="size-3.5" />
                    <span>Đang hiển thị</span>
                  </>
                ) : (
                  <>
                    <EyeOff className="size-3.5" />
                    <span>Tạm ẩn</span>
                  </>
                )}
              </span>

              <span className="inline-flex items-center gap-1 rounded-full bg-black/60 backdrop-blur-xs text-white px-3 py-1 text-xs font-semibold shadow-md">
                <Layers className="size-3.5 text-teal-400" />
                <span>Thứ tự: #{banner.sort_order}</span>
              </span>
            </div>
          </div>

          {/* 2. Banner Metadata Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 rounded-xl border border-border/60 bg-muted/20 p-4">
            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Tiêu đề chiến dịch:</span>
                <p className="text-sm sm:text-base font-semibold text-foreground mt-0.5">
                  {banner.title}
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-medium">Liên kết đích:</span>
                {banner.link_url ? (
                  <div className="mt-1">
                    <a
                      href={banner.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:underline font-mono bg-teal-500/10 px-2.5 py-1 rounded-md max-w-full break-all"
                    >
                      <span className="truncate">{banner.link_url}</span>
                      <ExternalLink className="size-3 shrink-0" />
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground mt-0.5 italic">
                    Không thiết lập liên kết
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <span className="text-xs text-muted-foreground font-medium">Thời gian khởi tạo:</span>
                <p className="text-xs text-foreground flex items-center gap-1.5 mt-1 font-medium">
                  <Calendar className="size-3.5 text-muted-foreground" />
                  <span>{formatDate(banner.created_at)}</span>
                </p>
              </div>

              <div>
                <span className="text-xs text-muted-foreground font-medium">Trực tiếp xem ảnh gốc:</span>
                <div className="mt-1">
                  <a
                    href={banner.image_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground hover:underline"
                  >
                    <span>Mở ảnh kích thước đầy đủ</span>
                    <ExternalLink className="size-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border/60 px-5 py-3 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
