import { z } from 'zod'

/**
 * Định dạng số tiền sang chuẩn tiền tệ Việt Nam (VNĐ)
 * Ví dụ: 350000 -> "350.000 ₫"
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
 * Lấy chữ cái đầu của họ tên làm fallback cho avatar
 * Ví dụ: "BS. Nguyễn Văn A" -> "NA" hoặc "A"
 */
export function getDoctorInitials(name?: string): string {
  if (!name) return 'BS'
  const cleanName = name.replace(/^(BS|ThS|TS|PGS|GS|BSCKI|BSCKII)\.?\s+/i, '').trim()
  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'BS'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

/**
 * Định dạng số điện thoại đẹp mắt
 * Ví dụ: "0912345678" -> "0912 345 678"
 */
export function formatPhoneNumber(phone?: string | null): string {
  if (!phone) return 'Chưa cập nhật'
  const cleaned = phone.replace(/\D/g, '')
  if (cleaned.length === 10) {
    return `${cleaned.slice(0, 4)} ${cleaned.slice(4, 7)} ${cleaned.slice(7)}`
  }
  return phone
}

/**
 * Trích xuất chuỗi thông báo lỗi chi tiết từ Axios Error response
 */
export function extractErrorMessage(error: unknown, fallbackMessage: string): string {
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
 * Zod Schema để validate Form tạo mới Bác sĩ
 */
export const createDoctorSchema = z
  .object({
    fullname: z
      .string()
      .trim()
      .min(2, { message: 'Họ và tên bác sĩ phải có ít nhất 2 ký tự' })
      .max(100, { message: 'Họ và tên không được vượt quá 100 ký tự' }),
    email: z
      .string()
      .trim()
      .min(1, { message: 'Vui lòng nhập địa chỉ email' })
      .email({ message: 'Địa chỉ email không đúng định dạng (VD: bacsi@clinic.vn)' }),
    password: z
      .string()
      .min(6, { message: 'Mật khẩu phải chứa ít nhất 6 ký tự' })
      .max(50, { message: 'Mật khẩu không được quá 50 ký tự' }),
    confirmPassword: z
      .string()
      .min(1, { message: 'Vui lòng xác nhận lại mật khẩu' }),
    specialty_id: z
      .number()
      .int()
      .positive({ message: 'Vui lòng chọn chuyên khoa phụ trách' }),
    price: z
      .number()
      .min(0, { message: 'Giá khám không được nhỏ hơn 0' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Mật khẩu xác nhận không khớp với mật khẩu đã nhập',
    path: ['confirmPassword'],
  })

/**
 * Zod Schema để validate Form cập nhật Bác sĩ
 */
export const updateDoctorSchema = z.object({
  full_name: z
    .string()
    .trim()
    .min(2, { message: 'Họ và tên bác sĩ phải có ít nhất 2 ký tự' })
    .max(100, { message: 'Họ và tên không được vượt quá 100 ký tự' }),
  phone_number: z
    .string()
    .trim()
    .optional()
    .refine(
      (val) => {
        if (!val) return true
        const digits = val.replace(/\D/g, '')
        return /^(0[35789])[0-9]{8}$/.test(digits) || digits.length === 10
      },
      {
        message: 'Số điện thoại phải gồm 10 chữ số hợp lệ (VD: 0912345678)',
      }
    ),
  avatar: z.string().trim().optional(),
  specialty_id: z
    .number()
    .int()
    .positive({ message: 'Vui lòng chọn chuyên khoa phụ trách' }),
  price: z
    .number()
    .min(0, { message: 'Giá khám không được nhỏ hơn 0' }),
  description: z.string().trim().optional(),
})

export type CreateDoctorFormValues = z.infer<typeof createDoctorSchema>
export type UpdateDoctorFormValues = z.infer<typeof updateDoctorSchema>
