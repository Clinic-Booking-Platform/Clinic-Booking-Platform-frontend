import React from 'react'
import { Stethoscope, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { SpecialtyTableRow } from './SpecialtyTableRow'
import { SpecialtyCardItem } from './SpecialtyCardItem'
import type { Specialty, PaginationMeta } from '@/types/specialty.types'

interface SpecialtyTableProps {
  specialties: Specialty[]
  pagination: PaginationMeta | null
  isLoading: boolean
  onPageChange: (page: number) => void
  onViewDetail: (specialty: Specialty) => void
  onEdit: (specialty: Specialty) => void
  onDelete: (specialty: Specialty) => void
  onRestore: (specialty: Specialty) => void
  onCreateNew: () => void
}

export const SpecialtyTable: React.FC<SpecialtyTableProps> = ({
  specialties,
  pagination,
  isLoading,
  onPageChange,
  onViewDetail,
  onEdit,
  onDelete,
  onRestore,
  onCreateNew,
}) => {
  // 1. Trạng thái Đang tải (Skeleton Loading)
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Skeleton cho giao diện Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border/60">
              <tr>
                <th className="py-3 px-4 font-semibold w-16">Hình ảnh</th>
                <th className="py-3 px-4 font-semibold min-w-[200px]">Tên chuyên khoa & Mô tả</th>
                <th className="py-3 px-4 font-semibold w-36">Bác sĩ phụ trách</th>
                <th className="py-3 px-4 font-semibold w-32">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-right w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="size-12 rounded-lg bg-muted" />
                  </td>
                  <td className="py-3.5 px-4 space-y-2">
                    <div className="h-4 w-40 rounded-md bg-muted" />
                    <div className="h-3 w-64 rounded-md bg-muted/60" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-6 w-20 rounded-full bg-muted" />
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="h-6 w-24 rounded-full bg-muted" />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="h-8 w-24 rounded-md bg-muted ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Skeleton cho giao diện Mobile Cards */}
        <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-xl border border-border/60 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="size-12 rounded-lg bg-muted" />
                <div className="h-5 w-20 rounded-full bg-muted" />
              </div>
              <div className="h-4 w-32 rounded bg-muted" />
              <div className="h-3 w-48 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 2. Trạng thái Danh sách Trống (Empty State)
  if (!specialties || specialties.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card p-12 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <Stethoscope className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Chưa tìm thấy chuyên khoa nào
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          Danh sách hiện tại đang trống hoặc không có kết quả phù hợp với bộ lọc tìm kiếm của bạn.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            size="sm"
            onClick={onCreateNew}
            className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="size-4" />
            <span>Thêm chuyên khoa đầu tiên</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
      {/* 3A. Bảng dữ liệu hiển thị trên màn hình Desktop (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border/60">
            <tr>
              <th className="py-3 px-4 font-semibold w-16">Hình ảnh</th>
              <th className="py-3 px-4 font-semibold min-w-[220px]">Tên chuyên khoa & Mô tả</th>
              <th className="py-3 px-4 font-semibold w-36">Bác sĩ phụ trách</th>
              <th className="py-3 px-4 font-semibold w-36">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-right w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {specialties.map((item) => (
              <SpecialtyTableRow
                key={item.id}
                specialty={item}
                onViewDetail={onViewDetail}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* 3B. Danh sách Card Items hiển thị trên màn hình Mobile (< md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 md:hidden">
        {specialties.map((item) => (
          <SpecialtyCardItem
            key={item.id}
            specialty={item}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        ))}
      </div>

      {/* 4. Component Phân trang tái sử dụng */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          itemLabel="chuyên khoa"
        />
      )}
    </div>
  )
}
