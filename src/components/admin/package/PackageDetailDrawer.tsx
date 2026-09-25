import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Package as PackageIcon,
  Tag,
  Loader2,
  AlertTriangle,
  FileText,
  BadgeDollarSign,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { packageApi } from '@/services/package.api'
import { formatCurrency, calculateDiscountPercent } from './package.utils'
import type { MedicalPackage } from '@/types/package.types'

interface PackageDetailDrawerProps {
  isOpen: boolean
  onClose: () => void
  packageId: number | null
}

export const PackageDetailDrawer: React.FC<PackageDetailDrawerProps> = ({
  isOpen,
  onClose,
  packageId,
}) => {
  const [data, setData] = useState<MedicalPackage | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(packageId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    if (isOpen && packageId) {
      packageApi
        .getPackageById(packageId)
        .then((res) => {
          if (!ignore) {
            setData(res)
            setError(null)
            setIsLoading(false)
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err?.response?.data?.message || 'Không thể tải chi tiết gói khám!')
            setIsLoading(false)
          }
        })
    }

    return () => {
      ignore = true
    }
  }, [isOpen, packageId])

  // ESC key listener
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

  if (!isOpen) return null

  const isDeleted = Boolean(data?.deleted_at)
  const discountPercent = data ? calculateDiscountPercent(data.price, data.discount_price) : 0
  const hasDiscount = Boolean(data?.discount_price && data.discount_price < data.price)
  const htmlContent = data?.package_detail?.html_content || ''

  // Format date helper
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    } catch {
      return dateStr
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Side panel trượt từ phải sang) */}
      <div className="relative z-10 flex h-full w-full max-w-2xl flex-col border-l border-border/80 bg-card shadow-2xl animate-in slide-in-from-right duration-300">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <PackageIcon className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">
                Hồ Sơ Chi Tiết Gói Khám
              </h2>
              <p className="text-xs text-muted-foreground">
                Thông tin bảng giá và toàn bộ danh mục dịch vụ y tế
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-xs text-muted-foreground">
                Đang tải dữ liệu và danh mục gói khám...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/30 bg-rose-50/50 dark:bg-rose-950/20 p-6 text-center">
              <AlertTriangle className="size-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
                {error}
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (packageId) {
                    setIsLoading(true)
                    packageApi
                      .getPackageById(packageId)
                      .then(setData)
                      .catch((e) => setError(e?.message))
                      .finally(() => setIsLoading(false))
                  }
                }}
                className="mt-4 text-xs"
              >
                Thử tải lại
              </Button>
            </div>
          ) : data ? (
            <>
              {/* 1. Tổng quan & Ảnh đại diện */}
              <div className="flex flex-col sm:flex-row items-start gap-4 rounded-xl border border-border/70 bg-muted/20 p-4">
                <div className="relative size-24 sm:size-28 shrink-0 overflow-hidden rounded-xl border border-border/80 bg-muted flex items-center justify-center">
                  {data.thumbnail_url ? (
                    <img
                      src={data.thumbnail_url}
                      alt={data.name}
                      className="size-full object-cover"
                    />
                  ) : (
                    <PackageIcon className="size-10 text-teal-600 dark:text-teal-400" />
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-bold text-foreground">
                      {data.name}
                    </h3>
                    {isDeleted ? (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-600 border border-rose-500/20">
                        Ngừng cung cấp
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 border border-emerald-500/20">
                        Đang mở bán
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {data.description || 'Chưa có mô tả tóm tắt cho gói khám này.'}
                  </p>

                  <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                    <div className="flex items-center gap-1">
                      <Calendar className="size-3.5" />
                      <span>Ngày tạo: {formatDate(data.created_at)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 2. Thẻ Bảng Giá */}
              <div className="rounded-xl border border-border/80 bg-card p-4 shadow-2xs space-y-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <BadgeDollarSign className="size-4 text-teal-600 dark:text-teal-400" />
                  <span>Chi phí gói khám y tế</span>
                </div>

                <div className="flex items-baseline gap-3 pt-1">
                  {hasDiscount ? (
                    <>
                      <div className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                        {formatCurrency(data.discount_price)}
                      </div>
                      <div className="text-sm text-muted-foreground line-through">
                        {formatCurrency(data.price)}
                      </div>
                      <Badge
                        variant="destructive"
                        className="gap-1 text-xs py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-bold"
                      >
                        <Tag className="size-3" />
                        <span>Tiết kiệm {discountPercent}%</span>
                      </Badge>
                    </>
                  ) : (
                    <div className="text-2xl font-extrabold text-foreground">
                      {formatCurrency(data.price)}
                    </div>
                  )}
                </div>
              </div>

              {/* 3. Nội Dung Chi Tiết Danh Mục Khám (HTML Content) */}
              <div className="space-y-2.5">
                <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                  <FileText className="size-4 text-teal-600" />
                  <span>Danh mục dịch vụ & Hạng mục xét nghiệm</span>
                </div>

                {htmlContent ? (
                  <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 text-sm text-foreground leading-relaxed shadow-2xs prose prose-sm dark:prose-invert max-w-none">
                    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-8 text-center text-xs text-muted-foreground">
                    Chưa có nội dung chi tiết danh mục dịch vụ cho gói khám này.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border/60 bg-muted/20 px-6 py-4">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs px-4"
          >
            Đóng lại
          </Button>
        </div>
      </div>
    </div>
  )
}
