import React, { useState, useEffect } from 'react'
import {
  Search,
  UserCheck,
  Calendar,
  RotateCcw,
  RefreshCw,
  X,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AppointmentStatusFilter } from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'
import {
  getVietnamDateString,
  getVietnamDaysOffsetString,
  formatShortDate,
} from './appointment.utils'

export interface AppointmentFilterProps {
  search: string
  onSearchChange: (value: string) => void
  doctorId?: number
  onDoctorChange: (doctorId?: number) => void
  fromDate: string
  onFromDateChange: (date: string) => void
  toDate: string
  onToDateChange: (date: string) => void
  status: AppointmentStatusFilter
  onStatusChange: (status: AppointmentStatusFilter) => void
  doctors: Doctor[]
  isLoadingDoctors?: boolean
  onReset: () => void
  onRefresh: () => void
  isLoading?: boolean
}

const STATUS_TABS: { key: AppointmentStatusFilter; label: string; countBadge?: string }[] = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'PENDING', label: 'Chờ duyệt' },
  { key: 'CONFIRMED', label: 'Đã xác nhận' },
  { key: 'COMPLETED', label: 'Đã hoàn thành' },
  { key: 'CANCELLED', label: 'Đã hủy' },
  { key: 'NO_SHOW', label: 'Vắng mặt' },
]

export const AppointmentFilter: React.FC<AppointmentFilterProps> = ({
  search,
  onSearchChange,
  doctorId,
  onDoctorChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  status,
  onStatusChange,
  doctors,
  isLoadingDoctors = false,
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
    }, 400) // 400ms debounce as specified

    return () => {
      clearTimeout(handler)
    }
  }, [localSearch, search, onSearchChange])

  // Quick Date Helpers in Vietnam timezone (Asia/Ho_Chi_Minh - GMT+7)
  const handleSetToday = () => {
    const todayStr = getVietnamDateString()
    onFromDateChange(todayStr)
    onToDateChange(todayStr)
  }

  const handleSetNext7Days = () => {
    const todayStr = getVietnamDateString()
    const nextWeekStr = getVietnamDaysOffsetString(7)
    onFromDateChange(todayStr)
    onToDateChange(nextWeekStr)
  }

  const handleClearDates = () => {
    onFromDateChange('')
    onToDateChange('')
  }

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(doctorId) ||
    Boolean(fromDate) ||
    Boolean(toDate) ||
    status !== 'ALL'

  return (
    <div className="space-y-4 rounded-2xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
      {/* 1. Status Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none border-b border-border/50">
        {STATUS_TABS.map((tab) => {
          const isActive = status === tab.key
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => onStatusChange(tab.key)}
              className={`inline-flex shrink-0 items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer select-none ${
                isActive
                  ? 'bg-teal-600 text-white shadow-xs dark:bg-teal-500'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* 2. Controls Grid: Search, Doctor Select, Date Range */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4 items-end">
        {/* Search Input (Tên bệnh nhân, SĐT, Tên bác sĩ) - col-span-4 */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Search className="size-3.5 text-teal-600 dark:text-teal-400" />
            <span>Tìm kiếm bệnh nhân, SĐT, bác sĩ</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Nhập tên bệnh nhân, SĐT hoặc bác sĩ..."
              className="w-full rounded-xl border border-border/80 bg-background pl-9 pr-8 py-2 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
            />
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            {localSearch && (
              <button
                type="button"
                onClick={() => {
                  setLocalSearch('')
                  onSearchChange('')
                }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 rounded-full text-muted-foreground hover:text-foreground cursor-pointer"
                title="Xóa tìm kiếm"
              >
                <X className="size-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Doctor Select - col-span-3 */}
        <div className="lg:col-span-3 space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <UserCheck className="size-3.5 text-teal-600 dark:text-teal-400" />
              <span>Bác sĩ phụ trách</span>
            </span>
            {doctorId && (
              <button
                type="button"
                onClick={() => onDoctorChange(undefined)}
                className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
              >
                Bỏ chọn
              </button>
            )}
          </label>
          <select
            value={doctorId || ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined
              onDoctorChange(val)
            }}
            disabled={isLoadingDoctors}
            className="w-full rounded-xl border border-border/80 bg-background px-3 py-2 text-xs sm:text-sm text-foreground transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 cursor-pointer"
          >
            <option value="">
              {isLoadingDoctors ? '-- Đang tải bác sĩ... --' : '-- Tất cả bác sĩ --'}
            </option>
            {doctors.map((doc) => (
              <option key={doc.id} value={doc.id}>
                {doc.user?.full_name || `Bác sĩ #${doc.id}`}
                {doc.specialty ? ` (${doc.specialty.name})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Date Range: From Date & To Date - col-span-3 */}
        <div className="lg:col-span-3 space-y-1.5">
          <label className="text-xs font-semibold text-foreground flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="size-3.5 text-teal-600 dark:text-teal-400" />
              <span>Khoảng ngày khám</span>
            </span>
            {(fromDate || toDate) && (
              <button
                type="button"
                onClick={handleClearDates}
                className="text-[11px] text-rose-500 hover:underline cursor-pointer"
              >
                Xóa ngày
              </button>
            )}
          </label>

          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-1/2 rounded-xl border border-border/80 bg-background px-2.5 py-2 text-xs sm:text-sm text-foreground transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              title="Từ ngày"
            />
            <span className="text-xs text-muted-foreground font-semibold">-</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-1/2 rounded-xl border border-border/80 bg-background px-2.5 py-2 text-xs sm:text-sm text-foreground transition-all outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20"
              title="Đến ngày"
            />
          </div>
        </div>

        {/* Action Buttons: Refresh, Reset - col-span-2 */}
        <div className="lg:col-span-2 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="flex-1 gap-1.5 py-2 h-auto text-xs font-medium cursor-pointer"
            title="Tải lại dữ liệu"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span>Tải lại</span>
          </Button>

          {hasActiveFilters && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="gap-1 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer h-auto py-2"
              title="Đặt lại toàn bộ bộ lọc"
            >
              <RotateCcw className="size-3.5" />
              <span>Đặt lại</span>
            </Button>
          )}
        </div>
      </div>

      {/* 3. Phím tắt chọn nhanh ngày */}
      <div className="flex flex-wrap items-center gap-2 pt-1 text-xs text-muted-foreground border-t border-border/40">
        <span className="flex items-center gap-1 font-medium">
          <Filter className="size-3 text-teal-600 dark:text-teal-400" />
          <span>Chọn nhanh ngày:</span>
        </span>
        <button
          type="button"
          onClick={handleSetToday}
          className="rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-teal-500/10 hover:text-teal-600 transition-colors cursor-pointer"
        >
          Hôm nay
        </button>
        <button
          type="button"
          onClick={handleSetNext7Days}
          className="rounded-lg bg-muted px-2 py-1 text-[11px] font-semibold text-foreground hover:bg-teal-500/10 hover:text-teal-600 transition-colors cursor-pointer"
        >
          7 ngày tới
        </button>
        {(fromDate || toDate) && (
          <span className="text-[11px] text-teal-600 dark:text-teal-400 font-medium ml-auto flex items-center gap-1">
            <span>
              Đang lọc: {fromDate ? formatShortDate(fromDate) : '...'} đến{' '}
              {toDate ? formatShortDate(toDate) : '...'}
            </span>
            <span className="text-[10px] text-teal-600/70 font-mono">(GMT+7)</span>
          </span>
        )}
      </div>
    </div>
  )
}
