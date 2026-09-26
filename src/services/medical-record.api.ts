// ================= FILE: src/services/medical-record.api.ts =================

import api from './axios-clients'
import type {
  MedicalRecordListResponse,
  MedicalRecordDetailResponse,
  PrescriptionDetailResponse,
  MedicalRecordQueryParams,
} from '@/types/medical-record.types'

/**
 * Helper gọi API linh hoạt: Thử tiền tố /api/v1/admin trước, nếu 404 thì fallback /admin
 */
async function getWithFallback<T>(paths: string[], config?: object): Promise<T> {
  let lastErr: unknown
  for (const p of paths) {
    try {
      const res = await api.get<T>(p, config)
      return res.data
    } catch (err: unknown) {
      lastErr = err
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status !== 404) {
        throw err
      }
    }
  }
  throw lastErr
}

/** Lấy danh sách hồ sơ bệnh án (Admin - Read-only) */
export const getAdminMedicalRecords = async (
  params?: MedicalRecordQueryParams
): Promise<MedicalRecordListResponse> => {
  const queryParams: Record<string, unknown> = {}
  if (params?.page) queryParams.page = params.page
  if (params?.pageSize) queryParams.pageSize = params.pageSize
  if (params?.search?.trim()) queryParams.search = params.search.trim()
  if (params?.from_date) queryParams.from_date = params.from_date
  if (params?.to_date) queryParams.to_date = params.to_date
  if (params?.doctor_id) queryParams.doctor_id = params.doctor_id

  return getWithFallback<MedicalRecordListResponse>(
    ['/api/v1/admin/medical-records', '/admin/medical-records'],
    { params: queryParams }
  )
}

/** Xem chi tiết hồ sơ bệnh án (Admin - Read-only) */
export const getAdminMedicalRecordDetail = async (
  id: number
): Promise<MedicalRecordDetailResponse> => {
  return getWithFallback<MedicalRecordDetailResponse>([
    `/api/v1/admin/medical-records/${id}`,
    `/admin/medical-records/${id}`,
  ])
}

/** Xem đơn thuốc theo hồ sơ bệnh án (Admin - Read-only) */
export const getAdminPrescription = async (
  medicalRecordId: number
): Promise<PrescriptionDetailResponse> => {
  return getWithFallback<PrescriptionDetailResponse>([
    `/api/v1/admin/prescriptions/medical-record/${medicalRecordId}`,
    `/admin/prescriptions/medical-record/${medicalRecordId}`,
  ])
}

export const medicalRecordApi = {
  getAdminMedicalRecords,
  getAdminMedicalRecordDetail,
  getAdminPrescription,
}

export default medicalRecordApi
