// ================= FILE: src/services/cart.api.ts =================

import api from './axios-clients'
import type {
  CartListResponse,
  CartDetailResponse,
  CartQueryParams,
} from '@/types/cart.types'

/**
 * Helper gọi API linh hoạt: Thử tiền tố /api/v1/admin trước, nếu 404 thì fallback /admin
 */
async function getWithFallback<T>(paths: string[], config?: object): Promise<T> {
  let lastErr: unknown
  for (const p of paths) {
    try {
      const res = await api.get<T>(p, config)
      return res.data
    } catch (err: unknown) {
      lastErr = err
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status !== 404) {
        throw err
      }
    }
  }
  throw lastErr
}

/** Lấy danh sách giỏ hàng (Admin - Read-only) */
export const getAdminCarts = async (
  params?: CartQueryParams
): Promise<CartListResponse> => {
  const queryParams: Record<string, unknown> = {}
  if (params?.page) queryParams.page = params.page
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  if (params?.search?.trim()) queryParams.search = params.search.trim()
  if (params?.price_range?.trim()) queryParams.price_range = params.price_range.trim()

  return getWithFallback<CartListResponse>(
    ['/api/v1/admin/carts', '/admin/carts'],
    { params: queryParams }
  )
}

/** Xem chi tiết giỏ hàng người dùng (Admin - Read-only, hỗ trợ id giỏ hàng hoặc user_id) */
export const getAdminCartDetail = async (
  id: number | string
): Promise<CartDetailResponse> => {
  return getWithFallback<CartDetailResponse>([
    `/api/v1/admin/carts/${id}`,
    `/admin/carts/${id}`,
  ])
}

export const cartApi = {
  getAdminCarts,
  getAdminCartDetail,
}

export default cartApi
