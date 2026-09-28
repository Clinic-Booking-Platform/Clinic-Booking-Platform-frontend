// ================= FILE: src/components/cart/CartList.tsx =================

import React from 'react'
import {
  Eye,
  ShoppingCart,
  Phone,
  Package,
  FileX,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import type {
  CartListItem,
  Pagination as IPagination,
} from '@/types/cart.types'
import { formatCurrency } from './cart.utils'

export interface CartListProps {
  carts: CartListItem[]
  pagination: IPagination | null
  isLoading?: boolean
  hasFilter?: boolean
  onPageChange: (page: number) => void
  onViewDetail: (cart: CartListItem) => void
}

export const CartList: React.FC<CartListProps> = ({
  carts,
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
                <th className="py-3.5 pl-4 pr-3 min-w-[200px]">Người dùng</th>
                <th className="px-3 py-3.5 min-w-[180px]">Email</th>
                <th className="px-3 py-3.5 min-w-[130px]">Số điện thoại</th>
                <th className="px-3 py-3.5 text-center min-w-[120px]">Số gói khám</th>
                <th className="px-3 py-3.5 min-w-[140px]">Tổng tiền giỏ</th>
                <th className="py-3.5 pl-3 pr-4 text-right min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td className="py-4 pl-4 pr-3">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-muted shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-28 bg-muted rounded" />
                        <div className="h-3 w-16 bg-muted/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-3.5 w-36 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-3.5 w-24 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-4 text-center">
                    <div className="h-5 w-16 mx-auto bg-muted rounded-full" />
                  </td>
                  <td className="px-3 py-4">
                    <div className="h-4 w-24 bg-muted rounded" />
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
  if (carts.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-3">
        {hasFilter ? (
          <>
            <FileX className="size-12 mx-auto text-muted-foreground/60" />
            <h3 className="font-bold text-base text-foreground">
              Không tìm thấy giỏ hàng phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Không có giỏ hàng nào khớp với tiêu chí tìm kiếm hoặc khoảng giá đã chọn. Vui lòng thử thay đổi từ khóa hoặc xóa bộ lọc.
            </p>
          </>
        ) : (
          <>
            <ShoppingCart className="size-12 mx-auto text-muted-foreground/60" />
            <h3 className="font-bold text-base text-foreground">
              Hiện tại không có giỏ hàng nào trên hệ thống
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Các giỏ hàng chỉ tồn tại khi người dùng thêm gói khám và chưa hoàn tất thanh toán. Khi người dùng thanh toán hoặc xóa hết sản phẩm, giỏ hàng sẽ tự động giải phóng.
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
              <th className="py-3.5 pl-4 pr-3 min-w-[200px]">Người dùng</th>
              <th className="px-3 py-3.5 min-w-[180px] hidden sm:table-cell">Email</th>
              <th className="px-3 py-3.5 min-w-[130px] hidden md:table-cell">Số điện thoại</th>
              <th className="px-3 py-3.5 text-center min-w-[120px]">Số gói khám</th>
              <th className="px-3 py-3.5 min-w-[140px]">Tổng tiền giỏ</th>
              <th className="py-3.5 pl-3 pr-4 text-right min-w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {carts.map((cart) => {
              const customerName = cart.user?.full_name || 'Người dùng'
              const customerPhone = cart.user?.phone_number || ''
              const customerEmail = cart.user?.email || '—'
              const avatar = cart.user?.avatar
              const totalItems = cart.total_items ?? cart.sum ?? 0

              return (
                <tr key={cart.id} className="group hover:bg-muted/30 transition-colors">
                  {/* Cột 1: Người dùng */}
                  <td className="py-3.5 pl-4 pr-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      {avatar ? (
                        <img
                          src={avatar}
                          alt={customerName}
                          className="size-8 rounded-full object-cover border border-border shrink-0"
                          onError={(e) => {
                            ;(e.target as HTMLElement).style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-semibold text-xs shrink-0 border border-teal-500/20">
                          {customerName.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => onViewDetail(cart)}
                          className="font-medium text-foreground hover:text-teal-600 dark:hover:text-teal-400 truncate max-w-[160px] text-left cursor-pointer"
                          title="Xem chi tiết giỏ hàng"
                        >
                          {customerName}
                        </button>
                        <p className="text-[11px] text-muted-foreground flex items-center gap-1 sm:hidden">
                          <Phone className="size-2.5 text-muted-foreground/60 shrink-0" />
                          <span>{customerPhone || customerEmail}</span>
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Email */}
                  <td className="px-3 py-3.5 align-middle hidden sm:table-cell text-muted-foreground">
                    <span className="truncate max-w-[170px] inline-block" title={customerEmail}>
                      {customerEmail}
                    </span>
                  </td>

                  {/* Cột 3: Số điện thoại */}
                  <td className="px-3 py-3.5 align-middle hidden md:table-cell text-muted-foreground font-mono">
                    {customerPhone || '—'}
                  </td>

                  {/* Cột 4: Số gói khám */}
                  <td className="px-3 py-3.5 align-middle text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                      <Package className="size-3 text-teal-600 dark:text-teal-400" />
                      <span>{totalItems} gói</span>
                    </span>
                  </td>

                  {/* Cột 5: Tổng tiền */}
                  <td className="px-3 py-3.5 align-middle">
                    <span className="font-bold text-foreground text-sm text-teal-600 dark:text-teal-400">
                      {formatCurrency(cart.total_amount)}
                    </span>
                  </td>

                  {/* Cột 6: Thao tác */}
                  <td className="py-3.5 pl-3 pr-4 align-middle text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetail(cart)}
                      className="h-8 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-teal-600 hover:border-teal-500/40 cursor-pointer"
                      title="Xem chi tiết giỏ hàng"
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
          itemLabel="giỏ hàng"
        />
      )}
    </div>
  )
}

export default CartList
