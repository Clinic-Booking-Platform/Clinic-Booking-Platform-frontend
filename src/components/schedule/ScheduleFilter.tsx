import React from 'react'
import {
  Calendar,
  UserCheck,
  X,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Layers,
  RotateCcw,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  getTodayDateString,
  getDaysOffsetDateString,
  formatShortDate,
} from './schedule.utils'
import type { ScheduleStatusFilter } from '@/types/schedule.types'
import type { Doctor } from '@/types/doctor.types'

interface ScheduleFilterProps {
  doctorId?: number
  onDoctorChange: (doctorId?: number) => void
  doctors: Doctor[]
  date: string
  onDateChange: (date: string) => void
  status: ScheduleStatusFilter
  onStatusChange: (status: ScheduleStatusFilter) => void
  onReset: () => void
  onRefresh: () => void
  isLoading?: boolean
  totalItems?: number
}

export const ScheduleFilter: React.FC<ScheduleFilterProps> = ({
  doctorId,
  onDoctorChange,
  doctors,
  date,
  onDateChange,
  status,
  onStatusChange,
  onReset,
  onRefresh,
  isLoading = false,
  totalItems,
}) => {
  const todayStr = getTodayDateString()

  const statusOptions: {
    value: ScheduleStatusFilter
    label: string
    icon: React.ComponentType<{ className?: string }>
  }[] = [
    { value: 'all', label: 'Tất cả ca làm việc', icon: Layers },
    { value: 'AVAILABLE', label: 'Còn chỗ trống', icon: CheckCircle2 },
    { value: 'FULL', label: 'Đã kín chỗ', icon: AlertCircle },
    { value: 'CANCELLED', label: 'Đã hủy ca', icon: XCircle },
  ]

  const hasActiveFilter = Boolean(doctorId !== undefined || date || status !== 'all')

  const handleQuickToday = () => {
    onDateChange(todayStr)
  }

  const handleQuickTomorrow = () => {
    onDateChange(getDaysOffsetDateString(1))
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border/80 bg-card p-3 sm:p-4 shadow-xs">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* 1. Bộ lọc Bác sĩ & Ngày làm việc */}
        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-1">
          {/* Dropdown Bác sĩ */}
          <div className="relative min-w-[220px] flex-1 sm:flex-initial">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={doctorId !== undefined ? String(doctorId) : ''}
              onChange={(e) => {
                const val = e.target.value
                onDoctorChange(val ? Number(val) : undefined)
              }}
              className="w-full appearance-none rounded-lg border border-input bg-background/60 py-2 pl-9.5 pr-8 text-xs sm:text-sm text-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">Tất cả bác sĩ</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.user?.full_name || `Bác sĩ #${doc.id}`}
                  {doc.specialty ? ` — CK: ${doc.specialty.name}` : ''}
                </option>
              ))}
            </select>
            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 size-3 text-muted-foreground pointer-events-none" />
          </div>

          {/* Date Picker Chọn Ngày */}
          <div className="relative min-w-[180px] flex-1 sm:flex-initial">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <input
              type="date"
              value={date}
              onChange={(e) => onDateChange(e.target.value)}
              className="w-full rounded-lg border border-input bg-background/60 py-2 pl-9.5 pr-8 text-xs sm:text-sm text-foreground transition-colors focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
            />
            {date && (
              <button
                type="button"
                onClick={() => onDateChange('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                title="Bỏ chọn ngày"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>

          {/* Phím tắt chọn nhanh ngày: Hôm nay / Ngày mai */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={handleQuickToday}
              className={`rounded-lg px-2.5 py-1.5 text-xs font-medium transition-colors cursor-pointer border ${
                date === todayStr
                  ? 'bg-teal-500/15 border-teal-500 text-teal-700 dark:text-teal-300 font-semibold'
                  : 'bg-muted/40 border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              Hôm nay
            </button>
            <button
              type="button"
              onClick={handleQuickTomorrow}
              className="rounded-lg px-2.5 py-1.5 text-xs font-medium bg-muted/40 border border-border/70 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors cursor-pointer"
            >
              Ngày mai
            </button>
            {date && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2 py-1 rounded-lg border border-teal-500/20 font-medium">
                <span>{formatShortDate(date)}</span>
                <span className="text-[10px] text-teal-600/70 font-mono">(GMT+7)</span>
              </span>
            )}
          </div>
        </div>

        {/* 2. Nút Reset & Refresh */}
        <div className="flex items-center gap-2 shrink-0 self-end lg:self-auto">
          {hasActiveFilter && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9 px-2.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="size-3.5 mr-1.5" />
              <span>Đặt lại</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9 px-3 text-xs cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline ml-1.5">Tải lại</span>
          </Button>
        </div>
      </div>

      {/* 3. Filter tabs trạng thái ca làm việc */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border/40 pt-2.5">
        <div className="flex flex-wrap items-center gap-1 bg-muted/60 p-1 rounded-lg">
          {statusOptions.map((opt) => {
            const Icon = opt.icon
            const isSelected = status === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onStatusChange(opt.value)}
                className={`flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-background text-foreground shadow-2xs font-semibold'
                    : 'text-muted-foreground hover:text-foreground hover:bg-background/40'
                }`}
              >
                <Icon
                  className={`size-3.5 ${
                    isSelected
                      ? opt.value === 'AVAILABLE'
                        ? 'text-emerald-500'
                        : opt.value === 'FULL'
                        ? 'text-amber-500'
                        : opt.value === 'CANCELLED'
                        ? 'text-rose-500'
                        : 'text-teal-500'
                      : 'text-muted-foreground'
                  }`}
                />
                <span>{opt.label}</span>
              </button>
            )
          })}
        </div>

        {totalItems !== undefined && (
          <div className="text-xs text-muted-foreground font-medium pr-1">
            Tổng cộng: <strong className="text-foreground">{totalItems}</strong> ca làm việc
          </div>
        )}
      </div>
    </div>
  )
}
