import api from './axios-clients'
import type {
  Specialty,
  GetSpecialtiesParams,
  SpecialtyListResponse,
  SpecialtyDetailResponse,
  CreateSpecialtyDto,
  UpdateSpecialtyDto,
  PaginationMeta,
} from '@/types/specialty.types'

export const specialtyService = {
  /**
   * Lấy danh sách chuyên khoa phân trang hoặc toàn bộ (all: true), tìm kiếm và lọc trạng thái
   */
  async getSpecialties(
    params?: GetSpecialtiesParams
  ): Promise<{
    specialties: Specialty[]
    pagination: PaginationMeta
    data?: { specialties: Specialty[]; pagination: PaginationMeta }
  }> {
    const res = await api.get<SpecialtyListResponse>('/admin/specialties', {
      params: {
        page: params?.all ? undefined : (params?.page ?? 1),
        pageSize: params?.pageSize || undefined,
        all: params?.all ? true : undefined,
        search: params?.search || undefined,
        status: params?.status ?? 'all',
      },
    })
    const payload = res.data?.data as unknown as
      | { specialties: Specialty[]; pagination: PaginationMeta }
      | Specialty[]
      | undefined

    const specialties: Specialty[] = Array.isArray(payload)
      ? payload
      : payload?.specialties || []

    const pagination: PaginationMeta = Array.isArray(payload)
      ? { total: specialties.length, page: 1, pageSize: specialties.length, totalPages: 1 }
      : payload?.pagination || { total: specialties.length, page: 1, pageSize: specialties.length, totalPages: 1 }

    return {
      specialties,
      pagination,
      data: {
        specialties,
        pagination,
      },
    }
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

export const specialtyApi = specialtyService

