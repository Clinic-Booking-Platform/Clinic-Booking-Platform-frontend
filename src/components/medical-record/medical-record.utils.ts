// ================= FILE: src/components/medical-record/medical-record.utils.ts =================

export interface TimeSlotConfig {
  key: string
  time: string
  period: 'morning' | 'afternoon'
  label: string
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { key: 'T1', time: '08:00 - 09:00', period: 'morning', label: 'T1 (08:00 - 09:00)' },
  { key: 'T2', time: '09:00 - 10:00', period: 'morning', label: 'T2 (09:00 - 10:00)' },
  { key: 'T3', time: '10:00 - 11:00', period: 'morning', label: 'T3 (10:00 - 11:00)' },
  { key: 'T4', time: '11:00 - 12:00', period: 'morning', label: 'T4 (11:00 - 12:00)' },
  { key: 'T5', time: '13:00 - 14:00', period: 'afternoon', label: 'T5 (13:00 - 14:00)' },
  { key: 'T6', time: '14:00 - 15:00', period: 'afternoon', label: 'T6 (14:00 - 15:00)' },
  { key: 'T7', time: '15:00 - 16:00', period: 'afternoon', label: 'T7 (15:00 - 16:00)' },
  { key: 'T8', time: '16:00 - 17:00', period: 'afternoon', label: 'T8 (16:00 - 17:00)' },
]

export const TIME_SLOT_MAP: Record<string, TimeSlotConfig> = TIME_SLOTS.reduce(
  (acc, slot) => {
    acc[slot.key] = slot
    return acc
  },
  {} as Record<string, TimeSlotConfig>
)

/**
 * Lấy nhãn ca khám: VD: "T1 (08:00 - 09:00)"
 */
export function formatTimeSlot(timeType?: string | null): string {
  if (!timeType) return 'N/A'
  const config = TIME_SLOT_MAP[timeType]
  return config ? config.label : timeType
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
 * Trích xuất chuỗi ngày YYYY-MM-DD theo múi giờ Việt Nam (Asia/Ho_Chi_Minh - GMT+7)
 */
export function extractVietnamDateOnly(dateStr?: string | null): string {
  if (!dateStr) return ''
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
    return dateStr
  }
  try {
    const d = new Date(dateStr)
    if (!isNaN(d.getTime())) {
      return getVietnamDateString(d)
    }
  } catch {
    // fallback
  }
  return dateStr.slice(0, 10)
}

/**
 * Định dạng ngày sang DD/MM/YYYY chuẩn múi giờ Việt Nam (chỉ hiển thị)
 */
export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
  try {
    // Nếu dateStr là định dạng ngày thuần YYYY-MM-DD, tách trực tiếp tránh lệch ngày
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
 * Định dạng ngày giờ DD/MM/YYYY HH:mm chuẩn múi giờ Việt Nam (chỉ hiển thị)
 */
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return '—'
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
 * Dịch giới tính sang tiếng Việt
 */
export function formatGender(gender?: string | null): string {
  if (!gender) return '—'
  const g = gender.toLowerCase()
  if (g === 'male' || g === 'm' || g === 'nam') return 'Nam'
  if (g === 'female' || g === 'f' || g === 'nữ' || g === 'nu') return 'Nữ'
  return 'Khác'
}

/**
 * Trích xuất câu thông báo lỗi
 */
export function extractErrorMessage(err: unknown, defaultMsg: string): string {
  if (err && typeof err === 'object') {
    const e = err as {
      response?: { data?: { message?: string } }
      message?: string
    }
    return e.response?.data?.message || e.message || defaultMsg
  }
  return defaultMsg
}
