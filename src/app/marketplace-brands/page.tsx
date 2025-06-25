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
  AlertTriangle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useMarketplaceBrands } from '@/hooks/use-marketplace-brands';
import { type MarketplaceBrand } from '@/lib/api';
import { CriteriaDataTable } from '@/components/ui/criteria-data-table';
import { Filter as FilterType } from '@/components/ui/table-toolbar';
import { ColumnDef } from '@tanstack/react-table';

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
  } = useMarketplaceBrands({ adminToken: token });

  // Estados locales para filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [countryFilter, setCountryFilter] = useState<string>('all');

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
      header: 'Marca',
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
      header: 'Verificación',
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
      header: 'Calidad',
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
      header: 'Productos',
      cell: ({ row }) => (
        <span className="text-sm font-medium">{row.original.product_count || 0}</span>
      ),
    },
    {
      accessorKey: 'country_code',
      header: 'País',
      cell: ({ row }) => (
        <span className="text-sm">{row.original.country_code || 'N/A'}</span>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
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
        return (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/marketplace-brands/${brand.id}`)}
              title="Ver detalles"
            >
              <Eye className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push(`/marketplace-brands/${brand.id}/edit`)}
              title="Editar marca"
            >
              <Edit className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDelete(brand.id)}
              title="Eliminar marca"
              className="text-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ], [router]);

  // Obtener países únicos para el filtro
  const countries = useMemo(() => {
    if (!brands) return [];
    const uniqueCountries = [...new Set(brands.map(brand => brand.country_code).filter(Boolean))];
    return uniqueCountries.sort();
  }, [brands]);

  // Configurar filtros para CriteriaDataTable
  const filters: FilterType[] = useMemo(() => {
    const baseFilters: FilterType[] = [
      {
        type: 'select',
        key: 'verification',
        placeholder: 'Estado de verificación',
        value: verificationFilter,
        onChange: setVerificationFilter,
        options: [
          { value: 'all', label: 'Todas' },
          { value: 'verified', label: 'Verificadas' },
          { value: 'unverified', label: 'No verificadas' },
          { value: 'pending', label: 'Pendientes' },
          { value: 'disputed', label: 'Disputadas' }
        ]
      },
      {
        type: 'select',
        key: 'status',
        placeholder: 'Estado',
        value: statusFilter,
        onChange: setStatusFilter,
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
        type: 'select',
        key: 'country',
        placeholder: 'Filtrar por país',
        value: countryFilter,
        onChange: setCountryFilter,
        options: [
          { value: 'all', label: 'Todos los países' },
          ...countries.map(country => ({ value: country, label: country }))
        ]
      });
    }

    return baseFilters;
  }, [verificationFilter, statusFilter, countryFilter, countries]);

  // Filtrar marcas localmente
  const filteredBrands = useMemo(() => {
    if (!brands || brands.length === 0) return [];
    
    return brands.filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           brand.normalized_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           (brand.aliases && brand.aliases.some(alias => alias.toLowerCase().includes(searchTerm.toLowerCase())));
                           
      const matchesVerification = verificationFilter === 'all' || brand.verification_status === verificationFilter;
      const matchesStatus = statusFilter === 'all' || (statusFilter === 'active' ? brand.is_active : !brand.is_active);
      const matchesCountry = countryFilter === 'all' || brand.country_code === countryFilter;

      return matchesSearch && matchesVerification && matchesStatus && matchesCountry;
    });
  }, [brands, searchTerm, verificationFilter, statusFilter, countryFilter]);

  const handleVerify = async (brandId: string) => {
    try {
      await verifyBrand(brandId);
    } catch (error) {
      console.error('Error verifying brand:', error);
    }
  };

  const handleUnverify = async (brandId: string) => {
    try {
      await unverifyBrand(brandId);
    } catch (error) {
      console.error('Error unverifying brand:', error);
    }
  };

  const handleDelete = async (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (!brand) return;

    const confirmed = confirm(`¿Estás seguro de que quieres eliminar la marca "${brand.name}"? Esta acción no se puede deshacer.`);
    if (!confirmed) return;

    try {
      await deleteBrand(brandId);
    } catch (error) {
      console.error('Error deleting brand:', error);
      alert('Error al eliminar la marca. Por favor, inténtalo de nuevo.');
    }
  };

  const handleToggleStatus = async (brandId: string) => {
    try {
      const brand = brands.find(b => b.id === brandId);
      if (brand) {
        await updateBrand(brandId, {
          is_active: !brand.is_active
        });
      }
    } catch (error) {
      console.error('Error toggling status:', error);
    }
  };

  // Calcular valores de paginación seguros para CriteriaDataTable
  const safeTotal = pagination?.total || 0;
  const safeLimit = pagination?.limit || 20;
  const safeOffset = pagination?.offset || 0;
  const currentPage = safeLimit > 0 ? Math.floor(safeOffset / safeLimit) + 1 : 1;

  const handlePageChange = (page: number) => {
    // page es 1-based, enviamos directamente al backend
    loadBrands({ page: page, page_size: safeLimit });
  };

  const handlePageSizeChange = (pageSize: number) => {
    loadBrands({ page: 1, page_size: pageSize });
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Marcas</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificadas</CardTitle>
            <ShieldCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">No Verificadas</CardTitle>
            <Shield className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.unverified}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Check className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.active}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
            <X className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla con CriteriaDataTable integrada */}
      <CriteriaDataTable
        data={filteredBrands}
        columns={columns}
        totalCount={safeTotal}
        currentPage={currentPage}
        pageSize={safeLimit}
        loading={loading}
        searchValue={searchTerm}
        searchPlaceholder="Buscar por nombre o alias de marca..."
        buttonText="Nueva Marca"
        filters={filters}
        onCreateClick={() => router.push('/marketplace-brands/create')}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onSortChange={(sort) => {
          console.log('🔀 Sort changed:', sort);
          // TODO: implementar ordenamiento
        }}
      />
    </div>
  );
} 