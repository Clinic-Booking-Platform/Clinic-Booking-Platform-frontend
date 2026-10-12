import React, { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  Users,
  Plus,
  Loader2,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { cn } from 'cn'
import { scheduleApi } from '@/services/schedule.api'
import {
  TIME_SLOTS,
  getTodayDateString,
  isDateInPast,
  extractErrorMessage,
  doctorSingleCreateScheduleSchema,
} from '@/components/schedule/schedule.utils'
import type { TimeSlotKey } from '@/types/schedule.types'

interface DoctorSingleCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultDate?: string
  defaultTimeSlot?: TimeSlotKey
}

export const DoctorSingleCreateModal: React.FC<DoctorSingleCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDate,
  defaultTimeSlot,
}) => {
  const today = getTodayDateString()
  const [date, setDate] = useState<string>(defaultDate || today)
  const [timeType, setTimeType] = useState<TimeSlotKey>(defaultTimeSlot || 'T1')
  const [maxNumber, setMaxNumber] = useState<number>(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const [prevOpen, setPrevOpen] = useState(false)
  if (isOpen && !prevOpen) {
    setPrevOpen(true)
    const initialDate = defaultDate && !isDateInPast(defaultDate) ? defaultDate : today
    setDate(initialDate)
    setTimeType(defaultTimeSlot || 'T1')
    setMaxNumber(10)
    setErrors({})
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const validation = doctorSingleCreateScheduleSchema.safeParse({
      date,
      time_type: timeType,
      max_number: maxNumber,
    })

    if (!validation.success) {
      const newErrors: Record<string, string> = {}
      validation.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        newErrors[field] = issue.message
      })
      setErrors(newErrors)
      return
    }

    setErrors({})
    setIsSubmitting(true)

    try {
      await scheduleApi.createDoctorSchedule({
        date,
        time_type: timeType,
        max_number: maxNumber,
      })

      toast.success(`Đăng ký ca làm việc ${timeType} ngày ${date} thành công!`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Đăng ký ca làm việc thất bại!'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Plus className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Đăng ký 1 Ca làm việc</h2>
              <p className="text-xs text-muted-foreground">Thêm một khung giờ khám riêng lẻ</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Ngày làm việc */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Calendar className="size-3.5 text-teal-600" />
              <span>Ngày làm việc</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              min={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className={cn(
                'w-full h-10 px-3 rounded-xl border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600',
                errors.date ? 'border-rose-500' : 'border-input'
              )}
            />
            {errors.date && <p className="text-xs text-rose-500">{errors.date}</p>}
          </div>

          {/* Khung giờ khám */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-teal-600" />
              <span>Khung giờ khám</span>
              <span className="text-rose-500">*</span>
            </label>
            <select
              value={timeType}
              onChange={(e) => setTimeType(e.target.value as TimeSlotKey)}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
            >
              <optgroup label="Ca sáng">
                {TIME_SLOTS.filter((s) => s.period === 'morning').map((slot) => (
                  <option key={slot.key} value={slot.key}>
                    {slot.key} ({slot.time}) - Buổi sáng
                  </option>
                ))}
              </optgroup>
              <optgroup label="Ca chiều">
                {TIME_SLOTS.filter((s) => s.period === 'afternoon').map((slot) => (
                  <option key={slot.key} value={slot.key}>
                    {slot.key} ({slot.time}) - Buổi chiều
                  </option>
                ))}
              </optgroup>
            </select>
          </div>

          {/* Số lượng tiếp nhận */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-teal-600" />
              <span>Số bệnh nhân tối đa</span>
              <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              min={1}
              max={100}
              value={maxNumber}
              onChange={(e) => setMaxNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
              className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
            />
            <p className="text-[11px] text-muted-foreground">Mặc định tiếp nhận 10 bệnh nhân.</p>
          </div>

          {/* Footer Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-border/80">
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
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium cursor-pointer gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang đăng ký...</span>
                </>
              ) : (
                <>
                  <Plus className="size-4" />
                  <span>Tạo ca khám</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
