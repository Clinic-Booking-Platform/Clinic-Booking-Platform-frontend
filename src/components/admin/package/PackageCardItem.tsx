import React from 'react'
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  Package as PackageIcon,
  Tag,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatCurrency, calculateDiscountPercent } from './package.utils'
import type { MedicalPackage } from '@/types/package.types'

export interface PackageCardItemProps {
  pkg: MedicalPackage
  onViewDetail: (pkg: MedicalPackage) => void
  onEdit: (pkg: MedicalPackage) => void
  onDelete: (pkg: MedicalPackage) => void
  onRestore: (pkg: MedicalPackage) => void
}

export const PackageCardItem: React.FC<PackageCardItemProps> = ({
  pkg,
  onViewDetail,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(pkg.deleted_at)
  const discountPercent = calculateDiscountPercent(pkg.price, pkg.discount_price)
  const hasDiscount = Boolean(pkg.discount_price && pkg.discount_price < pkg.price)

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs hover:border-teal-500/40 hover:shadow-xs transition-all group">
      {/* Top Section */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Thumbnail (60x60px bo góc) */}
          <div className="relative size-15 shrink-0 overflow-hidden rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center">
            {pkg.thumbnail_url ? (
              <img
                src={pkg.thumbnail_url}
                alt={pkg.name}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                  const sibling = e.currentTarget.nextElementSibling
                  if (sibling) {
                    ;(sibling as HTMLElement).style.display = 'flex'
                  }
                }}
              />
            ) : null}
            <div
              className={`size-full items-center justify-center text-teal-600 dark:text-teal-400 ${
                pkg.thumbnail_url ? 'hidden' : 'flex'
              }`}
            >
              <PackageIcon className="size-6" />
            </div>
          </div>

          {/* Status Badge */}
          {isDeleted ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
              <span className="size-1.5 rounded-full bg-rose-500" />
              Ngừng cung cấp
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Đang mở
            </span>
          )}
        </div>

        {/* Tên & Mô tả */}
        <div>
          <h4
            onClick={() => onViewDetail(pkg)}
            className="text-sm font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer"
          >
            {pkg.name}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {pkg.description || 'Chưa có mô tả tóm tắt cho gói khám này.'}
          </p>
        </div>
      </div>

      {/* Bottom Section: Bảng giá & Nút thao tác */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
        {/* Bảng giá */}
        <div>
          {hasDiscount ? (
            <div className="space-y-0.5">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                  {formatCurrency(pkg.discount_price)}
                </span>
                <Badge
                  variant="destructive"
                  className="gap-0.5 text-[10px] py-0 px-1.5 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-semibold"
                >
                  <Tag className="size-2.5" />
                  <span>-{discountPercent}%</span>
                </Badge>
              </div>
              <div className="text-[11px] text-muted-foreground line-through">
                {formatCurrency(pkg.price)}
              </div>
            </div>
          ) : (
            <div className="font-bold text-foreground text-sm">
              {formatCurrency(pkg.price)}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onViewDetail(pkg)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950/40 dark:hover:text-teal-400 transition-colors"
            title="Xem chi tiết"
            aria-label="Xem chi tiết"
          >
            <Eye className="size-4" />
          </button>

          <button
            type="button"
            onClick={() => onEdit(pkg)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa"
          >
            <Pencil className="size-4" />
          </button>

          {isDeleted ? (
            <button
              type="button"
              onClick={() => onRestore(pkg)}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Khôi phục"
              aria-label="Khôi phục"
            >
              <RotateCcw className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(pkg)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Ngừng cung cấp"
              aria-label="Ngừng cung cấp"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
