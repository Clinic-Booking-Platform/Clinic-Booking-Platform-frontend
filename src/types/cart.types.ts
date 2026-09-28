// ================= FILE: src/types/cart.types.ts =================

// --- Thông tin người dùng ---
export interface CartUser {
  id: number
  full_name: string
  email: string
  phone_number: string
  avatar: string | null
  gender?: string
  date_of_birth?: string
}

// --- Thông tin gói khám ---
export interface CartPackage {
  id: number
  name: string
  thumbnail_url: string | null
  price: string // Decimal dạng string (VD: "500000.00")
  discount_price: string | null // null = không có giảm giá
  deleted_at: string | null // null = đang hoạt động, có giá trị = đã ngừng cung cấp
}

// --- Chi tiết sản phẩm trong giỏ ---
export interface CartDetailItem {
  id: number
  cart_id: number
  package_id: number
  quantity: number
  price: string // Giá áp dụng tại thời điểm thêm vào giỏ (Decimal string)
  package: CartPackage
}

// --- Item trong danh sách (list view) ---
export interface CartListItem {
  id: number
  user_id: number
  sum: number // Tổng số lượng sản phẩm (cột sum trong DB)
  user: CartUser
  total_items: number // = sum
  total_amount: number // Tổng tiền giỏ hàng (VNĐ, đã tính)
}

// --- Chi tiết giỏ hàng đầy đủ ---
export interface CartDetail {
  id: number
  user_id: number
  sum: number
  user: CartUser
  cart_details: CartDetailItem[]
  total_items: number
  total_amount: number
}

// --- Pagination ---
export interface Pagination {
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// --- API Response wrappers ---
export interface CartListResponse {
  status: string
  message: string
  data: {
    carts: CartListItem[]
    pagination: Pagination
  }
}

export interface CartDetailResponse {
  status: string
  message: string
  data: CartDetail
}

// --- Query params ---
export interface CartQueryParams {
  page?: number
  pageSize?: number
  search?: string
  price_range?: string // VD: "100-300,500-1000,tren-1000"
}
