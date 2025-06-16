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
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { TableToolbar, Filter } from "@/components/ui/table-toolbar"
import { Loader2, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

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

  return (
    <Card>
      <div>
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
      
      <div>
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
      <div className="flex items-center justify-between space-x-2 py-4 px-6">
        <div className="text-sm text-muted-foreground">
          Mostrando {startItem} a {endItem} de {totalCount} resultados
        </div>
        
        <div className="flex items-center space-x-6 lg:space-x-8">
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
          
          <div className="flex w-[100px] items-center justify-center text-sm font-medium">
            Página {currentPage} de {totalPages}
          </div>
          
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Ir a la primera página</span>
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
            >
              <span className="sr-only">Ir a la página anterior</span>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="h-8 w-8 p-0"
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Ir a la página siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="hidden h-8 w-8 p-0 lg:flex"
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
            >
              <span className="sr-only">Ir a la última página</span>
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  )
} 