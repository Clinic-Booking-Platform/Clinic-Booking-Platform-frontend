import api from './axios-clients'
import type {
  Doctor,
  GetDoctorsParams,
  DoctorListResponse,
  DoctorDetailResponse,
  CreateDoctorDto,
  UpdateDoctorDto,
  PaginationMeta,
} from '@/types/doctor.types'

export const doctorApi = {
  /**
   * Lấy danh sách bác sĩ có phân trang hoặc toàn bộ (all: true), tìm kiếm theo tên, lọc chuyên khoa và trạng thái
   */
  async getDoctors(
    params?: GetDoctorsParams
  ): Promise<{
    doctors: Doctor[]
    pagination: PaginationMeta
    data?: { doctors: Doctor[]; pagination: PaginationMeta }
  }> {
    const res = await api.get<DoctorListResponse>('/admin/doctors', {
      params: {
        page: params?.all ? undefined : (params?.page ?? 1),
        pageSize: params?.pageSize || undefined,
        all: params?.all ? true : undefined,
        search: params?.search || undefined,
        specialty_id: params?.specialty_id || undefined,
        status: params?.status ?? 'all',
      },
    })
    const payload = res.data?.data as unknown as
      | { doctors: Doctor[]; pagination: PaginationMeta }
      | Doctor[]
      | undefined

    const doctors: Doctor[] = Array.isArray(payload)
      ? payload
      : payload?.doctors || []

    const pagination: PaginationMeta = Array.isArray(payload)
      ? { total: doctors.length, page: 1, pageSize: doctors.length, totalPages: 1 }
      : payload?.pagination || { total: doctors.length, page: 1, pageSize: doctors.length, totalPages: 1 }

    return {
      doctors,
      pagination,
      data: {
        doctors,
        pagination,
      },
    }
  },

  /**
   * Lấy chi tiết thông tin 1 bác sĩ (kèm user profile và specialty)
   */
  async getDoctorById(id: number): Promise<Doctor> {
    const res = await api.get<DoctorDetailResponse>(`/admin/doctors/${id}`)
    return res.data.data
  },

  /**
   * Cấp mới tài khoản Bác sĩ
   */
  async createDoctor(data: CreateDoctorDto): Promise<Doctor> {
    const res = await api.post<DoctorDetailResponse>('/admin/doctors', data)
    return res.data.data
  },

  /**
   * Cập nhật thông tin & chuyên môn Bác sĩ
   */
  async updateDoctor(id: number, data: UpdateDoctorDto): Promise<Doctor> {
    const res = await api.put<DoctorDetailResponse>(`/admin/doctors/${id}`, data)
    return res.data.data
  },

  /**
   * Khóa / Xóa mềm tài khoản Bác sĩ
   */
  async deleteDoctor(id: number): Promise<void> {
    await api.delete(`/admin/doctors/${id}`)
  },

  /**
   * Khôi phục tài khoản Bác sĩ đã bị xóa mềm
   */
  async restoreDoctor(id: number): Promise<void> {
    await api.post(`/admin/doctors-restore/${id}`)
  },
}
