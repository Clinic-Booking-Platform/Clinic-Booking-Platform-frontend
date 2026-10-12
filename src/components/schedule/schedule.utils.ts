import { z } from 'zod'
import {
  TIME_SLOTS,
  TIME_SLOT_MAP,
  type TimeSlotKey,
  type ScheduleStatus,
} from '@/types/schedule.types'

/**
 * Lấy thông tin cấu hình của một khung giờ khám
 */
export function getTimeSlotInfo(key?: string | null) {
  if (!key) return null
  return TIME_SLOT_MAP[key as TimeSlotKey] || null
}

/**
 * Lấy chuỗi ngày hôm nay theo định dạng chuẩn YYYY-MM-DD
 */
export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'

export function getTodayDateString(): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date())
  } catch {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }
}

/**
 * Lấy ngày chênh lệch N ngày so với hôm nay theo múi giờ Việt Nam
 */
export function getDaysOffsetDateString(days: number): string {
  const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(target)
  } catch {
    return getTodayDateString()
  }
}

/**
 * Định dạng ngày tháng kèm thứ sang tiếng Việt thân thiện theo múi giờ Việt Nam (chỉ hiển thị)
 * Ví dụ: "2026-09-28" -> "Thứ Hai, 28/09/2026"
 */
export function formatScheduleDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr

    const weekdays = [
      'Chủ Nhật',
      'Thứ Hai',
      'Thứ Ba',
      'Thứ Tư',
      'Thứ Năm',
      'Thứ Sáu',
      'Thứ Bảy',
    ]

    // Lấy thứ và ngày tháng theo múi giờ Việt Nam
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: VIETNAM_TIMEZONE,
      weekday: 'short',
    })
    const dayOfWeekStr = formatter.format(d)
    const dayOfWeekMap: Record<string, string> = {
      Sun: 'Chủ Nhật',
      Mon: 'Thứ Hai',
      Tue: 'Thứ Ba',
      Wed: 'Thứ Tư',
      Thu: 'Thứ Năm',
      Fri: 'Thứ Sáu',
      Sat: 'Thứ Bảy',
    }
    const weekday = dayOfWeekMap[dayOfWeekStr] || weekdays[d.getDay()]

    const parts = new Intl.DateTimeFormat('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).formatToParts(d)

    const day = parts.find((p) => p.type === 'day')?.value || ''
    const month = parts.find((p) => p.type === 'month')?.value || ''
    const year = parts.find((p) => p.type === 'year')?.value || ''

    return `${weekday}, ${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

/**
 * Định dạng ngày ngắn gọn (DD/MM/YYYY) chuẩn múi giờ Việt Nam (chỉ hiển thị)
 */
export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [y, m, d] = dateStr.split('-')
      return `${d}/${m}/${y}`
    }
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return new Intl.DateTimeFormat('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    }).format(d)
  } catch {
    return dateStr
  }
}

/**
 * Xác định nhãn tương đối của ngày (Hôm nay, Ngày mai, Đã qua)
 */
export function getRelativeDateBadge(dateStr?: string | null): {
  label: string
  className: string
} | null {
  if (!dateStr) return null
  try {
    const target = new Date(dateStr)
    if (isNaN(target.getTime())) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const targetDateOnly = new Date(target)
    targetDateOnly.setHours(0, 0, 0, 0)

    const diffDays = Math.round(
      (targetDateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    )

    if (diffDays === 0) {
      return {
        label: 'Hôm nay',
        className: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
      }
    }
    if (diffDays === 1) {
      return {
        label: 'Ngày mai',
        className: 'bg-blue-500/15 text-blue-700 dark:text-blue-300 border-blue-500/30',
      }
    }
    if (diffDays < 0) {
      return {
        label: 'Đã qua',
        className: 'bg-muted text-muted-foreground border-border/60',
      }
    }
    return null
  } catch {
    return null
  }
}

/**
 * Cấu hình hiển thị Badge trạng thái ca làm việc
 */
export function getStatusBadgeConfig(status: ScheduleStatus): {
  label: string
  classes: string
  dotClass: string
} {
  switch (status) {
    case 'AVAILABLE':
      return {
        label: 'Còn chỗ',
        classes:
          'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20',
        dotClass: 'bg-emerald-500',
      }
    case 'FULL':
      return {
        label: 'Đã đầy',
        classes: 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20',
        dotClass: 'bg-amber-500',
      }
    case 'CANCELLED':
      return {
        label: 'Đã hủy ca',
        classes: 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/20',
        dotClass: 'bg-rose-500',
      }
    default:
      return {
        label: status,
        classes: 'bg-muted text-muted-foreground border-border/60',
        dotClass: 'bg-muted-foreground',
      }
  }
}

/**
 * Tính tỉ lệ phần trăm số bệnh nhân đã đặt
 */
export function getOccupancyPercentage(current: number = 0, max: number = 10): number {
  if (max <= 0) return 0
  const pct = Math.round((current / max) * 100)
  return Math.min(100, Math.max(0, pct))
}

/**
 * Màu sắc thanh tiến độ tiếp nhận theo tỉ lệ
 */
export function getProgressBarColor(percentage: number): string {
  if (percentage >= 100) return 'bg-rose-500'
  if (percentage >= 70) return 'bg-amber-500'
  return 'bg-emerald-500'
}

/**
 * Trích xuất chuỗi thông báo lỗi chi tiết từ Axios Error response
 */
export function extractErrorMessage(
  error: unknown,
  fallbackMessage: string = 'Đã xảy ra lỗi, vui lòng thử lại!'
): string {
  const err = error as {
    response?: {
      data?: {
        message?: string | string[]
        error?: string
      }
    }
    message?: string
  }

  const responseData = err?.response?.data
  if (responseData) {
    if (Array.isArray(responseData.message) && responseData.message.length > 0) {
      return responseData.message.join('. ')
    }
    if (typeof responseData.message === 'string' && responseData.message.trim()) {
      return responseData.message.trim()
    }
    if (typeof responseData.error === 'string' && responseData.error.trim()) {
      return responseData.error.trim()
    }
  }

  if (typeof err?.message === 'string' && err.message.trim()) {
    return err.message.trim()
  }

  return fallbackMessage
}

/**
 * Zod Schema cho tạo lịch hàng loạt (Bulk Create)
 */
export const bulkCreateScheduleSchema = z.object({
  doctor_id: z
    .number()
    .int()
    .positive({ message: 'Vui lòng chọn bác sĩ phụ trách' }),
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Ngày làm việc không hợp lệ (định dạng chuẩn YYYY-MM-DD)',
    }),
  time_types: z
    .array(z.string())
    .min(1, { message: 'Vui lòng chọn ít nhất một khung giờ khám' }),
  max_number: z
    .number()
    .int({ message: 'Số lượng tiếp nhận phải là số nguyên' })
    .min(1, { message: 'Số lượng bệnh nhân tối thiểu là 1' })
    .max(100, { message: 'Số lượng bệnh nhân tối đa không vượt quá 100' })
    .default(10),
})

/**
 * Zod Schema cho chỉnh sửa ca làm việc
 */
export const updateScheduleSchema = z.object({
  max_number: z
    .number()
    .int({ message: 'Số lượng tiếp nhận phải là số nguyên' })
    .min(1, { message: 'Số lượng bệnh nhân tối thiểu là 1' })
    .max(100, { message: 'Số lượng bệnh nhân tối đa không vượt quá 100' }),
  status: z.enum(['AVAILABLE', 'FULL', 'CANCELLED']),
})

export type BulkCreateScheduleFormValues = z.infer<typeof bulkCreateScheduleSchema>
export type UpdateScheduleFormValues = z.infer<typeof updateScheduleSchema>

/**
 * Chuẩn hóa chuỗi ngày tháng bất kỳ thành định dạng YYYY-MM-DD
 */
export function normalizeDateStringToYMD(dateStr?: string | null): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}/.test(dateStr)) {
    return dateStr.slice(0, 10)
  }
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(new Date(dateStr))
  } catch {
    return dateStr.slice(0, 10)
  }
}

/**
 * Kiểm tra xem ngày có ở trong quá khứ không (theo ngày hiện tại múi giờ VN)
 */
export function isDateInPast(dateStr?: string | null): boolean {
  if (!dateStr) return false
  const ymd = normalizeDateStringToYMD(dateStr)
  const today = getTodayDateString()
  return ymd < today
}

export interface WeekDayInfo {
  dateString: string // YYYY-MM-DD
  dayName: string // 'Thứ Hai', 'Thứ Ba', ..., 'Chủ Nhật'
  shortDayName: string // 'T2', 'T3', ..., 'CN'
  shortDate: string // '12/10'
  isToday: boolean
  isPast: boolean
  fullDateFormatted: string // 'Thứ Hai, 12/10/2026'
}

/**
 * Lấy danh sách 7 ngày trong tuần (Thứ 2 đến Chủ nhật) chứa ngày tham chiếu
 */
export function getWeekDays(referenceDate?: Date | string): WeekDayInfo[] {
  let ref: Date
  if (typeof referenceDate === 'string') {
    const ymd = normalizeDateStringToYMD(referenceDate)
    const [y, m, d] = ymd.split('-').map(Number)
    ref = new Date(y, m - 1, d, 12, 0, 0)
  } else if (referenceDate instanceof Date) {
    ref = new Date(referenceDate)
  } else {
    ref = new Date()
  }

  // dayOfWeek: 0 (Sun), 1 (Mon), ..., 6 (Sat)
  const dayOfWeek = ref.getDay()
  const distanceToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1

  const monday = new Date(ref)
  monday.setDate(ref.getDate() - distanceToMonday)

  const todayYMD = getTodayDateString()
  const days: WeekDayInfo[] = []

  const dayNames = [
    'Thứ Hai',
    'Thứ Ba',
    'Thứ Tư',
    'Thứ Năm',
    'Thứ Sáu',
    'Thứ Bảy',
    'Chủ Nhật',
  ]
  const shortDayNames = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

  for (let i = 0; i < 7; i++) {
    const current = new Date(monday)
    current.setDate(monday.getDate() + i)

    const year = current.getFullYear()
    const month = String(current.getMonth() + 1).padStart(2, '0')
    const day = String(current.getDate()).padStart(2, '0')
    const dateString = `${year}-${month}-${day}`

    const isToday = dateString === todayYMD
    const isPast = dateString < todayYMD

    days.push({
      dateString,
      dayName: dayNames[i],
      shortDayName: shortDayNames[i],
      shortDate: `${day}/${month}`,
      isToday,
      isPast,
      fullDateFormatted: `${dayNames[i]}, ${day}/${month}/${year}`,
    })
  }

  return days
}

/**
 * Chuỗi hiển thị khoảng ngày của tuần, ví dụ "12/10/2026 - 18/10/2026"
 */
export function getWeekRangeDisplay(referenceDate?: Date | string): string {
  const weekDays = getWeekDays(referenceDate)
  const start = weekDays[0]
  const end = weekDays[6]
  return `${formatShortDate(start.dateString)} - ${formatShortDate(end.dateString)}`
}

/**
 * Schema đăng ký hàng loạt ca làm việc dành cho Bác sĩ
 * Backend tự nhận diện doctor_id theo Token JWT
 */
export const doctorBulkCreateScheduleSchema = z.object({
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Ngày làm việc không hợp lệ (định dạng chuẩn YYYY-MM-DD)',
    })
    .refine((val) => !isDateInPast(val), {
      message: 'Không thể đăng ký lịch làm việc cho ngày trong quá khứ',
    }),
  time_types: z
    .array(z.string())
    .min(1, { message: 'Vui lòng chọn ít nhất một khung giờ khám' }),
  max_number: z
    .number()
    .int({ message: 'Số lượng tiếp nhận phải là số nguyên' })
    .min(1, { message: 'Số lượng bệnh nhân tối thiểu là 1' })
    .max(100, { message: 'Số lượng bệnh nhân tối đa không vượt quá 100' })
    .default(10),
})

/**
 * Schema đăng ký 1 ca đơn lẻ dành cho Bác sĩ
 */
export const doctorSingleCreateScheduleSchema = z.object({
  date: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, {
      message: 'Ngày làm việc không hợp lệ (định dạng chuẩn YYYY-MM-DD)',
    })
    .refine((val) => !isDateInPast(val), {
      message: 'Không thể đăng ký lịch làm việc cho ngày trong quá khứ',
    }),
  time_type: z.string().min(1, { message: 'Vui lòng chọn khung giờ khám' }),
  max_number: z
    .number()
    .int({ message: 'Số lượng tiếp nhận phải là số nguyên' })
    .min(1, { message: 'Số lượng bệnh nhân tối thiểu là 1' })
    .max(100, { message: 'Số lượng bệnh nhân tối đa không vượt quá 100' })
    .default(10),
})

export type DoctorBulkCreateFormValues = z.infer<typeof doctorBulkCreateScheduleSchema>
export type DoctorSingleCreateFormValues = z.infer<typeof doctorSingleCreateScheduleSchema>

export { TIME_SLOTS, TIME_SLOT_MAP }

