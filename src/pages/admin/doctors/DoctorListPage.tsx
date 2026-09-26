import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Stethoscope,
  CheckCircle2,
  Lock,
  AlertCircle,
  RefreshCw,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

import { doctorApi } from '@/services/doctor.api'
import { specialtyService } from '@/services/specialty.api'
import type {
  Doctor,
  PaginationMeta,
  DoctorStatusFilter,
} from '@/types/doctor.types'
import type { Specialty } from '@/types/specialty.types'

import { DoctorFilter } from '@/components/admin/doctors/DoctorFilter'
import { DoctorTable } from '@/components/admin/doctors/DoctorTable'
import { DoctorCreateModal } from '@/components/admin/doctors/DoctorCreateModal'
import { DoctorEditModal } from '@/components/admin/doctors/DoctorEditModal'
import { DoctorDetailModal } from '@/components/admin/doctors/DoctorDetailModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export const DoctorListPage: React.FC = () => {
  // 1. Quản lý trạng thái thông qua URL searchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const search = searchParams.get('search') || ''

  const rawSpecialtyId = searchParams.get('specialty_id')
  const parsedSpecialtyId = rawSpecialtyId ? parseInt(rawSpecialtyId, 10) : undefined
  const specialtyId =
    parsedSpecialtyId && !isNaN(parsedSpecialtyId) && parsedSpecialtyId > 0
      ? parsedSpecialtyId
      : undefined

  const rawStatus = searchParams.get('status')
  const status: DoctorStatusFilter =
    rawStatus === 'active' || rawStatus === 'deleted' ? rawStatus : 'all'

  // 2. State dữ liệu danh sách bác sĩ, chuyên khoa & phân trang
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State điều khiển các Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)

  const [detailDoctorId, setDetailDoctorId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // State hộp thoại xác nhận Khóa / Khôi phục
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'delete' | 'restore'
    doctor: Doctor | null
    isLoading: boolean
  }>({
    isOpen: false,
    type: 'delete',
    doctor: null,
    isLoading: false,
  })

  // 4. Tải toàn bộ danh mục chuyên khoa active để đổ vào dropdown lọc & modal tạo/sửa
  useEffect(() => {
    let ignore = false
    specialtyService
      .getSpecialties({ status: 'active', all: true })
      .then((res) => {
        if (!ignore) {
          const list = res.specialties || res.data?.specialties || []
          setSpecialties(list)
        }
      })
      .catch((err) => {
        console.error('Không thể tải danh sách chuyên khoa:', err)
      })
    return () => {
      ignore = true
    }
  }, [])

  // 5. Gọi API nạp dữ liệu khi searchParams thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      try {
        const result = await doctorApi.getDoctors({
          page,
          search: search.trim() || undefined,
          specialty_id: specialtyId,
          status,
        })
        if (!ignore) {
          setDoctors(result.doctors || [])
          setPagination(result.pagination || null)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const errorObj = err as { response?: { data?: { message?: string } } }
          const msg = errorObj.response?.data?.message || 'Không thể tải danh sách bác sĩ!'
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
  }, [page, search, specialtyId, status])

  // Hàm làm mới danh sách thủ công (sau khi Thêm / Sửa / Khóa / Mở khóa)
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await doctorApi.getDoctors({
        page,
        search: search.trim() || undefined,
        specialty_id: specialtyId,
        status,
      })
      setDoctors(result.doctors || [])
      setPagination(result.pagination || null)
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } } }
      const msg = errorObj.response?.data?.message || 'Không thể tải danh sách bác sĩ!'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, specialtyId, status])

  // 6. Xử lý thay đổi URL searchParams
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

  const handleSearchChange = (newSearch: string) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        const trimmed = newSearch.trim()
        if (trimmed) {
          next.set('search', trimmed)
        } else {
          next.delete('search')
        }
        next.delete('page')
        return next
      },
      { replace: true }
    )
  }

  const handleSpecialtyChange = (newSpecialtyId?: number) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newSpecialtyId) {
        next.set('specialty_id', String(newSpecialtyId))
      } else {
        next.delete('specialty_id')
      }
      next.delete('page')
      return next
    })
  }

  const handleStatusChange = (newStatus: DoctorStatusFilter) => {
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

  const handleResetFilters = () => {
    setSearchParams({})
  }

  // 7. Xử lý các Modals
  const handleOpenCreateModal = () => {
    setIsCreateModalOpen(true)
  }

  const handleCloseCreateModal = () => {
    setIsCreateModalOpen(false)
  }

  const handleOpenEditModal = (doctor: Doctor) => {
    setEditingDoctor(doctor)
    setIsEditModalOpen(true)
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingDoctor(null)
  }

  const handleOpenDetailModal = (doctor: Doctor) => {
    setDetailDoctorId(doctor.id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setDetailDoctorId(null)
  }

  // 8. Xử lý Khóa (Xóa mềm) & Khôi phục
  const handlePromptDelete = (doctor: Doctor) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      doctor,
      isLoading: false,
    })
  }

  const handlePromptRestore = (doctor: Doctor) => {
    setConfirmDialog({
      isOpen: true,
      type: 'restore',
      doctor,
      isLoading: false,
    })
  }

  const handleCloseConfirmDialog = () => {
    if (!confirmDialog.isLoading) {
      setConfirmDialog({
        isOpen: false,
        type: 'delete',
        doctor: null,
        isLoading: false,
      })
    }
  }

  const handleExecuteConfirm = async () => {
    const { type, doctor } = confirmDialog
    if (!doctor) return

    const doctorName = doctor.user?.full_name || 'Bác sĩ'

    try {
      setConfirmDialog((prev) => ({ ...prev, isLoading: true }))
      if (type === 'delete') {
        await doctorApi.deleteDoctor(doctor.id)
        toast.success(`Đã khóa tài khoản bác sĩ "${doctorName}" thành công!`)
      } else {
        await doctorApi.restoreDoctor(doctor.id)
        toast.success(`Đã khôi phục tài khoản bác sĩ "${doctorName}" thành công!`)
      }

      handleCloseConfirmDialog()
      refetch()
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } }
      const msg =
        err.response?.data?.message ||
        (type === 'delete' ? 'Khóa tài khoản thất bại' : 'Khôi phục tài khoản thất bại')
      toast.error(msg)
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // 9. Thống kê nhanh từ danh sách hiện có
  const activeCount = doctors.filter((d) => !d.deleted_at).length
  const deletedCount = doctors.filter((d) => Boolean(d.deleted_at)).length

  return (
    <div className="space-y-5">
      {/* 1. Header & Nút Thao tác */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Stethoscope className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản Lý Bác Sĩ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Quản lý hồ sơ bác sĩ, phân khoa chuyên môn, biểu phí khám bệnh và cấp tài khoản nhân sự
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm gap-1.5 shadow-sm"
          >
            <Plus className="size-4" />
            <span>Cấp tài khoản Bác sĩ</span>
          </Button>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê Nhanh (Stats Chips) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Users className="size-4.5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Tổng số bác sĩ</div>
            <div className="text-lg font-bold text-foreground">
              {pagination?.total ?? doctors.length}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4.5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Đang hoạt động (Trang này)</div>
            <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Lock className="size-4.5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Đã vô hiệu hóa (Trang này)</div>
            <div className="text-lg font-bold text-rose-600 dark:text-rose-400">
              {deletedCount}
            </div>
          </div>
        </div>
      </div>

      {/* 3. Lỗi kết nối / Tải dữ liệu */}
      {error && !isLoading && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/20 bg-rose-500/10 p-3.5 text-xs sm:text-sm text-rose-600 dark:text-rose-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={refetch}
            className="h-7 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-500/20"
          >
            <RefreshCw className="size-3 mr-1" />
            Thử lại
          </Button>
        </div>
      )}

      {/* 4. Bộ Lọc Tìm Kiếm */}
      <DoctorFilter
        search={search}
        onSearchChange={handleSearchChange}
        specialtyId={specialtyId}
        onSpecialtyChange={handleSpecialtyChange}
        specialties={specialties}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
        onRefresh={refetch}
        isLoading={isLoading}
        totalItems={pagination?.total}
      />

      {/* 5. Bảng Dữ Liệu & Danh Sách Bác Sĩ */}
      <DoctorTable
        doctors={doctors}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetail={handleOpenDetailModal}
        onEdit={handleOpenEditModal}
        onDelete={handlePromptDelete}
        onRestore={handlePromptRestore}
        onResetFilter={handleResetFilters}
      />

      {/* 6. Modal Cấp Mới Tài Khoản Bác Sĩ */}
      {isCreateModalOpen && (
        <DoctorCreateModal
          isOpen={isCreateModalOpen}
          onClose={handleCloseCreateModal}
          onSuccess={refetch}
          specialties={specialties}
        />
      )}

      {/* 7. Modal Chỉnh Sửa Bác Sĩ */}
      {isEditModalOpen && editingDoctor && (
        <DoctorEditModal
          key={`edit-${editingDoctor.id}`}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSuccess={refetch}
          doctor={editingDoctor}
          specialties={specialties}
        />
      )}

      {/* 8. Modal Xem Chi Tiết Bác Sĩ */}
      {isDetailModalOpen && detailDoctorId && (
        <DoctorDetailModal
          key={`detail-${detailDoctorId}`}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          doctorId={detailDoctorId}
        />
      )}

      {/* 9. Hộp Thoại Xác Nhận Khóa / Mở Khóa */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleExecuteConfirm}
        isLoading={confirmDialog.isLoading}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'success'}
        title={
          confirmDialog.type === 'delete'
            ? 'Xác nhận khóa tài khoản bác sĩ'
            : 'Xác nhận khôi phục tài khoản bác sĩ'
        }
        description={
          confirmDialog.type === 'delete'
            ? `Bạn có chắc chắn muốn khóa tài khoản của bác sĩ "${confirmDialog.doctor?.user?.full_name || 'này'}"? Bác sĩ sẽ không thể đăng nhập và tạm dừng nhận lịch hẹn mới.`
            : `Bạn có muốn mở khóa tài khoản cho bác sĩ "${confirmDialog.doctor?.user?.full_name || 'này'}"? Bác sĩ sẽ có thể tiếp tục đăng nhập và khám chữa bệnh.`
        }
        confirmText={
          confirmDialog.type === 'delete' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
        }
        cancelText="Hủy bỏ"
      />
    </div>
  )
}
