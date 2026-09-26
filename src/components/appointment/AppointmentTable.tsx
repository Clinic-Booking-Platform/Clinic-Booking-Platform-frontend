import React from 'react'
import {
  Eye,
  Check,
  CheckCircle2,
  UserX,
  Ban,
  Calendar,
  Clock,
  Phone,
  Stethoscope,
  Video,
  Building,
  Package as PackageIcon,
  Inbox,
  Loader2,
  Copy,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { Pagination } from '@/components/ui/pagination'
import {
  formatShortDate,
  formatDateTime,
  getTimeSlotInfo,
  getStatusBadgeConfig,
  getAppointmentTypeBadge,
  getRelativeDateBadge,
} from './appointment.utils'
import type {
  Appointment,
  PaginationMeta,
  UpdateAppointmentStatus,
} from '@/types/appointment.types'

export interface AppointmentTableProps {
  appointments: Appointment[]
  pagination: PaginationMeta | null
  isLoading?: boolean
  onPageChange: (page: number) => void
  onViewDetail: (appointment: Appointment) => void
  onStatusUpdate: (appointment: Appointment, newStatus: UpdateAppointmentStatus) => void
  onCancelRequest: (appointment: Appointment) => void
  actionAppointmentId?: number | null
  isActionLoading?: boolean
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({
  appointments,
  pagination,
  isLoading = false,
  onPageChange,
  onViewDetail,
  onStatusUpdate,
  onCancelRequest,
  actionAppointmentId,
  isActionLoading = false,
}) => {
  // Helper lấy chữ cái viết tắt của tên
  const getInitials = (name?: string) => {
    if (!name) return 'BN'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  // Helper sao chép link phòng khám trực tuyến
  const handleCopyMeetingLink = (e: React.MouseEvent, link: string) => {
    e.stopPropagation()
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard
        .writeText(link)
        .then(() => {
          toast.success('Đã sao chép link phòng khám!')
        })
        .catch(() => {
          toast.error('Không thể sao chép link!')
        })
    } else {
      try {
        const textarea = document.createElement('textarea')
        textarea.value = link
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
        toast.success('Đã sao chép link phòng khám!')
      } catch {
        toast.error('Không thể sao chép link!')
      }
    }
  }

  // 1. Loading Skeleton Rows
  if (isLoading) {
    return (
      <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
              <tr>
                <th className="py-3.5 pl-4 pr-3 min-w-[200px]">Mã & Bệnh nhân</th>
                <th className="px-3 py-3.5 min-w-[220px]">Bác sĩ / Dịch vụ</th>
                <th className="px-3 py-3.5 min-w-[190px]">Thời gian khám</th>
                <th className="px-3 py-3.5 min-w-[140px]">Hình thức</th>
                <th className="px-3 py-3.5 text-center min-w-[130px]">Trạng thái</th>
                <th className="py-3.5 pl-3 pr-4 text-right min-w-[170px]">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/40">
              {Array.from({ length: 5 }).map((_, idx) => (
                <tr key={idx} className="animate-pulse">
                  <td className="py-3.5 pl-4 pr-3">
                    <div className="space-y-1.5">
                      <div className="h-4 w-28 bg-muted rounded" />
                      <div className="h-3 w-20 bg-muted/60 rounded" />
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="size-8 rounded-full bg-muted shrink-0" />
                      <div className="space-y-1">
                        <div className="h-3.5 w-32 bg-muted rounded" />
                        <div className="h-2.5 w-24 bg-muted/60 rounded" />
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="space-y-1.5">
                      <div className="h-3.5 w-24 bg-muted rounded" />
                      <div className="h-4 w-28 bg-muted/60 rounded" />
                    </div>
                  </td>
                  <td className="px-3 py-3.5">
                    <div className="h-5 w-24 bg-muted rounded-full" />
                  </td>
                  <td className="px-3 py-3.5 text-center">
                    <div className="h-5 w-20 bg-muted rounded-full mx-auto" />
                  </td>
                  <td className="py-3.5 pl-3 pr-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <div className="size-8 bg-muted rounded-lg" />
                      <div className="size-8 bg-muted rounded-lg" />
                    </div>
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
  if (appointments.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border/80 bg-card p-12 text-center">
        <div className="mx-auto flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
          <Inbox className="size-6" />
        </div>
        <h3 className="mt-3 text-sm font-semibold text-foreground">
          Không tìm thấy lịch hẹn khám nào
        </h3>
        <p className="mt-1 text-xs text-muted-foreground max-w-sm mx-auto">
          Hiện tại không có lịch hẹn nào khớp với bộ lọc hiện tại. Thử thay đổi ngày khám, bác sĩ hoặc từ khóa tìm kiếm.
        </p>
      </div>
    )
  }

  // 3. Render Table
  return (
    <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-xs flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
            <tr>
              <th className="py-3.5 pl-4 pr-3 min-w-[200px]">Mã & Bệnh nhân</th>
              <th className="px-3 py-3.5 min-w-[220px]">Bác sĩ / Dịch vụ</th>
              <th className="px-3 py-3.5 min-w-[190px]">Thời gian khám</th>
              <th className="px-3 py-3.5 min-w-[140px]">Hình thức</th>
              <th className="px-3 py-3.5 text-center min-w-[130px]">Trạng thái</th>
              <th className="py-3.5 pl-3 pr-4 text-right min-w-[170px]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {appointments.map((apt) => {
              const slotInfo = getTimeSlotInfo(apt.time_type)
              const statusCfg = getStatusBadgeConfig(apt.status)
              const typeBadge = getAppointmentTypeBadge(apt.appointment_type)
              const relativeBadge = getRelativeDateBadge(apt.date)
              const docName =
                apt.doctor?.user?.full_name ||
                (apt.doctor_id ? `Bác sĩ #${apt.doctor_id}` : 'Chưa phân bổ')
              const specialtyName = apt.doctor?.specialty?.name
              const isItemActionLoading = isActionLoading && actionAppointmentId === apt.id

              return (
                <tr key={apt.id} className="group hover:bg-muted/30 transition-colors">
                  {/* Cột 1: Mã & Bệnh nhân */}
                  <td className="py-3 pl-4 pr-3 align-middle">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-teal-600 dark:text-teal-400 text-xs">
                          #{apt.id}
                        </span>
                        <span className="font-bold text-foreground truncate">
                          {apt.patient_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Phone className="size-3 text-muted-foreground shrink-0" />
                        <a
                          href={`tel:${apt.patient_phone}`}
                          className="hover:underline hover:text-foreground font-mono"
                        >
                          {apt.patient_phone}
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Cột 2: Bác sĩ / Dịch vụ */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-2.5">
                      {apt.doctor?.user?.avatar ? (
                        <img
                          src={apt.doctor.user.avatar}
                          alt={docName}
                          className="size-8 rounded-full object-cover border border-border shrink-0"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none'
                          }}
                        />
                      ) : (
                        <div className="flex size-8 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-xs border border-teal-500/20 shrink-0">
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
                            Chưa có chuyên khoa
                          </span>
                        )}
                        {apt.package && (
                          <span className="text-[10px] text-indigo-600 dark:text-indigo-400 flex items-center gap-1 font-medium mt-0.5">
                            <PackageIcon className="size-2.5" />
                            <span className="truncate">{apt.package.name}</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Cột 3: Thời gian khám */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        <Calendar className="size-3.5 text-muted-foreground shrink-0" />
                        <span>{formatShortDate(apt.date)}</span>
                        {relativeBadge && (
                          <span
                            className={`inline-flex items-center px-1.5 py-0.2 rounded-full text-[10px] font-semibold border ${relativeBadge.className}`}
                          >
                            {relativeBadge.label}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <span className="inline-flex items-center gap-1 rounded bg-muted/60 px-2 py-0.5 text-xs font-semibold text-foreground border border-border/60">
                          <Clock className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>{slotInfo?.time || apt.time_type}</span>
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Cột 4: Hình thức khám */}
                  <td className="px-3 py-3 align-middle">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold border ${typeBadge.classes}`}
                      >
                        {apt.appointment_type === 'ONLINE' ? (
                          <Video className="size-3 shrink-0" />
                        ) : (
                          <Building className="size-3 shrink-0" />
                        )}
                        <span>{typeBadge.label}</span>
                      </span>

                      {/* Khi là ONLINE và có meeting_link: icon nút nhỏ "Sao chép link" */}
                      {apt.appointment_type === 'ONLINE' && apt.meeting_link && (
                        <button
                          type="button"
                          onClick={(e) => handleCopyMeetingLink(e, apt.meeting_link!)}
                          className="inline-flex size-6 items-center justify-center rounded-md text-muted-foreground hover:text-purple-600 hover:bg-purple-500/15 transition-colors border border-border/60 hover:border-purple-300 dark:hover:border-purple-700 cursor-pointer"
                          title="Sao chép link phòng khám"
                        >
                          <Copy className="size-3 shrink-0" />
                        </button>
                      )}
                    </div>
                  </td>

                  {/* Cột 5: Trạng thái */}
                  <td className="px-3 py-3 text-center align-middle">
                    <div className="flex flex-col items-center gap-0.5">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold border ${statusCfg.classes}`}
                        title={
                          apt.status === 'CANCELLED' && apt.deleted_at
                            ? `Đã hủy vào: ${formatDateTime(apt.deleted_at)}`
                            : undefined
                        }
                      >
                        <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                        <span>{statusCfg.label}</span>
                      </span>

                      {/* Hover / Sub-text if CANCELLED */}
                      {apt.status === 'CANCELLED' && apt.deleted_at && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                          {formatDateTime(apt.deleted_at)}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Cột 6: Thao tác & Smart Action Buttons */}
                  <td className="py-3 pl-3 pr-4 text-right align-middle">
                    <div className="flex items-center justify-end gap-1">
                      {/* 1. Nút Xem chi tiết (luôn hiển thị) */}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewDetail(apt)}
                        className="size-8 p-0 text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 cursor-pointer"
                        title="Xem chi tiết hồ sơ khám"
                      >
                        <Eye className="size-4" />
                      </Button>

                      {/* 2. SMART ACTIONS THEO TRẠNG THÁI */}
                      {/* Trạng thái PENDING: Hiện nút Xác nhận (xanh dương) & Hủy lịch (đỏ) */}
                      {apt.status === 'PENDING' && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onStatusUpdate(apt, 'CONFIRMED')}
                            disabled={isItemActionLoading}
                            className="h-8 px-2.5 gap-1 bg-blue-600 hover:bg-blue-700 text-white shadow-2xs text-xs font-semibold cursor-pointer"
                            title="Xác nhận lịch hẹn"
                          >
                            {isItemActionLoading ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <Check className="size-3.5" />
                            )}
                            <span className="hidden sm:inline">Xác nhận</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onCancelRequest(apt)}
                            disabled={isItemActionLoading}
                            className="size-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer"
                            title="Hủy lịch hẹn"
                          >
                            <Ban className="size-4" />
                          </Button>
                        </>
                      )}

                      {/* Trạng thái CONFIRMED: Hiện nút Hoàn thành (xanh lá), Vắng mặt (cam), Hủy lịch (đỏ) */}
                      {apt.status === 'CONFIRMED' && (
                        <>
                          <Button
                            type="button"
                            size="sm"
                            onClick={() => onStatusUpdate(apt, 'COMPLETED')}
                            disabled={isItemActionLoading}
                            className="h-8 px-2.5 gap-1 bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs text-xs font-semibold cursor-pointer"
                            title="Đánh dấu đã hoàn thành khám"
                          >
                            {isItemActionLoading ? (
                              <Loader2 className="size-3.5 animate-spin" />
                            ) : (
                              <CheckCircle2 className="size-3.5" />
                            )}
                            <span className="hidden sm:inline">Hoàn thành</span>
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onStatusUpdate(apt, 'NO_SHOW')}
                            disabled={isItemActionLoading}
                            className="size-8 p-0 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30 cursor-pointer"
                            title="Báo bệnh nhân vắng mặt"
                          >
                            <UserX className="size-4" />
                          </Button>

                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => onCancelRequest(apt)}
                            disabled={isItemActionLoading}
                            className="size-8 p-0 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer"
                            title="Hủy lịch hẹn"
                          >
                            <Ban className="size-4" />
                          </Button>
                        </>
                      )}

                      {/* Trạng thái Terminal (COMPLETED, CANCELLED, NO_SHOW): Ẩn hoàn toàn nút chuyển trạng thái */}
                      {(apt.status === 'COMPLETED' ||
                        apt.status === 'CANCELLED' ||
                        apt.status === 'NO_SHOW') && (
                        <span className="text-[11px] text-muted-foreground/60 italic pr-1">
                          Đã chốt
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Phân trang */}
      {pagination && pagination.totalPages > 1 && (
        <div className="border-t border-border/60 p-4">
          <Pagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
}
