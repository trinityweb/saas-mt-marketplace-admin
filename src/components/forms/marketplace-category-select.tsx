'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);

  // Cargar categorías al montar el componente
  useEffect(() => {
    const loadCategories = async () => {
      setLoading(true);
      setError(null);

      try {
        const filters = {
          page: 1,
          page_size: 200, // Cargar más categorías para tener opciones
          ...(showActiveOnly && { is_active: true })
        };

        const response = await marketplaceApi.getAllMarketplaceCategories(filters, token || '');

        if (response.error) {
          throw new Error(response.error);
        }

        if (response.data?.categories) {
          // Filtrar categorías con nombres válidos (no vacíos)
          const validCategories = response.data.categories.filter(cat => 
            cat.name && cat.name.trim().length > 0
          );
          
          // Ordenar categorías por nivel y nombre para mostrar jerarquía
          const sortedCategories = validCategories.sort((a, b) => {
            if (a.level !== b.level) return a.level - b.level;
            return a.name.localeCompare(b.name);
          });
          
          setCategories(sortedCategories);
          console.log('✅ Loaded marketplace categories:', sortedCategories.length, 'sorted by hierarchy');
        }
      } catch (err: any) {
        console.error('Error loading marketplace categories:', err);
        setError(err.message || 'Error al cargar categorías');
      } finally {
        setLoading(false);
      }
    };

    loadCategories();
  }, [token, showActiveOnly]);

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

      <Select
        value={value}
        onValueChange={handleSelect}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-full">
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando categorías...
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category.id} value={category.name}>
              <span className={category.level > 0 ? 'ml-4' : ''}>
                {category.level > 0 && '↳ '}{category.name}
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook personalizado para usar con formularios
export function useMarketplaceCategories(showActiveOnly: boolean = true) {
  const { token } = useAuth();
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCategories = async () => {
    setLoading(true);
    setError(null);

    try {
      const filters = {
        page: 1,
        page_size: 200,
        ...(showActiveOnly && { is_active: true })
      };

      const response = await marketplaceApi.getAllMarketplaceCategories(filters, token || '');

      if (response.error) {
        throw new Error(response.error);
      }

      if (response.data?.categories) {
        // Filtrar categorías con nombres válidos (no vacíos)
        const validCategories = response.data.categories.filter(cat => 
          cat.name && cat.name.trim().length > 0
        );
        setCategories(validCategories);
      }
    } catch (err: any) {
      console.error('Error loading marketplace categories:', err);
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