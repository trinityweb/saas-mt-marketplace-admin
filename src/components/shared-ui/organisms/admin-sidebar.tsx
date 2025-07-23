'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { 
  ChevronLeft, 
  ChevronDown,
  ExternalLink,
  Menu
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
            onClick={() => !isCollapsed && toggleMenu(item.id)}
            className={cn(
              "w-full flex items-center justify-between px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
              openMenus[item.id] 
                ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              depth > 0 && "ml-6 text-xs",
              isCollapsed && "justify-center cursor-default"
            )}
            title={isCollapsed ? item.label : undefined}
          >
            <div className="flex items-center">
              {item.icon && <item.icon className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-2")} />}
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
          {openMenus[item.id] && !isCollapsed && item.submenu && (
            <div className="mt-1 space-y-1">
              {item.submenu.map(child => renderMenuItem(child, depth + 1))}
            </div>
          )}
        </div>
      )
    }
    
    const linkContent = (
      <Link
        key={item.id}
        href={item.href || '#'}
        className={cn(
          "flex items-center px-2 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
          active 
            ? "bg-sidebar-primary text-sidebar-primary-foreground" 
            : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          depth > 0 && "ml-6 text-xs",
          isCollapsed && "justify-center"
        )}
        title={isCollapsed ? item.label : undefined}
      >
        {item.icon && <item.icon className={cn("h-4 w-4 flex-shrink-0", !isCollapsed && "mr-2")} />}
        {!isCollapsed && (
          <>
            <span className="flex-1">{item.label}</span>
            {item.badge && (
              <span className="ml-2 text-xs text-sidebar-foreground/60">
                {item.badge}
              </span>
            )}
            {item.external && <ExternalLink className="ml-2 h-3 w-3" />}
          </>
        )}
      </Link>
    )
    
    return linkContent
  }

  return (
    <div className={cn(
      "flex flex-col h-full bg-sidebar border-r border-sidebar-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4">
        <div className="flex items-center justify-between">
          {!isCollapsed && (
            <Link href="/" className="flex items-center space-x-2">
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-lg text-sidebar-primary-foreground bg-sidebar-primary",
              )}>
                {config.theme.logoIcon || (
                  <span className="text-lg font-bold">
                    {config.theme.logoText || config.theme.title.charAt(0)}
                  </span>
                )}
              </div>
              <span className="text-xl font-bold text-sidebar-foreground">{config.theme.title}</span>
            </Link>
          )}
          
          {config.behavior.collapsible && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggle}
              className={cn(
                "h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                isCollapsed && "mx-auto"
              )}
            >
              {isCollapsed ? 
                <Menu className="h-4 w-4" /> : 
                <ChevronLeft className="h-4 w-4" />
              }
            </Button>
          )}
        </div>
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 min-h-0 p-4 space-y-1 overflow-y-auto">
        {config.menuItems.map(item => renderMenuItem(item))}
      </nav>

      {/* Footer */}
      {config.footerContent && (
        <div className="flex-shrink-0 p-4 border-t border-sidebar-border">
          {config.footerContent}
        </div>
      )}
    </div>
  )
}