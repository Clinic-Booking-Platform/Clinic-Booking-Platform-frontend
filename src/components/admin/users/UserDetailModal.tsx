import React, { useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  Calendar,
  Lock,
  RotateCcw,
  ShieldCheck,
  User as UserIcon,
  HeartPulse,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatDate,
  formatDateTime,
  calculateAge,
  formatPhoneNumber,
  getUserInitials,
} from './user.utils'
import type { User } from '@/types/user.types'

interface UserDetailModalProps {
  isOpen: boolean
  onClose: () => void
  user: User | null
  onPromptDelete?: (user: User) => void
  onPromptRestore?: (user: User) => void
}

export const UserDetailModal: React.FC<UserDetailModalProps> = ({
  isOpen,
  onClose,
  user,
  onPromptDelete,
  onPromptRestore,
}) => {
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

  if (!isOpen || !user) return null

  const isDeleted = Boolean(user.deleted_at)
  const patientName = user.full_name || 'Bệnh nhân'
  const patientEmail = user.email || 'N/A'
  const age = calculateAge(user.date_of_birth)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl transition-all scale-100 dark:bg-card">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-6 py-4">
          <div className="flex items-center gap-2">
            <HeartPulse className="size-4.5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-foreground">
              Hồ Sơ Chi Tiết Bệnh Nhân
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Đóng"
          >
            <X className="size-4.5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="max-h-[calc(85vh-75px)] overflow-y-auto p-6 space-y-5">
          {/* Patient Profile Card */}
          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-xl border border-border/70 bg-muted/20 p-4.5">
            <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-border/80 bg-muted/60 flex items-center justify-center shadow-xs">
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
                <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xl">
                  {getUserInitials(patientName)}
                </div>
              )}
            </div>

            <div className="flex-1 text-center sm:text-left space-y-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold text-foreground">{patientName}</h2>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                  Mã BN: #{user.id}
                </span>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                {isDeleted ? (
                  <Badge
                    variant="destructive"
                    className="text-xs py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                  >
                    <Lock className="size-3 mr-1" />
                    Tài khoản đã bị khóa
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="text-xs py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  >
                    <ShieldCheck className="size-3 mr-1 text-emerald-600" />
                    Đang hoạt động bình thường
                  </Badge>
                )}
              </div>

              <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                <Mail className="size-3 text-muted-foreground shrink-0" />
                <span>{patientEmail}</span>
              </p>
            </div>
          </div>

          {/* Attributes Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {/* Số điện thoại */}
            <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Phone className="size-3.5 text-teal-600" />
                <span>Số điện thoại liên hệ:</span>
              </span>
              <p className="font-mono text-foreground font-semibold text-sm">
                {formatPhoneNumber(user.phone_number)}
              </p>
            </div>

            {/* Giới tính */}
            <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <UserIcon className="size-3.5 text-teal-600" />
                <span>Giới tính:</span>
              </span>
              <p className="text-foreground font-semibold text-sm">
                {user.gender || 'Chưa cập nhật'}
              </p>
            </div>

            {/* Ngày sinh & Tuổi */}
            <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-teal-600" />
                <span>Ngày sinh & Độ tuổi:</span>
              </span>
              <p className="text-foreground font-semibold text-sm">
                {formatDate(user.date_of_birth)}
                {age !== null && (
                  <span className="text-muted-foreground font-normal text-xs ml-1.5">
                    ({age} tuổi)
                  </span>
                )}
              </p>
            </div>

            {/* Thời gian tham gia */}
            <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
              <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                <Calendar className="size-3.5 text-teal-600" />
                <span>Thời gian đăng ký tài khoản:</span>
              </span>
              <p className="text-foreground font-medium text-xs">
                {formatDateTime(user.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Bar with Quick Actions */}
        <div className="flex items-center justify-between border-t border-border/60 bg-muted/20 px-6 py-3.5">
          <div>
            {isDeleted ? (
              onPromptRestore && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose()
                    onPromptRestore(user)
                  }}
                  className="text-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 gap-1.5"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Mở khóa tài khoản</span>
                </Button>
              )
            ) : (
              onPromptDelete && (
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose()
                    onPromptDelete(user)
                  }}
                  className="text-xs text-rose-600 dark:text-rose-400 border-rose-500/30 hover:bg-rose-50 dark:hover:bg-rose-950/30 gap-1.5"
                >
                  <Lock className="size-3.5" />
                  <span>Khóa tài khoản</span>
                </Button>
              )
            )}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}
