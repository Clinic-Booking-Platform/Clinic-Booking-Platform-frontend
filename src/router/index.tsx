import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from '@/pages/auth/LoginPage'
import { AdminRoutes } from './admin.routes'

export const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* 1. Tuyến đường Đăng nhập (Auth) */}
        <Route path="/login" element={<LoginPage />} />

        {/* 2. Toàn bộ các tuyến đường Quản trị (Admin Dashboard) */}
        {AdminRoutes}

        {/* 3. Điều hướng mặc định */}
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

        {/* 4. Điều hướng các đường dẫn không hợp lệ (404 Fallback) */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRouter
