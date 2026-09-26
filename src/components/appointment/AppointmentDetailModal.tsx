import React, { useState, useEffect } from 'react'
import {
  X,
  User,
  Phone,
  Calendar,
  Clock,
  Stethoscope,
  FileText,
  AlertTriangle,
  Check,
  CheckCircle2,
  UserX,
  Ban,
  Loader2,
  Package as PackageIcon,
  Video,
  Building,
  Copy,
  ExternalLink,
} from 'lucide-react'
import { toast } from 'react-toastify'
import { Button } from '@/components/ui/button'
import { appointmentApi } from '@/services/appointment.api'
import {
  formatAppointmentDate,
  formatShortDate,
  formatDateTime,
  getTimeSlotInfo,
  getStatusBadgeConfig,
  getAppointmentTypeBadge,
  extractErrorMessage,
} from './appointment.utils'
import type {
  Appointment,
  UpdateAppointmentStatus,
} from '@/types/appointment.types'

export interface AppointmentDetailModalProps {
  isOpen: boolean
  appointmentId: number | null
  onClose: () => void
  onStatusUpdate?: (appointment: Appointment, newStatus: UpdateAppointmentStatus) => void
  onCancelRequest?: (appointment: Appointment) => void
}

export const AppointmentDetailModal: React.FC<AppointmentDetailModalProps> = ({
  isOpen,
  appointmentId,
  onClose,
  onStatusUpdate,
  onCancelRequest,
}) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Render-time reset when appointmentId changes
  const [prevAppointmentId, setPrevAppointmentId] = useState<number | null>(null)
  if (appointmentId !== prevAppointmentId) {
    setPrevAppointmentId(appointmentId)
    setAppointment(null)
    setError(null)
  }

  const isLoading =
    isOpen && Boolean(appointmentId) && appointment?.id !== appointmentId && !error

  // Fetch appointment detail
  useEffect(() => {
    if (!isOpen || !appointmentId) return

    let isMounted = true

    appointmentApi
      .getAdminAppointmentDetail(appointmentId)
      .then((data) => {
        if (isMounted) {
          setAppointment(data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Không thể tải chi tiết lịch hẹn'))
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, appointmentId])

  // ESC key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => {
      document.body.style.overflow = ''
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  const slotInfo = appointment ? getTimeSlotInfo(appointment.time_type) : null
  const statusCfg = appointment ? getStatusBadgeConfig(appointment.status) : null
  const typeBadge = appointment ? getAppointmentTypeBadge(appointment.appointment_type) : null
  const docName =
    appointment?.doctor?.user?.full_name ||
    (appointment?.doctor_id ? `Bác sĩ #${appointment.doctor_id}` : 'Chưa phân bổ')
  const specialtyName = appointment?.doctor?.specialty?.name

  const handleCopyMeetingLink = (link: string) => {
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-2xl max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/20">
          <div className="flex items-center gap-3">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 font-bold text-sm">
              #{appointmentId}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-semibold text-base sm:text-lg text-foreground">
                  Chi tiết Lịch hẹn khám
                </h2>
                {statusCfg && (
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold border ${statusCfg.classes}`}
                  >
                    <span className={`size-1.5 rounded-full ${statusCfg.dotClass}`} />
                    <span>{statusCfg.label}</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Xem toàn bộ hồ sơ tiếp nhận, triệu chứng lâm sàng và tiến trình khám
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors cursor-pointer"
            aria-label="Đóng"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground space-y-2">
              <Loader2 className="size-7 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-xs">Đang tải thông tin chi tiết lịch hẹn...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-2.5">
              <AlertTriangle className="size-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Không thể tải thông tin</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {appointment && !isLoading && (
            <>
              {/* KHUNG THÔNG TIN HỦY (Nếu status === 'CANCELLED') */}
              {appointment.status === 'CANCELLED' && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 text-xs text-rose-700 dark:text-rose-300 flex items-start gap-3">
                  <div className="p-1 rounded-lg bg-rose-500/20 text-rose-600 dark:text-rose-400 shrink-0">
                    <Ban className="size-4" />
                  </div>
                  <div>
                    <p className="font-bold text-sm">Lịch hẹn đã bị hủy</p>
                    <p className="mt-1 leading-relaxed">
                      Lịch hẹn này đã bị hủy vào lúc{' '}
                      <strong className="underline">
                        {appointment.deleted_at
                          ? formatDateTime(appointment.deleted_at)
                          : 'thời gian chưa xác định'}
                      </strong>
                      . Suất khám đã được tự động hoàn lại cho ca trực của bác sĩ.
                    </p>
                  </div>
                </div>
              )}

              {/* 1. Thông tin Bệnh nhân */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <User className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Thông tin Bệnh nhân tiếp nhận</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Họ và tên:</span>
                    <p className="font-bold text-sm text-foreground mt-0.5">
                      {appointment.patient_name}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Số điện thoại liên hệ:</span>
                    <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Phone className="size-3 text-teal-600 dark:text-teal-400" />
                      <a
                        href={`tel:${appointment.patient_phone}`}
                        className="hover:underline text-teal-600 dark:text-teal-400"
                      >
                        {appointment.patient_phone}
                      </a>
                    </p>
                  </div>

                  {appointment.patient_gender && (
                    <div>
                      <span className="text-muted-foreground">Giới tính:</span>
                      <p className="font-medium text-foreground mt-0.5">
                        {appointment.patient_gender === 'male' || appointment.patient_gender === 'M'
                          ? 'Nam'
                          : appointment.patient_gender === 'female' || appointment.patient_gender === 'F'
                            ? 'Nữ'
                            : appointment.patient_gender}
                      </p>
                    </div>
                  )}

                  {appointment.patient_dob && (
                    <div>
                      <span className="text-muted-foreground">Ngày sinh:</span>
                      <p className="font-medium text-foreground mt-0.5">
                        {formatShortDate(appointment.patient_dob)}
                      </p>
                    </div>
                  )}
                </div>

                {/* Triệu chứng bệnh nhân mô tả */}
                <div className="pt-2 border-t border-border/60">
                  <span className="text-muted-foreground flex items-center gap-1 text-xs">
                    <FileText className="size-3 text-teal-600 dark:text-teal-400" />
                    <span>Mô tả triệu chứng / Lý do khám:</span>
                  </span>
                  <div className="mt-1.5 rounded-lg bg-background p-3 border border-border/60 text-xs text-foreground leading-relaxed whitespace-pre-wrap">
                    {appointment.symptoms?.trim() || (
                      <span className="text-muted-foreground italic">
                        Bệnh nhân không ghi chú triệu chứng cụ thể khi đặt lịch.
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* 2. Thông tin Bác sĩ phụ trách & Dịch vụ */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Stethoscope className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Bác sĩ phụ trách & Chuyên khoa</span>
                </span>

                <div className="flex items-center gap-3.5">
                  {appointment.doctor?.user?.avatar ? (
                    <img
                      src={appointment.doctor.user.avatar}
                      alt={docName}
                      className="size-12 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <div className="flex size-12 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold text-sm border border-teal-500/20 shrink-0">
                      BS
                    </div>
                  )}

                  <div className="space-y-0.5 min-w-0">
                    <p className="font-bold text-sm text-foreground truncate">{docName}</p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1 truncate">
                      <Stethoscope className="size-3 text-teal-600 dark:text-teal-400" />
                      <span>{specialtyName || 'Chưa cập nhật chuyên khoa'}</span>
                    </p>
                    {appointment.doctor?.user?.email && (
                      <p className="text-[11px] text-muted-foreground">
                        {appointment.doctor.user.email}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nếu có gói khám */}
                {appointment.package && (
                  <div className="pt-2 border-t border-border/60 flex items-center gap-2 text-xs">
                    <PackageIcon className="size-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
                    <span className="text-muted-foreground">Gói khám đính kèm:</span>
                    <strong className="text-foreground">{appointment.package.name}</strong>
                  </div>
                )}
              </div>

              {/* 3. Lịch khám & Hình thức */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Thời gian khám & Hình thức tiếp nhận</span>
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div>
                    <span className="text-muted-foreground">Ngày hẹn khám:</span>
                    <p className="font-bold text-foreground mt-0.5">
                      {formatAppointmentDate(appointment.date)}
                    </p>
                  </div>

                  <div>
                    <span className="text-muted-foreground">Khung giờ hẹn:</span>
                    <p className="font-semibold text-foreground flex items-center gap-1.5 mt-0.5">
                      <Clock className="size-3 text-teal-600 dark:text-teal-400" />
                      <span>{slotInfo?.time || appointment.time_type}</span>
                      <span className="text-muted-foreground font-mono">
                        ({appointment.time_type})
                      </span>
                    </p>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Hình thức khám:</span>
                    <div className="mt-1 flex items-center gap-2">
                      {typeBadge && (
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${typeBadge.classes}`}
                        >
                          {appointment.appointment_type === 'ONLINE' ? (
                            <Video className="size-3" />
                          ) : (
                            <Building className="size-3" />
                          )}
                          <span>{typeBadge.label}</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* 4. Khối Phòng khám trực tuyến (Jitsi Meet) dành riêng cho ONLINE */}
              {appointment.appointment_type === 'ONLINE' && (
                <div className="rounded-xl border border-purple-200 dark:border-purple-800/80 bg-purple-50/50 dark:bg-purple-950/20 p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-300 flex items-center gap-1.5">
                      <Video className="size-3.5 text-purple-600 dark:text-purple-400" />
                      <span>Phòng khám trực tuyến (Jitsi Meet)</span>
                    </span>
                    {appointment.status === 'CANCELLED' && (
                      <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-800">
                        Phòng khám không khả dụng
                      </span>
                    )}
                  </div>

                  {/* Hiển thị đường dẫn */}
                  <div className="space-y-1.5">
                    <span className="text-xs text-muted-foreground font-medium">
                      Đường dẫn phòng khám:
                    </span>
                    {appointment.meeting_link ? (
                      <div className="p-2.5 rounded-lg bg-background border border-border text-foreground font-mono text-xs sm:text-sm select-all break-all shadow-xs">
                        {appointment.meeting_link}
                      </div>
                    ) : (
                      <div className="p-2.5 rounded-lg bg-background/60 border border-dashed border-border text-muted-foreground text-xs italic">
                        Đang khởi tạo phòng khám...
                      </div>
                    )}
                  </div>

                  {/* Nút thao tác: Sao chép link hỗ trợ & Truy cập phòng khám */}
                  {appointment.meeting_link && (
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      {/* Nút "Sao chép link hỗ trợ" */}
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyMeetingLink(appointment.meeting_link!)}
                        className="gap-1.5 text-xs text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/40 cursor-pointer"
                        title="Sao chép link gửi cho bệnh nhân hoặc bác sĩ"
                      >
                        <Copy className="size-3.5" />
                        <span>Sao chép link hỗ trợ</span>
                      </Button>

                      {/* Nút "Truy cập phòng khám" */}
                      <Button
                        type="button"
                        size="sm"
                        disabled={appointment.status === 'CANCELLED'}
                        onClick={() => window.open(appointment.meeting_link!, '_blank')}
                        className={`gap-1.5 text-xs cursor-pointer ${
                          appointment.status === 'CANCELLED'
                            ? 'opacity-50 cursor-not-allowed bg-muted text-muted-foreground hover:bg-muted'
                            : 'bg-purple-600 hover:bg-purple-700 text-white shadow-xs'
                        }`}
                        title={
                          appointment.status === 'CANCELLED'
                            ? 'Lịch hẹn đã hủy, phòng khám không khả dụng'
                            : 'Mở phòng khám trong tab mới'
                        }
                      >
                        <ExternalLink className="size-3.5" />
                        <span>Truy cập phòng khám</span>
                      </Button>

                      {appointment.status === 'CANCELLED' && (
                        <span className="text-xs text-rose-600 dark:text-rose-400 italic">
                          Lịch hẹn đã hủy, phòng khám không khả dụng
                        </span>
                      )}
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 border-t border-border/60 px-5 py-3.5 bg-muted/10">
          <div className="flex items-center gap-2">
            {/* Nút Hủy lịch: Chỉ hiện khi PENDING hoặc CONFIRMED */}
            {appointment && (appointment.status === 'PENDING' || appointment.status === 'CONFIRMED') && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  onClose()
                  onCancelRequest?.(appointment)
                }}
                className="gap-1.5 text-rose-600 hover:text-rose-700 hover:bg-rose-500/10 border-rose-500/30 cursor-pointer font-medium"
              >
                <Ban className="size-3.5" />
                <span>Hủy lịch hẹn</span>
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Smart Actions theo trạng thái */}
            {appointment?.status === 'PENDING' && (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  onClose()
                  onStatusUpdate?.(appointment, 'CONFIRMED')
                }}
                className="gap-1.5 bg-blue-600 hover:bg-blue-700 text-white shadow-xs cursor-pointer font-medium"
              >
                <Check className="size-3.5" />
                <span>Xác nhận lịch</span>
              </Button>
            )}

            {appointment?.status === 'CONFIRMED' && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    onClose()
                    onStatusUpdate?.(appointment, 'NO_SHOW')
                  }}
                  className="gap-1.5 text-amber-600 hover:text-amber-700 hover:bg-amber-500/10 border-amber-500/30 cursor-pointer font-medium"
                >
                  <UserX className="size-3.5" />
                  <span>Báo vắng mặt</span>
                </Button>

                <Button
                  type="button"
                  size="sm"
                  onClick={() => {
                    onClose()
                    onStatusUpdate?.(appointment, 'COMPLETED')
                  }}
                  className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs cursor-pointer font-medium"
                >
                  <CheckCircle2 className="size-3.5" />
                  <span>Hoàn thành khám</span>
                </Button>
              </>
            )}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              className="cursor-pointer font-medium"
            >
              Đóng
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
