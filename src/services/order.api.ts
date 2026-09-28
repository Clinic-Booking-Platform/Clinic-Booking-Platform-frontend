// ================= FILE: src/services/order.api.ts =================

import api from './axios-clients'
import type {
  OrderListResponse,
  OrderDetailResponse,
  OrderQueryParams,
} from '@/types/order.types'

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

/** Lấy danh sách đơn hàng (Admin - Read-only) */
export const getAdminOrders = async (
  params?: OrderQueryParams
): Promise<OrderListResponse> => {
  const queryParams: Record<string, unknown> = {}
  if (params?.page) queryParams.page = params.page
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  if (params?.search?.trim()) queryParams.search = params.search.trim()
  if (params?.status && params.status !== 'ALL') queryParams.status = params.status
  if (params?.from_date) queryParams.from_date = params.from_date
  if (params?.to_date) queryParams.to_date = params.to_date

  return getWithFallback<OrderListResponse>(
    ['/api/v1/admin/orders', '/admin/orders'],
    { params: queryParams }
  )
}

/** Xem chi tiết đơn hàng (Admin - Read-only, hỗ trợ id số hoặc order_code chuỗi) */
export const getAdminOrderDetail = async (
  id: number | string
): Promise<OrderDetailResponse> => {
  return getWithFallback<OrderDetailResponse>([
    `/api/v1/admin/orders/${id}`,
    `/admin/orders/${id}`,
  ])
}

export const orderApi = {
  getAdminOrders,
  getAdminOrderDetail,
}

export default orderApi
