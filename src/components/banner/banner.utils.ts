import { z } from 'zod'

/**
 * Zod Schema cho Form Tạo mới Banner
 */
export const createBannerSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Tiêu đề banner phải có ít nhất 3 ký tự' })
    .max(255, { message: 'Tiêu đề banner không được vượt quá 255 ký tự' }),
  image_url: z
    .string()
    .trim()
    .min(1, { message: 'Vui lòng tải lên ảnh banner quảng cáo' }),
  link_url: z
    .string()
    .trim()
    .max(255, { message: 'Đường dẫn liên kết không được vượt quá 255 ký tự' })
    .optional(),
  is_active: z.boolean().default(true),
})

/**
 * Zod Schema cho Form Chỉnh sửa Banner
 */
export const updateBannerSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, { message: 'Tiêu đề banner phải có ít nhất 3 ký tự' })
    .max(255, { message: 'Tiêu đề banner không được vượt quá 255 ký tự' })
    .optional(),
  image_url: z
    .string()
    .trim()
    .min(1, { message: 'Ảnh banner không được để trống' })
    .optional(),
  link_url: z
    .string()
    .trim()
    .max(255, { message: 'Đường dẫn liên kết không được vượt quá 255 ký tự' })
    .optional(),
  sort_order: z
    .number()
    .int({ message: 'Thứ tự hiển thị phải là số nguyên dương' })
    .min(1, { message: 'Thứ tự hiển thị tối thiểu là 1' })
    .optional(),
})

export type CreateBannerFormValues = z.infer<typeof createBannerSchema>
export type UpdateBannerFormValues = z.infer<typeof updateBannerSchema>

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
 * Định dạng ngày tháng sang chuẩn DD/MM/YYYY
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })
  } catch {
    return dateStr
  }
}

/**
 * Định dạng ngày giờ chi tiết
 */
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'N/A'
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return dateStr
    return d.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return dateStr
  }
}
