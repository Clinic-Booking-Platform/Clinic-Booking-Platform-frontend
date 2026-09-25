/**
 * Định dạng ngày tháng sang chuẩn DD/MM/YYYY thân thiện
 * Ví dụ: "1998-05-12T00:00:00.000Z" -> "12/05/1998"
 */
export function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Chưa cập nhật'
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
 * Ví dụ: "12/05/1998, 14:30"
 */
export function formatDateTime(dateStr?: string | null): string {
  if (!dateStr) return 'Chưa cập nhật'
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

/**
 * Tính số tuổi tự động từ ngày sinh
 * Ví dụ: sinh năm 1998 -> 28
 */
export function calculateAge(dobStr?: string | null): number | null {
  if (!dobStr) return null
  const birthDate = new Date(dobStr)
  if (isNaN(birthDate.getTime())) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age >= 0 ? age : null
}

/**
 * Lấy chữ cái đầu của họ tên bệnh nhân làm avatar fallback
 * Ví dụ: "Nguyễn Thị Mai" -> "NM"
 */
export function getUserInitials(name?: string): string {
  if (!name) return 'BN'
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'BN'
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
