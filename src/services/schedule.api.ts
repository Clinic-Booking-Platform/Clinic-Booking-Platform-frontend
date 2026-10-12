import api from './axios-clients'
import type {
  Schedule,
  ScheduleFilterParams,
  ScheduleListResponse,
  ScheduleDetailResponse,
  ScheduleActionResponse,
  BulkCreateScheduleResponse,
  CreateScheduleDto,
  BulkCreateScheduleDto,
  UpdateScheduleDto,
  PaginationMeta,
  GetDoctorSchedulesParams,
  CreateDoctorSchedulePayload,
  BulkCreateDoctorSchedulePayload,
  BulkCreateDoctorScheduleResponse,
  UpdateDoctorSchedulePayload,
  UpdateDoctorScheduleResponse,
  DoctorScheduleListResponse,
} from '@/types/schedule.types'

export const scheduleApi = {
  /**
   * Lấy danh sách ca làm việc phân trang, lọc theo bác sĩ, ngày và trạng thái
   * Endpoint: GET /admin/schedules
   */
  async getSchedules(
    params?: ScheduleFilterParams
  ): Promise<{ schedules: Schedule[]; pagination: PaginationMeta }> {
    const res = await api.get<ScheduleListResponse>('/admin/schedules', {
      params: {
        page: params?.page ?? 1,
        doctor_id: params?.doctor_id || undefined,
        date: params?.date || undefined,
        from_date: params?.from_date || undefined,
        to_date: params?.to_date || undefined,
        status: params?.status ?? 'all',
      },
    })
    return res.data.data
  },

  /**
   * Lấy chi tiết 1 ca làm việc
   * Endpoint: GET /admin/schedules/:id
   */
  async getScheduleDetail(id: number): Promise<Schedule> {
    const res = await api.get<ScheduleDetailResponse>(`/admin/schedules/${id}`)
    return res.data.data
  },

  /**
   * Tạo 1 ca làm việc đơn lẻ
   * Endpoint: POST /admin/schedules
   */
  async createSchedule(data: CreateScheduleDto): Promise<Schedule> {
    const res = await api.post<ScheduleDetailResponse>('/admin/schedules', data)
    return res.data.data
  },

  /**
   * Tạo nhiều ca làm việc cùng lúc trong ngày (Bulk Create)
   * Endpoint: POST /admin/schedules/bulk
   */
  async bulkCreateSchedule(data: BulkCreateScheduleDto): Promise<BulkCreateScheduleResponse> {
    const res = await api.post<BulkCreateScheduleResponse>('/admin/schedules/bulk', data)
    return res.data
  },

  /**
   * Cập nhật số lượng tối đa và trạng thái ca làm việc
   * Endpoint: PUT /admin/schedules/:id
   */
  async updateSchedule(id: number, data: UpdateScheduleDto): Promise<Schedule> {
    const res = await api.put<ScheduleDetailResponse>(`/admin/schedules/${id}`, data)
    return res.data.data
  },

  /**
   * Xóa ca làm việc
   * Endpoint: DELETE /admin/schedules/:id
   */
  async deleteSchedule(id: number): Promise<void> {
    await api.delete<ScheduleActionResponse>(`/admin/schedules/${id}`)
  },

  // ═══════════════════════════════════════════════════════════════
  // ── PHÂN HỆ BÁC SĨ (DOCTOR PORTAL SCHEDULES) ──
  // Backend tự động nhận diện doctor_id từ Token JWT
  // ═══════════════════════════════════════════════════════════════

  /**
   * Lấy danh sách ca làm việc của chính bác sĩ
   * Endpoint: GET /doctor/schedules
   */
  async getDoctorSchedules(
    params?: GetDoctorSchedulesParams
  ): Promise<{ schedules: Schedule[]; pagination: PaginationMeta }> {
    const res = await api.get<DoctorScheduleListResponse>('/doctor/schedules', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize || params?.limit || undefined,
        limit: params?.limit || params?.pageSize || undefined,
        date: params?.date || undefined,
        from_date: params?.from_date || undefined,
        to_date: params?.to_date || undefined,
        status: params?.status ?? 'all',
      },
    })

    const initialData = res.data.data
    let allSchedules = [...(initialData.schedules || [])]

    // Nếu cần lấy trọn vẹn tất cả các ca (cho chế độ Lịch tuần Calendar View)
    if (params?.fetchAllPages && initialData.pagination && initialData.pagination.totalPages > 1) {
      const pagePromises = []
      for (let p = 2; p <= initialData.pagination.totalPages; p++) {
        pagePromises.push(
          api.get<DoctorScheduleListResponse>('/doctor/schedules', {
            params: {
              page: p,
              pageSize: params?.pageSize || params?.limit || undefined,
              limit: params?.limit || params?.pageSize || undefined,
              date: params?.date || undefined,
              from_date: params?.from_date || undefined,
              to_date: params?.to_date || undefined,
              status: params?.status ?? 'all',
            },
          })
        )
      }
      const otherPageResults = await Promise.all(pagePromises)
      otherPageResults.forEach((pageRes) => {
        if (pageRes.data?.data?.schedules) {
          allSchedules = allSchedules.concat(pageRes.data.data.schedules)
        }
      })
    }

    return {
      schedules: allSchedules,
      pagination: initialData.pagination,
    }
  },

  /**
   * Xem chi tiết 1 ca làm việc của bác sĩ
   * Endpoint: GET /doctor/schedules/:id
   */
  async getDoctorScheduleDetail(id: number): Promise<Schedule> {
    const res = await api.get<{ status: string; data: Schedule }>(`/doctor/schedules/${id}`)
    return res.data.data
  },

  /**
   * Đăng ký 1 ca làm việc đơn lẻ (Doctor)
   * Endpoint: POST /doctor/schedules
   */
  async createDoctorSchedule(
    payload: CreateDoctorSchedulePayload
  ): Promise<{ status: string; message: string; data?: unknown }> {
    const res = await api.post<{ status: string; message: string; data?: unknown }>(
      '/doctor/schedules',
      payload
    )
    return res.data
  },

  /**
   * Đăng ký nhiều ca làm việc cùng lúc trong 1 ngày (Bulk Create - Doctor)
   * Endpoint: POST /doctor/schedules/bulk
   */
  async bulkCreateDoctorSchedule(
    payload: BulkCreateDoctorSchedulePayload
  ): Promise<BulkCreateDoctorScheduleResponse> {
    const res = await api.post<BulkCreateDoctorScheduleResponse>(
      '/doctor/schedules/bulk',
      payload
    )
    return res.data
  },

  /**
   * Cập nhật ca làm việc (max_number hoặc status: CANCELLED / AVAILABLE)
   * Endpoint: PUT /doctor/schedules/:id
   */
  async updateDoctorSchedule(
    id: number,
    payload: UpdateDoctorSchedulePayload
  ): Promise<UpdateDoctorScheduleResponse> {
    const res = await api.put<UpdateDoctorScheduleResponse>(
      `/doctor/schedules/${id}`,
      payload
    )
    return res.data
  },
}
