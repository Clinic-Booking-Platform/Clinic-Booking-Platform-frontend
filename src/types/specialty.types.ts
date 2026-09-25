export interface SpecialtyDoctorUser {
  id?: number
  full_name: string
  avatar: string | null
  email: string
  phone_number: string
}

export interface SpecialtyDoctor {
  id: number
  specialty_id?: number
  user_id?: number
  user?: SpecialtyDoctorUser
  full_name?: string
  avatar?: string | null
  email?: string
  phone_number?: string
}

export interface SpecialtyCounts {
  doctors?: number
  articles?: number
}

export interface Specialty {
  id: number
  name: string
  description: string | null
  image_url: string | null
  deleted_at: string | null
  _count?: SpecialtyCounts
  doctors?: SpecialtyDoctor[]
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface SpecialtyListResponse {
  status: 'success' | 'error'
  data: {
    specialties: Specialty[]
    pagination: PaginationMeta
  }
  message?: string
}

export interface SpecialtyDetailResponse {
  status: 'success' | 'error'
  data: Specialty
  message?: string
}

export type SpecialtyStatusFilter = 'all' | 'active' | 'deleted'

export interface SpecialtyFilterParams {
  page?: number
  pageSize?: number
  search?: string
  status?: SpecialtyStatusFilter
}

export interface CreateSpecialtyDto {
  name: string
  description?: string
  image_url?: string
}

export interface UpdateSpecialtyDto {
  name?: string
  description?: string
  image_url?: string
}
