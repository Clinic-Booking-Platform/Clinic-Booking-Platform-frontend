import React, { useState } from 'react'
import {
  AlertTriangle,
  X,
  Loader2,
  Calendar,
  Clock,
  Users,
  ShieldAlert,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { scheduleApi } from '@/services/schedule.api'
import {
  formatScheduleDate,
  getTimeSlotInfo,
  extractErrorMessage,
} from '@/components/schedule/schedule.utils'
import type { Schedule } from '@/types/schedule.types'

interface DoctorCancelConfirmModalProps {
  isOpen: boolean
  schedule: Schedule | null
  onClose: () => void
  onSuccess: () => void
}

export const DoctorCancelConfirmModal: React.FC<DoctorCancelConfirmModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !schedule) return null

  const currentNumber = schedule.current_number ?? 0
  const hasBookings = currentNumber > 0
  const slotInfo = getTimeSlotInfo(schedule.time_type)

  const handleConfirmCancel = async () => {
    setIsSubmitting(true)
    try {
      const res = await scheduleApi.updateDoctorSchedule(schedule.id, {
        status: 'CANCELLED',
      })

      const cancelledCount = res.data?.cancelled_appointments_count ?? currentNumber
      if (cancelledCount > 0) {
        toast.success(
          `Đã hủy ca thành công. Hệ thống đã tự động hủy ${cancelledCount} lịch hẹn của bệnh nhân.`
        )
      } else {
        toast.success(`Đã hủy ca làm việc #${schedule.id} thành công!`)
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Hủy ca làm việc thất bại!'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header với Icon cảnh báo */}
        <div
          className={`flex items-center justify-between px-6 py-4 border-b border-border/80 ${
            hasBookings ? 'bg-rose-500/10' : 'bg-muted/20'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <div
              className={`flex size-10 items-center justify-center rounded-xl ${
                hasBookings
                  ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400'
                  : 'bg-amber-500/20 text-amber-600 dark:text-amber-400'
              }`}
            >
              {hasBookings ? (
                <ShieldAlert className="size-6 animate-pulse" />
              ) : (
                <AlertTriangle className="size-6" />
              )}
            </div>
            <div>
              <h2
                className={`text-base font-bold ${
                  hasBookings ? 'text-rose-700 dark:text-rose-400' : 'text-foreground'
                }`}
              >
                {hasBookings
                  ? '⚠️ CẢNH BÁO: CA ĐÃ CÓ BỆNH NHÂN ĐẶT LỊCH!'
                  : 'Xác nhận Hủy ca làm việc'}
              </h2>
              <p className="text-xs text-muted-foreground">
                Mã ca khám: #{schedule.id} • {schedule.time_type}
              </p>
            </div>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="size-8 p-0 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </Button>
        </div>

        {/* Body Nội dung */}
        <div className="p-6 space-y-4">
          {/* Thông tin vắn tắt về ca */}
          <div className="p-3.5 rounded-xl border border-border/80 bg-muted/30 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-teal-600" />
                <span>Ngày khám:</span>
              </span>
              <span className="font-semibold text-foreground">
                {formatScheduleDate(schedule.date)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-teal-600" />
                <span>Khung giờ:</span>
              </span>
              <span className="font-semibold text-foreground">
                {schedule.time_type} ({slotInfo?.time || 'N/A'})
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-teal-600" />
                <span>Bệnh nhân đã đặt:</span>
              </span>
              <span
                className={`font-bold ${
                  hasBookings ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                }`}
              >
                {currentNumber} / {schedule.max_number} bệnh nhân
              </span>
            </div>
          </div>

          {/* Chi tiết cảnh báo */}
          {hasBookings ? (
            <div className="p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 space-y-2 text-xs text-rose-900 dark:text-rose-200">
              <p className="font-semibold leading-relaxed">
                Ca làm việc này hiện đang có <span className="underline font-bold text-rose-600 dark:text-rose-300">{currentNumber} bệnh nhân</span> đã đặt lịch hẹn trước.
              </p>
              <p>Nếu bác sĩ xác nhận <span className="font-bold">HỦY CA</span>, hệ thống sẽ:</p>
              <ol className="list-decimal list-inside space-y-1 pl-1">
                <li>Tự động hủy toàn bộ <span className="font-bold">{currentNumber} lịch hẹn</span> của các bệnh nhân trong ca này.</li>
                <li>Gửi thông báo hủy lịch hẹn đến bệnh nhân.</li>
              </ol>
              <p className="font-bold pt-1 text-rose-700 dark:text-rose-300">
                ⚠️ Hành động này KHÔNG THỂ HOÀN TÁC cho các lịch hẹn đã bị hủy!
              </p>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground leading-relaxed">
              Ca này hiện chưa có bệnh nhân nào đặt lịch. Sau khi hủy, ca làm việc sẽ chuyển sang trạng thái{' '}
              <span className="font-semibold text-foreground">CANCELLED</span> và ngừng tiếp nhận đặt lịch mới. Bác sĩ có thể mở lại ca này bất kỳ lúc nào.
            </p>
          )}
        </div>

        {/* Footer Buttons */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/80 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            autoFocus
            className="cursor-pointer font-medium"
          >
            <span>Quay lại</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirmCancel}
            disabled={isSubmitting}
            className="bg-rose-600 hover:bg-rose-700 text-white font-medium cursor-pointer gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang hủy ca...</span>
              </>
            ) : hasBookings ? (
              <span>Tôi hiểu rủi ro, Xác nhận hủy ca</span>
            ) : (
              <span>Xác nhận hủy ca</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
