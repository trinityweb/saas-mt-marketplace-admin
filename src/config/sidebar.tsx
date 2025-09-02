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
  LogOut,
  Database,
  Activity,
  Calendar,
  History,
  Sparkles,
  ListChecks,
  Clock,
  MessageSquare,
  Brain
} from 'lucide-react'
import type { SidebarConfig } from '@/components/shared-ui/types/sidebar'

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
      id: 'scraper',
      label: 'Sistema de Scraping',
      icon: Database,
      submenu: [
        {
          id: 'scraper-dashboard',
          label: 'Dashboard',
          href: '/scraper',
          icon: Activity
        },
        {
          id: 'curation',
          label: 'Curación de Productos',
          icon: Sparkles,
          submenu: [
            {
              id: 'curation-main',
              label: 'Panel de Curación',
              href: '/curation',
              icon: ListChecks
            },
            {
              id: 'curation-queue',
              label: 'Cola de Procesamiento',
              href: '/curation/queue',
              icon: Clock
            },
            {
              id: 'curation-history',
              label: 'Historial',
              href: '/curation/history',
              icon: History
            }
          ]
        },
        {
          id: 'scraper-products',
          label: 'Productos Scrapeados',
          href: '/scraper/products',
          icon: Package
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
      id: 'ai-management',
      label: 'Gestión de AI',
      icon: Brain,
      submenu: [
        {
          id: 'ai-prompts',
          label: 'Prompts de Agentes',
          href: '/ai-prompts',
          icon: MessageSquare
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
        },
        {
          id: 'profile',
          label: 'Mi Perfil',
          href: '/profile',
          icon: User
        },
        {
          id: 'logout',
          label: 'Cerrar Sesión',
          href: '/logout',
          icon: LogOut
        }
      ]
    },
    {
      id: 'docs',
      label: 'Documentación',
      href: '/documentation',
      icon: BookOpen
    },
  ]
}