// ================= FILE: src/pages/admin/DashboardPage.tsx =================
import React from 'react'
import { useNavigate } from 'react-router-dom'
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
  FileText,
  Pill,
  Video,
  Stethoscope,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useAuth } from '@/hooks/useAuth'

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const { user, isDoctor } = useAuth()

  // ─────────────────────────────────────────────────────────────
  // 1. DỮ LIỆU DÀNH CHO ADMIN (TOÀN VIỆN)
  // ─────────────────────────────────────────────────────────────
  const adminStats = [
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

  const recentAdminAppointments = [
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

  const topSpecialties = [
    { name: 'Khám Tim Mạch Kỹ Thuật Cao', appointments: 420, percent: 84 },
    { name: 'Nhi Khoa & Tiêm Chủng Mở Rộng', appointments: 360, percent: 72 },
    { name: 'Da Liễu & Thẩm Mỹ Y Khoa', appointments: 295, percent: 59 },
    { name: 'Khám Tai Mũi Họng Nội Soi', appointments: 210, percent: 42 },
    { name: 'Nội Tổng Quát & Tầm Soát', appointments: 135, percent: 27 },
  ]

  // ─────────────────────────────────────────────────────────────
  // 2. DỮ LIỆU DÀNH CHO BÁC SĨ (CÁ NHÂN & CHUYÊN MÔN)
  // ─────────────────────────────────────────────────────────────
  const doctorStats = [
    {
      title: 'Ca Trực Tuần Này',
      value: '6 ca',
      change: 'Ca kế tiếp: Chiều nay',
      isPositive: true,
      subtext: 'Thứ 4, Thứ 5, Thứ 6, Thứ 7',
      icon: Clock,
      color: 'teal',
    },
    {
      title: 'Lịch Khám Hôm Nay',
      value: '8 bệnh nhân',
      change: '3 hoàn tất',
      isPositive: true,
      subtext: '5 bệnh nhân đang chờ',
      icon: CalendarCheck,
      color: 'emerald',
    },
    {
      title: 'Bệnh Án Chờ Ký Số',
      value: '3 hồ sơ',
      change: 'Cần ký duyệt',
      isPositive: false,
      subtext: 'Đã khám xong sáng nay',
      icon: FileText,
      color: 'amber',
    },
    {
      title: 'Đơn Thuốc Đã Kê',
      value: '24 đơn',
      change: '+6 đơn so với tuần trước',
      isPositive: true,
      subtext: 'Trong 7 ngày qua',
      icon: Pill,
      color: 'blue',
    },
  ]

  const doctorTodayPatients = [
    {
      id: 'LH-DOC-01',
      patientName: 'Trần Văn Mạnh',
      phone: '0978 123 456',
      time: '08:30 - 09:30',
      type: 'ONLINE',
      symptoms: 'Khó thở nhẹ, đau thắt ngực khi gắng sức',
      status: 'Đã khám',
      statusVariant: 'secondary',
    },
    {
      id: 'LH-DOC-02',
      patientName: 'Lê Thị Thu Thảo',
      phone: '0912 987 654',
      time: '09:30 - 10:30',
      type: 'OFFLINE',
      symptoms: 'Tái khám huyết áp và đo điện tim đồ định kỳ',
      status: 'Đang chờ',
      statusVariant: 'default',
    },
    {
      id: 'LH-DOC-03',
      patientName: 'Hoàng Minh Tuấn',
      phone: '0934 555 888',
      time: '10:30 - 11:30',
      type: 'ONLINE',
      symptoms: 'Tư vấn kết quả xét nghiệm mỡ máu và men gan',
      status: 'Đang chờ',
      statusVariant: 'default',
    },
    {
      id: 'LH-DOC-04',
      patientName: 'Nguyễn Thị Ngọc',
      phone: '0981 222 333',
      time: '14:00 - 15:00',
      type: 'OFFLINE',
      symptoms: 'Đau đầu âm ỉ kéo dài kèm chóng mặt buổi sáng',
      status: 'Đã đặt',
      statusVariant: 'outline',
    },
  ]

  const pendingRecords = [
    {
      id: 'BA-2026-081',
      patientName: 'Trần Văn Mạnh',
      diagnosis: 'Tăng huyết áp vô căn độ 2, Rối loạn lipid máu',
      time: 'Sáng nay 09:15',
    },
    {
      id: 'BA-2026-079',
      patientName: 'Nguyễn Hữu Đạt',
      diagnosis: 'Viêm dạ dày tá tràng mạn tính kèm trào ngược',
      time: 'Hôm qua 16:30',
    },
    {
      id: 'BA-2026-078',
      patientName: 'Phạm Thị Thúy',
      diagnosis: 'Hội chứng ống cổ tay hai bên mức độ nhẹ',
      time: 'Hôm qua 14:00',
    },
  ]

  // ─────────────────────────────────────────────────────────────
  // RENDER GIAO DIỆN BÁC SĨ (DOCTOR)
  // ─────────────────────────────────────────────────────────────
  if (isDoctor) {
    return (
      <div className="space-y-6">
        {/* Header Bác Sĩ */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                Bàn Làm Việc Bác Sĩ
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20">
                <Stethoscope className="size-3" />
                <span>Bác sĩ chuyên khoa</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Chào mừng, <strong className="text-foreground">{user?.full_name || 'Bác sĩ'}</strong>. Dưới đây là ca trực và bệnh nhân cần tiếp nhận hôm nay.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/doctor/schedules')}
              className="gap-1.5 text-xs cursor-pointer"
            >
              <Clock className="size-3.5 text-teal-600 dark:text-teal-400" />
              <span>Đăng ký ca trực</span>
            </Button>
            <Button
              size="sm"
              onClick={() => navigate('/doctor/appointments')}
              className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm shadow-teal-600/20"
            >
              <CalendarCheck className="size-3.5" />
              <span>Xem tất cả ca hẹn</span>
            </Button>
          </div>
        </div>

        {/* 4 Thẻ Thống Kê Cá Nhân Bác Sĩ */}
        <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {doctorStats.map((stat, index) => {
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
                  <div
                    className={`flex items-center text-xs font-semibold ${
                      stat.isPositive
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}
                  >
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

        {/* Nội dung chuyên môn Bác sĩ */}
        <div className="grid gap-6 lg:grid-cols-7">
          {/* Cột Trái (4 phần): Bệnh nhân hẹn khám của Bác sĩ hôm nay */}
          <div className="lg:col-span-4 rounded-xl border border-border/80 bg-card shadow-xs overflow-hidden">
            <div className="p-4 sm:p-5 border-b border-border/60 flex items-center justify-between">
              <div>
                <h2 className="text-sm sm:text-base font-bold text-foreground">
                  Danh Sách Bệnh Nhân Hôm Nay
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Lịch khám do bệnh nhân đặt lịch với bạn trong ngày
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/doctor/appointments')}
                className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 cursor-pointer"
              >
                Xem chi tiết <ArrowUpRight className="size-3 ml-1" />
              </Button>
            </div>

            <div className="divide-y divide-border/40">
              {doctorTodayPatients.map((patient) => (
                <div
                  key={patient.id}
                  className="p-4 hover:bg-muted/20 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-foreground text-sm">
                        {patient.patientName}
                      </span>
                      <span className="text-muted-foreground font-mono text-[11px]">
                        ({patient.phone})
                      </span>
                      {patient.type === 'ONLINE' ? (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-blue-500/10 text-blue-700 dark:text-blue-300 border border-blue-500/20">
                          <Video className="size-2.5" />
                          <span>Online</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20">
                          <span>Trực tiếp</span>
                        </span>
                      )}
                    </div>
                    <p className="text-muted-foreground text-[11px] line-clamp-1">
                      {patient.symptoms}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-muted-foreground">
                      <Clock className="size-3 text-teal-600" />
                      <span>Khung giờ: <strong>{patient.time}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Badge
                      variant={patient.statusVariant as 'default' | 'secondary' | 'outline'}
                      className="text-[11px]"
                    >
                      {patient.status}
                    </Badge>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => navigate('/doctor/medical-records')}
                      className="h-7 px-2.5 text-xs text-teal-600 hover:text-teal-700 cursor-pointer"
                    >
                      Bệnh án
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Cột Phải (3 phần): Bệnh án chờ ký duyệt & Ca trực kế tiếp */}
          <div className="lg:col-span-3 space-y-5">
            {/* Thẻ Bệnh án chờ ký số */}
            <div className="rounded-xl border border-border/80 bg-card p-4 sm:p-5 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-border/60 pb-2.5">
                <div className="flex items-center gap-2">
                  <FileText className="size-4 text-amber-500" />
                  <h2 className="text-sm sm:text-base font-bold text-foreground">
                    Bệnh Án Chờ Ký Đóng
                  </h2>
                </div>
                <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20">
                  3 hồ sơ
                </span>
              </div>

              <div className="space-y-2.5 pt-1">
                {pendingRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-2.5 rounded-lg border border-border/60 bg-muted/20 hover:bg-muted/40 transition-colors text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{rec.patientName}</span>
                      <span className="text-[10px] text-muted-foreground">{rec.time}</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground truncate">{rec.diagnosis}</p>
                    <div className="pt-1 flex justify-end">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => navigate('/doctor/medical-records')}
                        className="h-6 px-2 text-[11px] text-teal-600 dark:text-teal-400 hover:text-teal-700 cursor-pointer"
                      >
                        Ký đóng hồ sơ →
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Banner Ca trực tiếp theo */}
            <div className="rounded-xl border border-teal-500/30 bg-teal-50/50 dark:bg-teal-950/20 p-4 text-xs text-foreground">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="size-4 text-teal-600 dark:text-teal-400 mt-0.5 shrink-0" />
                <div>
                  <p className="font-semibold text-teal-900 dark:text-teal-200">
                    Ca trực tiếp theo: Chiều nay (13:30 - 17:00)
                  </p>
                  <p className="text-muted-foreground mt-1 text-[11px] leading-relaxed">
                    Phòng khám số 04 • Chuyên khoa Tim mạch. Hiện đã có 4 bệnh nhân đặt hẹn trước cho ca chiều nay.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────────
  // RENDER GIAO DIỆN QUẢN TRỊ VIÊN (ADMIN TOÀN VIỆN)
  // ─────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* 1. Header Trang Admin */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Bảng Điều Khiển Quản Trị
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Tổng hợp dữ liệu vận hành phòng khám y tế toàn viện trong ngày hôm nay.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5 text-xs cursor-pointer">
            <FileSpreadsheet className="size-3.5 text-emerald-600" />
            <span className="hidden sm:inline">Xuất báo cáo</span>
          </Button>
          <Button
            size="sm"
            onClick={() => navigate('/admin/schedules')}
            className="gap-1.5 text-xs bg-teal-600 hover:bg-teal-700 text-white cursor-pointer shadow-sm shadow-teal-600/20"
          >
            <Plus className="size-3.5" />
            <span>Thêm ca trực mới</span>
          </Button>
        </div>
      </div>

      {/* 2. Grid 4 Thẻ Thống Kê Chính Toàn Viện */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminStats.map((stat, index) => {
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

      {/* 3. Phần Nội Dung Kép Admin */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Cột Trái (4 phần): Bảng lịch hẹn gần nhất toàn viện */}
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
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/admin/appointments')}
              className="text-xs text-teal-600 dark:text-teal-400 hover:text-teal-700 cursor-pointer"
            >
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
                {recentAdminAppointments.map((apt) => (
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

export default DashboardPage
