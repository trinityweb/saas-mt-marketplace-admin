'use client'

import * as React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../utils/cn"
import { Button, Badge } from "@/ui"

// Versión compacta del Stats Overview - para usar en sidebars o espacios reducidos

interface StatsSummaryMetric {
  id: string
  title: string
  value: string | number
  icon: React.ElementType
  trend?: {
    value: string
    direction: 'up' | 'down' | 'neutral'
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
}

interface StatsSummaryProps {
  title: string
  metrics: StatsSummaryMetric[]
  defaultExpanded?: boolean
  className?: string
  onExpandToggle?: (expanded: boolean) => void
}

/**
 * Versión compacta del componente de estadísticas para usar en:
 * - Sidebars
 * - Espacios reducidos
 * - Vista rápida de métricas
 */
export const StatsSummary = React.forwardRef<
  HTMLDivElement,
  StatsSummaryProps
>(({ 
  title,
  metrics = [],
  defaultExpanded = false,
  className,
  onExpandToggle,
  ...props 
}, ref) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  const handleToggle = () => {
    const newExpanded = !isExpanded
    setIsExpanded(newExpanded)
    onExpandToggle?.(newExpanded)
  }

  const getMetricColor = (color: string = 'gray') => {
    const colors = {
      blue: 'text-blue-600 bg-blue-50',
      green: 'text-green-600 bg-green-50', 
      yellow: 'text-yellow-600 bg-yellow-50',
      red: 'text-red-600 bg-red-50',
      purple: 'text-purple-600 bg-purple-50',
      gray: 'text-gray-600 bg-gray-50'
    }
    return colors[color as keyof typeof colors] || colors.gray
  }

  const getTrendColor = (direction: string) => {
    switch (direction) {
      case 'up': return 'text-green-600'
      case 'down': return 'text-red-600'
      default: return 'text-gray-600'
    }
  }

  // Resumen cuando está colapsado - mostrar solo los 3 valores principales
  const topMetrics = metrics.slice(0, 3)
  const totalValue = metrics.reduce((sum, m) => sum + (typeof m.value === 'number' ? m.value : 0), 0)

  return (
    <div
      ref={ref}
      className={cn("bg-card rounded-lg border p-4", className)}
      {...props}
    >
      {/* Header Compacto */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
            <div className="w-3 h-3 text-primary text-xs">📊</div>
          </div>
          <h3 className="text-sm font-medium text-foreground">
            {title}
          </h3>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="h-6 w-6 p-0 text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? (
            <ChevronUp className="h-3 w-3" />
          ) : (
            <ChevronDown className="h-3 w-3" />
          )}
        </Button>
      </div>

      {/* Estado Colapsado - Resumen */}
      {!isExpanded && (
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {totalValue}
          </div>
          <div className="flex space-x-2">
            {topMetrics.map((metric) => {
              const IconComponent = metric.icon
              return (
                <div
                  key={metric.id}
                  className={cn(
                    "flex items-center space-x-1 px-2 py-1 rounded text-xs",
                    getMetricColor(metric.color)
                  )}
                >
                  <IconComponent className="h-3 w-3" />
                  <span className="font-medium">{metric.value}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Estado Expandido - Detalles */}
      {isExpanded && (
        <div className="space-y-3">
          {metrics.map((metric) => {
            const IconComponent = metric.icon
            
            return (
              <div
                key={metric.id}
                className="flex items-center justify-between py-2 border-b last:border-b-0"
              >
                <div className="flex items-center space-x-3">
                  <div className={cn(
                    "rounded p-1.5",
                    getMetricColor(metric.color)
                  )}>
                    <IconComponent className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">
                      {metric.value}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {metric.title}
                    </div>
                  </div>
                </div>

                {metric.trend && (
                  <div className={cn(
                    "text-xs font-medium",
                    getTrendColor(metric.trend.direction)
                  )}>
                    {metric.trend.direction === 'up' && '↗ '}
                    {metric.trend.direction === 'down' && '↘ '}
                    {metric.trend.value}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

StatsSummary.displayName = "StatsSummary"

export type { StatsSummaryMetric, StatsSummaryProps }
