export interface PackageDetail {
  id?: number
  package_id?: number
  html_content: string
  created_at?: string
  updated_at?: string
}

export interface MedicalPackage {
  id: number
  name: string
  description: string | null
  thumbnail_url: string | null
  price: number
  discount_price: number | null
  deleted_at: string | null
  created_at: string
  updated_at?: string
  package_detail?: PackageDetail | null
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface PackageListResponse {
  status: 'success' | 'error'
  data: {
    packages: MedicalPackage[]
    pagination: PaginationMeta
  }
  message?: string
}

export interface PackageDetailResponse {
  status: 'success' | 'error'
  data: MedicalPackage
  message?: string
}

export type PackageStatusFilter = 'all' | 'active' | 'deleted'

export interface PackageFilterParams {
  page?: number
  search?: string
  status?: PackageStatusFilter
  min_price?: number
  max_price?: number
  price_range?: string
}

export interface CreatePackageDto {
  name: string
  description?: string
  thumbnail_url?: string
  price: number
  discount_price?: number | null
  html_content?: string
}

export interface UpdatePackageDto {
  name?: string
  description?: string
  thumbnail_url?: string
  price?: number
  discount_price?: number | null
  html_content?: string
}
