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

interface ArticleCardItemProps {
  article: Article
  onPreview: (article: Article) => void
  onEdit: (article: Article) => void
  onDelete: (article: Article) => void
  onRestore: (article: Article) => void
}

export const ArticleCardItem: React.FC<ArticleCardItemProps> = ({
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
    <div
      className={`flex flex-col justify-between rounded-xl border border-border/80 bg-card p-4 shadow-xs transition-all hover:shadow-md ${
        isDeleted ? 'bg-muted/15 opacity-80' : ''
      }`}
    >
      <div>
        {/* Top Header: Ảnh đại diện + Trạng thái + Chuyên khoa */}
        <div className="relative aspect-video w-full overflow-hidden rounded-lg border border-border/80 bg-muted/60 mb-3 group cursor-pointer"
             onClick={() => onPreview(article)}>
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
              <Newspaper className="size-8" />
            </div>
          )}

          {/* Badge trạng thái ghim trên ảnh */}
          <div className="absolute top-2 right-2">
            {isDeleted ? (
              <Badge
                variant="outline"
                className="gap-1 text-[10px] py-0.5 px-2 bg-background/90 backdrop-blur-xs text-rose-600 dark:text-rose-400 border-rose-500/30 font-medium shadow-xs"
              >
                <span className="size-1.5 rounded-full bg-rose-500 inline-block" />
                <span>Đã ẩn</span>
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="gap-1 text-[10px] py-0.5 px-2 bg-background/90 backdrop-blur-xs text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-medium shadow-xs"
              >
                <span className="size-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                <span>Đang hiển thị</span>
              </Badge>
            )}
          </div>

          {/* Badge Chuyên khoa ghim góc dưới ảnh */}
          {specialty?.name && (
            <div className="absolute bottom-2 left-2">
              <Badge
                variant="outline"
                className="gap-1 font-medium text-[10px] py-0.5 px-2 bg-background/90 backdrop-blur-xs text-teal-700 dark:text-teal-300 border-teal-500/30 shadow-xs"
              >
                <Stethoscope className="size-2.5 text-teal-600 dark:text-teal-400" />
                <span>{specialty.name}</span>
              </Badge>
            </div>
          )}
        </div>

        {/* Tiêu đề & mô tả */}
        <h4
          onClick={() => onPreview(article)}
          className="font-semibold text-foreground text-sm line-clamp-2 hover:text-teal-600 dark:hover:text-teal-400 transition-colors cursor-pointer mb-1.5"
        >
          {article.title}
        </h4>
        {article.short_description && (
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
            {article.short_description}
          </p>
        )}

        {/* Thông tin tác giả & số liệu */}
        <div className="flex items-center justify-between border-t border-border/40 pt-2.5 mb-3 text-xs text-muted-foreground">
          {/* Tác giả */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="relative size-6 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted/60 flex items-center justify-center">
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
                <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 font-bold text-[9px]">
                  {getAuthorInitials(authorName)}
                </div>
              )}
            </div>
            <span className="font-medium text-foreground truncate max-w-[120px]">
              {authorName}
            </span>
          </div>

          {/* Lượt xem & ngày */}
          <div className="flex items-center gap-3 shrink-0">
            <span className="flex items-center gap-1 font-mono text-[11px]">
              <Eye className="size-3 text-muted-foreground/70" />
              {formatViews(article.views)}
            </span>
            <span className="flex items-center gap-1 text-[11px]">
              <Calendar className="size-3 text-muted-foreground/70" />
              {formatDate(article.created_at)}
            </span>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-1.5 border-t border-border/40 pt-2.5">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPreview(article)}
          className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground"
        >
          <Eye className="size-3.5" />
          <span>Xem trước</span>
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onEdit(article)}
          className="h-8 gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/30"
        >
          <Pencil className="size-3.5" />
          <span>Sửa</span>
        </Button>

        {isDeleted ? (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRestore(article)}
            className="h-8 gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/30"
          >
            <RotateCcw className="size-3.5" />
            <span>Khôi phục</span>
          </Button>
        ) : (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onDelete(article)}
            className="h-8 gap-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30"
          >
            <Trash2 className="size-3.5" />
            <span>Ẩn</span>
          </Button>
        )}
      </div>
    </div>
  )
}
