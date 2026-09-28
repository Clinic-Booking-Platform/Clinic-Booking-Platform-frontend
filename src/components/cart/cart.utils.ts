// ================= FILE: src/components/cart/cart.utils.ts =================

export interface PriceRangeOption {
  key: string
  label: string
  shortLabel: string
}

export const PRICE_RANGES: PriceRangeOption[] = [
  { key: '100-300', label: '100.000₫ - 300.000₫', shortLabel: '100k - 300k' },
  { key: '300-500', label: '300.000₫ - 500.000₫', shortLabel: '300k - 500k' },
  { key: '500-1000', label: '500.000₫ - 1.000.000₫', shortLabel: '500k - 1tr' },
  { key: 'tren-1000', label: 'Trên 1.000.000₫', shortLabel: '> 1tr' },
]

export const VIETNAM_TIMEZONE = 'Asia/Ho_Chi_Minh'

/**
 * Format tiền tệ VNĐ hỗ trợ cả số (number) lẫn chuỗi thập phân (Decimal string, VD: "450000.00")
 */
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined || amount === '') {
    return '0 ₫'
  }
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) {
    return '0 ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(num)
}

/**
 * Định dạng ngày sang DD/MM/YYYY chuẩn múi giờ Việt Nam
 */
export function formatShortDate(dateStr?: string | null): string {
  if (!dateStr) return '—'
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
