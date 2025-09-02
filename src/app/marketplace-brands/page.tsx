'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Award,
  Edit,
  Trash2,
  Eye,
  Check,
  X,
  ExternalLink,
  Shield,
  ShieldCheck,
  AlertTriangle,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui/molecules/card';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useMarketplaceBrands } from '@/hooks/use-marketplace-brands';
import { useMarketplaceOverview } from '@/hooks/use-marketplace-overview';
import { type MarketplaceBrand } from '@/lib/api';
import { CriteriaDataTable } from '@/components/ui/criteria-data-table';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared-ui/molecules/dropdown-menu';

const verificationStatusLabels = {
  verified: 'Verificada',
  unverified: 'No verificada', 
  disputed: 'Disputada',
  pending: 'Pendiente'
};

const verificationStatusColors = {
  verified: 'bg-green-100 text-green-800',
  unverified: 'bg-gray-100 text-gray-800',
  disputed: 'bg-red-100 text-red-800',
  pending: 'bg-yellow-100 text-yellow-800'
};

const verificationStatusIcons = {
  verified: ShieldCheck,
  unverified: Shield,
  disputed: AlertTriangle,
  pending: Shield
};

export default function MarketplaceBrandsPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  
  // Hook para overview de brands
  const { 
    data: overviewData, 
    loading: overviewLoading, 
    error: overviewError 
  } = useMarketplaceOverview({ 
    sections: ['brands'], 
    includeStats: true 
  });
  
  // Usar el hook personalizado
  const {
    brands,
    loading,
    stats,
    pagination,
    loadBrands,
    verifyBrand,
    unverifyBrand,
    updateBrand,
    deleteBrand
  } = useMarketplaceBrands({ adminToken: token || undefined });

  // Icono memoizado
  const headerIcon = useMemo(() => <Award className="w-5 h-5 text-white" />, []);

  // Configurar header con información dinámica de paginación
  useEffect(() => {
    // Asegurar que tenemos datos válidos antes de calcular
    const safeOffset = pagination?.offset || 0;
    const safeLimit = pagination?.limit || 20;
    const safeTotal = pagination?.total || 0;
    
    const currentStart = safeTotal > 0 ? safeOffset + 1 : 0;
    const currentEnd = Math.min(safeOffset + safeLimit, safeTotal);
    
    setHeaderProps({
      title: 'Gestión de Marcas',
      subtitle: `Administra las marcas globales del marketplace (${currentStart}-${currentEnd} de ${safeTotal})`,
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, pagination]);

  // Configuración de columnas para la tabla
  const columns: ColumnDef<MarketplaceBrand>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Marca
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const brand = row.original;
        return (
          <div className="flex items-center space-x-3">
            {brand.logo_url && (
              <img 
                src={brand.logo_url} 
                alt={brand.name}
                className="w-8 h-8 rounded object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            )}
            <div>
              <div className="font-medium">{brand.name}</div>
              {brand.aliases && brand.aliases.length > 0 && (
                <div className="text-sm text-muted-foreground">
                  Alias: {brand.aliases.slice(0, 2).join(', ')}
                  {brand.aliases.length > 2 && ` +${brand.aliases.length - 2}`}
                </div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'verification_status',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Verificación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const brand = row.original;
        const StatusIcon = verificationStatusIcons[brand.verification_status];
        return (
          <Badge className={verificationStatusColors[brand.verification_status]}>
            <StatusIcon className="w-3 h-3 mr-1" />
            {verificationStatusLabels[brand.verification_status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'quality_score',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Calidad
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const brand = row.original;
        // Ajustar el score - si es mayor a 1, dividirlo por 10 para normalizarlo
        const normalizedScore = brand.quality_score > 1 ? brand.quality_score / 10 : brand.quality_score;
        const score = Math.round(normalizedScore * 100);
        return (
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">{score}%</div>
            <div className="w-16 bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full" 
                style={{ width: `${score}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'product_count',
      header: () => (
        <div className="font-semibold">
          Productos
        </div>
      ),
      enableSorting: false,
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.product_count || 0}</span>
      ),
    },
    {
      accessorKey: 'country_code',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          País
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <span className="text-sm">{row.original.country_code || 'N/A'}</span>
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
        <Badge variant={row.original.is_active ? "default" : "secondary"}>
          {row.original.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const brand = row.original;
        
        const handleVerify = async () => {
          try {
            await verifyBrand(brand.id);
          } catch (error) {
            console.error('Error verifying brand:', error);
          }
        };

        const handleUnverify = async () => {
          try {
            await unverifyBrand(brand.id);
          } catch (error) {
            console.error('Error unverifying brand:', error);
          }
        };

        const handleDelete = async () => {
          const confirmed = confirm(`¿Estás seguro de que quieres eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`);
          if (!confirmed) return;

          try {
            await deleteBrand(brand.id);
          } catch (error) {
            console.error('Error deleting brand:', error);
            alert('Error al eliminar la marca. Por favor, inténtalo de nuevo.');
          }
        };

        const handleToggleStatus = async () => {
          try {
            await updateBrand(brand.id, {
              is_active: !brand.is_active
            });
          } catch (error) {
            console.error('Error toggling status:', error);
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
              <DropdownMenuItem onClick={() => router.push(`/marketplace-brands/${brand.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/marketplace-brands/${brand.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {brand.verification_status !== 'verified' ? (
                <DropdownMenuItem onClick={handleVerify}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verificar
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={handleUnverify}>
                  <Shield className="mr-2 h-4 w-4" />
                  Quitar verificación
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={handleToggleStatus}>
                {brand.is_active ? (
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
              <DropdownMenuItem onClick={handleDelete} className="text-red-600 dark:text-red-400">
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [verifyBrand, unverifyBrand, updateBrand, deleteBrand, router]);

  // Obtener países únicos para filtro
  const countries = useMemo(() => {
    if (!brands || brands.length === 0) return [];
    return [...new Set(brands.map(brand => brand.country_code).filter(Boolean))];
  }, [brands]);

  // Configuración de filtros
  const brandFilters: FilterType[] = useMemo(() => {
    const baseFilters = [
      {
        type: 'select' as const,
        key: 'verification',
        placeholder: 'Estado de verificación',
        value: 'all',
        onChange: () => {},
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'verified', label: 'Verificadas' },
          { value: 'unverified', label: 'No verificadas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'disputed', label: 'Disputadas' }
        ]
      },
      {
        type: 'select' as const,
        key: 'status',
        placeholder: 'Estado',
        value: 'all',
        onChange: () => {},
        options: [
          { value: 'all', label: 'Todos' },
          { value: 'active', label: 'Activas' },
          { value: 'inactive', label: 'Inactivas' }
        ]
      }
    ];

    // Agregar filtro de país solo si hay países disponibles
    if (countries.length > 0) {
      baseFilters.push({
        type: 'select' as const,
        key: 'country',
        placeholder: 'Filtrar por país',
        value: 'all',
        onChange: () => {},
        options: [
          { value: 'all', label: 'Todos los países' },
          ...countries.map(country => ({ value: country, label: country }))
        ]
      });
    }

    return baseFilters;
  }, [countries]);

  // Calcular valores de paginación para CriteriaDataTable
  const safeTotal = pagination?.total || 0;
  const safeLimit = pagination?.limit || 20;
  const safeOffset = pagination?.offset || 0;
  const currentPage = safeLimit > 0 ? Math.floor(safeOffset / safeLimit) + 1 : 1;

  const handlePageChange = (page: number) => {
    loadBrands({ page: page, page_size: safeLimit });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadBrands({ page: 1, page_size: pageSize });
  };

  const handleSearchChange = (value: string) => {
    loadBrands({ search: value, page: 1 });
  };

  // Combinar estadísticas locales con datos del overview
  const enhancedStats = {
    total: overviewData?.brands?.total_brands || stats.total,
    verified: overviewData?.brands?.verified_brands || stats.verified,
    unverified: (overviewData?.brands?.total_brands - overviewData?.brands?.verified_brands) || stats.unverified,
    active: stats.active, // Mantenemos locales ya que overview no los separa así
    inactive: stats.inactive, // Mantenemos locales
  };

  return (
    <div className="space-y-6">
      {/* Overview Status */}
      {overviewError && (
        <div className="rounded-md bg-yellow-50 p-3 border border-yellow-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <Award className="h-4 w-4 text-yellow-400" />
            </div>
            <div className="ml-3">
              <p className="text-xs text-yellow-800">
                Overview no disponible - Usando datos locales: {overviewError}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Marcas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{enhancedStats.total}</div>
            {overviewData?.brands && (
              <div className="text-xs text-green-600 mt-1">Overview activo</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificadas</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{enhancedStats.verified}</div>
            {overviewData?.brands && (
              <div className="text-xs text-green-600 mt-1">Overview activo</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Verificadas</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{enhancedStats.unverified}</div>
            {overviewData?.brands && (
              <div className="text-xs text-green-600 mt-1">Overview activo</div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Check className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{enhancedStats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{enhancedStats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla con CriteriaDataTable */}
      <CriteriaDataTable
        data={brands || []}
        columns={columns}
        totalCount={safeTotal}
        currentPage={currentPage}
        pageSize={safeLimit}
        loading={loading}
        searchValue=""
        searchPlaceholder="Buscar por nombre o alias de marca..."
        buttonText="Nueva Marca"
        filters={brandFilters}
        fullWidth={true}
        onCreateClick={() => router.push('/marketplace-brands/create')}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={(sortBy: string, sortDir: 'asc' | 'desc') => {
          loadBrands({ sort_by: sortBy, sort_dir: sortDir, page: 1 });
        }}
      />
    </div>
  );
} 