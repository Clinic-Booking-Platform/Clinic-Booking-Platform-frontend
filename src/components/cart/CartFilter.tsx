// ================= FILE: src/components/cart/CartFilter.tsx =================

import React, { useState, useEffect } from 'react'
import {
  Search,
  RotateCcw,
  RefreshCw,
  X,
  Tag,
  CircleDollarSign,
  Check,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PRICE_RANGES } from './cart.utils'

export interface CartFilterProps {
  search: string
  onSearchChange: (value: string) => void
  priceRange: string
  onPriceRangeChange: (priceRange: string) => void
  onReset: () => void
  onRefresh: () => void
  isLoading?: boolean
}

export const CartFilter: React.FC<CartFilterProps> = ({
  search,
  onSearchChange,
  priceRange,
  onPriceRangeChange,
  onReset,
  onRefresh,
  isLoading = false,
}) => {
  // Local state for debounced search with render-time sync
  const [localSearch, setLocalSearch] = useState(search)
  const [prevSearch, setPrevSearch] = useState(search)
  if (search !== prevSearch) {
    setPrevSearch(search)
    setLocalSearch(search)
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      if (localSearch !== search) {
        onSearchChange(localSearch)
      }
    }, 500)
    return () => clearTimeout(handler)
  }, [localSearch, search, onSearchChange])

  // Chuyển chuỗi price_range (ví dụ "100-300,tren-1000") thành mảng các keys
  const selectedRanges = priceRange
    ? priceRange.split(',').map((s) => s.trim()).filter(Boolean)
    : []

  // Toggle 1 khoảng giá
  const handleToggleRange = (rangeKey: string) => {
    let next: string[]
    if (selectedRanges.includes(rangeKey)) {
      next = selectedRanges.filter((k) => k !== rangeKey)
    } else {
      next = [...selectedRanges, rangeKey]
    }
    onPriceRangeChange(next.join(','))
  }

  const handleClearRanges = () => {
    onPriceRangeChange('')
  }

  // Đếm số lượng bộ lọc đang hoạt động
  const activeFiltersCount = [
    Boolean(search),
    selectedRanges.length > 0,
  ].filter(Boolean).length

  return (
    <div className="rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-2xs space-y-3">
      {/* Hàng lọc chính */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2.5 items-center">
        {/* 1. Ô tìm kiếm người dùng (chiếm 7 cột trên desktop) */}
        <div className="md:col-span-7 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm tên, email, SĐT người dùng..."
            className="w-full h-9.5 pl-9 pr-8 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('')
                onSearchChange('')
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 2. Nhóm nút Reset & Refresh (chiếm 5 cột trên desktop, căn phải) */}
        <div className="md:col-span-5 flex items-center justify-end gap-2">
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9.5 px-3 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="Xóa tất cả bộ lọc"
            >
              <RotateCcw className="size-3.5" />
              <span>Xóa ({activeFiltersCount})</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9.5 px-3 gap-1.5 text-xs text-muted-foreground hover:text-teal-600 hover:border-teal-500/40 cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Dòng lọc theo Khoảng giá tổng giỏ hàng (Multi-select Chips) */}
      <div className="flex flex-wrap items-center gap-2 pt-2.5 border-t border-border/50 text-xs">
        <div className="flex items-center gap-1.5 text-muted-foreground font-medium shrink-0">
          <CircleDollarSign className="size-3.5 text-teal-600 dark:text-teal-400" />
          <span>Khoảng giá giỏ hàng:</span>
        </div>

        {/* Nút Tất cả */}
        <button
          type="button"
          onClick={handleClearRanges}
          className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 border ${
            selectedRanges.length === 0
              ? 'bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/30 font-semibold'
              : 'bg-muted/50 text-muted-foreground border-border/60 hover:text-foreground hover:bg-muted'
          }`}
        >
          {selectedRanges.length === 0 && <Check className="size-3" />}
          <span>Tất cả</span>
        </button>

        {/* Danh sách các khoảng giá có thể chọn nhiều */}
        {PRICE_RANGES.map((range) => {
          const isSelected = selectedRanges.includes(range.key)
          return (
            <button
              key={range.key}
              type="button"
              onClick={() => handleToggleRange(range.key)}
              className={`h-7 px-2.5 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5 border ${
                isSelected
                  ? 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/40 font-semibold shadow-2xs'
                  : 'bg-background text-muted-foreground border-border/70 hover:text-foreground hover:bg-muted/40'
              }`}
              title={`Lọc giỏ hàng có giá trị: ${range.label}`}
            >
              {isSelected ? (
                <Check className="size-3 text-teal-600 dark:text-teal-400" />
              ) : (
                <Tag className="size-3 opacity-60" />
              )}
              <span>{range.label}</span>
            </button>
          )
        })}

        {selectedRanges.length > 0 && (
          <button
            type="button"
            onClick={handleClearRanges}
            className="text-[11px] text-rose-500 hover:underline cursor-pointer ml-1"
          >
            Bỏ chọn khoảng giá
          </button>
        )}
      </div>
    </div>
  )
}

export default CartFilter
