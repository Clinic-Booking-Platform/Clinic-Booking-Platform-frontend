import api from './axios-clients'
import type {
  Banner,
  BannerFilterParams,
  BannerListResponse,
  BannerDetailResponse,
  BannerActionResponse,
  CreateBannerDto,
  UpdateBannerDto,
  UpdateBannerStatusDto,
  PaginationMeta,
} from '@/types/banner.types'

export const bannerApi = {
  /**
   * Lấy danh sách banner phân trang, tìm kiếm và lọc trạng thái
   * Endpoint: GET /admin/banners
   */
  async getBanners(
    params?: BannerFilterParams
  ): Promise<{ banners: Banner[]; pagination: PaginationMeta }> {
    const res = await api.get<BannerListResponse>('/admin/banners', {
      params: {
        page: params?.page ?? 1,
        search: params?.search || undefined,
        status: params?.status ?? 'all',
      },
    })
    return res.data.data
  },

  /**
   * Lấy chi tiết 1 banner
   * Endpoint: GET /admin/banners/:id
   */
  async getBannerById(id: number): Promise<Banner> {
    const res = await api.get<BannerDetailResponse>(`/admin/banners/${id}`)
    return res.data.data
  },

  /**
   * Thêm mới banner quảng cáo
   * Endpoint: POST /admin/banners
   */
  async createBanner(data: CreateBannerDto): Promise<Banner> {
    const res = await api.post<BannerDetailResponse>('/admin/banners', data)
    return res.data.data
  },

  /**
   * Cập nhật thông tin banner và thứ tự hiển thị
   * Endpoint: PUT /admin/banners/:id
   */
  async updateBanner(id: number, data: UpdateBannerDto): Promise<Banner> {
    const res = await api.put<BannerDetailResponse>(`/admin/banners/${id}`, data)
    return res.data.data
  },

  /**
   * Bật / Tắt trạng thái hiển thị nhanh banner
   * Endpoint: PUT /admin/banners-status/:id
   */
  async updateBannerStatus(id: number, is_active: boolean): Promise<void> {
    const body: UpdateBannerStatusDto = { is_active }
    await api.put<BannerActionResponse>(`/admin/banners-status/${id}`, body)
  },

  /**
   * Xóa vĩnh viễn banner (Hard Delete)
   * Endpoint: DELETE /admin/banners/:id
   */
  async deleteBanner(id: number): Promise<void> {
    await api.delete<BannerActionResponse>(`/admin/banners/${id}`)
  },
}
