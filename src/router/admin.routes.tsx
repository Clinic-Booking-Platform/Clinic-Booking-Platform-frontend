import { Route, Navigate } from 'react-router-dom'
import { AdminLayout } from '@/layouts/admin/AdminLayout'
import { DashboardPage } from '@/pages/admin/DashboardPage'
import { PlaceholderAdminPage } from '@/pages/admin/PlaceholderAdminPage'
import { SpecialtyListPage } from '@/pages/admin/specialties/SpecialtyListPage'
import { PackageListPage } from '@/pages/admin/packages/PackageListPage'
import { DoctorListPage } from '@/pages/admin/doctors/DoctorListPage'
import { UserListPage } from '@/pages/admin/users/UserListPage'
import { ArticleListPage } from '@/pages/admin/articles/ArticleListPage'
import { BannerListPage } from '@/pages/admin/banners/BannerListPage'
import { ScheduleListPage } from '@/pages/admin/schedules/ScheduleListPage'
import { AppointmentListPage } from '@/pages/admin/appointments/AppointmentListPage'
import { MedicalRecordListPage } from '@/pages/admin/medical-record'

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
    <Route path="specialties" element={<SpecialtyListPage />} />
    <Route path="packages" element={<PackageListPage />} />

    {/* Nhóm 3: TÀI KHOẢN & NHÂN SỰ (Users & Doctors) */}
    <Route path="doctors" element={<DoctorListPage />} />
    <Route path="users" element={<UserListPage />} />

    {/* Nhóm 4: VẬN HÀNH & LỊCH HẸN (Operations) */}
    <Route path="schedules" element={<ScheduleListPage />} />
    <Route path="appointments" element={<AppointmentListPage />} />
    <Route path="medical-records" element={<MedicalRecordListPage />} />
    <Route path="prescriptions" element={<MedicalRecordListPage />} />

    {/* Nhóm 5: ĐƠN HÀNG & GIAO DỊCH (Finance & Orders) */}
    <Route path="orders" element={<PlaceholderAdminPage />} />
    <Route path="carts" element={<PlaceholderAdminPage />} />

    {/* Nhóm 6: NỘI DUNG & TRUYỀN THÔNG (CMS / Marketing) */}
    <Route path="articles" element={<ArticleListPage />} />
    <Route path="banners" element={<BannerListPage />} />

    {/* Nhóm 7: HỆ THỐNG */}
    <Route path="settings" element={<PlaceholderAdminPage />} />
  </Route>
)
