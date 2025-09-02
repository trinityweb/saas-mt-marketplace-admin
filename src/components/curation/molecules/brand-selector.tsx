'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, Plus, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/shared-ui';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Badge } from '@/components/shared-ui';
import { marketplaceApi, MarketplaceBrand } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { BrandBadge } from '../atoms/brand-badge';
import { useDebounce } from '@/hooks/use-debounce';

interface BrandSelectorProps {
  value?: string;
  onValueChange: (value: string, brand?: MarketplaceBrand) => void;
  placeholder?: string;
  disabled?: boolean;
  allowCreate?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BrandSelector({
  value,
  onValueChange,
  placeholder = 'Seleccionar marca...',
  disabled = false,
  allowCreate = false,
  className,
  size = 'md'
}: BrandSelectorProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [brands, setBrands] = useState<MarketplaceBrand[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [validating, setValidating] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Cargar marcas
  const loadBrands = useCallback(async (search?: string) => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await marketplaceApi.getAllMarketplaceBrands({
        search,
        page: 1,
        page_size: 50,
        sort_by: 'name',
        sort_dir: 'asc'
      }, token);

      if (response.data) {
        setBrands(response.data.items);
      }
    } catch (error) {
      console.error('Error loading brands:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Validar marca contra la API
  const validateBrand = useCallback(async (brandName: string) => {
    if (!token || !brandName) return null;
    
    try {
      setValidating(true);
      const response = await marketplaceApi.validateBrand(brandName, token);
      return response.data;
    } catch (error) {
      console.error('Error validating brand:', error);
      return null;
    } finally {
      setValidating(false);
    }
  }, [token]);

  // Cargar marcas iniciales
  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  // Buscar marcas cuando cambia el término de búsqueda
  useEffect(() => {
    if (debouncedSearchTerm) {
      loadBrands(debouncedSearchTerm);
    } else {
      loadBrands();
    }
  }, [debouncedSearchTerm, loadBrands]);

  // Encontrar la marca seleccionada
  const selectedBrand = brands.find(b => b.id === value || b.name === value);

  const handleSelect = async (brandValue: string) => {
    const brand = brands.find(b => b.id === brandValue || b.name === brandValue);
    
    if (brand) {
      onValueChange(brandValue, brand);
    } else if (allowCreate && brandValue) {
      // Validar nueva marca
      const validation = await validateBrand(brandValue);
      onValueChange(brandValue, validation?.brand);
    }
    
    setOpen(false);
    setSearchTerm('');
  };

  const getSizeClasses = () => {
    switch (size) {
      case 'sm': return 'h-8 text-sm';
      case 'lg': return 'h-11 text-base';
      default: return 'h-10';
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          disabled={disabled}
          className={cn(
            'justify-between',
            getSizeClasses(),
            className
          )}
        >
          {selectedBrand ? (
            <BrandBadge 
              brand={selectedBrand.name} 
              validated={selectedBrand.verification_status === 'verified'}
            />
          ) : (
            <span className="text-muted-foreground">{placeholder}</span>
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar marca..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty>
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <span className="ml-2">Cargando marcas...</span>
              </CommandEmpty>
            ) : brands.length === 0 ? (
              <CommandEmpty>
                No se encontraron marcas.
                {allowCreate && searchTerm && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleSelect(searchTerm)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Crear "{searchTerm}"
                  </Button>
                )}
              </CommandEmpty>
            ) : (
              <>
                <CommandGroup heading="Marcas verificadas">
                  {brands
                    .filter(b => b.verification_status === 'verified')
                    .map((brand) => (
                      <CommandItem
                        key={brand.id}
                        value={brand.id}
                        onSelect={() => handleSelect(brand.id)}
                      >
                        <Check
                          className={cn(
                            'mr-2 h-4 w-4',
                            (value === brand.id || value === brand.name) ? 'opacity-100' : 'opacity-0'
                          )}
                        />
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span>{brand.name}</span>
                            <Badge variant="outline" className="text-xs">
                              {brand.product_count || 0} productos
                            </Badge>
                          </div>
                          {brand.description && (
                            <p className="text-xs text-muted-foreground mt-1">
                              {brand.description}
                            </p>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                </CommandGroup>
                
                {brands.filter(b => b.verification_status !== 'verified').length > 0 && (
                  <>
                    <CommandSeparator />
                    <CommandGroup heading="Otras marcas">
                      {brands
                        .filter(b => b.verification_status !== 'verified')
                        .map((brand) => (
                          <CommandItem
                            key={brand.id}
                            value={brand.id}
                            onSelect={() => handleSelect(brand.id)}
                          >
                            <Check
                              className={cn(
                                'mr-2 h-4 w-4',
                                (value === brand.id || value === brand.name) ? 'opacity-100' : 'opacity-0'
                              )}
                            />
                            <div className="flex-1">
                              <span>{brand.name}</span>
                              {brand.product_count && (
                                <Badge variant="outline" className="ml-2 text-xs">
                                  {brand.product_count} productos
                                </Badge>
                              )}
                            </div>
                          </CommandItem>
                        ))}
                    </CommandGroup>
                  </>
                )}
                
                {allowCreate && searchTerm && !brands.find(b => 
                  b.name.toLowerCase() === searchTerm.toLowerCase()
                ) && (
                  <>
                    <CommandSeparator />
                    <CommandGroup>
                      <CommandItem onSelect={() => handleSelect(searchTerm)}>
                        <Plus className="mr-2 h-4 w-4" />
                        Crear nueva marca "{searchTerm}"
                      </CommandItem>
                    </CommandGroup>
                  </>
                )}
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}