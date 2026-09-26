// ================= FILE: src/components/medical-record/MedicalRecordDetail.tsx =================

import React, { useState, useEffect } from 'react'
import {
  X,
  FileText,
  User,
  Phone,
  Mail,
  Calendar,
  Clock,
  Stethoscope,
  Activity,
  HeartPulse,
  Thermometer,
  Scale,
  Ruler,
  MessageSquare,
  Paperclip,
  ExternalLink,
  Printer,
  Loader2,
  Video,
  Building,
  FileX,
  ShieldAlert,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { medicalRecordApi } from '@/services/medical-record.api'
import type { MedicalRecordDetail as IMedicalRecordDetail } from '@/types/medical-record.types'
import { MedicalRecordStatusBadge } from './MedicalRecordStatusBadge'
import { PrescriptionDetail } from './PrescriptionDetail'
import {
  formatShortDate,
  formatDateTime,
  formatTimeSlot,
  formatGender,
  extractErrorMessage,
} from './medical-record.utils'

export interface MedicalRecordDetailProps {
  isOpen: boolean
  recordId: number | null
  onClose: () => void
}

export const MedicalRecordDetailModal: React.FC<MedicalRecordDetailProps> = ({
  isOpen,
  recordId,
  onClose,
}) => {
  const [record, setRecord] = useState<IMedicalRecordDetail | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Reset state on recordId change
  const [prevRecordId, setPrevRecordId] = useState<number | null>(null)
  if (recordId !== prevRecordId) {
    setPrevRecordId(recordId)
    setRecord(null)
    setError(null)
  }

  const isLoading =
    isOpen && Boolean(recordId) && record?.id !== recordId && !error

  // Fetch record detail
  useEffect(() => {
    if (!isOpen || !recordId) return

    let isMounted = true

    medicalRecordApi
      .getAdminMedicalRecordDetail(recordId)
      .then((res) => {
        if (isMounted) {
          setRecord(res.data)
          setError(null)
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(extractErrorMessage(err, 'Không thể tải chi tiết hồ sơ bệnh án'))
        }
      })

    return () => {
      isMounted = false
    }
  }, [isOpen, recordId])

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

  const handlePrint = () => {
    window.print()
  }

  const isFever = record?.temperature != null && Number(record.temperature) > 38.0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity print:hidden"
        onClick={onClose}
      />

      {/* Modal Dialog Content */}
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-2xl border border-border/80 bg-card shadow-2xl overflow-hidden z-10 print:static print:max-h-none print:w-full print:border-none print:shadow-none">
        {/* Header Bar */}
        <div className="flex items-center justify-between border-b border-border/60 px-5 py-4 bg-muted/30">
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 font-bold border border-teal-500/20">
              <FileText className="size-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base sm:text-lg font-bold text-foreground truncate">
                  Chi tiết Hồ sơ Bệnh án
                </h3>
                {record && (
                  <span className="font-mono text-xs sm:text-sm font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/20">
                    {record.record_code}
                  </span>
                )}
                {record && <MedicalRecordStatusBadge status={record.status} />}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-2">
                <span>Chế độ Admin (Read-Only)</span>
                {record?.signed_at && (
                  <>
                    <span>•</span>
                    <span>Đã ký số vào: {formatDateTime(record.signed_at)}</span>
                  </>
                )}
              </p>
            </div>
          </div>

          {/* Action buttons (Print & Close) */}
          <div className="flex items-center gap-1.5 shrink-0 print:hidden">
            {record && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handlePrint}
                className="gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted cursor-pointer"
                title="In hồ sơ bệnh án"
              >
                <Printer className="size-3.5" />
                <span className="hidden sm:inline">In hồ sơ</span>
              </Button>
            )}

            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="size-8 p-0 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full cursor-pointer"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 scrollbar-thin scrollbar-thumb-muted">
          {isLoading && (
            <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
              <Loader2 className="size-8 animate-spin text-teal-600 dark:text-teal-400" />
              <p className="text-xs font-medium">Đang tải hồ sơ bệnh án...</p>
            </div>
          )}

          {error && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5 text-center space-y-2">
              <FileX className="size-8 mx-auto text-destructive" />
              <h4 className="font-bold text-sm text-destructive">Không thể tải thông tin hồ sơ</h4>
              <p className="text-xs text-muted-foreground">{error}</p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                className="mt-2 text-xs"
              >
                Đóng
              </Button>
            </div>
          )}

          {record && (
            <>
              {/* Banner nhắc nhở Read-Only */}
              <div className="rounded-xl bg-amber-500/10 border border-amber-500/20 px-3.5 py-2.5 flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-300 print:hidden">
                <ShieldAlert className="size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                <span>
                  <strong>Hồ sơ Bệnh án điện tử chỉ đọc:</strong> Admin chỉ có quyền tra cứu, theo dõi và in ấn. Mọi thay đổi nội dung chuyên môn chỉ được thực hiện bởi Bác sĩ điều trị phụ trách ca khám.
                </span>
              </div>

              {/* Section 1: Thông tin chung & Thời gian */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Mã bệnh án:</span>
                  <p className="font-mono font-bold text-sm text-foreground">
                    {record.record_code}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Trạng thái hồ sơ:</span>
                  <div className="mt-0.5">
                    <MedicalRecordStatusBadge status={record.status} />
                  </div>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Hình thức tiếp nhận:</span>
                  <p className="font-semibold text-xs text-foreground flex items-center gap-1.5 mt-1">
                    {record.consultation_type === 'ONLINE' ? (
                      <>
                        <Video className="size-3.5 text-purple-600" />
                        <span>Trực tuyến</span>
                      </>
                    ) : (
                      <>
                        <Building className="size-3.5 text-teal-600" />
                        <span>Trực tiếp</span>
                      </>
                    )}
                  </p>
                </div>

                <div className="rounded-xl border border-border/70 bg-muted/20 p-3 space-y-0.5">
                  <span className="text-[11px] text-muted-foreground">Ngày lập bệnh án:</span>
                  <p className="font-medium text-xs text-foreground mt-1">
                    {formatDateTime(record.created_at)}
                  </p>
                </div>
              </div>

              {/* Section 2 & 3: Bệnh nhân & Lịch hẹn (2 Cột) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Section 2: Bệnh nhân */}
                <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <User className="size-4 text-teal-600 dark:text-teal-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Thông tin Bệnh nhân
                    </h4>
                  </div>

                  <div className="flex items-start gap-3">
                    {record.appointment?.user?.avatar ? (
                      <img
                        src={record.appointment.user.avatar}
                        alt="Avatar"
                        className="size-11 rounded-full object-cover border border-border shrink-0"
                      />
                    ) : (
                      <div className="flex size-11 items-center justify-center rounded-full bg-teal-500/10 text-teal-600 font-bold text-sm shrink-0 border border-teal-500/20">
                        {record.appointment?.patient_name?.[0] || 'BN'}
                      </div>
                    )}

                    <div className="space-y-1 text-xs min-w-0 flex-1">
                      <p className="font-bold text-sm text-foreground">
                        {record.appointment?.user?.full_name || record.appointment?.patient_name}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-muted-foreground text-[11px]">
                        <span className="flex items-center gap-1">
                          <Phone className="size-3 shrink-0" />
                          <span className="font-mono text-foreground font-medium">
                            {record.appointment?.user?.phone_number ||
                              record.appointment?.patient_phone ||
                              '—'}
                          </span>
                        </span>
                        <span className="flex items-center gap-1">
                          <Mail className="size-3 shrink-0" />
                          <span className="truncate">
                            {record.appointment?.user?.email || '—'}
                          </span>
                        </span>
                        <span>
                          Giới tính:{' '}
                          <strong className="text-foreground">
                            {formatGender(record.appointment?.user?.gender)}
                          </strong>
                        </span>
                        <span>
                          Ngày sinh:{' '}
                          <strong className="text-foreground">
                            {formatShortDate(record.appointment?.user?.date_of_birth)}
                          </strong>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Section 3: Lịch hẹn & Bác sĩ phụ trách */}
                <div className="rounded-xl border border-border/80 bg-muted/10 p-4 space-y-3">
                  <div className="flex items-center gap-2 border-b border-border/60 pb-2">
                    <Calendar className="size-4 text-teal-600 dark:text-teal-400" />
                    <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground">
                      Lịch hẹn & Bác sĩ phụ trách
                    </h4>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Mã lịch hẹn:</span>
                      <span className="font-mono font-bold text-foreground">
                        #{record.appointment?.id || record.appointment_id}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Thời gian khám:</span>
                      <span className="font-semibold text-foreground flex items-center gap-1">
                        <Clock className="size-3 text-teal-600" />
                        <span>
                          {formatShortDate(record.appointment?.date)} —{' '}
                          {formatTimeSlot(record.appointment?.time_type)}
                        </span>
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bác sĩ phụ trách:</span>
                      <span className="font-bold text-foreground flex items-center gap-1">
                        <Stethoscope className="size-3 text-teal-600" />
                        <span>
                          {record.appointment?.doctor?.user?.full_name || 'Bác sĩ điều trị'}
                        </span>
                      </span>
                    </div>

                    {record.appointment?.doctor?.specialty?.name && (
                      <div className="flex items-center justify-between">
                        <span className="text-muted-foreground">Chuyên khoa:</span>
                        <span className="font-medium text-foreground">
                          {record.appointment.doctor.specialty.name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 4: Sinh hiệu — Vital Signs (Grid 5 cột) */}
              <div className="space-y-2.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Activity className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Chỉ số Sinh hiệu (Vital Signs)</span>
                </h4>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
                  {/* Huyết áp */}
                  <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-[11px]">Huyết áp</span>
                      <Activity className="size-3.5 text-rose-500" />
                    </div>
                    <p className="font-bold text-sm sm:text-base text-foreground font-mono">
                      {record.blood_pressure || '—'}
                    </p>
                    <span className="text-[10px] text-muted-foreground">mmHg</span>
                  </div>

                  {/* Mạch */}
                  <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-[11px]">Mạch</span>
                      <HeartPulse className="size-3.5 text-rose-500" />
                    </div>
                    <p className="font-bold text-sm sm:text-base text-foreground font-mono">
                      {record.pulse != null ? record.pulse : '—'}
                    </p>
                    <span className="text-[10px] text-muted-foreground">lần/phút</span>
                  </div>

                  {/* Nhiệt độ */}
                  <div
                    className={`rounded-xl border p-3 shadow-2xs ${
                      isFever
                        ? 'border-rose-300 dark:border-rose-800 bg-rose-50/50 dark:bg-rose-950/20'
                        : 'border-border/80 bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-[11px]">Nhiệt độ</span>
                      <Thermometer
                        className={`size-3.5 ${isFever ? 'text-rose-600' : 'text-amber-500'}`}
                      />
                    </div>
                    <p
                      className={`font-bold text-sm sm:text-base font-mono ${
                        isFever ? 'text-rose-600 dark:text-rose-400' : 'text-foreground'
                      }`}
                    >
                      {record.temperature != null ? `${record.temperature}°C` : '—'}
                    </p>
                    <span
                      className={`text-[10px] ${
                        isFever ? 'text-rose-600 font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {isFever ? 'Sốt cao' : 'Thân nhiệt'}
                    </span>
                  </div>

                  {/* Cân nặng */}
                  <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-[11px]">Cân nặng</span>
                      <Scale className="size-3.5 text-blue-500" />
                    </div>
                    <p className="font-bold text-sm sm:text-base text-foreground font-mono">
                      {record.weight != null ? record.weight : '—'}
                    </p>
                    <span className="text-[10px] text-muted-foreground">kg</span>
                  </div>

                  {/* Chiều cao */}
                  <div className="rounded-xl border border-border/80 bg-card p-3 shadow-2xs">
                    <div className="flex items-center justify-between text-muted-foreground mb-1">
                      <span className="text-[11px]">Chiều cao</span>
                      <Ruler className="size-3.5 text-indigo-500" />
                    </div>
                    <p className="font-bold text-sm sm:text-base text-foreground font-mono">
                      {record.height != null ? record.height : '—'}
                    </p>
                    <span className="text-[10px] text-muted-foreground">cm</span>
                  </div>
                </div>
              </div>

              {/* Section 5: Khám lâm sàng & Chẩn đoán */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3.5">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Stethoscope className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Khám lâm sàng & Kết luận Chẩn đoán</span>
                </h4>

                <div className="space-y-3 text-xs">
                  {/* Triệu chứng cơ năng */}
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Triệu chứng bệnh nhân mô tả:
                    </span>
                    <p className="mt-1 p-2.5 rounded-lg bg-background border border-border/60 text-foreground leading-relaxed whitespace-pre-wrap">
                      {record.symptoms?.trim() || 'Không ghi nhận triệu chứng đặc biệt.'}
                    </p>
                  </div>

                  {/* Kết quả khám thực thể */}
                  <div>
                    <span className="text-muted-foreground font-medium">
                      Kết quả khám thực thể / lâm sàng:
                    </span>
                    <p className="mt-1 p-2.5 rounded-lg bg-background border border-border/60 text-foreground leading-relaxed whitespace-pre-wrap">
                      {record.clinical_examination?.trim() || 'Chưa có ghi chú khám thực thể.'}
                    </p>
                  </div>

                  {/* Chẩn đoán xác định */}
                  <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-teal-700 dark:text-teal-300">
                      Chẩn đoán xác định:
                    </span>
                    <p className="text-base sm:text-lg font-bold text-teal-900 dark:text-teal-100">
                      {record.diagnosis}
                    </p>

                    {/* Mã ICD-10 nếu có */}
                    {(record.icd10_code || record.icd10_name) && (
                      <div className="flex items-center gap-2 pt-1">
                        <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-teal-600 text-white shadow-2xs">
                          {record.icd10_code || 'ICD-10'}
                        </span>
                        <span className="text-xs text-teal-800 dark:text-teal-200 font-medium">
                          {record.icd10_name}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 6: Đơn thuốc — Prescription */}
              <div className="rounded-xl border border-border/80 bg-muted/10 p-4">
                <PrescriptionDetail
                  prescriptions={record.prescriptions || []}
                  medicalRecordInfo={{
                    record_code: record.record_code,
                    diagnosis: record.diagnosis,
                    patient_name:
                      record.appointment?.user?.full_name || record.appointment?.patient_name,
                    patient_phone:
                      record.appointment?.user?.phone_number || record.appointment?.patient_phone,
                    doctor_name: record.appointment?.doctor?.user?.full_name,
                    specialty_name: record.appointment?.doctor?.specialty?.name,
                    date: record.appointment?.date,
                    time_type: record.appointment?.time_type,
                  }}
                  showPrintButton={false}
                />
              </div>

              {/* Section 7: Lời dặn & Tái khám */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <MessageSquare className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>Lời dặn của bác sĩ & Hẹn tái khám</span>
                </h4>

                <div className="space-y-2.5 text-xs">
                  <div>
                    <span className="text-muted-foreground font-medium">Lời dặn bác sĩ:</span>
                    <p className="mt-1 p-2.5 rounded-lg bg-background border border-border/60 text-foreground leading-relaxed whitespace-pre-wrap">
                      {record.doctor_advice?.trim() || 'Không có lời dặn thêm.'}
                    </p>
                  </div>

                  {record.recommendation && (
                    <div>
                      <span className="text-muted-foreground font-medium">Khuyến nghị điều trị:</span>
                      <p className="mt-1 p-2.5 rounded-lg bg-background border border-border/60 text-foreground leading-relaxed whitespace-pre-wrap">
                        {record.recommendation.trim()}
                      </p>
                    </div>
                  )}

                  {record.re_examination_date && (
                    <div className="pt-2">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/30 text-xs font-semibold">
                        <Calendar className="size-3.5" />
                        <span>Hẹn tái khám: {formatShortDate(record.re_examination_date)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Section 8: File đính kèm */}
              <div className="rounded-xl border border-border/80 bg-muted/20 p-4 space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                  <Paperclip className="size-3.5 text-teal-600 dark:text-teal-400" />
                  <span>File đính kèm & Kết quả cận lâm sàng</span>
                </h4>

                {!record.attachments || record.attachments.length === 0 ? (
                  <p className="text-xs text-muted-foreground italic">
                    Không có tài liệu hoặc file cận lâm sàng đính kèm.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {record.attachments.map((file) => (
                      <div
                        key={file.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-card shadow-2xs"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                            <FileText className="size-4 text-teal-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-xs text-foreground truncate">
                              {file.file_name}
                            </p>
                            {file.description && (
                              <p className="text-[11px] text-muted-foreground truncate">
                                {file.description}
                              </p>
                            )}
                          </div>
                        </div>

                        <a
                          href={file.file_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex size-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:text-teal-600 hover:bg-teal-500/10 transition-colors"
                          title="Mở file trong tab mới"
                        >
                          <ExternalLink className="size-4" />
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-border/60 px-5 py-3.5 bg-muted/20 print:hidden">
          <span className="text-xs text-muted-foreground">
            {record?.record_code ? `Hồ sơ ${record.record_code}` : 'Hồ sơ bệnh án'}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs cursor-pointer"
          >
            Đóng
          </Button>
        </div>
      </div>
    </div>
  )
}

export default MedicalRecordDetailModal
