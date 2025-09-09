'use client'

import * as React from "react"
import { Plus, Download, Upload } from "lucide-react"
import { cn } from "../utils/cn"
import { Button } from "../atoms/button"

interface ActionConfig {
  label: string
  icon?: React.ElementType
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'ghost'
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  tooltip?: string
}

interface ActionsOnlyBarProps {
  // Acciones principales
  actions: ActionConfig[]
  // Botón principal destacado
  primaryAction?: ActionConfig
  // Layout
  variant?: 'compact' | 'full'
  className?: string
  // Distribución
  justifyContent?: 'start' | 'center' | 'end' | 'between'
  groupSimilar?: boolean
}

/**
 * Componente especializado para acciones masivas y botones múltiples
 * 
 * CASO DE USO PRINCIPAL:
 * - Acciones específicas separadas de filtros (como global-catalog)
 * - Páginas con múltiples acciones disponibles
 * - Toolbars y barras de herramientas
 * - Los filtros van en FiltersOnlyBar separado
 */
export const ActionsOnlyBar = React.forwardRef<
  HTMLDivElement,
  ActionsOnlyBarProps
>(({ 
  actions,
  primaryAction,
  variant = 'full',
  className,
  justifyContent = 'start',
  groupSimilar = true,
  ...props 
}, ref) => {

  const renderActionButton = (action: ActionConfig, index: number) => {
    const IconComponent = action.icon
    
    return (
      <Button
        key={`action-${index}`}
        variant={action.variant || 'outline'}
        onClick={action.onClick}
        disabled={action.disabled || action.loading}
        className={cn(
          "gap-2",
          action.loading && "opacity-75"
        )}
        title={action.tooltip}
      >
        {action.loading ? (
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
        ) : (
          IconComponent && <IconComponent className="h-4 w-4" />
        )}
        {action.label}
      </Button>
    )
  }

  const renderActionGroups = () => {
    if (!groupSimilar) {
      const allActions = [...actions]
      if (primaryAction) {
        allActions.push({
          ...primaryAction,
          variant: primaryAction.variant || 'default'
        })
      }
      
      return (
        <div className={cn(
          "flex items-center gap-2",
          variant === 'compact' && "flex-wrap gap-1"
        )}>
          {allActions.map(renderActionButton)}
        </div>
      )
    }

    // Agrupar por tipo de acción
    const destructiveActions = actions.filter(a => a.variant === 'destructive')
    const primaryActions = actions.filter(a => a.variant === 'default' || !a.variant)
    const secondaryActions = actions.filter(a => a.variant === 'secondary' || a.variant === 'outline')

    return (
      <div className={cn(
        "flex items-center gap-4",
        variant === 'compact' && "gap-2 flex-wrap"
      )}>
        {/* Acciones principales */}
        {(primaryActions.length > 0 || primaryAction) && (
          <div className="flex items-center gap-2">
            {primaryActions.map(renderActionButton)}
            {primaryAction && renderActionButton({
              ...primaryAction,
              variant: primaryAction.variant || 'default'
            }, actions.length)}
          </div>
        )}

        {/* Acciones secundarias */}
        {secondaryActions.length > 0 && (
          <div className="flex items-center gap-2">
            {secondaryActions.map(renderActionButton)}
          </div>
        )}

        {/* Acciones destructivas */}
        {destructiveActions.length > 0 && (
          <div className="flex items-center gap-2 border-l pl-4">
            {destructiveActions.map(renderActionButton)}
          </div>
        )}
      </div>
    )
  }

  const getJustifyClass = () => {
    switch (justifyContent) {
      case 'start': return 'justify-start'
      case 'center': return 'justify-center'  
      case 'end': return 'justify-end'
      case 'between': return 'justify-between'
      default: return 'justify-start'
    }
  }

  return (
    <div
      ref={ref}
      className={cn(
        "flex items-center p-4 bg-background border rounded-lg",
        getJustifyClass(),
        className
      )}
      {...props}
    >
      {renderActionGroups()}
    </div>
  )
})

ActionsOnlyBar.displayName = "ActionsOnlyBar"

export type { ActionConfig, ActionsOnlyBarProps }
