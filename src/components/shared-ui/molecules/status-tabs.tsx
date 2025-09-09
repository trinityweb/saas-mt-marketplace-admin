'use client'

import * as React from "react"
import { cn } from "../utils/cn"
import { Badge } from "../atoms/badge"

interface TabOption {
  id: string
  label: string
  count: number
  // Para endpoints de conteo real
  countQuery?: {
    endpoint: string
    params?: Record<string, any>
  }
  // Styling
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  icon?: React.ElementType
}

interface StatusTabsProps {
  tabs: TabOption[]
  activeTab: string
  onTabChange: (tabId: string) => void
  loading?: boolean
  className?: string
  // Configuración de conteos
  showCounts?: boolean
  autoRefreshCounts?: boolean
  refreshInterval?: number
}

/**
 * Tabs con conteos reales de BD como en la imagen de curación
 * 
 * Ejemplo de uso:
 * - Todos (150), Pendientes (45), Procesando (12), Curados (78), Rechazados (15)
 * 
 * Los conteos representan totales de BD, no solo página actual
 */
export const StatusTabs = React.forwardRef<
  HTMLDivElement,
  StatusTabsProps
>(({ 
  tabs,
  activeTab,
  onTabChange,
  loading = false,
  className,
  showCounts = true,
  autoRefreshCounts = false,
  refreshInterval = 30000,
  ...props 
}, ref) => {

  // Estado para conteos actualizables
  const [counts, setCounts] = React.useState<Record<string, number>>({})
  const [loadingCounts, setLoadingCounts] = React.useState(false)

  // Función para obtener conteos reales de endpoints
  const fetchCounts = React.useCallback(async () => {
    if (!autoRefreshCounts) return
    
    setLoadingCounts(true)
    
    try {
      const countPromises = tabs
        .filter(tab => tab.countQuery)
        .map(async (tab) => {
          try {
            const response = await fetch(tab.countQuery!.endpoint, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('iam_access_token') || ''}`
              },
              body: JSON.stringify(tab.countQuery!.params || {})
            })
            
            if (response.ok) {
              const data = await response.json()
              return { tabId: tab.id, count: data.total_count || data.count || 0 }
            }
          } catch (error) {
            console.warn(`Error fetching count for tab ${tab.id}:`, error)
          }
          
          return { tabId: tab.id, count: tab.count }
        })

      const results = await Promise.all(countPromises)
      const newCounts: Record<string, number> = {}
      
      results.forEach(({ tabId, count }) => {
        newCounts[tabId] = count
      })
      
      setCounts(newCounts)
    } catch (error) {
      console.error('Error fetching tab counts:', error)
    } finally {
      setLoadingCounts(false)
    }
  }, [tabs, autoRefreshCounts])

  // Auto-refresh de conteos
  React.useEffect(() => {
    if (autoRefreshCounts) {
      fetchCounts()
      const interval = setInterval(fetchCounts, refreshInterval)
      return () => clearInterval(interval)
    }
  }, [fetchCounts, autoRefreshCounts, refreshInterval])

  const getVariantClasses = (variant: string = 'default', isActive: boolean = false) => {
    const base = "transition-all duration-200"
    
    if (isActive) {
      switch (variant) {
        case 'success': return `${base} bg-green-100 text-green-800 border-green-300`
        case 'warning': return `${base} bg-yellow-100 text-yellow-800 border-yellow-300`
        case 'error': return `${base} bg-red-100 text-red-800 border-red-300`
        case 'info': return `${base} bg-blue-100 text-blue-800 border-blue-300`
        default: return `${base} bg-primary/10 text-primary border-primary/30`
      }
    } else {
      return `${base} bg-background text-muted-foreground border-border hover:bg-muted hover:text-foreground`
    }
  }

  const getBadgeVariant = (variant: string = 'default') => {
    switch (variant) {
      case 'success': return 'default'
      case 'warning': return 'secondary'
      case 'error': return 'destructive'
      case 'info': return 'outline'
      default: return 'secondary'
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center space-x-1 p-1 bg-muted rounded-lg overflow-x-auto",
        className
      )}
      {...props}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        const IconComponent = tab.icon
        const displayCount = autoRefreshCounts ? (counts[tab.id] ?? tab.count) : tab.count
        
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            disabled={loading}
            className={cn(
              "flex items-center space-x-2 px-4 py-2 rounded-md border text-sm font-medium whitespace-nowrap",
              getVariantClasses(tab.variant, isActive),
              loading && "opacity-50 cursor-not-allowed"
            )}
          >
            {IconComponent && (
              <IconComponent className="h-4 w-4" />
            )}
            
            <span>{tab.label}</span>
            
            {showCounts && (
              <Badge 
                variant={getBadgeVariant(tab.variant)}
                className={cn(
                  "ml-1 font-mono text-xs min-w-[20px] justify-center",
                  loadingCounts && "animate-pulse",
                  isActive && "bg-white/20 text-current"
                )}
              >
                {loadingCounts && autoRefreshCounts ? '...' : displayCount}
              </Badge>
            )}
          </button>
        )
      })}
    </div>
  )
})

StatusTabs.displayName = "StatusTabs"

export { StatusTabs }
export type { TabOption, StatusTabsProps }
