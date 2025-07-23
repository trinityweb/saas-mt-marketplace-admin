"use client"

import * as React from "react"
import { SearchableSelect, SearchableSelectOption } from "./searchable-select"

// ============================================================================
// ENHANCED SELECT - DROP-IN REPLACEMENT
// ============================================================================
// Este componente mantiene la misma API que el Select original de shadcn/ui
// pero agrega búsqueda automáticamente. Solo cambia la importación:
//
// ANTES: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
// DESPUÉS: import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared-ui/molecules/enhanced-select'

interface SelectProps {
  children?: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  defaultValue?: string
}

interface SelectTriggerProps {
  className?: string
  children?: React.ReactNode
  disabled?: boolean
}

interface SelectContentProps {
  children?: React.ReactNode
  className?: string
}

interface SelectItemProps {
  value: string
  children?: React.ReactNode
  disabled?: boolean
  className?: string
}

interface SelectValueProps {
  placeholder?: string
  className?: string
}

// Contexto para pasar datos entre componentes
const SelectContext = React.createContext<{
  value?: string
  onValueChange?: (value: string) => void
  disabled?: boolean
  placeholder?: string
  options: SearchableSelectOption[]
  setOptions: React.Dispatch<React.SetStateAction<SearchableSelectOption[]>>
}>({
  options: [],
  setOptions: () => {}
})

// Componente Select principal
export function Select({ children, value, onValueChange, disabled, defaultValue }: SelectProps) {
  const [options, setOptions] = React.useState<SearchableSelectOption[]>([])
  const [placeholder, setPlaceholder] = React.useState<string>("")

  const contextValue = React.useMemo(() => ({
    value: value || defaultValue,
    onValueChange,
    disabled,
    placeholder,
    options,
    setOptions
  }), [value, defaultValue, onValueChange, disabled, placeholder, options, setOptions])

  // Extraer placeholder de children
  React.useEffect(() => {
    const extractPlaceholder = (children: React.ReactNode): string => {
      let foundPlaceholder = ""
      
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            const triggerPlaceholder = extractPlaceholder((child.props as any).children)
            if (triggerPlaceholder) foundPlaceholder = triggerPlaceholder
          } else if (child.type === SelectValue && (child.props as any).placeholder) {
            foundPlaceholder = (child.props as any).placeholder
          } else if ((child.props as any).children) {
            const nestedPlaceholder = extractPlaceholder((child.props as any).children)
            if (nestedPlaceholder) foundPlaceholder = nestedPlaceholder
          }
        }
      })
      
      return foundPlaceholder
    }

    const foundPlaceholder = extractPlaceholder(children)
    if (foundPlaceholder) {
      setPlaceholder(foundPlaceholder)
    }
  }, [children])

  return (
    <SelectContext.Provider value={contextValue}>
      {children}
    </SelectContext.Provider>
  )
}

// Trigger - renderiza el SearchableSelect
export function SelectTrigger({ className, children }: SelectTriggerProps) {
  const { value, onValueChange, disabled, placeholder, options } = React.useContext(SelectContext)

  return (
    <SearchableSelect
      options={options}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      placeholder={placeholder}
      searchPlaceholder="Buscar..."
      allowClear={true}
      className={className}
    />
  )
}

// Content - extrae las opciones de los SelectItem children
export function SelectContent({ children, className }: SelectContentProps) {
  const { setOptions } = React.useContext(SelectContext)

  React.useEffect(() => {
    const extractOptions = (children: React.ReactNode): SearchableSelectOption[] => {
      const extracted: SearchableSelectOption[] = []

      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child) && child.type === SelectItem) {
          const childProps = child.props as any
          extracted.push({
            value: childProps.value,
            label: typeof childProps.children === 'string' 
              ? childProps.children 
              : childProps.value,
            disabled: childProps.disabled
          })
        }
      })

      return extracted
    }

    const extractedOptions = extractOptions(children)
    setOptions(extractedOptions)
  }, [children, setOptions])

  // Este componente no renderiza nada, solo extrae datos
  return null
}

// Item - no se renderiza, solo se usa para extraer datos
export function SelectItem({ value, children, disabled }: SelectItemProps) {
  // Este componente no renderiza nada, solo se usa para extraer datos en SelectContent
  return null
}

// Value - no se renderiza, solo se usa para extraer placeholder
export function SelectValue({ placeholder }: SelectValueProps) {
  // Este componente no renderiza nada, solo se usa para extraer el placeholder
  return null
}

// Exportar otros componentes que podrían ser usados
export const SelectGroup = React.Fragment
export const SelectLabel = React.Fragment
export const SelectSeparator = React.Fragment

// ============================================================================
// EJEMPLO DE MIGRACIÓN
// ============================================================================

/*
ANTES (Select tradicional):

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar opción..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
    <SelectItem value="option3">Opción 3</SelectItem>
  </SelectContent>
</Select>

DESPUÉS (Con búsqueda automática):

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/shared-ui/molecules/enhanced-select'

<Select value={value} onValueChange={setValue}>
  <SelectTrigger>
    <SelectValue placeholder="Seleccionar opción..." />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="option1">Opción 1</SelectItem>
    <SelectItem value="option2">Opción 2</SelectItem>
    <SelectItem value="option3">Opción 3</SelectItem>
  </SelectContent>
</Select>

¡Solo cambias la importación y automáticamente tienes búsqueda!
*/ 