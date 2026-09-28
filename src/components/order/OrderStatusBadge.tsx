// ================= FILE: src/components/order/OrderStatusBadge.tsx =================

import React from 'react'
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  HelpCircle,
} from 'lucide-react'
import type { PaymentStatus } from '@/types/order.types'

export interface OrderStatusBadgeProps {
  paymentStatus: PaymentStatus | string
  deletedAt?: string | null
  isExpired?: boolean
  size?: 'sm' | 'md'
  showIcon?: boolean
  className?: string
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({
  paymentStatus,
  deletedAt,
  isExpired = false,
  size = 'md',
  showIcon = true,
  className = '',
}) => {
  // Logic ưu tiên: Đơn bị hủy (xóa mềm deleted_at) ưu tiên cao nhất
  if (deletedAt) {
    const iconSize = size === 'sm' ? 'size-3' : 'size-3.5'
    return (
      <span
        className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20 ${
          size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
        } ${className}`}
        title="Đơn hàng đã bị hủy (xóa mềm)"
      >
        {showIcon && <XCircle className={`${iconSize} shrink-0`} />}
        <span>Đã hủy</span>
      </span>
    )
  }

  // Trạng thái thanh toán thông thường
  switch (paymentStatus) {
    case 'PAID': {
      const iconSize = size === 'sm' ? 'size-3' : 'size-3.5'
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          title="Đã thanh toán thành công qua VNPay"
        >
          {showIcon && <CheckCircle2 className={`${iconSize} shrink-0 text-emerald-600 dark:text-emerald-400`} />}
          <span>Đã thanh toán</span>
        </span>
      )
    }

    case 'UNPAID': {
      const iconSize = size === 'sm' ? 'size-3' : 'size-3.5'
      if (isExpired) {
        return (
          <span
            className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 ${
              size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
            } ${className}`}
            title="Đơn hàng chưa thanh toán và đã quá hạn 15 phút"
          >
            {showIcon && <AlertCircle className={`${iconSize} shrink-0 text-rose-600 dark:text-rose-400`} />}
            <span>Hết hạn</span>
          </span>
        )
      }
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/25 ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          title="Đang chờ thanh toán VNPay trong 15 phút"
        >
          {showIcon && <Clock className={`${iconSize} shrink-0 text-amber-600 dark:text-amber-400 animate-pulse`} />}
          <span>Chờ thanh toán</span>
        </span>
      )
    }

    case 'FAILED': {
      const iconSize = size === 'sm' ? 'size-3' : 'size-3.5'
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-red-500/10 text-red-700 dark:text-red-400 border-red-500/25 ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
          title="Giao dịch thanh toán thất bại"
        >
          {showIcon && <AlertCircle className={`${iconSize} shrink-0 text-red-600 dark:text-red-400`} />}
          <span>Thất bại</span>
        </span>
      )
    }

    default: {
      const iconSize = size === 'sm' ? 'size-3' : 'size-3.5'
      return (
        <span
          className={`inline-flex items-center gap-1.5 font-medium rounded-full border bg-muted text-muted-foreground border-border ${
            size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-xs'
          } ${className}`}
        >
          {showIcon && <HelpCircle className={`${iconSize} shrink-0`} />}
          <span>{paymentStatus || 'Chưa xác định'}</span>
        </span>
      )
    }
  }
}

export default OrderStatusBadge
