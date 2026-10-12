import React from 'react'
import {
  Calendar,
  Clock,
  Users,
  Edit,
  Ban,
  RotateCcw,
  Inbox,
  Sun,
  Moon,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import { cn } from 'cn'
import {
  formatScheduleDate,
  getTimeSlotInfo,
  getStatusBadgeConfig,
  getOccupancyPercentage,
  getProgressBarColor,
} from '@/components/schedule/schedule.utils'
import type { Schedule, PaginationMeta } from '@/types/schedule.types'

interface DoctorScheduleTableViewProps {
  schedules: Schedule[]
  pagination: PaginationMeta | null
  isLoading?: boolean
  onPageChange: (newPage: number) => void
  onEdit: (schedule: Schedule) => void
  onCancel: (schedule: Schedule) => void
  onReopen: (schedule: Schedule) => void
  onResetFilter?: () => void
}

export const DoctorScheduleTableView: React.FC<DoctorScheduleTableViewProps> = ({
  schedules,
  pagination,
  isLoading = false,
  onPageChange,
  onEdit,
  onCancel,
  onReopen,
  onResetFilter,
}) => {
  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-12 text-center shadow-2xs">
        <div className="inline-flex size-10 items-center justify-center rounded-2xl bg-teal-500/10 text-teal-600 mb-3 animate-spin">
          <Clock className="size-5" />
        </div>
        <p className="text-sm font-medium text-foreground">Đang tải danh sách ca làm việc...</p>
        <p className="text-xs text-muted-foreground mt-0.5">Vui lòng đợi trong giây lát</p>
      </div>
    )
  }

  if (schedules.length === 0) {
    return (
      <div className="rounded-2xl border border-border/80 bg-card p-12 text-center shadow-2xs">
        <div className="inline-flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground mb-3">
          <Inbox className="size-6" />
        </div>
        <h3 className="text-base font-semibold text-foreground">Không tìm thấy ca làm việc nào</h3>
        <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
          Bác sĩ chưa có ca khám trong khoảng thời gian hoặc bộ lọc đã chọn. Hãy đăng ký ca mới để tiếp nhận bệnh nhân.
        </p>
        {onResetFilter && (
          <div className="mt-4">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onResetFilter}
              className="cursor-pointer"
            >
              <span>Xóa bộ lọc</span>
            </Button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl border border-border/80 bg-card shadow-2xs">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="border-b border-border/80 bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              <th className="py-3.5 px-4">Ngày làm việc</th>
              <th className="py-3.5 px-4">Ca khám (Khung giờ)</th>
              <th className="py-3.5 px-4">Lượng bệnh nhân tiếp nhận</th>
              <th className="py-3.5 px-4">Trạng thái</th>
              <th className="py-3.5 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60">
            {schedules.map((schedule) => {
              const slotInfo = getTimeSlotInfo(schedule.time_type)
              const statusConfig = getStatusBadgeConfig(schedule.status)
              const percentage = getOccupancyPercentage(schedule.current_number, schedule.max_number)
              const progressBarColor = getProgressBarColor(percentage)
              const isCancelled = schedule.status === 'CANCELLED'
              const isMorning = slotInfo?.period === 'morning'

              return (
                <tr
                  key={schedule.id}
                  className={cn(
                    'hover:bg-muted/30 transition-colors',
                    isCancelled && 'opacity-70 bg-muted/10'
                  )}
                >
                  {/* 1. Ngày làm việc */}
                  <td className="py-3.5 px-4 font-medium text-foreground">
                    <div className="flex items-center gap-2">
                      <div className="rounded-lg bg-teal-500/10 p-1.5 text-teal-600 dark:text-teal-400 shrink-0">
                        <Calendar className="size-4" />
                      </div>
                      <div>
                        <div className={cn('text-sm font-semibold', isCancelled && 'line-through')}>
                          {formatScheduleDate(schedule.date)}
                        </div>
                        <div className="text-[11px] text-muted-foreground">Mã ca #{schedule.id}</div>
                      </div>
                    </div>
                  </td>

                  {/* 2. Khung giờ & Buổi */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          'inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold shrink-0',
                          isMorning
                            ? 'bg-amber-500/10 text-amber-700 dark:text-amber-400'
                            : 'bg-cyan-500/10 text-cyan-700 dark:text-cyan-400'
                        )}
                      >
                        {isMorning ? <Sun className="size-3" /> : <Moon className="size-3" />}
                        <span>{isMorning ? 'Sáng' : 'Chiều'}</span>
                      </span>

                      <div>
                        <span className="font-semibold text-xs text-foreground mr-1.5">
                          {schedule.time_type}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({slotInfo?.time || 'N/A'})
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 3. Lượng tiếp nhận */}
                  <td className="py-3.5 px-4">
                    <div className="space-y-1 max-w-[180px]">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-foreground flex items-center gap-1">
                          <Users className="size-3 text-muted-foreground" />
                          <span>{schedule.current_number} / {schedule.max_number}</span>
                        </span>
                        <span className="text-[11px] text-muted-foreground">{percentage}%</span>
                      </div>
                      <div className="h-1.5 w-full rounded-full bg-border/60 overflow-hidden">
                        <div
                          className={cn('h-full transition-all duration-300', progressBarColor)}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  </td>

                  {/* 4. Trạng thái */}
                  <td className="py-3.5 px-4">
                    <span
                      className={cn(
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
                        statusConfig.classes
                      )}
                    >
                      <span className={cn('size-1.5 rounded-full', statusConfig.dotClass)} />
                      <span>{statusConfig.label}</span>
                    </span>
                  </td>

                  {/* 5. Thao tác (Tuyệt đối KHÔNG có xóa cứng) */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="inline-flex items-center justify-end gap-1.5">
                      {/* Nút Chi tiết / Sửa max_number */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(schedule)}
                        className="h-8 gap-1.5 text-xs text-muted-foreground hover:text-foreground cursor-pointer"
                        title="Điều chỉnh số lượng tiếp nhận"
                      >
                        <Edit className="size-3.5" />
                        <span className="hidden sm:inline">Chi tiết</span>
                      </Button>

                      {/* Nút Hủy ca (Khi ca đang AVAILABLE hoặc FULL) */}
                      {!isCancelled ? (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onCancel(schedule)}
                          className="h-8 gap-1.5 text-xs text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 cursor-pointer"
                          title="Hủy ca làm việc này"
                        >
                          <Ban className="size-3.5" />
                          <span>Hủy ca</span>
                        </Button>
                      ) : (
                        /* Nút Mở lại ca (Khi ca đang CANCELLED) */
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onReopen(schedule)}
                          className="h-8 gap-1.5 text-xs text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10 cursor-pointer"
                          title="Mở lại ca làm việc để nhận bệnh nhân mới"
                        >
                          <RotateCcw className="size-3.5" />
                          <span>Mở lại</span>
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Phân trang đầy đủ với các nút 1, 2, 3... */}
      {pagination && (
        <Pagination
          currentPage={pagination.page}
          totalPages={pagination.totalPages}
          totalItems={pagination.total}
          pageSize={pagination.pageSize || 10}
          onPageChange={onPageChange}
          itemLabel="ca làm việc"
          className="rounded-2xl border border-border/80 shadow-2xs"
        />
      )}
    </div>
  )
}
