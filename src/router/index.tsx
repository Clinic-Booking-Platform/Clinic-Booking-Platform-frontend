// ================= FILE: src/router/index.tsx =================
import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminRoutes } from './admin.routes'
import { useAuth } from '@/hooks/useAuth'

/**
 * Điều hướng thông minh tại trang chủ / hoặc 404 dựa trên vai trò người dùng
 */
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuth()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (user.role === 'DOCTOR') {
    return <Navigate to="/doctor/dashboard" replace />
  }

  if (user.role === 'ADMIN') {
    return <Navigate to="/admin/dashboard" replace />
  }

  return <Navigate to="/login" replace />
}

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Tuyến đường Đăng nhập (Auth) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Toàn bộ các tuyến đường Portal Quản trị (/admin/*) & Bác sĩ (/doctor/*) */}
        {AdminRoutes}

        {/* 3. Bí danh điều hướng linh hoạt */}
        <Route path="/dashboard" element={<RootRedirect />} />

        {/* 4. Điều hướng mặc định */}
        <Route path="/" element={<RootRedirect />} />

        {/* 5. Điều hướng các đường dẫn không hợp lệ (404 Fallback) */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
