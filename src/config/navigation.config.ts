// ================= FILE: src/config/navigation.config.ts =================
import {
  LayoutDashboard,
  Clock,
  CalendarCheck,
  FileText,
  Pill,
  Newspaper,
  UserCheck,
  Users,
  Activity,
  Package,
  ReceiptText,
  ShoppingCart,
  Image as ImageIcon,
} from 'lucide-react'
import type { NavSection, RoleType, BreadcrumbInfo } from '@/types/navigation.types'

/**
 * Cấu hình Navigation tập trung cho toàn bộ Dashboard Portal (Admin & Bác sĩ)
 * Hỗ trợ Phương án 2 (Role-Prefixed Mirror Routes):
 * - ADMIN: Sử dụng tiền tố /admin/...
 * - DOCTOR: Sử dụng tiền tố /doctor/... (chuyên biệt y tế, không dính admin)
 */
export const dashboardNavigation: NavSection[] = [
  // ── NHÓM 1: TỔNG QUAN ──
  {
    roles: ['ADMIN', 'DOCTOR'],
    items: [
      {
        title: 'Tổng quan',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
        roles: ['ADMIN', 'DOCTOR'],
        description: 'Thống kê tổng quan hoạt động và ca khám',
      },
    ],
  },

  // ── NHÓM 2: KHÁM CHỮA BỆNH & LỊCH TRÌNH ──
  {
    sectionTitle: 'Khám chữa bệnh & Lịch trình',
    roles: ['ADMIN', 'DOCTOR'],
    items: [
      {
        title: 'Lịch làm việc',
        path: '/admin/schedules',
        icon: Clock,
        roles: ['ADMIN', 'DOCTOR'],
        description: 'Lịch trực và cấu hình ca khám bác sĩ',
      },
      {
        title: 'Lịch hẹn khám',
        path: '/admin/appointments',
        icon: CalendarCheck,
        roles: ['ADMIN', 'DOCTOR'],
        description: 'Tiếp nhận, xác nhận và xử lý lịch hẹn khám',
      },
      {
        title: 'Hồ sơ bệnh án',
        path: '/admin/medical-records',
        icon: FileText,
        roles: ['ADMIN', 'DOCTOR'],
        badge: { text: 'Bệnh án', variant: 'outline' },
        description: 'Lịch sử khám bệnh và bệnh án điện tử đã ký số',
      },
      {
        title: 'Đơn thuốc',
        path: '/admin/prescriptions',
        icon: Pill,
        roles: ['ADMIN', 'DOCTOR'],
        badge: { text: 'Kê đơn', variant: 'outline' },
        description: 'Danh mục đơn thuốc đính kèm theo bệnh án',
      },
    ],
  },

  // ── NHÓM 3: NỘI DUNG Y KHOA ──
  {
    sectionTitle: 'Nội dung',
    roles: ['ADMIN', 'DOCTOR'],
    items: [
      {
        title: 'Bài viết y khoa',
        path: '/admin/articles',
        icon: Newspaper,
        roles: ['ADMIN', 'DOCTOR'],
        description: 'Tin tức y khoa, cẩm nang sức khỏe & hướng dẫn điều trị',
      },
    ],
  },

  // ── NHÓM 4: QUẢN TRỊ HỆ THỐNG & VẬN HÀNH (CHỈ ADMIN) ──
  {
    sectionTitle: 'Quản trị hệ thống',
    roles: ['ADMIN'],
    items: [
      {
        title: 'Quản lý Bác sĩ',
        path: '/admin/doctors',
        icon: UserCheck,
        roles: ['ADMIN'],
        description: 'Hồ sơ bác sĩ, phân chuyên khoa, xét duyệt tài khoản',
      },
      {
        title: 'Quản lý Bệnh nhân',
        path: '/admin/users',
        icon: Users,
        roles: ['ADMIN'],
        description: 'Danh sách bệnh nhân và tài khoản người dùng',
      },
      {
        title: 'Chuyên khoa',
        path: '/admin/specialties',
        icon: Activity,
        roles: ['ADMIN'],
        description: 'Danh mục chuyên khoa khám chữa bệnh',
      },
      {
        title: 'Gói khám bệnh',
        path: '/admin/packages',
        icon: Package,
        roles: ['ADMIN'],
        description: 'Quản lý các gói khám định kỳ và dịch vụ y tế',
      },
      {
        title: 'Quản lý Đơn hàng',
        path: '/admin/orders',
        icon: ReceiptText,
        roles: ['ADMIN'],
        badge: { text: 'VNPay', variant: 'teal' },
        description: 'Đơn thanh toán gói khám, tra cứu đối soát giao dịch',
      },
      {
        title: 'Quản lý Giỏ hàng',
        path: '/admin/carts',
        icon: ShoppingCart,
        roles: ['ADMIN'],
        badge: { text: 'Chỉ xem', variant: 'secondary' },
        description: 'Giám sát giỏ hàng của người dùng trên toàn hệ thống',
      },
      {
        title: 'Banner quảng cáo',
        path: '/admin/banners',
        icon: ImageIcon,
        roles: ['ADMIN'],
        description: 'Banner trang chủ, chiến dịch truyền thông y tế',
      },
    ],
  },
]

/**
 * Lọc danh sách Section và Item theo Role người dùng hiện tại
 * Với DOCTOR: Tự động ánh xạ tiền tố /admin/... thành /doctor/...
 */
export function getVisibleNavSections(role: RoleType): NavSection[] {
  return dashboardNavigation
    .filter((section) => section.roles.includes(role))
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => item.roles.includes(role))
        .map((item) => {
          if (role === 'DOCTOR') {
            return {
              ...item,
              path: item.path.replace(/^\/admin/, '/doctor'),
            }
          }
          return item
        }),
    }))
    .filter((section) => section.items.length > 0)
}

/**
 * Kiểm tra xem một đường dẫn cụ thể có được phép truy cập bởi role này không
 */
export function isPathAllowedForRole(pathname: string, role: RoleType): boolean {
  if (role === 'DOCTOR') {
    // Bác sĩ không được phép truy cập các URL bắt đầu bằng /admin
    if (pathname.startsWith('/admin')) return false

    const normalizedPath = pathname.replace(/^\/doctor/, '/admin')
    for (const section of dashboardNavigation) {
      for (const item of section.items) {
        if (normalizedPath === item.path || normalizedPath.startsWith(`${item.path}/`)) {
          return item.roles.includes('DOCTOR')
        }
      }
    }
    return false
  }

  if (role === 'ADMIN') {
    // Admin toàn quyền ở các route /admin
    if (pathname.startsWith('/admin')) return true
  }

  return false
}

/**
 * Tìm kiếm thông tin breadcrumb từ pathname (hỗ trợ cả /admin/... và /doctor/...)
 */
export function getNavBreadcrumb(pathname: string): BreadcrumbInfo | null {
  // Chuẩn hóa đường dẫn về /admin để tra cứu thông tin
  const normalizedPath = pathname.replace(/^\/doctor/, '/admin')

  for (const section of dashboardNavigation) {
    for (const item of section.items) {
      if (normalizedPath === item.path || normalizedPath.startsWith(`${item.path}/`)) {
        const isDoctorRoute = pathname.startsWith('/doctor')
        return {
          groupName: section.sectionTitle || 'Tổng quan',
          itemTitle: item.title,
          path: isDoctorRoute ? item.path.replace(/^\/admin/, '/doctor') : item.path,
          description: item.description,
        }
      }
    }
  }
  return null
}
