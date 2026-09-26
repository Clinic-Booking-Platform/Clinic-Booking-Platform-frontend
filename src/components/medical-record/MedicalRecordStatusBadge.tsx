import React from 'react'
import { FileEdit, CheckCircle2, type LucideIcon } from 'lucide-react'
import type { MedicalRecordStatus } from '@/types/medical-record.types'

interface StatusConfigItem {
  label: string
  className: string
  icon: LucideIcon
}

const statusConfig: Record<MedicalRecordStatus, StatusConfigItem> = {
  DRAFT: {
    label: 'Bản nháp',
    className:
      'bg-yellow-50 text-yellow-800 border-yellow-300 dark:bg-yellow-950/40 dark:text-yellow-300 dark:border-yellow-800',
    icon: FileEdit,
  },
  SIGNED: {
    label: 'Đã ký',
    className:
      'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800',
    icon: CheckCircle2,
  },
}

export interface MedicalRecordStatusBadgeProps {
  status: MedicalRecordStatus
  className?: string
  showIcon?: boolean
}

export const MedicalRecordStatusBadge: React.FC<MedicalRecordStatusBadgeProps> = ({
  status,
  className = '',
  showIcon = true,
}) => {
  const config = statusConfig[status] || {
    label: status,
    className: 'bg-muted text-muted-foreground border-border',
    icon: FileEdit,
  }

  const IconComponent = config.icon

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors shadow-2xs ${config.className} ${className}`}
    >
      {showIcon && <IconComponent className="size-3.5 shrink-0" />}
      <span>{config.label}</span>
    </span>
  )
}

export default MedicalRecordStatusBadge
