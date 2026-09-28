// ================= FILE: src/components/order/OrderList.tsx =================

import React from 'react'
import {
  Eye,
  Receipt,
  CreditCard,
  Banknote,
  FileX,
  Inbox,
  Clock,
  Phone,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import type {
  OrderListItem,
  Pagination as IPagination,
} from '@/types/order.types'
import { OrderStatusBadge } from './OrderStatusBadge'
import {
  formatCurrency,
  formatDateTime,
} from './order.utils'

export interface OrderListProps {
  orders: OrderListItem[]
  pagination: IPagination | null
  isLoading?: boolean
  hasFilter?: boolean
  onPageChange: (page: number) => void
  onViewDetail: (order: OrderListItem) => void
}

export const OrderList: React.FC<OrderListProps> = ({
  orders,
  pagination,
  isLoading = false,
  hasFilter = false,
  onPageChange,
  onViewDetail,
}) => {
  // 1. Loading Skeleton State (5 dòng skeleton)
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              <tr>
                <th className="py-3.5 pl-4 pr-3 min-w-[150px]">Mã đơn hàng</th>
                <th className="px-3 py-3.5 min-w-[170px]">Khách hàng</th>
                <th className="px-3 py-3.5 min-w-[170px]">Email</th>
                <th className="px-3 py-3.5 min-w-[130px]">Tổng tiền</th>
                <th className="px-3 py-3.5 min-w-[120px]">Phương thức</th>
                <th className="px-3 py-3.5 text-center min-w-[130px]">Trạng thái</th>
                <th className="px-3 py-3.5 min-w-[140px]">Ngày tạo</th>
                <th className="py-3.5 pl-3 pr-4 text-right min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-4 pr-3">
                    <div className="h-4 w-28 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="flex items-center gap-2">
                      <div className="size-8 rounded-full bg-muted shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-24 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-3.5 w-32 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-20 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-5 w-16 bg-muted rounded-full" />
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="h-6 w-24 mx-auto bg-muted rounded-full" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-3.5 w-24 bg-muted rounded" />
                  </td>
                  <td className="py-4 pl-3 pr-4 text-right">
                    <div className="h-8 w-16 ml-auto bg-muted rounded" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // 2. Empty State
  if (orders.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-3">
        {hasFilter ? (
          <>
            <FileX className="size-12 mx-auto text-muted-foreground/60" />
            <h3 className="font-bold text-base text-foreground">
              Không tìm thấy đơn hàng phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Không có đơn hàng nào khớp với tiêu chí tìm kiếm hoặc dải ngày đã chọn. Vui lòng thử thay đổi từ khóa hoặc đặt lại bộ lọc.
            </p>
          </>
        ) : (
          <>
            <Inbox className="size-12 mx-auto text-muted-foreground/60" />
            <h3 className="font-bold text-base text-foreground">
              Chưa có đơn hàng nào
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Hệ thống hiện chưa ghi nhận đơn hàng mua gói khám nào từ người dùng.
            </p>
          </>
        )}
      </div>
    )
  }

  // 3. Table Data Rows
  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
            <tr>
              <th className="py-3.5 pl-4 pr-3 min-w-[150px]">Mã đơn hàng</th>
              <th className="px-3 py-3.5 min-w-[180px]">Khách hàng</th>
              <th className="px-3 py-3.5 min-w-[170px] hidden md:table-cell">Email</th>
              <th className="px-3 py-3.5 min-w-[130px]">Tổng tiền</th>
              <th className="px-3 py-3.5 min-w-[110px] hidden sm:table-cell">Phương thức</th>
              <th className="px-3 py-3.5 text-center min-w-[130px]">Trạng thái</th>
              <th className="px-3 py-3.5 min-w-[140px] hidden lg:table-cell">Ngày tạo</th>
              <th className="py-3.5 pl-3 pr-4 text-right min-w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {orders.map((order) => {
              const customerName = order.user?.full_name || 'Khách hàng'
              const customerPhone = order.user?.phone_number || ''
              const customerEmail = order.user?.email || '—'
              const avatar = order.user?.avatar

              return (
                <tr key={order.id} className="group hover:bg-muted/30 transition-colors">
                  {/* Cột 1: Mã đơn hàng */}
                  <td className="py-3.5 pl-4 pr-3 align-middle font-mono font-bold text-teal-600 dark:text-teal-400">
                    <button
                      type="button"
                      onClick={() => onViewDetail(order)}
                      className="flex items-center gap-1.5 hover:underline cursor-pointer text-left"
                      title="Xem chi tiết đơn hàng"
                    >
                      <Receipt className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{order.order_code}</span>
                    </button>
                  </td>

                  {/* Cột 2: Khách hàng */}
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex items-center gap-2.5">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={customerName}
                          className="size-8 rounded-full object-cover border border-border shrink-0"
                          onError={(e) => {
                            // Fallback nếu ảnh hỏng
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs shrink-0 border border-teal-500/20">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[140px]" title={customerName}>
                          {customerName}
                        </p>
                        {customerPhone && (
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Phone className="size-2.5 text-muted-foreground/60 shrink-0" />
                            <span>{customerPhone}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cột 3: Email */}
                  <td className="px-3 py-3.5 align-middle hidden md:table-cell text-muted-foreground">
                    <span className="truncate max-w-[160px] inline-block" title={customerEmail}>
                      {customerEmail}
                    </span>
                  </td>

                  {/* Cột 4: Tổng tiền */}
                  <td className="px-3 py-3.5 align-middle">
                    <span className="font-bold text-foreground">
                      {formatCurrency(order.total_price)}
                    </span>
                  </td>

                  {/* Cột 5: Phương thức thanh toán */}
                  <td className="px-3 py-3.5 align-middle hidden sm:table-cell">
                    {order.payment_method === 'VNPAY' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        <CreditCard className="size-3 text-blue-600 dark:text-blue-400" />
                        <span>VNPay</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <Banknote className="size-3 text-emerald-600 dark:text-emerald-400" />
                        <span>Tiền mặt</span>
                      </span>
                    )}
                  </td>

                  {/* Cột 6: Trạng thái */}
                  <td className="px-3 py-3.5 align-middle text-center">
                    <OrderStatusBadge
                      paymentStatus={order.payment_status}
                      deletedAt={order.deleted_at}
                      isExpired={order.is_expired}
                    />
                  </td>

                  {/* Cột 7: Ngày tạo */}
                  <td className="px-3 py-3.5 align-middle hidden lg:table-cell">
                    <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                      <Clock className="size-3.5 text-muted-foreground/60 shrink-0" />
                      <span>{formatDateTime(order.created_at)}</span>
                    </div>
                  </td>

                  {/* Cột 8: Thao tác */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(order)}
                      className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-teal-600 hover:border-teal-500/40 cursor-pointer"
                      title="Xem chi tiết đơn hàng"
                    >
                      <Eye className="size-3.5" />
                      <span className="hidden sm:inline">Chi tiết</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          itemLabel="đơn hàng"
        />
      )}
    </div>
  )
}

export default OrderList
