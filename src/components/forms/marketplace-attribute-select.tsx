'use client';

import { useState, useEffect } from 'react';
import { Loader2, Hash, Type, ToggleLeft, Star, Filter } from 'lucide-react';

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

const attributeTypeColors = {
  text: 'bg-blue-100 text-blue-800',
  number: 'bg-green-100 text-green-800',
  select: 'bg-purple-100 text-purple-800',
  multi_select: 'bg-purple-100 text-purple-800',
  boolean: 'bg-yellow-100 text-yellow-800',
  date: 'bg-indigo-100 text-indigo-800'
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

  // Agrupar atributos por grupo
  const groupedAttributes = filteredAttributes.reduce((groups, attribute) => {
    const group = attribute.group_name || 'Sin grupo';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(attribute);
    return groups;
  }, {} as Record<string, MarketplaceAttribute[]>);

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

      <Select
        value={value}
        onValueChange={handleSelect}
        disabled={disabled || loading}
      >
        <SelectTrigger className="w-full">
          {loading ? (
            <div className="flex items-center">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cargando atributos...
            </div>
          ) : (
            <SelectValue placeholder={placeholder} />
          )}
        </SelectTrigger>
        <SelectContent>
          {Object.entries(groupedAttributes).map(([groupName, groupAttributes]) => (
            <div key={groupName}>
              {Object.keys(groupedAttributes).length > 1 && (
                <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground border-b">
                  {groupName}
                </div>
              )}
              {groupAttributes.map((attribute) => {
                const TypeIcon = attributeTypeIcons[attribute.type];
                
                return (
                  <SelectItem key={attribute.id} value={attribute.name} className="py-3">
                    <div className="flex items-center justify-between w-full">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0">
                          <TypeIcon className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {attribute.name}
                            {attribute.is_required && (
                              <Star className="inline w-3 h-3 ml-1 text-yellow-500" />
                            )}
                          </div>
                          {attribute.description && (
                            <div className="text-xs text-muted-foreground truncate">
                              {attribute.description}
                            </div>
                          )}
                          <div className="flex items-center gap-2 mt-1">
                            <Badge 
                              variant="outline"
                              className={`text-xs ${attributeTypeColors[attribute.type]}`}
                            >
                              {attributeTypeLabels[attribute.type]}
                            </Badge>
                            {attribute.is_required && (
                              <Badge variant="destructive" className="text-xs">
                                Requerido
                              </Badge>
                            )}
                            {attribute.is_filterable && (
                              <Badge variant="outline" className="text-xs">
                                <Filter className="w-3 h-3 mr-1" />
                                Filtrable
                              </Badge>
                            )}
                            {attribute.unit && (
                              <Badge variant="outline" className="text-xs">
                                {attribute.unit}
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
          {filteredAttributes.length === 0 && !loading && (
            <div className="px-2 py-4 text-center text-sm text-muted-foreground">
              No hay atributos disponibles
            </div>
          )}
        </SelectContent>
      </Select>
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