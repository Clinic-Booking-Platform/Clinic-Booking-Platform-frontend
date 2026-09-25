import React from 'react'
import { Plus, PackagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { PackageTableRow } from './PackageTableRow'
import { PackageCardItem } from './PackageCardItem'
import type { MedicalPackage, PaginationMeta } from '@/types/package.types'

interface PackageTableProps {
  packages: MedicalPackage[]
  pagination: PaginationMeta | null
  isLoading: boolean
  onPageChange: (page: number) => void
  onViewDetail: (pkg: MedicalPackage) => void
  onEdit: (pkg: MedicalPackage) => void
  onDelete: (pkg: MedicalPackage) => void
  onRestore: (pkg: MedicalPackage) => void
  onCreateNew: () => void
}

export const PackageTable: React.FC<PackageTableProps> = ({
  packages,
  pagination,
  isLoading,
  onPageChange,
  onViewDetail,
  onEdit,
  onDelete,
  onRestore,
  onCreateNew,
}) => {
  // 1. Skeleton Loading State
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
        {/* Skeleton Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border/60">
              <tr>
                <th className="py-3 px-4 font-semibold w-20">Hình ảnh</th>
                <th className="py-3 px-4 font-semibold min-w-[220px]">Tên gói & Mô tả</th>
                <th className="py-3 px-4 font-semibold w-48">Bảng giá</th>
                <th className="py-3 px-4 font-semibold w-36">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-right w-36">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 px-4">
                    <div className="size-15 rounded-xl bg-muted" />
                  </td>
                  <td className="py-3.5 px-4 space-y-2">
                    <div className="h-4 w-44 rounded-md bg-muted" />
                    <div className="h-3 w-64 rounded-md bg-muted/60" />
                  </td>
                  <td className="py-3.5 px-4 space-y-1.5">
                    <div className="h-4 w-28 rounded-md bg-muted" />
                    <div className="h-3 w-20 rounded-md bg-muted/60" />
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

        {/* Skeleton Mobile Cards */}
        <div className="grid grid-cols-1 gap-3 p-3 md:hidden">
          {Array.from({ length: 3 }).map((_, idx) => (
            <div key={idx} className="animate-pulse rounded-xl border border-border/60 p-4 space-y-3">
              <div className="flex justify-between items-center">
                <div className="size-15 rounded-xl bg-muted" />
                <div className="h-5 w-24 rounded-full bg-muted" />
              </div>
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-56 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      </div>
    )
  }

  // 2. Empty State
  if (!packages || packages.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card p-12 text-center shadow-xs">
        <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
          <PackagePlus className="size-7" />
        </div>
        <h3 className="mt-4 text-base font-semibold text-foreground">
          Chưa tìm thấy gói khám nào
        </h3>
        <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground max-w-sm mx-auto">
          Danh sách gói khám đang trống hoặc không có kết quả phù hợp với tiêu chí tìm kiếm và khoảng giá.
        </p>
        <div className="mt-6 flex justify-center">
          <Button
            type="button"
            size="sm"
            onClick={onCreateNew}
            className="gap-1.5 bg-teal-600 hover:bg-teal-700 text-white"
          >
            <Plus className="size-4" />
            <span>Thêm gói khám đầu tiên</span>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
      {/* 3A. Bảng dữ liệu hiển thị trên Desktop (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-muted/40 text-muted-foreground uppercase text-[11px] tracking-wider border-b border-border/60">
            <tr>
              <th className="py-3 px-4 font-semibold w-20">Hình ảnh</th>
              <th className="py-3 px-4 font-semibold min-w-[220px]">Tên gói & Mô tả</th>
              <th className="py-3 px-4 font-semibold w-48">Bảng giá</th>
              <th className="py-3 px-4 font-semibold w-36">Trạng thái</th>
              <th className="py-3 px-4 font-semibold text-right w-40">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {packages.map((pkg) => (
              <PackageTableRow
                key={pkg.id}
                pkg={pkg}
                onViewDetail={onViewDetail}
                onEdit={onEdit}
                onDelete={onDelete}
                onRestore={onRestore}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* 3B. Danh sách Card Items hiển thị trên Mobile (< md) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 md:hidden">
        {packages.map((pkg) => (
          <PackageCardItem
            key={pkg.id}
            pkg={pkg}
            onViewDetail={onViewDetail}
            onEdit={onEdit}
            onDelete={onDelete}
            onRestore={onRestore}
          />
        ))}
      </div>

      {/* 4. Component Phân trang */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          itemLabel="gói khám"
        />
      )}
    </div>
  )
}
