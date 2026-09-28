// ================= FILE: src/types/order.types.ts =================

// --- Trạng thái thanh toán ---
export type PaymentStatus = 'UNPAID' | 'PAID' | 'FAILED' | 'CANCELLED'

// --- Phương thức thanh toán ---
export type PaymentMethod = 'VNPAY' | 'CASH'

// --- Trạng thái lịch hẹn (dùng trong order detail) ---
export type AppointmentStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'COMPLETED'
  | 'CANCELLED'
  | 'NO_SHOW'

// --- Thông tin khách hàng ---
export interface OrderUser {
  id: number
  full_name: string
  email: string
  phone_number: string
  avatar: string | null
  gender?: string
  date_of_birth?: string
}

// --- Thông tin gói khám ---
export interface PackageSummary {
  id: number
  name: string
  thumbnail_url: string | null
  price: number
  discount_price: number | null
  description: string | null
}

// --- Lịch hẹn liên quan đến gói khám ---
export interface OrderAppointment {
  id: number
  doctor_id: number | null
  doctor: {
    id: number
    full_name: string
    avatar: string | null
  } | null
  date: string
  time_type: string
  appointment_type: 'OFFLINE' | 'ONLINE'
  meeting_link: string | null
  patient_name: string
  patient_phone: string
  symptoms: string | null
  status: AppointmentStatus
}

// --- Chi tiết gói khám trong đơn hàng (kèm tiến độ sử dụng) ---
export interface OrderDetailItem {
  id: number
  order_id: number
  package_id: number
  quantity: number // Số lượt mua
  price: number // Giá tại thời điểm mua (VNĐ)
  package: PackageSummary
  used_quantity: number // Số lượt đã đặt lịch (PENDING + CONFIRMED + COMPLETED)
  remaining_quantity: number // Số lượt còn lại
  appointments: OrderAppointment[] // Danh sách lịch hẹn đã đặt
}

// --- Item trong danh sách đơn hàng (list view) ---
export interface OrderListItem {
  id: number
  order_code: string
  total_price: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  created_at: string
  expires_at: string // Thời hạn thanh toán (created_at + 15 phút)
  is_expired: boolean // true nếu chưa thanh toán và đã quá 15 phút
  deleted_at: string | null // null = chưa hủy, có giá trị = đã bị xóa mềm/hủy
  user: OrderUser
}

// --- Chi tiết đơn hàng đầy đủ ---
export interface OrderDetail {
  id: number
  order_code: string
  total_price: number
  payment_method: PaymentMethod
  payment_status: PaymentStatus
  created_at: string
  expires_at: string
  is_expired: boolean
  deleted_at: string | null
  total_items: number // Tổng số lượt khám (sum of quantity)
  user: OrderUser
  order_details: OrderDetailItem[]
}

// --- Pagination ---
export interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// --- API Response wrappers ---
export interface OrderListResponse {
  status: string
  message: string
  data: {
    orders: OrderListItem[]
    pagination: Pagination
  }
}

export interface OrderDetailResponse {
  status: string
  message: string
  data: OrderDetail
}

// --- Query params ---
export interface OrderQueryParams {
  page?: number
  pageSize?: number
  search?: string
  status?: PaymentStatus | 'ALL'
  from_date?: string
  to_date?: string
}
