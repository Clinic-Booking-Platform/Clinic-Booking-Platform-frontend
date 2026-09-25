import React, { useState, useEffect } from 'react'
import {
  X,
  Calendar,
  Eye,
  Clock,
  Stethoscope,
  Pencil,
  Loader2,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { articleApi } from '@/services/article.api'
import { formatDate, formatViews, getAuthorInitials } from './article.utils'
import type { Article } from '@/types/article.types'

interface ArticlePreviewModalProps {
  isOpen: boolean
  onClose: () => void
  article: Article | null
  onEdit?: (article: Article) => void
}

export const ArticlePreviewModal: React.FC<ArticlePreviewModalProps> = ({
  isOpen,
  onClose,
  article,
  onEdit,
}) => {
  const [fetchedDetail, setFetchedDetail] = useState<Article | null>(null)

  const hasDetailContent = Boolean(article?.article_detail?.html_content)
  const isDetailFetched = Boolean(fetchedDetail && fetchedDetail.id === article?.id)
  const isLoading = Boolean(isOpen && article && !hasDetailContent && !isDetailFetched)

  useEffect(() => {
    if (!isOpen || !article) return

    // Nếu bài viết đã có sẵn html_content, không cần gọi API
    if (article.article_detail?.html_content) return

    let isMounted = true

    articleApi
      .getArticleById(article.id)
      .then((res) => {
        if (isMounted) {
          setFetchedDetail(res)
        }
      })
      .catch((err) => {
        console.error('Lỗi khi tải chi tiết bài viết preview:', err)
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, article])

  // ESC to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen || !article) return null

  const current = (fetchedDetail && fetchedDetail.id === article.id) ? fetchedDetail : article
  const specialty = current.specialty
  const authorUser = current.author?.user
  const authorName = authorUser?.full_name || 'Bác sĩ phụ trách'
  const authorAvatar = authorUser?.avatar
  const htmlContent = current.article_detail?.html_content || ''

  // Ước tính thời gian đọc (trung bình 200 từ/phút)
  const plainText = htmlContent.replace(/<[^>]+>/g, ' ')
  const wordCount = plainText.trim().split(/\s+/).filter(Boolean).length
  const readingTime = Math.max(1, Math.ceil(wordCount / 200))

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative flex flex-col w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl z-10">
        {/* Top Bar with Info & Controls */}
        <div className="flex items-center justify-between border-b border-border/80 px-6 py-3.5 bg-muted/40 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2.5 py-1 rounded-md">
              Bản xem trước (Patient View)
            </span>
            <span className="text-xs text-muted-foreground hidden sm:inline">
              Mã bài viết: #{current.id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onEdit && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onEdit(current)
                }}
                className="h-8 gap-1.5 text-xs text-teal-600 dark:text-teal-400 hover:bg-teal-50"
              >
                <Pencil className="size-3.5" />
                <span>Chỉnh sửa</span>
              </Button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Đóng"
            >
              <X className="size-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Article Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <Loader2 className="size-8 animate-spin text-teal-600" />
              <p className="text-sm text-muted-foreground">Đang tải bài viết...</p>
            </div>
          ) : (
            <article className="max-w-3xl mx-auto space-y-6">
              {/* Meta Tags & Breadcrumb style */}
              <div className="flex flex-wrap items-center gap-2.5 text-xs">
                {specialty?.name ? (
                  <Badge
                    variant="outline"
                    className="gap-1 font-medium text-xs py-1 px-2.5 bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/25"
                  >
                    <Stethoscope className="size-3 text-teal-600 dark:text-teal-400" />
                    <span>{specialty.name}</span>
                  </Badge>
                ) : (
                  <span className="text-xs text-muted-foreground italic">Kiến thức y khoa</span>
                )}

                <span className="text-muted-foreground">•</span>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <Calendar className="size-3.5 text-muted-foreground/70" />
                  <span>{formatDate(current.created_at)}</span>
                </div>

                <span className="text-muted-foreground">•</span>

                <div className="flex items-center gap-1 text-muted-foreground font-mono">
                  <Eye className="size-3.5 text-muted-foreground/70" />
                  <span>{formatViews(current.views)} lượt xem</span>
                </div>

                <span className="text-muted-foreground">•</span>

                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="size-3.5 text-muted-foreground/70" />
                  <span>~{readingTime} phút đọc</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-foreground tracking-tight leading-tight">
                {current.title}
              </h1>

              {/* Author Card Info */}
              <div className="flex items-center justify-between border-y border-border/60 py-3.5">
                <div className="flex items-center gap-3">
                  <div className="relative size-11 shrink-0 overflow-hidden rounded-full border border-border/80 bg-muted/60 flex items-center justify-center shadow-xs">
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
                      <div className="flex size-full items-center justify-center bg-teal-500/10 text-teal-700 dark:text-teal-300 font-bold text-xs">
                        {getAuthorInitials(authorName)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-semibold text-foreground">
                      BS. {authorName}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {specialty?.name ? `Chuyên khoa ${specialty.name}` : 'Bác sĩ tham vấn y khoa'}
                    </div>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                    Đã được kiểm duyệt y khoa
                  </span>
                </div>
              </div>

              {/* Short Description (Sapo) */}
              {current.short_description && (
                <div className="rounded-xl border-l-4 border-teal-500 bg-teal-500/5 p-4 text-sm font-medium text-foreground/90 leading-relaxed italic">
                  {current.short_description}
                </div>
              )}

              {/* Hero Banner Thumbnail */}
              {current.thumbnail_url && (
                <div className="overflow-hidden rounded-2xl border border-border/80 shadow-md">
                  <img
                    src={current.thumbnail_url}
                    alt={current.title}
                    className="w-full max-h-[420px] object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                </div>
              )}

              {/* Article HTML Content */}
              <div
                className="text-foreground leading-relaxed space-y-4 pt-2 [&_h2]:text-xl sm:[&_h2]:text-2xl [&_h2]:font-bold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-3 [&_h2]:border-b [&_h2]:border-border/40 [&_h2]:pb-2 [&_h3]:text-lg sm:[&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-sm sm:[&_p]:text-base [&_p]:text-foreground/90 [&_p]:leading-relaxed [&_p]:mb-3 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1.5 [&_ul]:mb-4 [&_ul]:text-sm sm:[&_ul]:text-base [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:space-y-1.5 [&_ol]:mb-4 [&_ol]:text-sm sm:[&_ol]:text-base [&_blockquote]:border-l-4 [&_blockquote]:border-teal-500 [&_blockquote]:bg-teal-50/50 dark:[&_blockquote]:bg-teal-950/20 [&_blockquote]:p-3 [&_blockquote]:rounded-r-lg [&_blockquote]:italic [&_blockquote]:my-4 [&_img]:rounded-xl [&_img]:shadow-sm [&_img]:my-4 [&_img]:max-h-[450px] [&_img]:w-full [&_img]:object-cover"
                dangerouslySetInnerHTML={{
                  __html:
                    htmlContent ||
                    '<p class="italic text-muted-foreground">Bài viết hiện chưa có nội dung chi tiết.</p>',
                }}
              />

              {/* Medical Disclaimer Banner */}
              <div className="mt-8 rounded-xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3 text-xs text-amber-800 dark:text-amber-300">
                <ShieldAlert className="size-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-semibold">Khuyến cáo y khoa từ Clinic Booking Platform:</span>
                  <p className="leading-relaxed opacity-90">
                    Nội dung bài viết được biên soạn nhằm mục đích chia sẻ kiến thức sức khỏe, không thay thế cho việc chẩn đoán hoặc điều trị y tế chuyên sâu. Khi có các dấu hiệu bất thường, bệnh nhân vui lòng đặt lịch khám trực tiếp với bác sĩ chuyên khoa.
                  </p>
                </div>
              </div>
            </article>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end border-t border-border/80 px-6 py-3 bg-muted/40 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Đóng xem trước
          </Button>
        </div>
      </div>
    </div>
  )
}
