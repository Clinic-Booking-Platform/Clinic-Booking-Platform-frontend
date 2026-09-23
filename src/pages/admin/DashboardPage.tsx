import React from 'react'
import {
  DollarSign,
  CalendarCheck,
  UserCheck,
  Users,
  TrendingUp,
  Plus,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const DashboardPage: React.FC = () => {
  // Mock dữ liệu thẻ thống kê tổng quan
  const stats = [
    {
      title: 'Tổng Doanh Thu Tháng',
      value: '248.500.000 đ',
      change: '+12.5%',
      isPositive: true,
      subtext: 'So với tháng trước',
      icon: DollarSign,
      color: 'teal',
    },
    {
      title: 'Số Lượt Khám Hoàn Tất',
      value: '1.420 ca',
      change: '+8.2%',
      isPositive: true,
      subtext: '98% đúng giờ hẹn',
      icon: CalendarCheck,
      color: 'blue',
    },
    {
      title: 'Bác Sĩ Đang Trực Tuyến',
      value: '24 / 28',
      change: '4 ca trực chiều',
      isPositive: true,
      subtext: 'Phân bố 8 chuyên khoa',
      icon: UserCheck,
      color: 'emerald',
    },
    {
      title: 'Bệnh Nhân Mới',
      value: '185 người',
      change: '+18.4%',
      isPositive: true,
      subtext: 'Tăng trong 7 ngày qua',
      icon: Users,
      color: 'indigo',
    },
  ]

  // Mock lịch hẹn gần nhất trong ngày
  const recentAppointments = [
    {
      id: 'LH-2026-0901',
      patientName: 'Nguyễn Hoàng Nam',
      phone: '0912 *** 889',
      doctor: 'BS. CKII Lê Văn Dũng',
      specialty: 'Tim mạch',
      time: '08:30 - 09:00',
      status: 'Đã xác nhận',
      statusVariant: 'secondary',
    },
    {
      id: 'LH-2026-0902',
      patientName: 'Trần Thị Thu Hà',
      phone: '0988 *** 123',
      doctor: 'ThS. BS Trần Minh Tâm',
      specialty: 'Nhi khoa',
      time: '09:00 - 09:30',
      status: 'Đang khám',
      statusVariant: 'default',
    },
    {
      id: 'LH-2026-0903',
      patientName: 'Phạm Quốc Bảo',
      phone: '0903 *** 776',
      doctor: 'BS. CKI Phạm Thị Mai',
      specialty: 'Da liễu',
      time: '10:00 - 10:30',
      status: 'Chờ tiếp nhận',
      statusVariant: 'outline',
    },
    {
      id: 'LH-2026-0904',
      patientName: 'Vũ Thanh Thảo',
      phone: '0934 *** 554',
      doctor: 'BS. CKII Lê Văn Dũng',
      specialty: 'Tim mạch',
      time: '11:00 - 11:30',
      status: 'Đã hủy',
      statusVariant: 'destructive',
    },
  ]

  // Mock chuyên khoa hàng đầu
  const topSpecialties = [
    { name: 'Khám Tim Mạch Kỹ Thuật Cao', appointments: 420, percent: 84 },
    { name: 'Nhi Khoa & Tiêm Chủng Mở Rộng', appointments: 360, percent: 72 },
    { name: 'Da Liễu & Thẩm Mỹ Y Khoa', appointments: 295, percent: 59 },
    { name: 'Khám Tai Mũi Họng Nội Soi', appointments: 210, percent: 42 },
    { name: 'Nội Tổng Quát & Tầm Soát', appointments: 135, percent: 27 },
  ]

  return (
    <div className="space-y-6">
      {/* 1. Header Trang & Phím tắt thao tác */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tổng hợp dữ liệu vận hành phòng khám y tế trong ngày hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs">
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </Button>
          <Button size="sm" className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white">
            <Plus className="size-3.5" />
            <span>Thêm ca trực mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Grid 4 Thẻ Thống Kê Chính (Bento Cards) */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div
              key={index}
              className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs hover:border-teal-500/40 transition-colors"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {stat.title}
                </span>
                <div className="flex size-9 items-center justify-center rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400">
                  <Icon className="size-4" />
                </div>
              </div>

              <div className="mt-3 flex items-baseline justify-between">
                <div className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                  {stat.value}
                </div>
                <div className="flex items-center text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                  <TrendingUp className="size-3 mr-0.5" />
                  {stat.change}
                </div>
              </div>

              <p className="mt-1 text-[11px] text-muted-foreground">
                {stat.subtext}
              </p>
            </div>
          )
        })}
      </div>

      {/* 3. Phần Nội Dung Kép: Danh Sách Lịch Hẹn & Thống Kê Chuyên Khoa */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Cột Trái (4 phần): Bảng lịch hẹn gần nhất */}
        <div className="lg:col-span-4 rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between">
            <div>
              <h2 className="text-sm sm:text-base font-bold text-foreground">
                Lịch Hẹn Khám Gần Nhất
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Các lượt đặt lịch cần bác sĩ và điều phối viên tiếp nhận hôm nay
              </p>
            </div>
            <Button variant="ghost" size="sm" className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700">
              Xem tất cả <ArrowUpRight className="size-3 ml-1" />
            </Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 text-muted-foreground uppercase text-[10px] tracking-wider border-b border-border/60">
                <tr>
                  <th className="py-2.5 px-4 font-semibold">Mã / Bệnh nhân</th>
                  <th className="py-2.5 px-4 font-semibold hidden sm:table-cell">Bác sĩ phụ trách</th>
                  <th className="py-2.5 px-4 font-semibold">Khung giờ</th>
                  <th className="py-2.5 px-4 font-semibold text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {recentAppointments.map((apt) => (
                  <tr key={apt.id} className="hover:bg-muted/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-foreground">{apt.patientName}</div>
                      <div className="text-[11px] text-muted-foreground font-mono">{apt.id}</div>
                    </td>
                    <td className="py-3 px-4 hidden sm:table-cell">
                      <div className="text-foreground font-medium">{apt.doctor}</div>
                      <div className="text-[11px] text-muted-foreground">{apt.specialty}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{apt.time}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <Badge
                        variant={apt.statusVariant as 'default' | 'secondary' | 'destructive' | 'outline'}
                        className="text-[11px]"
                      >
                        {apt.status}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Cột Phải (3 phần): Hiệu suất chuyên khoa & Lưu ý vận hành */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Chuyên Khoa */}
          <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs">
            <h2 className="text-sm sm:text-base font-bold text-foreground">
              Phân Bổ Lịch Khám Chuyên Khoa
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              Tỷ lệ lượt khám được đặt nhiều nhất trong tháng
            </p>

            <div className="space-y-3.5">
              {topSpecialties.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-foreground truncate max-w-[200px]">
                      {item.name}
                    </span>
                    <span className="text-muted-foreground font-mono font-medium">
                      {item.appointments} ca
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full rounded-full bg-teal-600 dark:bg-teal-400 transition-all duration-500"
                      style={{ width: `${item.percent}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Banner Lưu ý Vận Hành */}
          <div className="rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 p-4 text-xs text-foreground">
            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
              <div>
                <p className="font-semibold text-teal-900 dark:text-teal-200">
                  Cổng kết nối VNPay & SMS OTP hoạt động bình thường
                </p>
                <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                  Tất cả các dịch vụ xác thực đặt lịch tự động đang có độ trễ dưới 250ms. Không có sự cố thanh toán nào được ghi nhận.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
