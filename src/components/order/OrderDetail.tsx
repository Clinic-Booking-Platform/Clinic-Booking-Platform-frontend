// ================= FILE: src/components/order/OrderDetail.tsx =================

import React, { useState, useEffect } from 'react'
import {
  X,
  Receipt,
  User,
  Package,
  Calendar,
  CreditCard,
  Banknote,
  Clock,
  Phone,
  Mail,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  Video,
  Building,
  Stethoscope,
  CalendarDays,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { orderApi } from '@/services/order.api'
import type {
  OrderDetail as IOrderDetail,
  AppointmentStatus,
} from '@/types/order.types'
import { OrderStatusBadge } from './OrderStatusBadge'
import { PackageUsageProgress } from './PackageUsageProgress'
import {
  formatCurrency,
  formatDateTime,
  formatShortDate,
  formatTimeSlot,
  formatGender,
  extractErrorMessage,
  copyToClipboard,
} from './order.utils'

export interface OrderDetailProps {
  orderId: number | string | null
  isOpen: boolean
  onClose: () => void
}

export const OrderDetail: React.FC<OrderDetailProps> = ({
  orderId,
  isOpen,
  onClose,
}) => {
  const [order, setOrder] = useState<IOrderDetail | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const [copiedLink, setCopiedLink] = useState<string | null>(null)

  // Reset state on orderId / isOpen change in render phase
  const [prevOrderId, setPrevOrderId] = useState<number | string | null>(null)
  const [prevIsOpen, setPrevIsOpen] = useState(false)
  if (orderId !== prevOrderId || isOpen !== prevIsOpen) {
    setPrevOrderId(orderId)
    setPrevIsOpen(isOpen)
    setOrder(null)
    setError(null)
  }

  const isCurrentOrder =
    Boolean(order) && (order?.id === orderId || order?.order_code === orderId)
  const isLoading = isOpen && Boolean(orderId) && !isCurrentOrder && !error

  // Fetch chi tiết đơn hàng
  useEffect(() => {
    if (!isOpen || !orderId) return

    let isMounted = true

    orderApi
      .getAdminOrderDetail(orderId)
      .then((res) => {
        if (isMounted) {
          setOrder(res.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Không thể tải thông tin chi tiết đơn hàng!'))
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, orderId, retryCount])

  // Xử lý copy link phòng khám online
  const handleCopyLink = async (link: string) => {
    const success = await copyToClipboard(link)
    if (success) {
      setCopiedLink(link)
      setTimeout(() => setCopiedLink(null), 2000)
    }
  }

  // Render badge trạng thái lịch hẹn
  const renderAppointmentStatusBadge = (status: AppointmentStatus) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-amber-500/10 text-amber-700 dark:text-amber-400 border border-amber-500/20">
            Chờ khám
          </span>
        )
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-500/10 text-blue-700 dark:text-blue-400 border border-blue-500/20">
            Đã xác nhận
          </span>
        )
      case 'COMPLETED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20">
            Đã khám
          </span>
        )
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-rose-500/10 text-rose-700 dark:text-rose-400 border border-rose-500/20">
            Đã hủy
          </span>
        )
      case 'NO_SHOW':
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border border-zinc-500/20">
            Không đến
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-muted text-muted-foreground border border-border">
            {status}
          </span>
        )
    }
  }

  if (!isOpen) return null

  // Thu thập tất cả các lịch hẹn từ tất cả các gói khám trong đơn
  const allAppointments =
    order?.order_details?.flatMap((detail) =>
      detail.appointments.map((apt) => ({
        ...apt,
        packageName: detail.package?.name || 'Gói khám',
      }))
    ) || []

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-background/80 backdrop-blur-xs animate-in fade-in-0 duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-border bg-card shadow-2xl overflow-hidden">
        {/* Header Modal */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border/80 bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Receipt className="size-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-foreground">
                  Chi tiết Đơn hàng
                </h2>
                {order && (
                  <span className="font-mono text-sm font-semibold text-teal-600 dark:text-teal-400">
                    {order.order_code}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                  <ShieldCheck className="size-3" />
                  <span>Chỉ xem</span>
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Xem thông tin thanh toán, tiến độ sử dụng gói khám và lịch hẹn liên quan
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
              <div className="h-24 rounded-xl bg-muted/60" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="h-36 rounded-xl bg-muted/50" />
                <div className="h-36 rounded-xl bg-muted/50" />
              </div>
              <div className="h-44 rounded-xl bg-muted/60" />
            </div>
          )}

          {/* Lỗi nếu có */}
          {!isLoading && error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-3">
              <AlertCircle className="size-10 text-destructive mx-auto" />
              <h3 className="font-semibold text-foreground text-sm">
                Không thể tải thông tin đơn hàng
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

          {/* Chi tiết đơn hàng khi có dữ liệu */}
          {!isLoading && !error && order && (
            <>
              {/* SECTION 1: TỔNG QUAN ĐƠN HÀNG (Overview Bar) */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-border/60 pb-3">
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Mã đơn hàng</span>
                    <div className="font-mono text-lg font-bold text-foreground flex items-center gap-2">
                      <span>{order.order_code}</span>
                      <button
                        type="button"
                        onClick={() => void copyToClipboard(order.order_code)}
                        className="text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Sao chép mã đơn hàng"
                      >
                        <Copy className="size-3.5" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    <OrderStatusBadge
                      paymentStatus={order.payment_status}
                      deletedAt={order.deleted_at}
                      isExpired={order.is_expired}
                    />

                    {order.payment_method === 'VNPAY' ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                        <CreditCard className="size-3.5 text-blue-600 dark:text-blue-400" />
                        <span>VNPay</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                        <Banknote className="size-3.5 text-emerald-600 dark:text-emerald-400" />
                        <span>Tiền mặt</span>
                      </span>
                    )}
                  </div>
                </div>

                {/* Các chỉ số tổng quan */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground block">Tổng tiền</span>
                    <span className="text-base sm:text-lg font-bold text-teal-600 dark:text-teal-400">
                      {formatCurrency(order.total_price)}
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Tổng lượt khám</span>
                    <span className="text-base sm:text-lg font-bold text-foreground">
                      {order.total_items || order.order_details?.reduce((acc, d) => acc + d.quantity, 0) || 0} lượt
                    </span>
                  </div>

                  <div>
                    <span className="text-muted-foreground block">Ngày tạo đơn</span>
                    <span className="font-medium text-foreground block mt-0.5">
                      {formatDateTime(order.created_at)}
                    </span>
                  </div>

                  <div>
                    {order.payment_status !== 'PAID' && order.expires_at ? (
                      <>
                        <span className="text-muted-foreground block">Hạn thanh toán</span>
                        <span
                          className={`font-medium block mt-0.5 ${
                            order.is_expired ? 'text-destructive font-semibold' : 'text-amber-600 dark:text-amber-400'
                          }`}
                        >
                          {formatDateTime(order.expires_at)}
                        </span>
                      </>
                    ) : order.deleted_at ? (
                      <>
                        <span className="text-muted-foreground block">Ngày hủy đơn</span>
                        <span className="font-medium text-destructive block mt-0.5">
                          {formatDateTime(order.deleted_at)}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-muted-foreground block">Giao dịch</span>
                        <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="size-3.5" />
                          <span>Thành công</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* SECTION 2: THÔNG TIN KHÁCH HÀNG */}
              <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border/60 pb-2.5">
                  <User className="size-4 text-teal-600 dark:text-teal-400" />
                  <span>Thông tin Khách hàng</span>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {order.user?.avatar ? (
                    <img
                      src={order.user.avatar}
                      alt={order.user.full_name}
                      className="size-14 rounded-full object-cover border-2 border-teal-500/20 shrink-0"
                      onError={(e) => {
                        ;(e.target as HTMLElement).style.display = 'none'
                      }}
                    />
                  ) : (
                    <div className="flex size-14 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-lg shrink-0 border border-teal-500/20">
                      {order.user?.full_name ? order.user.full_name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-2 gap-x-6 text-xs flex-1">
                    <div>
                      <span className="text-muted-foreground block">Họ và tên:</span>
                      <span className="font-semibold text-foreground text-sm">
                        {order.user?.full_name || '—'}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Số điện thoại:</span>
                      <span className="font-medium text-foreground flex items-center gap-1 mt-0.5">
                        <Phone className="size-3 text-muted-foreground/60" />
                        <span>{order.user?.phone_number || '—'}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Email:</span>
                      <span className="font-medium text-foreground flex items-center gap-1 mt-0.5 truncate" title={order.user?.email}>
                        <Mail className="size-3 text-muted-foreground/60 shrink-0" />
                        <span className="truncate">{order.user?.email || '—'}</span>
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Giới tính:</span>
                      <span className="font-medium text-foreground">
                        {formatGender(order.user?.gender)}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Ngày sinh:</span>
                      <span className="font-medium text-foreground">
                        {formatShortDate(order.user?.date_of_birth)}
                      </span>
                    </div>

                    <div>
                      <span className="text-muted-foreground block">Mã người dùng:</span>
                      <span className="font-mono text-muted-foreground">
                        #{order.user?.id || '—'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: DANH SÁCH GÓI KHÁM & TIẾN ĐỘ SỬ DỤNG */}
              <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                    <Package className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Danh sách Gói khám & Tiến độ sử dụng</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {order.order_details?.length || 0} gói khám
                  </span>
                </div>

                <div className="space-y-3.5">
                  {order.order_details && order.order_details.length > 0 ? (
                    order.order_details.map((item) => {
                      const pkg = item.package
                      const lineTotal = item.price * item.quantity

                      return (
                        <div
                          key={item.id}
                          className="rounded-xl border border-border/60 bg-muted/15 p-4 space-y-3 hover:border-teal-500/30 transition-colors"
                        >
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              {pkg?.thumbnail_url ? (
                                <img
                                  src={pkg.thumbnail_url}
                                  alt={pkg.name}
                                  className="size-12 rounded-lg object-cover border border-border shrink-0"
                                  onError={(e) => {
                                    ;(e.target as HTMLElement).style.display = 'none'
                                  }}
                                />
                              ) : (
                                <div className="flex size-12 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 shrink-0 border border-teal-500/20">
                                  <Package className="size-6" />
                                </div>
                              )}

                              <div className="min-w-0">
                                <h4 className="font-semibold text-foreground text-sm truncate" title={pkg?.name}>
                                  {pkg?.name || `Gói khám #${item.package_id}`}
                                </h4>
                                {pkg?.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5" title={pkg.description}>
                                    {pkg.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="text-right sm:shrink-0 w-full sm:w-auto flex sm:flex-col justify-between items-center sm:items-end">
                              <span className="font-bold text-foreground text-sm">
                                {formatCurrency(lineTotal)}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {formatCurrency(item.price)} × {item.quantity} lượt
                              </span>
                            </div>
                          </div>

                          {/* Thanh tiến độ sử dụng */}
                          <div className="pt-2 border-t border-border/40">
                            <PackageUsageProgress
                              used={item.used_quantity || 0}
                              total={item.quantity || 1}
                              size="md"
                            />
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-xs text-muted-foreground italic text-center py-4">
                      Không có thông tin chi tiết gói khám
                    </p>
                  )}
                </div>
              </div>

              {/* SECTION 4: LỊCH HẸN ĐÃ ĐẶT TỪ ĐƠN HÀNG */}
              <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 space-y-3">
                <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                  <div className="flex items-center gap-2 text-foreground font-semibold text-sm">
                    <CalendarDays className="size-4 text-teal-600 dark:text-teal-400" />
                    <span>Lịch hẹn đã đặt từ đơn hàng này</span>
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {allAppointments.length} lịch hẹn
                  </span>
                </div>

                {allAppointments.length > 0 ? (
                  <div className="overflow-x-auto rounded-lg border border-border/60">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground border-b border-border/40">
                        <tr>
                          <th className="py-2.5 pl-3 pr-2">Gói khám</th>
                          <th className="px-2 py-2.5">Bệnh nhân</th>
                          <th className="px-2 py-2.5">Bác sĩ</th>
                          <th className="px-2 py-2.5">Ngày & Ca khám</th>
                          <th className="px-2 py-2.5">Hình thức</th>
                          <th className="px-2 py-2.5 text-center">Trạng thái</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/40">
                        {allAppointments.map((apt) => (
                          <tr key={apt.id} className="hover:bg-muted/20">
                            <td className="py-2.5 pl-3 pr-2 font-medium text-foreground max-w-[150px] truncate" title={apt.packageName}>
                              {apt.packageName}
                            </td>
                            <td className="px-2 py-2.5">
                              <p className="font-medium text-foreground">{apt.patient_name}</p>
                              {apt.patient_phone && (
                                <p className="text-[10px] text-muted-foreground">{apt.patient_phone}</p>
                              )}
                            </td>
                            <td className="px-2 py-2.5">
                              <div className="flex items-center gap-1.5">
                                <Stethoscope className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
                                <span className="font-medium text-foreground truncate max-w-[120px]">
                                  {apt.doctor?.full_name || 'Bác sĩ phụ trách'}
                                </span>
                              </div>
                            </td>
                            <td className="px-2 py-2.5">
                              <p className="font-medium text-foreground">{formatShortDate(apt.date)}</p>
                              <p className="text-[10px] text-muted-foreground">{formatTimeSlot(apt.time_type)}</p>
                            </td>
                            <td className="px-2 py-2.5">
                              {apt.appointment_type === 'ONLINE' ? (
                                <div className="space-y-1">
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-500/20">
                                    <Video className="size-2.5 text-purple-600 dark:text-purple-400" />
                                    <span>Trực tuyến</span>
                                  </span>
                                  {apt.meeting_link && (
                                    <button
                                      type="button"
                                      onClick={() => void handleCopyLink(apt.meeting_link!)}
                                      className="flex items-center gap-1 text-[10px] text-purple-600 dark:text-purple-400 hover:underline cursor-pointer"
                                      title={apt.meeting_link}
                                    >
                                      {copiedLink === apt.meeting_link ? (
                                        <>
                                          <Check className="size-2.5 text-emerald-600" />
                                          <span className="text-emerald-600 font-semibold">Đã chép link</span>
                                        </>
                                      ) : (
                                        <>
                                          <Copy className="size-2.5" />
                                          <span>Chép link Meet</span>
                                        </>
                                      )}
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                                  <Building className="size-2.5 text-blue-600 dark:text-blue-400" />
                                  <span>Trực tiếp</span>
                                </span>
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {renderAppointmentStatusBadge(apt.status)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-border/60 p-6 text-center text-xs text-muted-foreground">
                    <Calendar className="size-8 text-muted-foreground/40 mx-auto mb-2" />
                    <p className="font-medium text-foreground">Chưa có lịch hẹn nào</p>
                    <p className="text-muted-foreground mt-0.5">
                      Khách hàng chưa tiến hành đặt lịch khám từ đơn hàng này.
                    </p>
                  </div>
                )}
              </div>

              {/* SECTION 5: TIMELINE LỊCH SỬ ĐƠN HÀNG */}
              <div className="rounded-xl border border-border/80 bg-muted/15 p-4 sm:p-5 space-y-3">
                <div className="flex items-center gap-2 text-foreground font-semibold text-sm border-b border-border/60 pb-2">
                  <Clock className="size-4 text-teal-600 dark:text-teal-400" />
                  <span>Timeline tiến trình đơn hàng</span>
                </div>

                <div className="relative pl-6 space-y-4 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-border/60 text-xs">
                  {/* Step 1: Tạo đơn */}
                  <div className="relative">
                    <span className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full bg-teal-500 text-white text-[10px]">
                      ✓
                    </span>
                    <p className="font-semibold text-foreground">Đơn hàng được khởi tạo</p>
                    <p className="text-muted-foreground text-[11px]">
                      {formatDateTime(order.created_at)} — Khách hàng đặt mua gói khám qua giỏ hàng
                    </p>
                  </div>

                  {/* Step 2: Hạn thanh toán */}
                  {order.expires_at && (
                    <div className="relative">
                      <span className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full bg-muted text-muted-foreground text-[10px]">
                        •
                      </span>
                      <p className="font-semibold text-foreground">Hạn thanh toán VNPay (15 phút)</p>
                      <p className="text-muted-foreground text-[11px]">
                        {formatDateTime(order.expires_at)}
                      </p>
                    </div>
                  )}

                  {/* Step 3: Kết quả thanh toán */}
                  {order.deleted_at ? (
                    <div className="relative">
                      <span className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full bg-zinc-500 text-white text-[10px]">
                        ✕
                      </span>
                      <p className="font-semibold text-destructive">Đơn hàng đã bị hủy (Xóa mềm)</p>
                      <p className="text-muted-foreground text-[11px]">
                        {formatDateTime(order.deleted_at)}
                      </p>
                    </div>
                  ) : order.payment_status === 'PAID' ? (
                    <div className="relative">
                      <span className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full bg-emerald-500 text-white text-[10px]">
                        ✓
                      </span>
                      <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                        Thanh toán VNPay thành công
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Đã ghi nhận giao dịch thành công. Người dùng có thể tiến hành đặt lịch khám.
                      </p>
                    </div>
                  ) : order.is_expired ? (
                    <div className="relative">
                      <span className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full bg-rose-500 text-white text-[10px]">
                        ✕
                      </span>
                      <p className="font-semibold text-rose-600 dark:text-rose-400">
                        Đơn hàng đã hết hạn thanh toán
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Quá 15 phút chưa hoàn tất thanh toán VNPay.
                      </p>
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute -left-6 top-0.5 flex size-4 items-center justify-center rounded-full bg-amber-500 text-white text-[10px] animate-pulse">
                        ⏳
                      </span>
                      <p className="font-semibold text-amber-600 dark:text-amber-400">
                        Đang chờ khách hàng thanh toán VNPay
                      </p>
                      <p className="text-muted-foreground text-[11px]">
                        Thời gian còn lại trong khung 15 phút.
                      </p>
                    </div>
                  )}
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

export default OrderDetail
