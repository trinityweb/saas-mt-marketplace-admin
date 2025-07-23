'use client';

import { useState, useEffect } from 'react';
import { Shield, ShieldCheck, AlertTriangle } from 'lucide-react';

import { SearchableSelect, type SearchableSelectOption } from '@/components/shared-ui/molecules/searchable-select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { MarketplaceBrand, marketplaceApi } from '@/lib/api';
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
  const [brands, setBrands] = useState<MarketplaceBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Cargar TODAS las marcas usando la función completa
  useEffect(() => {
    const loadAllBrands = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🔄 Cargando todas las marcas...');
        
        const response = await marketplaceApi.getAllMarketplaceBrandsComplete({
          is_active: showActiveOnly ? true : undefined,
          verification_status: showVerifiedOnly ? 'verified' : undefined,
          sort_by: 'name',
          sort_dir: 'asc'
        }, token || undefined);

        if (response.error) {
          setError(response.error);
          console.error('❌ Error cargando marcas:', response.error);
        } else if (response.data) {
          setBrands(response.data.brands);
          console.log(`✅ Marcas cargadas: ${response.data.brands.length} marcas`);
        }
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Error cargando marcas';
        setError(errorMsg);
        console.error('❌ Error inesperado:', err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadAllBrands();
    }
  }, [token, showActiveOnly, showVerifiedOnly]);

  // Convertir marcas a opciones de SearchableSelect
  const brandOptions: SearchableSelectOption[] = brands
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
    })
    .map((brand) => {
      const StatusIcon = verificationStatusIcons[brand.verification_status];
      
      return {
        value: brand.name,
        label: brand.name,
        description: brand.description || `${brand.product_count || 0} productos`,
        icon: <StatusIcon className={`w-4 h-4 ${verificationStatusColors[brand.verification_status]}`} />,
        badge: {
          text: verificationStatusLabels[brand.verification_status],
          variant: brand.verification_status === 'verified' ? 'default' : 'secondary'
        }
      };
    });

  // Manejar la selección
  const handleSelect = (brandValue: string) => {
    const brand = brands.find(b => b.name === brandValue || b.id === brandValue);
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

      <SearchableSelect
        options={brandOptions}
        value={value}
        onValueChange={handleSelect}
        placeholder={placeholder}
        searchPlaceholder="Buscar marcas..."
        disabled={disabled || loading}
        loading={loading}
        allowClear={true}
        emptyMessage="No hay marcas disponibles"
        className="w-full"
      />
    </div>
  );
}

// Hook personalizado para usar con formularios
export function useMarketplaceBrandsSelect(
  showActiveOnly: boolean = true,
  showVerifiedOnly: boolean = false
) {
  const { token } = useAuth();
  const [brands, setBrands] = useState<MarketplaceBrand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAllBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await marketplaceApi.getAllMarketplaceBrandsComplete({
        is_active: showActiveOnly ? true : undefined,
        verification_status: showVerifiedOnly ? 'verified' : undefined,
        sort_by: 'name',
        sort_dir: 'asc'
      }, token || undefined);

      if (response.error) {
        setError(response.error);
      } else if (response.data) {
        setBrands(response.data.brands);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error cargando marcas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadAllBrands();
    }
  }, [token, showActiveOnly, showVerifiedOnly]);

  const filteredBrands = brands.filter(brand => {
    if (showActiveOnly && !brand.is_active) return false;
    if (showVerifiedOnly && brand.verification_status !== 'verified') return false;
    return brand.name && brand.name.trim().length > 0;
  });

  return {
    brands: filteredBrands,
    loading,
    error,
    refetch: loadAllBrands
  };
}