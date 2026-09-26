// ================= FILE: src/types/medical-record.types.ts =================

// --- Trạng thái hồ sơ bệnh án ---
export type MedicalRecordStatus = 'DRAFT' | 'SIGNED'

// --- Hình thức khám ---
export type ConsultationType = 'OFFLINE' | 'ONLINE'

// --- Đơn thuốc ---
export interface PrescriptionItem {
  id: number
  medicine_name: string // Tên thuốc (VD: Paracetamol 500mg)
  dosage: string // Liều dùng (VD: Sáng 1 viên, Tối 1 viên)
  quantity: number // Số lượng
  unit: string // Đơn vị (viên, gói, chai)
  instructions: string | null // Hướng dẫn sử dụng
}

// --- File đính kèm ---
export interface MedicalRecordAttachment {
  id: number
  file_url: string
  file_name: string
  description: string | null
  created_at: string
}

// --- Thông tin bệnh nhân ---
export interface AppointmentUser {
  id: number
  full_name: string
  email: string
  phone_number: string
  avatar: string | null
  gender: string
  date_of_birth: string
}

// --- Thông tin bác sĩ ---
export interface AppointmentDoctor {
  user: {
    id: number
    full_name: string
    avatar: string | null
  }
  specialty: {
    id: number
    name: string
  }
}

// --- Thông tin lịch hẹn liên kết ---
export interface MedicalRecordAppointment {
  id: number
  date: string
  time_type: string
  patient_name: string
  patient_phone?: string
  symptoms?: string
  appointment_type?: string
  status?: string
  user?: AppointmentUser
  doctor?: {
    user: { full_name: string; avatar?: string }
    specialty?: { id: number; name: string }
  }
}

// --- Item trong danh sách (list view) ---
export interface MedicalRecordListItem {
  id: number
  record_code: string
  diagnosis: string
  icd10_code: string | null
  icd10_name: string | null
  status: MedicalRecordStatus
  consultation_type: ConsultationType
  signed_at: string | null
  created_at: string
  appointment: {
    id: number
    date: string
    time_type: string
    patient_name: string
    doctor: { user: { full_name: string } }
  }
}

// --- Chi tiết hồ sơ bệnh án (full detail) ---
export interface MedicalRecordDetail {
  id: number
  record_code: string
  appointment_id: number

  symptoms: string | null
  clinical_examination: string | null

  diagnosis: string
  icd10_code: string | null
  icd10_name: string | null

  blood_pressure: string | null
  pulse: number | null
  temperature: number | null
  weight: number | null
  height: number | null

  doctor_advice: string | null
  re_examination_date: string | null

  consultation_type: ConsultationType
  recommendation: string | null

  status: MedicalRecordStatus
  signed_at: string | null
  created_at: string
  updated_at: string

  prescriptions: PrescriptionItem[]
  attachments: MedicalRecordAttachment[]
  appointment: MedicalRecordAppointment
}

// --- Đơn thuốc response ---
export interface PrescriptionResponse {
  medical_record: {
    id: number
    record_code: string
    diagnosis: string
    status: MedicalRecordStatus
    appointment: {
      id: number
      patient_name: string
      date: string
      time_type: string
    }
  }
  prescriptions: PrescriptionItem[]
}

// --- Pagination ---
export interface Pagination {
  currentPage: number
  pageSize: number
  totalItems: number
  totalPages: number
}

// --- API Response wrappers ---
export interface MedicalRecordListResponse {
  status: string
  message: string
  data: {
    records: MedicalRecordListItem[]
    pagination: Pagination
  }
}

export interface MedicalRecordDetailResponse {
  status: string
  message: string
  data: MedicalRecordDetail
}

export interface PrescriptionDetailResponse {
  status: string
  message: string
  data: PrescriptionResponse
}

// --- Query params ---
export interface MedicalRecordQueryParams {
  page?: number
  pageSize?: number
  search?: string
  from_date?: string
  to_date?: string
  doctor_id?: number
}
