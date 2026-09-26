import React, { useEffect } from 'react'
import { AlertTriangle, Loader2, X, Calendar, Clock, User, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { formatAppointmentDate, getTimeSlotInfo } from './appointment.utils'
import type { Appointment } from '@/types/appointment.types'

export interface CancelAppointmentDialogProps {
  isOpen: boolean
  appointment: Appointment | null
  isLoading?: boolean
  onClose: () => void
  onConfirm: () => void
}

export const CancelAppointmentDialog: React.FC<CancelAppointmentDialogProps> = ({
  isOpen,
  appointment,
  isLoading = false,
  onClose,
  onConfirm,
}) => {
  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
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
  }, [isOpen, isLoading, onClose])

  if (!isOpen || !appointment) return null

  const slotInfo = getTimeSlotInfo(appointment.time_type)
  const docName = appointment.doctor?.user?.full_name || `Bác sĩ #${appointment.doctor_id}`

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isLoading) onClose()
        }}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-rose-500/20 bg-card p-6 shadow-2xl transition-all scale-100 dark:bg-card">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
          aria-label="Đóng"
        >
          <X className="size-4" />
        </button>

        {/* Icon & Title */}
        <div className="flex items-start gap-3.5">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
            <AlertTriangle className="size-5" />
          </div>

          <div className="flex-1 pr-6">
            <h3 className="text-base sm:text-lg font-bold text-foreground">
              Xác nhận hủy lịch hẹn khám
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              Mã lịch hẹn: <span className="font-semibold text-foreground">#{appointment.id}</span>
            </p>
          </div>
        </div>

        {/* Thông tin vắn tắt lịch hẹn */}
        <div className="mt-4 rounded-xl border border-border/80 bg-muted/30 p-3.5 space-y-2 text-xs">
          <div className="flex items-center gap-2 text-foreground font-medium">
            <User className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Bệnh nhân:</span>
            <strong className="text-foreground">{appointment.patient_name}</strong>
            <span className="text-muted-foreground font-normal">({appointment.patient_phone})</span>
          </div>

          <div className="flex items-center gap-2 text-foreground font-medium">
            <UserCheck className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Bác sĩ:</span>
            <span>{docName}</span>
          </div>

          <div className="flex items-center gap-2 text-foreground font-medium">
            <Calendar className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Thời gian:</span>
            <span>{formatAppointmentDate(appointment.date)}</span>
            {slotInfo && (
              <span className="inline-flex items-center gap-1 rounded bg-background px-1.5 py-0.5 text-[11px] font-semibold border border-border/60">
                <Clock className="size-3 text-muted-foreground" />
                {slotInfo.time}
              </span>
            )}
          </div>
        </div>

        {/* Warning Callout */}
        <div className="mt-4 rounded-xl bg-rose-500/10 border border-rose-500/20 p-3 text-xs text-rose-700 dark:text-rose-300">
          <p className="font-semibold">⚠️ Lưu ý quan trọng:</p>
          <p className="mt-1 leading-relaxed">
            Bạn có chắc chắn muốn hủy lịch hẹn của bệnh nhân{' '}
            <strong className="font-bold underline">{appointment.patient_name}</strong>?
            Hành động này sẽ mở lại 1 suất trống cho ca trực của bác sĩ (nếu ca trước đó đang kín chỗ).
          </p>
        </div>

        {/* Actions */}
        <div className="mt-6 flex items-center justify-end gap-2.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="cursor-pointer font-medium"
          >
            Hủy bỏ
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="gap-1.5 bg-rose-600 hover:bg-rose-700 text-white shadow-xs cursor-pointer font-medium"
          >
            {isLoading && <Loader2 className="size-4 animate-spin" />}
            <span>Xác nhận hủy lịch</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
