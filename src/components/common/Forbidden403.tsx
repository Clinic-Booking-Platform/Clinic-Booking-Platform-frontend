// ================= FILE: src/components/common/Forbidden403.tsx =================
import React from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ShieldAlert,
  ArrowLeft,
  LayoutDashboard,
  CalendarCheck,
  Stethoscope,
  Lock,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/hooks/useAuth'
import type { RoleType } from '@/types/navigation.types'

interface Forbidden403Props {
  userRole?: RoleType
  requiredRoles?: RoleType[]
}

export const Forbidden403: React.FC<Forbidden403Props> = ({
  userRole = 'DOCTOR',
}) => {
  const navigate = useNavigate()
  const { user } = useAuth()

  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center p-4 text-center animate-in fade-in-50 duration-300">
      <div className="w-full max-w-lg bg-card rounded-2xl border border-border/80 p-6 sm:p-8 shadow-xl shadow-black/5 relative overflow-hidden">
        {/* Glow effect background */}
        <div className="absolute -top-16 -right-16 size-40 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 size-40 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

        {/* Icon cảnh báo */}
        <div className="relative mx-auto mb-5 flex size-20 items-center justify-center rounded-3xl bg-gradient-to-br from-amber-500/15 via-rose-500/15 to-rose-600/20 text-rose-600 dark:text-rose-400 border border-rose-500/20 shadow-inner">
          <ShieldAlert className="size-10" />
          <div className="absolute -bottom-1 -right-1 flex size-6 items-center justify-center rounded-full bg-rose-600 text-white shadow">
            <Lock className="size-3" />
          </div>
        </div>

        {/* Mã lỗi & Tiêu đề */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-500/20 mb-3">
          <span>Lỗi 403</span>
          <span>•</span>
          <span>Truy cập bị từ chối</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
          Không có quyền truy cập
        </h1>

        <p className="mt-2 text-xs sm:text-sm text-muted-foreground leading-relaxed max-w-md mx-auto">
          {userRole === 'DOCTOR' ? (
            <>
              Tài khoản <strong className="text-foreground">Bác sĩ chuyên khoa</strong> của bạn không được phân quyền truy cập vào danh mục quản trị hệ thống này. Khu vực này chỉ dành riêng cho <strong className="text-foreground">Quản trị viên (ADMIN)</strong>.
            </>
          ) : (
            <>
              Tài khoản của bạn không đủ đặc quyền truy cập trang này. Vui lòng liên hệ Quản trị viên hệ thống để được cấp quyền.
            </>
          )}
        </p>

        {/* Thẻ người dùng hiện tại */}
        {user && (
          <div className="mt-5 rounded-xl border border-border/70 bg-muted/30 p-3.5 flex items-center justify-between text-left text-xs">
            <div className="flex items-center gap-3">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.full_name}
                  className="size-9 rounded-full object-cover border border-teal-500/30"
                />
              ) : (
                <div className="flex size-9 items-center justify-center rounded-full bg-teal-500/15 text-teal-600 font-bold">
                  {user.full_name.charAt(0)}
                </div>
              )}
              <div className="min-w-0">
                <p className="font-semibold text-foreground truncate">{user.full_name}</p>
                <p className="text-[11px] text-muted-foreground truncate">{user.email}</p>
              </div>
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold bg-teal-500/10 text-teal-700 dark:text-teal-300 border border-teal-500/20 shrink-0">
              <Stethoscope className="size-3" />
              <span>{user.role === 'DOCTOR' ? 'Bác sĩ' : user.role}</span>
            </div>
          </div>
        )}

        {/* Nút hành động */}
        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <Button
            type="button"
            onClick={() => navigate(userRole === 'DOCTOR' ? '/doctor/dashboard' : '/admin/dashboard')}
            className="w-full sm:w-auto h-9 px-4 bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs gap-1.5 cursor-pointer shadow-sm shadow-teal-600/20"
          >
            <LayoutDashboard className="size-3.5" />
            <span>Về Bàn làm việc</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(userRole === 'DOCTOR' ? '/doctor/appointments' : '/admin/appointments')}
            className="w-full sm:w-auto h-9 px-3.5 text-xs gap-1.5 cursor-pointer"
          >
            <CalendarCheck className="size-3.5" />
            <span>Lịch hẹn của tôi</span>
          </Button>

          <Button
            type="button"
            variant="ghost"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto h-9 px-3 text-xs gap-1 text-muted-foreground hover:text-foreground cursor-pointer"
          >
            <ArrowLeft className="size-3.5" />
            <span>Quay lại</span>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Forbidden403
