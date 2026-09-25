import api from './axios-clients'
import type {
  User,
  UserFilterParams,
  UserListResponse,
  UserActionResponse,
  PaginationMeta,
} from '@/types/user.types'

export const userApi = {
  /**
   * Lấy danh sách bệnh nhân (tài khoản role USER) có phân trang, tìm kiếm và lọc trạng thái
   * Endpoint: GET /admin/user
   */
  async getUsers(
    params?: UserFilterParams
  ): Promise<{ users: User[]; pagination: PaginationMeta }> {
    const res = await api.get<UserListResponse>('/admin/user', {
      params: {
        page: params?.page ?? 1,
        search: params?.search || undefined,
        status: params?.status ?? 'all',
      },
    })
    return res.data.data
  },

  /**
   * Khóa / Vô hiệu hóa tài khoản bệnh nhân (Xóa mềm)
   * Endpoint: DELETE /admin/user/:id
   */
  async deleteUser(id: number): Promise<string> {
    const res = await api.delete<UserActionResponse>(`/admin/user/${id}`)
    return res.data.message || 'Xóa mềm người dùng thành công'
  },

  /**
   * Mở khóa / Khôi phục tài khoản bệnh nhân đã bị xóa mềm
   * Endpoint: POST /admin/user-restore/:id
   */
  async restoreUser(id: number): Promise<string> {
    const res = await api.post<UserActionResponse>(`/admin/user-restore/${id}`)
    return res.data.message || 'Khôi phục người dùng thành công'
  },
}
