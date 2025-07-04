"use client"

import * as React from "react"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table"

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/shared-ui/organisms/table"
import { Button } from "@/components/shared-ui/atoms/button"
import { Card } from "@/components/shared-ui/molecules/card"
import { TableToolbar, Filter } from "@/components/ui/table-toolbar"
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/shared-ui/molecules/select"

// Interface para los datos de paginación del patrón Criteria
export interface CriteriaResponse<T> {
  data: T[]
  total_count: number
  page: number
  page_size: number
}

// Interface para los filtros de búsqueda
export interface SearchCriteria {
  page?: number
  page_size?: number
  sort_by?: string
  sort_dir?: 'asc' | 'desc'
  search?: string
  [key: string]: any
}

interface CriteriaDataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  totalCount: number
  currentPage: number
  pageSize: number
  loading?: boolean
  searchValue?: string
  searchPlaceholder?: string
  buttonText?: string
  filters?: Filter[]
  customActions?: React.ReactNode
  onCreateClick?: () => void
  onSearchChange?: (value: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
  onSortChange?: (sortBy: string, sortDir: 'asc' | 'desc') => void
  showSearch?: boolean
  fullWidth?: boolean // Nueva prop para controlar si se muestra al 100% del ancho
}

export function CriteriaDataTable<TData, TValue>({
  columns,
  data,
  totalCount,
  currentPage,
  pageSize,
  loading = false,
  searchValue = "",
  searchPlaceholder = "Buscar...",
  buttonText = "Crear",
  filters = [],
  customActions,
  onCreateClick,
  onSearchChange,
  onPageChange,
  onPageSizeChange,
  onSortChange,
  showSearch = true,
  fullWidth = false,
}: CriteriaDataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  // Calcular información de paginación
  const totalPages = Math.ceil(totalCount / pageSize)
  const startItem = (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalCount)

  const table = useReactTable({
    data: data || [],
    columns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualPagination: true, // Paginación manual del lado del servidor
    manualSorting: true, // Ordenamiento manual del lado del servidor
    pageCount: totalPages,
    onSortingChange: (updater) => {
      setSorting(updater)
      if (onSortChange && typeof updater === 'function') {
        const newSorting = updater(sorting)
        if (newSorting.length > 0) {
          const sort = newSorting[0]
          onSortChange(sort.id, sort.desc ? 'desc' : 'asc')
        }
      }
    },
    state: {
      sorting,
      pagination: {
        pageIndex: currentPage - 1,
        pageSize: pageSize,
      },
    },
  })

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize)
    onPageSizeChange(size)
    // Ajustar la página actual si es necesario
    const newTotalPages = Math.ceil(totalCount / size)
    if (currentPage > newTotalPages) {
      onPageChange(newTotalPages)
    }
  }

  // Función para generar números de página visibles
  const generatePageNumbers = () => {
    const pages = []
    const maxVisiblePages = 7
    
    if (totalPages <= maxVisiblePages) {
      // Si hay pocas páginas, mostrar todas
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Lógica más compleja para muchas páginas
      if (currentPage <= 4) {
        // Estamos cerca del inicio
        for (let i = 1; i <= 5; i++) {
          pages.push(i)
        }
        pages.push('ellipsis-end')
        pages.push(totalPages)
      } else if (currentPage >= totalPages - 3) {
        // Estamos cerca del final
        pages.push(1)
        pages.push('ellipsis-start')
        for (let i = totalPages - 4; i <= totalPages; i++) {
          pages.push(i)
        }
      } else {
        // Estamos en el medio
        pages.push(1)
        pages.push('ellipsis-start')
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i)
        }
        pages.push('ellipsis-end')
        pages.push(totalPages)
      }
    }
    
    return pages
  }

  const tableContent = (
    <>
      <div className={fullWidth ? "mb-6" : ""}>
        <TableToolbar
          searchValue={searchValue}
          searchPlaceholder={searchPlaceholder}
          buttonText={buttonText}
          filters={filters}
          customActions={customActions}
          onSearchChange={onSearchChange}
          onButtonClick={onCreateClick}
          showButton={!!onCreateClick}
          showSearch={showSearch}
        />
      </div>
      
      <div className={fullWidth ? "border rounded-lg" : ""}>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <div className="flex items-center justify-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Cargando...
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginación */}
      <div className={`flex flex-col gap-4 py-4 sm:flex-row sm:items-center sm:justify-between ${fullWidth ? 'px-0 mt-6' : 'px-6'}`}>
        <div className="text-sm text-muted-foreground">
          Mostrando {startItem} a {endItem} de {totalCount} resultados
        </div>
        
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
          <div className="flex items-center space-x-2">
            <p className="text-sm font-medium">Filas por página</p>
            <Select
              value={`${pageSize}`}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px]">
                <SelectValue placeholder={`${pageSize}`} />
              </SelectTrigger>
              <SelectContent side="top">
                {[10, 20, 30, 40, 50].map((size) => (
                  <SelectItem key={size} value={`${size}`}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex items-center gap-1">
            {/* Botón Primera Página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            
            {/* Botón Anterior */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            {/* Números de Página */}
            <div className="flex items-center gap-1">
              {generatePageNumbers().map((page, index) => {
                if (page === 'ellipsis-start' || page === 'ellipsis-end') {
                  return (
                    <div key={`ellipsis-${page}`} className="flex items-center justify-center h-8 w-8 text-sm text-muted-foreground">
                      ...
                    </div>
                  )
                }
                
                return (
                  <Button
                    key={`page-${page}`}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page as number)}
                    className="h-8 w-8 p-0"
                  >
                    {page}
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
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            
            {/* Botón Última Página */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </>
  )

  return fullWidth ? (
    <div className="w-full">
      {tableContent}
    </div>
  ) : (
    <Card>
      {tableContent}
    </Card>
  )
} 