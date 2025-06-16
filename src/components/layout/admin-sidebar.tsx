"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { LucideIcon } from "lucide-react"
import { 
  Menu, 
  Home, 
  Users, 
  Settings, 
  LogOut, 
  ChevronDown, 
  ChevronRight,
  Layout,
  Layers,
  ChevronLeft,
  User,
  Globe,
  Zap,
  BarChart3,
  ShoppingCart,
  Shield,
  UserCheck,
  Crown
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface MenuItem {
  icon: LucideIcon;
  label: string;
  href?: string;
  isOpen?: boolean;
  children?: Array<{
    icon: LucideIcon;
    label: string;
    href: string;
  }>;
}

const initialMenuItems: MenuItem[] = [
  { icon: Home, label: "Dashboard", href: "/" },
  {
    icon: Shield,
    label: "Identity & Access",
    isOpen: false,
    children: [
      { icon: Users, label: "Tenants", href: "/iam/tenants" },
      { icon: UserCheck, label: "Roles y Permisos", href: "/iam/roles" },
      { icon: Crown, label: "Planes y Suscripciones", href: "/iam/plans" },
    ]
  },
  {
    icon: Layers,
    label: "Taxonomía Global",
    isOpen: false,
    children: [
      { icon: Layers, label: "Gestionar Categorías", href: "/taxonomy" },
      { icon: Settings, label: "Configurar Atributos", href: "/attributes" },
    ]
  },
  {
    icon: Zap,
    label: "Quickstart Dinámico",
    isOpen: false,
    children: [
      { icon: Users, label: "Tipos de Negocio", href: "/business-types" },
      { icon: Layout, label: "Templates Quickstart", href: "/templates" },
    ]
  },
  {
    icon: BarChart3,
    label: "Analytics",
    isOpen: false,
    children: [
      { icon: BarChart3, label: "Dashboard Analytics", href: "/analytics" },
      { icon: Users, label: "Reportes Tenants", href: "/reports" },
    ]
  },
  {
    icon: Settings,
    label: "Configuración",
    isOpen: false,
    children: [
      { icon: Globe, label: "Configuración General", href: "/config/general" },
      { icon: Settings, label: "Configuración Búsqueda", href: "/config/search" },
    ]
  }
]

export function AdminSidebar() {
  const pathname = usePathname()
  const { logout } = useAuth()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(initialMenuItems)
  const [openPopover, setOpenPopover] = useState<number | null>(null)

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleSubmenu = (index: number) => {
    const newMenuItems = [...menuItems];
    newMenuItems[index] = {
      ...newMenuItems[index],
      isOpen: !newMenuItems[index].isOpen
    };
    setMenuItems(newMenuItems);
  };

  return (
    <div className={`${isCollapsed ? 'w-16' : 'w-64'} transition-all duration-300 ease-in-out bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col shadow-sm`}>
      {/* Sidebar Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        {!isCollapsed && (
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-semibold text-slate-800 dark:text-slate-200">Marketplace</span>
          </div>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          {menuItems.map((item, index) => (
            <div key={index}>
              {item.children ? (
                isCollapsed ? (
                  <Popover 
                    open={openPopover === index} 
                    onOpenChange={(open) => setOpenPopover(open ? index : null)}
                  >
                    <PopoverTrigger asChild>
                      <button
                        className="w-full flex items-center justify-center p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                        title={item.label}
                      >
                        <item.icon size={20} />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent 
                      side="right" 
                      align="start" 
                      className="w-56 p-2"
                      sideOffset={8}
                    >
                      <div className="space-y-1">
                        <div className="px-2 py-1 text-sm font-medium text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-700 mb-2">
                          {item.label}
                        </div>
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                              pathname === child.href ? "bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400" : ""
                            }`}
                            onClick={() => setOpenPopover(null)}
                          >
                            <child.icon size={16} />
                            <span className="ml-3 text-sm">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    </PopoverContent>
                  </Popover>
                ) : (
                  <div>
                    <button
                      onClick={() => toggleSubmenu(index)}
                      className="w-full flex items-center justify-between p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                    >
                      <div className="flex items-center">
                        <item.icon size={20} />
                        <span className="ml-3 font-medium">{item.label}</span>
                      </div>
                      <div className="flex items-center">
                        {item.isOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                      </div>
                    </button>
                    {item.isOpen && (
                      <div className="ml-4 mt-1 space-y-1">
                        {item.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                              pathname === child.href ? "bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400" : ""
                            }`}
                          >
                            <child.icon size={16} />
                            <span className="ml-3 text-sm">{child.label}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              ) : (
                <Link
                  href={item.href!}
                  className={`flex items-center ${isCollapsed ? 'justify-center' : ''} p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors ${
                    pathname === item.href ? "bg-purple-50 dark:bg-purple-900/50 text-purple-600 dark:text-purple-400" : ""
                  }`}
                  title={isCollapsed ? item.label : undefined}
                >
                  <item.icon size={20} />
                  {!isCollapsed && <span className="ml-3 font-medium">{item.label}</span>}
                </Link>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* User Menu */}
      <div className="p-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <div className="relative">
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className={`w-full flex items-center ${isCollapsed ? 'justify-center' : 'justify-between'} p-3 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
            title={isCollapsed ? "Menú de usuario" : undefined}
          >
            <div className="flex items-center">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <User size={16} className="text-white" />
              </div>
              {!isCollapsed && <span className="ml-3 font-medium">Admin</span>}
            </div>
            {!isCollapsed && <ChevronDown size={16} className={`transition-transform ${isUserMenuOpen ? 'rotate-180' : ''}`} />}
          </button>

          {isUserMenuOpen && (
            <div className={`absolute ${isCollapsed ? 'left-full ml-2 bottom-0' : 'bottom-full mb-2'} w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-50`}>
              <Link
                href="/settings"
                className="flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                onClick={() => setIsUserMenuOpen(false)}
              >
                <Settings size={16} />
                <span className="ml-3">Configuración</span>
              </Link>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false)
                  logout()
                }}
                className="w-full flex items-center px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <LogOut size={16} />
                <span className="ml-3">Cerrar Sesión</span>
              </button>
            </div>
          )}
        </div>

        {/* Version Badge */}
        {!isCollapsed && (
          <div className="px-3 py-2">
            <div className="flex items-center justify-center gap-2">
              <div className="flex items-center">
                <span className="text-base">🇦🇷</span>
              </div>
              <Badge variant="secondary" className="gap-1 text-xs">
                <Zap className="w-3 h-3" />
                v1.0.0
              </Badge>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 