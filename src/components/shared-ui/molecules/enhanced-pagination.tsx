'use client'

import * as React from "react"
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, MoreHorizontal } from "lucide-react"
import { cn } from "../utils/cn"
import { Button } from "../atoms/button"

interface EnhancedPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  className?: string
  showPageInfo?: boolean
  maxVisiblePages?: number
}

/**
 * Paginación mejorada con números visibles como pidió el usuario
 * Ejemplo: [1] 2 3 4 ... 8 9 10
 */
export const EnhancedPagination = React.forwardRef<
  HTMLDivElement,
  EnhancedPaginationProps
>(({ 
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  className,
  showPageInfo = true,
  maxVisiblePages = 7,
  ...props 
}, ref) => {

  // Calcular rango de elementos mostrados
  const startItem = totalItems > 0 ? (currentPage - 1) * pageSize + 1 : 0
  const endItem = totalItems > 0 ? Math.min(currentPage * pageSize, totalItems) : 0

  // Generar números de página visibles con lógica mejorada
  const generatePageNumbers = () => {
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []
    const halfVisible = Math.floor(maxVisiblePages / 2)

    if (currentPage <= halfVisible + 1) {
      // Caso: Estamos cerca del inicio
      // [1] 2 3 4 5 ... 10
      for (let i = 1; i <= maxVisiblePages - 2; i++) {
        pages.push(i)
      }
      pages.push('ellipsis')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - halfVisible) {
      // Caso: Estamos cerca del final  
      // 1 ... 6 7 8 9 [10]
      pages.push(1)
      pages.push('ellipsis')
      for (let i = totalPages - (maxVisiblePages - 3); i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Caso: Estamos en el medio
      // 1 ... 4 [5] 6 ... 10
      pages.push(1)
      pages.push('ellipsis-start')
      
      for (let i = currentPage - halfVisible + 1; i <= currentPage + halfVisible - 1; i++) {
        pages.push(i)
      }
      
      pages.push('ellipsis-end')
      pages.push(totalPages)
    }

    return pages
  }

  const pageNumbers = generatePageNumbers()

  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
      {...props}
    >
      {/* Info de páginas */}
      {showPageInfo && (
        <div className="text-sm text-muted-foreground">
          {totalItems > 0 
            ? `Mostrando ${startItem} a ${endItem} de ${totalItems} resultados`
            : 'No hay resultados'}
        </div>
      )}
      
      {/* Controles de paginación */}
      <div className="flex items-center gap-1">
        {/* Botón Primera Página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
          title="Primera página"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        
        {/* Botón Anterior */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="h-9 w-9 p-0"
          title="Página anterior"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        {/* Números de Página */}
        <div className="flex items-center gap-1 mx-2">
          {pageNumbers.map((page, index) => {
            if (page === 'ellipsis' || page === 'ellipsis-start' || page === 'ellipsis-end') {
              return (
                <div 
                  key={`ellipsis-${index}`} 
                  className="flex items-center justify-center h-9 w-9 text-sm text-muted-foreground"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </div>
              )
            }
            
            const pageNum = page as number
            const isActive = currentPage === pageNum
            
            return (
              <Button
                key={`page-${pageNum}`}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={cn(
                  "h-9 w-9 p-0 font-medium",
                  isActive && "bg-primary text-primary-foreground"
                )}
                title={`Página ${pageNum}`}
              >
                {pageNum}
              </Button>
            )
          })}
        </div>
        
        {/* Botón Siguiente */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
          title="Página siguiente"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        {/* Botón Última Página */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages}
          className="h-9 w-9 p-0"
          title="Última página"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

EnhancedPagination.displayName = "EnhancedPagination"

export { EnhancedPagination }
export type { EnhancedPaginationProps }
