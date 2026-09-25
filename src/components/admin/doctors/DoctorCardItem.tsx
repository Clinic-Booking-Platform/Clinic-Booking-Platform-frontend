import React from 'react'
import {
  Eye,
  Pencil,
  Lock,
  RotateCcw,
  Stethoscope,
  Phone,
  Mail,
  DollarSign,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatCurrency,
  getDoctorInitials,
  formatPhoneNumber,
} from './doctor.utils'
import type { Doctor } from '@/types/doctor.types'

interface DoctorCardItemProps {
  doctor: Doctor
  onViewDetail: (doctor: Doctor) => void
  onEdit: (doctor: Doctor) => void
  onDelete: (doctor: Doctor) => void
  onRestore: (doctor: Doctor) => void
}

export const DoctorCardItem: React.FC<DoctorCardItemProps> = ({
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
    <div
      className={`flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:shadow-md ${
        isDeleted ? 'bg-muted/15 opacity-80' : ''
      }`}
    >
      <div>
        {/* Top Header: Avatar + Tên + Trạng thái */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="relative size-12 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted/60 flex items-center justify-center shadow-2xs">
              {doctorAvatar ? (
                <img
                  src={doctorAvatar}
                  alt={doctorName}
                  className="size-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-sm">
                  {getDoctorInitials(doctorName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5 truncate">
                <span>{doctorName}</span>
                {user?.gender && (
                  <span className="text-[10px] font-normal px-1.5 py-0.2 rounded-full bg-muted text-muted-foreground">
                    {user.gender}
                  </span>
                )}
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                <Mail className="size-3 shrink-0" />
                <span className="truncate">{doctorEmail}</span>
              </div>
            </div>
          </div>

          <div>
            {isDeleted ? (
              <Badge
                variant="destructive"
                className="gap-1 text-[10px] py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
              >
                <Lock className="size-2.5" />
                <span>Đã khóa</span>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="gap-1 text-[10px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
              >
                <span className="size-1 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Hoạt động</span>
              </Badge>
            )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="mt-3.5 space-y-2 border-t border-border/40 pt-3 text-xs">
          {/* Chuyên khoa */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Stethoscope className="size-3.5" />
              <span>Chuyên khoa:</span>
            </span>
            {specialty?.name ? (
              <Badge
                variant="outline"
                className="text-[11px] py-0.5 px-2 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25"
              >
                {specialty.name}
              </Badge>
            ) : (
              <span className="text-muted-foreground italic">Chưa phân khoa</span>
            )}
          </div>

          {/* Điện thoại */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Phone className="size-3.5" />
              <span>Điện thoại:</span>
            </span>
            <span className="font-mono text-foreground font-medium">
              {formatPhoneNumber(doctorPhone)}
            </span>
          </div>

          {/* Giá khám */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <DollarSign className="size-3.5" />
              <span>Giá khám:</span>
            </span>
            <span className="text-sm font-bold text-foreground">
              {formatCurrency(doctor.price)}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Buttons */}
      <div className="mt-4 flex items-center justify-between border-t border-border/40 pt-3 gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onViewDetail(doctor)}
          className="flex-1 text-xs gap-1.5 h-8"
        >
          <Eye className="size-3.5" />
          <span>Hồ sơ</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(doctor)}
          className="flex-1 text-xs gap-1.5 h-8 text-teal-600 dark:text-teal-400 border-teal-500/30 hover:bg-teal-50 dark:hover:bg-teal-950/30"
        >
          <Pencil className="size-3.5" />
          <span>Sửa</span>
        </Button>

        {isDeleted ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRestore(doctor)}
            className="flex-1 text-xs gap-1.5 h-8 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <RotateCcw className="size-3.5" />
            <span>Mở khóa</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(doctor)}
            className="flex-1 text-xs gap-1.5 h-8 text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Lock className="size-3.5" />
            <span>Khóa</span>
          </Button>
        )}
      </div>
    </div>
  )
}
