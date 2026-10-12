import React, { useState } from 'react'
import { RotateCcw, X, Loader2, Calendar, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { scheduleApi } from '@/services/schedule.api'
import {
  formatScheduleDate,
  getTimeSlotInfo,
  extractErrorMessage,
} from '@/components/schedule/schedule.utils'
import type { Schedule } from '@/types/schedule.types'

interface DoctorReopenConfirmModalProps {
  isOpen: boolean
  schedule: Schedule | null
  onClose: () => void
  onSuccess: () => void
}

export const DoctorReopenConfirmModal: React.FC<DoctorReopenConfirmModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onSuccess,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (!isOpen || !schedule) return null

  const slotInfo = getTimeSlotInfo(schedule.time_type)

  const handleConfirmReopen = async () => {
    setIsSubmitting(true)
    try {
      await scheduleApi.updateDoctorSchedule(schedule.id, {
        status: 'AVAILABLE',
      })
      toast.success(`Mở lại ca khám #${schedule.id} thành công! Ca đã sẵn sàng nhận bệnh nhân mới.`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Mở lại ca làm việc thất bại!'))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <RotateCcw className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Mở lại Ca làm việc</h2>
              <p className="text-xs text-muted-foreground">Khôi phục tiếp nhận bệnh nhân khám</p>
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

        {/* Body */}
        <div className="p-6 space-y-4">
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
          </div>

          <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-200">
            <AlertCircle className="size-4 text-amber-600 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Ca làm việc sẽ được chuyển về trạng thái <span className="font-bold">AVAILABLE</span> để nhận bệnh nhân mới đặt lịch. <br />
              <span className="font-semibold underline">Lưu ý quan trọng:</span> Các lịch hẹn đã bị hủy trước đây của bệnh nhân sẽ <span className="font-bold">KHÔNG tự động phục hồi</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border/80 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            <span>Hủy bỏ</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleConfirmReopen}
            disabled={isSubmitting}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium cursor-pointer gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Đang xử lý...</span>
              </>
            ) : (
              <>
                <RotateCcw className="size-4" />
                <span>Xác nhận Mở lại ca</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
