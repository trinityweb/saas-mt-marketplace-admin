'use client';

import { useState, useEffect } from 'react';
import { Package, ShieldCheck, Shield } from 'lucide-react';

import { SearchableSelect, type SearchableSelectOption } from '@/components/shared-ui/molecules/searchable-select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

  // Convertir productos a opciones planas de SearchableSelect con grupo como propiedad
  const productOptions: SearchableSelectOption[] = filteredProducts.map((product) => {
    // Construir badges dinámicos
    const badges = [];
    
    badges.push({
      text: product.is_verified ? 'Verificado' : 'No verificado',
      variant: product.is_verified ? 'default' as const : 'secondary' as const
    });
    
    if (product.source) {
      badges.push({
        text: product.source,
        variant: 'outline' as const
      });
    }
    
    // Construir descripción con EAN y categoría
    const descriptionParts = [];
    if (product.ean) {
      descriptionParts.push(`EAN: ${product.ean}`);
    }
    if (product.category) {
      descriptionParts.push(product.category);
    }
    descriptionParts.push(`Calidad: ${product.quality_score.toFixed(1)}/5.0`);

    return {
      value: product.name,
      label: product.name,
      description: descriptionParts.join(' • '),
      icon: <Package className="w-4 h-4 text-muted-foreground" />,
      badge: badges[0], // Badge principal de verificación
      group: product.brand || 'Sin marca', // Agregar grupo como propiedad
      disabled: false,
    };
  });

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

      <SearchableSelect
        options={productOptions}
        value={value}
        onValueChange={handleSelect}
        placeholder={placeholder}
        searchPlaceholder="Buscar productos..."
        disabled={disabled || loading}
        loading={loading}
        allowClear={true}
        emptyMessage="No hay productos disponibles"
        className="w-full"
      />
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