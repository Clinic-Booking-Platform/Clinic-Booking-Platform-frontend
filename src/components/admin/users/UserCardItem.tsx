import React from 'react'
import {
  Eye,
  Lock,
  RotateCcw,
  Mail,
  Phone,
  Calendar,
  User as UserIcon,
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

interface UserCardItemProps {
  user: User
  onViewDetail: (user: User) => void
  onDelete: (user: User) => void
  onRestore: (user: User) => void
}

export const UserCardItem: React.FC<UserCardItemProps> = ({
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
                <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-sm">
                  {getUserInitials(patientName)}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <h4 className="font-semibold text-foreground text-sm flex items-center gap-1.5 truncate">
                <span>{patientName}</span>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-muted text-muted-foreground">
                  #{user.id}
                </span>
              </h4>
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5 truncate">
                <Mail className="size-3 shrink-0" />
                <span className="truncate">{patientEmail}</span>
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
          {/* Điện thoại */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Phone className="size-3.5" />
              <span>Điện thoại:</span>
            </span>
            <span className="font-mono text-foreground font-medium">
              {formatPhoneNumber(user.phone_number)}
            </span>
          </div>

          {/* Giới tính */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <UserIcon className="size-3.5" />
              <span>Giới tính:</span>
            </span>
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
              <span className="text-muted-foreground italic">Chưa cập nhật</span>
            )}
          </div>

          {/* Ngày sinh & Tuổi */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-muted-foreground flex items-center gap-1">
              <Calendar className="size-3.5" />
              <span>Ngày sinh:</span>
            </span>
            <span className="text-foreground font-medium">
              {formatDate(user.date_of_birth)}
              {age !== null && <span className="text-muted-foreground ml-1">({age} tuổi)</span>}
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
          onClick={() => onViewDetail(user)}
          className="flex-1 text-xs gap-1.5 h-8"
        >
          <Eye className="size-3.5" />
          <span>Hồ sơ</span>
        </Button>

        {isDeleted ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRestore(user)}
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
            onClick={() => onDelete(user)}
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
