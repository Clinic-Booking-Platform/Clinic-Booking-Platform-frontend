// ================= FILE: src/hooks/useAuth.ts =================
import { useAuthStore } from '@/stores/auth.store'
import type { RoleType } from '@/types/navigation.types'

/**
 * Custom Hook useAuth cung cấp toàn bộ thông tin xác thực,
 * phân quyền vai trò (Role-Based) và các hàm thao tác tài khoản
 */
export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    setLogin,
    setLogout,
    updateUserProfile,
  } = useAuthStore()

  const role = (user?.role || 'USER') as RoleType
  const isAdmin = role === 'ADMIN'
  const isDoctor = role === 'DOCTOR'
  const isUser = role === 'USER'

  return {
    user,
    token,
    isAuthenticated,
    isLoading: false, // State đồng bộ tức thì từ LocalStorage
    role,
    isAdmin,
    isDoctor,
    isUser,
    login: setLogin,
    logout: setLogout,
    updateUserProfile,
  }
}

export default useAuth
