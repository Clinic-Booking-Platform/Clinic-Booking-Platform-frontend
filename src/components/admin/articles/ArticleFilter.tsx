import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  Lock,
  Layers,
  Filter,
  Stethoscope,
  User,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { ArticleStatusFilter } from '@/types/article.types'
import type { Specialty } from '@/types/specialty.types'
import type { Doctor } from '@/types/doctor.types'
import type { AuthorFilterOption } from './article.utils'

interface ArticleFilterProps {
  search: string
  onSearchChange: (value: string) => void
  specialtyId?: number
  onSpecialtyChange: (specialtyId?: number) => void
  specialties: Specialty[]
  authorId?: number
  onAuthorChange: (authorId?: number) => void
  doctors?: Doctor[]
  authorOptions?: AuthorFilterOption[]
  status: ArticleStatusFilter
  onStatusChange: (status: ArticleStatusFilter) => void
  onReset: () => void
  onRefresh: () => void
  isLoading?: boolean
  totalItems?: number
}

export const ArticleFilter: React.FC<ArticleFilterProps> = ({
  search,
  onSearchChange,
  specialtyId,
  onSpecialtyChange,
  specialties,
  authorId,
  onAuthorChange,
  authorOptions,
  status,
  onStatusChange,
  onReset,
  onRefresh,
  isLoading = false,
  totalItems,
}) => {
  const [prevSearch, setPrevSearch] = useState(search)
  const [localSearch, setLocalSearch] = useState(search)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Đồng bộ search khi prop thay đổi từ URL (Back/Forward/Reset)
  if (prevSearch !== search) {
    setPrevSearch(search)
    setLocalSearch(search)
  }

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }
    }
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setLocalSearch(val)
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    debounceTimerRef.current = setTimeout(() => {
      onSearchChange(val)
    }, 400)
  }

  const handleClearSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current)
    }
    setLocalSearch('')
    onSearchChange('')
  }

  const statusOptions: {
    value: ArticleStatusFilter
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { value: 'all', label: 'Tất cả bài viết', icon: Layers },
    { value: 'active', label: 'Đang hiển thị', icon: CheckCircle2 },
    { value: 'deleted', label: 'Đã ẩn / Xóa', icon: Lock },
  ]

  const hasActiveFilter = Boolean(
    search || specialtyId !== undefined || authorId !== undefined || status !== 'all'
  )

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* 1. Ô tìm kiếm theo tiêu đề bài viết */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={handleInputChange}
            placeholder="Tìm kiếm theo tiêu đề bài viết tin tức..."
            className="w-full rounded-lg border border-input bg-background/60 py-2 pl-9 pr-9 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 2. Dropdowns chọn Chuyên khoa & Tác giả */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2">
          {/* Chuyên khoa */}
          <div className="relative min-w-[170px] flex-1 sm:flex-initial">
            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={specialtyId !== undefined ? String(specialtyId) : ''}
              onChange={(e) => {
                const val = e.target.value
                onSpecialtyChange(val ? Number(val) : undefined)
              }}
              className="w-full appearance-none rounded-lg border border-input bg-background/60 py-2 pl-9 pr-8 text-xs sm:text-sm text-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">Tất cả chuyên khoa</option>
              {specialties.map((spec) => (
                <option key={spec.id} value={spec.id}>
                  {spec.name}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Tác giả Bác sĩ (Chỉ hiển thị các tác giả ĐÃ CÓ bài viết) */}
          <div className="relative min-w-[200px] flex-1 sm:flex-initial">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            <select
              value={authorId !== undefined ? String(authorId) : ''}
              onChange={(e) => {
                const val = e.target.value
                onAuthorChange(val ? Number(val) : undefined)
              }}
              className="w-full appearance-none rounded-lg border border-input bg-background/60 py-2 pl-9 pr-8 text-xs sm:text-sm text-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">Tất cả tác giả</option>

              {authorOptions && authorOptions.length > 0
                ? authorOptions
                    .filter((a) => a.articleCount > 0)
                    .map((author) => (
                      <option key={author.id} value={author.id}>
                        {author.name} ({author.articleCount} bài viết)
                      </option>
                    ))
                : null}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Nút Reset & Refresh */}
          <div className="flex items-center gap-1.5 shrink-0 ml-auto">
            {hasActiveFilter && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={onReset}
                className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted"
                title="Đặt lại toàn bộ bộ lọc"
              >
                <RotateCcw className="size-3.5 mr-1" />
                <span className="hidden sm:inline">Đặt lại</span>
              </Button>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="h-9 px-3 text-xs"
              title="Làm mới danh sách"
            >
              <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline ml-1.5">Tải lại</span>
            </Button>
          </div>
        </div>
      </div>

      {/* 3. Filter tabs trạng thái & Tổng kết số lượng */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5">
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-lg">
          {statusOptions.map((opt) => {
            const Icon = opt.icon
            const isSelected = status === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange(opt.value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all ${
                  isSelected
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                <Icon
                  className={`size-3.5 ${
                    isSelected
                      ? opt.value === 'active'
                        ? 'text-emerald-500'
                        : opt.value === 'deleted'
                        ? 'text-rose-500'
                        : 'text-teal-500'
                      : 'text-muted-foreground'
                  }`}
                />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>

        {totalItems !== undefined && (
          <div className="text-xs text-muted-foreground font-medium pr-1">
            Tổng cộng: <strong className="text-foreground">{totalItems}</strong> bài viết
          </div>
        )}
      </div>
    </div>
  )
}
