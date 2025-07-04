"use client"

import * as React from "react"
import { Label } from "../atoms/label"
import { cn } from "../utils/cn"

interface FormFieldProps {
  label?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}

export function FormField({ 
  label, 
  error, 
  required, 
  className,
  children 
}: FormFieldProps) {
  const childId = React.useId()
  
  return (
    <div className={cn("grid gap-2", className)}>
      {label && (
        <Label htmlFor={childId}>
          {label}
          {required && <span className="text-destructive ml-1">*</span>}
        </Label>
      )}
      {React.cloneElement(children as React.ReactElement, { 
        id: childId,
        'aria-invalid': !!error,
        'aria-describedby': error ? `${childId}-error` : undefined
      })}
      {error && (
        <p id={`${childId}-error`} className="text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  )
}