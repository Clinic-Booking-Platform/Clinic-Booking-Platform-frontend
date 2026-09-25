import React from 'react'
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'

export interface PaginationProps {
  currentPage: number
  totalPages: number
  totalItems?: number
  pageSize?: number
  onPageChange: (page: number) => void
  itemLabel?: string
  className?: string
  showInfo?: boolean
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  pageSize = 10,
  onPageChange,
  itemLabel = 'bản ghi',
  className = '',
  showInfo = true,
}) => {
  if (totalPages <= 1 && !totalItems) return null

  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = totalItems ? Math.min(currentPage * pageSize, totalItems) : currentPage * pageSize

  // Thuật toán tính danh sách trang hiển thị (hỗ trợ dấu ba chấm '...')
  const getPageNumbers = (): (number | string)[] => {
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, '...', totalPages]
    }

    if (currentPage >= totalPages - 3) {
      return [1, '...', totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages]
    }

    return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages]
  }

  const pageNumbers = getPageNumbers()

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border/60 bg-muted/20 px-4 py-3 text-xs text-muted-foreground ${className}`}
    >
      {/* Thông tin số lượng hiển thị */}
      {showInfo && totalItems !== undefined ? (
        <div>
          Hiển thị <span className="font-semibold text-foreground">{startItem}</span> -{' '}
          <span className="font-semibold text-foreground">{endItem}</span> trên tổng số{' '}
          <span className="font-semibold text-foreground">{totalItems}</span> {itemLabel}
        </div>
      ) : (
        <div />
      )}

      {/* Điều khiển chuyển trang */}
      <div className="flex items-center gap-1.5">
        {/* Nút Trang Trước */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 px-2.5 text-xs gap-1"
          aria-label="Trang trước"
        >
          <ChevronLeft className="size-3.5" />
          <span className="hidden sm:inline">Trước</span>
        </Button>

        {/* Danh sách các số trang */}
        <div className="flex items-center gap-1 px-1">
          {pageNumbers.map((page, index) => {
            if (page === '...') {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="flex size-8 items-center justify-center text-muted-foreground"
                >
                  <MoreHorizontal className="size-3.5" />
                </span>
              )
            }

            const pageNum = Number(page)
            const isCurrent = pageNum === currentPage

            return (
              <button
                key={pageNum}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isCurrent ? 'page' : undefined}
                className={`size-8 rounded-lg text-xs font-medium transition-colors ${
                  isCurrent
                    ? 'bg-teal-600 text-white font-semibold dark:bg-teal-500 dark:text-zinc-950 shadow-2xs'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {pageNum}
              </button>
            )
          })}
        </div>

        {/* Nút Trang Sau */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 px-2.5 text-xs gap-1"
          aria-label="Trang sau"
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="size-3.5" />
        </Button>
      </div>
    </div>
  )
}
