import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Clock,
  UserCheck,
  Users,
  Sun,
  Moon,
  Check,
  Loader2,
  AlertCircle,
  CalendarPlus,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { scheduleApi } from '@/services/schedule.api'
import { doctorApi } from '@/services/doctor.api'
import {
  TIME_SLOTS,
  getTodayDateString,
  bulkCreateScheduleSchema,
  extractErrorMessage,
} from './schedule.utils'
import type { TimeSlotKey } from '@/types/schedule.types'
import type { Doctor } from '@/types/doctor.types'

interface ScheduleCreateModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  doctors?: Doctor[]
  defaultDoctorId?: number
  defaultDate?: string
}

export const ScheduleCreateModal: React.FC<ScheduleCreateModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  doctors,
  defaultDoctorId,
  defaultDate,
}) => {
  const todayStr = getTodayDateString()

  // Form State
  const [doctorId, setDoctorId] = useState<number | ''>(defaultDoctorId || '')
  const [date, setDate] = useState<string>(defaultDate || todayStr)
  const [selectedSlots, setSelectedSlots] = useState<TimeSlotKey[]>([])
  const [maxNumber, setMaxNumber] = useState<number | ''>(10)

  // Doctor options state (Fetched with all: true & status: 'active')
  const [fetchedDoctors, setFetchedDoctors] = useState<Doctor[]>([])
  const doctorOptions = doctors && doctors.length > 0 ? doctors : fetchedDoctors
  const isLoadingDoctors =
    isOpen && (!doctors || doctors.length === 0) && fetchedDoctors.length === 0

  // Fetch 100% active doctors whenever modal opens (nếu props doctors chưa có)
  useEffect(() => {
    if (!isOpen || (doctors && doctors.length > 0)) return

    let isMounted = true
    doctorApi
      .getDoctors({
        status: 'active',
        all: true, // <-- Bắt buộc để lấy toàn bộ danh sách bác sĩ
      })
      .then((res) => {
        if (isMounted) {
          const list = res.doctors || res.data?.doctors || []
          setFetchedDoctors(list)
        }
      })
      .catch((err) => {
        console.error('Không thể tải danh sách bác sĩ cho form tạo lịch:', err)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, doctors])

  // Errors state (Strictly inline errors, NO validation toasts)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen)
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen)
    if (isOpen) {
      setDoctorId(
        defaultDoctorId ||
          (doctorOptions.length > 0
            ? doctorOptions[0].id
            : doctors && doctors.length > 0
              ? doctors[0].id
              : '')
      )
      setDate(defaultDate || todayStr)
      setSelectedSlots([])
      setMaxNumber(10)
      setErrors({})
    }
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

  if (!isOpen) return null

  // Slot Toggling
  const handleToggleSlot = (slotKey: TimeSlotKey) => {
    if (errors.time_types) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next.time_types
        return next
      })
    }
    setSelectedSlots((prev) =>
      prev.includes(slotKey) ? prev.filter((k) => k !== slotKey) : [...prev, slotKey]
    )
  }

  // Quick Slot Selectors
  const morningSlots: TimeSlotKey[] = ['T1', 'T2', 'T3', 'T4']
  const afternoonSlots: TimeSlotKey[] = ['T5', 'T6', 'T7', 'T8']
  const allSlots: TimeSlotKey[] = [...morningSlots, ...afternoonSlots]

  const handleSelectMorning = () => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next.time_types
      return next
    })
    setSelectedSlots((prev) => Array.from(new Set([...prev, ...morningSlots])))
  }

  const handleSelectAfternoon = () => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next.time_types
      return next
    })
    setSelectedSlots((prev) => Array.from(new Set([...prev, ...afternoonSlots])))
  }

  const handleSelectAll = () => {
    setErrors((prev) => {
      const next = { ...prev }
      delete next.time_types
      return next
    })
    setSelectedSlots(allSlots)
  }

  const handleClearSlots = () => {
    setSelectedSlots([])
  }

  // Quick Date Selectors
  const handleQuickTomorrow = () => {
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const y = tomorrow.getFullYear()
    const m = String(tomorrow.getMonth() + 1).padStart(2, '0')
    const d = String(tomorrow.getDate()).padStart(2, '0')
    setDate(`${y}-${m}-${d}`)
  }

  // Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const parseResult = bulkCreateScheduleSchema.safeParse({
      doctor_id: doctorId === '' ? undefined : doctorId,
      date,
      time_types: selectedSlots,
      max_number: maxNumber === '' ? undefined : maxNumber,
    })

    if (!parseResult.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of parseResult.error.issues) {
        const path = issue.path[0] as string
        if (path && !fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    setIsSubmitting(true)
    try {
      const payload = {
        doctor_id: Number(doctorId),
        date,
        time_types: selectedSlots,
        max_number: Number(maxNumber) || 10,
      }
      const res = await scheduleApi.bulkCreateSchedule(payload)
      const count = res.data?.created_count ?? res.data?.count ?? selectedSlots.length
      toast.success(`Đã xếp thành công ${count} ca làm việc cho bác sĩ!`)
      onSuccess()
      onClose()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Tạo ca làm việc thất bại, vui lòng thử lại!'))
    } finally {
      setIsSubmitting(false)
    }
  }

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
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-2.5">
            <div className="rounded-lg bg-teal-500/10 p-2 text-teal-600 dark:text-teal-400">
              <CalendarPlus className="size-5" />
            </div>
            <div>
              <h2 className="font-semibold text-base sm:text-lg text-foreground">
                Tạo lịch làm việc cho Bác sĩ
              </h2>
              <p className="text-xs text-muted-foreground">
                Phân bổ ca khám sáng/chiều và định mức tiếp nhận bệnh nhân cho từng ca
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
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">
          <form id="create-schedule-form" onSubmit={handleSubmit} className="space-y-5">
            {/* 1. Chọn Bác sĩ phụ trách */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <UserCheck className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    Bác sĩ phụ trách <span className="text-rose-500">*</span>
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  {isLoadingDoctors && <Loader2 className="size-3 animate-spin text-teal-600" />}
                  <span>Tổng {doctorOptions.length} bác sĩ khả dụng</span>
                </span>
              </label>

              <select
                value={doctorId !== '' ? String(doctorId) : ''}
                disabled={isLoadingDoctors && doctorOptions.length === 0}
                onChange={(e) => {
                  setDoctorId(e.target.value ? Number(e.target.value) : '')
                  if (errors.doctor_id) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.doctor_id
                      return next
                    })
                  }
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer ${
                  errors.doctor_id
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-border/80 focus:border-teal-500'
                }`}
              >
                <option value="">
                  {isLoadingDoctors && doctorOptions.length === 0
                    ? '-- Đang tải danh sách bác sĩ... --'
                    : '-- Chọn bác sĩ trực ca --'}
                </option>
                {doctorOptions.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.user?.full_name || `Bác sĩ #${doc.id}`}
                    {doc.specialty ? ` — Chuyên khoa: ${doc.specialty.name}` : ''}
                  </option>
                ))}
              </select>

              {errors.doctor_id && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.doctor_id}</span>
                </p>
              )}
            </div>

            {/* 2. Chọn Ngày làm việc */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    Ngày làm việc <span className="text-rose-500">*</span>
                  </span>
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setDate(todayStr)}
                    className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Hôm nay
                  </button>
                  <span className="text-muted-foreground/40">•</span>
                  <button
                    type="button"
                    onClick={handleQuickTomorrow}
                    className="text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                  >
                    Ngày mai
                  </button>
                </div>
              </div>

              <input
                type="date"
                min={todayStr}
                value={date}
                onChange={(e) => {
                  setDate(e.target.value)
                  if (errors.date) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.date
                      return next
                    })
                  }
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer ${
                  errors.date
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-border/80 focus:border-teal-500'
                }`}
              />

              {errors.date && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.date}</span>
                </p>
              )}
            </div>

            {/* 3. Chọn Khung giờ khám (Time Slots Map) */}
            <div className="space-y-3 rounded-xl border border-border/80 bg-muted/20 p-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Clock className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    Khung giờ khám bệnh <span className="text-rose-500">*</span>
                  </span>
                  <span className="text-[11px] font-normal text-muted-foreground ml-1">
                    (Đã chọn {selectedSlots.length}/8 ca)
                  </span>
                </label>

                {/* Tiện ích chọn nhanh */}
                <div className="flex flex-wrap items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={handleSelectMorning}
                    className="px-2 py-0.5 rounded bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-400 font-medium transition-colors cursor-pointer"
                  >
                    Chọn cả sáng
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAfternoon}
                    className="px-2 py-0.5 rounded bg-blue-500/10 hover:bg-blue-500/20 text-blue-700 dark:text-blue-400 font-medium transition-colors cursor-pointer"
                  >
                    Chọn cả chiều
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectAll}
                    className="px-2 py-0.5 rounded bg-teal-500/10 hover:bg-teal-500/20 text-teal-700 dark:text-teal-400 font-medium transition-colors cursor-pointer"
                  >
                    Cả ngày
                  </button>
                  {selectedSlots.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearSlots}
                      className="px-2 py-0.5 rounded hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                    >
                      Bỏ chọn
                    </button>
                  )}
                </div>
              </div>

              {/* Ca Sáng (T1 - T4) */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
                  <Sun className="size-3.5" />
                  <span>Ca buổi sáng (08:00 - 12:00)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.filter((s) => s.period === 'morning').map((slot) => {
                    const isSelected = selectedSlots.includes(slot.key)
                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => handleToggleSlot(slot.key)}
                        className={`flex items-center justify-between rounded-lg border p-2.5 text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold ring-1 ring-teal-500/30'
                            : 'border-border/70 bg-background hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold">{slot.key}</span>
                          <span className="text-[11px] text-muted-foreground">{slot.time}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-teal-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Ca Chiều (T5 - T8) */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 dark:text-blue-400">
                  <Moon className="size-3.5" />
                  <span>Ca buổi chiều (13:00 - 17:00)</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {TIME_SLOTS.filter((s) => s.period === 'afternoon').map((slot) => {
                    const isSelected = selectedSlots.includes(slot.key)
                    return (
                      <button
                        key={slot.key}
                        type="button"
                        onClick={() => handleToggleSlot(slot.key)}
                        className={`flex items-center justify-between rounded-lg border p-2.5 text-xs font-medium transition-all cursor-pointer ${
                          isSelected
                            ? 'border-teal-500 bg-teal-500/10 text-teal-700 dark:text-teal-300 font-semibold ring-1 ring-teal-500/30'
                            : 'border-border/70 bg-background hover:bg-muted/60 text-foreground'
                        }`}
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-semibold">{slot.key}</span>
                          <span className="text-[11px] text-muted-foreground">{slot.time}</span>
                        </div>
                        {isSelected && <Check className="size-4 text-teal-600 shrink-0" />}
                      </button>
                    )
                  })}
                </div>
              </div>

              {errors.time_types && (
                <p className="text-xs text-rose-500 flex items-center gap-1 pt-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.time_types}</span>
                </p>
              )}
            </div>

            {/* 4. Số lượng bệnh nhân tối đa mỗi ca (max_number) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Users className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>
                    Số lượng bệnh nhân tối đa mỗi ca <span className="text-rose-500">*</span>
                  </span>
                </span>
                <span className="text-[11px] text-muted-foreground">Khoảng 1 - 100 bệnh nhân</span>
              </label>

              <input
                type="number"
                min="1"
                max="100"
                value={maxNumber}
                onChange={(e) => {
                  const val = e.target.value
                  setMaxNumber(val === '' ? '' : parseInt(val, 10))
                  if (errors.max_number) {
                    setErrors((prev) => {
                      const next = { ...prev }
                      delete next.max_number
                      return next
                    })
                  }
                }}
                className={`w-full rounded-xl border px-3.5 py-2.5 text-xs sm:text-sm bg-background text-foreground transition-all outline-none focus:ring-2 focus:ring-teal-500/20 ${
                  errors.max_number
                    ? 'border-rose-500 focus:border-rose-500'
                    : 'border-border/80 focus:border-teal-500'
                }`}
              />

              <p className="text-[11px] text-muted-foreground">
                Định mức số lượt đặt khám tối đa trong mỗi khung giờ 60 phút (mặc định 10 bệnh nhân)
              </p>

              {errors.max_number && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="size-3.5 shrink-0" />
                  <span>{errors.max_number}</span>
                </p>
              )}
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
            form="create-schedule-form"
            size="sm"
            disabled={isSubmitting}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white font-medium cursor-pointer shadow-xs min-w-[130px]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                <span>Đang tạo lịch...</span>
              </>
            ) : (
              <span>Tạo {selectedSlots.length > 0 ? `${selectedSlots.length} ca` : 'lịch'}</span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
