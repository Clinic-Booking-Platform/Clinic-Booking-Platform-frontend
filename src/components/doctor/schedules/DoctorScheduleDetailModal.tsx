import React, { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  Users,
  Loader2,
  Ban,
  RotateCcw,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import { scheduleApi } from '@/services/schedule.api'
import {
  formatScheduleDate,
  getTimeSlotInfo,
  getStatusBadgeConfig,
  extractErrorMessage,
} from '@/components/schedule/schedule.utils'
import type { Schedule } from '@/types/schedule.types'

interface DoctorScheduleDetailModalProps {
  isOpen: boolean
  schedule: Schedule | null
  onClose: () => void
  onSuccess: () => void
  onTriggerCancel: (schedule: Schedule) => void
  onTriggerReopen: (schedule: Schedule) => void
}

export const DoctorScheduleDetailModal: React.FC<DoctorScheduleDetailModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onSuccess,
  onTriggerCancel,
  onTriggerReopen,
}) => {
  const [maxNumber, setMaxNumber] = useState<number>(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [prevScheduleId, setPrevScheduleId] = useState<number | null>(null)
  if (schedule && schedule.id !== prevScheduleId) {
    setPrevScheduleId(schedule.id)
    setMaxNumber(schedule.max_number)
    setError(null)
  }
  if (!isOpen && prevScheduleId !== null) {
    setPrevScheduleId(null)
  }

  if (!isOpen || !schedule) return null

  const currentNumber = schedule.current_number ?? 0
  const slotInfo = getTimeSlotInfo(schedule.time_type)
  const statusConfig = getStatusBadgeConfig(schedule.status)
  const isCancelled = schedule.status === 'CANCELLED'

  const handleUpdateMaxNumber = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation: Không cho phép max_number < current_number
    if (maxNumber < currentNumber) {
      setError(
        `Số lượng tiếp nhận tối đa không thể nhỏ hơn số bệnh nhân hiện có (${currentNumber} người)!`
      )
      return
    }

    if (maxNumber < 1 || maxNumber > 100) {
      setError('Số lượng bệnh nhân phải từ 1 đến 100!')
      return
    }

    setError(null)
    setIsSubmitting(true)

    try {
      await scheduleApi.updateDoctorSchedule(schedule.id, {
        max_number: maxNumber,
      })

      toast.success(`Cập nhật định mức ca khám #${schedule.id} thành ${maxNumber} bệnh nhân!`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Cập nhật ca làm việc thất bại!'))
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
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Clock className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Chi tiết & Tùy chỉnh Ca làm việc</h2>
              <p className="text-xs text-muted-foreground">Mã ca #{schedule.id}</p>
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

        {/* Body Content */}
        <div className="p-6 space-y-5">
          {/* 1. Thẻ thông tin cơ bản */}
          <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Calendar className="size-3.5 text-teal-600" />
                <span>Ngày khám:</span>
              </span>
              <span className="text-xs font-bold text-foreground">
                {formatScheduleDate(schedule.date)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-teal-600" />
                <span>Khung giờ:</span>
              </span>
              <span className="text-xs font-bold text-foreground">
                {schedule.time_type} ({slotInfo?.time || 'N/A'}) - {slotInfo?.period === 'morning' ? 'Buổi sáng' : 'Buổi chiều'}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <CheckCircle2 className="size-3.5 text-teal-600" />
                <span>Trạng thái:</span>
              </span>
              <span
                className={cn(
                  'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border',
                  statusConfig.classes
                )}
              >
                <span className={cn('size-1.5 rounded-full', statusConfig.dotClass)} />
                <span>{statusConfig.label}</span>
              </span>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-border/60">
              <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Users className="size-3.5 text-teal-600" />
                <span>Bệnh nhân đã đặt lịch:</span>
              </span>
              <span className="text-sm font-bold text-teal-700 dark:text-teal-300">
                {currentNumber} bệnh nhân
              </span>
            </div>
            <p className="text-[11px] text-muted-foreground italic">
              * Bao gồm các bệnh nhân có lịch hẹn đang chờ xác nhận (PENDING) hoặc đã xác nhận (CONFIRMED).
            </p>
          </div>

          {/* 2. Cập nhật Số lượng tối đa (max_number) */}
          <form onSubmit={handleUpdateMaxNumber} className="space-y-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-teal-600" />
                  <span>Điều chỉnh số lượng tiếp nhận tối đa (max_number)</span>
                </span>
                <span className="text-[11px] text-muted-foreground">Tối thiểu: {Math.max(1, currentNumber)}</span>
              </label>

              <div className="flex items-center gap-2">
                <input
                  type="number"
                  min={Math.max(1, currentNumber)}
                  max={100}
                  value={maxNumber}
                  disabled={isCancelled}
                  onChange={(e) => {
                    setMaxNumber(parseInt(e.target.value, 10) || 1)
                    setError(null)
                  }}
                  className="flex-1 h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 disabled:opacity-50"
                />

                <Button
                  type="submit"
                  size="sm"
                  disabled={isSubmitting || isCancelled || maxNumber === schedule.max_number}
                  className="h-10 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium cursor-pointer gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <>
                      <Save className="size-4" />
                      <span>Lưu định mức</span>
                    </>
                  )}
                </Button>
              </div>

              {error && <p className="text-xs text-rose-500 font-medium">{error}</p>}
            </div>
          </form>

          {/* 3. Phân vùng Chuyển đổi trạng thái (Hủy ca hoặc Mở lại) */}
          <div className="pt-3 border-t border-border/80">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-foreground">Trạng thái tiếp nhận khám</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isCancelled
                    ? 'Ca đang ngưng tiếp nhận. Có thể mở lại bất kỳ lúc nào.'
                    : 'Bác sĩ có thể hủy ca nếu có việc đột xuất.'}
                </p>
              </div>

              {!isCancelled ? (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose()
                    onTriggerCancel(schedule)
                  }}
                  className="border-rose-500/30 text-rose-600 hover:bg-rose-500/10 cursor-pointer gap-1.5 font-medium text-xs"
                >
                  <Ban className="size-3.5" />
                  <span>Hủy ca làm việc</span>
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onClose()
                    onTriggerReopen(schedule)
                  }}
                  className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer gap-1.5 font-medium text-xs"
                >
                  <RotateCcw className="size-3.5" />
                  <span>Mở lại ca</span>
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end px-6 py-3.5 border-t border-border/80 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="cursor-pointer"
          >
            <span>Đóng</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
