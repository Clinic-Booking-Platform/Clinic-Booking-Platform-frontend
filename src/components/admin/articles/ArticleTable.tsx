import React from 'react'
import { Newspaper, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { ArticleTableRow } from './ArticleTableRow'
import { ArticleCardItem } from './ArticleCardItem'
import type { Article, PaginationMeta } from '@/types/article.types'

interface ArticleTableProps {
  articles: Article[]
  pagination: PaginationMeta | null
  isLoading: boolean
  onPageChange: (page: number) => void
  onPreview: (article: Article) => void
  onEdit: (article: Article) => void
  onDelete: (article: Article) => void
  onRestore: (article: Article) => void
  onResetFilter?: () => void
}

export const ArticleTable: React.FC<ArticleTableProps> = ({
  articles,
  pagination,
  isLoading,
  onPageChange,
  onPreview,
  onEdit,
  onDelete,
  onRestore,
  onResetFilter,
}) => {
  // 1. Trạng thái Loading Skeleton
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {/* Desktop Skeleton */}
        <div className="hidden md:block overflow-hidden rounded-xl border border-border/80 bg-card shadow-xs">
          <div className="border-b border-border/60 bg-muted/40 p-4">
            <div className="h-4 w-48 rounded bg-muted animate-pulse" />
          </div>
          <div className="divide-y divide-border/40 p-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div className="size-14 rounded-lg bg-muted animate-pulse shrink-0" />
                  <div className="space-y-1.5 flex-1">
                    <div className="h-4 w-2/3 rounded bg-muted animate-pulse" />
                    <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
                  </div>
                </div>
                <div className="h-6 w-28 rounded-full bg-muted animate-pulse" />
                <div className="h-4 w-28 rounded bg-muted animate-pulse" />
                <div className="h-4 w-16 rounded bg-muted animate-pulse" />
                <div className="h-4 w-20 rounded bg-muted animate-pulse" />
                <div className="h-6 w-20 rounded-full bg-muted animate-pulse" />
                <div className="flex gap-1">
                  <div className="size-8 rounded-lg bg-muted animate-pulse" />
                  <div className="size-8 rounded-lg bg-muted animate-pulse" />
                  <div className="size-8 rounded-lg bg-muted animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-xs"
            >
              <div className="aspect-video w-full rounded-lg bg-muted animate-pulse" />
              <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
              <div className="h-3 w-1/2 rounded bg-muted animate-pulse" />
              <div className="h-px bg-border/40" />
              <div className="flex justify-between items-center">
                <div className="h-4 w-1/3 rounded bg-muted animate-pulse" />
                <div className="h-4 w-1/4 rounded bg-muted animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 2. Trạng thái Empty (Không có bài viết)
  if (!articles || articles.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card p-10 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-muted/80 text-muted-foreground mb-3">
          <Newspaper className="size-7" />
        </div>
        <h3 className="text-base font-semibold text-foreground">
          Không tìm thấy bài viết nào
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground max-w-sm mt-1 mb-4">
          Không có bài viết nào khớp với từ khóa tìm kiếm hoặc bộ lọc hiện tại. Thử thay đổi điều kiện lọc.
        </p>
        {onResetFilter && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilter}
            className="text-xs"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            <span>Đặt lại bộ lọc</span>
          </Button>
        )}
      </div>
    )
  }

  // 3. Render danh sách bài viết
  return (
    <div className="flex flex-col gap-4">
      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-xl border border-border/80 bg-card shadow-xs">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border/80 bg-muted/50 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th className="px-4 py-3 min-w-[280px]">Bài viết & Tin tức</th>
              <th className="px-4 py-3">Chuyên khoa</th>
              <th className="px-4 py-3">Tác giả / Bác sĩ</th>
              <th className="px-4 py-3">Lượt xem</th>
              <th className="px-4 py-3">Ngày đăng</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {articles.map((article) => (
              <ArticleTableRow
                key={article.id}
                article={article}
                onPreview={onPreview}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Card Grid View */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:hidden">
        {articles.map((article) => (
          <ArticleCardItem
            key={article.id}
            article={article}
            onPreview={onPreview}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        ))}
      </div>

      {/* Reusable Pagination Component */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 rounded-xl border border-border/80 bg-card p-3 shadow-xs">
          <div className="text-xs text-muted-foreground">
            Hiển thị trang <strong className="text-foreground">{pagination.page}</strong> /{' '}
            <strong className="text-foreground">{pagination.totalPages}</strong> ({pagination.total} bài viết)
          </div>
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
