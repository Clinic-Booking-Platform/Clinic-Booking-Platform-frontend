export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

export type AppointmentStatusFilter = 'ALL' | AppointmentStatus

export type UpdateAppointmentStatus = 'CONFIRMED' | 'COMPLETED' | 'NO_SHOW'

export type AppointmentType = 'OFFLINE' | 'ONLINE'

export interface AppointmentDoctorUser {
  id: number
  full_name: string
  avatar: string | null
  email?: string | null
  phone_number?: string | null
}

export interface AppointmentDoctorSpecialty {
  id: number
  name: string
  description?: string | null
}

export interface AppointmentDoctor {
  id: number
  user?: AppointmentDoctorUser
  specialty?: AppointmentDoctorSpecialty
}

export interface AppointmentPackage {
  id: number
  name: string
  price?: number
  description?: string | null
}

export interface Appointment {
  id: number
  user_id: number
  doctor_id: number
  package_id: number | null
  appointment_type: 'OFFLINE' | 'ONLINE'
  meeting_link: string | null // URL phòng khám Jitsi Meet (VD: https://meet.jit.si/ClinicBooking-Apt-12-...)
  date: string
  time_type: string
  patient_name: string
  patient_phone: string
  patient_gender?: string | null
  patient_dob?: string | null
  patient_address?: string | null
  symptoms: string | null
  status: AppointmentStatus
  deleted_at: string | null
  created_at?: string
  updated_at?: string
  doctor?: AppointmentDoctor
  package?: AppointmentPackage | null
}

export interface PaginationMeta {
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface AppointmentFilterParams {
  page?: number
  pageSize?: number
  status?: AppointmentStatusFilter
  from_date?: string
  to_date?: string
  search?: string
  doctor_id?: number
}

export interface AppointmentListResponse {
  status: 'success' | 'error'
  data: {
    appointments: Appointment[]
    pagination: PaginationMeta
  }
  message?: string
}

export interface AppointmentDetailResponse {
  status: 'success' | 'error'
  data: Appointment
  message?: string
}

export interface UpdateAppointmentStatusDto {
  status: UpdateAppointmentStatus
}
