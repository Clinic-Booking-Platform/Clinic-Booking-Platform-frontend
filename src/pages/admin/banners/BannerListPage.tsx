import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Plus,
  Image as ImageIcon,
  CheckCircle2,
  EyeOff,
  AlertCircle,
  RefreshCw,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

import { bannerApi } from '@/services/banner.api'
import type {
  Banner,
  PaginationMeta,
  BannerStatusFilter,
} from '@/types/banner.types'

import { BannerFilter } from '@/components/banner/BannerFilter'
import { BannerTable } from '@/components/banner/BannerTable'
import { BannerFormModal } from '@/components/banner/BannerFormModal'
import { BannerPreviewModal } from '@/components/banner/BannerPreviewModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { extractErrorMessage } from '@/components/banner/banner.utils'

export const BannerListPage: React.FC = () => {
  // 1. Quản lý trạng thái qua URL searchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const search = searchParams.get('search') || ''

  const rawStatus = searchParams.get('status')
  const status: BannerStatusFilter =
    rawStatus === 'active' || rawStatus === 'inactive' ? rawStatus : 'all'

  // 2. State dữ liệu danh sách banner & phân trang
  const [banners, setBanners] = useState<Banner[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State điều khiển Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false)
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null)

  const [previewBanner, setPreviewBanner] = useState<Banner | null>(null)
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false)

  // State xác nhận Xóa vĩnh viễn banner (Hard Delete)
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    banner: Banner | null
    isLoading: boolean
  }>({
    isOpen: false,
    banner: null,
    isLoading: false,
  })

  // 4. Gọi API nạp dữ liệu banner khi searchParams thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      try {
        const result = await bannerApi.getBanners({
          page,
          search: search.trim() || undefined,
          status,
        })
        if (!ignore) {
          setBanners(result.banners || [])
          setPagination(result.pagination || null)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải danh sách banner!')
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

  // Hàm làm mới danh sách thủ công (sau khi Thêm / Sửa / Xóa)
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await bannerApi.getBanners({
        page,
        search: search.trim() || undefined,
        status,
      })
      setBanners(result.banners || [])
      setPagination(result.pagination || null)
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Không thể tải danh sách banner!')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status])

  // 5. Cập nhật URL searchParams
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
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      const trimmed = newSearch.trim()
      if (trimmed) {
        next.set('search', trimmed)
      } else {
        next.delete('search')
      }
      next.delete('page')
      return next
    })
  }

  const handleStatusChange = (newStatus: BannerStatusFilter) => {
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

  // 6. Xử lý Thao tác Modals
  const handleOpenCreateModal = () => {
    setEditingBanner(null)
    setIsFormModalOpen(true)
  }

  const handleOpenEditModal = (banner: Banner) => {
    setEditingBanner(banner)
    setIsFormModalOpen(true)
  }

  const handleOpenPreviewModal = (banner: Banner) => {
    setPreviewBanner(banner)
    setIsPreviewModalOpen(true)
  }

  const handleOpenDeleteDialog = (banner: Banner) => {
    setConfirmDialog({
      isOpen: true,
      banner,
      isLoading: false,
    })
  }

  const handleCloseConfirmDialog = () => {
    if (confirmDialog.isLoading) return
    setConfirmDialog({
      isOpen: false,
      banner: null,
      isLoading: false,
    })
  }

  // 7. Bật / Tắt trạng thái nhanh (Quick Toggle Status)
  const handleToggleStatus = async (banner: Banner, newStatus: boolean) => {
    // Cập nhật optimistic UI ngay lập tức
    setBanners((prev) =>
      prev.map((b) => (b.id === banner.id ? { ...b, is_active: newStatus } : b))
    )

    try {
      await bannerApi.updateBannerStatus(banner.id, newStatus)
      toast.success(
        newStatus
          ? `Đã bật hiển thị banner "${banner.title}"!`
          : `Đã tạm ẩn banner "${banner.title}"!`
      )
    } catch (err: unknown) {
      // Rollback nếu API lỗi
      setBanners((prev) =>
        prev.map((b) => (b.id === banner.id ? { ...b, is_active: banner.is_active } : b))
      )
      toast.error(extractErrorMessage(err, 'Cập nhật trạng thái thất bại!'))
    }
  }

  // 8. Thực thi Xóa vĩnh viễn banner (Hard Delete)
  const handleConfirmDelete = async () => {
    const { banner } = confirmDialog
    if (!banner) return

    setConfirmDialog((prev) => ({ ...prev, isLoading: true }))
    try {
      await bannerApi.deleteBanner(banner.id)
      toast.success(`Đã xóa vĩnh viễn banner "${banner.title}" thành công!`)
      handleCloseConfirmDialog()
      await refetch()
    } catch (err: unknown) {
      toast.error(extractErrorMessage(err, 'Xóa banner không thành công!'))
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // Số liệu thống kê nhanh
  const totalCount = pagination?.total || banners.length
  const activeCount = banners.filter((b) => b.is_active).length
  const inactiveCount = banners.filter((b) => !b.is_active).length
  const activeRate = totalCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0

  return (
    <div className="space-y-6">
      {/* 1. Header & Nút Thêm mới */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <ImageIcon className="size-6 text-teal-600 dark:text-teal-400" />
            <span>Quản lý Banner quảng cáo</span>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Biên tập banner hiển thị trên Slider trang chủ, quản lý thứ tự xuất hiện và chiến dịch marketing
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button
            type="button"
            onClick={handleOpenCreateModal}
            className="gap-2 bg-teal-600 hover:bg-teal-700 text-white shadow-xs font-medium cursor-pointer"
          >
            <Plus className="size-4" />
            <span>Thêm banner mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Thống kê nhanh (Quick Stat Cards) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng số banner */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng số banner</span>
            <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-600 dark:text-teal-400">
              <ImageIcon className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-foreground">
            {totalCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Tất cả chiến dịch đang lưu</p>
        </div>

        {/* Đang hiển thị */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đang hiển thị</span>
            <div className="rounded-lg bg-emerald-500/10 p-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {activeCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Xuất hiện trên Slider trang chủ</p>
        </div>

        {/* Tạm ẩn */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tạm ẩn</span>
            <div className="rounded-lg bg-amber-500/10 p-1.5 text-amber-600 dark:text-amber-400">
              <EyeOff className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-amber-600 dark:text-amber-400">
            {inactiveCount}
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Chưa bật hoặc đã hết hạn</p>
        </div>

        {/* Tỉ lệ hiển thị */}
        <div className="rounded-xl border border-border/80 bg-card p-3.5 sm:p-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tỉ lệ kích hoạt</span>
            <div className="rounded-lg bg-blue-500/10 p-1.5 text-blue-600 dark:text-blue-400">
              <Sparkles className="size-4" />
            </div>
          </div>
          <div className="mt-2 text-xl sm:text-2xl font-bold text-blue-600 dark:text-blue-400">
            {activeRate}%
          </div>
          <p className="text-[11px] text-muted-foreground mt-0.5">Độ phủ banner trên trang chủ</p>
        </div>
      </div>

      {/* 3. Khung Tìm kiếm & Bộ lọc */}
      <BannerFilter
        search={search}
        status={status}
        isLoading={isLoading}
        totalItems={pagination?.total}
        onSearchChange={handleSearchChange}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilter}
        onRefresh={refetch}
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

      {/* 5. Bảng hiển thị danh sách banner & Phân trang */}
      <BannerTable
        banners={banners}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onPreview={handleOpenPreviewModal}
        onEdit={handleOpenEditModal}
        onDelete={handleOpenDeleteDialog}
        onToggleStatus={handleToggleStatus}
        onResetFilter={handleResetFilter}
      />

      {/* 6. Modal Tạo mới / Chỉnh sửa banner */}
      <BannerFormModal
        isOpen={isFormModalOpen}
        banner={editingBanner}
        onClose={() => {
          setIsFormModalOpen(false)
          setEditingBanner(null)
        }}
        onSuccess={refetch}
      />

      {/* 7. Modal Phóng to xem ảnh banner */}
      <BannerPreviewModal
        isOpen={isPreviewModalOpen}
        banner={previewBanner}
        onClose={() => {
          setIsPreviewModalOpen(false)
          setPreviewBanner(null)
        }}
        onEdit={(bnr) => {
          handleOpenEditModal(bnr)
        }}
      />

      {/* 8. Hộp thoại Xác nhận Xóa vĩnh viễn (Hard Delete) */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleConfirmDelete}
        isLoading={confirmDialog.isLoading}
        variant="danger"
        title="Xác nhận xóa vĩnh viễn banner"
        description={`Hành động này sẽ xóa vĩnh viễn banner "${confirmDialog.banner?.title}" khỏi hệ thống và không thể khôi phục. Bạn có chắc chắn muốn tiếp tục?`}
        confirmText="Xóa vĩnh viễn"
        cancelText="Hủy bỏ"
      />
    </div>
  )
}
