import React, { useState, useEffect, useRef } from 'react'
import {
  Search,
  X,
  RefreshCw,
  CheckCircle2,
  Trash2,
  Layers,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PackageStatusFilter } from '@/types/package.types'
import { PRICE_RANGE_OPTIONS } from './package.utils'

interface PackageFilterProps {
  search: string
  onSearchChange: (value: string) => void
  status: PackageStatusFilter
  onStatusChange: (status: PackageStatusFilter) => void
  priceRange: string
  onPriceRangeChange: (priceRange: string) => void
  onRefresh: () => void
  isLoading?: boolean
  totalItems?: number
}

export const PackageFilter: React.FC<PackageFilterProps> = ({
  search,
  onSearchChange,
  status,
  onStatusChange,
  priceRange,
  onPriceRangeChange,
  onRefresh,
  isLoading = false,
  totalItems,
}) => {
  const [prevSearch, setPrevSearch] = useState(search)
  const [localSearch, setLocalSearch] = useState(search)
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Đồng bộ tức thời khi search param trên URL thay đổi (Back/Forward/Reset)
  if (prevSearch !== search) {
    setPrevSearch(search)
    setLocalSearch(search)
  }

  // Dọn dẹp timer khi unmount
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
    value: PackageStatusFilter
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { value: 'all', label: 'Tất cả', icon: Layers },
    { value: 'active', label: 'Đang áp dụng', icon: CheckCircle2 },
    { value: 'deleted', label: 'Đã ngừng cung cấp', icon: Trash2 },
  ]

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Input Tìm kiếm có Debounce */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={handleInputChange}
            placeholder="Tìm theo tên gói khám hoặc dịch vụ..."
            className="w-full h-9 rounded-lg border border-input bg-background/60 pl-9 pr-9 text-sm text-foreground placeholder:text-muted-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
          />
          {localSearch && (
            <button
              type="button"
              onClick={handleClearSearch}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground transition-colors"
              title="Xóa tìm kiếm"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* Lọc khoảng giá & Nút làm mới */}
        <div className="flex flex-wrap items-center justify-between md:justify-end gap-2">
          {/* Select khoảng giá */}
          <div className="flex items-center gap-1.5">
            <Filter className="size-3.5 text-muted-foreground shrink-0 hidden sm:inline" />
            <select
              value={priceRange}
              onChange={(e) => onPriceRangeChange(e.target.value)}
              className="h-9 rounded-lg border border-input bg-background/60 px-2.5 text-xs text-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
            >
              {PRICE_RANGE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {totalItems !== undefined && (
            <span className="text-xs text-muted-foreground hidden lg:inline">
              Tổng số: <strong className="font-semibold text-foreground">{totalItems}</strong>
            </span>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground"
            title="Tải lại danh sách"
          >
            <RefreshCw
              className={`size-3.5 mr-1.5 ${isLoading ? 'animate-spin text-teal-600' : ''}`}
            />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Tabs lọc trạng thái */}
      <div className="flex items-center gap-1.5 overflow-x-auto border-t border-border/40 pt-2.5">
        <span className="text-xs font-medium text-muted-foreground mr-1 hidden sm:inline">
          Trạng thái:
        </span>
        {statusOptions.map((opt) => {
          const Icon = opt.icon
          const isActive = status === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onStatusChange(opt.value)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs dark:bg-teal-500 dark:text-zinc-950 font-semibold'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <Icon className="size-3.5" />
              <span>{opt.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
