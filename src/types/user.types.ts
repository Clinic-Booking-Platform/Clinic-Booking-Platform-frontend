export interface User {
  id: number
  full_name: string
  email: string
  phone_number: string | null
  avatar: string | null
  date_of_birth: string | null
  gender: string | null
  deleted_at: string | null
  roleId: number
  created_at?: string
  updated_at?: string
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type UserStatusFilter = 'all' | 'active' | 'deleted'

export interface UserFilterParams {
  page?: number
  search?: string
  status?: UserStatusFilter
}

export interface UserListResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    users: User[]
    pagination: PaginationMeta
  }
}

export interface UserActionResponse {
  status: 'success' | 'error'
  message: string
  data?: unknown
}
