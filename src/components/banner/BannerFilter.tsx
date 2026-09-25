import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  EyeOff,
  Layers,
  RotateCcw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { BannerStatusFilter } from '@/types/banner.types'

interface BannerFilterProps {
  search: string
  onSearchChange: (value: string) => void
  status: BannerStatusFilter
  onStatusChange: (status: BannerStatusFilter) => void
  onReset: () => void
  onRefresh: () => void
  isLoading?: boolean
  totalItems?: number
}

export const BannerFilter: React.FC<BannerFilterProps> = ({
  search,
  onSearchChange,
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
    value: BannerStatusFilter
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { value: 'all', label: 'Tất cả banner', icon: Layers },
    { value: 'active', label: 'Đang hiển thị', icon: CheckCircle2 },
    { value: 'inactive', label: 'Tạm ẩn', icon: EyeOff },
  ]

  const hasActiveFilter = Boolean(search || status !== 'all')

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* 1. Ô tìm kiếm theo tiêu đề banner */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={handleInputChange}
            placeholder="Tìm kiếm banner theo tiêu đề chiến dịch..."
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

        {/* 2. Nút Reset & Refresh */}
        <div className="flex items-center gap-2 shrink-0">
          {hasActiveFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              <span>Đặt lại</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 px-3 text-xs cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-1.5">Tải lại</span>
          </Button>
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
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
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
                        : opt.value === 'inactive'
                        ? 'text-amber-500'
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
            Tổng cộng: <strong className="text-foreground">{totalItems}</strong> banner
          </div>
        )}
      </div>
    </div>
  )
}
