'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/shared-ui';
import { Input } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import {
  ExternalLink,
  Edit2,
  Save,
  X,
  Image as ImageIcon,
  AlertCircle,
  Send,
  CheckCircle,
  XCircle,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrapedProduct } from '@/types/curation';
import { ConfidenceBadge } from '../atoms/confidence-badge';
import { BrandBadge } from '../atoms/brand-badge';
import { CurationStatusBadge } from '../atoms/curation-status-badge';
import { BrandSelector } from '../molecules/brand-selector';
import { CategorySelector } from '../molecules/category-selector';
import { MarketplaceBrand, MarketplaceCategory } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';

interface CurationTableProps {
  products: ScrapedProduct[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onProductUpdate: (productId: string, updates: Partial<ScrapedProduct>) => void;
  onProductSave: (productId: string) => void;
  onProductCurate?: (productId: string) => void;
  onProductSendToAI?: (productId: string) => void;
  onProductApprove?: (productId: string) => void;
  onProductReject?: (productId: string) => void;
  loading?: boolean;
  className?: string;
}

interface EditingState {
  [key: string]: {
    name?: string;
    description?: string;
    brand?: string;
    category?: string;
    price?: number;
  };
}

export function CurationTable({
  products,
  selectedIds,
  onSelectionChange,
  onProductUpdate,
  onProductSave,
  onProductCurate,
  onProductSendToAI,
  onProductApprove,
  onProductReject,
  loading = false,
  className
}: CurationTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingData, setEditingData] = useState<EditingState>({});

  // Toggle selection de todos los productos
  const toggleSelectAll = useCallback(() => {
    if (selectedIds.length === products.length) {
      onSelectionChange([]);
    } else {
      onSelectionChange(products.map(p => p.id));
    }
  }, [selectedIds, products, onSelectionChange]);

  // Toggle selection de un producto
  const toggleSelect = useCallback((productId: string) => {
    if (selectedIds.includes(productId)) {
      onSelectionChange(selectedIds.filter(id => id !== productId));
    } else {
      onSelectionChange([...selectedIds, productId]);
    }
  }, [selectedIds, onSelectionChange]);

  // Iniciar edición
  const startEditing = useCallback((product: ScrapedProduct) => {
    setEditingId(product.id);
    setEditingData({
      [product.id]: {
        name: product.name,
        description: product.description,
        brand: product.curated_data?.brand_name || product.brand,
        category: product.curated_data?.category_name || product.category,
        price: product.price
      }
    });
  }, []);

  // Cancelar edición
  const cancelEditing = useCallback(() => {
    setEditingId(null);
    setEditingData({});
  }, []);

  // Guardar cambios
  const saveChanges = useCallback((productId: string) => {
    const changes = editingData[productId];
    if (changes) {
      onProductUpdate(productId, {
        name: changes.name,
        description: changes.description,
        brand: changes.brand,
        category: changes.category,
        price: changes.price,
        curated_data: {
          ...products.find(p => p.id === productId)?.curated_data,
          name: changes.name || '',
          description: changes.description || '',
          brand_name: changes.brand,
          category_name: changes.category
        }
      });
      onProductSave(productId);
    }
    cancelEditing();
  }, [editingData, onProductUpdate, onProductSave, products, cancelEditing]);

  // Actualizar campo en edición
  const updateEditingField = useCallback((productId: string, field: string, value: any) => {
    setEditingData(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [field]: value
      }
    }));
  }, []);

  // Renderizar celda editable
  const renderEditableCell = useCallback((
    product: ScrapedProduct,
    field: keyof EditingState[string],
    renderDefault: () => React.ReactNode
  ) => {
    if (editingId === product.id) {
      const value = editingData[product.id]?.[field];
      
      if (field === 'brand') {
        return (
          <BrandSelector
            value={value as string}
            onValueChange={(brandId, brand) => {
              updateEditingField(product.id, 'brand', brand?.name || brandId);
            }}
            size="sm"
            allowCreate={true}
          />
        );
      }
      
      if (field === 'category') {
        return (
          <CategorySelector
            value={value as string}
            onValueChange={(categoryId, category) => {
              updateEditingField(product.id, 'category', category?.name || categoryId);
            }}
            size="sm"
          />
        );
      }
      
      return (
        <Input
          type={field === 'price' ? 'number' : 'text'}
          value={value || ''}
          onChange={(e) => updateEditingField(
            product.id, 
            field, 
            field === 'price' ? parseFloat(e.target.value) : e.target.value
          )}
          className="h-8"
          autoFocus={field === 'name'}
        />
      );
    }
    
    return renderDefault();
  }, [editingId, editingData, updateEditingField]);

  const isAllSelected = products.length > 0 && selectedIds.length === products.length;
  const isIndeterminate = selectedIds.length > 0 && selectedIds.length < products.length;

  return (
    <div className={cn('relative overflow-x-auto', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={isIndeterminate ? "indeterminate" : isAllSelected}
                onCheckedChange={toggleSelectAll}
                aria-label="Seleccionar todos"
              />
            </TableHead>
            <TableHead className="w-20">Estado</TableHead>
            <TableHead>Producto</TableHead>
            <TableHead>Marca</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-right">Precio</TableHead>
            <TableHead className="w-24">Confianza</TableHead>
            <TableHead>Fuente</TableHead>
            <TableHead className="w-28 text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!products || products.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                <div className="flex flex-col items-center justify-center gap-2">
                  <AlertCircle className="h-8 w-8 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No hay productos para curar
                  </p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            products.map((product) => {
              const isEditing = editingId === product.id;
              const isSelected = selectedIds.includes(product.id);
              
              return (
                <TableRow 
                  key={product.id}
                  className={cn(
                    isSelected && 'bg-muted/50',
                    isEditing && 'ring-2 ring-primary ring-offset-2'
                  )}
                >
                  <TableCell>
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => toggleSelect(product.id)}
                      aria-label={`Seleccionar ${product.name}`}
                    />
                  </TableCell>
                  
                  <TableCell>
                    <CurationStatusBadge status={product.status} size="sm" />
                  </TableCell>
                  
                  <TableCell>
                    <div className="space-y-1">
                      {renderEditableCell(product, 'name', () => (
                        <div className="font-medium">{product.name}</div>
                      ))}
                      {product.images && product.images.length > 0 && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <ImageIcon className="h-3 w-3" />
                          {product.images.length} imagen{product.images.length !== 1 ? 'es' : ''}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    {renderEditableCell(product, 'brand', () => (
                      <BrandBadge 
                        brand={product.curated_data?.brand_name || product.brand}
                        validated={product.curated_data?.brand_validated}
                      />
                    ))}
                  </TableCell>
                  
                  <TableCell>
                    {renderEditableCell(product, 'category', () => (
                      <Badge variant="outline">
                        {product.curated_data?.category_name || product.category || 'Sin categoría'}
                      </Badge>
                    ))}
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {renderEditableCell(product, 'price', () => (
                      <div>
                        <div className="font-medium">
                          {formatCurrency(product.price, product.currency)}
                        </div>
                        {product.original_price && product.original_price > product.price && (
                          <div className="text-xs text-muted-foreground line-through">
                            {formatCurrency(product.original_price, product.currency)}
                          </div>
                        )}
                      </div>
                    ))}
                  </TableCell>
                  
                  <TableCell>
                    {product.confidence_score !== undefined && (
                      <ConfidenceBadge 
                        score={product.confidence_score} 
                        size="sm"
                      />
                    )}
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Badge variant="secondary" className="text-xs">
                        {product.source}
                      </Badge>
                      {product.source_url && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0"
                          onClick={() => window.open(product.source_url, '_blank')}
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right">
                    {isEditing ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => saveChanges(product.id)}
                          title="Guardar cambios"
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={cancelEditing}
                          title="Cancelar edición"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-end gap-1">
                        {/* Botón Enviar a AI - Para productos pending */}
                        {product.status === 'pending' && onProductSendToAI && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-purple-600 hover:text-purple-700"
                            onClick={() => onProductSendToAI(product.id)}
                            title="Enviar a AI para curación automática"
                          >
                            <Send className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Botón Curar Manualmente - Para productos pending */}
                        {product.status === 'pending' && onProductCurate && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700"
                            onClick={() => onProductCurate(product.id)}
                            title="Curar manualmente con asistencia AI"
                          >
                            <Sparkles className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Botón Aprobar - Para productos curated o pending */}
                        {(product.status === 'curated' || product.status === 'pending') && onProductApprove && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-green-600 hover:text-green-700"
                            onClick={() => onProductApprove(product.id)}
                            title="Aprobar y marcar como listo"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Botón Rechazar */}
                        {product.status !== 'rejected' && product.status !== 'published' && onProductReject && (
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                            onClick={() => onProductReject(product.id)}
                            title="Rechazar producto"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        )}
                        
                        {/* Botón Editar */}
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-8 w-8 p-0"
                          onClick={() => startEditing(product)}
                          title="Editar manualmente"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              );
            })
          )}
        </TableBody>
      </Table>
    </div>
  );
}