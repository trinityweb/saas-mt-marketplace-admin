'use client';

import { Badge } from '@/components/shared-ui';
import { Clock, CheckCircle, XCircle, AlertCircle, Send, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';

type CurationStatus = 'pending' | 'processing' | 'curated' | 'rejected' | 'published';

interface CurationStatusBadgeProps {
  status: CurationStatus;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
  className?: string;
}

const statusConfig: Record<CurationStatus, {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}> = {
  pending: {
    label: 'Pendiente',
    icon: Clock,
    colorClass: 'bg-yellow-100 text-yellow-800 border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200'
  },
  processing: {
    label: 'Procesando',
    icon: AlertCircle,
    colorClass: 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900 dark:text-blue-200'
  },
  curated: {
    label: 'Curado',
    icon: CheckCircle,
    colorClass: 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900 dark:text-green-200'
  },
  rejected: {
    label: 'Rechazado',
    icon: XCircle,
    colorClass: 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900 dark:text-red-200'
  },
  published: {
    label: 'Publicado',
    icon: Send,
    colorClass: 'bg-purple-100 text-purple-800 border-purple-300 dark:bg-purple-900 dark:text-purple-200'
  }
};

export function CurationStatusBadge({ 
  status, 
  size = 'md',
  showIcon = true,
  className 
}: CurationStatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs px-1.5 py-0.5';
      case 'lg': return 'text-base px-3 py-1';
      default: return 'text-sm px-2 py-0.5';
    }
  };

  return (
    <Badge 
      variant="outline"
      className={cn(
        config.colorClass,
        getSizeClass(),
        'font-medium border',
        className
      )}
    >
      {showIcon && <Icon className={cn(
        'mr-1',
        size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
      )} />}
      {config.label}
    </Badge>
  );
}