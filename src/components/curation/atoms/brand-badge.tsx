'use client';

import { Badge } from '@/components/shared-ui';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrandBadgeProps {
  brand?: string;
  validated?: boolean;
  pending?: boolean;
  className?: string;
}

export function BrandBadge({ 
  brand, 
  validated = false,
  pending = false,
  className 
}: BrandBadgeProps) {
  if (!brand) {
    return (
      <Badge 
        variant="outline" 
        className={cn('text-muted-foreground', className)}
      >
        <AlertCircle className="w-3 h-3 mr-1" />
        Sin marca
      </Badge>
    );
  }

  const getIcon = () => {
    if (validated) return <CheckCircle className="w-3 h-3 mr-1" />;
    if (pending) return <AlertCircle className="w-3 h-3 mr-1" />;
    return <XCircle className="w-3 h-3 mr-1" />;
  };

  const getVariant = () => {
    if (validated) return 'default';
    if (pending) return 'secondary';
    return 'outline';
  };

  const getColorClass = () => {
    if (validated) return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200';
    if (pending) return 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <Badge 
      variant={getVariant()}
      className={cn(
        getColorClass(),
        'font-medium',
        className
      )}
      title={validated ? 'Marca validada' : pending ? 'Validación pendiente' : 'Marca no validada'}
    >
      {getIcon()}
      {brand}
    </Badge>
  );
}