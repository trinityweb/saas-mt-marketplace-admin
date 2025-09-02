'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
  ArrowLeft,
  Plus,
  Settings,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Tag,
  Hash,
  Check,
  X,
  Filter
} from 'lucide-react';

import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useMarketplaceAttributes } from '@/hooks/use-marketplace-attributes';
import { 
  type MarketplaceAttributeWithValues, 
  type MarketplaceAttributeValue,
  marketplaceApi 
} from '@/lib/api';
import { CriteriaDataTable } from '@/components/ui/criteria-data-table';
import { ColumnDef } from '@tanstack/react-table';

const attributeTypeLabels = {
  text: 'Texto',
  number: 'Número',
  select: 'Selección',
  multi_select: 'Selección Múltiple',
  boolean: 'Sí/No',
  date: 'Fecha'
};

const attributeTypeColors = {
  text: 'bg-blue-100 text-blue-800',
  number: 'bg-green-100 text-green-800',
  select: 'bg-purple-100 text-purple-800',
  multi_select: 'bg-pink-100 text-pink-800',
  boolean: 'bg-yellow-100 text-yellow-800',
  date: 'bg-indigo-100 text-indigo-800'
};

const attributeTypeIcons = {
  text: Hash,
  number: Hash,
  select: Filter,
  multi_select: Filter,
  boolean: Check,
  date: Hash
};

export default function MarketplaceAttributeDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  const { deleteAttributeValue, updateAttributeValue } = useMarketplaceAttributes({ adminToken: token || undefined });

  // Estados
  const [attribute, setAttribute] = useState<MarketplaceAttributeWithValues | null>(null);
  const [attributeValues, setAttributeValues] = useState<MarketplaceAttributeValue[]>([]);
  const [loading, setLoading] = useState(true);
  const [valuesLoading, setValuesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [totalCount, setTotalCount] = useState(0);

  const attributeId = params.id as string;

  // Icono memoizado
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Cargar datos del atributo
  const loadAttribute = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await marketplaceApi.getMarketplaceAttributeWithValues(attributeId, token || undefined);
      
      if (response.error) {
        setError(response.error);
        return;
      }

      if (response.data) {
        setAttribute(response.data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar el atributo');
    } finally {
      setLoading(false);
    }
  };

  // Cargar valores del atributo con paginación
  const loadAttributeValues = async () => {
    try {
      setValuesLoading(true);
      const response = await marketplaceApi.getAllMarketplaceAttributeValues(
        attributeId,
        {
          page: currentPage,
          page_size: pageSize,
          search: searchValue || undefined
        },
        token || undefined
      );
      
      if (response.data) {
        setAttributeValues(response.data.attribute_values || []);
        setTotalCount(response.data.total || 0);
      }
    } catch (err) {
      console.error('Error loading attribute values:', err);
    } finally {
      setValuesLoading(false);
    }
  };

  // Configurar header
  useEffect(() => {
    if (attribute) {
      setHeaderProps({
        title: `Atributo: ${attribute.name}`,
        subtitle: `Gestión de valores para el atributo ${attribute.code}`,
        icon: headerIcon
      });
    }

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, attribute]);

  // Cargar datos iniciales
  useEffect(() => {
    if (attributeId) {
      loadAttribute();
    }
  }, [attributeId]);

  // Cargar valores cuando cambian los parámetros
  useEffect(() => {
    if (attributeId) {
      loadAttributeValues();
    }
  }, [attributeId, currentPage, pageSize, searchValue]);

  // Configuración de columnas para la tabla de valores
  const valuesColumns: ColumnDef<MarketplaceAttributeValue>[] = useMemo(() => [
    {
      accessorKey: 'value',
      header: 'Valor',
      cell: ({ row }) => {
        const value = row.original;
        return (
          <div>
            <div className="font-medium">{value.value}</div>
            {value.display_name && value.display_name !== value.value && (
              <div className="text-sm text-muted-foreground">
                Mostrar como: {value.display_name}
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'sort_order',
      header: 'Orden',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.sort_order}</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      accessorKey: 'created_at',
      header: 'Creado',
      cell: ({ row }) => {
        const date = new Date(row.original.created_at);
        return (
          <span className="text-sm text-muted-foreground">
            {date.toLocaleDateString('es-ES', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </span>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const value = row.original;

        const handleEdit = () => {
          // TODO: Implementar modal de edición
          console.log('Editar valor:', value);
        };

        const handleDelete = async () => {
          if (window.confirm(`¿Estás seguro de que deseas eliminar el valor "${value.value}"?`)) {
            try {
              await deleteAttributeValue(attributeId, value.id);
              await loadAttributeValues(); // Recargar valores
            } catch (error) {
              console.error('Error al eliminar valor:', error);
              alert('Error al eliminar el valor');
            }
          }
        };

        const handleToggleStatus = async () => {
          try {
            await updateAttributeValue(attributeId, value.id, {
              is_active: !value.is_active
            });
            await loadAttributeValues(); // Recargar valores
          } catch (error) {
            console.error('Error al cambiar estado:', error);
            alert('Error al cambiar el estado del valor');
          }
        };

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
              <DropdownMenuItem onClick={handleEdit}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleStatus}>
                {value.is_active ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Desactivar
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Activar
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 focus:text-red-600"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [attributeId, deleteAttributeValue, updateAttributeValue, loadAttributeValues]);

  // Handlers
  const handleBack = () => {
    router.push('/marketplace-attributes');
  };

  const handleEdit = () => {
    router.push(`/marketplace-attributes/${attributeId}/edit`);
  };

  const handleCreateValue = () => {
    // TODO: Implementar modal de creación
    console.log('Crear nuevo valor para atributo:', attributeId);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // Reset a primera página
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setCurrentPage(1); // Reset a primera página
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-muted-foreground">Cargando atributo...</p>
        </div>
      </div>
    );
  }

  if (error || !attribute) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Atributo no encontrado'}</p>
          <Button onClick={handleBack} variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver a la lista
          </Button>
        </div>
      </div>
    );
  }

  const TypeIcon = attributeTypeIcons[attribute.type];

  return (
    <div className="space-y-6">
      {/* Header con navegación */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver
        </Button>
      </div>

      {/* Información del atributo (Cabecera) */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className={`p-2 rounded-lg ${attributeTypeColors[attribute.type]} bg-opacity-20`}>
                <TypeIcon className="w-6 h-6" />
              </div>
              <div>
                <CardTitle className="text-2xl">{attribute.name}</CardTitle>
                <CardDescription className="text-lg">
                  Código: <code className="font-mono">{attribute.code}</code>
                </CardDescription>
                {attribute.description && (
                  <p className="text-sm text-muted-foreground mt-2">
                    {attribute.description}
                  </p>
                )}
              </div>
            </div>
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar Atributo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Información básica */}
            <div>
              <h4 className="font-medium mb-3">Información Básica</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Tipo:</span>
                  <Badge className={attributeTypeColors[attribute.type]}>
                    <TypeIcon className="w-3 h-3 mr-1" />
                    {attributeTypeLabels[attribute.type]}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Estado:</span>
                  <Badge variant={attribute.is_active ? "default" : "secondary"}>
                    {attribute.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Grupo:</span>
                  <div className="flex items-center gap-1">
                    <Tag className="w-3 h-3 text-muted-foreground" />
                    <span className="text-sm">{attribute.group_name || 'Sin grupo'}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Orden:</span>
                  <span className="text-sm font-medium">{attribute.sort_order}</span>
                </div>
              </div>
            </div>

            {/* Propiedades */}
            <div>
              <h4 className="font-medium mb-3">Propiedades</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Check className={`w-4 h-4 ${attribute.is_required ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className="text-sm">Requerido</span>
                </div>
                <div className="flex items-center gap-2">
                  <Filter className={`w-4 h-4 ${attribute.is_filterable ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className="text-sm">Filtrable</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className={`w-4 h-4 ${attribute.is_searchable ? 'text-green-600' : 'text-gray-300'}`} />
                  <span className="text-sm">Buscable</span>
                </div>
              </div>
            </div>

            {/* Estadísticas */}
            <div>
              <h4 className="font-medium mb-3">Estadísticas</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total valores:</span>
                  <span className="text-sm font-medium">{attribute.values_count || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valores activos:</span>
                  <span className="text-sm font-medium text-green-600">
                    {attributeValues.filter(v => v.is_active).length}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Valores inactivos:</span>
                  <span className="text-sm font-medium text-red-600">
                    {attributeValues.filter(v => !v.is_active).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Valores del atributo (Detalle) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold">Valores del Atributo</h3>
            <p className="text-sm text-muted-foreground">
              Gestiona los valores disponibles para este atributo
            </p>
          </div>
        </div>

        <CriteriaDataTable
          columns={valuesColumns}
          data={attributeValues}
          totalCount={totalCount}
          currentPage={currentPage}
          pageSize={pageSize}
          loading={valuesLoading}
          searchValue={searchValue}
          searchPlaceholder="Buscar valores..."
          buttonText="Agregar Valor"
          onCreateClick={handleCreateValue}
          onSearchChange={handleSearchChange}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          showSearch={true}
          filters={[]}
        />
      </div>
    </div>
  );
} 