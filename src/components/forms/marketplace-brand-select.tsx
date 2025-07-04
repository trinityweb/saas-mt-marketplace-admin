'use client';

import { useState, useEffect } from 'react';
import { Loader2, Shield, ShieldCheck, AlertTriangle } from 'lucide-react';

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

import { useMarketplaceBrands } from '@/hooks/use-marketplace-brands';
import { MarketplaceBrand } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface MarketplaceBrandSelectProps {
  value?: string;
  onValueChange: (value: string, brand?: MarketplaceBrand) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  showActiveOnly?: boolean;
  showVerifiedOnly?: boolean;
  className?: string;
}

const verificationStatusIcons = {
  verified: ShieldCheck,
  unverified: Shield,
  disputed: AlertTriangle,
  pending: Shield
};

const verificationStatusLabels = {
  verified: 'Verificada',
  unverified: 'No verificada',
  disputed: 'Disputada',
  pending: 'Pendiente'
};

const verificationStatusColors = {
  verified: 'text-green-600',
  unverified: 'text-gray-500',
  disputed: 'text-red-600',
  pending: 'text-yellow-600'
};

export function MarketplaceBrandSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar marca...",
  label,
  description,
  disabled = false,
  required = false,
  showActiveOnly = true,
  showVerifiedOnly = false,
  className
}: MarketplaceBrandSelectProps) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Usar el hook existente con filtros apropiados
  const { brands, loading, loadBrands } = useMarketplaceBrands({
    adminToken: token || '',
    initialFilters: {
      ...(showActiveOnly && { is_active: true }),
      ...(showVerifiedOnly && { verification_status: 'verified' }),
      page_size: 200 // Cargar más marcas para tener opciones
    }
  });

  // Cargar marcas al montar el componente
  useEffect(() => {
    const loadInitialBrands = async () => {
      try {
        setError(null);
        await loadBrands({
          ...(showActiveOnly && { is_active: true }),
          ...(showVerifiedOnly && { verification_status: 'verified' }),
          page_size: 200
        });
      } catch (err: any) {
        console.error('Error loading marketplace brands:', err);
        setError(err.message || 'Error al cargar marcas');
      }
    };

    if (token) {
      loadInitialBrands();
    }
  }, [token, showActiveOnly, showVerifiedOnly, loadBrands]);

  // Filtrar y ordenar marcas
  const filteredBrands = brands
    .filter(brand => {
      if (showActiveOnly && !brand.is_active) return false;
      if (showVerifiedOnly && brand.verification_status !== 'verified') return false;
      return brand.name && brand.name.trim().length > 0;
    })
    .sort((a, b) => {
      // Priorizar marcas verificadas
      if (a.verification_status === 'verified' && b.verification_status !== 'verified') return -1;
      if (b.verification_status === 'verified' && a.verification_status !== 'verified') return 1;
      // Luego ordenar por nombre
      return a.name.localeCompare(b.name);
    });

  // Manejar la selección
  const handleSelect = (brandValue: string) => {
    const brand = filteredBrands.find(b => b.name === brandValue || b.id === brandValue);
    onValueChange(brandValue, brand);
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
              Cargando marcas...
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {filteredBrands.map((brand) => {
            const StatusIcon = verificationStatusIcons[brand.verification_status];
            
            return (
              <SelectItem key={brand.id} value={brand.name} className="py-3">
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0">
                      <StatusIcon className={`w-4 h-4 ${verificationStatusColors[brand.verification_status]}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{brand.name}</div>
                      {brand.description && (
                        <div className="text-xs text-muted-foreground truncate">
                          {brand.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant={brand.verification_status === 'verified' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {verificationStatusLabels[brand.verification_status]}
                        </Badge>
                        {brand.country_code && (
                          <Badge variant="outline" className="text-xs">
                            {brand.country_code}
                          </Badge>
                        )}
                        {brand.product_count > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {brand.product_count} productos
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </SelectItem>
            );
          })}
          {filteredBrands.length === 0 && !loading && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No hay marcas disponibles
            </div>
          )}
        </SelectContent>
      </Select>
    </div>
  );
}

// Hook personalizado para usar con formularios
export function useMarketplaceBrandsSelect(
  showActiveOnly: boolean = true,
  showVerifiedOnly: boolean = false
) {
  const { token } = useAuth();
  const { brands, loading, error, loadBrands } = useMarketplaceBrands({
    adminToken: token || '',
    initialFilters: {
      ...(showActiveOnly && { is_active: true }),
      ...(showVerifiedOnly && { verification_status: 'verified' }),
      page_size: 200
    }
  });

  const filteredBrands = brands.filter(brand => {
    if (showActiveOnly && !brand.is_active) return false;
    if (showVerifiedOnly && brand.verification_status !== 'verified') return false;
    return brand.name && brand.name.trim().length > 0;
  });

  return {
    brands: filteredBrands,
    loading,
    error,
    refetch: () => loadBrands({
      ...(showActiveOnly && { is_active: true }),
      ...(showVerifiedOnly && { verification_status: 'verified' }),
      page_size: 200
    })
  };
}