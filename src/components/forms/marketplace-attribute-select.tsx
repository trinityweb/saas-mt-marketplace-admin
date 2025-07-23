'use client';

import { useState, useEffect } from 'react';
import { Hash, Type, ToggleLeft } from 'lucide-react';

import { SearchableSelect, type SearchableSelectOption } from '@/components/shared-ui/molecules/searchable-select';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

import { useMarketplaceAttributes } from '@/hooks/use-marketplace-attributes';
import { MarketplaceAttribute } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface MarketplaceAttributeSelectProps {
  value?: string;
  onValueChange: (value: string, attribute?: MarketplaceAttribute) => void;
  placeholder?: string;
  label?: string;
  description?: string;
  disabled?: boolean;
  required?: boolean;
  showActiveOnly?: boolean;
  filterByType?: string;
  filterByGroup?: string;
  className?: string;
}

const attributeTypeIcons = {
  text: Type,
  number: Hash,
  select: ToggleLeft,
  multi_select: ToggleLeft,
  boolean: ToggleLeft,
  date: Type
};

const attributeTypeLabels = {
  text: 'Texto',
  number: 'Número',
  select: 'Selección',
  multi_select: 'Selección Múltiple',
  boolean: 'Sí/No',
  date: 'Fecha'
};



export function MarketplaceAttributeSelect({
  value,
  onValueChange,
  placeholder = "Seleccionar atributo...",
  label,
  description,
  disabled = false,
  required = false,
  showActiveOnly = true,
  filterByType,
  filterByGroup,
  className
}: MarketplaceAttributeSelectProps) {
  const { token } = useAuth();
  const [error, setError] = useState<string | null>(null);

  // Usar el hook existente con filtros apropiados
  const { attributes, loading, loadAttributes } = useMarketplaceAttributes({
    adminToken: token || '',
    initialFilters: {
      ...(showActiveOnly && { is_active: true }),
      ...(filterByType && { type: filterByType }),
      ...(filterByGroup && { group_name: filterByGroup }),
      page_size: 200 // Cargar más atributos para tener opciones
    }
  });

  // Cargar atributos al montar el componente
  useEffect(() => {
    const loadInitialAttributes = async () => {
      try {
        setError(null);
        await loadAttributes({
          ...(showActiveOnly && { is_active: true }),
          ...(filterByType && { type: filterByType }),
          ...(filterByGroup && { group_name: filterByGroup }),
          page_size: 200
        });
      } catch (err: any) {
        console.error('Error loading marketplace attributes:', err);
        setError(err.message || 'Error al cargar atributos');
      }
    };

    if (token) {
      loadInitialAttributes();
    }
  }, [token, showActiveOnly, filterByType, filterByGroup, loadAttributes]);

  // Filtrar y ordenar atributos
  const filteredAttributes = attributes
    .filter(attribute => {
      if (showActiveOnly && !attribute.is_active) return false;
      if (filterByType && attribute.type !== filterByType) return false;
      if (filterByGroup && attribute.group_name !== filterByGroup) return false;
      return attribute.name && attribute.name.trim().length > 0;
    })
    .sort((a, b) => {
      // Priorizar atributos requeridos
      if (a.is_required && !b.is_required) return -1;
      if (b.is_required && !a.is_required) return 1;
      // Luego por grupo
      const groupA = a.group_name || 'Zzz_Sin grupo';
      const groupB = b.group_name || 'Zzz_Sin grupo';
      if (groupA !== groupB) return groupA.localeCompare(groupB);
      // Finalmente por nombre
      return a.name.localeCompare(b.name);
    });

  // Convertir atributos a opciones de SearchableSelect con agrupación
  const attributeOptions: SearchableSelectOption[] = filteredAttributes.map((attribute) => {
      const TypeIcon = attributeTypeIcons[attribute.type];
      
      // Construir badges dinámicos
      const badges = [];
      
      badges.push({
        text: attributeTypeLabels[attribute.type],
        variant: 'outline' as const
      });
      
      if (attribute.is_required) {
        badges.push({
          text: 'Requerido',
          variant: 'danger' as const
        });
      }
      
      if (attribute.is_filterable) {
        badges.push({
          text: 'Filtrable',
          variant: 'outline' as const
        });
      }
      
      if (attribute.unit) {
        badges.push({
          text: attribute.unit,
          variant: 'outline' as const
        });
      }

      return {
        value: attribute.name,
        label: attribute.name,
        description: attribute.description || `Tipo: ${attributeTypeLabels[attribute.type]}`,
        icon: <TypeIcon className="w-4 h-4 text-muted-foreground" />,
        badge: badges[0], // Badge principal del tipo
        group: attribute.group_name || 'Sin grupo',
        disabled: !attribute.is_active,
      };
    });

  // Manejar la selección
  const handleSelect = (attributeValue: string) => {
    const attribute = filteredAttributes.find(a => a.name === attributeValue || a.id === attributeValue);
    onValueChange(attributeValue, attribute);
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
        options={attributeOptions}
        value={value}
        onValueChange={handleSelect}
        placeholder={placeholder}
        searchPlaceholder="Buscar atributos..."
        disabled={disabled || loading}
        loading={loading}
        allowClear={true}
        emptyMessage="No hay atributos disponibles"
        className="w-full"
      />
    </div>
  );
}

// Hook personalizado para usar con formularios
export function useMarketplaceAttributesSelect(
  showActiveOnly: boolean = true,
  filterByType?: string,
  filterByGroup?: string
) {
  const { token } = useAuth();
  const { attributes, loading, error, loadAttributes } = useMarketplaceAttributes({
    adminToken: token || '',
    initialFilters: {
      ...(showActiveOnly && { is_active: true }),
      ...(filterByType && { type: filterByType }),
      ...(filterByGroup && { group_name: filterByGroup }),
      page_size: 200
    }
  });

  const filteredAttributes = attributes.filter(attribute => {
    if (showActiveOnly && !attribute.is_active) return false;
    if (filterByType && attribute.type !== filterByType) return false;
    if (filterByGroup && attribute.group_name !== filterByGroup) return false;
    return attribute.name && attribute.name.trim().length > 0;
  });

  return {
    attributes: filteredAttributes,
    loading,
    error,
    refetch: () => loadAttributes({
      ...(showActiveOnly && { is_active: true }),
      ...(filterByType && { type: filterByType }),
      ...(filterByGroup && { group_name: filterByGroup }),
      page_size: 200
    })
  };
}