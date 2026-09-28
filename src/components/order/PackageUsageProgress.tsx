// ================= FILE: src/components/order/PackageUsageProgress.tsx =================

import React from 'react'

export interface PackageUsageProgressProps {
  used: number
  total: number
  className?: string
  showLabel?: boolean
  showRemaining?: boolean
  size?: 'sm' | 'md'
}

export const PackageUsageProgress: React.FC<PackageUsageProgressProps> = ({
  used,
  total,
  className = '',
  showLabel = true,
  showRemaining = true,
  size = 'md',
}) => {
  const safeTotal = Math.max(1, total)
  const safeUsed = Math.max(0, Math.min(used, safeTotal))
  const percent = Math.min(100, Math.round((safeUsed / safeTotal) * 100))
  const remaining = Math.max(0, total - used)

  // Màu sắc theo tiến độ
  let barColor = 'bg-emerald-500 dark:bg-emerald-400'
  let textColor = 'text-emerald-700 dark:text-emerald-300'
  let remainingBadge = 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20'

  if (percent >= 100) {
    barColor = 'bg-rose-500 dark:bg-rose-400'
    textColor = 'text-rose-700 dark:text-rose-300'
    remainingBadge = 'bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20'
  } else if (percent >= 75) {
    barColor = 'bg-amber-500 dark:bg-amber-400'
    textColor = 'text-amber-700 dark:text-amber-300'
    remainingBadge = 'bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20'
  }

  const heightClass = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div className={`space-y-1.5 ${className}`}>
      {showLabel && (
        <div className="flex items-center justify-between text-xs gap-2">
          <div className="flex items-center gap-1.5">
            <span className="text-muted-foreground font-medium">Tiến độ sử dụng:</span>
            <span className={`font-semibold ${textColor}`}>
              {safeUsed}/{total} lượt ({percent}%)
            </span>
          </div>

          {showRemaining && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold border ${remainingBadge}`}
            >
              Còn lại: {remaining} lượt
            </span>
          )}
        </div>
      )}

      {/* Progress Bar Track */}
      <div
        className={`w-full overflow-hidden rounded-full bg-muted/80 dark:bg-muted/40 border border-border/40 ${heightClass}`}
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
      >
        <div
          className={`${heightClass} rounded-full ${barColor} transition-all duration-300 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  )
}

export default PackageUsageProgress
