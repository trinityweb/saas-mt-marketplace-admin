import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

export interface MenuItem {
  id: string
  label: string
  href?: string
  icon?: LucideIcon
  submenu?: MenuItem[]
  badge?: string | number
  external?: boolean
}

export interface SidebarTheme {
  primaryColor: 'purple' | 'blue' | 'green' | 'red' | 'orange'
  logoIcon?: ReactNode
  logoText?: string
  title: string
}

export interface SidebarBehavior {
  collapsible: boolean
  externalControl?: boolean
  usePopoverWhenCollapsed?: boolean
  defaultCollapsed?: boolean
}

export interface SidebarUser {
  displayName: string
  avatarUrl?: string
  avatarComponent?: ReactNode
}

export interface SidebarConfig {
  theme: SidebarTheme
  menuItems: MenuItem[]
  behavior: SidebarBehavior
  user: SidebarUser
  footerContent?: ReactNode
}

export interface AdminSidebarProps {
  config: SidebarConfig
  isCollapsed?: boolean // Solo si externalControl es true
  onToggle?: () => void // Solo si externalControl es true
}

// Color mapping for theme
export const themeColors = {
  purple: {
    primary: 'bg-purple-600 hover:bg-purple-700',
    light: 'bg-purple-50 text-purple-700',
    text: 'text-purple-600',
    hover: 'hover:bg-purple-50',
  },
  blue: {
    primary: 'bg-blue-600 hover:bg-blue-700',
    light: 'bg-blue-50 text-blue-700',
    text: 'text-blue-600',
    hover: 'hover:bg-blue-50',
  },
  green: {
    primary: 'bg-green-600 hover:bg-green-700',
    light: 'bg-green-50 text-green-700',
    text: 'text-green-600',
    hover: 'hover:bg-green-50',
  },
  red: {
    primary: 'bg-red-600 hover:bg-red-700',
    light: 'bg-red-50 text-red-700',
    text: 'text-red-600',
    hover: 'hover:bg-red-50',
  },
  orange: {
    primary: 'bg-orange-600 hover:bg-orange-700',
    light: 'bg-orange-50 text-orange-700',
    text: 'text-orange-600',
    hover: 'hover:bg-orange-50',
  },
}