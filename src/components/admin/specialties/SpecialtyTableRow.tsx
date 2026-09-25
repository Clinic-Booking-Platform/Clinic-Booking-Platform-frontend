import React from 'react'
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  Users,
  Stethoscope,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Specialty } from '@/types/specialty.types'

export interface SpecialtyTableRowProps {
  specialty: Specialty
  onViewDetail: (specialty: Specialty) => void
  onEdit: (specialty: Specialty) => void
  onDelete: (specialty: Specialty) => void
  onRestore: (specialty: Specialty) => void
}

export const SpecialtyTableRow: React.FC<SpecialtyTableRowProps> = ({
  specialty,
  onViewDetail,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(specialty.deleted_at)
  const doctorCount = specialty._count?.doctors ?? (specialty.doctors ? specialty.doctors.length : 0)

  return (
    <tr className="hover:bg-muted/20 transition-colors group">
      {/* Cột 1: Hình ảnh Thumbnail (48x48px) */}
      <td className="py-3.5 px-4 align-middle">
        <div className="relative size-12 overflow-hidden rounded-lg border border-border/60 bg-muted/40 flex items-center justify-center shrink-0">
          {specialty.image_url ? (
            <img
              src={specialty.image_url}
              alt={specialty.name}
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
              specialty.image_url ? 'hidden' : 'flex'
            }`}
          >
            <Stethoscope className="size-5" />
          </div>
        </div>
      </td>

      {/* Cột 2: Tên & Mô tả */}
      <td className="py-3.5 px-4 align-middle max-w-md">
        <div
          onClick={() => onViewDetail(specialty)}
          className="font-semibold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer"
        >
          {specialty.name}
        </div>
        {specialty.description ? (
          <p
            className="mt-0.5 text-xs text-muted-foreground line-clamp-2 leading-relaxed"
            title={specialty.description}
          >
            {specialty.description}
          </p>
        ) : (
          <span className="mt-0.5 text-xs text-muted-foreground/60 italic">
            Chưa có mô tả chi tiết
          </span>
        )}
      </td>

      {/* Cột 3: Số lượng Bác sĩ */}
      <td className="py-3.5 px-4 align-middle">
        <Badge
          variant="secondary"
          className="gap-1.5 font-medium text-xs py-1 px-2.5 bg-muted/80 text-foreground"
        >
          <Users className="size-3 text-teal-600 dark:text-teal-400" />
          <span>{doctorCount} Bác sĩ</span>
        </Badge>
      </td>

      {/* Cột 4: Trạng thái */}
      <td className="py-3.5 px-4 align-middle">
        {isDeleted ? (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <span className="size-1.5 rounded-full bg-rose-500" />
            Đã vô hiệu hóa
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="size-1.5 rounded-full bg-emerald-500" />
            Đang hoạt động
          </span>
        )}
      </td>

      {/* Cột 5: Thao tác (Actions) */}
      <td className="py-3.5 px-4 align-middle text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Xem chi tiết */}
          <button
            type="button"
            onClick={() => onViewDetail(specialty)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950/40 dark:hover:text-teal-400 transition-colors"
            title="Xem danh sách bác sĩ & chi tiết"
            aria-label="Xem chi tiết"
          >
            <Eye className="size-4" />
          </button>

          {/* Chỉnh sửa */}
          <button
            type="button"
            onClick={() => onEdit(specialty)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Chỉnh sửa thông tin chuyên khoa"
            aria-label="Chỉnh sửa"
          >
            <Pencil className="size-4" />
          </button>

          {/* Xóa mềm hoặc Khôi phục */}
          {isDeleted ? (
            <button
              type="button"
              onClick={() => onRestore(specialty)}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Khôi phục chuyên khoa"
              aria-label="Khôi phục"
            >
              <RotateCcw className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(specialty)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Xóa chuyên khoa (Vào thùng rác)"
              aria-label="Xóa"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </td>
    </tr>
  )
}
