import { Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/layouts/admin/AdminLayout'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { PlaceholderAdminPage } from '@/pages/admin/PlaceholderAdminPage'

/**
 * Danh sách toàn bộ các tuyến đường (routes) của phân hệ Quản trị Admin
 * Khớp 1:1 với 7 nhóm chức năng Backend API của Clinic Booking Platform
 */
export const AdminRoutes = (
  <Route path="/admin" element={<AdminLayout />}>
    {/* Mặc định /admin chuyển hướng vào /admin/dashboard */}
    <Route index element={<Navigate to="/admin/dashboard" replace />} />

    {/* Nhóm 1: TỔNG QUAN */}
    <Route path="dashboard" element={<DashboardPage />} />

    {/* Nhóm 2: DANH MỤC Y TẾ (Medical Catalog) */}
    <Route path="specialties" element={<PlaceholderAdminPage />} />
    <Route path="packages" element={<PlaceholderAdminPage />} />

    {/* Nhóm 3: TÀI KHOẢN & NHÂN SỰ (Users & Doctors) */}
    <Route path="doctors" element={<PlaceholderAdminPage />} />
    <Route path="users" element={<PlaceholderAdminPage />} />

    {/* Nhóm 4: VẬN HÀNH & LỊCH HẸN (Operations) */}
    <Route path="schedules" element={<PlaceholderAdminPage />} />
    <Route path="appointments" element={<PlaceholderAdminPage />} />
    <Route path="medical-records" element={<PlaceholderAdminPage />} />
    <Route path="prescriptions" element={<PlaceholderAdminPage />} />

    {/* Nhóm 5: ĐƠN HÀNG & GIAO DỊCH (Finance & Orders) */}
    <Route path="orders" element={<PlaceholderAdminPage />} />
    <Route path="carts" element={<PlaceholderAdminPage />} />

    {/* Nhóm 6: NỘI DUNG & TRUYỀN THÔNG (CMS / Marketing) */}
    <Route path="articles" element={<PlaceholderAdminPage />} />
    <Route path="banners" element={<PlaceholderAdminPage />} />

    {/* Nhóm 7: HỆ THỐNG */}
    <Route path="settings" element={<PlaceholderAdminPage />} />
  </Route>
)
