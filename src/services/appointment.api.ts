import api from './axios-clients'
import type {
  Appointment,
  AppointmentFilterParams,
  AppointmentListResponse,
  AppointmentDetailResponse,
  UpdateAppointmentStatus,
  PaginationMeta,
} from '@/types/appointment.types'

export const appointmentApi = {
  /**
   * Lấy danh sách tất cả lịch hẹn khám phía Admin
   */
  async getAdminAppointments(
    params?: AppointmentFilterParams
  ): Promise<{ appointments: Appointment[]; pagination: PaginationMeta }> {
    const res = await api.get<AppointmentListResponse>('/admin/appointments', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize ?? 10,
        status: params?.status && params.status !== 'ALL' ? params.status : undefined,
        from_date: params?.from_date || undefined,
        to_date: params?.to_date || undefined,
        search: params?.search?.trim() || undefined,
        doctor_id: params?.doctor_id || undefined,
      },
    })

    const payload = res.data?.data
    const appointments: Appointment[] = payload?.appointments || []
    const pagination: PaginationMeta = payload?.pagination || {
      page: params?.page ?? 1,
      pageSize: params?.pageSize ?? 10,
      total: appointments.length,
      totalPages: Math.ceil(appointments.length / (params?.pageSize ?? 10)) || 1,
    }

    return {
      appointments,
      pagination,
    }
  },

  /**
   * Lấy thông tin chi tiết của 1 lịch hẹn khám
   */
  async getAdminAppointmentDetail(id: number): Promise<Appointment> {
    const res = await api.get<AppointmentDetailResponse>(`/admin/appointments/${id}`)
    return res.data?.data
  },

  /**
   * Cập nhật trạng thái tiến trình lịch hẹn theo State Machine:
   * PENDING -> CONFIRMED
   * CONFIRMED -> COMPLETED hoặc NO_SHOW
   * (Lưu ý: Không gửi CANCELLED qua API này)
   */
  async updateAppointmentStatus(
    id: number,
    status: UpdateAppointmentStatus
  ): Promise<Appointment> {
    const res = await api.put<AppointmentDetailResponse>(
      `/admin/appointments/${id}/status`,
      { status }
    )
    return res.data?.data
  },

  /**
   * Hủy lịch hẹn (chỉ được hủy khi PENDING hoặc CONFIRMED)
   * Tự động giải phóng hoàn trả slot ca trực của bác sĩ
   */
  async cancelAppointment(id: number): Promise<void> {
    await api.delete(`/admin/appointments/${id}`)
  },
}
