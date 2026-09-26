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
}
