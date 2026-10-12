import React, { useState } from 'react'
import {
  X,
  Calendar,
  Clock,
  Layers,
  Users,
  Check,
  Loader2,
  Sparkles,
  Sun,
  Moon,
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
  doctorBulkCreateScheduleSchema,
} from '@/components/schedule/schedule.utils'
import type { TimeSlotKey } from '@/types/schedule.types'

interface DoctorBulkCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  defaultDate?: string
}

export const DoctorBulkCreateModal: React.FC<DoctorBulkCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultDate,
}) => {
  const today = getTodayDateString()
  const [date, setDate] = useState<string>(defaultDate || today)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotKey[]>([
    'T1',
    'T2',
    'T3',
    'T4',
    'T5',
    'T6',
    'T7',
    'T8',
  ])
  const [maxNumber, setMaxNumber] = useState<number>(10)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Đồng bộ ngày khi mở modal
  const [prevOpen, setPrevOpen] = useState(false)
  if (isOpen && !prevOpen) {
    setPrevOpen(true)
    const initialDate = defaultDate && !isDateInPast(defaultDate) ? defaultDate : today
    setDate(initialDate)
    setSelectedSlots(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'])
    setMaxNumber(10)
    setErrors({})
  } else if (!isOpen && prevOpen) {
    setPrevOpen(false)
  }

  // Phím tắt chọn nhanh ca
  const handleSelectAll = () => {
    setSelectedSlots(['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8'])
  }

  const handleSelectMorning = () => {
    setSelectedSlots(['T1', 'T2', 'T3', 'T4'])
  }

  const handleSelectAfternoon = () => {
    setSelectedSlots(['T5', 'T6', 'T7', 'T8'])
  }

  const handleClearAll = () => {
    setSelectedSlots([])
  }

  const toggleSlot = (key: TimeSlotKey) => {
    setSelectedSlots((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validate
    const validation = doctorBulkCreateScheduleSchema.safeParse({
      date,
      time_types: selectedSlots,
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
      const res = await scheduleApi.bulkCreateDoctorSchedule({
        date,
        time_types: selectedSlots,
        max_number: maxNumber,
      })

      const createdCount = res.data?.created?.length ?? 0
      const skipped = res.data?.skipped ?? []

      if (skipped.length > 0) {
        toast.warning(
          `Đã tạo thành công ${createdCount} ca mới. Có ${skipped.length} ca đã tồn tại (${skipped.join(
            ', '
          )}) nên được tự động bỏ qua.`
        )
      } else {
        toast.success(`Tạo thành công toàn bộ ${createdCount || selectedSlots.length} ca làm việc!`)
      }

      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Đăng ký ca làm việc hàng loạt thất bại!'))
    } finally {
      setIsSubmitting(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-card border border-border/80 rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/80 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Layers className="size-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">Đăng ký Ca khám Hàng loạt</h2>
              <p className="text-xs text-muted-foreground">
                Tạo nhanh nhiều khung giờ khám trong 1 ngày làm việc
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Field 1: Ngày làm việc */}
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
            <p className="text-[11px] text-muted-foreground">
              Hệ thống không cho phép đăng ký lịch cho ngày trong quá khứ.
            </p>
          </div>

          {/* Field 2: Chọn khung giờ (Time slots) */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Clock className="size-3.5 text-teal-600" />
                <span>Khung giờ khám ({selectedSlots.length}/8 ca đã chọn)</span>
                <span className="text-rose-500">*</span>
              </label>

              {/* Nút chọn nhanh */}
              <div className="flex flex-wrap items-center gap-1">
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-700 hover:bg-teal-500/20 font-medium cursor-pointer"
                >
                  Cả ngày
                </button>
                <button
                  type="button"
                  onClick={handleSelectMorning}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-amber-500/10 text-amber-700 hover:bg-amber-500/20 font-medium cursor-pointer"
                >
                  Ca sáng
                </button>
                <button
                  type="button"
                  onClick={handleSelectAfternoon}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-cyan-500/10 text-cyan-700 hover:bg-cyan-500/20 font-medium cursor-pointer"
                >
                  Ca chiều
                </button>
                <button
                  type="button"
                  onClick={handleClearAll}
                  className="text-[11px] px-2 py-0.5 rounded-lg bg-muted text-muted-foreground hover:bg-muted/80 font-medium cursor-pointer"
                >
                  Bỏ chọn
                </button>
              </div>
            </div>

            {/* Grid 8 ca khám */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {TIME_SLOTS.map((slot) => {
                const isSelected = selectedSlots.includes(slot.key)
                const isMorning = slot.period === 'morning'

                return (
                  <button
                    key={slot.key}
                    type="button"
                    onClick={() => toggleSlot(slot.key)}
                    className={cn(
                      'p-2.5 rounded-xl border text-left transition-all relative flex flex-col justify-between cursor-pointer',
                      isSelected
                        ? 'border-teal-600 bg-teal-500/10 dark:bg-teal-950/40 text-teal-950 dark:text-teal-100 ring-1 ring-teal-600'
                        : 'border-border/80 bg-card hover:bg-muted/30 text-muted-foreground'
                    )}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{slot.key}</span>
                      <div
                        className={cn(
                          'size-4 rounded-full flex items-center justify-center text-[10px]',
                          isSelected ? 'bg-teal-600 text-white' : 'border border-border'
                        )}
                      >
                        {isSelected && <Check className="size-3" />}
                      </div>
                    </div>
                    <div className="text-[11px] font-medium mt-1">{slot.time}</div>
                    <div className="flex items-center gap-1 text-[10px] text-muted-foreground mt-0.5">
                      {isMorning ? <Sun className="size-2.5" /> : <Moon className="size-2.5" />}
                      <span>{isMorning ? 'Sáng' : 'Chiều'}</span>
                    </div>
                  </button>
                )
              })}
            </div>
            {errors.time_types && <p className="text-xs text-rose-500">{errors.time_types}</p>}
          </div>

          {/* Field 3: Số lượng tiếp nhận tối đa */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Users className="size-3.5 text-teal-600" />
              <span>Số bệnh nhân tối đa mỗi ca</span>
              <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={100}
                value={maxNumber}
                onChange={(e) => setMaxNumber(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-full h-10 px-3 rounded-xl border border-input bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Định mức tiêu chuẩn từ 1 đến 100 bệnh nhân cho mỗi khung giờ (mặc định 10).
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/80 bg-muted/20">
          <div className="text-xs text-muted-foreground">
            Sẽ tạo <span className="font-bold text-foreground">{selectedSlots.length}</span> ca làm việc
          </div>

          <div className="flex items-center gap-2">
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
              onClick={handleSubmit}
              disabled={isSubmitting || selectedSlots.length === 0}
              className="bg-teal-600 hover:bg-teal-700 text-white font-medium cursor-pointer gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  <span>Đang xử lý...</span>
                </>
              ) : (
                <>
                  <Sparkles className="size-4" />
                  <span>Xác nhận đăng ký</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
