import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  PackagePlus,
  CheckCircle2,
  Trash2,
  AlertCircle,
  RefreshCw,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

import { packageApi } from '@/services/package.api'
import type {
  MedicalPackage,
  PaginationMeta,
  PackageStatusFilter,
} from '@/types/package.types'

import { PackageFilter } from '@/components/admin/package/PackageFilter'
import { PackageTable } from '@/components/admin/package/PackageTable'
import { PackageFormModal } from '@/components/admin/package/PackageFormModal'
import { PackageDetailDrawer } from '@/components/admin/package/PackageDetailDrawer'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'

export const PackageListPage: React.FC = () => {
  // 1. Quản lý trạng thái thông qua URL searchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const search = searchParams.get('search') || ''

  const rawStatus = searchParams.get('status')
  const status: PackageStatusFilter =
    rawStatus === 'active' || rawStatus === 'deleted' ? rawStatus : 'all'

  const priceRange = searchParams.get('price_range') || ''

  // Tính toán min_price / max_price tương ứng với priceRange
  let minPrice: number | undefined
  let maxPrice: number | undefined
  if (priceRange === 'duoi-1000') {
    maxPrice = 1000000
  } else if (priceRange === '1000-3000') {
    minPrice = 1000000
    maxPrice = 3000000
  } else if (priceRange === '3000-5000') {
    minPrice = 3000000
    maxPrice = 5000000
  } else if (priceRange === 'tren-5000') {
    minPrice = 5000000
  }

  // 2. State dữ liệu danh sách gói khám & phân trang
  const [packages, setPackages] = useState<MedicalPackage[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State điều khiển Modals & Drawer
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingPackage, setEditingPackage] = useState<MedicalPackage | null>(null)

  const [detailPackageId, setDetailPackageId] = useState<number | null>(null)
  const [isDetailDrawerOpen, setIsDetailDrawerOpen] = useState(false)

  // State hộp thoại xác nhận Ngừng cung cấp / Khôi phục
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'delete' | 'restore'
    pkg: MedicalPackage | null
    isLoading: boolean
  }>({
    isOpen: false,
    type: 'delete',
    pkg: null,
    isLoading: false,
  })

  // 4. Gọi API nạp dữ liệu khi searchParams thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      try {
        const data = await packageApi.getPackages({
          page,
          search,
          status,
          price_range: priceRange || undefined,
          min_price: minPrice,
          max_price: maxPrice,
        })
        if (!ignore) {
          setPackages(data.packages)
          setPagination(data.pagination)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const axiosErr = err as { response?: { data?: { message?: string } } }
          const msg =
            axiosErr.response?.data?.message ||
            'Không thể tải danh sách gói khám, vui lòng thử lại!'
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
  }, [page, search, status, priceRange, minPrice, maxPrice])

  // Hàm làm mới danh sách thủ công
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await packageApi.getPackages({
        page,
        search,
        status,
        price_range: priceRange || undefined,
        min_price: minPrice,
        max_price: maxPrice,
      })
      setPackages(data.packages)
      setPagination(data.pagination)
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg =
        axiosErr.response?.data?.message ||
        'Không thể tải danh sách gói khám, vui lòng thử lại!'
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status, priceRange, minPrice, maxPrice])

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

  const handleStatusChange = (newStatus: PackageStatusFilter) => {
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

  const handlePriceRangeChange = (newRange: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (newRange) {
        next.set('price_range', newRange)
      } else {
        next.delete('price_range')
      }
      next.delete('page')
      return next
    })
  }

  // 6. Xử lý Thao tác Thêm / Sửa / Xem chi tiết
  const handleOpenCreateModal = () => {
    setEditingPackage(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (pkg: MedicalPackage) => {
    setEditingPackage(pkg)
    setIsFormModalOpen(true)
  }

  const handleCloseFormModal = () => {
    setIsFormModalOpen(false)
    setEditingPackage(null)
  }

  const handleOpenDetailDrawer = (pkg: MedicalPackage) => {
    setDetailPackageId(pkg.id)
    setIsDetailDrawerOpen(true)
  }

  const handleCloseDetailDrawer = () => {
    setIsDetailDrawerOpen(false)
    setDetailPackageId(null)
  }

  // 7. Xử lý Ngừng cung cấp & Khôi phục với ConfirmDialog
  const handlePromptDelete = (pkg: MedicalPackage) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      pkg,
      isLoading: false,
    })
  }

  const handlePromptRestore = (pkg: MedicalPackage) => {
    setConfirmDialog({
      isOpen: true,
      type: 'restore',
      pkg,
      isLoading: false,
    })
  }

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isLoading) return
    setConfirmDialog({
      isOpen: false,
      type: 'delete',
      pkg: null,
      isLoading: false,
    })
  }

  const handleExecuteConfirm = async () => {
    const { type, pkg } = confirmDialog
    if (!pkg) return

    setConfirmDialog((prev) => ({ ...prev, isLoading: true }))

    try {
      if (type === 'delete') {
        await packageApi.deletePackage(pkg.id)
        toast.success(`Đã ngừng cung cấp gói khám "${pkg.name}"!`)
      } else {
        await packageApi.restorePackage(pkg.id)
        toast.success(`Đã khôi phục gói khám "${pkg.name}" thành công!`)
      }
      await refetch()
      setConfirmDialog({
        isOpen: false,
        type: 'delete',
        pkg: null,
        isLoading: false,
      })
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } }
      const msg =
        axiosErr.response?.data?.message ||
        (type === 'delete' ? 'Không thể ngừng cung cấp gói khám!' : 'Không thể khôi phục gói khám!')
      toast.error(msg)
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Quick stats
  const totalCount = pagination?.total ?? packages.length
  const activeCount = packages.filter((p) => !p.deleted_at).length
  const deletedCount = packages.filter((p) => Boolean(p.deleted_at)).length

  return (
    <div className="space-y-6">
      {/* 1. Header Trang */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <PackagePlus className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản Lý Gói Khám & Dịch Vụ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Thiết lập danh mục các gói khám sức khỏe tổng quát, bảng giá, chương trình giảm giá và danh mục xét nghiệm.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs sm:text-sm px-3.5 py-2 shadow-xs"
          >
            <Plus className="size-4" />
            <span>Tạo gói khám mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê Nhanh (Bento Cards) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Tổng số gói khám
            </span>
            <div className="text-xl font-bold text-foreground">
              {totalCount}
            </div>
          </div>
          <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <PackagePlus className="size-4.5" />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-border/80 bg-card p-3.5 shadow-2xs">
          <div className="space-y-0.5">
            <span className="text-xs font-medium text-muted-foreground">
              Đang mở bán (Trang này)
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
              Ngừng cung cấp (Trang này)
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

      {/* 3. Banner Cảnh Báo Lỗi */}
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

      {/* 4. Thanh Tìm Kiếm, Lọc Trạng Thái & Lọc Khoảng Giá */}
      <PackageFilter
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        priceRange={priceRange}
        onPriceRangeChange={handlePriceRangeChange}
        onRefresh={refetch}
        isLoading={isLoading}
        totalItems={totalCount}
      />

      {/* 5. Bảng Dữ Liệu Gói Khám */}
      <PackageTable
        packages={packages}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetail={handleOpenDetailDrawer}
        onEdit={handleOpenEditModal}
        onDelete={handlePromptDelete}
        onRestore={handlePromptRestore}
        onCreateNew={handleOpenCreateModal}
      />

      {/* 6. Modal Tạo / Chỉnh Sửa Gói Khám */}
      {isFormModalOpen && (
        <PackageFormModal
          key={editingPackage?.id ? `edit-${editingPackage.id}` : 'create'}
          isOpen={isFormModalOpen}
          onClose={handleCloseFormModal}
          initialData={editingPackage}
          onSuccess={refetch}
        />
      )}

      {/* 7. Drawer Xem Chi Tiết & Nội Dung HTML */}
      {isDetailDrawerOpen && detailPackageId && (
        <PackageDetailDrawer
          key={`detail-${detailPackageId}`}
          isOpen={isDetailDrawerOpen}
          onClose={handleCloseDetailDrawer}
          packageId={detailPackageId}
        />
      )}

      {/* 8. Hộp Thoại Xác Nhận Ngừng Cung Cấp / Khôi Phục */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleExecuteConfirm}
        isLoading={confirmDialog.isLoading}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'success'}
        title={
          confirmDialog.type === 'delete'
            ? 'Xác nhận ngừng cung cấp gói khám'
            : 'Xác nhận mở lại gói khám'
        }
        description={
          confirmDialog.type === 'delete'
            ? `Bạn có chắc chắn muốn ngừng cung cấp gói khám "${confirmDialog.pkg?.name}"? Gói khám này sẽ tạm dừng hiển thị cho bệnh nhân đặt lịch.`
            : `Bạn có muốn khôi phục gói khám "${confirmDialog.pkg?.name}" về trạng thái hoạt động? Bệnh nhân sẽ có thể tiếp tục xem và đặt lịch.`
        }
        confirmText={
          confirmDialog.type === 'delete' ? 'Ngừng cung cấp' : 'Mở lại gói khám'
        }
        cancelText="Hủy bỏ"
      />
    </div>
  )
}
