import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  Users,
  Loader2,
  AlertCircle,
  Pencil,
  CheckCircle2,
  XCircle,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { scheduleApi } from '@/services/schedule.api'
import {
  formatScheduleDate,
  getTimeSlotInfo,
  updateScheduleSchema,
  extractErrorMessage,
} from './schedule.utils'
import type { Schedule, ScheduleStatus } from '@/types/schedule.types'

interface ScheduleEditModalProps {
  isOpen: boolean
  schedule: Schedule | null
  onClose: () => void
  onSuccess: () => void
}

export const ScheduleEditModal: React.FC<ScheduleEditModalProps> = ({
  isOpen,
  schedule,
  onClose,
  onSuccess,
}) => {
  const [maxNumber, setMaxNumber] = useState<number | ''>(10)
  const [status, setStatus] = useState<ScheduleStatus>('AVAILABLE')

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const [prevScheduleId, setPrevScheduleId] = useState<number | null>(null)
  if (schedule && schedule.id !== prevScheduleId) {
    setPrevScheduleId(schedule.id)
    setMaxNumber(schedule.max_number)
    const isInitiallyFull =
      (schedule.current_number ?? 0) >= schedule.max_number && schedule.max_number > 0
    setStatus(
      isInitiallyFull && schedule.status === 'AVAILABLE' ? 'FULL' : schedule.status
    )
    setErrors({})
  }
  if (!isOpen && prevScheduleId !== null) {
    setPrevScheduleId(null)
  }

  // Handle Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
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
  }, [isOpen, isSubmitting, onClose])

  if (!isOpen || !schedule) return null

  const slotInfo = getTimeSlotInfo(schedule.time_type)
  const docName = schedule.doctor?.user?.full_name || `Bác sĩ #${schedule.doctor_id}`
  const specialtyName = schedule.doctor?.specialty?.name

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const clientErrors: Record<string, string> = {}
    const currentBooked = schedule.current_number ?? 0
    const numMax = Number(maxNumber)
    const isFullNow = numMax > 0 && currentBooked >= numMax

    // 1. Kiểm tra max_number không nhỏ hơn số lượng hiện tại đã đặt
    if (maxNumber !== '' && numMax < currentBooked) {
      clientErrors.max_number = `Số lượng tối đa không thể nhỏ hơn số bệnh nhân đã đặt (${currentBooked})!`
    }

    // 2. Khi đã đầy lượng đặt khám thì KHÔNG THỂ đổi trạng thái thành có sẵn (AVAILABLE)
    if (status === 'AVAILABLE' && isFullNow) {
      clientErrors.status = `Ca khám đã đầy lượng đặt (${currentBooked}/${numMax}), không thể chuyển sang trạng thái "Còn chỗ trống"!`
    }

    const parseResult = updateScheduleSchema.safeParse({
      max_number: maxNumber === '' ? undefined : numMax,
      status,
    })

    if (!parseResult.success) {
      for (const issue of parseResult.error.issues) {
        const path = issue.path[0] as string
        if (path && !clientErrors[path]) {
          clientErrors[path] = issue.message
        }
      }
    }

    if (Object.keys(clientErrors).length > 0) {
      setErrors(clientErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        max_number: Number(maxNumber),
        status,
      }
      await scheduleApi.updateSchedule(schedule.id, payload)
      toast.success('Cập nhật ca làm việc thành công!')
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Cập nhật ca làm việc thất bại!'))
    } finally {
      setIsSubmitting(false)
    }
  }

  const currentBooked = schedule.current_number ?? 0
  const effectiveMax = maxNumber !== '' ? Number(maxNumber) : schedule.max_number
  const isScheduleFull = effectiveMax > 0 && currentBooked >= effectiveMax

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={() => {
          if (!isSubmitting) onClose()
        }}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-lg max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
              <Pencil className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-foreground">
                Chỉnh sửa ca làm việc #{schedule.id}
              </h2>
              <p className="text-xs text-muted-foreground">
                Cập nhật định mức tiếp nhận tối đa và trạng thái sẵn sàng của ca
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={isSubmitting}
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Form Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {/* Thông tin cố định của ca (Read-only Card) */}
          <div className="rounded-xl border border-border/70 bg-muted/20 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Thông tin ca trực
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-background px-2.5 py-0.5 text-xs font-semibold text-foreground border border-border/60">
                Mã ca: #{schedule.id}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <UserCheck className="size-3 text-teal-600 dark:text-teal-400" />
                  <span>Bác sĩ phụ trách:</span>
                </span>
                <p className="font-semibold text-foreground truncate">{docName}</p>
                {specialtyName && (
                  <p className="text-[11px] text-muted-foreground">{specialtyName}</p>
                )}
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Calendar className="size-3 text-teal-600 dark:text-teal-400" />
                  <span>Ngày làm việc:</span>
                </span>
                <p className="font-semibold text-foreground">
                  {formatScheduleDate(schedule.date)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="size-3 text-teal-600 dark:text-teal-400" />
                  <span>Khung giờ:</span>
                </span>
                <p className="font-semibold text-foreground">
                  {slotInfo?.time || schedule.time_type} ({schedule.time_type})
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Users className="size-3 text-teal-600 dark:text-teal-400" />
                  <span>Số lượt bệnh nhân hiện đã đặt:</span>
                </span>
                <p className="font-bold text-teal-600 dark:text-teal-400 text-sm">
                  {schedule.current_number ?? 0} / {schedule.max_number}
                </p>
              </div>
            </div>
          </div>

          <form id="edit-schedule-form" onSubmit={handleSubmit} className="space-y-4">
            {/* 1. Số lượng tiếp nhận tối đa (max_number) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  Số lượng bệnh nhân tối đa <span className="text-rose-500">*</span>
                </span>
                <span className="text-[11px] text-muted-foreground">
                  Hiện đã đặt: <strong className="text-foreground">{currentBooked}</strong> / {schedule.max_number}
                </span>
              </label>

              <input
                type="number"
                min={currentBooked}
                max="100"
                value={maxNumber}
                onChange={(e) => {
                  const val = e.target.value
                  const newMax = val === '' ? '' : parseInt(val, 10)
                  setMaxNumber(newMax)
                  if (errors.max_number) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.max_number
                      return next
                    })
                  }
                  // Nếu hạ chỉ tiêu xuống <= số lượng đã đặt, tự động chuyển status sang FULL nếu đang là AVAILABLE
                  if (newMax !== '' && currentBooked >= newMax && status === 'AVAILABLE') {
                    setStatus('FULL')
                  }
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 ${
                  errors.max_number
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-border/80 focus:border-teal-500'
                }`}
              />

              <p className="text-[11px] text-muted-foreground">
                Số lượng tối đa không thể nhỏ hơn số bệnh nhân đã đặt ({currentBooked})
              </p>

              {errors.max_number && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.max_number}</span>
                </p>
              )}
            </div>

            {/* 2. Trạng thái ca làm việc (status) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>
                  Trạng thái ca làm việc <span className="text-rose-500">*</span>
                </span>
                {isScheduleFull && (
                  <span className="text-[11px] font-semibold text-rose-500 flex items-center gap-1">
                    <AlertTriangle className="size-3" />
                    Đã kín chỗ ({currentBooked}/{effectiveMax})
                  </span>
                )}
              </label>

              <select
                value={status}
                onChange={(e) => {
                  const newStatus = e.target.value as ScheduleStatus
                  setStatus(newStatus)
                  if (errors.status) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.status
                      return next
                    })
                  }
                }}
                className={`w-full appearance-none rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm text-foreground transition-all outline-none focus:ring-2 cursor-pointer ${
                  errors.status
                    ? 'border-rose-500 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-border/80 focus:border-teal-500 focus:ring-teal-500/20'
                }`}
              >
                <option value="AVAILABLE" disabled={isScheduleFull}>
                  Còn chỗ trống (AVAILABLE) {isScheduleFull ? '— [Không khả dụng: Ca đã đầy]' : ''}
                </option>
                <option value="FULL">Đã kín chỗ / Khóa tiếp nhận (FULL)</option>
                <option value="CANCELLED">Hủy ca làm việc (CANCELLED)</option>
              </select>

              {errors.status && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1 font-medium">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.status}</span>
                </p>
              )}

              {isScheduleFull && !errors.status && (
                <p className="text-[11px] text-amber-600 dark:text-amber-400 flex items-center gap-1 mt-1 font-medium">
                  <AlertTriangle className="size-3.5 shrink-0" />
                  <span>
                    Ca khám đã đạt định mức ({currentBooked}/{effectiveMax} bệnh nhân). Không thể chọn trạng thái "Còn chỗ trống".
                  </span>
                </p>
              )}

              <div className="rounded-lg bg-muted/40 p-2.5 text-[11px] text-muted-foreground space-y-1">
                {status === 'AVAILABLE' && (
                  <p className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 className="size-3.5 shrink-0" />
                    <span>Bệnh nhân có thể tiếp tục xem và đặt lịch khám trong ca này.</span>
                  </p>
                )}
                {status === 'FULL' && (
                  <p className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <AlertTriangle className="size-3.5 shrink-0" />
                    <span>Tạm dừng nhận thêm lượt đặt mới nhưng các lịch đã đặt vẫn diễn ra.</span>
                  </p>
                )}
                {status === 'CANCELLED' && (
                  <p className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400">
                    <XCircle className="size-3.5 shrink-0" />
                    <span>Hủy toàn bộ ca trực, bệnh nhân sẽ được thông báo lịch bị hủy.</span>
                  </p>
                )}
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-border/60 px-5 py-3.5 bg-muted/10">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isSubmitting}
            className="cursor-pointer"
          >
            Hủy bỏ
          </Button>
          <Button
            type="submit"
            form="edit-schedule-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium cursor-pointer shadow-xs min-w-[120px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang lưu...</span>
              </>
            ) : (
              <span>Lưu thay đổi</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
