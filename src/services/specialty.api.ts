import api from './axios-clients'
import type {
  Specialty,
  SpecialtyFilterParams,
  SpecialtyListResponse,
  SpecialtyDetailResponse,
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  PaginationMeta,
} from '@/types/specialty.types'

export const specialtyService = {
  /**
   * Lấy danh sách chuyên khoa phân trang, tìm kiếm và lọc trạng thái
   */
  async getSpecialties(
    params?: SpecialtyFilterParams
  ): Promise<{ specialties: Specialty[]; pagination: PaginationMeta }> {
    const res = await api.get<SpecialtyListResponse>('/admin/specialties', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize || undefined,
        search: params?.search || undefined,
        status: params?.status ?? 'all',
      },
    })
    return res.data.data
  },

  /**
   * Lấy chi tiết chuyên khoa (kèm danh sách bác sĩ và bài viết)
   */
  async getSpecialtyById(id: number): Promise<Specialty> {
    const res = await api.get<SpecialtyDetailResponse>(`/admin/specialties/${id}`)
    return res.data.data
  },

  /**
   * Thêm mới chuyên khoa
   */
  async createSpecialty(data: CreateSpecialtyDto): Promise<Specialty> {
    const res = await api.post<SpecialtyDetailResponse>('/admin/specialties', data)
    return res.data.data
  },

  /**
   * Cập nhật thông tin chuyên khoa
   */
  async updateSpecialty(id: number, data: UpdateSpecialtyDto): Promise<Specialty> {
    const res = await api.put<SpecialtyDetailResponse>(`/admin/specialties/${id}`, data)
    return res.data.data
  },

  /**
   * Xóa mềm chuyên khoa
   */
  async deleteSpecialty(id: number): Promise<void> {
    await api.delete(`/admin/specialties/${id}`)
  },

  /**
   * Khôi phục chuyên khoa đã xóa mềm
   */
  async restoreSpecialty(id: number): Promise<void> {
    await api.post(`/admin/specialties-restore/${id}`)
  },
}
