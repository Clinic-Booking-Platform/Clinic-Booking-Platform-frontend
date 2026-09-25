import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  Users,
  CheckCircle2,
  Lock,
  AlertCircle,
  RefreshCw,
  HeartPulse,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'react-toastify'

import { userApi } from '@/services/user.api'
import type { User, PaginationMeta, UserStatusFilter } from '@/types/user.types'

import { UserFilter } from '@/components/admin/users/UserFilter'
import { UserTable } from '@/components/admin/users/UserTable'
import { UserDetailModal } from '@/components/admin/users/UserDetailModal'
import { ConfirmDialog } from '@/components/common/ConfirmDialog'
import { extractErrorMessage } from '@/components/admin/users/user.utils'

export const UserListPage: React.FC = () => {
  // 1. Quản lý trạng thái thông qua URL searchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const search = searchParams.get('search') || ''

  const rawStatus = searchParams.get('status')
  const status: UserStatusFilter =
    rawStatus === 'active' || rawStatus === 'deleted' ? rawStatus : 'all'

  // 2. State dữ liệu danh sách bệnh nhân & phân trang
  const [users, setUsers] = useState<User[]>([])
  const [pagination, setPagination] = useState<PaginationMeta | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  // 3. State modal xem chi tiết
  const [detailUser, setDetailUser] = useState<User | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  // 4. State hộp thoại xác nhận Khóa / Mở khóa
  const [confirmDialog, setConfirmDialog] = useState<{
    isOpen: boolean
    type: 'delete' | 'restore'
    user: User | null
    isLoading: boolean
  }>({
    isOpen: false,
    type: 'delete',
    user: null,
    isLoading: false,
  })

  // 5. Nạp danh sách bệnh nhân khi URL searchParams thay đổi
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      try {
        const result = await userApi.getUsers({
          page,
          search: search.trim() || undefined,
          status,
        })
        if (!ignore) {
          setUsers(result.users || [])
          setPagination(result.pagination || null)
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải danh sách bệnh nhân!')
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

  // Hàm làm mới danh sách thủ công (sau khi Khóa / Mở khóa hoặc bấm nút Refresh)
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await userApi.getUsers({
        page,
        search: search.trim() || undefined,
        status,
      })
      setUsers(result.users || [])
      setPagination(result.pagination || null)
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Không thể tải danh sách bệnh nhân!')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, search, status])

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

  const handleStatusChange = (newStatus: UserStatusFilter) => {
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

  // 7. Xử lý Modal Xem chi tiết
  const handleOpenDetailModal = (user: User) => {
    setDetailUser(user)
    setIsDetailModalOpen(true)
  }

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false)
    setDetailUser(null)
  }

  // 8. Xử lý Hộp thoại xác nhận Khóa / Mở khóa
  const handlePromptDelete = (user: User) => {
    setConfirmDialog({
      isOpen: true,
      type: 'delete',
      user,
      isLoading: false,
    })
  }

  const handlePromptRestore = (user: User) => {
    setConfirmDialog({
      isOpen: true,
      type: 'restore',
      user,
      isLoading: false,
    })
  }

  const handleCloseConfirmDialog = () => {
    if (!confirmDialog.isLoading) {
      setConfirmDialog({
        isOpen: false,
        type: 'delete',
        user: null,
        isLoading: false,
      })
    }
  }

  const handleExecuteConfirm = async () => {
    const { type, user } = confirmDialog
    if (!user) return

    const patientName = user.full_name || 'Bệnh nhân'

    try {
      setConfirmDialog((prev) => ({ ...prev, isLoading: true }))
      if (type === 'delete') {
        const message = await userApi.deleteUser(user.id)
        toast.success(message || `Đã khóa tài khoản bệnh nhân "${patientName}" thành công!`)
      } else {
        const message = await userApi.restoreUser(user.id)
        toast.success(message || `Đã khôi phục tài khoản bệnh nhân "${patientName}" thành công!`)
      }

      handleCloseConfirmDialog()
      refetch()
    } catch (error: unknown) {
      const msg = extractErrorMessage(
        error,
        type === 'delete' ? 'Khóa tài khoản thất bại' : 'Khôi phục tài khoản thất bại'
      )
      toast.error(msg)
      setConfirmDialog((prev) => ({ ...prev, isLoading: false }))
    }
  }

  // 9. Thống kê nhanh từ danh sách hiện tại
  const activeCount = users.filter((u) => !u.deleted_at).length
  const deletedCount = users.filter((u) => Boolean(u.deleted_at)).length

  return (
    <div className="space-y-5">
      {/* 1. Header & Giới thiệu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Users className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản Lý Bệnh Nhân
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Xem danh sách hồ sơ người dùng / bệnh nhân, theo dõi thông tin liên hệ và kiểm soát quyền truy cập tài khoản
          </p>
        </div>
      </div>

      {/* 2. Thẻ Thống Kê Nhanh (Stats Chips) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="flex items-center gap-3 rounded-xl border border-border/70 bg-card p-3.5 shadow-2xs">
          <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <HeartPulse className="size-4.5" />
          </div>
          <div>
            <div className="text-[11px] font-medium text-muted-foreground">Tổng số bệnh nhân</div>
            <div className="text-lg font-bold text-foreground">
              {pagination?.total ?? users.length}
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
            <div className="text-[11px] font-medium text-muted-foreground">Tài khoản bị khóa (Trang này)</div>
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

      {/* 4. Bộ Lọc Tìm Kiếm Đa Năng */}
      <UserFilter
        search={search}
        onSearchChange={handleSearchChange}
        status={status}
        onStatusChange={handleStatusChange}
        onReset={handleResetFilters}
        onRefresh={refetch}
        isLoading={isLoading}
        totalItems={pagination?.total}
      />

      {/* 5. Bảng Dữ Liệu & Danh Sách Bệnh Nhân */}
      <UserTable
        users={users}
        pagination={pagination}
        isLoading={isLoading}
        onPageChange={handlePageChange}
        onViewDetail={handleOpenDetailModal}
        onDelete={handlePromptDelete}
        onRestore={handlePromptRestore}
        onResetFilter={handleResetFilters}
      />

      {/* 6. Modal Xem Chi Tiết Bệnh Nhân */}
      {isDetailModalOpen && detailUser && (
        <UserDetailModal
          isOpen={isDetailModalOpen}
          onClose={handleCloseDetailModal}
          user={detailUser}
          onPromptDelete={handlePromptDelete}
          onPromptRestore={handlePromptRestore}
        />
      )}

      {/* 7. Hộp Thoại Xác Nhận Khóa / Mở Khóa */}
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={handleCloseConfirmDialog}
        onConfirm={handleExecuteConfirm}
        isLoading={confirmDialog.isLoading}
        variant={confirmDialog.type === 'delete' ? 'danger' : 'success'}
        title={
          confirmDialog.type === 'delete'
            ? 'Xác nhận khóa tài khoản bệnh nhân'
            : 'Xác nhận khôi phục tài khoản bệnh nhân'
        }
        description={
          confirmDialog.type === 'delete'
            ? `Bạn có chắc chắn muốn khóa tài khoản bệnh nhân "${confirmDialog.user?.full_name || 'này'}"? Bệnh nhân này sẽ không thể đăng nhập hoặc đặt lịch khám.`
            : `Khôi phục quyền truy cập cho bệnh nhân "${confirmDialog.user?.full_name || 'này'}"? Bệnh nhân sẽ có thể tiếp tục đăng nhập và sử dụng dịch vụ.`
        }
        confirmText={
          confirmDialog.type === 'delete' ? 'Khóa tài khoản' : 'Mở khóa tài khoản'
        }
        cancelText="Hủy bỏ"
      />
    </div>
  )
}
