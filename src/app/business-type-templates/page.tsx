'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Plus, 
  Settings,
  CheckCircle,
  XCircle,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Copy,
  Download,
  Globe,
  MapPin
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

// Definir tipos para Business Type Templates
interface BusinessTypeTemplate {
  id: string;
  business_type_id: string;
  name: string;
  description: string;
  version: string;
  region: string;
  is_active: boolean;
  is_default: boolean;
  categories_count: number;
  attributes_count: number;
  products_count: number;
  created_at: string;
  updated_at: string;
  business_type?: {
    id: string;
    name: string;
    code: string;
  };
}

export default function BusinessTypeTemplatesPage() {
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [templates, setTemplates] = useState<BusinessTypeTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTypeTemplate | null>(null);

  // Estado para paginación simulada
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<BusinessTypeTemplate>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Icono memoizado para evitar recrear JSX
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Establecer header dinámico
  useEffect(() => {
    setHeaderProps({
      title: 'Plantillas de Tipos de Negocio',
      subtitle: 'Configuración quickstart para onboarding de tenants',
      backUrl: '/',
      backLabel: 'Volver al Dashboard',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Simulación de carga de datos (reemplazar con API real)
  useEffect(() => {
    const fetchTemplates = async () => {
      setLoading(true);
      try {
        // Simular API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos de ejemplo
        const mockTemplates: BusinessTypeTemplate[] = [
          {
            id: '1',
            business_type_id: 'retail-001',
            name: 'Tienda Retail Básica - Argentina',
            description: 'Configuración inicial para tiendas retail con productos básicos argentinos',
            version: '1.0.0',
            region: 'AR',
            is_active: true,
            is_default: true,
            categories_count: 15,
            attributes_count: 8,
            products_count: 150,
            business_type: {
              id: 'retail-001',
              name: 'Tienda Minorista',
              code: 'retail'
            },
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-20T15:30:00Z'
          },
          {
            id: '2',
            business_type_id: 'restaurant-001',
            name: 'Restaurante Típico Argentino',
            description: 'Plantilla para restaurantes con menú argentino tradicional',
            version: '1.2.0',
            region: 'AR',
            is_active: true,
            is_default: false,
            categories_count: 8,
            attributes_count: 12,
            products_count: 80,
            business_type: {
              id: 'restaurant-001',
              name: 'Restaurante',
              code: 'restaurant'
            },
            created_at: '2024-01-10T09:00:00Z',
            updated_at: '2024-01-25T11:15:00Z'
          },
          {
            id: '3',
            business_type_id: 'fashion-001',
            name: 'Moda y Textiles Premium',
            description: 'Configuración avanzada para tiendas de moda con atributos detallados',
            version: '2.0.0',
            region: 'GLOBAL',
            is_active: true,
            is_default: false,
            categories_count: 25,
            attributes_count: 20,
            products_count: 300,
            business_type: {
              id: 'fashion-001',
              name: 'Moda y Textiles',
              code: 'fashion'
            },
            created_at: '2024-01-05T14:00:00Z',
            updated_at: '2024-01-22T16:45:00Z'
          }
        ];
        
        setTemplates(mockTemplates);
      } catch (error) {
        console.error('Error loading templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, []);

  // Función para aplicar filtros y paginación a los datos
  const applyFiltersAndPagination = useCallback((criteria: SearchCriteria) => {
    if (!templates) {
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: 1,
        page_size: 20
      });
      return;
    }
    
    let filtered = [...templates];

    // Aplicar filtro de búsqueda
    if (criteria.search) {
      const searchTerm = criteria.search.toLowerCase();
      filtered = filtered.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.region.toLowerCase().includes(searchTerm) ||
        template.business_type?.name.toLowerCase().includes(searchTerm)
      );
    }

    // Aplicar filtro de estado activo
    if (criteria.is_active && criteria.is_active !== 'all') {
      const isActive = criteria.is_active === 'true';
      filtered = filtered.filter(template => template.is_active === isActive);
    }

    // Aplicar filtro de región
    if (criteria.region && criteria.region !== 'all') {
      filtered = filtered.filter(template => template.region === criteria.region);
    }

    // Aplicar filtro de plantilla por defecto
    if (criteria.is_default && criteria.is_default !== 'all') {
      const isDefault = criteria.is_default === 'true';
      filtered = filtered.filter(template => template.is_default === isDefault);
    }

    // Aplicar ordenamiento
    if (criteria.sort_by) {
      filtered.sort((a, b) => {
        const aValue = a[criteria.sort_by as keyof BusinessTypeTemplate];
        const bValue = b[criteria.sort_by as keyof BusinessTypeTemplate];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        const comparison = aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
        return criteria.sort_dir === 'desc' ? -comparison : comparison;
      });
    }

    // Aplicar paginación
    const page = criteria.page || 1;
    const pageSize = criteria.page_size || 20;
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    const paginatedData = filtered.slice(startIndex, endIndex);

    setCriteriaResponse({
      data: paginatedData,
      total_count: filtered.length,
      page,
      page_size: pageSize
    });
  }, [templates]);

  // Hook para manejar criterios de búsqueda
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      applyFiltersAndPagination(criteria);
    }
  });

  // Filtros configurables para plantillas
  const templateFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: criteriaState.criteria.is_active || 'all',
      options: [
        { value: 'all', label: 'Todos los estados' },
        { value: 'true', label: 'Activas' },
        { value: 'false', label: 'Inactivas' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_active', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'region',
      placeholder: 'Región',
      value: criteriaState.criteria.region || 'all',
      options: [
        { value: 'all', label: 'Todas las regiones' },
        { value: 'AR', label: 'Argentina' },
        { value: 'MX', label: 'México' },
        { value: 'GLOBAL', label: 'Global' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('region', value === 'all' ? undefined : value)
    },
    {
      type: 'select',
      key: 'is_default',
      placeholder: 'Tipo de plantilla',
      value: criteriaState.criteria.is_default || 'all',
      options: [
        { value: 'all', label: 'Todas las plantillas' },
        { value: 'true', label: 'Por defecto' },
        { value: 'false', label: 'Personalizadas' }
      ],
      onChange: (value) => criteriaState.handleFilterChange('is_default', value === 'all' ? undefined : value)
    }
  ], [criteriaState]);

  // Función para obtener el color del badge de estado
  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive 
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
  };

  // Función para obtener el color del badge de región
  const getRegionBadgeColor = (region: string) => {
    switch (region) {
      case 'AR':
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
      case 'MX':
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case 'GLOBAL':
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300";
    }
  };

  // Configuración de columnas para la tabla
  const columns: ColumnDef<BusinessTypeTemplate>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: 'Nombre de la Plantilla',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="space-y-1">
            <div className="font-medium">{template.name}</div>
            <div className="text-sm text-muted-foreground">
              {template.business_type?.name}
            </div>
            {template.is_default && (
              <Badge variant="outline" className="text-xs">
                Por Defecto
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'version',
      header: 'Versión',
      cell: ({ row }) => (
        <Badge variant="secondary">
          v{row.original.version}
        </Badge>
      ),
    },
    {
      accessorKey: 'region',
      header: 'Región',
      cell: ({ row }) => (
        <Badge className={getRegionBadgeColor(row.original.region)}>
          <Globe className="w-3 h-3 mr-1" />
          {row.original.region}
        </Badge>
      ),
    },
    {
      accessorKey: 'content_stats',
      header: 'Contenido',
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="text-sm space-y-1">
            <div>{template.categories_count} categorías</div>
            <div>{template.attributes_count} atributos</div>
            <div>{template.products_count} productos</div>
          </div>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge className={getStatusBadgeColor(row.original.is_active)}>
          {row.original.is_active ? (
            <>
              <CheckCircle className="w-3 h-3 mr-1" />
              Activa
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 mr-1" />
              Inactiva
            </>
          )}
        </Badge>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: 'Última Actualización',
      cell: ({ row }) => {
        const date = new Date(row.original.updated_at);
        return (
          <div className="text-sm">
            {date.toLocaleDateString('es-AR', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const template = row.original;
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => setSelectedTemplate(template)}
              >
                <Eye className="h-4 w-4 mr-2" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Link 
                  href={`/business-type-templates/${template.id}/edit`}
                  className="flex items-center w-full"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Copy className="h-4 w-4 mr-2" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], []);

  // Aplicar filtros iniciales cuando se carguen los datos
  useEffect(() => {
    if (templates.length > 0) {
      applyFiltersAndPagination(criteriaState.criteria);
    }
  }, [templates, applyFiltersAndPagination, criteriaState.criteria]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Plantillas de Tipos de Negocio</h1>
          <p className="text-muted-foreground">
            Gestiona las plantillas de configuración quickstart para el onboarding de tenants
          </p>
        </div>
        <Button asChild>
          <Link href="/business-type-templates/create">
            <Plus className="h-4 w-4 mr-2" />
            Nueva Plantilla
          </Link>
        </Button>
      </div>

      <CriteriaDataTable
        columns={columns}
        data={criteriaResponse.data}
        loading={loading}
        totalCount={criteriaResponse.total_count}
        page={criteriaResponse.page}
        pageSize={criteriaResponse.page_size}
        onPageChange={criteriaState.handlePageChange}
        onPageSizeChange={criteriaState.handlePageSizeChange}
        onSortChange={criteriaState.handleSortChange}
        filters={templateFilters}
        searchPlaceholder="Buscar plantillas por nombre, descripción o región..."
        searchValue={criteriaState.criteria.search || ''}
        onSearchChange={criteriaState.handleSearchChange}
        emptyStateTitle="No hay plantillas"
        emptyStateDescription="No se encontraron plantillas de tipos de negocio con los filtros aplicados."
      />

      {/* Modal de detalles */}
      <Dialog open={!!selectedTemplate} onOpenChange={() => setSelectedTemplate(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              {selectedTemplate?.name}
            </DialogTitle>
            <DialogDescription>
              Detalles de la plantilla de configuración quickstart
            </DialogDescription>
          </DialogHeader>
          
          {selectedTemplate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Tipo de Negocio</h4>
                  <p>{selectedTemplate.business_type?.name}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Versión</h4>
                  <p>v{selectedTemplate.version}</p>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Región</h4>
                  <Badge className={getRegionBadgeColor(selectedTemplate.region)}>
                    <Globe className="w-3 h-3 mr-1" />
                    {selectedTemplate.region}
                  </Badge>
                </div>
                <div>
                  <h4 className="font-medium text-sm text-muted-foreground">Estado</h4>
                  <Badge className={getStatusBadgeColor(selectedTemplate.is_active)}>
                    {selectedTemplate.is_active ? 'Activa' : 'Inactiva'}
                  </Badge>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">Descripción</h4>
                <p className="text-sm">{selectedTemplate.description}</p>
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.categories_count}</div>
                  <div className="text-sm text-muted-foreground">Categorías</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.attributes_count}</div>
                  <div className="text-sm text-muted-foreground">Atributos</div>
                </div>
                <div className="text-center p-4 bg-muted rounded-lg">
                  <div className="text-2xl font-bold">{selectedTemplate.products_count}</div>
                  <div className="text-sm text-muted-foreground">Productos</div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-2">
                <Button variant="outline" asChild>
                  <Link href={`/business-type-templates/${selectedTemplate.id}/edit`}>
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Link>
                </Button>
                <Button onClick={() => setSelectedTemplate(null)}>
                  Cerrar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 