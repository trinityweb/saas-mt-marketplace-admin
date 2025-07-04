'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
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
  MapPin,
  ArrowUpDown
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
import { marketplaceApi, BusinessTypeTemplate as ApiBusinessTypeTemplate } from '@/lib/api';

// Extender el tipo de la API con campos calculados para la UI
interface BusinessTypeTemplate extends ApiBusinessTypeTemplate {
  categories_count: number;
  attributes_count: number;
  products_count: number;
  brands_count: number;
  business_type?: {
    id: string;
    name: string;
    code: string;
  };
}

export default function BusinessTypeTemplatesPage() {
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  const [selectedTemplate, setSelectedTemplate] = useState<BusinessTypeTemplate | null>(null);

  // Hook para manejar criterios de búsqueda - MOVIDO ANTES de otros estados
  const criteriaState = useTableCriteria({
    defaultPageSize: 20,
    onSearch: (criteria: SearchCriteria) => {
      // La búsqueda será manejada por loadTemplates
      console.log('Search criteria:', criteria);
    }
  });

  // Estado para datos de la tabla
  const [templates, setTemplates] = useState<BusinessTypeTemplate[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [criteriaResponse, setCriteriaResponse] = useState<CriteriaResponse<BusinessTypeTemplate>>({
    data: [],
    total_count: 0,
    page: 1,
    page_size: 20
  });

  // Función para cargar datos directamente
  const loadTemplates = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = {
        page: criteriaState.criteria.page,
        page_size: criteriaState.criteria.page_size,
        sort_by: criteriaState.criteria.sort_by,
        sort_dir: criteriaState.criteria.sort_dir,
        search: criteriaState.criteria.search,
        region: criteriaState.criteria.region !== 'all' ? criteriaState.criteria.region : undefined,
        is_active: criteriaState.criteria.is_active === 'true' ? true : criteriaState.criteria.is_active === 'false' ? false : undefined,
        is_default: criteriaState.criteria.is_default === 'true' ? true : criteriaState.criteria.is_default === 'false' ? false : undefined,
      };

      console.log('🔄 Loading templates with criteria:', criteriaState.criteria);
      const response = await marketplaceApi.getBusinessTypeTemplates(params, token);
      
      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data) {
        // Manear items null como array vacío
        const items = response.data.items || [];
        // Mapear los datos de la API agregando campos calculados
        const templatesWithCounts: BusinessTypeTemplate[] = items.map(template => ({
          ...template,
          categories_count: template.categories?.length || 0,
          attributes_count: template.attributes?.length || 0,
          products_count: template.products?.length || 0,
          brands_count: template.brands?.length || 0,
          // Agregar datos simulados del business type por ahora
          business_type: {
            id: template.business_type_id,
            name: template.name.split(' - ')[0] || template.name,
            code: template.business_type_id.split('-')[0] || 'unknown'
          }
        }));

        console.log('📦 Received response:', {
          items_count: templatesWithCounts.length,
          total_count: response.data.total_count,
          page: response.data.page,
          first_item: templatesWithCounts[0]?.name
        });

        setTemplates(templatesWithCounts);
        setCriteriaResponse({
          data: templatesWithCounts,
          total_count: response.data.total_count,
          page: response.data.page,
          page_size: response.data.page_size
        });
      } else {
        // Si no hay data, establecer estado vacío
        setTemplates([]);
        setCriteriaResponse({
          data: [],
          total_count: 0,
          page: 1,
          page_size: 20
        });
      }
    } catch (err: any) {
      console.error('Error loading templates:', err);
      setError(err.message || 'Error al cargar plantillas de tipos de negocio');
      setTemplates([]);
      setCriteriaResponse({
        data: [],
        total_count: 0,
        page: criteriaState.criteria.page,
        page_size: criteriaState.criteria.page_size
      });
    } finally {
      setLoading(false);
    }
  }, [criteriaState.criteria, token]);

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

  // Cargar datos cuando cambien los criterios
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadTemplates();
    }, 100); // Pequeño debounce para evitar múltiples llamadas

    return () => clearTimeout(timeoutId);
  }, [loadTemplates]);

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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nombre de la Plantilla
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const template = row.original;
        return (
          <div className="font-medium">{template.name}</div>
        );
      },
    },
    {
      accessorKey: 'categories_count',
      header: () => (
        <div className="text-right font-semibold">
          Categorías
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-sm font-medium text-right">
          {row.original.categories_count}
        </div>
      ),
    },
    {
      accessorKey: 'brands_count',
      header: () => (
        <div className="text-right font-semibold">
          Marcas
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => {
        const brands_count = row.original.brands?.length || 0;
        return (
          <div className="text-sm font-medium text-right">
            {brands_count}
          </div>
        );
      },
    },
    {
      accessorKey: 'products_count',
      header: () => (
        <div className="text-right font-semibold">
          Productos
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-sm font-medium text-right">
          {row.original.products_count}
        </div>
      ),
    },
    {
      accessorKey: 'attributes_count',
      header: () => (
        <div className="text-right font-semibold">
          Atributos
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <div className="text-sm font-medium text-right">
          {row.original.attributes_count}
        </div>
      ),
    },
    {
      accessorKey: 'is_active',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Estado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Última Actualización
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
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

  if (error) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold">Error al cargar plantillas</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CriteriaDataTable
        columns={columns}
        data={criteriaResponse.data}
        totalCount={criteriaResponse.total_count}
        currentPage={criteriaResponse.page}
        pageSize={criteriaResponse.page_size}
        loading={loading}
        searchValue={criteriaState.criteria.search || ''}
        searchPlaceholder="Buscar plantillas por nombre, descripción o región..."
        buttonText="Nueva Plantilla"
        filters={templateFilters}
        fullWidth={true}
        onCreateClick={() => console.log('Create template clicked')}
        onSearchChange={criteriaState.handleSearchChange}
        onPageChange={criteriaState.handlePageChange}
        onPageSizeChange={criteriaState.handlePageSizeChange}
        onSortChange={criteriaState.handleSortChange}
        showSearch={true}
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