// ================= FILE: src/router/admin.routes.tsx =================
import { Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/layouts/admin/AdminLayout'
import { ProtectedRoute } from '@/components/common/ProtectedRoute'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { PlaceholderAdminPage } from '@/pages/admin/PlaceholderAdminPage'
import { SpecialtyListPage } from '@/pages/admin/specialties/SpecialtyListPage'
import { PackageListPage } from '@/pages/admin/packages/PackageListPage'
import { DoctorListPage } from '@/pages/admin/doctors/DoctorListPage'
import { UserListPage } from '@/pages/admin/users/UserListPage'
import { ArticleListPage } from '@/pages/admin/articles/ArticleListPage'
import { BannerListPage } from '@/pages/admin/banners/BannerListPage'
import { ScheduleListPage } from '@/pages/admin/schedules/ScheduleListPage'
import { DoctorSchedulePage } from '@/pages/doctor/schedules/DoctorSchedulePage'
import { AppointmentListPage } from '@/pages/admin/appointments/AppointmentListPage'
import { MedicalRecordListPage } from '@/pages/admin/medical-record'
import { OrderListPage } from '@/pages/admin/order'
import { CartListPage } from '@/pages/admin/cart'

/**
 * Danh sách toàn bộ các tuyến đường (routes) của phân hệ Quản trị Portal
 * Triển khai theo Phương án 2 (Role-Prefixed Mirror Routes):
 * - Tuyến đường /admin/* : Dành riêng cho ADMIN (Toàn quyền quản trị viện)
 * - Tuyến đường /doctor/*: Dành riêng cho DOCTOR (Chuyên môn y tế, không dính tiền tố admin)
 */
export const AdminRoutes = (
  <>
    {/* ── 1. PHÂN HỆ QUẢN TRỊ VIÊN HỆ THỐNG (ADMIN) ── */}
    <Route
      path="/admin"
      element={
        <ProtectedRoute allowedRoles={['ADMIN']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/admin/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="specialties" element={<SpecialtyListPage />} />
      <Route path="packages" element={<PackageListPage />} />
      <Route path="doctors" element={<DoctorListPage />} />
      <Route path="users" element={<UserListPage />} />
      <Route path="schedules" element={<ScheduleListPage />} />
      <Route path="appointments" element={<AppointmentListPage />} />
      <Route path="medical-records" element={<MedicalRecordListPage />} />
      <Route path="prescriptions" element={<MedicalRecordListPage />} />
      <Route path="orders" element={<OrderListPage />} />
      <Route path="carts" element={<CartListPage />} />
      <Route path="articles" element={<ArticleListPage />} />
      <Route path="banners" element={<BannerListPage />} />
      <Route path="settings" element={<PlaceholderAdminPage />} />
    </Route>

    {/* ── 2. PHÂN HỆ CHUYÊN MÔN BÁC SĨ (DOCTOR) ── */}
    <Route
      path="/doctor"
      element={
        <ProtectedRoute allowedRoles={['DOCTOR']}>
          <AdminLayout />
        </ProtectedRoute>
      }
    >
      <Route index element={<Navigate to="/doctor/dashboard" replace />} />
      <Route path="dashboard" element={<DashboardPage />} />
      <Route path="schedules" element={<DoctorSchedulePage />} />
      <Route path="appointments" element={<AppointmentListPage />} />
      <Route path="medical-records" element={<MedicalRecordListPage />} />
      <Route path="prescriptions" element={<MedicalRecordListPage />} />
      <Route path="articles" element={<ArticleListPage />} />
    </Route>
  </>
)
