import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  AlertCircle,
  XCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

import { scheduleApi } from '@/services/schedule.api'
import { doctorApi } from '@/services/doctor.api'
import type {
  Schedule,
  PaginationMeta,
  ScheduleStatusFilter,
} from '@/types/schedule.types'
import type { Doctor } from '@/types/doctor.types'

import { ScheduleFilter } from '@/components/schedule/ScheduleFilter'
import { ScheduleTable } from '@/components/schedule/ScheduleTable'
import { ScheduleCreateModal } from '@/components/schedule/ScheduleCreateModal'
import { ScheduleEditModal } from '@/components/schedule/ScheduleEditModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { extractErrorMessage } from '@/components/schedule/schedule.utils'

export const ScheduleListPage: React.FC = () => {
  // 1. Quản lý trạng thái qua URL searchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const rawDoctorId = searchParams.get('doctor_id')
  const parsedDoctorId = rawDoctorId ? parseInt(rawDoctorId, 10) : undefined
  const doctorId =
    parsedDoctorId && !isNaN(parsedDoctorId) && parsedDoctorId > 0
      ? parsedDoctorId
      : undefined

  const date = searchParams.get('date') || ''

  const rawStatus = searchParams.get('status')
  const status: ScheduleStatusFilter =
    rawStatus === 'AVAILABLE' || rawStatus === 'FULL' || rawStatus === 'CANCELLED'
      ? rawStatus
      : 'all'

  // 2. State dữ liệu ca làm việc & Bác sĩ
  const [schedules, setSchedules] = useState<Schedule[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State điều khiển Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingSchedule, setEditingSchedule] = useState<Schedule | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  // State xác nhận Xóa ca làm việc
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    schedule: Schedule | null
    isLoading: boolean
  }>({
    isOpen: false,
    schedule: null,
    isLoading: false,
  })

  // 4. Tải toàn bộ danh sách bác sĩ active cho dropdown lọc & modal tạo lịch
  useEffect(() => {
    let isMounted = true
    doctorApi
      .getDoctors({ status: 'active', all: true })
      .then((res) => {
        if (isMounted) {
          setDoctors(res.doctors || res.data?.doctors || [])
        }
      })
      .catch(() => {
        // Fallback im lặng nếu lỗi nạp bác sĩ
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 5. Gọi API nạp dữ liệu ca làm việc khi searchParams thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      try {
        const result = await scheduleApi.getSchedules({
          page,
          doctor_id: doctorId,
          date: date.trim() || undefined,
          status,
        })
        if (!ignore) {
          setSchedules(result.schedules || [])
          setPagination(result.pagination || null)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải danh sách ca làm việc!')
          setError(msg)
          toast.error(msg)
        }
      } finally {
        if (!ignore) {
          setIsLoading(false)
        }
      }
    }

    void loadData()

    return () => {
      ignore = true
    }
  }, [page, doctorId, date, status])

  // Hàm reload thủ công
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await scheduleApi.getSchedules({
        page,
        doctor_id: doctorId,
        date: date.trim() || undefined,
        status,
      })
      setSchedules(result.schedules || [])
      setPagination(result.pagination || null)
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Không thể tải danh sách ca làm việc!')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, doctorId, date, status])

  // 6. Cập nhật URL searchParams
  const handlePageChange = (newPage: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newPage > 1) {
        next.set('page', String(newPage))
      } else {
        next.delete('page')
      }
      return next
    })
  }

  const handleDoctorChange = (newDoctorId?: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newDoctorId) {
        next.set('doctor_id', String(newDoctorId))
      } else {
        next.delete('doctor_id')
      }
      next.delete('page')
      return next
    })
  }

  const handleDateChange = (newDate: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newDate) {
        next.set('date', newDate)
      } else {
        next.delete('date')
      }
      next.delete('page')
      return next
    })
  }

  const handleStatusChange = (newStatus: ScheduleStatusFilter) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newStatus !== 'all') {
        next.set('status', newStatus)
      } else {
        next.delete('status')
      }
      next.delete('page')
      return next
    })
  }

  const handleResetFilter = () => {
    setSearchParams({})
  }

  // 7. Thao tác Modals
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleOpenEditModal = (schedule: Schedule) => {
    setEditingSchedule(schedule)
    setIsEditModalOpen(true)
  }

  const handleOpenDeleteDialog = (schedule: Schedule) => {
    setConfirmDialog({
      isOpen: true,
      schedule,
      isLoading: false,
    })
  }

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isLoading) return
    setConfirmDialog({
      isOpen: false,
      schedule: null,
      isLoading: false,
    })
  }

  // 8. Thực thi Xóa ca làm việc
  const handleConfirmDelete = async () => {
    const { schedule } = confirmDialog
    if (!schedule) return

    setConfirmDialog((prev) => ({ ...prev, isLoading: true }))
    try {
      await scheduleApi.deleteSchedule(schedule.id)
      toast.success(`Đã xóa ca làm việc #${schedule.id} thành công!`)
      handleCloseConfirmDialog()
      await refetch()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Xóa ca làm việc thất bại!'))
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Thống kê nhanh số ca
  const totalCount = pagination?.total || schedules.length
  const availableCount = schedules.filter((s) => s.status === 'AVAILABLE').length
  const fullCount = schedules.filter((s) => s.status === 'FULL').length
  const cancelledCount = schedules.filter((s) => s.status === 'CANCELLED').length

  return (
    <div className="space-y-6">
      {/* 1. Header & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarClock className="size-6 text-teal-600 dark:text-teal-400" />
            <span>Quản lý Lịch làm việc Bác sĩ</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Phân bổ ca trực theo ngày, thiết lập định mức bệnh nhân và quản lý lịch hẹn khám bệnh
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-medium cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Tạo lịch làm việc</span>
          </Button>
        </div>
      </div>

      {/* 2. Thống kê nhanh (Quick Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng ca làm việc */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng số ca</span>
            <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-600 dark:text-teal-400">
              <CalendarClock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
            {totalCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tất cả ca trong hệ thống</p>
        </div>

        {/* Còn chỗ trống */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Còn chỗ trống</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {availableCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sẵn sàng nhận bệnh nhân</p>
        </div>

        {/* Đã kín chỗ */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã kín chỗ</span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
              <AlertCircle className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {fullCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Đạt số lượng tối đa</p>
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
          <p className="text-[11px] text-muted-foreground mt-0.5">Ngừng tiếp nhận khám</p>
        </div>
      </div>

      {/* 3. Khung Tìm kiếm & Bộ lọc */}
      <ScheduleFilter
        doctorId={doctorId}
        onDoctorChange={handleDoctorChange}
        doctors={doctors}
        date={date}
        onDateChange={handleDateChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilter}
        onRefresh={refetch}
        isLoading={isLoading}
        totalItems={pagination?.total}
      />

      {/* 4. Thông báo Lỗi nếu API xảy ra sự cố */}
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

      {/* 5. Bảng hiển thị danh sách ca làm việc & Phân trang */}
      <ScheduleTable
        schedules={schedules}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
        onResetFilter={handleResetFilter}
      />

      {/* 6. Modal Tạo mới lịch làm việc (Bulk Create) */}
      <ScheduleCreateModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={refetch}
        doctors={doctors}
        defaultDoctorId={doctorId}
        defaultDate={date}
      />

      {/* 7. Modal Chỉnh sửa ca làm việc */}
      <ScheduleEditModal
        isOpen={isEditModalOpen}
        schedule={editingSchedule}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingSchedule(null)
        }}
        onSuccess={refetch}
      />

      {/* 8. Hộp thoại Xác nhận Xóa ca làm việc */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        isLoading={confirmDialog.isLoading}
        variant="danger"
        title="Xác nhận xóa ca làm việc"
        description={
          (confirmDialog.schedule?.current_number ?? 0) > 0
            ? `CẢNH BÁO: Ca làm việc #${confirmDialog.schedule?.id} của bác sĩ ${
                confirmDialog.schedule?.doctor?.user?.full_name || ''
              } hiện đã có ${
                confirmDialog.schedule?.current_number
              } bệnh nhân đặt lịch khám! Việc xóa ca này sẽ ảnh hưởng đến các cuộc hẹn đã xác nhận. Bạn có chắc chắn muốn tiếp tục xóa?`
            : `Bạn có chắc chắn muốn xóa ca làm việc #${confirmDialog.schedule?.id} của bác sĩ ${
                confirmDialog.schedule?.doctor?.user?.full_name || ''
              }? Bệnh nhân sẽ không thể đặt lịch khám trong ca này.`
        }
        confirmText="Xóa ca"
        cancelText="Hủy bỏ"
      />
    </div>
  )
}
