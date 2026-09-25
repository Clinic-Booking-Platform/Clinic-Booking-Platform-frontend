import React, { useState, useEffect } from 'react'
import {
  X,
  Phone,
  Mail,
  Stethoscope,
  DollarSign,
  Calendar,
  Lock,
  Loader2,
  AlertTriangle,
  FileText,
  User,
  ShieldCheck,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { doctorApi } from '@/services/doctor.api'
import {
  formatCurrency,
  getDoctorInitials,
  formatPhoneNumber,
} from './doctor.utils'
import type { Doctor } from '@/types/doctor.types'

interface DoctorDetailModalProps {
  isOpen: boolean
  onClose: () => void
  doctorId: number | null
}

export const DoctorDetailModal: React.FC<DoctorDetailModalProps> = ({
  isOpen,
  onClose,
  doctorId,
}) => {
  const [data, setData] = useState<Doctor | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(Boolean(doctorId))
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let ignore = false

    if (isOpen && doctorId) {
      doctorApi
        .getDoctorById(doctorId)
        .then((res) => {
          if (!ignore) {
            setData(res)
            setError(null)
            setIsLoading(false)
          }
        })
        .catch((err) => {
          if (!ignore) {
            setError(err?.response?.data?.message || 'Không thể tải chi tiết bác sĩ!')
            setIsLoading(false)
          }
        })
    }

    return () => {
      ignore = true
    }
  }, [isOpen, doctorId])

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
  const user = data?.user
  const specialty = data?.specialty
  const doctorName = user?.full_name || 'Bác sĩ'
  const doctorEmail = user?.email || 'N/A'
  const doctorPhone = user?.phone_number
  const doctorAvatar = user?.avatar

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return 'N/A'
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      })
    } catch {
      return dateStr
    }
  }

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
            <User className="size-4.5 text-teal-600 dark:text-teal-400" />
            <h3 className="text-base font-bold text-foreground">
              Hồ Sơ Chi Tiết Bác Sĩ
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
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Loader2 className="size-8 text-teal-600 animate-spin mb-3" />
              <p className="text-xs text-muted-foreground font-medium">
                Đang tải thông tin hồ sơ bác sĩ...
              </p>
            </div>
          ) : error ? (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-5 text-center text-rose-600 dark:text-rose-400">
              <AlertTriangle className="size-7 mx-auto mb-2" />
              <p className="text-xs font-semibold">{error}</p>
            </div>
          ) : data ? (
            <>
              {/* Doctor Profile Card */}
              <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 rounded-xl border border-border/70 bg-muted/20 p-4.5">
                <div className="relative size-20 shrink-0 overflow-hidden rounded-full border-2 border-border/80 bg-muted/60 flex items-center justify-center shadow-xs">
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
                    <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xl">
                      {getDoctorInitials(doctorName)}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center sm:text-left space-y-1">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h2 className="text-lg font-bold text-foreground">{doctorName}</h2>
                    {user?.gender && (
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground">
                        {user.gender}
                      </span>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-1.5 pt-0.5">
                    {specialty?.name ? (
                      <Badge
                        variant="outline"
                        className="text-xs py-0.5 px-2 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25"
                      >
                        <Stethoscope className="size-3 mr-1" />
                        {specialty.name}
                      </Badge>
                    ) : (
                      <span className="text-xs text-muted-foreground italic">Chưa phân khoa</span>
                    )}

                    {isDeleted ? (
                      <Badge
                        variant="destructive"
                        className="text-xs py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20"
                      >
                        <Lock className="size-3 mr-1" />
                        Đã khóa
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="text-xs py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                      >
                        <ShieldCheck className="size-3 mr-1 text-emerald-600" />
                        Hoạt động
                      </Badge>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 pt-1">
                    <Mail className="size-3 text-muted-foreground shrink-0" />
                    <span>{doctorEmail}</span>
                  </p>
                </div>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Phone className="size-3.5 text-teal-600" />
                    <span>Số điện thoại:</span>
                  </span>
                  <p className="font-mono text-foreground font-semibold text-sm">
                    {formatPhoneNumber(doctorPhone)}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <DollarSign className="size-3.5 text-teal-600" />
                    <span>Giá khám niêm yết:</span>
                  </span>
                  <p className="text-foreground font-bold text-sm text-teal-600 dark:text-teal-400">
                    {formatCurrency(data.price)}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <Calendar className="size-3.5 text-teal-600" />
                    <span>Ngày tham gia hệ thống:</span>
                  </span>
                  <p className="text-foreground font-medium">
                    {formatDate(data.created_at)}
                  </p>
                </div>

                <div className="rounded-xl border border-border/60 bg-card p-3 space-y-1">
                  <span className="text-muted-foreground flex items-center gap-1.5 font-medium">
                    <User className="size-3.5 text-teal-600" />
                    <span>Mã định danh:</span>
                  </span>
                  <p className="text-foreground font-mono font-medium">
                    Doctor #{data.id} (User #{data.user_id})
                  </p>
                </div>
              </div>

              {/* Biography & Experience */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-foreground">
                  <FileText className="size-3.5 text-teal-600" />
                  <span>Tiểu sử, Bằng cấp & Kinh nghiệm công tác</span>
                </div>
                {data.description ? (
                  <div className="rounded-xl border border-border/80 bg-muted/15 p-4 text-xs sm:text-sm text-foreground leading-relaxed whitespace-pre-wrap">
                    {data.description}
                  </div>
                ) : (
                  <div className="rounded-xl border border-dashed border-border/80 bg-muted/10 p-5 text-center text-xs text-muted-foreground italic">
                    Chưa cập nhật thông tin tiểu sử và kinh nghiệm cho bác sĩ này.
                  </div>
                )}
              </div>
            </>
          ) : null}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-border/60 bg-muted/20 px-6 py-3.5">
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
