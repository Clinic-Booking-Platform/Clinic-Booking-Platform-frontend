import api from './axios-clients'
import type {
  MedicalPackage,
  PackageFilterParams,
  PackageListResponse,
  PackageDetailResponse,
  CreatePackageDto,
  UpdatePackageDto,
  PaginationMeta,
} from '@/types/package.types'

export const packageApi = {
  /**
   * Lấy danh sách gói khám phân trang, tìm kiếm, lọc trạng thái và khoảng giá
   */
  async getPackages(
    params?: PackageFilterParams
  ): Promise<{ packages: MedicalPackage[]; pagination: PaginationMeta }> {
    const res = await api.get<PackageListResponse>('/admin/packages', {
      params: {
        page: params?.page ?? 1,
        search: params?.search || undefined,
        status: params?.status ?? 'all',
        min_price: params?.min_price || undefined,
        max_price: params?.max_price || undefined,
        price_range: params?.price_range || undefined,
      },
    })
    return res.data.data
  },

  /**
   * Lấy chi tiết gói khám (kèm nội dung HTML từ package_detail)
   */
  async getPackageById(id: number): Promise<MedicalPackage> {
    const res = await api.get<PackageDetailResponse>(`/admin/packages/${id}`)
    return res.data.data
  },

  /**
   * Thêm mới gói khám y tế
   */
  async createPackage(data: CreatePackageDto): Promise<MedicalPackage> {
    const res = await api.post<PackageDetailResponse>('/admin/packages', data)
    return res.data.data
  },

  /**
   * Cập nhật thông tin gói khám y tế
   */
  async updatePackage(id: number, data: UpdatePackageDto): Promise<MedicalPackage> {
    const res = await api.put<PackageDetailResponse>(`/admin/packages/${id}`, data)
    return res.data.data
  },

  /**
   * Ngừng cung cấp / Xóa mềm gói khám
   */
  async deletePackage(id: number): Promise<void> {
    await api.delete(`/admin/packages/${id}`)
  },

  /**
   * Khôi phục gói khám đã ngừng cung cấp
   */
  async restorePackage(id: number): Promise<void> {
    await api.post(`/admin/packages-restore/${id}`)
  },
}
