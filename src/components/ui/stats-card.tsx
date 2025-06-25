"use client"

import * as React from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Package,
  CheckCircle,
  Award,
  Layers,
  Users,
  Activity,
  BarChart3
} from "lucide-react"

export interface StatsCardProps {
  title: string
  value: string | number
  description?: string
  iconName: 'Package' | 'CheckCircle' | 'Award' | 'Layers' | 'Users' | 'Activity' | 'BarChart3'
  trend?: {
    value: number
    label: string
    type: 'up' | 'down' | 'neutral'
  }
  progress?: {
    value: number
    max: number
    color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  }
  badge?: {
    text: string
    variant?: 'default' | 'secondary' | 'destructive' | 'outline'
  }
  href?: string
  loading?: boolean
  className?: string
  iconColor?: string
}

const iconMap = {
  Package,
  CheckCircle,
  Award,
  Layers,
  Users,
  Activity,
  BarChart3
}

export function StatsCard({
  title,
  value,
  description,
  iconName,
  trend,
  progress,
  badge,
  href,
  loading = false,
  className,
  iconColor = "text-blue-500",
}: StatsCardProps) {
  const Icon = iconMap[iconName]
  const getTrendIcon = () => {
    switch (trend?.type) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Minus className="h-3 w-3" />
    }
  }

  const getProgressColor = () => {
    switch (progress?.color) {
      case 'green':
        return 'bg-green-500'
      case 'yellow':
        return 'bg-yellow-500'
      case 'red':
        return 'bg-red-500'
      case 'purple':
        return 'bg-purple-500'
      default:
        return 'bg-blue-500'
    }
  }

  if (loading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardContent className="p-6">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleClick = () => {
    if (href) {
      window.location.href = href
    }
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
        href && "cursor-pointer hover:shadow-xl",
        className
      )}
      onClick={handleClick}
    >
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          {/* Simplified Icon */}
          <div className={cn(
            "w-14 h-14 rounded-lg flex items-center justify-center",
            "bg-gray-50 dark:bg-gray-800"
          )}>
            {React.createElement(Icon, { className: cn("w-7 h-7", iconColor) })}
          </div>
          
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-muted-foreground">
                {title}
              </p>
              {badge && (
                <Badge variant={badge.variant} className="text-xs">
                  {badge.text}
                </Badge>
              )}
            </div>
            
            <p className="text-2xl font-bold text-foreground">
              {typeof value === 'number' ? value.toLocaleString() : value}
            </p>
            
            {description && (
              <p className="text-xs text-muted-foreground">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        {progress && (
          <div className="mt-4">
            <div className="flex justify-between text-xs text-muted-foreground mb-2">
              <span>Progreso</span>
              <span>{progress.value} / {progress.max}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 overflow-hidden">
              <div 
                className={cn(
                  "h-full rounded-full transition-all duration-500 ease-out",
                  getProgressColor()
                )}
                style={{ 
                  width: `${Math.min((progress.value / progress.max) * 100, 100)}%` 
                }}
              />
            </div>
          </div>
        )}

        {/* Trend Information */}
        {trend && (
          <div className="mt-3 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {trend.label}
            </span>
            <div className={cn(
              "flex items-center gap-1 text-xs font-medium",
              trend.type === 'up' && "text-green-600 dark:text-green-400",
              trend.type === 'down' && "text-red-600 dark:text-red-400",
              trend.type === 'neutral' && "text-gray-600 dark:text-gray-400"
            )}>
              {getTrendIcon()}
              <span>{trend.value > 0 ? '+' : ''}{trend.value}%</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 