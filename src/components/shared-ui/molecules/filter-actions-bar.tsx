'use client'

import * as React from "react"
import { Search, Plus } from "lucide-react"
import { cn } from "../utils/cn"
import { Button } from "../atoms/button"
import { Input } from "../atoms/input"

interface FilterOption {
  label: string
  value: string
}

interface FilterConfig {
  key: string
  label?: string
  placeholder?: string
  type: 'search' | 'select' | 'text'
  options?: FilterOption[]
  value?: string
  onChange?: (value: string) => void
}

interface ActionConfig {
  label: string
  icon?: React.ElementType
  variant?: 'default' | 'secondary' | 'outline' | 'ghost'
  onClick: () => void
  disabled?: boolean
}

interface FilterActionsBarProps {
  // Filtros
  filters?: FilterConfig[]
  // Botones de acción
  actions?: ActionConfig[]
  // Botón principal (típicamente "Crear/Nuevo")
  primaryAction?: ActionConfig
  // Layout
  variant?: 'compact' | 'full'
  className?: string
  // Distribución
  filtersFirst?: boolean
}

/**
 * Barra flexible de filtros + botones de acción como en warehouses
 * 
 * Casos de uso:
 * - FilterActionsBar: Filtros + botones juntos
 * - FilterBar: Solo filtros (actions = undefined)
 * - ActionsBar: Solo botones (filters = undefined)
 */
export const FilterActionsBar = React.forwardRef<
  HTMLDivElement,
  FilterActionsBarProps
>(({ 
  filters = [],
  actions = [],
  primaryAction,
  variant = 'full',
  className,
  filtersFirst = true,
  ...props 
}, ref) => {

  const renderFilters = () => {
    if (filters.length === 0) return null

    return (
      <div className={cn(
        "flex items-center space-x-4",
        variant === 'compact' ? "flex-wrap gap-2" : "flex-nowrap"
      )}>
        {filters.map((filter) => {
          if (filter.type === 'search') {
            return (
              <div key={filter.key} className="relative max-w-sm">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={filter.placeholder || "Buscar..."}
                  value={filter.value || ""}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                  className="pl-8 w-full min-w-[200px]"
                />
              </div>
            )
          }
          
          if (filter.type === 'select') {
            return (
              <div key={filter.key} className="min-w-[160px]">
                <select
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={filter.value || ""}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                >
                  {filter.options?.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            )
          }

          if (filter.type === 'text') {
            return (
              <div key={filter.key} className="min-w-[150px]">
                <Input
                  placeholder={filter.placeholder || filter.label}
                  value={filter.value || ""}
                  onChange={(e) => filter.onChange?.(e.target.value)}
                />
              </div>
            )
          }

          return null
        })}
      </div>
    )
  }

  const renderActions = () => {
    const allActions = [...actions]
    if (primaryAction) {
      allActions.push({
        ...primaryAction,
        variant: primaryAction.variant || 'default'
      })
    }

    if (allActions.length === 0) return null

    return (
      <div className={cn(
        "flex items-center space-x-2",
        variant === 'compact' ? "flex-wrap gap-2" : "flex-nowrap"
      )}>
        {allActions.map((action, index) => {
          const IconComponent = action.icon
          return (
            <Button
              key={`action-${index}`}
              variant={action.variant || 'outline'}
              onClick={action.onClick}
              disabled={action.disabled}
              className="gap-2"
            >
              {IconComponent && <IconComponent className="h-4 w-4" />}
              {action.label}
            </Button>
          )
        })}
      </div>
    )
  }

  const filtersContent = renderFilters()
  const actionsContent = renderActions()

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center justify-between p-4 bg-background border rounded-lg",
        variant === 'compact' && "flex-col space-y-4 items-start",
        className
      )}
      {...props}
    >
      {filtersFirst ? (
        <>
          {filtersContent}
          {actionsContent}
        </>
      ) : (
        <>
          {actionsContent}
          {filtersContent}
        </>
      )}
    </div>
  )
})

FilterActionsBar.displayName = "FilterActionsBar"

// Componentes de conveniencia
export const FilterBar = React.forwardRef<
  HTMLDivElement,
  Omit<FilterActionsBarProps, 'actions' | 'primaryAction'>
>(({ ...props }, ref) => (
  <FilterActionsBar ref={ref} {...props} />
))

FilterBar.displayName = "FilterBar"

export const ActionsBar = React.forwardRef<
  HTMLDivElement,
  Omit<FilterActionsBarProps, 'filters'>
>(({ ...props }, ref) => (
  <FilterActionsBar ref={ref} {...props} />
))

ActionsBar.displayName = "ActionsBar"

export { FilterActionsBar, FilterBar, ActionsBar }
export type { FilterConfig, ActionConfig, FilterActionsBarProps }
