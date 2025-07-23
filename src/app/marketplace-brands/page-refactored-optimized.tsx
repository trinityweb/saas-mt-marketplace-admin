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

// Importaciones optimizadas - imports directos para mejor performance
import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { Separator } from '@/components/shared-ui/atoms/separator';
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui/molecules/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared-ui/molecules/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shared-ui/organisms/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/shared-ui/organisms/table';
import { cn } from '@/components/shared-ui/utils/cn';

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
  verified: 'success',
  unverified: 'secondary',
  disputed: 'danger',
  pending: 'warning'
} as const;

const verificationStatusIcons = {
  verified: ShieldCheck,
  unverified: Shield,
  disputed: AlertTriangle,
  pending: Shield
};

export default function MarketplaceBrandsPageOptimized() {
  const router = useRouter();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  const [selectedBrand, setSelectedBrand] = useState<MarketplaceBrand | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Usar el hook personalizado
  const {
    brands,
    loading,
    stats,
    pagination,
    filters,
    setFilters,
    loadBrands,
    verifyBrand,
    unverifyBrand,
    updateBrand,
    deleteBrand
  } = useMarketplaceBrands({ adminToken: token || undefined });

  // Icono memoizado
  const headerIcon = useMemo(() => <Award className="w-5 h-5 text-white" />, []);

  // Configurar header con información dinámica
  useEffect(() => {
    const currentStart = pagination.total > 0 ? (pagination.page - 1) * pagination.limit + 1 : 0;
    const currentEnd = Math.min(pagination.page * pagination.limit, pagination.total);
    
    setHeaderProps({
      title: 'Gestión de Marcas',
      subtitle: `Administra las marcas globales del marketplace (${currentStart}-${currentEnd} de ${pagination.total})`,
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, pagination]);

  // Columnas de la tabla con componentes de shared-ui
  const columns: ColumnDef<MarketplaceBrand>[] = useMemo(() => [
    {
      accessorKey: 'name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Nombre
        </Button>
      ),
      cell: ({ row }) => {
        const brand = row.original;
        const StatusIcon = verificationStatusIcons[brand.verification_status];
        
        return (
          <div className="flex items-center gap-3">
            <StatusIcon className={cn(
              "w-5 h-5",
              brand.verification_status === 'verified' && "text-green-600",
              brand.verification_status === 'disputed' && "text-red-600",
              brand.verification_status === 'pending' && "text-yellow-600"
            )} />
            <div>
              <div className="font-medium">{brand.name}</div>
              <div className="text-sm text-muted-foreground">ID: {brand.id}</div>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: 'description',
      header: 'Descripción',
      cell: ({ row }) => (
        <div className="max-w-xs truncate">
          {row.original.description || 'Sin descripción'}
        </div>
      ),
    },
    {
      accessorKey: 'verification_status',
      header: 'Estado de Verificación',
      cell: ({ row }) => {
        const status = row.original.verification_status;
        return (
          <Badge variant={verificationStatusColors[status]}>
            {verificationStatusLabels[status]}
          </Badge>
        );
      },
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'success' : 'secondary'}>
          {row.original.is_active ? 'Activa' : 'Inactiva'}
        </Badge>
      ),
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const brand = row.original;

        const handleDelete = async () => {
          if (window.confirm(`¿Estás seguro de eliminar la marca "${brand.name}"?`)) {
            const success = await deleteBrand(brand.id);
            if (success) {
              await loadBrands();
            }
          }
        };

        const handleVerificationToggle = async () => {
          if (brand.verification_status === 'verified') {
            await unverifyBrand(brand.id);
          } else {
            await verifyBrand(brand.id);
          }
          await loadBrands();
        };

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <Eye className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => {
                setSelectedBrand(brand);
                setShowDetailsDialog(true);
              }}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalles
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/marketplace-brands/${brand.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleVerificationToggle}>
                {brand.verification_status === 'verified' ? (
                  <>
                    <X className="mr-2 h-4 w-4" />
                    Quitar verificación
                  </>
                ) : (
                  <>
                    <Check className="mr-2 h-4 w-4" />
                    Verificar marca
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleDelete}
                className="text-red-600 dark:text-red-400"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [deleteBrand, loadBrands, unverifyBrand, verifyBrand, router]);

  // Filtros configurables
  const brandFilters: FilterType[] = useMemo(() => [
    {
      type: 'select',
      key: 'verification_status',
      placeholder: 'Estado de verificación',
      value: filters.verification_status || 'all',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'verified', label: 'Verificadas' },
        { value: 'unverified', label: 'No verificadas' },
        { value: 'disputed', label: 'Disputadas' },
        { value: 'pending', label: 'Pendientes' }
      ],
      onChange: (value) => setFilters({ 
        verification_status: value === 'all' ? undefined : value as any 
      })
    },
    {
      type: 'select',
      key: 'is_active',
      placeholder: 'Estado',
      value: filters.is_active !== undefined ? filters.is_active.toString() : 'all',
      options: [
        { value: 'all', label: 'Todos' },
        { value: 'true', label: 'Activas' },
        { value: 'false', label: 'Inactivas' }
      ],
      onChange: (value) => setFilters({ 
        is_active: value === 'all' ? undefined : value === 'true' 
      })
    }
  ], [filters, setFilters]);

  // Mostrar estadísticas con componentes shared-ui
  const renderStats = () => {
    if (!stats) return null;

    return (
      <div className="grid gap-4 md:grid-cols-4 mb-6">
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
            <CardTitle className="text-sm font-medium">Activas</CardTitle>
            <Check className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Verificadas</CardTitle>
            <ShieldCheck className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivas</CardTitle>
            <X className="h-4 w-4 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inactive}</div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className="container mx-auto py-6">
      {renderStats()}
      
      <CriteriaDataTable
        columns={columns}
        data={brands}
        totalCount={pagination.total}
        currentPage={pagination.page}
        pageSize={pagination.limit}
        loading={loading}
        searchValue={filters.search || ''}
        searchPlaceholder="Buscar marcas..."
        buttonText="Crear Marca"
        filters={brandFilters}
        onCreateClick={() => router.push('/marketplace-brands/create')}
        onSearchChange={(value) => setFilters({ search: value })}
        onPageChange={(page) => setFilters({ page })}
        onPageSizeChange={(pageSize) => setFilters({ page_size: pageSize })}
        onSortChange={(sortBy, sortDir) => setFilters({ sort_by: sortBy, sort_dir: sortDir })}
        showSearch={true}
      />

      {/* Dialog de detalles usando shared-ui */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Marca</DialogTitle>
            <DialogDescription>
              Información completa sobre la marca seleccionada
            </DialogDescription>
          </DialogHeader>
          {selectedBrand && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <p className="text-sm text-muted-foreground">{selectedBrand.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">ID</label>
                  <p className="text-sm text-muted-foreground">{selectedBrand.id}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium">Descripción</label>
                <p className="text-sm text-muted-foreground">
                  {selectedBrand.description || 'Sin descripción'}
                </p>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <div className="mt-1">
                    <Badge variant={selectedBrand.is_active ? 'success' : 'secondary'}>
                      {selectedBrand.is_active ? 'Activa' : 'Inactiva'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <label className="text-sm font-medium">Verificación</label>
                  <div className="mt-1">
                    <Badge variant={verificationStatusColors[selectedBrand.verification_status]}>
                      {verificationStatusLabels[selectedBrand.verification_status]}
                    </Badge>
                  </div>
                </div>
              </div>
              
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Cerrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}