export interface Banner {
  id: number
  title: string
  image_url: string
  link_url?: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at?: string
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type BannerStatusFilter = 'all' | 'active' | 'inactive'

export interface BannerFilterParams {
  page?: number
  search?: string
  status?: BannerStatusFilter
}

export interface CreateBannerDto {
  title: string
  image_url: string
  link_url?: string
  is_active?: boolean
}

export interface UpdateBannerDto {
  title?: string
  image_url?: string
  link_url?: string
  sort_order?: number
}

export interface UpdateBannerStatusDto {
  is_active: boolean
}

export interface BannerListResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    banners: Banner[]
    pagination: PaginationMeta
  }
}

export interface BannerDetailResponse {
  status: 'success' | 'error'
  message?: string
  data: Banner
}

export interface BannerActionResponse {
  status: 'success' | 'error'
  message?: string
}
