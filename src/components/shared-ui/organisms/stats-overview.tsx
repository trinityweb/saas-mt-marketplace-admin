'use client'

import * as React from "react"
import { useState } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import { cn } from "../utils/cn"
import { Button, Card, CardContent, Badge, Progress } from "@/ui"

interface StatsMetric {
  id: string
  title: string
  value: string | number
  description: string
  icon: React.ElementType
  progress?: {
    current: number
    total: number
    label?: string
  }
  trend?: {
    value: string
    label: string
    direction: 'up' | 'down' | 'neutral'
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error'
  }
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray'
}

interface StatsOverviewProps {
  title: string
  subtitle?: string
  metrics: StatsMetric[]
  variant?: 'compact' | 'detailed'
  defaultExpanded?: boolean
  className?: string
  onExpandToggle?: (expanded: boolean) => void
}

/**
 * Componente reutilizable para mostrar estadísticas y métricas importantes
 * con funcionalidad de expandir/contraer para diferentes niveles de detalle.
 * 
 * Usado en: Productos, Catálogo, Taxonomía, Marcas, Atributos, Curación, AI Prompts
 */
export const StatsOverview = React.forwardRef<
  HTMLDivElement,
  StatsOverviewProps
>(({ 
  title,
  subtitle,
  metrics = [],
  variant = 'detailed',
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
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200', 
      yellow: 'text-yellow-600 bg-yellow-50 border-yellow-200',
      red: 'text-red-600 bg-red-50 border-red-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      gray: 'text-gray-600 bg-gray-50 border-gray-200'
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

  return (
    <div
      ref={ref}
      className={cn("space-y-4", className)}
      {...props}
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <div className="w-4 h-4 text-primary">📊</div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {title}
              </h2>
              {subtitle && (
                <p className="text-sm text-muted-foreground">
                  {subtitle}
                  {isExpanded && " • Expandido"}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className="text-muted-foreground hover:text-foreground"
        >
          {isExpanded ? 'Contraer' : 'Expandir'}
          {isExpanded ? (
            <ChevronUp className="ml-2 h-4 w-4" />
          ) : (
            <ChevronDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Metrics Grid */}
      {isExpanded && (
        <div className={cn(
          "grid gap-4",
          variant === 'compact' ? "grid-cols-2 md:grid-cols-4" : "grid-cols-1 md:grid-cols-3"
        )}>
          {metrics.map((metric) => {
            const IconComponent = metric.icon
            const colorClasses = getMetricColor(metric.color)
            
            return (
              <Card
                key={metric.id}
                className={cn(
                  "relative overflow-hidden transition-all duration-200 hover:shadow-md",
                  variant === 'compact' ? "p-4" : "p-6"
                )}
              >
                <CardContent className="p-0 space-y-4">
                  {/* Icon + Value Row */}
                  <div className="flex items-start justify-between">
                    <div className={cn(
                      "rounded-lg p-2 border",
                      colorClasses
                    )}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    {metric.badge && (
                      <Badge 
                        variant={metric.badge.variant || 'secondary'}
                        className="text-xs"
                      >
                        {metric.badge.text}
                      </Badge>
                    )}
                  </div>

                  {/* Value + Description */}
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold text-foreground">
                        {metric.value}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {metric.description}
                      </div>
                    </div>

                    {/* Progress Bar (if exists) */}
                    {metric.progress && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">
                            {metric.progress.label || 'Progreso'}
                          </span>
                          <span className="text-muted-foreground">
                            {metric.progress.current} / {metric.progress.total}
                          </span>
                        </div>
                        <Progress
                          value={(metric.progress.current / metric.progress.total) * 100}
                          className="h-2"
                        />
                      </div>
                    )}

                    {/* Trend Indicator (if exists) */}
                    {metric.trend && (
                      <div className="flex items-center justify-between pt-2 border-t">
                        <span className="text-xs text-muted-foreground">
                          {metric.trend.label}
                        </span>
                        <span className={cn(
                          "text-xs font-medium",
                          getTrendColor(metric.trend.direction)
                        )}>
                          {metric.trend.direction === 'up' && '↗ '}
                          {metric.trend.direction === 'down' && '↘ '}
                          {metric.trend.value}
                        </span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Collapsed State Summary */}
      {!isExpanded && metrics.length > 0 && (
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
          {metrics.slice(0, variant === 'compact' ? 6 : 3).map((metric) => {
            const IconComponent = metric.icon
            return (
              <div
                key={metric.id}
                className="flex items-center space-x-2 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className={cn(
                  "rounded p-1.5 border",
                  getMetricColor(metric.color)
                )}>
                  <IconComponent className="h-3 w-3" />
                </div>
                <div>
                  <div className="text-sm font-medium">{metric.value}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {metric.title}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
})

StatsOverview.displayName = "StatsOverview"

export type { StatsMetric, StatsOverviewProps }
