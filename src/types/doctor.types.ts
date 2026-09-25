export interface DoctorUser {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  avatar: string | null
  gender?: string | null
  deleted_at: string | null
  created_at?: string
  updated_at?: string
}

export interface DoctorSpecialty {
  id: number
  name: string
  description?: string | null
  image_url?: string | null
  deleted_at?: string | null
}

export interface Doctor {
  id: number
  user_id: number
  specialty_id: number
  price: number
  description: string | null
  deleted_at: string | null
  created_at: string
  updated_at?: string
  user?: DoctorUser
  specialty?: DoctorSpecialty
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface DoctorListResponse {
  status: 'success' | 'error'
  data: {
    doctors: Doctor[]
    pagination: PaginationMeta
  }
  message?: string
}

export interface DoctorDetailResponse {
  status: 'success' | 'error'
  data: Doctor
  message?: string
}

export type DoctorStatusFilter = 'all' | 'active' | 'deleted'

export interface DoctorFilterParams {
  page?: number
  pageSize?: number
  search?: string
  specialty_id?: number
  status?: DoctorStatusFilter
}

export interface CreateDoctorDto {
  fullname: string
  email: string
  password: string
  confirmPassword: string
  specialty_id: number
  price: number
}

export interface UpdateDoctorDto {
  full_name: string
  phone_number?: string | null
  avatar?: string | null
  specialty_id: number
  price: number
  description?: string | null
}
