// ================= FILE: src/pages/admin/medical-record/index.tsx =================

import React, { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  FileText,
  CheckCircle2,
  FileEdit,
  Video,
  ShieldCheck,
  AlertCircle,
} from 'lucide-react'
import { toast } from 'react-toastify'

import { medicalRecordApi } from '@/services/medical-record.api'
import { doctorApi } from '@/services/doctor.api'
import type {
  MedicalRecordListItem,
  Pagination,
} from '@/types/medical-record.types'
import type { Doctor } from '@/types/doctor.types'

import {
  MedicalRecordFilter,
  MedicalRecordList,
  MedicalRecordDetailModal,
  extractErrorMessage,
  extractVietnamDateOnly,
} from '@/components/medical-record'

export const MedicalRecordListPage: React.FC = () => {
  // 1. Quản lý trạng thái qua URL SearchParams
  const [searchParams, setSearchParams] = useSearchParams()

  const rawPage = searchParams.get('page')
  const parsedPage = rawPage ? parseInt(rawPage, 10) : 1
  const page = isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage

  const rawPageSize = searchParams.get('pageSize')
  const parsedPageSize = rawPageSize ? parseInt(rawPageSize, 10) : 5
  const pageSize = isNaN(parsedPageSize) || parsedPageSize < 1 ? 5 : parsedPageSize

  const search = searchParams.get('search') || ''

  const rawDoctorId = searchParams.get('doctor_id')
  const parsedDoctorId = rawDoctorId ? parseInt(rawDoctorId, 10) : undefined
  const doctorId =
    parsedDoctorId && !isNaN(parsedDoctorId) && parsedDoctorId > 0
      ? parsedDoctorId
      : undefined

  const fromDate = searchParams.get('from_date') || ''
  const toDate = searchParams.get('to_date') || ''

  // 2. Local State
  const [records, setRecords] = useState<MedicalRecordListItem[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Danh sách bác sĩ cho dropdown filter
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [isLoadingDoctors, setIsLoadingDoctors] = useState(false)

  // Modal xem chi tiết
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 3. Load danh sách bác sĩ phục vụ dropdown filter
  useEffect(() => {
    let isMounted = true
    setIsDoctorsLoading(true)

    doctorApi
      .getDoctors({ status: 'active', all: true })
      .then((res) => {
        if (isMounted) {
          setDoctors(res.doctors || [])
        }
      })
      .catch((err) => {
        console.error('Không thể tải danh sách bác sĩ cho bộ lọc:', err)
      })
      .finally(() => {
        if (isMounted) {
          setIsDoctorsLoading(false)
        }
      })

    function setIsDoctorsLoading(val: boolean) {
      setIsLoadingDoctors(val)
    }

    return () => {
      isMounted = false
    }
  }, [])

  // 4. Fetch danh sách hồ sơ bệnh án
  useEffect(() => {
    let ignore = false

    const loadData = async () => {
      setIsLoading(true)
      try {
        const res = await medicalRecordApi.getAdminMedicalRecords({
          page,
          pageSize,
          search,
          doctor_id: doctorId,
          from_date: fromDate || undefined,
          to_date: toDate || undefined,
        })

        if (!ignore) {
          const data = res.data
          let list = data.records || []

          // Lọc theo ngày lập hồ sơ bệnh án (created_at) theo chuẩn múi giờ Việt Nam
          if (fromDate || toDate) {
            list = list.filter((rec) => {
              const targetDateStr = rec.created_at
              if (!targetDateStr) return true
              const dateOnly = extractVietnamDateOnly(targetDateStr)
              if (!dateOnly) return true
              if (fromDate && dateOnly < fromDate) return false
              if (toDate && dateOnly > toDate) return false
              return true
            })
          }

          setRecords(list)
          setPagination(
            data.pagination
              ? {
                  ...data.pagination,
                  totalItems: fromDate || toDate ? list.length : data.pagination.totalItems,
                  totalPages:
                    fromDate || toDate
                      ? Math.ceil(list.length / pageSize) || 1
                      : data.pagination.totalPages,
                }
              : {
                  currentPage: page,
                  pageSize,
                  totalItems: list.length,
                  totalPages: Math.ceil(list.length / pageSize) || 1,
                }
          )
          setError(null)
        }
      } catch (err: unknown) {
        if (!ignore) {
          const msg = extractErrorMessage(err, 'Không thể tải danh sách hồ sơ bệnh án')
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
  }, [page, pageSize, search, doctorId, fromDate, toDate])

  // Hàm reload thủ công
  const refetch = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const res = await medicalRecordApi.getAdminMedicalRecords({
        page,
        pageSize,
        search,
        doctor_id: doctorId,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      })
      const data = res.data
      let list = data.records || []

      // Lọc theo ngày lập hồ sơ bệnh án (created_at) theo chuẩn múi giờ Việt Nam
      if (fromDate || toDate) {
        list = list.filter((rec) => {
          const targetDateStr = rec.created_at
          if (!targetDateStr) return true
          const dateOnly = extractVietnamDateOnly(targetDateStr)
          if (!dateOnly) return true
          if (fromDate && dateOnly < fromDate) return false
          if (toDate && dateOnly > toDate) return false
          return true
        })
      }

      setRecords(list)
      setPagination(
        data.pagination
          ? {
              ...data.pagination,
              totalItems: fromDate || toDate ? list.length : data.pagination.totalItems,
              totalPages:
                fromDate || toDate
                  ? Math.ceil(list.length / pageSize) || 1
                  : data.pagination.totalPages,
            }
          : {
              currentPage: page,
              pageSize,
              totalItems: list.length,
              totalPages: Math.ceil(list.length / pageSize) || 1,
            }
      )
    } catch (err: unknown) {
      const msg = extractErrorMessage(err, 'Không thể tải danh sách hồ sơ bệnh án')
      setError(msg)
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }, [page, pageSize, search, doctorId, fromDate, toDate])

  // 5. Handlers cập nhật URL SearchParams
  const updateQueryParam = (updates: Record<string, string | undefined>) => {
    setSearchParams(
      (prev) => {
        const next = new URLSearchParams(prev)
        Object.entries(updates).forEach(([key, val]) => {
          if (val === undefined || val === '') {
            next.delete(key)
          } else {
            next.set(key, val)
          }
        })
        return next
      },
      { replace: true }
    )
  }

  const handlePageChange = (newPage: number) => {
    updateQueryParam({ page: String(newPage) })
  }

  const handleSearchChange = (val: string) => {
    updateQueryParam({ search: val || undefined, page: '1' })
  }

  const handleDoctorChange = (docId?: number) => {
    updateQueryParam({ doctor_id: docId ? String(docId) : undefined, page: '1' })
  }

  const handleFromDateChange = (val: string) => {
    updateQueryParam({ from_date: val || undefined, page: '1' })
  }

  const handleToDateChange = (val: string) => {
    updateQueryParam({ to_date: val || undefined, page: '1' })
  }

  const handleResetFilters = () => {
    setSearchParams({}, { replace: true })
  }

  const handleViewDetail = (item: MedicalRecordListItem) => {
    setSelectedRecordId(item.id)
    setIsDetailOpen(true)
  }

  const handleCloseDetail = () => {
    setIsDetailOpen(false)
    setSelectedRecordId(null)
  }

  // 6. Tính toán thống kê nhanh từ danh sách hiện có
  const signedCount = records.filter((r) => r.status === 'SIGNED').length
  const draftCount = records.filter((r) => r.status === 'DRAFT').length
  const onlineCount = records.filter((r) => r.consultation_type === 'ONLINE').length
  const hasFilter = Boolean(search || doctorId || fromDate || toDate)

  return (
    <div className="space-y-6">
      {/* 1. Header Trang & Phân quyền Read-Only */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="size-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
              Quản lý Hồ sơ Bệnh án
            </h1>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
              <ShieldCheck className="size-3" />
              <span>Chỉ xem (Read-Only)</span>
            </span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-1">
            Xem và tra cứu tất cả hồ sơ bệnh án, kết quả khám lâm sàng và đơn thuốc điện tử trong hệ thống
          </p>
        </div>
      </div>

      {/* 2. Thẻ thống kê nhanh (KPIs) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tổng hồ sơ */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Tổng số hồ sơ</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-foreground">
              {pagination?.totalItems ?? records.length}
            </span>
            <span className="text-xs text-muted-foreground">hồ sơ</span>
          </div>
        </div>

        {/* Đã ký xác nhận */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Đã ký số (SIGNED)</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {signedCount}
            </span>
            <span className="text-xs text-muted-foreground">bản ghi</span>
          </div>
        </div>

        {/* Bản nháp */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Bản nháp (DRAFT)</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <FileEdit className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {draftCount}
            </span>
            <span className="text-xs text-muted-foreground">đang soạn</span>
          </div>
        </div>

        {/* Khám trực tuyến */}
        <div className="rounded-2xl border border-border/80 bg-card p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted-foreground">Khám trực tuyến</span>
            <div className="flex size-8 items-center justify-center rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
              <Video className="size-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {onlineCount}
            </span>
            <span className="text-xs text-muted-foreground">ca khám</span>
          </div>
        </div>
      </div>

      {/* 3. Lỗi nếu có */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-4 flex items-center justify-between gap-3 text-destructive text-xs">
          <div className="flex items-center gap-2">
            <AlertCircle className="size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button
            type="button"
            onClick={() => void refetch()}
            className="underline font-semibold hover:opacity-80 cursor-pointer"
          >
            Thử lại
          </button>
        </div>
      )}

      {/* 4. Bộ lọc tìm kiếm */}
      <MedicalRecordFilter
        search={search}
        onSearchChange={handleSearchChange}
        doctorId={doctorId}
        onDoctorChange={handleDoctorChange}
        fromDate={fromDate}
        onFromDateChange={handleFromDateChange}
        toDate={toDate}
        onToDateChange={handleToDateChange}
        doctors={doctors}
        isLoadingDoctors={isLoadingDoctors}
        onReset={handleResetFilters}
        onRefresh={() => void refetch()}
        isLoading={isLoading}
      />

      {/* 5. Bảng danh sách hồ sơ */}
      <MedicalRecordList
        records={records}
        pagination={pagination}
        isLoading={isLoading}
        hasFilter={hasFilter}
        onPageChange={handlePageChange}
        onViewDetail={handleViewDetail}
      />

      {/* 6. Modal xem chi tiết hồ sơ bệnh án (Read-only) */}
      <MedicalRecordDetailModal
        isOpen={isDetailOpen}
        recordId={selectedRecordId}
        onClose={handleCloseDetail}
      />
    </div>
  )
}

export default MedicalRecordListPage
