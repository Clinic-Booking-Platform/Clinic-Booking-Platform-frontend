import api from './axios-clients'
import type {
  Article,
  ArticleFilterParams,
  ArticleListResponse,
  ArticleDetailResponse,
  CreateArticleDto,
  UpdateArticleDto,
  PaginationMeta,
} from '@/types/article.types'

export const articleApi = {
  /**
   * Lấy danh sách bài viết phân trang, tìm kiếm theo tiêu đề, lọc chuyên khoa, tác giả và trạng thái
   * Endpoint: GET /admin/articles
   */
  async getArticles(
    params?: ArticleFilterParams
  ): Promise<{ articles: Article[]; pagination: PaginationMeta }> {
    const res = await api.get<ArticleListResponse>('/admin/articles', {
      params: {
        page: params?.page ?? 1,
        pageSize: params?.pageSize || undefined,
        search: params?.search || undefined,
        specialty_id: params?.specialty_id || undefined,
        author_id: params?.author_id || undefined,
        status: params?.status ?? 'all',
      },
    })
    return res.data.data
  },

  /**
   * Lấy chi tiết bài viết kèm nội dung HTML (article_detail.html_content)
   * Endpoint: GET /admin/articles/:id
   */
  async getArticleById(id: number): Promise<Article> {
    const res = await api.get<ArticleDetailResponse>(`/admin/articles/${id}`)
    return res.data.data
  },

  /**
   * Tạo bài viết mới
   * Endpoint: POST /admin/articles
   */
  async createArticle(data: CreateArticleDto): Promise<Article> {
    const res = await api.post<ArticleDetailResponse>('/admin/articles', data)
    return res.data.data
  },

  /**
   * Cập nhật thông tin và nội dung bài viết
   * Endpoint: PUT /admin/articles/:id
   */
  async updateArticle(id: number, data: UpdateArticleDto): Promise<Article> {
    const res = await api.put<ArticleDetailResponse>(`/admin/articles/${id}`, data)
    return res.data.data
  },

  /**
   * Xóa mềm / Ẩn bài viết
   * Endpoint: DELETE /admin/articles/:id
   */
  async deleteArticle(id: number): Promise<void> {
    await api.delete(`/admin/articles/${id}`)
  },

  /**
   * Khôi phục bài viết đã bị ẩn / xóa mềm (nếu backend hỗ trợ)
   * Endpoint: POST /admin/articles-restore/:id
   */
  async restoreArticle(id: number): Promise<void> {
    await api.post(`/admin/articles-restore/${id}`)
  },
}
