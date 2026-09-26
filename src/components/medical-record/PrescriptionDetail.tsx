import React from 'react'
import { Pill, Printer, FileText } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { PrescriptionItem } from '@/types/medical-record.types'
import { formatShortDate, formatTimeSlot } from './medical-record.utils'

export interface PrescriptionDetailProps {
  prescriptions: PrescriptionItem[]
  medicalRecordInfo?: {
    record_code?: string
    diagnosis?: string
    patient_name?: string
    patient_phone?: string
    patient_gender?: string
    patient_dob?: string
    doctor_name?: string
    specialty_name?: string
    date?: string
    time_type?: string
  }
  showPrintButton?: boolean
  className?: string
}

export const PrescriptionDetail: React.FC<PrescriptionDetailProps> = ({
  prescriptions,
  medicalRecordInfo,
  showPrintButton = true,
  className = '',
}) => {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header bar của khối đơn thuốc */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
            <Pill className="size-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm text-foreground">Danh mục đơn thuốc điều trị</h4>
            <p className="text-xs text-muted-foreground">
              {prescriptions.length > 0
                ? `${prescriptions.length} loại thuốc được chỉ định`
                : 'Chưa có thuốc kê trong hồ sơ này'}
            </p>
          </div>
        </div>

        {showPrintButton && prescriptions.length > 0 && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handlePrint}
            className="gap-1.5 text-xs text-muted-foreground hover:text-foreground border-border/80 hover:bg-muted cursor-pointer print:hidden"
            title="In đơn thuốc ra giấy / PDF"
          >
            <Printer className="size-3.5" />
            <span>In đơn thuốc</span>
          </Button>
        )}
      </div>

      {/* Printable Heading (Chỉ hiện khi In) */}
      <div className="hidden print:block mb-4 p-4 border-b border-gray-300">
        <div className="text-center space-y-1">
          <h2 className="text-xl font-bold uppercase tracking-wider text-black">
            Phòng Khám Đa Khoa MediCare
          </h2>
          <p className="text-xs text-gray-600">ĐƠN THUỐC ĐIỆU TRỊ NGOẠI TRÚ</p>
        </div>
        {medicalRecordInfo && (
          <div className="grid grid-cols-2 gap-2 mt-4 text-xs text-black">
            <div>
              <strong>Mã bệnh án:</strong> {medicalRecordInfo.record_code || '—'}
            </div>
            <div>
              <strong>Bệnh nhân:</strong> {medicalRecordInfo.patient_name || '—'}
            </div>
            <div>
              <strong>Chẩn đoán:</strong> {medicalRecordInfo.diagnosis || '—'}
            </div>
            <div>
              <strong>Bác sĩ kê đơn:</strong> {medicalRecordInfo.doctor_name || '—'}
            </div>
            <div>
              <strong>Ngày khám:</strong> {formatShortDate(medicalRecordInfo.date)} (
              {formatTimeSlot(medicalRecordInfo.time_type)})
            </div>
          </div>
        )}
      </div>

      {/* Bảng danh mục thuốc */}
      {prescriptions.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border/80 bg-muted/20 p-6 text-center">
          <Pill className="size-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-xs font-medium text-muted-foreground">
            Chưa có đơn thuốc nào được kê cho hồ sơ này
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/80 bg-card overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border/60 bg-muted/40 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground select-none">
                <tr>
                  <th className="py-2.5 pl-3.5 pr-2 w-12 text-center">STT</th>
                  <th className="px-3 py-2.5 min-w-[180px]">Tên thuốc</th>
                  <th className="px-3 py-2.5 min-w-[150px]">Liều dùng</th>
                  <th className="px-3 py-2.5 w-20 text-center">Số lượng</th>
                  <th className="px-3 py-2.5 w-20 text-center">Đơn vị</th>
                  <th className="py-2.5 pl-3 pr-3.5 min-w-[180px]">Hướng dẫn sử dụng</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {prescriptions.map((item, idx) => (
                  <tr key={item.id || idx} className="hover:bg-muted/20 transition-colors">
                    <td className="py-2.5 pl-3.5 pr-2 text-center font-mono text-muted-foreground font-semibold">
                      {idx + 1}
                    </td>
                    <td className="px-3 py-2.5 font-bold text-foreground">
                      <div className="flex items-center gap-1.5">
                        <FileText className="size-3 text-teal-600 dark:text-teal-400 shrink-0" />
                        <span>{item.medicine_name}</span>
                      </div>
                    </td>
                    <td className="px-3 py-2.5 font-medium text-foreground">
                      {item.dosage}
                    </td>
                    <td className="px-3 py-2.5 text-center font-mono font-bold text-foreground">
                      {item.quantity}
                    </td>
                    <td className="px-3 py-2.5 text-center text-muted-foreground font-medium">
                      {item.unit}
                    </td>
                    <td className="py-2.5 pl-3 pr-3.5 text-muted-foreground italic">
                      {item.instructions?.trim() || '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PrescriptionDetail
