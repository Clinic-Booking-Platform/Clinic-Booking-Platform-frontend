// ================= FILE: src/components/cart/CartDetail.tsx =================

import React, { useState, useEffect } from 'react'
import {
  X,
  ShoppingCart,
  User,
  Package,
  AlertTriangle,
  ShieldCheck,
  AlertCircle,
  Phone,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cartApi } from '@/services/cart.api'
import type { CartDetail as ICartDetail } from '@/types/cart.types'
import {
  formatCurrency,
  formatShortDate,
  formatGender,
  extractErrorMessage,
} from './cart.utils'

export interface CartDetailProps {
  cartId: number | string | null
  isOpen: boolean
  onClose: () => void
}

export const CartDetail: React.FC<CartDetailProps> = ({
  cartId,
  isOpen,
  onClose,
}) => {
  const [cart, setCart] = useState<ICartDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  // Reset state khi cartId hoặc isOpen thay đổi
  const [prevCartId, setPrevCartId] = useState<number | string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(false)
  if (cartId !== prevCartId || isOpen !== prevIsOpen) {
    setPrevCartId(cartId)
    setPrevIsOpen(isOpen)
    setCart(null)
    setError(null)
  }

  const isCurrentCart =
    Boolean(cart) && (cart?.id === cartId || cart?.user_id === cartId)
  const isLoading = isOpen && Boolean(cartId) && !isCurrentCart && !error

  // Fetch chi tiết giỏ hàng
  useEffect(() => {
    if (!isOpen || !cartId) return

    let isMounted = true

    cartApi
      .getAdminCartDetail(cartId)
      .then((res) => {
        if (isMounted) {
          setCart(res.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Không thể tải chi tiết giỏ hàng người dùng!'))
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, cartId, retryCount])

  if (!isOpen) return null

  // Đếm số lượng gói khám đã ngừng cung cấp
  const discontinuedCount =
    cart?.cart_details?.filter((item) => Boolean(item.package?.deleted_at)).length || 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-3xl max-h-[90vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <ShoppingCart className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Chi tiết Giỏ hàng
                </h2>
                {cart && (
                  <span className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">
                    #{cart.id}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  <ShieldCheck className="size-3" />
                  <span>Chỉ xem</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Xem các gói khám hiện đang được lưu trong giỏ của người dùng
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            title="Đóng modal"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Nội dung Modal (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6">
          {/* Loading Skeleton */}
          {isLoading && (
            <div className="space-y-6 animate-pulse">
              <div className="h-28 rounded-xl bg-muted/60" />
              <div className="h-48 rounded-xl bg-muted/50" />
              <div className="h-20 rounded-xl bg-muted/60" />
            </div>
          )}

          {/* Lỗi nếu có */}
          {!isLoading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-3">
              <AlertCircle className="size-10 text-destructive mx-auto" />
              <h3 className="font-semibold text-foreground text-sm">
                Không thể tải thông tin giỏ hàng
              </h3>
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setError(null)
                  setRetryCount((c) => c + 1)
                }}
                className="cursor-pointer"
              >
                Thử lại
              </Button>
            </div>
          )}

          {/* Chi tiết giỏ hàng */}
          {!isLoading && !error && cart && (
            <>
              {/* SECTION 1: THÔNG TIN NGƯỜI DÙNG */}
              <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border/60 pb-2.5">
                  <User className="size-4 text-teal-600 dark:text-teal-400" />
                  <span>Thông tin Người dùng</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {cart.user?.avatar ? (
                    <img
                      src={cart.user.avatar}
                      alt={cart.user.full_name}
                      className="size-14 rounded-full object-cover border-2 border-teal-500/20 shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex size-14 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-lg shrink-0 border border-teal-500/20">
                      {cart.user?.full_name ? cart.user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs flex-1">
                    <div>
                      <span className="text-muted-foreground block">Họ và tên:</span>
                      <span className="font-semibold text-foreground text-sm">
                        {cart.user?.full_name || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Số điện thoại:</span>
                      <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="size-3 text-muted-foreground/60" />
                        <span>{cart.user?.phone_number || '—'}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Email:</span>
                      <span className="font-medium text-foreground flex items-center gap-1 mt-0.5 truncate" title={cart.user?.email}>
                        <Mail className="size-3 text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{cart.user?.email || '—'}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Giới tính:</span>
                      <span className="font-medium text-foreground">
                        {formatGender(cart.user?.gender)}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Ngày sinh:</span>
                      <span className="font-medium text-foreground">
                        {formatShortDate(cart.user?.date_of_birth)}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Mã người dùng:</span>
                      <span className="font-mono text-muted-foreground">
                        #{cart.user?.id || cart.user_id}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: DANH SÁCH GÓI KHÁM TRONG GIỎ */}
              <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                    <Package className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Danh sách Gói khám trong giỏ</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {cart.cart_details?.length || 0} mục
                  </span>
                </div>

                {cart.cart_details && cart.cart_details.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                        <tr>
                          <th className="py-3 pl-3 pr-2 min-w-[200px]">Gói khám</th>
                          <th className="px-2 py-3 min-w-[110px]">Giá niêm yết</th>
                          <th className="px-2 py-3 min-w-[110px]">Giá áp dụng</th>
                          <th className="px-2 py-3 text-center min-w-[70px]">Số lượng</th>
                          <th className="py-3 pl-2 pr-3 text-right min-w-[120px]">Thành tiền</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {cart.cart_details.map((item) => {
                          const pkg = item.package
                          const isDiscontinued = Boolean(pkg?.deleted_at)
                          const itemPrice = parseFloat(item.price) || 0
                          const lineTotal = itemPrice * item.quantity

                          return (
                            <tr
                              key={item.id}
                              className={`hover:bg-muted/20 ${
                                isDiscontinued ? 'bg-rose-500/5' : ''
                              }`}
                            >
                              {/* Cột 1: Gói khám */}
                              <td className="py-3 pl-3 pr-2 align-middle">
                                <div className="flex items-start gap-2.5">
                                  {pkg?.thumbnail_url ? (
                                    <img
                                      src={pkg.thumbnail_url}
                                      alt={pkg.name}
                                      className={`size-10 rounded-lg object-cover border border-border shrink-0 ${
                                        isDiscontinued ? 'grayscale opacity-70' : ''
                                      }`}
                                      onError={(e) => {
                                        ;(e.target as HTMLElement).style.display = 'none'
                                      }}
                                    />
                                  ) : (
                                    <div className="flex size-10 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0 border border-teal-500/20">
                                      <Package className="size-5" />
                                    </div>
                                  )}

                                  <div className="min-w-0">
                                    <p
                                      className={`font-semibold text-foreground truncate max-w-[220px] ${
                                        isDiscontinued ? 'line-through text-muted-foreground' : ''
                                      }`}
                                      title={pkg?.name}
                                    >
                                      {pkg?.name || `Gói khám #${item.package_id}`}
                                    </p>

                                    {isDiscontinued && (
                                      <span className="inline-flex items-center gap-1 mt-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
                                        <AlertTriangle className="size-2.5 shrink-0" />
                                        <span>Ngừng cung cấp</span>
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Cột 2: Giá niêm yết & giá giảm */}
                              <td className="px-2 py-3 align-middle">
                                {pkg?.discount_price ? (
                                  <div>
                                    <span className="line-through text-muted-foreground text-[11px] block">
                                      {formatCurrency(pkg.price)}
                                    </span>
                                    <span className="font-semibold text-rose-600 dark:text-rose-400">
                                      {formatCurrency(pkg.discount_price)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="font-medium text-foreground">
                                    {formatCurrency(pkg?.price)}
                                  </span>
                                )}
                              </td>

                              {/* Cột 3: Giá áp dụng khi thêm vào giỏ */}
                              <td className="px-2 py-3 align-middle font-medium text-foreground">
                                {formatCurrency(item.price)}
                              </td>

                              {/* Cột 4: Số lượng */}
                              <td className="px-2 py-3 align-middle text-center font-bold text-foreground">
                                {item.quantity}
                              </td>

                              {/* Cột 5: Thành tiền */}
                              <td className="py-3 pl-2 pr-3 align-middle text-right font-bold text-teal-600 dark:text-teal-400 text-sm">
                                {formatCurrency(lineTotal)}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground italic text-center py-4">
                    Giỏ hàng không có sản phẩm nào
                  </p>
                )}
              </div>

              {/* SECTION 3: TỔNG KẾT & CẢNH BÁO */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-3">
                {/* Cảnh báo gói khám ngừng cung cấp nếu có */}
                {discontinuedCount > 0 && (
                  <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-3 flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300">
                    <AlertTriangle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div>
                      <p className="font-semibold">Cảnh báo gói khám ngừng cung cấp</p>
                      <p className="text-[11px] text-amber-700/90 dark:text-amber-300/90 mt-0.5">
                        Giỏ hàng có {discontinuedCount} gói khám đã ngừng cung cấp hoặc bị xóa mềm. Khi người dùng tiến hành thanh toán, hệ thống sẽ yêu cầu người dùng loại bỏ gói này khỏi giỏ trước khi checkout.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
                  <div className="text-xs text-muted-foreground">
                    <span>Tổng số lượng gói khám: </span>
                    <span className="font-bold text-foreground">
                      {cart.total_items || cart.sum || 0} gói
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2 text-right">
                    <span className="text-xs text-muted-foreground font-medium">
                      Tổng giá trị giỏ hàng:
                    </span>
                    <span className="text-xl sm:text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {formatCurrency(cart.total_amount)}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer Modal */}
        <div className="flex items-center justify-end px-5 py-3.5 border-t border-border/80 bg-muted/20">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="cursor-pointer text-xs"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CartDetail
