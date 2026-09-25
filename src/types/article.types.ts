export interface ArticleAuthorUser {
  id: number
  full_name: string
  avatar: string | null
  email?: string
}

export interface ArticleAuthor {
  id: number
  user_id?: number
  specialty_id?: number
  user?: ArticleAuthorUser
}

export interface ArticleSpecialty {
  id: number
  name: string
  description?: string | null
  image_url?: string | null
}

export interface ArticleDetail {
  id?: number
  article_id?: number
  html_content: string
  created_at?: string
  updated_at?: string
}

export interface Article {
  id: number
  title: string
  slug?: string | null
  thumbnail_url: string | null
  short_description: string | null
  views: number
  author_id: number
  specialty_id: number
  deleted_at: string | null
  created_at: string
  updated_at?: string
  author?: ArticleAuthor | null
  specialty?: ArticleSpecialty | null
  article_detail?: ArticleDetail | null
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export type ArticleStatusFilter = 'all' | 'active' | 'deleted'

export interface ArticleFilterParams {
  page?: number
  pageSize?: number
  search?: string
  specialty_id?: number
  author_id?: number
  status?: ArticleStatusFilter
}

export interface ArticleListResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    articles: Article[]
    pagination: PaginationMeta
  }
}

export interface ArticleDetailResponse {
  status: 'success' | 'error'
  message?: string
  data: Article
}

export interface CreateArticleDto {
  title: string
  thumbnail_url?: string
  short_description?: string
  html_content: string
  author_id: number
  specialty_id?: number
}

export interface UpdateArticleDto {
  title?: string
  thumbnail_url?: string
  short_description?: string
  html_content?: string
  author_id?: number
  specialty_id?: number
}
