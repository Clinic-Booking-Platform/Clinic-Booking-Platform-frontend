import { create } from 'zustand'

export type User = {
  id: number
  full_name: string
  name?: string
  email: string
  phone_number: string
  avatar: string
  avatarUrl?: string
  roleId: number
  role: 'ADMIN' | 'USER' | 'DOCTOR'
}

export const defaultAdminUser: User = {
  id: 1,
  full_name: 'BS. Lê Minh Trí',
  name: 'BS. Lê Minh Trí',
  email: 'admin.clinic@medicare.vn',
  phone_number: '0901 234 567',
  avatar: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80',
  roleId: 1,
  role: 'ADMIN',
}

interface AuthState {
  token: string | null
  user: User | null
  adminUser: User | null // Thuộc tính bí danh đồng bộ để thuận tiện cho Admin Portal
  isAuthenticated: boolean
  setLogin: (user: User, token: string) => void
  setLogout: () => void
  updateUserProfile: (partial: Partial<User>) => void
}

const StorageToken = typeof window !== 'undefined' ? localStorage.getItem('token') : null
const StorageUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null

function getInitialUser(): User | null {
  if (StorageUser) {
    try {
      return JSON.parse(StorageUser)
    } catch {
      return defaultAdminUser
    }
  }
  return defaultAdminUser
}

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = getInitialUser()

  return {
    token: StorageToken || null,
    user: initialUser,
    adminUser: initialUser,
    isAuthenticated: Boolean(StorageToken || initialUser),

    setLogin: (user: User, token: string) => {
      localStorage.setItem('user', JSON.stringify(user))
      localStorage.setItem('token', token)
      set({
        user,
        adminUser: user,
        token,
        isAuthenticated: true,
      })
    },

    setLogout: () => {
      localStorage.removeItem('user')
      localStorage.removeItem('token')
      set({
        user: null,
        adminUser: null,
        token: null,
        isAuthenticated: false,
      })
    },

    updateUserProfile: (partial: Partial<User>) => {
      set((state) => {
        if (!state.user) return state
        const updated = { ...state.user, ...partial }
        localStorage.setItem('user', JSON.stringify(updated))
        return {
          user: updated,
          adminUser: updated,
        }
      })
    },
  }
})
