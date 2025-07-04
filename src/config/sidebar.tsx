import { 
  Home, 
  Shield, 
  Crown, 
  UserCheck, 
  Users, 
  Settings, 
  Package, 
  Layers,
  Sliders,
  Award,
  BookOpen,
  FileText,
  BarChart3,
  ShoppingCart,
  Globe,
  User,
  LogOut
} from 'lucide-react'
import type { SidebarConfig } from '@/components/shared-ui/organisms/admin-sidebar'

export const marketplaceSidebarConfig: SidebarConfig = {
  theme: {
    primaryColor: 'purple',
    logoIcon: <Globe className="w-4 h-4 text-white" />,
    title: 'Marketplace'
  },
  behavior: {
    collapsible: true,
    externalControl: false,
    usePopoverWhenCollapsed: true,
    defaultCollapsed: false
  },
  user: {
    displayName: 'Admin'
  },
  menuItems: [
    {
      id: 'dashboard',
      label: 'Dashboard',
      href: '/',
      icon: Home
    },
    {
      id: 'iam',
      label: 'Identity & Access',
      icon: Shield,
      submenu: [
        {
          id: 'tenants',
          label: 'Tenants',
          href: '/iam/tenants',
          icon: Crown
        },
        {
          id: 'roles',
          label: 'Roles',
          href: '/iam/roles',
          icon: UserCheck
        },
        {
          id: 'plans',
          label: 'Planes',
          href: '/iam/plans',
          icon: Award
        }
      ]
    },
    {
      id: 'marketplace-pim',
      label: 'Marketplace PIM',
      icon: Package,
      submenu: [
        {
          id: 'taxonomy',
          label: 'Taxonomía',
          href: '/taxonomy',
          icon: Layers
        },
        {
          id: 'brands',
          label: 'Marcas',
          href: '/marketplace-brands',
          icon: Award
        },
        {
          id: 'catalog',
          label: 'Catálogo Global',
          href: '/global-catalog',
          icon: ShoppingCart
        },
        {
          id: 'attributes',
          label: 'Atributos',
          href: '/marketplace-attributes',
          icon: Sliders
        }
      ]
    },
    {
      id: 'quickstart',
      label: 'Quickstart Dinámico',
      icon: Award,
      submenu: [
        {
          id: 'business-types',
          label: 'Tipos de Negocio',
          href: '/business-types',
          icon: Package
        },
        {
          id: 'templates',
          label: 'Templates',
          href: '/business-type-templates',
          icon: FileText
        }
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      submenu: [
        {
          id: 'analytics-main',
          label: 'Analytics',
          href: '/analytics'
        },
        {
          id: 'reports',
          label: 'Reports',
          href: '/reports'
        }
      ]
    },
    {
      id: 'config',
      label: 'Configuración',
      icon: Settings,
      submenu: [
        {
          id: 'general',
          label: 'General',
          href: '/config/general'
        },
        {
          id: 'search',
          label: 'Búsqueda',
          href: '/config/search'
        }
      ]
    },
    {
      id: 'docs',
      label: 'Documentación',
      href: '/documentation',
      icon: BookOpen
    },
    {
      id: 'admin',
      label: 'Admin',
      icon: Users,
      submenu: [
        {
          id: 'profile',
          label: 'Perfil',
          href: '/profile',
          icon: User
        },
        {
          id: 'config',
          label: 'Configuración',
          href: '/settings',
          icon: Settings
        },
        {
          id: 'logout',
          label: 'Cerrar sesión',
          href: '/logout',
          icon: LogOut
        }
      ]
    }
  ]
}