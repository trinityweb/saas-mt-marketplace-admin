"use client"

import * as React from "react"
import { useState, useMemo } from "react"
import { Check, ChevronDown, Search, X } from "lucide-react"
import { cn } from "../utils/cn"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"

export interface SearchableSelectOption {
  value: string
  label: string
  description?: string
  disabled?: boolean
  group?: string
  badge?: {
    text: string
    variant?: "default" | "secondary" | "danger" | "outline"
  }
  icon?: React.ReactNode
}

interface SearchableSelectProps {
  options: SearchableSelectOption[]
  value?: string
  onValueChange?: (value: string) => void
  placeholder?: string
  searchPlaceholder?: string
  disabled?: boolean
  className?: string
  contentClassName?: string
  allowClear?: boolean
  loading?: boolean
  emptyMessage?: string
  multiple?: boolean
  maxSelectedDisplay?: number
}

export function SearchableSelect({
  options,
  value,
  onValueChange,
  placeholder = "Seleccionar...",
  searchPlaceholder = "Buscar...",
  disabled = false,
  className,
  contentClassName,
  allowClear = false,
  loading = false,
  emptyMessage = "No se encontraron opciones",
  multiple = false,
  maxSelectedDisplay = 2
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState("")

  // Para múltiple selección
  const selectedValues = useMemo(() => {
    if (!multiple) return value ? [value] : []
    // Para multiple, parseamos el value como CSV
    return value ? value.split(',').filter(v => v.trim()) : []
  }, [value, multiple])

  // Filtrar opciones basado en búsqueda
  const filteredOptions = useMemo(() => {
    if (!searchValue) return options

    return options.filter(option =>
      option.label.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.description?.toLowerCase().includes(searchValue.toLowerCase()) ||
      option.value.toLowerCase().includes(searchValue.toLowerCase())
    )
  }, [options, searchValue])

  // Agrupar opciones si tienen grupo
  const groupedOptions = useMemo(() => {
    const groups: Record<string, SearchableSelectOption[]> = {}
    const ungrouped: SearchableSelectOption[] = []

    filteredOptions.forEach(option => {
      if (option.group) {
        if (!groups[option.group]) {
          groups[option.group] = []
        }
        groups[option.group].push(option)
      } else {
        ungrouped.push(option)
      }
    })

    return { groups, ungrouped }
  }, [filteredOptions])

  // Obtener etiqueta del valor seleccionado
  const getSelectedLabel = () => {
    if (selectedValues.length === 0) return placeholder

    if (!multiple) {
      const option = options.find(opt => opt.value === selectedValues[0])
      return option?.label || selectedValues[0]
    }

    // Para múltiple selección
    if (selectedValues.length <= maxSelectedDisplay) {
      return selectedValues
        .map(val => options.find(opt => opt.value === val)?.label || val)
        .join(", ")
    }

    const firstLabels = selectedValues
      .slice(0, maxSelectedDisplay)
      .map(val => options.find(opt => opt.value === val)?.label || val)
      .join(", ")
    
    return `${firstLabels} +${selectedValues.length - maxSelectedDisplay} más`
  }

  // Manejar selección
  const handleSelect = (optionValue: string) => {
    if (multiple) {
      const newSelected = selectedValues.includes(optionValue)
        ? selectedValues.filter(val => val !== optionValue)
        : [...selectedValues, optionValue]
      
      onValueChange?.(newSelected.join(','))
    } else {
      onValueChange?.(optionValue)
      setOpen(false)
    }
    setSearchValue("")
  }

  // Limpiar selección
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onValueChange?.(multiple ? "" : "")
  }

  // Renderizar opción
  const renderOption = (option: SearchableSelectOption) => {
    const isSelected = selectedValues.includes(option.value)
    
    return (
      <div
        key={option.value}
        className={cn(
          "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
          "hover:bg-accent hover:text-accent-foreground",
          "focus:bg-accent focus:text-accent-foreground",
          option.disabled && "pointer-events-none opacity-50",
          isSelected && "bg-accent text-accent-foreground"
        )}
        onClick={() => !option.disabled && handleSelect(option.value)}
      >
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {option.icon && (
            <div className="flex-shrink-0">
              {option.icon}
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="font-medium truncate">{option.label}</div>
            {option.description && (
              <div className="text-xs text-muted-foreground truncate">
                {option.description}
              </div>
            )}
          </div>

          {option.badge && (
            <Badge 
              variant={option.badge.variant || "secondary"}
              className="text-xs flex-shrink-0"
            >
              {option.badge.text}
            </Badge>
          )}
        </div>

        {(isSelected || (!multiple && value === option.value)) && (
          <Check className="h-4 w-4 ml-2 flex-shrink-0" />
        )}
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
          disabled={disabled || loading}
        >
          <span className="truncate">
            {loading ? "Cargando..." : getSelectedLabel()}
          </span>
          
          <div className="flex items-center gap-1 ml-2 flex-shrink-0">
            {allowClear && selectedValues.length > 0 && (
              <X
                className="h-4 w-4 opacity-50 hover:opacity-100"
                onClick={handleClear}
              />
            )}
            <ChevronDown className="h-4 w-4 opacity-50" />
          </div>
        </Button>
      </PopoverTrigger>
      
      <PopoverContent 
        className={cn("w-full p-0", contentClassName)} 
        align="start"
        side="bottom"
      >
        <div className="flex items-center border-b px-3">
          <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <Input
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
        </div>
        
        <div className="max-h-60 overflow-auto p-1">
          {filteredOptions.length === 0 ? (
            <div className="py-6 text-center text-sm text-muted-foreground">
              {emptyMessage}
            </div>
          ) : (
            <>
              {/* Opciones sin grupo */}
              {groupedOptions.ungrouped.map(renderOption)}
              
              {/* Opciones agrupadas */}
              {Object.entries(groupedOptions.groups).map(([groupName, groupOptions]) => (
                <div key={groupName}>
                  <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                    {groupName}
                  </div>
                  {groupOptions.map(renderOption)}
                </div>
              ))}
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// Hook para convertir arrays simples a SearchableSelectOption
export function useSearchableSelectOptions<T>(
  items: T[],
  labelKey: keyof T,
  valueKey: keyof T,
  descriptionKey?: keyof T,
  groupKey?: keyof T
): SearchableSelectOption[] {
  return useMemo(() => {
    return items.map(item => ({
      value: String(item[valueKey]),
      label: String(item[labelKey]),
      description: descriptionKey ? String(item[descriptionKey]) : undefined,
      group: groupKey ? String(item[groupKey]) : undefined,
    }))
  }, [items, labelKey, valueKey, descriptionKey, groupKey])
}

// Componente wrapper para mantener compatibilidad con Select existente
interface SearchableSelectWrapperProps {
  children?: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  className?: string
}

export function SearchableSelectWrapper({
  children,
  value,
  onValueChange,
  disabled,
  placeholder,
  className
}: SearchableSelectWrapperProps) {
  // Extraer opciones de los children (SelectItem)
  const options = useMemo(() => {
    const extractedOptions: SearchableSelectOption[] = []

    React.Children.forEach(children, (child) => {
      if (React.isValidElement(child) && (child.props as any).value) {
        const childProps = child.props as any
        extractedOptions.push({
          value: childProps.value,
          label: typeof childProps.children === 'string' 
            ? childProps.children 
            : childProps.value,
          disabled: childProps.disabled
        })
      }
    })

    return extractedOptions
  }, [children])

  return (
    <SearchableSelect
      options={options}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      placeholder={placeholder}
      className={className}
      allowClear={true}
    />
  )
} 