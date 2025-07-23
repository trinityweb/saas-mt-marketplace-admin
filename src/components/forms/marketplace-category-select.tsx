'use client';

import { useState, useEffect } from 'react';


import { SearchableSelect, type SearchableSelectOption } from '@/components/shared-ui/molecules/searchable-select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { marketplaceApi, MarketplaceCategory } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface MarketplaceCategorySelectProps {
  value?: string;
  onValueChange: (value: string, category?: MarketplaceCategory) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  showActiveOnly?: boolean;
  className?: string;
}

// Función para construir el path completo de una categoría (breadcrumbs)
function buildCategoryPath(category: MarketplaceCategory, allCategories: MarketplaceCategory[]): string {
  const path: string[] = [];
  let currentCategory: MarketplaceCategory | undefined = category;
  
  // Crear un mapa para búsqueda rápida por ID
  const categoryMap = new Map<string, MarketplaceCategory>();
  allCategories.forEach(cat => categoryMap.set(cat.id, cat));
  
  // Recorrer hacia arriba en la jerarquía
  while (currentCategory) {
    path.unshift(currentCategory.name);
    
    if (currentCategory.parent_id) {
      currentCategory = categoryMap.get(currentCategory.parent_id);
    } else {
      currentCategory = undefined;
    }
  }
  
  return path.join(' > ');
}

// Interfaz extendida para categorías con path
interface CategoryWithPath extends MarketplaceCategory {
  fullPath: string;
}

export function MarketplaceCategorySelect({
  value,
  onValueChange,
  placeholder = "Seleccionar categoría...",
  label,
  description,
  disabled = false,
  required = false,
  showActiveOnly = true,
  className
}: MarketplaceCategorySelectProps) {
  const { token } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<CategoryWithPath[]>([]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        // Usar la misma lógica robusta que el hook useMarketplaceCategories
        const adminToken = token || 
          (typeof window !== 'undefined' ? localStorage.getItem('iam_access_token') : null) ||
          'dev-marketplace-admin';
        
        const filters = {
          ...(showActiveOnly && { is_active: true })
        };

        console.log('🔍 MarketplaceCategorySelect: Loading all categories with filters:', filters);
        console.log('🔑 Using admin token:', adminToken ? 'Available' : 'Missing');

        const response = await marketplaceApi.getAllMarketplaceCategoriesComplete(filters, adminToken);

        console.log('🎯 getAllMarketplaceCategoriesComplete response:', { 
          hasError: !!response.error, 
          error: response.error,
          categoriesCount: response.data?.categories?.length,
          totalFromResponse: response.data?.total
        });

        if (response.error) {
          // Fallback: usar solo la primera página si falla getAllMarketplaceCategoriesComplete
          console.warn('⚠️ getAllMarketplaceCategoriesComplete failed, falling back to single page:', response.error);
          
          const fallbackResponse = await marketplaceApi.getAllMarketplaceCategories({
            page: 1,
            page_size: 20,
            ...filters
          }, adminToken);
          
          if (fallbackResponse.error) {
            throw new Error(fallbackResponse.error);
          }
          
          if (fallbackResponse.data?.categories) {
            const validCategories = fallbackResponse.data.categories.filter(cat => 
              cat.name && cat.name.trim().length > 0
            );
            
            // Construir paths completos y ordenar alfabéticamente
            const categoriesWithPath: CategoryWithPath[] = validCategories.map(cat => ({
              ...cat,
              fullPath: buildCategoryPath(cat, validCategories)
            }));
            
            const sortedCategories = categoriesWithPath.sort((a, b) => 
              a.fullPath.localeCompare(b.fullPath)
            );
            
            setCategories(sortedCategories);
            console.log('✅ MarketplaceCategorySelect: Loaded categories with paths (fallback):', sortedCategories.length);
            return;
          }
        }

        if (response.data?.categories) {
          // Filtrar categorías con nombres válidos (no vacíos)
          const validCategories = response.data.categories.filter(cat => 
            cat.name && cat.name.trim().length > 0
          );
          
          // Construir paths completos para cada categoría
          const categoriesWithPath: CategoryWithPath[] = validCategories.map(cat => ({
            ...cat,
            fullPath: buildCategoryPath(cat, validCategories)
          }));
          
          // Ordenar alfabéticamente por el path completo
          const sortedCategories = categoriesWithPath.sort((a, b) => 
            a.fullPath.localeCompare(b.fullPath)
          );
          
          setCategories(sortedCategories);
          console.log('✅ MarketplaceCategorySelect: Loaded categories with paths:', sortedCategories.length, 'total:', response.data.total);
          console.log('📋 Sample paths:', sortedCategories.slice(0, 5).map(c => c.fullPath));
        }
      } catch (err: any) {
        console.error('❌ Error loading marketplace categories:', err);
        setError(err.message || 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [token, showActiveOnly]);

  // Convertir categorías a opciones de SearchableSelect
  const categoryOptions: SearchableSelectOption[] = categories.map((category) => ({
    value: category.name,
    label: category.fullPath,
    description: `Nivel ${category.level}${category.is_active ? ' • Activa' : ' • Inactiva'}`,
    disabled: !category.is_active,
  }));

  // Manejar la selección
  const handleSelect = (categoryValue: string) => {
    const category = categories.find(cat => cat.name === categoryValue || cat.id === categoryValue);
    onValueChange(categoryValue, category);
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
        options={categoryOptions}
        value={value}
        onValueChange={handleSelect}
        placeholder={placeholder}
        searchPlaceholder="Buscar categorías..."
        disabled={disabled || loading}
        loading={loading}
        allowClear={true}
        emptyMessage="No hay categorías disponibles"
        className="w-full"
      />
    </div>
  );
}

// Hook personalizado para usar con formularios
export function useMarketplaceCategories(showActiveOnly: boolean = true) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<CategoryWithPath[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {
        ...(showActiveOnly && { is_active: true })
      };

      console.log('🔍 useMarketplaceCategories: Loading all categories with filters:', filters);

      const response = await marketplaceApi.getAllMarketplaceCategoriesComplete(filters, token || '');

      if (response.error) {
        // Fallback: usar solo la primera página si falla getAllMarketplaceCategoriesComplete
        console.warn('⚠️ getAllMarketplaceCategoriesComplete failed, falling back to single page:', response.error);
        
        const fallbackResponse = await marketplaceApi.getAllMarketplaceCategories({
          page: 1,
          page_size: 20,
          ...filters
        }, token || '');
        
        if (fallbackResponse.error) {
          throw new Error(fallbackResponse.error);
        }
        
        if (fallbackResponse.data?.categories) {
          const validCategories = fallbackResponse.data.categories.filter(cat => 
            cat.name && cat.name.trim().length > 0
          );
          
          // Construir paths completos y ordenar alfabéticamente
          const categoriesWithPath: CategoryWithPath[] = validCategories.map(cat => ({
            ...cat,
            fullPath: buildCategoryPath(cat, validCategories)
          }));
          
          const sortedCategories = categoriesWithPath.sort((a, b) => 
            a.fullPath.localeCompare(b.fullPath)
          );
          
          setCategories(sortedCategories);
          console.log('✅ useMarketplaceCategories: Loaded categories with paths (fallback):', sortedCategories.length);
          return;
        }
      }

      if (response.data?.categories) {
        // Filtrar categorías con nombres válidos (no vacíos)
        const validCategories = response.data.categories.filter(cat => 
          cat.name && cat.name.trim().length > 0
        );
        
        // Construir paths completos para cada categoría
        const categoriesWithPath: CategoryWithPath[] = validCategories.map(cat => ({
          ...cat,
          fullPath: buildCategoryPath(cat, validCategories)
        }));
        
        // Ordenar alfabéticamente por el path completo
        const sortedCategories = categoriesWithPath.sort((a, b) => 
          a.fullPath.localeCompare(b.fullPath)
        );
        
        setCategories(sortedCategories);
        console.log('✅ useMarketplaceCategories: Loaded categories with paths:', sortedCategories.length, 'total:', response.data.total);
      }
    } catch (err: any) {
      console.error('❌ Error loading marketplace categories in hook:', err);
      setError(err.message || 'Error al cargar categorías');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token, showActiveOnly]);

  return {
    categories,
    loading,
    error,
    refetch: loadCategories
  };
}