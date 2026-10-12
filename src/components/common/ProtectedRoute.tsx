// ================= FILE: src/components/common/ProtectedRoute.tsx =================
import React from 'react'
import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import type { RoleType } from '@/types/navigation.types'
import { Forbidden403 } from './Forbidden403'

export interface ProtectedRouteProps {
  children?: React.ReactNode
  allowedRoles?: RoleType[]
}

/**
 * Route Guard bảo vệ các tuyến đường theo nguyên tắc Defense-in-Depth:
 * 1. Kiểm tra xác thực (Authenticated)
 * 2. Ngăn chặn tài khoản USER (Bệnh nhân) truy cập Dashboard
 * 3. Kiểm tra danh sách allowedRoles: Nếu Bác sĩ truy cập trang Admin -> Render 403 Forbidden
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // 1. Đang kiểm tra phiên đăng nhập
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-teal-600 border-t-transparent" />
          <p className="text-xs text-muted-foreground font-medium">Đang xác thực quyền truy cập...</p>
        </div>
      </div>
    )
  }

  // 2. Chưa đăng nhập -> Chuyển hướng đến trang Login kèm vị trí trước đó
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  // 3. Tài khoản USER (Bệnh nhân) -> Điều hướng về trang chủ Client
  if (user.role === 'USER') {
    return <Navigate to="/" replace />
  }

  // 4. Nếu route yêu cầu phân quyền cụ thể và role người dùng không có trong allowedRoles -> 403
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Forbidden403 userRole={user.role} requiredRoles={allowedRoles} />
  }

  // 5. Đầy đủ quyền hợp lệ -> Render nội dung bên trong hoặc Outlet
  return <>{children || <Outlet />}</>
}

export default ProtectedRoute
