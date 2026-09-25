import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Stethoscope,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

import { specialtyService } from '@/services/specialty.api'
import type {
  Specialty,
  PaginationMeta,
  SpecialtyStatusFilter,
} from '@/types/specialty.types'

import { SpecialtyFilter } from '@/components/admin/specialties/SpecialtyFilter'
import { SpecialtyTable } from '@/components/admin/specialties/SpecialtyTable'
import { SpecialtyFormModal } from '@/components/admin/specialties/SpecialtyFormModal'
import { SpecialtyDetailModal } from '@/components/admin/specialties/SpecialtyDetailModal'
import { ConfirmDialog } from '@/components/admin/specialties/ConfirmDialog'

export const SpecialtyListPage: React.FC = () => {
  // 1. Quản lý trạng thái thông qua URL searchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const search = searchParams.get('search') || ''

  const rawStatus = searchParams.get('status')
  const status: SpecialtyStatusFilter =
    rawStatus === 'active' || rawStatus === 'deleted' ? rawStatus : 'all'

  // 2. State dữ liệu danh sách chuyên khoa & phân trang
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State điều khiển các Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingSpecialty, setEditingSpecialty] = useState<Specialty | null>(null)

  const [detailSpecialtyId, setDetailSpecialtyId] = useState<number | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // State hộp thoại xác nhận Xóa / Khôi phục
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'delete' | 'restore'
    specialty: Specialty | null
    isLoading: boolean
  }>({
    isOpen: false,
    type: 'delete',
    specialty: null,
    isLoading: false,
  })

  // 4. Gọi API lấy danh sách mỗi khi page, search hoặc status thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      try {
        const data = await specialtyService.getSpecialties({
          page,
          search,
          status,
        })
        if (!ignore) {
          setSpecialties(data.specialties)
          setPagination(data.pagination)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const axiosErr = err as { response?: { data?: { message?: string } } }
          const msg =
            axiosErr.response?.data?.message ||
            'Không thể tải danh sách chuyên khoa, vui lòng thử lại!'
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
  }, [page, search, status])

  // Hàm làm mới danh sách thủ công (khi bấm nút Làm mới hoặc sau khi Lưu/Xóa)
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await specialtyService.getSpecialties({
        page,
        search,
        status,
      })
      setSpecialties(data.specialties)
      setPagination(data.pagination)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg =
        axiosErr.response?.data?.message ||
        'Không thể tải danh sách chuyên khoa, vui lòng thử lại!'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status])

  // 5. Các hàm cập nhật URL Search Params
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

  const handleStatusChange = (newStatus: SpecialtyStatusFilter) => {
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

  // 6. Xử lý Thao tác Thêm / Sửa / Xem chi tiết
  const handleOpenCreateModal = () => {
    setEditingSpecialty(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (specialty: Specialty) => {
    setEditingSpecialty(specialty)
    setIsFormModalOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setEditingSpecialty(null)
  }

  const handleOpenDetailModal = (specialty: Specialty) => {
    setDetailSpecialtyId(specialty.id)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setDetailSpecialtyId(null)
  }

  // 7. Xử lý Thao tác Xóa mềm & Khôi phục với Confirm Dialog
  const handlePromptDelete = (specialty: Specialty) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      specialty,
      isLoading: false,
    })
  }

  const handlePromptRestore = (specialty: Specialty) => {
    setConfirmDialog({
      isOpen: true,
      type: 'restore',
      specialty,
      isLoading: false,
    })
  }

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isLoading) return
    setConfirmDialog({
      isOpen: false,
      type: 'delete',
      specialty: null,
      isLoading: false,
    })
  }

  const handleExecuteConfirm = async () => {
    const { type, specialty } = confirmDialog
    if (!specialty) return

    setConfirmDialog((prev) => ({ ...prev, isLoading: true }))

    try {
      if (type === 'delete') {
        await specialtyService.deleteSpecialty(specialty.id)
        toast.success(`Đã chuyển chuyên khoa "${specialty.name}" vào thùng rác!`)
      } else {
        await specialtyService.restoreSpecialty(specialty.id)
        toast.success(`Đã khôi phục chuyên khoa "${specialty.name}" thành công!`)
      }
      await refetch()
      setConfirmDialog({
        isOpen: false,
        type: 'delete',
        specialty: null,
        isLoading: false,
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg =
        axiosErr.response?.data?.message ||
        (type === 'delete' ? 'Không thể xóa chuyên khoa!' : 'Không thể khôi phục chuyên khoa!')
      toast.error(msg)
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Thống kê nhanh
  const totalCount = pagination?.total ?? specialties.length
  const activeCount = specialties.filter((s) => !s.deleted_at).length
  const deletedCount = specialties.filter((s) => Boolean(s.deleted_at)).length

  return (
    <div className="space-y-6">
      {/* 1. Header Trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Stethoscope className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản Lý Chuyên Khoa
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Danh mục các chuyên khoa khám chữa bệnh, cấu hình hình ảnh và đội ngũ bác sĩ trực thuộc.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm px-3.5 py-2 shadow-xs"
          >
            <Plus className="size-4" />
            <span>Thêm chuyên khoa mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê Nhanh (Bento Cards) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Tổng số chuyên khoa
            </span>
            <div className="text-xl font-bold text-foreground">
              {totalCount}
            </div>
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Stethoscope className="size-4.5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Đang hoạt động (Trang này)
            </span>
            <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
              {activeCount}
            </div>
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="size-4.5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Đã vô hiệu hóa (Trang này)
            </span>
            <div className="text-xl font-bold text-rose-600 dark:text-rose-400">
              {deletedCount}
            </div>
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 dark:text-rose-400">
            <Trash2 className="size-4.5" />
          </div>
        </div>
      </div>

      {/* 3. Banner Cảnh Báo Lỗi Kết Nối */}
      {error && (
        <div className="flex items-center justify-between rounded-xl border border-rose-500/30 bg-rose-50/60 dark:bg-rose-950/20 p-4 text-xs text-rose-700 dark:text-rose-300">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={refetch}
            className="h-7 text-xs border-rose-200 text-rose-700 hover:bg-rose-100 dark:border-rose-800 dark:text-rose-200"
          >
            <RefreshCw className="size-3 mr-1" />
            Thử lại
          </Button>
        </div>
      )}

      {/* 4. Thanh Tìm Kiếm & Bộ Lọc Status (Đồng bộ URL Search Params) */}
      <SpecialtyFilter
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        onRefresh={refetch}
        isLoading={isLoading}
        totalItems={totalCount}
      />

      {/* 5. Bảng Dữ Liệu Chuyên Khoa */}
      <SpecialtyTable
        specialties={specialties}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetail={handleOpenDetailModal}
        onEdit={handleOpenEditModal}
        onDelete={handlePromptDelete}
        onRestore={handlePromptRestore}
        onCreateNew={handleOpenCreateModal}
      />

      {/* 6. Modal Thêm Mới / Cập Nhật */}
      {isFormModalOpen && (
        <SpecialtyFormModal
          key={editingSpecialty?.id ? `edit-${editingSpecialty.id}` : 'create'}
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          initialData={editingSpecialty}
          onSuccess={refetch}
        />
      )}

      {/* 7. Modal Xem Chi Tiết & Bác Sĩ Trực Thuộc */}
      {isDetailModalOpen && detailSpecialtyId && (
        <SpecialtyDetailModal
          key={`detail-${detailSpecialtyId}`}
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          specialtyId={detailSpecialtyId}
        />
      )}

      {/* 8. Hộp Thoại Xác Nhận Xóa Mềm / Khôi Phục */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleExecuteConfirm}
        isLoading={confirmDialog.isLoading}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'success'}
        title={
          confirmDialog.type === 'delete'
            ? 'Xác nhận xóa chuyên khoa'
            : 'Xác nhận khôi phục chuyên khoa'
        }
        description={
          confirmDialog.type === 'delete'
            ? `Bạn có chắc chắn muốn chuyển chuyên khoa "${confirmDialog.specialty?.name}" vào thùng rác? Dữ liệu này sẽ tạm ngưng hiển thị đối với bệnh nhân đặt lịch.`
            : `Bạn có muốn khôi phục chuyên khoa "${confirmDialog.specialty?.name}" về trạng thái hoạt động? Bệnh nhân sẽ có thể tiếp tục đặt lịch hẹn.`
        }
        confirmText={
          confirmDialog.type === 'delete' ? 'Xóa chuyên khoa' : 'Khôi phục ngay'
        }
        cancelText="Hủy bỏ"
      />
    </div>
  )
}
