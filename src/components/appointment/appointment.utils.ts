import type { AppointmentStatus } from '@/types/appointment.types'

export interface TimeSlotConfig {
  key: string
  time: string
  period: 'morning' | 'afternoon'
  label: string
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { key: 'T1', time: '08:00 - 09:00', period: 'morning', label: '08:00 - 09:00 (T1)' },
  { key: 'T2', time: '09:00 - 10:00', period: 'morning', label: '09:00 - 10:00 (T2)' },
  { key: 'T3', time: '10:00 - 11:00', period: 'morning', label: '10:00 - 11:00 (T3)' },
  { key: 'T4', time: '11:00 - 12:00', period: 'morning', label: '11:00 - 12:00 (T4)' },
  { key: 'T5', time: '13:00 - 14:00', period: 'afternoon', label: '13:00 - 14:00 (T5)' },
  { key: 'T6', time: '14:00 - 15:00', period: 'afternoon', label: '14:00 - 15:00 (T6)' },
  { key: 'T7', time: '15:00 - 16:00', period: 'afternoon', label: '15:00 - 16:00 (T7)' },
  { key: 'T8', time: '16:00 - 17:00', period: 'afternoon', label: '16:00 - 17:00 (T8)' },
]

export const TIME_SLOT_MAP: Record<string, TimeSlotConfig> = TIME_SLOTS.reduce(
  (acc, slot) => {
    acc[slot.key] = slot
    return acc
  },
  {} as Record<string, TimeSlotConfig>
)

/**
 * Lấy thông tin cấu hình của một khung giờ khám (T1-T8)
 */
export function getTimeSlotInfo(key?: string | null): TimeSlotConfig | null {
  if (!key) return null
  return TIME_SLOT_MAP[key] || null
}

/**
 * Định dạng ngày sang tiếng Việt thân thiện (VD: Thứ Hai, 28/09/2026)
 */
export function formatAppointmentDate(dateStr?: string | null): string {
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
    const weekday = weekdays[d.getDay()]

    const day = String(d.getDate()).padStart(2, '0')
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const year = d.getFullYear()

    return `${weekday}, ${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'

/**
 * Lấy chuỗi ngày YYYY-MM-DD chuẩn theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7)
 */
export function getVietnamDateString(date: Date = new Date()): string {
  try {
    return new Intl.DateTimeFormat('en-CA', {
      timeZone: VIETNAM_TIMEZONE,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).format(date)
  } catch {
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    return `${y}-${m}-${d}`
  }
}

/**
 * Lấy chuỗi ngày YYYY-MM-DD chênh lệch số ngày so với hôm nay theo múi giờ Việt Nam
 */
export function getVietnamDaysOffsetString(days: number): string {
  const target = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
  return getVietnamDateString(target)
}

/**
 * Định dạng ngày ngắn gọn DD/MM/YYYY chuẩn múi giờ Việt Nam (chỉ hiển thị)
 */
export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    // Nếu dateStr là định dạng ngày thuần YYYY-MM-DD, tách trực tiếp tránh lệch ngày do múi giờ client
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
 * Định dạng ngày giờ đầy đủ DD/MM/YYYY HH:mm chuẩn múi giờ Việt Nam (chỉ hiển thị)
 */
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    const parts = new Intl.DateTimeFormat('vi-VN', {
      timeZone: VIETNAM_TIMEZONE,
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(d)

    const day = parts.find((p) => p.type === 'day')?.value || ''
    const month = parts.find((p) => p.type === 'month')?.value || ''
    const year = parts.find((p) => p.type === 'year')?.value || ''
    const hour = parts.find((p) => p.type === 'hour')?.value || ''
    const minute = parts.find((p) => p.type === 'minute')?.value || ''

    return `${hour}:${minute} ${day}/${month}/${year}`
  } catch {
    return dateStr
  }
}

/**
 * Badge tương đối theo ngày (Hôm nay, Ngày mai, Đã qua)
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
 * Cấu hình Badge cho trạng thái lịch hẹn
 */
export function getStatusBadgeConfig(status: AppointmentStatus): {
  label: string
  classes: string
  dotClass: string
} {
  switch (status) {
    case 'PENDING':
      return {
        label: 'Chờ duyệt',
        classes: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
        dotClass: 'bg-amber-500',
      }
    case 'CONFIRMED':
      return {
        label: 'Đã xác nhận',
        classes: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
        dotClass: 'bg-blue-500',
      }
    case 'COMPLETED':
      return {
        label: 'Đã hoàn thành',
        classes: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500',
      }
    case 'CANCELLED':
      return {
        label: 'Đã hủy',
        classes: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
        dotClass: 'bg-rose-500',
      }
    case 'NO_SHOW':
      return {
        label: 'Vắng mặt',
        classes: 'bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-500/30',
        dotClass: 'bg-slate-500',
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
 * Cấu hình Badge cho hình thức khám
 */
export function getAppointmentTypeBadge(type?: string | null): {
  label: string
  classes: string
} {
  if (type === 'ONLINE') {
    return {
      label: 'Trực tuyến',
      classes: 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30',
    }
  }
  return {
    label: 'Trực tiếp',
    classes: 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30',
  }
}

/**
 * Kiểm tra xem lịch hẹn có được phép hủy hay không
 * Backend Rule: Chỉ được phép hủy khi trạng thái là PENDING hoặc CONFIRMED
 */
export function canCancelAppointment(status: AppointmentStatus): boolean {
  return status === 'PENDING' || status === 'CONFIRMED'
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
