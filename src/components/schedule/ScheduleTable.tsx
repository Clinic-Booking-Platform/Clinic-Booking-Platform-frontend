import React from 'react'
import {
  Pencil,
  Trash2,
  Calendar,
  Clock,
  Sun,
  Moon,
  Users,
  Inbox,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import {
  formatScheduleDate,
  getTimeSlotInfo,
  getStatusBadgeConfig,
  getRelativeDateBadge,
} from './schedule.utils'
import type { Schedule, PaginationMeta } from '@/types/schedule.types'

interface ScheduleTableProps {
  schedules: Schedule[]
  pagination: PaginationMeta | null
  isLoading?: boolean
  onPageChange: (page: number) => void
  onEdit: (schedule: Schedule) => void
  onDelete: (schedule: Schedule) => void
  onResetFilter?: () => void
}

export const ScheduleTable: React.FC<ScheduleTableProps> = ({
  schedules,
  pagination,
  isLoading = false,
  onPageChange,
  onEdit,
  onDelete,
  onResetFilter,
}) => {
  // 1. Loading Skeleton State
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <tr>
                <th className="py-3.5 pl-4 pr-3">Bác sĩ phụ trách</th>
                <th className="px-3 py-3.5">Ngày làm việc</th>
                <th className="px-3 py-3.5">Khung giờ khám</th>
                <th className="px-3 py-3.5">Số lượng tiếp nhận</th>
                <th className="px-3 py-3.5 text-center">Trạng thái</th>
                <th className="py-3.5 pl-3 pr-4 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3 pl-4 pr-3">
                    <div className="flex items-center gap-3">
                      <div className="size-9 rounded-full bg-muted shrink-0" />
                      <div className="space-y-1.5">
                        <div className="h-4 w-36 rounded bg-muted" />
                        <div className="h-3 w-24 rounded bg-muted/60" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-32 rounded bg-muted mb-1" />
                    <div className="h-3 w-16 rounded bg-muted/60" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-5 w-28 rounded-md bg-muted" />
                  </td>
                  <td className="px-3 py-3">
                    <div className="h-4 w-20 rounded bg-muted mb-1.5" />
                    <div className="h-2 w-28 rounded-full bg-muted/60" />
                  </td>
                  <td className="px-3 py-3 text-center">
                    <div className="h-5 w-20 rounded-full bg-muted mx-auto" />
                  </td>
                  <td className="py-3 pl-3 pr-4 text-right">
                    <div className="h-8 w-16 rounded bg-muted ml-auto" />
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
  if (!schedules || schedules.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border/80 bg-card p-12 text-center shadow-xs">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 mb-3">
          <Inbox className="size-7" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Không tìm thấy ca làm việc nào</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mt-1 max-w-sm">
          Chưa có lịch làm việc nào phù hợp với bộ lọc đã chọn hoặc bác sĩ chưa được xếp ca vào ngày này.
        </p>
        {onResetFilter && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onResetFilter}
            className="mt-4 gap-1.5 text-xs cursor-pointer"
          >
            <span>Đặt lại bộ lọc</span>
          </Button>
        )}
      </div>
    )
  }

  // Helper lấy avatar viết tắt
  const getInitials = (name?: string) => {
    if (!name) return 'BS'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // 3. Render Table
  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
            <tr>
              <th className="py-3.5 pl-4 pr-3 min-w-[220px]">Bác sĩ phụ trách</th>
              <th className="px-3 py-3.5 min-w-[180px]">Ngày làm việc</th>
              <th className="px-3 py-3.5 min-w-[170px]">Khung giờ khám</th>
              <th className="px-3 py-3.5 min-w-[180px]">Số lượng / Lượt đặt khám</th>
              <th className="px-3 py-3.5 text-center w-[130px]">Trạng thái</th>
              <th className="py-3.5 pl-3 pr-4 text-right w-[110px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {schedules.map((schedule) => {
              const slotInfo = getTimeSlotInfo(schedule.time_type)
              const statusCfg = getStatusBadgeConfig(schedule.status)
              const currentNum = schedule.current_number ?? 0
              const maxNum = schedule.max_number
              const percentage = Math.min(
                100,
                Math.round((currentNum / (maxNum > 0 ? maxNum : 1)) * 100)
              )
              const isFull = currentNum >= maxNum && maxNum > 0

              let progressColor = 'bg-emerald-500'
              if (percentage >= 100 || isFull) {
                progressColor = 'bg-rose-500'
              } else if (percentage >= 70) {
                progressColor = 'bg-amber-500'
              }

              const relativeBadge = getRelativeDateBadge(schedule.date)
              const docName = schedule.doctor?.user?.full_name || `Bác sĩ #${schedule.doctor_id}`
              const specialtyName = schedule.doctor?.specialty?.name

              return (
                <tr key={schedule.id} className="group hover:bg-muted/30 transition-colors">
                  {/* Cột 1: Bác sĩ */}
                  <td className="py-3 pl-4 pr-3 align-middle">
                    <div className="flex items-center gap-3">
                      {schedule.doctor?.user?.avatar ? (
                        <img
                          src={schedule.doctor.user.avatar}
                          alt={docName}
                          className="size-9 rounded-full object-cover border border-border shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex size-9 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs border border-teal-500/20 shrink-0">
                          {getInitials(docName)}
                        </div>
                      )}
                      <div className="flex flex-col min-w-0">
                        <span className="font-semibold text-foreground truncate">{docName}</span>
                        {specialtyName ? (
                          <span className="text-[11px] text-muted-foreground flex items-center gap-1 truncate">
                            <Stethoscope className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
                            <span>{specialtyName}</span>
                          </span>
                        ) : (
                          <span className="text-[11px] text-muted-foreground/60 italic">
                            Chưa cập nhật chuyên khoa
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Ngày làm việc */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{formatScheduleDate(schedule.date)}</span>
                      </div>
                      {relativeBadge && (
                        <div>
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold border ${relativeBadge.className}`}
                          >
                            {relativeBadge.label}
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Cột 3: Khung giờ khám */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-lg border border-border/80 bg-background px-2.5 py-1 text-xs font-semibold text-foreground shadow-2xs">
                        <Clock className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{slotInfo?.time || schedule.time_type}</span>
                      </span>

                      {slotInfo?.period === 'morning' ? (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded"
                          title="Ca buổi sáng"
                        >
                          <Sun className="size-3" />
                          <span>Sáng</span>
                        </span>
                      ) : (
                        <span
                          className="inline-flex items-center gap-1 text-[11px] font-medium text-blue-600 dark:text-blue-400 bg-blue-500/10 px-1.5 py-0.5 rounded"
                          title="Ca buổi chiều"
                        >
                          <Moon className="size-3" />
                          <span>Chiều</span>
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cột 4: Số lượng tiếp nhận / Lượt đặt khám */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col gap-1.5 min-w-[155px] max-w-[190px]">
                      {/* Con số chi tiết */}
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1.5">
                          <Users className="size-3.5 text-muted-foreground shrink-0" />
                          <span>
                            {currentNum} / {maxNum} bệnh nhân
                          </span>
                        </span>
                        <span className="text-[11px] font-semibold font-mono text-muted-foreground">
                          {percentage}%
                        </span>
                      </div>

                      {/* Thanh tiến trình (Progress Bar nhỏ bên dưới con số) */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted/80">
                        <div
                          className={`h-full transition-all duration-300 rounded-full ${progressColor}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>

                      {/* Badge trạng thái phụ */}
                      <div className="flex items-center min-h-[16px]">
                        {currentNum === 0 ? (
                          <span className="text-[10px] text-muted-foreground/70 italic">
                            Chưa có lượt đặt
                          </span>
                        ) : isFull ? (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                            Hết chỗ
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </td>

                  {/* Cột 5: Trạng thái ca làm việc */}
                  <td className="px-3 py-3 text-center align-middle">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${statusCfg.classes}`}
                    >
                      <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                      <span>{statusCfg.label}</span>
                    </span>
                  </td>

                  {/* Cột 6: Thao tác (Edit / Delete) */}
                  <td className="py-3 pl-3 pr-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                        className="size-8 p-0 text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 cursor-pointer"
                        title="Chỉnh sửa ca làm việc"
                      >
                        <Pencil className="size-4" />
                      </Button>

                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(schedule)}
                        className="size-8 p-0 text-muted-foreground hover:text-rose-600 hover:bg-rose-500/10 cursor-pointer"
                        title="Xóa ca làm việc"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang (Pagination) */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize}
          onPageChange={onPageChange}
          itemLabel="ca làm việc"
        />
      )}
    </div>
  )
}
