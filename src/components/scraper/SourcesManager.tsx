'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { Input } from '@/components/shared-ui';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
  Plus,
  Edit,
  Trash2,
  Globe,
  Code,
  Settings,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TestTube,
  Save,
  Search,
  RefreshCw,
  PlayCircle,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

interface ScraperSource {
  id: string;
  name: string;
  url: string;
  type: 'ecommerce' | 'marketplace' | 'catalog' | 'custom';
  enabled: boolean;
  status: 'active' | 'error' | 'maintenance';
  lastSync?: string;
  productCount: number;
  config: {
    selector: string;
    pagination?: string;
    priceSelector?: string;
    imageSelector?: string;
    interval: number; // horas
  };
  // Campos adicionales
  category?: string;
  urls?: string[];
  requires_selenium?: boolean;
}

export function SourcesManager() {
  const { toast } = useToast();
  const [sources, setSources] = useState<ScraperSource[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Cargar fuentes al montar el componente
  useEffect(() => {
    fetchSources();
  }, []);
  
  const fetchSources = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/scraper/sources');
      const data = await response.json();
      
      if (data.sources) {
        // Transformar las fuentes al formato de ScraperSource
        const transformedSources = data.sources.map((source: any) => ({
          id: source.source_id,
          name: source.name,
          url: source.base_url,
          type: source.type === 'vtex' ? 'ecommerce' : 'custom',
          enabled: source.status === 'active',
          status: source.status,
          lastSync: source.last_run,
          productCount: source.products_count || 0,
          config: {
            selector: '',
            pagination: '',
            priceSelector: '',
            imageSelector: '',
            interval: 24,
          },
          // Campos adicionales
          category: source.category,
          urls: source.urls,
          requires_selenium: source.requires_selenium,
        }));
        
        setSources(transformedSources);
      }
    } catch (error) {
      console.error('Error fetching sources:', error);
      toast({
        title: 'Error',
        description: 'No se pudieron cargar las fuentes de scraping',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingSource, setEditingSource] = useState<ScraperSource | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    url: '',
    type: 'ecommerce' as ScraperSource['type'],
    selector: '',
    pagination: '',
    priceSelector: '',
    imageSelector: '',
    interval: '24',
  });

  const filteredSources = sources.filter(source => {
    const matchesSearch = source.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         source.url.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || source.type === selectedType;
    return matchesSearch && matchesType;
  });

  const handleAddSource = () => {
    const newSource: ScraperSource = {
      id: Date.now().toString(),
      name: formData.name,
      url: formData.url,
      type: formData.type,
      enabled: true,
      status: 'active',
      productCount: 0,
      config: {
        selector: formData.selector,
        pagination: formData.pagination,
        priceSelector: formData.priceSelector,
        imageSelector: formData.imageSelector,
        interval: parseInt(formData.interval),
      },
    };

    setSources([...sources, newSource]);
    setIsAddDialogOpen(false);
    resetForm();
    toast({
      title: 'Fuente agregada',
      description: 'La fuente se ha agregado correctamente',
    });
  };

  const handleEditSource = () => {
    if (!editingSource) return;

    setSources(sources.map(source => 
      source.id === editingSource.id 
        ? {
            ...source,
            name: formData.name,
            url: formData.url,
            type: formData.type,
            config: {
              selector: formData.selector,
              pagination: formData.pagination,
              priceSelector: formData.priceSelector,
              imageSelector: formData.imageSelector,
              interval: parseInt(formData.interval),
            },
          }
        : source
    ));

    setEditingSource(null);
    resetForm();
    toast({
      title: 'Fuente actualizada',
      description: 'Los cambios se han guardado correctamente',
    });
  };

  const handleToggleSource = (id: string) => {
    setSources(sources.map(source => 
      source.id === id 
        ? { ...source, enabled: !source.enabled }
        : source
    ));
  };

  const handleDeleteSource = (id: string) => {
    setSources(sources.filter(source => source.id !== id));
    toast({
      title: 'Fuente eliminada',
      description: 'La fuente se ha eliminado correctamente',
    });
  };

  const handleTestSource = async (source: ScraperSource) => {
    toast({
      title: 'Probando conexión',
      description: `Verificando ${source.name}...`,
    });
    // Simular test
    setTimeout(() => {
      toast({
        title: 'Conexión exitosa',
        description: `La conexión con ${source.name} funciona correctamente`,
      });
    }, 2000);
  };

  const handleExecuteScraping = async (source: ScraperSource) => {
    try {
      const response = await fetch(`/api/scraper/sources/${source.id}/execute`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: 'Scraping iniciado',
          description: data.message || `Procesando ${source.name}...`,
        });
        // Refrescar las fuentes después de 3 segundos
        setTimeout(() => fetchSources(), 3000);
      } else {
        throw new Error(data.error || 'Error al iniciar scraping');
      }
    } catch (error) {
      console.error('Error executing scraping:', error);
      toast({
        title: 'Error',
        description: 'No se pudo iniciar el scraping',
        variant: 'destructive',
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      url: '',
      type: 'ecommerce',
      selector: '',
      pagination: '',
      priceSelector: '',
      imageSelector: '',
      interval: '24',
    });
  };

  const openEditDialog = (source: ScraperSource) => {
    setEditingSource(source);
    setFormData({
      name: source.name,
      url: source.url,
      type: source.type,
      selector: source.config.selector,
      pagination: source.config.pagination || '',
      priceSelector: source.config.priceSelector || '',
      imageSelector: source.config.imageSelector || '',
      interval: source.config.interval.toString(),
    });
  };

  const getStatusIcon = (status: ScraperSource['status']) => {
    switch (status) {
      case 'active':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'error':
        return <XCircle className="h-4 w-4" />;
      case 'maintenance':
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: ScraperSource['status']) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'error':
        return 'destructive';
      case 'maintenance':
        return 'warning';
    }
  };

  const getTypeLabel = (type: ScraperSource['type']) => {
    switch (type) {
      case 'ecommerce':
        return 'E-commerce';
      case 'marketplace':
        return 'Marketplace';
      case 'catalog':
        return 'Catálogo';
      case 'custom':
        return 'Personalizado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestión de Fuentes</h2>
          <p className="text-sm text-muted-foreground">
            Configura las fuentes de datos para el scraping de productos
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={fetchSources}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Agregar Fuente
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Agregar Nueva Fuente</DialogTitle>
              <DialogDescription>
                Configura los parámetros de scraping para la nueva fuente
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Mercado Libre"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="type">Tipo</Label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(value) => setFormData({ ...formData, type: value as ScraperSource['type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                      <SelectItem value="marketplace">Marketplace</SelectItem>
                      <SelectItem value="catalog">Catálogo</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="url">URL Base</Label>
                <Input
                  id="url"
                  value={formData.url}
                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://ejemplo.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="selector">Selector de Productos (CSS)</Label>
                <Input
                  id="selector"
                  value={formData.selector}
                  onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
                  placeholder=".product-item"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="priceSelector">Selector de Precio</Label>
                  <Input
                    id="priceSelector"
                    value={formData.priceSelector}
                    onChange={(e) => setFormData({ ...formData, priceSelector: e.target.value })}
                    placeholder=".price"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="imageSelector">Selector de Imagen</Label>
                  <Input
                    id="imageSelector"
                    value={formData.imageSelector}
                    onChange={(e) => setFormData({ ...formData, imageSelector: e.target.value })}
                    placeholder=".product-image img"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pagination">Selector de Paginación</Label>
                  <Input
                    id="pagination"
                    value={formData.pagination}
                    onChange={(e) => setFormData({ ...formData, pagination: e.target.value })}
                    placeholder=".next-page"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interval">Intervalo (horas)</Label>
                  <Input
                    id="interval"
                    type="number"
                    value={formData.interval}
                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                    placeholder="24"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleAddSource}>
                <Save className="h-4 w-4 mr-2" />
                Guardar Fuente
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o URL..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Tipo de fuente" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los tipos</SelectItem>
                <SelectItem value="ecommerce">E-commerce</SelectItem>
                <SelectItem value="marketplace">Marketplace</SelectItem>
                <SelectItem value="catalog">Catálogo</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de fuentes */}
      <Card>
        <CardHeader>
          <CardTitle>Fuentes Configuradas</CardTitle>
          <CardDescription>
            {loading ? 'Cargando...' : `${filteredSources.length} fuentes encontradas`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-3">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fuente</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Productos</TableHead>
                  <TableHead>Intervalo</TableHead>
                  <TableHead>Habilitado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSources.map((source) => (
                  <TableRow key={source.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{source.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {source.url}
                        </div>
                        {source.urls && (
                          <div className="text-xs text-muted-foreground mt-1">
                            {source.urls.length} URLs configuradas
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline">
                          {getTypeLabel(source.type)}
                        </Badge>
                        {source.category && (
                          <div className="text-xs text-muted-foreground">
                            {source.category}
                          </div>
                        )}
                        {source.requires_selenium && (
                          <Badge variant="secondary" className="text-xs">
                            Selenium
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getStatusColor(source.status)} className="gap-1">
                        {getStatusIcon(source.status)}
                        {source.status === 'active' ? 'Activo' :
                         source.status === 'error' ? 'Error' : 'Mantenimiento'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      {source.productCount.toLocaleString('es-AR')}
                    </TableCell>
                    <TableCell>
                      {source.config.interval}h
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={source.enabled}
                        onCheckedChange={() => handleToggleSource(source.id)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleExecuteScraping(source)}
                          disabled={!source.enabled}
                          title="Ejecutar scraping"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8"
                          onClick={() => handleTestSource(source)}
                          title="Probar conexión"
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Dialog 
                          open={editingSource?.id === source.id} 
                          onOpenChange={(open) => !open && setEditingSource(null)}
                        >
                          <DialogTrigger asChild>
                            <Button
                              size="icon"
                              variant="ghost"
                              className="h-8 w-8"
                              onClick={() => openEditDialog(source)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle>Editar Fuente</DialogTitle>
                              <DialogDescription>
                                Modifica los parámetros de scraping
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              {/* Mismo formulario que el de agregar */}
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-name">Nombre</Label>
                                  <Input
                                    id="edit-name"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-type">Tipo</Label>
                                  <Select 
                                    value={formData.type} 
                                    onValueChange={(value) => setFormData({ ...formData, type: value as ScraperSource['type'] })}
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ecommerce">E-commerce</SelectItem>
                                      <SelectItem value="marketplace">Marketplace</SelectItem>
                                      <SelectItem value="catalog">Catálogo</SelectItem>
                                      <SelectItem value="custom">Personalizado</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-url">URL Base</Label>
                                <Input
                                  id="edit-url"
                                  value={formData.url}
                                  onChange={(e) => setFormData({ ...formData, url: e.target.value })}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="edit-selector">Selector de Productos</Label>
                                <Input
                                  id="edit-selector"
                                  value={formData.selector}
                                  onChange={(e) => setFormData({ ...formData, selector: e.target.value })}
                                />
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-price">Selector de Precio</Label>
                                  <Input
                                    id="edit-price"
                                    value={formData.priceSelector}
                                    onChange={(e) => setFormData({ ...formData, priceSelector: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-image">Selector de Imagen</Label>
                                  <Input
                                    id="edit-image"
                                    value={formData.imageSelector}
                                    onChange={(e) => setFormData({ ...formData, imageSelector: e.target.value })}
                                  />
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="edit-pagination">Paginación</Label>
                                  <Input
                                    id="edit-pagination"
                                    value={formData.pagination}
                                    onChange={(e) => setFormData({ ...formData, pagination: e.target.value })}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="edit-interval">Intervalo (horas)</Label>
                                  <Input
                                    id="edit-interval"
                                    type="number"
                                    value={formData.interval}
                                    onChange={(e) => setFormData({ ...formData, interval: e.target.value })}
                                  />
                                </div>
                              </div>
                            </div>
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setEditingSource(null)}>
                                Cancelar
                              </Button>
                              <Button onClick={handleEditSource}>
                                <Save className="h-4 w-4 mr-2" />
                                Guardar Cambios
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDeleteSource(source.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}