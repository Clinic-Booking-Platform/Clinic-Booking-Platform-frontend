import React from 'react'
import {
  Eye,
  Pencil,
  Lock,
  RotateCcw,
  Stethoscope,
  Phone,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatCurrency,
  getDoctorInitials,
  formatPhoneNumber,
} from './doctor.utils'
import type { Doctor } from '@/types/doctor.types'

interface DoctorTableRowProps {
  doctor: Doctor
  onViewDetail: (doctor: Doctor) => void
  onEdit: (doctor: Doctor) => void
  onDelete: (doctor: Doctor) => void
  onRestore: (doctor: Doctor) => void
}

export const DoctorTableRow: React.FC<DoctorTableRowProps> = ({
  doctor,
  onViewDetail,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(doctor.deleted_at)
  const user = doctor.user
  const specialty = doctor.specialty
  const doctorName = user?.full_name || 'Bác sĩ'
  const doctorEmail = user?.email || 'N/A'
  const doctorPhone = user?.phone_number
  const doctorAvatar = user?.avatar

  return (
    <tr
      className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${
        isDeleted ? 'bg-muted/15 opacity-75' : ''
      }`}
    >
      {/* 1. Bác sĩ (Avatar tròn 40x40 + Tên + Email) */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted/60 flex items-center justify-center shadow-2xs">
            {doctorAvatar ? (
              <img
                src={doctorAvatar}
                alt={doctorName}
                className="size-full object-cover"
                onError={(e) => {
                  // Fallback khi ảnh lỗi
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xs">
                {getDoctorInitials(doctorName)}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5 truncate">
              <span>{doctorName}</span>
              {user?.gender && (
                <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                  {user.gender}
                </span>
              )}
            </div>
            <div className="text-xs text-muted-foreground truncate">{doctorEmail}</div>
          </div>
        </div>
      </td>

      {/* 2. Chuyên khoa */}
      <td className="px-4 py-3.5">
        {specialty?.name ? (
          <Badge
            variant="outline"
            className="gap-1 font-medium text-xs py-1 px-2.5 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25"
          >
            <Stethoscope className="size-3 text-teal-600 dark:text-teal-400" />
            <span>{specialty.name}</span>
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">Chưa phân khoa</span>
        )}
      </td>

      {/* 3. Số điện thoại */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-1.5 text-xs text-foreground font-mono">
          <Phone className="size-3 text-muted-foreground shrink-0" />
          <span>{formatPhoneNumber(doctorPhone)}</span>
        </div>
      </td>

      {/* 4. Giá khám niêm yết */}
      <td className="px-4 py-3.5">
        <div className="text-sm font-semibold text-foreground">
          {formatCurrency(doctor.price)}
        </div>
      </td>

      {/* 5. Trạng thái */}
      <td className="px-4 py-3.5">
        {isDeleted ? (
          <Badge
            variant="destructive"
            className="gap-1 text-[11px] py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 font-medium"
          >
            <Lock className="size-3" />
            <span>Đã khóa</span>
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="gap-1 text-[11px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Hoạt động</span>
          </Badge>
        )}
      </td>

      {/* 6. Thao tác */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Xem chi tiết */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onViewDetail(doctor)}
            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Xem hồ sơ chi tiết bác sĩ"
          >
            <Eye className="size-4" />
          </Button>

          {/* Chỉnh sửa */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(doctor)}
            className="size-8 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
            title="Chỉnh sửa thông tin bác sĩ"
          >
            <Pencil className="size-4" />
          </Button>

          {/* Khóa / Mở khóa */}
          {isDeleted ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRestore(doctor)}
              className="size-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              title="Khôi phục / Mở khóa tài khoản"
            >
              <RotateCcw className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(doctor)}
              className="size-8 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Khóa / Vô hiệu hóa tài khoản"
            >
              <Lock className="size-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
