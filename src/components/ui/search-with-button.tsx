import React, { useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchWithButtonProps {
  value?: string;
  placeholder?: string;
  onSearch: (searchTerm: string) => void;
  loading?: boolean;
  className?: string;
}

export function SearchWithButton({
  value = '',
  placeholder = 'Buscar...',
  onSearch,
  loading = false,
  className
}: SearchWithButtonProps) {
  const [searchTerm, setSearchTerm] = useState(value);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(searchTerm);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit(e);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`flex gap-2 ${className}`}>
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10"
          disabled={loading}
        />
      </div>
      <Button 
        type="submit" 
        disabled={loading}
        className="px-6"
      >
        {loading ? 'Buscando...' : 'Buscar'}
      </Button>
    </form>
  );
}
