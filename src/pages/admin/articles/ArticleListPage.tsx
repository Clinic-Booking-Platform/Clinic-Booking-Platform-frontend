import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Newspaper,
  CheckCircle2,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Eye,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

import { articleApi } from '@/services/article.api'
import type {
  Article,
  PaginationMeta,
  ArticleStatusFilter,
} from '@/types/article.types'
import type { Specialty } from '@/types/specialty.types'
import type { Doctor } from '@/types/doctor.types'

import { ArticleFilter } from '@/components/admin/articles/ArticleFilter'
import { ArticleTable } from '@/components/admin/articles/ArticleTable'
import { ArticleFormModal } from '@/components/admin/articles/ArticleFormModal'
import { ArticlePreviewModal } from '@/components/admin/articles/ArticlePreviewModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import {
  extractErrorMessage,
  fetchAllArticleAuthorOptions,
  fetchAllSpecialties,
  fetchAllDoctors,
  invalidateArticleCaches,
  type AuthorFilterOption,
} from '@/components/admin/articles/article.utils'

export const ArticleListPage: React.FC = () => {
  // 1. Quản lý trạng thái qua URL searchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const search = searchParams.get('search') || ''

  const rawSpecialtyId = searchParams.get('specialty_id')
  const parsedSpecialtyId = rawSpecialtyId ? parseInt(rawSpecialtyId, 10) : undefined
  const specialtyId =
    parsedSpecialtyId && !isNaN(parsedSpecialtyId) && parsedSpecialtyId > 0
      ? parsedSpecialtyId
      : undefined

  const rawAuthorId = searchParams.get('author_id')
  const parsedAuthorId = rawAuthorId ? parseInt(rawAuthorId, 10) : undefined
  const authorId =
    parsedAuthorId && !isNaN(parsedAuthorId) && parsedAuthorId > 0
      ? parsedAuthorId
      : undefined

  const rawStatus = searchParams.get('status')
  const status: ArticleStatusFilter =
    rawStatus === 'active' || rawStatus === 'deleted' ? rawStatus : 'all'

  // 2. State dữ liệu danh sách bài viết & phân trang
  const [articles, setArticles] = useState<Article[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [authorOptions, setAuthorOptions] = useState<AuthorFilterOption[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State điều khiển Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingArticle, setEditingArticle] = useState<Article | null>(null)

  const [previewArticle, setPreviewArticle] = useState<Article | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // State xác nhận Ẩn (xóa mềm) / Khôi phục bài viết
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'delete' | 'restore'
    article: Article | null
    isLoading: boolean
  }>({
    isOpen: false,
    type: 'delete',
    article: null,
    isLoading: false,
  })

  // 4. Tải danh mục chuyên khoa, bác sĩ & danh sách tác giả cho dropdown lọc
  useEffect(() => {
    let isMounted = true

    Promise.all([
      fetchAllSpecialties('active'),
      fetchAllDoctors('all'),
      fetchAllArticleAuthorOptions(),
    ]).then(([specList, docList, authorOpts]) => {
      if (!isMounted) return
      setSpecialties(specList)
      setDoctors(docList)
      setAuthorOptions(authorOpts)
    })

    return () => {
      isMounted = false
    }
  }, [])

  // 5. Gọi API nạp dữ liệu bài viết khi searchParams thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      try {
        const result = await articleApi.getArticles({
          page,
          search: search.trim() || undefined,
          specialty_id: specialtyId,
          author_id: authorId,
          status,
        })
        if (!ignore) {
          setArticles(result.articles || [])
          setPagination(result.pagination || null)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err) || 'Không thể tải danh sách bài viết!'
          setError(msg)
          toast.error(msg)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      ignore = true
    }
  }, [page, search, specialtyId, authorId, status])

  // Hàm reload bài viết thủ công (sau khi Thêm / Sửa / Ẩn / Khôi phục)
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      invalidateArticleCaches()
      const [result, newAuthorOpts] = await Promise.all([
        articleApi.getArticles({
          page,
          search: search.trim() || undefined,
          specialty_id: specialtyId,
          author_id: authorId,
          status,
        }),
        fetchAllArticleAuthorOptions(true).catch(() => []),
      ])
      setArticles(result.articles || [])
      setPagination(result.pagination || null)
      if (newAuthorOpts && newAuthorOpts.length > 0) {
        setAuthorOptions(newAuthorOpts)
      }
    } catch (err: unknown) {
      const msg = extractErrorMessage(err) || 'Không thể tải danh sách bài viết!'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, specialtyId, authorId, status])

  // 6. Xử lý cập nhật URL searchParams
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage > 1) {
        next.set('page', String(newPage))
      } else {
        next.delete('page')
      }
      return next
    })
  }

  const handleSearchChange = (newSearch: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const trimmed = newSearch.trim()
      if (trimmed) {
        next.set('search', trimmed)
      } else {
        next.delete('search')
      }
      next.delete('page') // Reset về page 1 khi đổi search
      return next
    })
  }

  const handleSpecialtyChange = (newSpecialtyId: number | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newSpecialtyId) {
        next.set('specialty_id', String(newSpecialtyId))
      } else {
        next.delete('specialty_id')
      }
      next.delete('page')
      return next
    })
  }

  const handleAuthorChange = (newAuthorId: number | undefined) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newAuthorId) {
        next.set('author_id', String(newAuthorId))
      } else {
        next.delete('author_id')
      }
      next.delete('page')
      return next
    })
  }

  const handleStatusChange = (newStatus: ArticleStatusFilter) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newStatus !== 'all') {
        next.set('status', newStatus)
      } else {
        next.delete('status')
      }
      next.delete('page')
      return next
    })
  }

  const handleResetFilter = () => {
    setSearchParams({})
  }

  // 7. Thao tác Modal & Hành động
  const handleOpenCreateModal = () => {
    setEditingArticle(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (article: Article) => {
    setEditingArticle(article)
    setIsFormModalOpen(true)
  }

  const handleOpenPreviewModal = (article: Article) => {
    setPreviewArticle(article)
    setIsPreviewModalOpen(true)
  }

  const handleOpenDeleteDialog = (article: Article) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      article,
      isLoading: false,
    })
  }

  const handleOpenRestoreDialog = (article: Article) => {
    setConfirmDialog({
      isOpen: true,
      type: 'restore',
      article,
      isLoading: false,
    })
  }

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isLoading) return
    setConfirmDialog({
      isOpen: false,
      type: 'delete',
      article: null,
      isLoading: false,
    })
  }

  // Thực thi Xác nhận Ẩn / Khôi phục
  const handleConfirmAction = async () => {
    const { type, article } = confirmDialog
    if (!article) return

    setConfirmDialog((prev) => ({ ...prev, isLoading: true }))
    try {
      if (type === 'delete') {
        await articleApi.deleteArticle(article.id)
        toast.success(`Đã ẩn bài viết "${article.title}" thành công.`)
      } else {
        await articleApi.restoreArticle(article.id)
        toast.success(`Đã khôi phục bài viết "${article.title}" thành công.`)
      }
      handleCloseConfirmDialog()
      await refetch()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err) || 'Thao tác không thành công!')
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Tính toán nhanh số liệu
  const totalCount = pagination?.total || articles.length
  const activeCount = articles.filter((a) => !a.deleted_at).length
  const deletedCount = articles.filter((a) => Boolean(a.deleted_at)).length

  return (
    <div className="space-y-6">
      {/* 1. Header & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Newspaper className="size-6 text-teal-600 dark:text-teal-400" />
            <span>Quản lý Bài viết & Tin tức y tế</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Biên tập, phân loại theo chuyên khoa và xuất bản các bài viết tư vấn sức khỏe từ bác sĩ
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-medium cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Thêm bài viết mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Thống kê nhanh (Quick Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng bài viết */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng số bài viết</span>
            <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-600 dark:text-teal-400">
              <Newspaper className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
            {totalCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tất cả bài viết trong hệ thống</p>
        </div>

        {/* Đang hiển thị */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đang hiển thị</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Bệnh nhân có thể đọc</p>
        </div>

        {/* Đã ẩn / Xóa */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã ẩn / Tạm khóa</span>
            <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-600 dark:text-rose-400">
              <EyeOff className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {deletedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Lưu trữ hoặc chờ duyệt lại</p>
        </div>

        {/* Tổng lượt xem */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Lượt đọc</span>
            <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
              <Eye className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {articles.reduce((acc, cur) => acc + (cur.views || 0), 0).toLocaleString()}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Lượt tương tác trong trang này</p>
        </div>
      </div>

      {/* 3. Khung Tìm kiếm & Bộ lọc */}
      <ArticleFilter
        search={search}
        specialtyId={specialtyId}
        authorId={authorId}
        status={status}
        specialties={specialties}
        doctors={doctors}
        authorOptions={authorOptions}
        isLoading={isLoading}
        onSearchChange={handleSearchChange}
        onSpecialtyChange={handleSpecialtyChange}
        onAuthorChange={handleAuthorChange}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilter}
        onRefresh={refetch}
      />

      {/* 4. Thông báo Lỗi nếu API xảy ra sự cố */}
      {error && !isLoading && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <div className="text-sm font-medium">{error}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetch}
            className="border-rose-500/30 hover:bg-rose-500/20"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            <span>Thử lại</span>
          </Button>
        </div>
      )}

      {/* 5. Bảng hiển thị danh sách bài viết & Phân trang */}
      <ArticleTable
        articles={articles}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPreview={handleOpenPreviewModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
        onRestore={handleOpenRestoreDialog}
        onResetFilter={handleResetFilter}
      />

      {/* 6. Modal Tạo mới / Chỉnh sửa bài viết */}
      <ArticleFormModal
        isOpen={isFormModalOpen}
        article={editingArticle}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingArticle(null)
        }}
        onSuccess={refetch}
      />

      {/* 7. Modal Xem trước bài viết (Patient View) */}
      <ArticlePreviewModal
        isOpen={isPreviewModalOpen}
        article={previewArticle}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setPreviewArticle(null)
        }}
        onEdit={(art) => {
          handleOpenEditModal(art)
        }}
      />

      {/* 8. Hộp thoại Xác nhận Ẩn / Khôi phục */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmAction}
        isLoading={confirmDialog.isLoading}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'success'}
        title={
          confirmDialog.type === 'delete'
            ? 'Xác nhận ẩn bài viết y tế'
            : 'Xác nhận khôi phục bài viết'
        }
        description={
          confirmDialog.type === 'delete'
            ? `Bạn có chắc chắn muốn ẩn bài viết "${confirmDialog.article?.title}"? Bài viết sẽ không còn xuất hiện trên cổng thông tin người bệnh.`
            : `Bạn có chắc chắn muốn khôi phục bài viết "${confirmDialog.article?.title}" để hiển thị công khai trở lại?`
        }
        confirmText={
          confirmDialog.type === 'delete' ? 'Ẩn bài viết' : 'Khôi phục ngay'
        }
        cancelText="Hủy bỏ"
      />
    </div>
  )
}
