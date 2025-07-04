'use client';

import { useState, useEffect } from 'react';
import { Loader2, Package, ShieldCheck, Shield, Star, Tag } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';

import { useGlobalProducts } from '@/hooks/use-global-products';
import { GlobalCatalogProduct } from '@/lib/api/pim';
import { useAuth } from '@/hooks/use-auth';

interface MarketplaceProductSelectProps {
  value?: string;
  onValueChange: (value: string, product?: GlobalCatalogProduct) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  showVerifiedOnly?: boolean;
  filterByBrand?: string;
  filterByCategory?: string;
  minQualityScore?: number;
  className?: string;
}

export function MarketplaceProductSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar producto...",
  label,
  description,
  disabled = false,
  required = false,
  showVerifiedOnly = false,
  filterByBrand,
  filterByCategory,
  minQualityScore,
  className
}: MarketplaceProductSelectProps) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Usar el hook personalizado con filtros apropiados
  const { products, loading, loadProducts } = useGlobalProducts({
    adminToken: token || '',
    initialFilters: {
      ...(showVerifiedOnly && { is_verified: true }),
      ...(filterByBrand && { brand: filterByBrand }),
      ...(filterByCategory && { category: filterByCategory }),
      ...(minQualityScore && { min_quality: minQualityScore }),
      limit: 200 // Cargar más productos para tener opciones
    }
  });

  // Cargar productos al montar el componente
  useEffect(() => {
    const loadInitialProducts = async () => {
      try {
        setError(null);
        await loadProducts({
          ...(showVerifiedOnly && { is_verified: true }),
          ...(filterByBrand && { brand: filterByBrand }),
          ...(filterByCategory && { category: filterByCategory }),
          ...(minQualityScore && { min_quality: minQualityScore }),
          limit: 200
        });
      } catch (err: any) {
        console.error('Error loading global products:', err);
        setError(err.message || 'Error al cargar productos');
      }
    };

    if (token) {
      loadInitialProducts();
    }
  }, [token, showVerifiedOnly, filterByBrand, filterByCategory, minQualityScore, loadProducts]);

  // Filtrar y ordenar productos
  const filteredProducts = products
    .filter(product => {
      if (showVerifiedOnly && !product.is_verified) return false;
      if (filterByBrand && product.brand !== filterByBrand) return false;
      if (filterByCategory && product.category !== filterByCategory) return false;
      if (minQualityScore && product.quality_score < minQualityScore) return false;
      return product.name && product.name.trim().length > 0;
    })
    .sort((a, b) => {
      // Priorizar productos verificados
      if (a.is_verified && !b.is_verified) return -1;
      if (b.is_verified && !a.is_verified) return 1;
      // Luego por quality score (descendente)
      if (a.quality_score !== b.quality_score) return b.quality_score - a.quality_score;
      // Finalmente por nombre
      return a.name.localeCompare(b.name);
    });

  // Agrupar productos por marca
  const groupedProducts = filteredProducts.reduce((groups, product) => {
    const brand = product.brand || 'Sin marca';
    if (!groups[brand]) {
      groups[brand] = [];
    }
    groups[brand].push(product);
    return groups;
  }, {} as Record<string, GlobalCatalogProduct[]>);

  // Manejar la selección
  const handleSelect = (productValue: string) => {
    const product = filteredProducts.find(p => p.name === productValue || p.id === productValue || p.ean === productValue);
    onValueChange(productValue, product);
  };

  return (
    <div className={className}>
      {label && (
        <Label className="text-sm font-medium">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </Label>
      )}
      
      {description && (
        <p className="text-sm text-muted-foreground mt-1 mb-2">
          {description}
        </p>
      )}

      {error && (
        <Alert variant="destructive" className="mb-2">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Select
        value={value}
        onValueChange={handleSelect}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-full">
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando productos...
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedProducts).map(([brandName, brandProducts]) => (
            <div key={brandName}>
              {Object.keys(groupedProducts).length > 1 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                  {brandName}
                </div>
              )}
              {brandProducts.map((product) => {
                const VerificationIcon = product.is_verified ? ShieldCheck : Shield;
                const qualityStars = Math.round(product.quality_score * 5);
                
                return (
                  <SelectItem key={product.id} value={product.name} className="py-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <Package className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {product.name}
                            {product.is_verified && (
                              <VerificationIcon className="inline w-3 h-3 ml-1 text-green-600" />
                            )}
                          </div>
                          <div className="text-xs text-muted-foreground truncate">
                            {product.ean && (
                              <span className="mr-2">EAN: {product.ean}</span>
                            )}
                            {product.category && (
                              <span>• {product.category}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant={product.is_verified ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {product.is_verified ? 'Verificado' : 'No verificado'}
                            </Badge>
                            
                            {/* Quality Score */}
                            <div className="flex items-center gap-1">
                              <div className="flex">
                                {[...Array(5)].map((_, i) => (
                                  <Star 
                                    key={i} 
                                    className={`w-3 h-3 ${
                                      i < qualityStars 
                                        ? 'text-yellow-400 fill-yellow-400' 
                                        : 'text-gray-300'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-xs text-muted-foreground">
                                ({product.quality_score.toFixed(1)})
                              </span>
                            </div>

                            {product.source && (
                              <Badge variant="outline" className="text-xs">
                                <Tag className="w-3 h-3 mr-1" />
                                {product.source}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                );
              })}
            </div>
          ))}
          {filteredProducts.length === 0 && !loading && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No hay productos disponibles
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook personalizado para usar con formularios
export function useGlobalProductsSelect(
  showVerifiedOnly: boolean = false,
  filterByBrand?: string,
  filterByCategory?: string,
  minQualityScore?: number
) {
  const { token } = useAuth();
  const { products, loading, error, loadProducts } = useGlobalProducts({
    adminToken: token || '',
    initialFilters: {
      ...(showVerifiedOnly && { is_verified: true }),
      ...(filterByBrand && { brand: filterByBrand }),
      ...(filterByCategory && { category: filterByCategory }),
      ...(minQualityScore && { min_quality: minQualityScore }),
      limit: 200
    }
  });

  const filteredProducts = products.filter(product => {
    if (showVerifiedOnly && !product.is_verified) return false;
    if (filterByBrand && product.brand !== filterByBrand) return false;
    if (filterByCategory && product.category !== filterByCategory) return false;
    if (minQualityScore && product.quality_score < minQualityScore) return false;
    return product.name && product.name.trim().length > 0;
  });

  return {
    products: filteredProducts,
    loading,
    error,
    refetch: () => loadProducts({
      ...(showVerifiedOnly && { is_verified: true }),
      ...(filterByBrand && { brand: filterByBrand }),
      ...(filterByCategory && { category: filterByCategory }),
      ...(minQualityScore && { min_quality: minQualityScore }),
      limit: 200
    })
  };
}