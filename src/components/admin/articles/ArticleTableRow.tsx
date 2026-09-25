import React from 'react'
import {
  Eye,
  Pencil,
  Trash2,
  RotateCcw,
  Stethoscope,
  Calendar,
  Newspaper,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  formatDate,
  formatViews,
  getAuthorInitials,
} from './article.utils'
import type { Article } from '@/types/article.types'

interface ArticleTableRowProps {
  article: Article
  onPreview: (article: Article) => void
  onEdit: (article: Article) => void
  onDelete: (article: Article) => void
  onRestore: (article: Article) => void
}

export const ArticleTableRow: React.FC<ArticleTableRowProps> = ({
  article,
  onPreview,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const isDeleted = Boolean(article.deleted_at)
  const specialty = article.specialty
  const authorUser = article.author?.user
  const authorName = authorUser?.full_name || 'Bác sĩ phụ trách'
  const authorAvatar = authorUser?.avatar

  return (
    <tr
      className={`border-b border-border/60 transition-colors hover:bg-muted/40 ${
        isDeleted ? 'bg-muted/15 opacity-75' : ''
      }`}
    >
      {/* 1. Ảnh Thumbnail + Tiêu đề + Mô tả ngắn */}
      <td className="px-4 py-3.5 max-w-sm">
        <div className="flex items-start gap-3">
          {/* Thumbnail preview */}
          <div
            onClick={() => onPreview(article)}
            className="group relative size-16 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-border/80 bg-muted/60 shadow-2xs"
            title="Nhấn để xem trước bài viết"
          >
            {article.thumbnail_url ? (
              <img
                src={article.thumbnail_url}
                alt={article.title}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-600 dark:text-teal-400">
                <Newspaper className="size-6" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white">
              <Eye className="size-4" />
            </div>
          </div>

          {/* Tiêu đề & mô tả */}
          <div className="min-w-0 flex-1 space-y-1">
            <button
              type="button"
              onClick={() => onPreview(article)}
              className="text-left font-semibold text-foreground text-sm line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer"
            >
              {article.title}
            </button>
            {article.short_description && (
              <p className="text-xs text-muted-foreground line-clamp-1 leading-relaxed">
                {article.short_description}
              </p>
            )}
          </div>
        </div>
      </td>

      {/* 2. Chuyên khoa */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {specialty?.name ? (
          <Badge
            variant="outline"
            className="gap-1 font-medium text-xs py-1 px-2.5 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25"
          >
            <Stethoscope className="size-3 text-teal-600 dark:text-teal-400" />
            <span>{specialty.name}</span>
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">Chưa phân loại</span>
        )}
      </td>

      {/* 3. Bác sĩ / Tác giả */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-2">
          <div className="relative size-7 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted/60 flex items-center justify-center shadow-2xs">
            {authorAvatar ? (
              <img
                src={authorAvatar}
                alt={authorName}
                className="size-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            ) : (
              <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-[10px]">
                {getAuthorInitials(authorName)}
              </div>
            )}
          </div>
          <div className="text-xs font-medium text-foreground truncate max-w-[140px]">
            {authorName}
          </div>
        </div>
      </td>

      {/* 4. Lượt xem */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
          <Eye className="size-3.5 text-muted-foreground/70" />
          <span>{formatViews(article.views)}</span>
        </div>
      </td>

      {/* 5. Ngày tạo */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Calendar className="size-3.5 text-muted-foreground/70" />
          <span>{formatDate(article.created_at)}</span>
        </div>
      </td>

      {/* 6. Trạng thái */}
      <td className="px-4 py-3.5 whitespace-nowrap">
        {isDeleted ? (
          <Badge
            variant="outline"
            className="gap-1 text-[11px] py-0.5 px-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20 font-medium"
          >
            <span className="size-1.5 rounded-full bg-rose-500 inline-block" />
            <span>Đã ẩn</span>
          </Badge>
        ) : (
          <Badge
            variant="secondary"
            className="gap-1 text-[11px] py-0.5 px-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-medium"
          >
            <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
            <span>Đang hiển thị</span>
          </Badge>
        )}
      </td>

      {/* 7. Thao tác */}
      <td className="px-4 py-3.5 text-right whitespace-nowrap">
        <div className="flex items-center justify-end gap-1">
          {/* Xem trước (Patient view) */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onPreview(article)}
            className="size-8 text-muted-foreground hover:text-foreground hover:bg-muted"
            title="Xem trước bài viết (Giao diện người bệnh)"
          >
            <Eye className="size-4" />
          </Button>

          {/* Chỉnh sửa */}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => onEdit(article)}
            className="size-8 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
            title="Chỉnh sửa bài viết"
          >
            <Pencil className="size-4" />
          </Button>

          {/* Khôi phục hoặc Xóa / Ẩn */}
          {isDeleted ? (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRestore(article)}
              className="size-8 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
              title="Khôi phục / Hiển thị lại bài viết"
            >
              <RotateCcw className="size-4" />
            </Button>
          ) : (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onDelete(article)}
              className="size-8 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Ẩn / Xóa mềm bài viết"
            >
              <Trash2 className="size-4" />
            </Button>
          )}
        </div>
      </td>
    </tr>
  )
}
