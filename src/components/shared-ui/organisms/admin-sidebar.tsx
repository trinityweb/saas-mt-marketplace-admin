'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronDown,
  ExternalLink
} from 'lucide-react'
import { cn } from '../utils/cn'
import { Button } from '../atoms/button'
import { Separator } from '../atoms/separator'
import { AdminSidebarProps, MenuItem, themeColors } from '../types/sidebar'

export function AdminSidebar({ config, isCollapsed: externalCollapsed, onToggle }: AdminSidebarProps) {
  const pathname = usePathname()
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({})
  
  // Handle internal vs external collapse control
  const [internalCollapsed, setInternalCollapsed] = useState(
    config.behavior.defaultCollapsed ?? false
  )
  
  const isCollapsed = config.behavior.externalControl 
    ? externalCollapsed ?? false 
    : internalCollapsed
    
  const handleToggle = () => {
    if (config.behavior.externalControl && onToggle) {
      onToggle()
    } else {
      setInternalCollapsed(!internalCollapsed)
    }
  }

  // Auto-open menus that contain the active route
  useEffect(() => {
    const newOpenMenus: Record<string, boolean> = {}
    
    config.menuItems.forEach(item => {
      if (item.submenu) {
        const hasActiveChild = item.submenu.some(child => 
          pathname === child.href || pathname.startsWith(child.href + '/')
        )
        if (hasActiveChild) {
          newOpenMenus[item.id] = true
        }
      }
    })
    
    setOpenMenus(newOpenMenus)
  }, [pathname, config.menuItems])

  const toggleMenu = (menuId: string) => {
    setOpenMenus(prev => ({ ...prev, [menuId]: !prev[menuId] }))
  }

  const isActive = (href?: string) => {
    if (!href) return false
    return pathname === href || pathname.startsWith(href + '/')
  }

  const colors = themeColors[config.theme.primaryColor]

  const renderMenuItem = (item: MenuItem, depth = 0) => {
    const hasSubmenu = item.submenu && item.submenu.length > 0
    const active = isActive(item.href)
    
    if (hasSubmenu) {
      return (
        <div key={item.id}>
          <button
            onClick={() => toggleMenu(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              openMenus[item.id] 
                ? "bg-gray-100/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100" 
                : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/30",
              depth > 0 && "ml-6 text-xs"
            )}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />}
              {!isCollapsed && <span>{item.label}</span>}
            </div>
            {!isCollapsed && (
              <ChevronDown 
                className={cn(
                  "h-4 w-4 transition-transform",
                  openMenus[item.id] && "rotate-180"
                )}
              />
            )}
          </button>
          {openMenus[item.id] && !isCollapsed && (
            <div className="mt-1 space-y-1">
              {item.submenu.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }
    
    return (
      <Link
        key={item.id}
        href={item.href || '#'}
        className={cn(
          "flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
          active 
            ? "bg-gray-100/50 dark:bg-gray-800/50 text-gray-900 dark:text-gray-100" 
            : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-800/30",
          depth > 0 && "ml-6 text-xs"
        )}
      >
        {item.icon && <item.icon className="mr-2 h-4 w-4 flex-shrink-0" />}
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                {item.badge}
              </span>
            )}
            {item.external && <ExternalLink className="ml-2 h-3 w-3" />}
          </>
        )}
      </Link>
    )
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-gray-50/50 dark:bg-gray-900/50 border-r border-gray-200/50 dark:border-gray-800/50 transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center space-x-2">
            <div className={cn(
              "flex items-center justify-center w-8 h-8 rounded-lg text-white",
              colors.primary
            )}>
              {config.theme.logoIcon || (
                <span className="text-lg font-bold">
                  {config.theme.logoText || config.theme.title.charAt(0)}
                </span>
              )}
            </div>
            {!isCollapsed && (
              <span className="text-xl font-bold">{config.theme.title}</span>
            )}
          </Link>
          
          {config.behavior.collapsible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className="h-8 w-8"
            >
              {isCollapsed ? 
                <ChevronRight className="h-4 w-4" /> : 
                <ChevronLeft className="h-4 w-4" />
              }
            </Button>
          )}
        </div>
      </div>

      <Separator />

      {/* Navigation */}
      <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
        {config.menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      {config.footerContent && (
        <div className="flex-shrink-0 p-4 border-t border-gray-200/50 dark:border-gray-800/50">
          {config.footerContent}
        </div>
      )}
    </div>
  )
}