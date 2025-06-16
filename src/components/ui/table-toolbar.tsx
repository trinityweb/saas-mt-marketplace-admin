'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search } from 'lucide-react';

// Tipos de filtros disponibles
export interface SelectFilter {
  type: 'select';
  key: string;
  placeholder: string;
  value: string;
  options: Array<{
    value: string;
    label: string;
  }>;
  onChange: (value: string) => void;
}

export interface InputFilter {
  type: 'input';
  key: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}

export type Filter = SelectFilter | InputFilter;

interface TableToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  buttonText?: string;
  filters?: Filter[];
  customActions?: React.ReactNode;
  onSearchChange?: (value: string) => void;
  onButtonClick?: () => void;
  showButton?: boolean;
  showSearch?: boolean;
}

export function TableToolbar({ 
  searchValue = "",
  searchPlaceholder = "Buscar...",
  buttonText = "Crear", 
  filters = [],
  customActions,
  onSearchChange,
  onButtonClick,
  showButton = true,
  showSearch = true
}: TableToolbarProps) {
  return (
    <div className="py-3">
      <div className="flex justify-between items-center space-x-4">
        <div className="flex items-center space-x-3 flex-1">
          {showSearch && (
            <div className="relative max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={searchPlaceholder}
                value={searchValue}
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="pl-8"
              />
            </div>
          )}
          
          {/* Filtros dinámicos */}
          {filters.map((filter) => (
            <div key={filter.key} className="min-w-[160px]">
              {filter.type === 'select' ? (
                <Select
                  value={filter.value || "all"}
                  onValueChange={filter.onChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={filter.placeholder} />
                  </SelectTrigger>
                  <SelectContent>
                    {filter.options
                      .filter(option => option.value && option.value.trim() !== "")
                      .map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              ) : filter.type === 'input' ? (
                <Input
                  placeholder={filter.placeholder}
                  value={filter.value || ""}
                  onChange={(e) => filter.onChange(e.target.value)}
                />
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {customActions}
          {showButton && (
            <Button onClick={onButtonClick} size="sm">
              <Plus className="h-4 w-4 mr-2" />
              {buttonText}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
} 