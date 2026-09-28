// ================= FILE: src/pages/admin/order/index.tsx =================

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  ReceiptText,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  ShieldCheck,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { orderApi } from '@/services/order.api'
import type {
  OrderListItem,
  Pagination as IPagination,
  PaymentStatus,
} from '@/types/order.types'

import {
  OrderFilter,
  OrderList,
  OrderDetail,
  extractErrorMessage,
} from '@/components/order'

export const OrderListPage: React.FC = () => {
  // 1. Quản lý trạng thái qua URL SearchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const rawPageSize = searchParams.get('pageSize')
  const parsedPageSize = rawPageSize ? parseInt(rawPageSize, 10) : 5
  const pageSize = isNaN(parsedPageSize) || parsedPageSize < 1 ? 5 : parsedPageSize

  const search = searchParams.get('search') || ''

  const rawStatus = searchParams.get('status')
  const status: PaymentStatus | 'ALL' =
    rawStatus === 'PAID' ||
    rawStatus === 'UNPAID' ||
    rawStatus === 'FAILED' ||
    rawStatus === 'CANCELLED'
      ? rawStatus
      : 'ALL'

  const fromDate = searchParams.get('from_date') || ''
  const toDate = searchParams.get('to_date') || ''

  // 2. Local State
  const [orders, setOrders] = useState<OrderListItem[]>([])
  const [pagination, setPagination] = useState<IPagination | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Modal xem chi tiết
  const [selectedOrderId, setSelectedOrderId] = useState<number | string | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 3. Tải danh sách đơn hàng từ API
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      try {
        const res = await orderApi.getAdminOrders({
          page,
          pageSize,
          search: search || undefined,
          status: status !== 'ALL' ? status : undefined,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        })

        if (!ignore) {
          const data = res.data
          setOrders(data.orders || [])
          setPagination(
            data.pagination || {
              page,
              pageSize,
              total: data.orders?.length || 0,
              totalPages: Math.ceil((data.orders?.length || 0) / pageSize) || 1,
            }
          )
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải danh sách đơn hàng!')
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
  }, [page, pageSize, search, status, fromDate, toDate])

  // Hàm reload thủ công
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await orderApi.getAdminOrders({
        page,
        pageSize,
        search: search || undefined,
        status: status !== 'ALL' ? status : undefined,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      })
      const data = res.data
      setOrders(data.orders || [])
      setPagination(
        data.pagination || {
          page,
          pageSize,
          total: data.orders?.length || 0,
          totalPages: Math.ceil((data.orders?.length || 0) / pageSize) || 1,
        }
      )
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Không thể tải danh sách đơn hàng!')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, search, status, fromDate, toDate])

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

  const handleStatusChange = (newStatus: PaymentStatus | 'ALL') => {
    updateQueryParam({
      status: newStatus !== 'ALL' ? newStatus : undefined,
      page: '1',
    })
  }

  const handleFromDateChange = (val: string) => {
    updateQueryParam({ from_date: val || undefined, page: '1' })
  }

  const handleToDateChange = (val: string) => {
    updateQueryParam({ to_date: val || undefined, page: '1' })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const handleViewDetail = (item: OrderListItem) => {
    setSelectedOrderId(item.id)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedOrderId(null)
  }

  // 5. Thống kê nhanh từ danh sách hiện tại
  const paidCount = orders.filter((o) => o.payment_status === 'PAID').length
  const unpaidCount = orders.filter((o) => o.payment_status === 'UNPAID' && !o.is_expired && !o.deleted_at).length
  const failedOrCancelledCount = orders.filter(
    (o) => o.payment_status === 'FAILED' || o.is_expired || Boolean(o.deleted_at)
  ).length
  const hasFilter = Boolean(search || status !== 'ALL' || fromDate || toDate)

  return (
    <div className="space-y-6">
      {/* 1. Header Trang & Phân quyền Read-Only */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ReceiptText className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản lý Đơn hàng
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <ShieldCheck className="size-3" />
              <span>Chỉ xem (Read-Only)</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Xem và tra cứu tất cả đơn hàng gói khám, tiến độ sử dụng và đối soát giao dịch trong hệ thống
          </p>
        </div>
      </div>

      {/* 2. Thẻ thống kê nhanh (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng đơn hàng */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng đơn hàng</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ReceiptText className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {pagination?.total ?? orders.length}
            </span>
            <span className="text-xs text-muted-foreground">đơn</span>
          </div>
        </div>

        {/* Đã thanh toán */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã thanh toán (PAID)</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {paidCount}
            </span>
            <span className="text-xs text-muted-foreground">đơn thành công</span>
          </div>
        </div>

        {/* Chờ thanh toán */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Chờ thanh toán (UNPAID)</span>
          <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {unpaidCount}
            </span>
            <span className="text-xs text-muted-foreground">trong 15 phút</span>
          </div>
        </div>

        {/* Thất bại / Đã hủy */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Thất bại / Đã hủy</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-red-500/10 text-red-600 dark:text-red-400">
              <XCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-red-600 dark:text-red-400">
              {failedOrCancelledCount}
            </span>
            <span className="text-xs text-muted-foreground">đơn không thành</span>
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
      <OrderFilter
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        onReset={handleResetFilters}
        onRefresh={() => void refetch()}
        isLoading={isLoading}
      />

      {/* 5. Bảng danh sách đơn hàng */}
      <OrderList
        orders={orders}
        pagination={pagination}
        isLoading={isLoading}
        hasFilter={hasFilter}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
      />

      {/* 6. Modal xem chi tiết đơn hàng (Read-only) */}
      <OrderDetail
        isOpen={isDetailOpen}
        orderId={selectedOrderId}
        onClose={handleCloseDetail}
      />
    </div>
  )
}

export default OrderListPage
