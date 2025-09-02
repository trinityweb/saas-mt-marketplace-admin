'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, ChevronsUpDown, ChevronRight, Loader2 } from 'lucide-react';
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
import { marketplaceApi, MarketplaceCategory } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface CategorySelectorProps {
  value?: string;
  onValueChange: (value: string, category?: MarketplaceCategory) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

interface CategoryWithChildren extends MarketplaceCategory {
  children?: CategoryWithChildren[];
}

export function CategorySelector({
  value,
  onValueChange,
  placeholder = 'Seleccionar categoría...',
  disabled = false,
  className,
  size = 'md'
}: CategorySelectorProps) {
  const { token } = useAuth();
  const [open, setOpen] = useState(false);
  const [categories, setCategories] = useState<MarketplaceCategory[]>([]);
  const [categoriesTree, setCategoriesTree] = useState<CategoryWithChildren[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Construir árbol de categorías
  const buildCategoryTree = (cats: MarketplaceCategory[]): CategoryWithChildren[] => {
    const map = new Map<string, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    // Primero crear todos los nodos
    cats.forEach(cat => {
      map.set(cat.id, { ...cat, children: [] });
    });

    // Luego establecer las relaciones padre-hijo
    cats.forEach(cat => {
      const node = map.get(cat.id)!;
      if (cat.parent_id && map.has(cat.parent_id)) {
        const parent = map.get(cat.parent_id)!;
        parent.children = parent.children || [];
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    });

    // Ordenar por sort_order y nombre
    const sortCategories = (nodes: CategoryWithChildren[]) => {
      nodes.sort((a, b) => {
        if (a.sort_order !== b.sort_order) {
          return a.sort_order - b.sort_order;
        }
        return a.name.localeCompare(b.name);
      });
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          sortCategories(node.children);
        }
      });
    };

    sortCategories(roots);
    return roots;
  };

  // Cargar categorías
  const loadCategories = useCallback(async () => {
    if (!token) return;
    
    try {
      setLoading(true);
      const response = await marketplaceApi.getAllMarketplaceCategories({
        page: 1,
        page_size: 1000,
        sort_by: 'sort_order',
        sort_dir: 'asc'
      }, token);

      if (response.data) {
        setCategories(response.data.items);
        const tree = buildCategoryTree(response.data.items);
        setCategoriesTree(tree);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Cargar categorías al montar
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Filtrar categorías por búsqueda
  const filterCategories = (cats: CategoryWithChildren[], search: string): CategoryWithChildren[] => {
    if (!search) return cats;
    
    const searchLower = search.toLowerCase();
    const filtered: CategoryWithChildren[] = [];
    
    cats.forEach(cat => {
      const matches = cat.name.toLowerCase().includes(searchLower);
      const childrenFiltered = cat.children ? filterCategories(cat.children, search) : [];
      
      if (matches || childrenFiltered.length > 0) {
        filtered.push({
          ...cat,
          children: childrenFiltered
        });
      }
    });
    
    return filtered;
  };

  // Encontrar la categoría seleccionada
  const findCategory = (id: string): MarketplaceCategory | undefined => {
    return categories.find(c => c.id === id);
  };

  // Obtener la ruta completa de la categoría
  const getCategoryPath = (categoryId: string): string => {
    const cat = findCategory(categoryId);
    if (!cat) return '';
    
    const path: string[] = [cat.name];
    let current = cat;
    
    while (current.parent_id) {
      const parent = findCategory(current.parent_id);
      if (parent) {
        path.unshift(parent.name);
        current = parent;
      } else {
        break;
      }
    }
    
    return path.join(' > ');
  };

  const selectedCategory = value ? findCategory(value) : undefined;

  const handleSelect = (categoryId: string) => {
    const category = findCategory(categoryId);
    onValueChange(categoryId, category);
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

  // Renderizar categorías recursivamente
  const renderCategoryItem = (category: CategoryWithChildren, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = value === category.id;
    
    return (
      <div key={category.id}>
        <CommandItem
          value={category.id}
          onSelect={() => handleSelect(category.id)}
          className={cn(
            'flex items-center',
            level > 0 && `ml-${level * 4}`
          )}
        >
          <Check
            className={cn(
              'mr-2 h-4 w-4',
              isSelected ? 'opacity-100' : 'opacity-0'
            )}
          />
          {hasChildren && <ChevronRight className="mr-1 h-3 w-3" />}
          <span className="flex-1">{category.name}</span>
          {category.level > 0 && (
            <Badge variant="outline" className="ml-2 text-xs">
              Nivel {category.level}
            </Badge>
          )}
        </CommandItem>
        {hasChildren && category.children!.map(child => 
          renderCategoryItem(child, level + 1)
        )}
      </div>
    );
  };

  const filteredCategories = filterCategories(categoriesTree, searchTerm);

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
          <span className={cn(
            'truncate',
            !selectedCategory && 'text-muted-foreground'
          )}>
            {selectedCategory ? getCategoryPath(selectedCategory.id) : placeholder}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput 
            placeholder="Buscar categoría..." 
            value={searchTerm}
            onValueChange={setSearchTerm}
          />
          <CommandList>
            {loading ? (
              <CommandEmpty>
                <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                <span className="ml-2">Cargando categorías...</span>
              </CommandEmpty>
            ) : filteredCategories.length === 0 ? (
              <CommandEmpty>
                No se encontraron categorías.
              </CommandEmpty>
            ) : (
              <CommandGroup heading="Categorías">
                {filteredCategories.map(category => 
                  renderCategoryItem(category)
                )}
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}