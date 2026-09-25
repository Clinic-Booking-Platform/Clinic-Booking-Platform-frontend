/**
 * Định dạng số tiền sang chuẩn tiền tệ Việt Nam (VNĐ)
 * Ví dụ: 2500000 -> "2.500.000 ₫"
 */
export function formatCurrency(amount?: number | null): string {
  if (amount === undefined || amount === null || isNaN(amount)) {
    return '0 ₫'
  }
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount)
}

/**
 * Tính phần trăm giảm giá giữa giá gốc và giá khuyến mãi
 * Ví dụ: price = 2500000, discount_price = 2000000 -> 20
 */
export function calculateDiscountPercent(
  price: number,
  discountPrice?: number | null
): number {
  if (!discountPrice || discountPrice >= price || price <= 0) {
    return 0
  }
  return Math.round(((price - discountPrice) / price) * 100)
}

export interface PriceRangeOption {
  value: string
  label: string
}

export const PRICE_RANGE_OPTIONS: PriceRangeOption[] = [
  { value: '', label: 'Tất cả mức giá' },
  { value: 'duoi-1000', label: 'Dưới 1.000.000 ₫' },
  { value: '1000-3000', label: '1.000.000 - 3.000.000 ₫' },
  { value: '3000-5000', label: '3.000.000 - 5.000.000 ₫' },
  { value: 'tren-5000', label: 'Trên 5.000.000 ₫' },
]
