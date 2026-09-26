import { z } from 'zod'
import { doctorApi } from '@/services/doctor.api'
import { specialtyService } from '@/services/specialty.api'
import { articleApi } from '@/services/article.api'
import type { Doctor } from '@/types/doctor.types'
import type { Specialty } from '@/types/specialty.types'

/**
 * Định dạng ngày tháng sang chuẩn DD/MM/YYYY
 * Ví dụ: "2026-09-20T08:30:00.000Z" -> "20/09/2026"
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
 * Ví dụ: "20/09/2026 08:30"
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

/**
 * Định dạng số lượt xem thân thiện
 * Ví dụ: 154 -> "154", 1250 -> "1.3K"
 */
export function formatViews(views?: number | null): string {
  if (views === undefined || views === null || isNaN(views) || views < 0) {
    return '0'
  }
  if (views >= 1000000) {
    return `${(views / 1000000).toFixed(1)}M`
  }
  if (views >= 1000) {
    return `${(views / 1000).toFixed(1)}K`
  }
  return String(views)
}

/**
 * Tạo URL Slug từ tiêu đề tiếng Việt
 * Ví dụ: "Cách phòng ngừa bệnh cao huyết áp" -> "cach-phong-ngua-benh-cao-huyet-ap"
 */
export function slugify(text: string): string {
  if (!text) return ''
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[đĐ]/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
}

/**
 * Lấy chữ cái đầu của tên tác giả làm fallback avatar
 */
export function getAuthorInitials(name?: string): string {
  if (!name) return 'BS'
  const cleanName = name.replace(/^(BS|ThS|TS|PGS|GS|BSCKI|BSCKII)\.?\s+/i, '').trim()
  const parts = cleanName.split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'BS'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
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
 * Zod Schema để validate Form tạo mới bài viết
 */
export const createArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Tiêu đề bài viết phải có ít nhất 5 ký tự' })
    .max(255, { message: 'Tiêu đề bài viết không được vượt quá 255 ký tự' }),
  thumbnail_url: z.string().trim().optional(),
  short_description: z
    .string()
    .trim()
    .max(500, { message: 'Mô tả ngắn không được vượt quá 500 ký tự' })
    .optional(),
  author_id: z
    .number()
    .int()
    .positive({ message: 'Vui lòng chọn bác sĩ phụ trách nội dung bài viết' }),
  specialty_id: z.number().int().positive().optional(),
  html_content: z
    .string()
    .trim()
    .min(10, { message: 'Nội dung chi tiết bài viết không được để trống (tối thiểu 10 ký tự)' }),
})

/**
 * Zod Schema để validate Form cập nhật bài viết
 */
export const updateArticleSchema = z.object({
  title: z
    .string()
    .trim()
    .min(5, { message: 'Tiêu đề bài viết phải có ít nhất 5 ký tự' })
    .max(255, { message: 'Tiêu đề bài viết không được vượt quá 255 ký tự' }),
  thumbnail_url: z.string().trim().optional(),
  short_description: z
    .string()
    .trim()
    .max(500, { message: 'Mô tả ngắn không được vượt quá 500 ký tự' })
    .optional(),
  html_content: z
    .string()
    .trim()
    .min(10, { message: 'Nội dung chi tiết bài viết không được để trống (tối thiểu 10 ký tự)' }),
})

export type CreateArticleFormValues = z.infer<typeof createArticleSchema>
export type UpdateArticleFormValues = z.infer<typeof updateArticleSchema>

export interface AuthorFilterOption {
  id: number
  name: string
  avatar?: string | null
  articleCount: number
}

// ==========================================
// IN-MEMORY CACHE & IN-FLIGHT DEDUPLICATION
// ==========================================
const CACHE_TTL_MS = 5 * 60 * 1000 // 5 phút

interface CacheEntry<T> {
  data: T
  timestamp: number
}

const specialtiesCache: Partial<Record<string, CacheEntry<Specialty[]>>> = {}
const doctorsCache: Partial<Record<string, CacheEntry<Doctor[]>>> = {}
let authorOptionsCache: CacheEntry<AuthorFilterOption[]> | null = null

const inFlightSpecialties: Partial<Record<string, Promise<Specialty[]>>> = {}
const inFlightDoctors: Partial<Record<string, Promise<Doctor[]>>> = {}
let inFlightAuthorOptions: Promise<AuthorFilterOption[]> | null = null

/**
 * Xóa cache tác giả để làm mới khi có bài viết được thêm/sửa/xóa
 */
export function invalidateArticleCaches() {
  authorOptionsCache = null
}

/**
 * Lấy toàn bộ danh sách bác sĩ (có cache và deduplication, all: true)
 */
export async function fetchAllDoctors(
  status: 'all' | 'active' | 'deleted' = 'all',
  forceRefresh = false
): Promise<Doctor[]> {
  const cacheKey = status

  if (!forceRefresh && doctorsCache[cacheKey]) {
    if (Date.now() - doctorsCache[cacheKey].timestamp < CACHE_TTL_MS) {
      return doctorsCache[cacheKey].data
    }
  }

  if (inFlightDoctors[cacheKey]) {
    return inFlightDoctors[cacheKey]
  }

  inFlightDoctors[cacheKey] = (async () => {
    try {
      const res = await doctorApi.getDoctors({ status, all: true })
      const allDoctors = res.doctors || res.data?.doctors || []

      doctorsCache[cacheKey] = {
        data: allDoctors,
        timestamp: Date.now(),
      }
      return allDoctors
    } catch (err) {
      console.error('Lỗi khi tải danh sách bác sĩ:', err)
      return doctorsCache[cacheKey]?.data || []
    } finally {
      delete inFlightDoctors[cacheKey]
    }
  })()

  return inFlightDoctors[cacheKey]
}

/**
 * Lấy toàn bộ danh mục chuyên khoa (có cache và deduplication, all: true)
 */
export async function fetchAllSpecialties(
  status: 'all' | 'active' | 'deleted' = 'active',
  forceRefresh = false
): Promise<Specialty[]> {
  const cacheKey = status

  if (!forceRefresh && specialtiesCache[cacheKey]) {
    if (Date.now() - specialtiesCache[cacheKey].timestamp < CACHE_TTL_MS) {
      return specialtiesCache[cacheKey].data
    }
  }

  if (inFlightSpecialties[cacheKey]) {
    return inFlightSpecialties[cacheKey]
  }

  inFlightSpecialties[cacheKey] = (async () => {
    try {
      const res = await specialtyService.getSpecialties({ status, all: true })
      const allSpecialties = res.specialties || res.data?.specialties || []

      specialtiesCache[cacheKey] = {
        data: allSpecialties,
        timestamp: Date.now(),
      }
      return allSpecialties
    } catch (err) {
      console.error('Lỗi khi tải danh mục chuyên khoa:', err)
      return specialtiesCache[cacheKey]?.data || []
    } finally {
      delete inFlightSpecialties[cacheKey]
    }
  })()

  return inFlightSpecialties[cacheKey]
}

/**
 * Thống kê danh sách toàn bộ tác giả kèm số lượng bài viết (chỉ lấy tác giả CÓ bài viết)
 * Sử dụng 1 request duy nhất với pageSize 100, trích xuất tác giả trực tiếp từ bài viết
 */
export async function fetchAllArticleAuthorOptions(
  forceRefresh = false
): Promise<AuthorFilterOption[]> {
  if (!forceRefresh && authorOptionsCache) {
    if (Date.now() - authorOptionsCache.timestamp < CACHE_TTL_MS) {
      return authorOptionsCache.data
    }
  }

  if (inFlightAuthorOptions) {
    return inFlightAuthorOptions
  }

  inFlightAuthorOptions = (async () => {
    try {
      const firstArticlesRes = await articleApi.getArticles({
        status: 'all',
        page: 1,
        pageSize: 100,
      })

      let allArticles = [...(firstArticlesRes.articles || [])]
      const totalPages = firstArticlesRes.pagination?.totalPages || 1

      if (totalPages > 1) {
        const articlePromises = []
        for (let p = 2; p <= totalPages; p++) {
          articlePromises.push(articleApi.getArticles({ status: 'all', page: p, pageSize: 100 }))
        }
        const restResults = await Promise.all(articlePromises)
        for (const res of restResults) {
          if (res.articles) {
            allArticles = allArticles.concat(res.articles)
          }
        }
      }

      // Đếm số lượng bài viết theo author_id
      const countMap = new Map<number, { count: number; name?: string; avatar?: string | null }>()
      for (const art of allArticles) {
        if (!art.author_id) continue
        const existing = countMap.get(art.author_id)
        const authorName = art.author?.user?.full_name
        const authorAvatar = art.author?.user?.avatar
        if (existing) {
          existing.count += 1
          if (authorName && !existing.name) existing.name = authorName
          if (authorAvatar && !existing.avatar) existing.avatar = authorAvatar
        } else {
          countMap.set(art.author_id, {
            count: 1,
            name: authorName,
            avatar: authorAvatar,
          })
        }
      }

      // Bổ sung các tác giả từ bài viết (chỉ những người THỰC SỰ có bài viết)
      const options: AuthorFilterOption[] = []
      countMap.forEach((val, authorId) => {
        options.push({
          id: authorId,
          name: val.name || `Bác sĩ #${authorId}`,
          avatar: val.avatar || null,
          articleCount: val.count,
        })
      })

      // Sắp xếp: Tác giả có nhiều bài viết hơn đứng trước
      const sorted = options.sort((a, b) => {
        if (b.articleCount !== a.articleCount) {
          return b.articleCount - a.articleCount
        }
        return a.name.localeCompare(b.name, 'vi')
      })

      authorOptionsCache = {
        data: sorted,
        timestamp: Date.now(),
      }

      return sorted
    } catch (err) {
      console.error('Lỗi khi xây dựng danh sách tác giả bài viết:', err)
      return authorOptionsCache?.data || []
    } finally {
      inFlightAuthorOptions = null
    }
  })()

  return inFlightAuthorOptions
}
