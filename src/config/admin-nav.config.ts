import {
  LayoutDashboard,
  Stethoscope,
  PackagePlus,
  UserCheck,
  Users,
  CalendarClock,
  CalendarDays,
  FileText,
  Pill,
  ReceiptText,
  ShoppingCart,
  Newspaper,
  Image as ImageIcon,
  Settings,
  type LucideIcon,
} from 'lucide-react'

export interface NavItem {
  title: string
  path: string
  icon: LucideIcon
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'teal'
  }
  description?: string
}

export interface NavGroup {
  groupTitle: string
  items: NavItem[]
}

export const ADMIN_NAV_GROUPS: NavGroup[] = [
  {
    groupTitle: 'TỔNG QUAN',
    items: [
      {
        title: 'Dashboard / Thống kê',
        path: '/admin/dashboard',
        icon: LayoutDashboard,
        description: 'Tổng hợp doanh thu, lượt khám, bác sĩ & bệnh nhân',
      },
    ],
  },
  {
    groupTitle: 'DANH MỤC Y TẾ',
    items: [
      {
        title: 'Quản lý Chuyên khoa',
        path: '/admin/specialties',
        icon: Stethoscope,
        description: 'Danh mục chuyên khoa khám chữa bệnh, upload ảnh icon',
      },
      {
        title: 'Gói khám & Dịch vụ',
        path: '/admin/packages',
        icon: PackagePlus,
        description: 'Quản lý các gói khám định kỳ và dịch vụ kỹ thuật cao',
      },
    ],
  },
  {
    groupTitle: 'TÀI KHOẢN & NHÂN SỰ',
    items: [
      {
        title: 'Quản lý Bác sĩ',
        path: '/admin/doctors',
        icon: UserCheck,
        badge: { text: '24 Bác sĩ', variant: 'secondary' },
        description: 'Hồ sơ bác sĩ, phân chuyên khoa, xét duyệt tài khoản',
      },
      {
        title: 'Quản lý Bệnh nhân',
        path: '/admin/users',
        icon: Users,
        description: 'Danh sách bệnh nhân, tài khoản người dùng, xóa mềm & khôi phục',
      },
    ],
  },
  {
    groupTitle: 'VẬN HÀNH & LỊCH HẸN',
    items: [
      {
        title: 'Lịch làm việc Bác sĩ',
        path: '/admin/schedules',
        icon: CalendarClock,
        description: 'Cấu hình ca trực theo ngày, tuần, hàng loạt cho bác sĩ',
      },
      {
        title: 'Quản lý Lịch hẹn khám',
        path: '/admin/appointments',
        icon: CalendarDays,
        badge: { text: '12 Mới', variant: 'destructive' },
        description: 'Tiếp nhận, xác nhận, điều phối hoặc hủy lịch khám bệnh',
      },
      {
        title: 'Hồ sơ Bệnh án',
        path: '/admin/medical-records',
        icon: FileText,
        badge: { text: 'Read-only', variant: 'outline' },
        description: 'Lịch sử khám bệnh và bệnh án điện tử đã ký số',
      },
      {
        title: 'Đơn thuốc',
        path: '/admin/prescriptions',
        icon: Pill,
        badge: { text: 'Read-only', variant: 'outline' },
        description: 'Tra cứu danh mục đơn thuốc đính kèm theo bệnh án',
      },
    ],
  },
  {
    groupTitle: 'ĐƠN HÀNG & GIAO DỊCH',
    items: [
      {
        title: 'Quản lý Đơn hàng',
        path: '/admin/orders',
        icon: ReceiptText,
        badge: { text: 'VNPay', variant: 'teal' },
        description: 'Đơn thanh toán gói khám, tra cứu đối soát giao dịch',
      },
      {
        title: 'Quản lý Giỏ hàng',
        path: '/admin/carts',
        icon: ShoppingCart,
        description: 'Theo dõi các yêu cầu đặt lịch hẹn đang chờ xử lý',
      },
    ],
  },
  {
    groupTitle: 'NỘI DUNG & TRUYỀN THÔNG',
    items: [
      {
        title: 'Quản lý Bài viết',
        path: '/admin/articles',
        icon: Newspaper,
        description: 'Tin tức y khoa, cẩm nang sức khỏe & hướng dẫn điều trị',
      },
      {
        title: 'Quản lý Banners',
        path: '/admin/banners',
        icon: ImageIcon,
        description: 'Banner trang chủ, chiến dịch truyền thông y tế',
      },
    ],
  },
  {
    groupTitle: 'HỆ THỐNG',
    items: [
      {
        title: 'Cài đặt hệ thống',
        path: '/admin/settings',
        icon: Settings,
        description: 'Thông tin phòng khám, phân quyền quản trị, bảo mật',
      },
    ],
  },
]

// Helper tìm kiếm thông tin breadcrumb từ pathname
export function getBreadcrumbFromPath(pathname: string): { groupName: string; itemTitle: string; description?: string } | null {
  for (const group of ADMIN_NAV_GROUPS) {
    for (const item of group.items) {
      if (pathname === item.path || pathname.startsWith(`${item.path}/`)) {
        return {
          groupName: group.groupTitle,
          itemTitle: item.title,
          description: item.description,
        }
      }
    }
  }
  return null
}
