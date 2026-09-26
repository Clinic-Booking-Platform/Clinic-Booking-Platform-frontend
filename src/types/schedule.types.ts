export type TimeSlotKey = 'T1' | 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'T8'

export interface TimeSlotConfig {
  key: TimeSlotKey
  time: string
  period: 'morning' | 'afternoon'
  label: string
}

export const TIME_SLOTS: TimeSlotConfig[] = [
  { key: 'T1', time: '08:00 - 09:00', period: 'morning', label: '08:00 - 09:00 (T1)' },
  { key: 'T2', time: '09:00 - 10:00', period: 'morning', label: '09:00 - 10:00 (T2)' },
  { key: 'T3', time: '10:00 - 11:00', period: 'morning', label: '10:00 - 11:00 (T3)' },
  { key: 'T4', time: '11:00 - 12:00', period: 'morning', label: '11:00 - 12:00 (T4)' },
  { key: 'T5', time: '13:00 - 14:00', period: 'afternoon', label: '13:00 - 14:00 (T5)' },
  { key: 'T6', time: '14:00 - 15:00', period: 'afternoon', label: '14:00 - 15:00 (T6)' },
  { key: 'T7', time: '15:00 - 16:00', period: 'afternoon', label: '15:00 - 16:00 (T7)' },
  { key: 'T8', time: '16:00 - 17:00', period: 'afternoon', label: '16:00 - 17:00 (T8)' },
]

export const TIME_SLOT_MAP: Record<TimeSlotKey, TimeSlotConfig> = TIME_SLOTS.reduce(
  (acc, slot) => {
    acc[slot.key] = slot
    return acc
  },
  {} as Record<TimeSlotKey, TimeSlotConfig>
)

export type ScheduleStatus = 'AVAILABLE' | 'FULL' | 'CANCELLED'
export type ScheduleStatusFilter = 'all' | 'AVAILABLE' | 'FULL' | 'CANCELLED'

export interface DoctorScheduleDoctor {
  id: number
  user?: {
    id: number
    full_name: string
    avatar?: string | null
    email?: string
    phone_number?: string | null
  }
  specialty?: {
    id: number
    name: string
  }
}

export interface Schedule {
  id: number
  doctor_id: number
  date: string
  time_type: TimeSlotKey
  max_number: number
  current_number: number
  status: ScheduleStatus
  doctor?: DoctorScheduleDoctor
  created_at?: string
  updated_at?: string
}

export interface PaginationMeta {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

export interface ScheduleFilterParams {
  page?: number
  doctor_id?: number
  date?: string
  from_date?: string
  to_date?: string
  status?: ScheduleStatusFilter
}

export interface CreateScheduleDto {
  doctor_id: number
  date: string
  time_type: TimeSlotKey
  max_number?: number
}

export interface BulkCreateScheduleDto {
  doctor_id: number
  date: string
  time_types: TimeSlotKey[]
  max_number?: number
}

export interface UpdateScheduleDto {
  max_number?: number
  status?: ScheduleStatus
}

export interface ScheduleListResponse {
  status: 'success' | 'error'
  message?: string
  data: {
    schedules: Schedule[]
    pagination: PaginationMeta
  }
}

export interface ScheduleDetailResponse {
  status: 'success' | 'error'
  message?: string
  data: Schedule
}

export interface ScheduleActionResponse {
  status: 'success' | 'error'
  message?: string
}

export interface BulkCreateScheduleResponse {
  status: 'success' | 'error'
  message?: string
  data?: {
    count?: number
    created_count?: number
  }
}
