import React, { useState, useEffect, useCallback } from 'react'
import {
  CalendarDays,
  Calendar,
  Table as TableIcon,
  Plus,
  Layers,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
  Filter,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'
import { cn } from 'cn'
import { scheduleApi } from '@/services/schedule.api'
import type {
  Schedule,
  PaginationMeta,
  ScheduleStatusFilter,
  TimeSlotKey,
} from '@/types/schedule.types'
import {
  getWeekDays,
  extractErrorMessage,
} from '@/components/schedule/schedule.utils'
import {
  DoctorWeeklyCalendarView,
  DoctorScheduleTableView,
  DoctorBulkCreateModal,
  DoctorSingleCreateModal,
  DoctorScheduleDetailModal,
  DoctorCancelConfirmModal,
  DoctorReopenConfirmModal,
} from '@/components/doctor/schedules'

export const DoctorSchedulePage: React.FC = () => {
  // 1. Chế độ hiển thị: Lịch theo tuần ('calendar') hoặc Bảng chi tiết ('table')
  const [viewMode, setViewMode] = useState<'calendar' | 'table'>('calendar')

  // 2. State thời gian và bộ lọc
  const [currentWeekDate, setCurrentWeekDate] = useState<Date>(new Date())
  const [statusFilter, setStatusFilter] = useState<ScheduleStatusFilter>('all')
  const [page, setPage] = useState<number>(1)

  // 3. State dữ liệu
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 4. State các Modals
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false)
  const [isSingleModalOpen, setIsSingleModalOpen] = useState(false)
  const [singleModalPreset, setSingleModalPreset] = useState<{
    date?: string
    slot?: TimeSlotKey
  }>({})

  const [detailSchedule, setDetailSchedule] = useState<Schedule | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const [cancelSchedule, setCancelSchedule] = useState<Schedule | null>(null)
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false)

  const [reopenSchedule, setReopenSchedule] = useState<Schedule | null>(null)
  const [isReopenModalOpen, setIsReopenModalOpen] = useState(false)

  // 5. Tải danh sách ca làm việc của Bác sĩ từ Backend
  useEffect(() => {
    let ignore = false

    let fromDate: string | undefined
    let toDate: string | undefined

    if (viewMode === 'calendar') {
      const weekDays = getWeekDays(currentWeekDate)
      fromDate = weekDays[0].dateString
      toDate = weekDays[6].dateString
    }

    scheduleApi
      .getDoctorSchedules({
        page: viewMode === 'table' ? page : 1,
        pageSize: viewMode === 'calendar' ? 100 : 10,
        fetchAllPages: viewMode === 'calendar',
        from_date: fromDate,
        to_date: toDate,
        status: statusFilter,
      })
      .then((res) => {
        if (!ignore) {
          setSchedules(res.schedules || [])
          setPagination(res.pagination || null)
          setError(null)
          setIsLoading(false)
        }
      })
      .catch((err: unknown) => {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải lịch làm việc của Bác sĩ!')
          setError(msg)
          toast.error(msg)
          setIsLoading(false)
        }
      })

    return () => {
      ignore = true
    }
  }, [viewMode, currentWeekDate, statusFilter, page])

  // Hàm reload thủ công
  const refetch = useCallback(() => {
    setIsLoading(true)
    let fromDate: string | undefined
    let toDate: string | undefined

    if (viewMode === 'calendar') {
      const weekDays = getWeekDays(currentWeekDate)
      fromDate = weekDays[0].dateString
      toDate = weekDays[6].dateString
    }

    scheduleApi
      .getDoctorSchedules({
        page: viewMode === 'table' ? page : 1,
        pageSize: viewMode === 'calendar' ? 100 : 10,
        fetchAllPages: viewMode === 'calendar',
        from_date: fromDate,
        to_date: toDate,
        status: statusFilter,
      })
      .then((res) => {
        setSchedules(res.schedules || [])
        setPagination(res.pagination || null)
        setError(null)
      })
      .catch((err: unknown) => {
        const msg = extractErrorMessage(err, 'Không thể tải lịch làm việc của Bác sĩ!')
        setError(msg)
        toast.error(msg)
      })
      .finally(() => {
        setIsLoading(false)
      })
  }, [viewMode, currentWeekDate, statusFilter, page])

  // Handlers mở modal tạo ca đơn từ ô lịch trống
  const handleAddFromCalendar = (dateString: string, timeSlotKey: TimeSlotKey) => {
    setSingleModalPreset({ date: dateString, slot: timeSlotKey })
    setIsSingleModalOpen(true)
  }

  // Handlers mở modal chi tiết ca
  const handleSelectSchedule = (schedule: Schedule) => {
    setDetailSchedule(schedule)
    setIsDetailModalOpen(true)
  }

  // Handlers mở modal hủy ca
  const handleTriggerCancel = (schedule: Schedule) => {
    setCancelSchedule(schedule)
    setIsCancelModalOpen(true)
  }

  // Handlers mở modal mở lại ca
  const handleTriggerReopen = (schedule: Schedule) => {
    setReopenSchedule(schedule)
    setIsReopenModalOpen(true)
  }

  // Thống kê nhanh số ca
  const totalCount = pagination?.total ?? schedules.length
  const availableCount = schedules.filter((s) => s.status === 'AVAILABLE').length
  const fullCount = schedules.filter((s) => s.status === 'FULL').length
  const cancelledCount = schedules.filter((s) => s.status === 'CANCELLED').length

  return (
    <div className="space-y-6">
      {/* ── 1. HEADER CHÍNH & CÁC NÚT HÀNH ĐỘNG ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarDays className="size-6 text-teal-600 dark:text-teal-400" />
            <span>Quản lý Lịch làm việc & Ca khám</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Xem lịch trực quan, đăng ký ca tiếp nhận bệnh nhân và quản lý khung giờ khám của bạn
          </p>
        </div>

        {/* Nút hành động chính: Đăng ký hàng loạt & Thêm 1 ca đơn */}
        <div className="flex items-center gap-2.5 self-start lg:self-auto flex-wrap">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              setSingleModalPreset({})
              setIsSingleModalOpen(true)
            }}
            className="cursor-pointer gap-2 font-medium h-9.5 text-xs sm:text-sm border-border/80"
          >
            <Plus className="size-4 text-teal-600" />
            <span>Thêm 1 ca đơn</span>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={() => setIsBulkModalOpen(true)}
            className="cursor-pointer gap-2 font-medium h-9.5 text-xs sm:text-sm bg-teal-600 hover:bg-teal-700 text-white shadow-xs"
          >
            <Layers className="size-4" />
            <span>Đăng ký nhiều ca (Hàng loạt)</span>
          </Button>
        </div>
      </div>

      {/* ── 2. QUICK STAT CARDS (THỐNG KÊ NHANH) ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng ca */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng số ca</span>
            <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-600 dark:text-teal-400">
              <Calendar className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
            {totalCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Trong khoảng hiển thị</p>
        </div>

        {/* Đang mở nhận */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đang nhận bệnh</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {availableCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sẵn sàng nhận lịch khám</p>
        </div>

        {/* Đã kín chỗ */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã đầy ca</span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {fullCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Đã đạt định mức tối đa</p>
        </div>

        {/* Đã hủy ca */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã hủy ca</span>
            <div className="rounded-lg bg-rose-500/10 p-1.5 text-rose-600 dark:text-rose-400">
              <XCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-rose-600 dark:text-rose-400">
            {cancelledCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tạm ngưng tiếp nhận</p>
        </div>
      </div>

      {/* ── 3. THANH ĐIỀU HƯỚNG CHẾ ĐỘ XEM & BỘ LỌC ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card border border-border/80 rounded-2xl p-3 sm:p-4 shadow-2xs">
        {/* View Mode Toggle: Lịch theo tuần vs Danh sách chi tiết */}
        <div className="inline-flex items-center rounded-xl border border-border/80 bg-muted/40 p-1 shadow-2xs self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setViewMode('calendar')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              viewMode === 'calendar'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <Calendar className="size-3.5 text-teal-600" />
            <span>Lịch theo tuần</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer',
              viewMode === 'table'
                ? 'bg-card text-foreground shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            )}
          >
            <TableIcon className="size-3.5 text-teal-600" />
            <span>Danh sách chi tiết</span>
          </button>
        </div>

        {/* Lọc Trạng thái & Nút Reload */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="size-3.5" />
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as ScheduleStatusFilter)
                setPage(1)
              }}
              className="h-9 px-2.5 rounded-xl border border-input bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-600 cursor-pointer"
            >
              <option value="all">Tất cả trạng thái</option>
              <option value="AVAILABLE">Đang mở nhận (AVAILABLE)</option>
              <option value="FULL">Đã đầy ca (FULL)</option>
              <option value="CANCELLED">Đã hủy ca (CANCELLED)</option>
            </select>
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetch}
            className="h-9 px-2.5 cursor-pointer text-muted-foreground hover:text-foreground"
            title="Làm mới dữ liệu"
          >
            <RefreshCw className={cn('size-3.5', isLoading && 'animate-spin')} />
          </Button>
        </div>
      </div>

      {/* ── 4. THÔNG BÁO LỖI NẾU API THẤT BẠI ── */}
      {error && !isLoading && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle className="size-5 shrink-0" />
            <div className="text-sm font-medium">{error}</div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetch}
            className="border-rose-500/30 hover:bg-rose-500/20 cursor-pointer"
          >
            <RefreshCw className="size-3.5 mr-1.5" />
            <span>Thử lại</span>
          </Button>
        </div>
      )}

      {/* ── 5. NỘI DUNG CHÍNH (WEEKLY CALENDAR HOẶC TABLE LIST) ── */}
      {viewMode === 'calendar' ? (
        <DoctorWeeklyCalendarView
          schedules={schedules}
          selectedDate={currentWeekDate}
          onDateChange={(date) => setCurrentWeekDate(date)}
          onAddSchedule={handleAddFromCalendar}
          onSelectSchedule={handleSelectSchedule}
          isLoading={isLoading}
        />
      ) : (
        <DoctorScheduleTableView
          schedules={schedules}
          pagination={pagination}
          isLoading={isLoading}
          onPageChange={(newPage) => setPage(newPage)}
          onEdit={handleSelectSchedule}
          onCancel={handleTriggerCancel}
          onReopen={handleTriggerReopen}
          onResetFilter={() => {
            setStatusFilter('all')
            setPage(1)
          }}
        />
      )}

      {/* ── 6. MODALS TƯƠNG TÁC ── */}
      {/* Modal Đăng ký hàng loạt */}
      <DoctorBulkCreateModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={refetch}
      />

      {/* Modal Đăng ký 1 ca đơn */}
      <DoctorSingleCreateModal
        isOpen={isSingleModalOpen}
        onClose={() => setIsSingleModalOpen(false)}
        onSuccess={refetch}
        defaultDate={singleModalPreset.date}
        defaultTimeSlot={singleModalPreset.slot}
      />

      {/* Modal Chi tiết & Sửa định mức */}
      <DoctorScheduleDetailModal
        isOpen={isDetailModalOpen}
        schedule={detailSchedule}
        onClose={() => {
          setIsDetailModalOpen(false)
          setDetailSchedule(null)
        }}
        onSuccess={refetch}
        onTriggerCancel={handleTriggerCancel}
        onTriggerReopen={handleTriggerReopen}
      />

      {/* Modal Xác nhận Hủy ca (Cascade Auto-Cancel Warning) */}
      <DoctorCancelConfirmModal
        isOpen={isCancelModalOpen}
        schedule={cancelSchedule}
        onClose={() => {
          setIsCancelModalOpen(false)
          setCancelSchedule(null)
        }}
        onSuccess={refetch}
      />

      {/* Modal Xác nhận Mở lại ca */}
      <DoctorReopenConfirmModal
        isOpen={isReopenModalOpen}
        schedule={reopenSchedule}
        onClose={() => {
          setIsReopenModalOpen(false)
          setReopenSchedule(null)
        }}
        onSuccess={refetch}
      />
    </div>
  )
}
