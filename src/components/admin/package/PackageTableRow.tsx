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

export interface PackageTableRowProps {
  pkg: MedicalPackage
  onViewDetail: (pkg: MedicalPackage) => void
  onEdit: (pkg: MedicalPackage) => void
  onDelete: (pkg: MedicalPackage) => void
  onRestore: (pkg: MedicalPackage) => void
}

export const PackageTableRow: React.FC<PackageTableRowProps> = ({
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
    <tr className="hover:bg-muted/20 transition-colors group">
      {/* Cột 1: Hình ảnh Thumbnail (60x60px bo góc) */}
      <td className="py-3.5 px-4 align-middle">
        <div className="relative size-15 overflow-hidden rounded-xl border border-border/60 bg-muted/40 flex items-center justify-center shrink-0">
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
      </td>

      {/* Cột 2: Tên gói & Mô tả tóm tắt */}
      <td className="py-3.5 px-4 align-middle max-w-sm lg:max-w-md">
        <div
          onClick={() => onViewDetail(pkg)}
          className="font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer text-sm"
        >
          {pkg.name}
        </div>
        {pkg.description ? (
          <p
            className="mt-0.5 text-xs text-muted-foreground line-clamp-1 leading-relaxed"
            title={pkg.description}
          >
            {pkg.description}
          </p>
        ) : (
          <span className="mt-0.5 text-xs text-muted-foreground/60 italic">
            Chưa có mô tả tóm tắt
          </span>
        )}
      </td>

      {/* Cột 3: Bảng giá & Giá khuyến mãi */}
      <td className="py-3.5 px-4 align-middle min-w-[160px]">
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
            <div className="text-xs text-muted-foreground line-through">
              {formatCurrency(pkg.price)}
            </div>
          </div>
        ) : (
          <div className="font-bold text-foreground text-sm">
            {formatCurrency(pkg.price)}
          </div>
        )}
      </td>

      {/* Cột 4: Trạng thái */}
      <td className="py-3.5 px-4 align-middle">
        {isDeleted ? (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Ngừng cung cấp
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Đang mở
          </span>
        )}
      </td>

      {/* Cột 5: Thao tác (Actions) */}
      <td className="py-3.5 px-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Xem chi tiết */}
          <button
            type="button"
            onClick={() => onViewDetail(pkg)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950/40 dark:hover:text-teal-400 transition-colors"
            title="Xem chi tiết & danh mục khám"
            aria-label="Xem chi tiết"
          >
            <Eye className="size-4" />
          </button>

          {/* Chỉnh sửa */}
          <button
            type="button"
            onClick={() => onEdit(pkg)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Chỉnh sửa thông tin gói khám"
            aria-label="Chỉnh sửa"
          >
            <Pencil className="size-4" />
          </button>

          {/* Ngừng cung cấp hoặc Khôi phục */}
          {isDeleted ? (
            <button
              type="button"
              onClick={() => onRestore(pkg)}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Khôi phục gói khám"
              aria-label="Khôi phục"
            >
              <RotateCcw className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(pkg)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Ngừng cung cấp gói khám"
              aria-label="Ngừng cung cấp"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
