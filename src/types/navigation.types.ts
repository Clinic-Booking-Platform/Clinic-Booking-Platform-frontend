import type { LucideIcon } from 'lucide-react'

export type RoleType = 'ADMIN' | 'DOCTOR' | 'USER'

export interface MenuItem {
  title: string
  path: string
  icon: LucideIcon
  roles: RoleType[] // Danh sách các Role được phép xem và truy cập mục này
  badge?: {
    text: string | number
    variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'teal'
  }
  description?: string
  isSectionHeader?: boolean // Phân cách nhóm menu
  children?: MenuItem[] // Menu con đa cấp nếu có
}

export interface NavSection {
  sectionTitle?: string
  roles: RoleType[]
  items: MenuItem[]
}

export interface BreadcrumbInfo {
  groupName: string
  itemTitle: string
  path?: string
  description?: string
}
