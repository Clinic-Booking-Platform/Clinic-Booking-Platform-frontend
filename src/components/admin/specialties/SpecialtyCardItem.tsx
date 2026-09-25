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

export interface SpecialtyCardItemProps {
  specialty: Specialty
  onViewDetail: (specialty: Specialty) => void
  onEdit: (specialty: Specialty) => void
  onDelete: (specialty: Specialty) => void
  onRestore: (specialty: Specialty) => void
}

export const SpecialtyCardItem: React.FC<SpecialtyCardItemProps> = ({
  specialty,
  onViewDetail,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(specialty.deleted_at)
  const doctorCount = specialty._count?.doctors ?? (specialty.doctors ? specialty.doctors.length : 0)

  return (
    <div className="flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-2xs hover:border-teal-500/40 hover:shadow-xs transition-all group">
      {/* Top Section: Thumbnail, Title, Description, and Status */}
      <div className="space-y-3">
        <div className="flex items-start justify-between gap-3">
          {/* Thumbnail */}
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border/60 bg-muted/40 flex items-center justify-center">
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

          {/* Status Badge */}
          {isDeleted ? (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
              <span className="size-1.5 rounded-full bg-rose-500" />
              Đã vô hiệu hóa
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0">
              <span className="size-1.5 rounded-full bg-emerald-500" />
              Hoạt động
            </span>
          )}
        </div>

        {/* Name & Description */}
        <div>
          <h4
            onClick={() => onViewDetail(specialty)}
            className="text-sm font-bold text-foreground group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors cursor-pointer"
          >
            {specialty.name}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {specialty.description || 'Chưa có mô tả chi tiết cho chuyên khoa này.'}
          </p>
        </div>
      </div>

      {/* Bottom Section: Doctor Count & Action Buttons */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3">
        {/* Doctor Count Badge */}
        <Badge
          variant="secondary"
          className="gap-1 font-medium text-[11px] py-0.5 px-2 bg-muted/80 text-foreground"
        >
          <Users className="size-3 text-teal-600 dark:text-teal-400" />
          <span>{doctorCount} Bác sĩ</span>
        </Badge>

        {/* Actions */}
        <div className="flex items-center gap-1">
          {/* Xem chi tiết */}
          <button
            type="button"
            onClick={() => onViewDetail(specialty)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-teal-50 hover:text-teal-600 dark:hover:bg-teal-950/40 dark:hover:text-teal-400 transition-colors"
            title="Xem chi tiết"
            aria-label="Xem chi tiết"
          >
            <Eye className="size-4" />
          </button>

          {/* Sửa */}
          <button
            type="button"
            onClick={() => onEdit(specialty)}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            title="Chỉnh sửa"
            aria-label="Chỉnh sửa"
          >
            <Pencil className="size-4" />
          </button>

          {/* Xóa / Khôi phục */}
          {isDeleted ? (
            <button
              type="button"
              onClick={() => onRestore(specialty)}
              className="rounded-lg p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Khôi phục"
              aria-label="Khôi phục"
            >
              <RotateCcw className="size-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(specialty)}
              className="rounded-lg p-1.5 text-muted-foreground hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/40 dark:hover:text-rose-400 transition-colors"
              title="Xóa"
              aria-label="Xóa"
            >
              <Trash2 className="size-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
