'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter,
  Settings,
  Edit,
  Trash2,
  Eye,
  MoreHorizontal,
  Check,
  X
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { marketplaceApi, type MarketplaceAttribute } from '@/lib/api';

// Datos mock mientras implementamos la API real
const mockAttributes: MarketplaceAttribute[] = [
  {
    id: '1',
    code: 'brand',
    name: 'Marca',
    description: 'Marca del producto',
    type: 'select',
    is_required: true,
    is_filterable: true,
    is_searchable: true,
    options: ['Samsung', 'Apple', 'LG', 'Sony'],
    group_name: 'Básico',
    sort_order: 1,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    code: 'color',
    name: 'Color',
    description: 'Color principal del producto',
    type: 'multi_select',
    is_required: false,
    is_filterable: true,
    is_searchable: false,
    options: ['Rojo', 'Azul', 'Verde', 'Negro', 'Blanco'],
    group_name: 'Apariencia',
    sort_order: 2,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '3',
    code: 'weight',
    name: 'Peso',
    description: 'Peso del producto en gramos',
    type: 'number',
    is_required: false,
    is_filterable: true,
    is_searchable: false,
    unit: 'g',
    validation_rules: {
      min_value: 0,
      max_value: 50000
    },
    group_name: 'Físico',
    sort_order: 3,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '4',
    code: 'warranty',
    name: 'Garantía',
    description: 'Información de garantía del producto',
    type: 'text',
    is_required: false,
    is_filterable: false,
    is_searchable: true,
    group_name: 'Legal',
    sort_order: 4,
    is_active: false,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  },
  {
    id: '5',
    code: 'eco_friendly',
    name: 'Eco-Friendly',
    description: 'Producto ecológico',
    type: 'boolean',
    is_required: false,
    is_filterable: true,
    is_searchable: false,
    group_name: 'Sostenibilidad',
    sort_order: 5,
    is_active: true,
    created_at: '2024-01-15T10:00:00Z',
    updated_at: '2024-01-15T10:00:00Z'
  }
];

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

export default function MarketplaceAttributesPage() {
  const router = useRouter();
  const { token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();

  // Estados
  const [attributes, setAttributes] = useState<MarketplaceAttribute[]>(mockAttributes);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [groupFilter, setGroupFilter] = useState<string>('all');

  // Icono memoizado
  const headerIcon = useMemo(() => <Settings className="w-5 h-5 text-white" />, []);

  // Configurar header
  useEffect(() => {
    setHeaderProps({
      title: 'Atributos del Marketplace',
      subtitle: 'Gestión de atributos globales para productos',
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon]);

  // Obtener grupos únicos
  const groups = useMemo(() => {
    const uniqueGroups = [...new Set(attributes.map(attr => attr.group_name).filter(Boolean))];
    return uniqueGroups.sort();
  }, [attributes]);

  // Filtrar atributos
  const filteredAttributes = useMemo(() => {
    return attributes.filter(attribute => {
      const matchesSearch = attribute.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attribute.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           attribute.description?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesType = typeFilter === 'all' || attribute.type === typeFilter;
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'active' && attribute.is_active) ||
                           (statusFilter === 'inactive' && !attribute.is_active);
      const matchesGroup = groupFilter === 'all' || attribute.group_name === groupFilter;

      return matchesSearch && matchesType && matchesStatus && matchesGroup;
    });
  }, [attributes, searchTerm, typeFilter, statusFilter, groupFilter]);

  // Función para manejar eliminación
  const handleDelete = async (attributeId: string) => {
    if (confirm('¿Estás seguro de que deseas eliminar este atributo?')) {
      try {
        setLoading(true);
        // await marketplaceApi.deleteMarketplaceAttribute(attributeId, token);
        setAttributes(prev => prev.filter(attr => attr.id !== attributeId));
      } catch (error) {
        console.error('Error deleting attribute:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  // Función para toggle estado
  const handleToggleStatus = async (attributeId: string) => {
    try {
      setLoading(true);
      const attribute = attributes.find(attr => attr.id === attributeId);
      if (attribute) {
        // await marketplaceApi.updateMarketplaceAttribute(attributeId, { is_active: !attribute.is_active }, token);
        setAttributes(prev => prev.map(attr => 
          attr.id === attributeId ? { ...attr, is_active: !attr.is_active } : attr
        ));
      }
    } catch (error) {
      console.error('Error toggling attribute status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header con estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Atributos</p>
                <p className="text-2xl font-bold">{attributes.length}</p>
              </div>
              <Settings className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Activos</p>
                <p className="text-2xl font-bold text-green-600">
                  {attributes.filter(attr => attr.is_active).length}
                </p>
              </div>
              <Check className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Filtrables</p>
                <p className="text-2xl font-bold text-blue-600">
                  {attributes.filter(attr => attr.is_filterable).length}
                </p>
              </div>
              <Filter className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Grupos</p>
                <p className="text-2xl font-bold text-purple-600">{groups.length}</p>
              </div>
              <div className="h-8 w-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-purple-600">{groups.length}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Controles y filtros */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Atributos del Marketplace</CardTitle>
              <CardDescription>
                Gestiona los atributos globales disponibles para todos los productos
              </CardDescription>
            </div>
            <Button onClick={() => router.push('/marketplace-attributes/create')}>
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Atributo
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Búsqueda */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, código o descripción..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filtros */}
            <div className="flex gap-2">
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  <SelectItem value="text">Texto</SelectItem>
                  <SelectItem value="number">Número</SelectItem>
                  <SelectItem value="select">Selección</SelectItem>
                  <SelectItem value="multi_select">Selección Múltiple</SelectItem>
                  <SelectItem value="boolean">Sí/No</SelectItem>
                  <SelectItem value="date">Fecha</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Activos</SelectItem>
                  <SelectItem value="inactive">Inactivos</SelectItem>
                </SelectContent>
              </Select>

              <Select value={groupFilter} onValueChange={setGroupFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los grupos</SelectItem>
                  {groups.map(group => (
                    <SelectItem key={group} value={group}>{group}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Tabla */}
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Grupo</TableHead>
                  <TableHead>Propiedades</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[100px]">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAttributes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                      No se encontraron atributos que coincidan con los filtros
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAttributes.map((attribute) => (
                    <TableRow key={attribute.id}>
                      <TableCell className="font-mono text-sm">
                        {attribute.code}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{attribute.name}</div>
                          {attribute.description && (
                            <div className="text-sm text-muted-foreground">
                              {attribute.description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={attributeTypeColors[attribute.type]}>
                          {attributeTypeLabels[attribute.type]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {attribute.group_name && (
                          <Badge variant="outline">{attribute.group_name}</Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          {attribute.is_required && (
                            <Badge variant="secondary" className="text-xs">Requerido</Badge>
                          )}
                          {attribute.is_filterable && (
                            <Badge variant="secondary" className="text-xs">Filtrable</Badge>
                          )}
                          {attribute.is_searchable && (
                            <Badge variant="secondary" className="text-xs">Buscable</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(attribute.id)}
                          className={attribute.is_active ? 'text-green-600' : 'text-gray-400'}
                        >
                          {attribute.is_active ? (
                            <>
                              <Check className="h-4 w-4 mr-1" />
                              Activo
                            </>
                          ) : (
                            <>
                              <X className="h-4 w-4 mr-1" />
                              Inactivo
                            </>
                          )}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => router.push(`/marketplace-attributes/${attribute.id}`)}
                            >
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalles
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => router.push(`/marketplace-attributes/${attribute.id}/edit`)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDelete(attribute.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          {/* Footer con información */}
          <div className="flex items-center justify-between pt-4 text-sm text-muted-foreground">
            <div>
              Mostrando {filteredAttributes.length} de {attributes.length} atributos
            </div>
            <div className="flex items-center gap-4">
              <span>Activos: {filteredAttributes.filter(attr => attr.is_active).length}</span>
              <span>Inactivos: {filteredAttributes.filter(attr => !attr.is_active).length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 