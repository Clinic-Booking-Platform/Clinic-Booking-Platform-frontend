import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CalendarClock,
  Clock,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  RotateCcw,
  Users,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { appointmentApi } from '@/services/appointment.api'
import { doctorApi } from '@/services/doctor.api'
import type {
  Appointment,
  PaginationMeta,
  AppointmentStatusFilter,
  UpdateAppointmentStatus,
} from '@/types/appointment.types'
import type { Doctor } from '@/types/doctor.types'

import {
  AppointmentFilter,
  AppointmentTable,
  AppointmentDetailModal,
  CancelAppointmentDialog,
  extractErrorMessage,
} from '@/components/appointment'

export const AppointmentListPage: React.FC = () => {
  // 1. Quản lý trạng thái thông qua URL searchParams
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

  const fromDate = searchParams.get('from_date') || ''
  const toDate = searchParams.get('to_date') || ''
  const search = searchParams.get('search') || ''

  const rawStatus = searchParams.get('status')
  const status: AppointmentStatusFilter =
    rawStatus === 'PENDING' ||
    rawStatus === 'CONFIRMED' ||
    rawStatus === 'COMPLETED' ||
    rawStatus === 'CANCELLED' ||
    rawStatus === 'NO_SHOW'
      ? rawStatus
      : 'ALL'

  // 2. State dữ liệu lịch hẹn & bác sĩ
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State điều khiển Modals
  const [detailAppointmentId, setDetailAppointmentId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const [cancellingAppointment, setCancellingAppointment] = useState<Appointment | null>(null)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)

  // Action loading state (cho từng nút trong dòng bảng)
  const [actionAppointmentId, setActionAppointmentId] = useState<number | null>(null)
  const [isActionLoading, setIsActionLoading] = useState(false)

  // 4. Tải danh sách bác sĩ cho dropdown lọc (all: true)
  useEffect(() => {
    let isMounted = true
    doctorApi
      .getDoctors({ status: 'active', all: true })
      .then((res) => {
        if (isMounted) {
          setDoctors(res.doctors || res.data?.doctors || [])
        }
      })
      .catch((err) => {
        console.error('Không thể tải danh sách bác sĩ:', err)
      })

    return () => {
      isMounted = false
    }
  }, [])

  // 5. Tải danh sách lịch hẹn khi searchParams thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      try {
        const result = await appointmentApi.getAdminAppointments({
          page,
          pageSize: 10,
          status,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
          search: search || undefined,
          doctor_id: doctorId,
        })
        if (!ignore) {
          setAppointments(result.appointments || [])
          setPagination(result.pagination || null)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải danh sách lịch hẹn khám!')
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
  }, [page, status, fromDate, toDate, search, doctorId])

  // Hàm reload thủ công
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await appointmentApi.getAdminAppointments({
        page,
        pageSize: 10,
        status,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
        search: search || undefined,
        doctor_id: doctorId,
      })
      setAppointments(result.appointments || [])
      setPagination(result.pagination || null)
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Không thể tải danh sách lịch hẹn khám!')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, status, fromDate, toDate, search, doctorId])

  // 6. Handlers cập nhật URL Params
  const updateQueryParam = (key: string, value: string | undefined) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (value && value.trim()) {
          next.set(key, value.trim())
        } else {
          next.delete(key)
        }
        next.set('page', '1')
        return next
      },
      { replace: true }
    )
  }

  const handlePageChange = (newPage: number) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        next.set('page', String(newPage))
        return next
      },
      { replace: true }
    )
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleSearchChange = (val: string) => {
    updateQueryParam('search', val)
  }

  const handleDoctorChange = (val?: number) => {
    updateQueryParam('doctor_id', val ? String(val) : undefined)
  }

  const handleFromDateChange = (val: string) => {
    updateQueryParam('from_date', val)
  }

  const handleToDateChange = (val: string) => {
    updateQueryParam('to_date', val)
  }

  const handleStatusChange = (newStatus: AppointmentStatusFilter) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        if (newStatus === 'ALL') {
          next.delete('status')
        } else {
          next.set('status', newStatus)
        }
        next.set('page', '1')
        return next
      },
      { replace: true }
    )
  }

  const handleResetFilters = () => {
    setSearchParams(new URLSearchParams({ page: '1' }), { replace: true })
  }

  // 7. Cập nhật tiến trình trạng thái lịch hẹn (State Machine: CONFIRMED, COMPLETED, NO_SHOW)
  const handleStatusUpdate = async (
    appointment: Appointment,
    newStatus: UpdateAppointmentStatus
  ) => {
    setActionAppointmentId(appointment.id)
    setIsActionLoading(true)

    try {
      await appointmentApi.updateAppointmentStatus(appointment.id, newStatus)

      let actionText = 'Đã cập nhật trạng thái'
      if (newStatus === 'CONFIRMED') actionText = 'Đã xác nhận lịch hẹn'
      if (newStatus === 'COMPLETED') actionText = 'Đã hoàn thành lượt khám'
      if (newStatus === 'NO_SHOW') actionText = 'Đã ghi nhận bệnh nhân vắng mặt'

      toast.success(`${actionText} #${appointment.id} thành công!`)
      await refetch()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Cập nhật trạng thái lịch hẹn thất bại!'))
    } finally {
      setActionAppointmentId(null)
      setIsActionLoading(false)
    }
  }

  // 8. Hủy lịch hẹn (DELETE /admin/appointments/:id)
  const handleOpenCancelDialog = (appointment: Appointment) => {
    setCancellingAppointment(appointment)
    setIsCancelDialogOpen(true)
  }

  const handleCloseCancelDialog = () => {
    if (isCancelling) return
    setIsCancelDialogOpen(false)
    setCancellingAppointment(null)
  }

  const handleConfirmCancel = async () => {
    if (!cancellingAppointment) return

    setIsCancelling(true)
    try {
      await appointmentApi.cancelAppointment(cancellingAppointment.id)
      toast.success(
        `Đã hủy lịch hẹn #${cancellingAppointment.id} thành công! Suất khám đã được hoàn trả.`
      )
      handleCloseCancelDialog()
      await refetch()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Hủy lịch hẹn thất bại!'))
    } finally {
      setIsCancelling(false)
    }
  }

  // 9. Xem chi tiết lịch hẹn
  const handleViewDetail = (appointment: Appointment) => {
    setDetailAppointmentId(appointment.id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setDetailAppointmentId(null)
  }

  // Thống kê nhanh số lượng
  const totalCount = pagination?.total || appointments.length
  const pendingCount = appointments.filter((a) => a.status === 'PENDING').length
  const confirmedCount = appointments.filter((a) => a.status === 'CONFIRMED').length
  const completedCount = appointments.filter((a) => a.status === 'COMPLETED').length

  return (
    <div className="space-y-6">
      {/* 1. Header Tiêu đề */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <CalendarClock className="size-6 text-teal-600 dark:text-teal-400" />
            <span>Quản lý Lịch hẹn khám (Appointments)</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Theo dõi danh sách bệnh nhân đặt khám, quản lý tiến trình ca khám và xử lý lịch hẹn thông minh
          </p>
        </div>
      </div>

      {/* 2. Thống kê nhanh (Stats Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng lịch hẹn */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng lượt đặt</span>
            <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-600 dark:text-teal-400">
              <Users className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
            {totalCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tất cả lịch trong hệ thống</p>
        </div>

        {/* Chờ duyệt (PENDING) */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Chờ duyệt</span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
              <Clock className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {pendingCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Cần Admin xác nhận</p>
        </div>

        {/* Đã xác nhận (CONFIRMED) */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã xác nhận</span>
            <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
              <UserCheck className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {confirmedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Sẵn sàng đến khám</p>
        </div>

        {/* Đã hoàn thành (COMPLETED) */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã hoàn thành</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {completedCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Đã hoàn tất buổi khám</p>
        </div>
      </div>

      {/* 3. Bộ lọc đa năng */}
      <AppointmentFilter
        search={search}
        onSearchChange={handleSearchChange}
        doctorId={doctorId}
        onDoctorChange={handleDoctorChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        status={status}
        onStatusChange={handleStatusChange}
        doctors={doctors}
        isLoadingDoctors={doctors.length === 0}
        onReset={handleResetFilters}
        onRefresh={refetch}
        isLoading={isLoading}
      />

      {/* 4. Thông báo lỗi nếu có */}
      {error && !isLoading && (
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <AlertCircle className="size-4 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold">Lỗi tải dữ liệu</p>
              <p className="mt-0.5">{error}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="flex items-center gap-1 font-semibold text-rose-700 dark:text-rose-300 hover:underline cursor-pointer"
          >
            <RotateCcw className="size-3.5" />
            <span>Thử lại</span>
          </button>
        </div>
      )}

      {/* 5. Bảng danh sách lịch hẹn & Smart Actions */}
      <AppointmentTable
        appointments={appointments}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
        onStatusUpdate={handleStatusUpdate}
        onCancelRequest={handleOpenCancelDialog}
        actionAppointmentId={actionAppointmentId}
        isActionLoading={isActionLoading}
      />

      {/* 6. Modal Xem chi tiết lịch hẹn */}
      <AppointmentDetailModal
        isOpen={isDetailModalOpen}
        appointmentId={detailAppointmentId}
        onClose={handleCloseDetailModal}
        onStatusUpdate={(apt, newStatus) => {
          handleStatusUpdate(apt, newStatus)
        }}
        onCancelRequest={(apt) => {
          handleOpenCancelDialog(apt)
        }}
      />

      {/* 7. Dialog Xác nhận Hủy lịch hẹn */}
      <CancelAppointmentDialog
        isOpen={isCancelDialogOpen}
        appointment={cancellingAppointment}
        isLoading={isCancelling}
        onClose={handleCloseCancelDialog}
        onConfirm={handleConfirmCancel}
      />
    </div>
  )
}
