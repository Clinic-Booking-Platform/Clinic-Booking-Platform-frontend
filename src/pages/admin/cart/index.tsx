// ================= FILE: src/pages/admin/cart/index.tsx =================

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ShoppingCart,
  TrendingUp,
  Package,
  Coins,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { cartApi } from '@/services/cart.api'
import type {
  CartListItem,
  Pagination as IPagination,
} from '@/types/cart.types'

import {
  CartFilter,
  CartList,
  CartDetail,
  formatCurrency,
  extractErrorMessage,
} from '@/components/cart'

export const CartListPage: React.FC = () => {
  // 1. Quản lý trạng thái qua URL SearchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const rawPageSize = searchParams.get('pageSize')
  const parsedPageSize = rawPageSize ? parseInt(rawPageSize, 10) : 5
  const pageSize = isNaN(parsedPageSize) || parsedPageSize < 1 ? 5 : parsedPageSize

  const search = searchParams.get('search') || ''
  const priceRange = searchParams.get('price_range') || ''

  // 2. Local State
  const [carts, setCarts] = useState<CartListItem[]>([])
  const [pagination, setPagination] = useState<IPagination | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal xem chi tiết
  const [selectedCartId, setSelectedCartId] = useState<number | string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 3. Tải danh sách giỏ hàng từ API
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      try {
        const res = await cartApi.getAdminCarts({
          page,
          pageSize,
          search: search || undefined,
          price_range: priceRange || undefined,
        })

        if (!ignore) {
          const data = res.data
          setCarts(data.carts || [])
          setPagination(
            data.pagination || {
              page,
              pageSize,
              total: data.carts?.length || 0,
              totalPages: Math.ceil((data.carts?.length || 0) / pageSize) || 1,
            }
          )
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải danh sách giỏ hàng!')
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
  }, [page, pageSize, search, priceRange])

  // Hàm reload thủ công
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await cartApi.getAdminCarts({
        page,
        pageSize,
        search: search || undefined,
        price_range: priceRange || undefined,
      })
      const data = res.data
      setCarts(data.carts || [])
      setPagination(
        data.pagination || {
          page,
          pageSize,
          total: data.carts?.length || 0,
          totalPages: Math.ceil((data.carts?.length || 0) / pageSize) || 1,
        }
      )
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Không thể tải danh sách giỏ hàng!')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, search, priceRange])

  // 4. Handlers cập nhật URL SearchParams
  const updateQueryParam = (updates: Record<string, string | undefined>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(updates).forEach(([key, val]) => {
          if (val === undefined || val === '') {
            next.delete(key)
          } else {
            next.set(key, val)
          }
        })
        return next
      },
      { replace: true }
    )
  }

  const handlePageChange = (newPage: number) => {
    updateQueryParam({ page: String(newPage) })
  }

  const handleSearchChange = (val: string) => {
    updateQueryParam({ search: val || undefined, page: '1' })
  }

  const handlePriceRangeChange = (val: string) => {
    updateQueryParam({ price_range: val || undefined, page: '1' })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const handleViewDetail = (item: CartListItem) => {
    setSelectedCartId(item.id)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedCartId(null)
  }

  // 5. Thống kê nhanh từ danh sách hiện tại
  const highValueCount = carts.filter((c) => (c.total_amount || 0) >= 1000000).length
  const totalPackagesInList = carts.reduce((acc, c) => acc + (c.total_items || c.sum || 0), 0)
  const totalAmountInList = carts.reduce((acc, c) => acc + (c.total_amount || 0), 0)
  const hasFilter = Boolean(search || priceRange)

  return (
    <div className="space-y-6">
      {/* 1. Header Trang & Phân quyền Read-Only */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ShoppingCart className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản lý Giỏ hàng
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <ShieldCheck className="size-3" />
              <span>Chỉ xem (Read-Only)</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Xem và theo dõi giỏ hàng hiện tại của tất cả người dùng trên hệ thống trước khi đặt lịch hoặc thanh toán
          </p>
        </div>
      </div>

      {/* 2. Thẻ thống kê nhanh (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng giỏ hàng */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng giỏ hàng</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ShoppingCart className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {pagination?.total ?? carts.length}
            </span>
            <span className="text-xs text-muted-foreground">giỏ hoạt động</span>
          </div>
        </div>

        {/* Giỏ giá trị cao (>= 1.000.000₫) */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Giỏ giá trị cao (≥ 1tr)</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <TrendingUp className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {highValueCount}
            </span>
            <span className="text-xs text-muted-foreground">giỏ tiềm năng</span>
          </div>
        </div>

        {/* Tổng số gói khám đang lưu */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng gói đang lưu</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              <Package className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {totalPackagesInList}
            </span>
            <span className="text-xs text-muted-foreground">gói khám</span>
          </div>
        </div>

        {/* Tổng giá trị danh sách */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng giá trị (trang này)</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Coins className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400 truncate" title={formatCurrency(totalAmountInList)}>
              {formatCurrency(totalAmountInList)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Lỗi nếu có */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-center justify-between gap-3 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="underline font-semibold hover:opacity-80 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4. Bộ lọc tìm kiếm */}
      <CartFilter
        search={search}
        onSearchChange={handleSearchChange}
        priceRange={priceRange}
        onPriceRangeChange={handlePriceRangeChange}
        onReset={handleResetFilters}
        onRefresh={() => void refetch()}
        isLoading={isLoading}
      />

      {/* 5. Bảng danh sách giỏ hàng */}
      <CartList
        carts={carts}
        pagination={pagination}
        isLoading={isLoading}
        hasFilter={hasFilter}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
      />

      {/* 6. Modal xem chi tiết giỏ hàng (Read-only) */}
      <CartDetail
        isOpen={isDetailOpen}
        cartId={selectedCartId}
        onClose={handleCloseDetail}
      />
    </div>
  )
}

export default CartListPage
