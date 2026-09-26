// ================= FILE: src/components/medical-record/MedicalRecordList.tsx =================

import React from 'react'
import {
  Eye,
  FileText,
  User,
  Calendar,
  Clock,
  Stethoscope,
  Video,
  Building,
  FileX,
  Inbox,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import type {
  MedicalRecordListItem,
  Pagination as IPagination,
} from '@/types/medical-record.types'
import { MedicalRecordStatusBadge } from './MedicalRecordStatusBadge'
import { formatShortDate, formatTimeSlot, formatDateTime } from './medical-record.utils'

export interface MedicalRecordListProps {
  records: MedicalRecordListItem[]
  pagination: IPagination | null
  isLoading?: boolean
  hasFilter?: boolean
  onPageChange: (page: number) => void
  onViewDetail: (record: MedicalRecordListItem) => void
}

export const MedicalRecordList: React.FC<MedicalRecordListProps> = ({
  records,
  pagination,
  isLoading = false,
  hasFilter = false,
  onPageChange,
  onViewDetail,
}) => {
  // 1. Loading Skeleton Rows
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              <tr>
                <th className="py-3.5 pl-4 pr-3 min-w-[150px]">Mã bệnh án</th>
                <th className="px-3 py-3.5 min-w-[160px]">Bệnh nhân</th>
                <th className="px-3 py-3.5 min-w-[170px]">Bác sĩ</th>
                <th className="px-3 py-3.5 min-w-[110px]">Ngày khám</th>
                <th className="px-3 py-3.5 min-w-[150px]">Ca khám</th>
                <th className="px-3 py-3.5 min-w-[200px]">Chẩn đoán</th>
                <th className="px-3 py-3.5 min-w-[120px]">Hình thức</th>
                <th className="px-3 py-3.5 text-center min-w-[110px]">Trạng thái</th>
                <th className="py-3.5 pl-3 pr-4 text-right min-w-[100px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 pl-4 pr-3">
                    <div className="h-4 w-28 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="h-4 w-24 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="h-4 w-28 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="h-4 w-20 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="h-4 w-24 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="h-4 w-36 bg-muted rounded" />
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="h-5 w-20 bg-muted rounded-full" />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <div className="h-5 w-16 bg-muted rounded-full mx-auto" />
                  </td>
                  <td className="py-3.5 pl-3 pr-4 text-right">
                    <div className="h-8 w-8 bg-muted rounded-md ml-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  // 2. Empty State
  if (records.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border/80 bg-card/60 p-12 text-center space-y-3">
        {hasFilter ? (
          <>
            <FileX className="size-12 mx-auto text-muted-foreground/60" />
            <h3 className="font-bold text-base text-foreground">
              Không tìm thấy hồ sơ bệnh án phù hợp
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Không có hồ sơ bệnh án nào khớp với tiêu chí tìm kiếm hoặc dải ngày đã chọn. Vui lòng thử thay đổi từ khóa hoặc đặt lại bộ lọc.
            </p>
          </>
        ) : (
          <>
            <Inbox className="size-12 mx-auto text-muted-foreground/60" />
            <h3 className="font-bold text-base text-foreground">
              Chưa có hồ sơ bệnh án nào
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto">
              Hệ thống hiện chưa ghi nhận hồ sơ bệnh án nào được khởi tạo từ các bác sĩ.
            </p>
          </>
        )}
      </div>
    )
  }

  // 3. Table Data Rows
  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
            <tr>
              <th className="py-3.5 pl-4 pr-3 min-w-[150px]">Mã bệnh án</th>
              <th className="px-3 py-3.5 min-w-[160px]">Bệnh nhân</th>
              <th className="px-3 py-3.5 min-w-[170px]">Bác sĩ</th>
              <th className="px-3 py-3.5 min-w-[125px]">Ngày lập hồ sơ</th>
              <th className="px-3 py-3.5 min-w-[150px]">Ca khám</th>
              <th className="px-3 py-3.5 min-w-[200px]">Chẩn đoán</th>
              <th className="px-3 py-3.5 min-w-[120px]">Hình thức</th>
              <th className="px-3 py-3.5 text-center min-w-[110px]">Trạng thái</th>
              <th className="py-3.5 pl-3 pr-4 text-right min-w-[100px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {records.map((rec) => {
              const patientName = rec.appointment?.patient_name || 'Bệnh nhân'
              const docName = rec.appointment?.doctor?.user?.full_name || 'Bác sĩ phụ trách'

              return (
                <tr key={rec.id} className="group hover:bg-muted/30 transition-colors">
                  {/* Cột 1: Mã bệnh án */}
                  <td className="py-3.5 pl-4 pr-3 align-middle font-mono font-bold text-teal-600 dark:text-teal-400">
                    <div className="flex items-center gap-1.5">
                      <FileText className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{rec.record_code}</span>
                    </div>
                  </td>

                  {/* Cột 2: Bệnh nhân */}
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex items-center gap-1.5 font-medium text-foreground">
                      <User className="size-3.5 text-muted-foreground shrink-0" />
                      <span className="truncate max-w-[140px]" title={patientName}>
                        {patientName}
                      </span>
                    </div>
                  </td>

                  {/* Cột 3: Bác sĩ */}
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex items-center gap-1.5 text-foreground font-medium">
                      <Stethoscope className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="truncate max-w-[150px]" title={docName}>
                        {docName}
                      </span>
                    </div>
                  </td>

                  {/* Cột 4: Ngày lập hồ sơ & Ngày hẹn khám */}
                  <td className="px-3 py-3.5 align-middle">
                    <div className="flex flex-col gap-0.5">
                      <div
                        className="flex items-center gap-1.5 font-medium text-foreground font-mono"
                        title={rec.created_at ? `Thời điểm lập: ${formatDateTime(rec.created_at)}` : undefined}
                      >
                        <Clock className="size-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{formatShortDate(rec.created_at)}</span>
                      </div>
                      {rec.appointment?.date && (
                        <span
                          className="text-[11px] text-muted-foreground flex items-center gap-1"
                          title="Ngày hẹn khám của lịch hẹn"
                        >
                          <Calendar className="size-3 text-muted-foreground/60 shrink-0" />
                          <span>Khám: {formatShortDate(rec.appointment.date)}</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cột 5: Ca khám */}
                  <td className="px-3 py-3.5 align-middle">
                    <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-xs font-semibold text-foreground border border-border/60">
                      <Clock className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span>{formatTimeSlot(rec.appointment?.time_type)}</span>
                    </span>
                  </td>

                  {/* Cột 6: Chẩn đoán */}
                  <td className="px-3 py-3.5 align-middle">
                    <div className="max-w-[220px]">
                      <p className="font-medium text-foreground truncate" title={rec.diagnosis}>
                        {rec.diagnosis}
                      </p>
                      {rec.icd10_code && (
                        <span className="inline-block text-[10px] font-mono text-teal-700 dark:text-teal-400 bg-teal-500/10 px-1.5 py-0.2 rounded mt-0.5">
                          {rec.icd10_code} {rec.icd10_name ? `• ${rec.icd10_name}` : ''}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cột 7: Hình thức */}
                  <td className="px-3 py-3.5 align-middle">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${
                        rec.consultation_type === 'ONLINE'
                          ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 border-purple-500/30'
                          : 'bg-teal-500/15 text-teal-700 dark:text-teal-300 border-teal-500/30'
                      }`}
                    >
                      {rec.consultation_type === 'ONLINE' ? (
                        <Video className="size-3 shrink-0" />
                      ) : (
                        <Building className="size-3 shrink-0" />
                      )}
                      <span>
                        {rec.consultation_type === 'ONLINE' ? 'Trực tuyến' : 'Trực tiếp'}
                      </span>
                    </span>
                  </td>

                  {/* Cột 8: Trạng thái */}
                  <td className="px-3 py-3.5 text-center align-middle">
                    <MedicalRecordStatusBadge status={rec.status} />
                  </td>

                  {/* Cột 9: Thao tác (Xem chi tiết) */}
                  <td className="py-3.5 pl-3 pr-4 text-right align-middle">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewDetail(rec)}
                      className="gap-1.5 text-xs text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 cursor-pointer"
                      title="Xem chi tiết hồ sơ bệnh án (Read-only)"
                    >
                      <Eye className="size-3.5" />
                      <span>Xem chi tiết</span>
                    </Button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang */}
      {pagination && (
        <Pagination
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          totalItems={pagination.totalItems}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          itemLabel="hồ sơ"
        />
      )}
    </div>
  )
}

export default MedicalRecordList
