// ================= FILE: src/components/medical-record/MedicalRecordFilter.tsx =================

import React, { useState, useEffect } from 'react'
import {
  Search,
  UserCheck,
  RotateCcw,
  RefreshCw,
  X,
  Calendar,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { Doctor } from '@/types/doctor.types'
import {
  getVietnamDateString,
  getVietnamDaysOffsetString,
  formatShortDate,
} from './medical-record.utils'

export interface MedicalRecordFilterProps {
  search: string
  onSearchChange: (value: string) => void
  doctorId?: number
  onDoctorChange: (doctorId?: number) => void
  fromDate: string
  onFromDateChange: (date: string) => void
  toDate: string
  onToDateChange: (date: string) => void
  doctors: Doctor[]
  isLoadingDoctors?: boolean
  onReset: () => void
  onRefresh: () => void
  isLoading?: boolean
}

export const MedicalRecordFilter: React.FC<MedicalRecordFilterProps> = ({
  search,
  onSearchChange,
  doctorId,
  onDoctorChange,
  fromDate,
  onFromDateChange,
  toDate,
  onToDateChange,
  doctors,
  isLoadingDoctors = false,
  onReset,
  onRefresh,
  isLoading = false,
}) => {
  // Local state for debounced search with render-time sync to avoid setState in effect
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
    }, 500)
    return () => clearTimeout(handler)
  }, [localSearch, search, onSearchChange])

  // Quick date selections in Vietnam timezone (Asia/Ho_Chi_Minh - GMT+7)
  const handleSetToday = () => {
    const today = getVietnamDateString()
    onFromDateChange(today)
    onToDateChange(today)
  }

  const handleSetPast7Days = () => {
    const today = getVietnamDateString()
    const past7Days = getVietnamDaysOffsetString(-7)
    onFromDateChange(past7Days)
    onToDateChange(today)
  }

  const handleSetPast30Days = () => {
    const today = getVietnamDateString()
    const past30Days = getVietnamDaysOffsetString(-30)
    onFromDateChange(past30Days)
    onToDateChange(today)
  }

  const handleClearDates = () => {
    onFromDateChange('')
    onToDateChange('')
  }

  // Count active filters
  const activeFiltersCount =
    (search ? 1 : 0) +
    (doctorId ? 1 : 0) +
    (fromDate ? 1 : 0) +
    (toDate ? 1 : 0)

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs space-y-3.5">
      {/* Filter controls row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
        {/* 1. Ô tìm kiếm debounce 500ms (chiếm 4 cột trên desktop) */}
        <div className="lg:col-span-4 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Tìm mã bệnh án, chẩn đoán, tên bệnh nhân..."
            className="w-full h-9.5 pl-9 pr-8 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground placeholder:text-muted-foreground focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
          />
          {localSearch && (
            <button
              type="button"
              onClick={() => {
                setLocalSearch('')
                onSearchChange('')
              }}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              title="Xóa tìm kiếm"
            >
              <X className="size-3.5" />
            </button>
          )}
        </div>

        {/* 2. Dropdown chọn Bác sĩ (chiếm 3 cột trên desktop) */}
        <div className="lg:col-span-3 relative">
          <div className="relative">
            <UserCheck className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
            <select
              value={doctorId ?? ''}
              onChange={(e) => {
                const val = e.target.value
                onDoctorChange(val ? Number(val) : undefined)
              }}
              disabled={isLoadingDoctors}
              className="w-full h-9.5 pl-9 pr-8 rounded-lg border border-border bg-background text-xs sm:text-sm text-foreground focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors cursor-pointer appearance-none"
            >
              <option value="">Tất cả bác sĩ</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.id}>
                  {doc.user?.full_name || `Bác sĩ #${doc.id}`}
                  {doc.specialty?.name ? ` (${doc.specialty.name})` : ''}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs">
              ▼
            </div>
          </div>
        </div>

        {/* 3. Dải ngày: Từ ngày - Đến ngày (chiếm 3 cột trên desktop) */}
        <div className="lg:col-span-3 flex items-center gap-2">
          {/* Từ ngày */}
          <div className="relative flex-1">
            <input
              type="date"
              value={fromDate}
              onChange={(e) => onFromDateChange(e.target.value)}
              className="w-full h-9.5 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              title="Từ ngày lập hồ sơ bệnh án"
            />
          </div>

          <span className="text-muted-foreground text-xs font-semibold shrink-0">—</span>

          {/* Đến ngày */}
          <div className="relative flex-1">
            <input
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(e) => onToDateChange(e.target.value)}
              className="w-full h-9.5 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-hidden focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-colors"
              title="Đến ngày lập hồ sơ bệnh án (phải lớn hơn hoặc bằng Từ ngày)"
            />
          </div>
        </div>

        {/* 4. Nhóm nút Reset & Refresh (chiếm 2 cột trên desktop) */}
        <div className="lg:col-span-2 flex items-center justify-end gap-1.5">
          {activeFiltersCount > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onReset}
              className="h-9.5 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-foreground hover:bg-muted cursor-pointer"
              title="Xóa tất cả bộ lọc"
            >
              <RotateCcw className="size-3.5" />
              <span>Xóa ({activeFiltersCount})</span>
            </Button>
          )}

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-9.5 px-2.5 gap-1.5 text-xs text-muted-foreground hover:text-teal-600 hover:border-teal-500/40 cursor-pointer"
            title="Làm mới danh sách"
          >
            <RefreshCw className={`size-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden xl:inline">Làm mới</span>
          </Button>
        </div>
      </div>

      {/* Quick Date Shortcuts & Timezone Display Indicator (chỉ hiển thị) */}
      <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-border/50 text-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-muted-foreground font-medium flex items-center gap-1 text-[11px]">
            <Calendar className="size-3 text-teal-600 dark:text-teal-400" />
            <span>Chọn nhanh:</span>
          </span>
          <button
            type="button"
            onClick={handleSetToday}
            className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground hover:bg-teal-500/10 hover:text-teal-600 transition-colors cursor-pointer"
          >
            Hôm nay
          </button>
          <button
            type="button"
            onClick={handleSetPast7Days}
            className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground hover:bg-teal-500/10 hover:text-teal-600 transition-colors cursor-pointer"
          >
            7 ngày qua
          </button>
          <button
            type="button"
            onClick={handleSetPast30Days}
            className="rounded-md bg-muted px-2 py-1 text-[11px] font-medium text-foreground hover:bg-teal-500/10 hover:text-teal-600 transition-colors cursor-pointer"
          >
            30 ngày qua
          </button>
          {(fromDate || toDate) && (
            <button
              type="button"
              onClick={handleClearDates}
              className="text-[11px] text-rose-500 hover:underline cursor-pointer ml-1"
            >
              Xóa ngày
            </button>
          )}
        </div>

        {/* Display Badge strictly in Vietnam format DD/MM/YYYY (GMT+7) */}
        {(fromDate || toDate) && (
          <div className="flex items-center gap-1 text-[11px] text-teal-700 dark:text-teal-400 bg-teal-500/10 px-2.5 py-0.5 rounded-full border border-teal-500/20 font-medium ml-auto">
            <span>
              Đang lọc (Ngày lập BA): {fromDate ? formatShortDate(fromDate) : '...'} —{' '}
              {toDate ? formatShortDate(toDate) : '...'}
            </span>
            <span className="text-[10px] text-teal-600/70 font-mono">(GMT+7)</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default MedicalRecordFilter
