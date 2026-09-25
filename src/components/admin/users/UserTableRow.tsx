import React from 'react'
import {
  Eye,
  Lock,
  RotateCcw,
  Mail,
  Phone,
  Calendar,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatDate,
  calculateAge,
  formatPhoneNumber,
  getUserInitials,
} from './user.utils'
import type { User } from '@/types/user.types'

interface UserTableRowProps {
  user: User
  onViewDetail: (user: User) => void
  onDelete: (user: User) => void
  onRestore: (user: User) => void
}

export const UserTableRow: React.FC<UserTableRowProps> = ({
  user,
  onViewDetail,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(user.deleted_at)
  const patientName = user.full_name || 'Bệnh nhân'
  const patientEmail = user.email || 'N/A'
  const age = calculateAge(user.date_of_birth)

  return (
    <tr
      className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${
        isDeleted ? 'bg-muted/15 opacity-75' : ''
      }`}
    >
      {/* 1. Bệnh nhân (Avatar tròn 40x40 + Họ tên) */}
      <td className="px-4 py-3.5">
        <div className="flex items-center gap-3">
          <div className="relative size-10 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted/60 flex items-center justify-center shadow-2xs">
            {user.avatar ? (
              <img
                src={user.avatar}
                alt={patientName}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xs">
                {getUserInitials(patientName)}
              </div>
            )}
          </div>
          <div className="min-w-0">
            <div className="font-semibold text-foreground text-sm flex items-center gap-1.5 truncate">
              <span>{patientName}</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                #{user.id}
              </span>
            </div>
          </div>
        </div>
      </td>

      {/* 2. Thông tin liên hệ (Email & Số điện thoại) */}
      <td className="px-4 py-3.5">
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5 text-foreground truncate max-w-[220px]">
            <Mail className="size-3 text-muted-foreground shrink-0" />
            <span className="truncate">{patientEmail}</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground font-mono">
            <Phone className="size-3 text-muted-foreground shrink-0" />
            <span>{formatPhoneNumber(user.phone_number)}</span>
          </div>
        </div>
      </td>

      {/* 3. Thông tin cá nhân (Giới tính & Ngày sinh + Tuổi) */}
      <td className="px-4 py-3.5">
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-1.5">
            {user.gender ? (
              <span
                className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                  user.gender === 'Nam'
                    ? 'bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20'
                    : user.gender === 'Nữ'
                    ? 'bg-pink-500/10 text-pink-700 dark:text-pink-300 border border-pink-500/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {user.gender}
              </span>
            ) : (
              <span className="text-muted-foreground italic">Chưa rõ</span>
            )}
            {age !== null && (
              <span className="text-muted-foreground">({age} tuổi)</span>
            )}
          </div>
          <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
            <Calendar className="size-3 shrink-0" />
            <span>{formatDate(user.date_of_birth)}</span>
          </div>
        </div>
      </td>

      {/* 4. Trạng thái tài khoản */}
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

      {/* 5. Thao tác (Actions) */}
      <td className="px-4 py-3.5 text-right">
        <div className="flex items-center justify-end gap-1">
          {/* Xem chi tiết */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onViewDetail(user)}
            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Xem hồ sơ chi tiết bệnh nhân"
          >
            <Eye className="size-4" />
          </Button>

          {/* Khóa / Mở khóa */}
          {isDeleted ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRestore(user)}
              className="size-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              title="Mở khóa tài khoản"
            >
              <RotateCcw className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(user)}
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
