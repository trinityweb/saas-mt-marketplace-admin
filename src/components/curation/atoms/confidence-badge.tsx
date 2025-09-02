'use client';

import { Badge } from '@/components/shared-ui';
import { cn } from '@/lib/utils';

interface ConfidenceBadgeProps {
  score: number;
  showPercentage?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function ConfidenceBadge({ 
  score, 
  showPercentage = true,
  size = 'md',
  className 
}: ConfidenceBadgeProps) {
  // Determinar el color según el score
  const getColorClass = () => {
    if (score >= 80) return 'bg-green-500 hover:bg-green-600 text-white';
    if (score >= 60) return 'bg-yellow-500 hover:bg-yellow-600 text-white';
    if (score >= 40) return 'bg-orange-500 hover:bg-orange-600 text-white';
    return 'bg-red-500 hover:bg-red-600 text-white';
  };

  // Determinar el tamaño
  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'text-xs px-1.5 py-0.5';
      case 'lg': return 'text-base px-3 py-1';
      default: return 'text-sm px-2 py-0.5';
    }
  };

  // Formatear el texto
  const getText = () => {
    if (showPercentage) {
      return `${Math.round(score)}%`;
    }
    if (score >= 80) return 'Alto';
    if (score >= 60) return 'Medio';
    if (score >= 40) return 'Bajo';
    return 'Muy Bajo';
  };

  return (
    <Badge 
      className={cn(
        getColorClass(),
        getSizeClass(),
        'font-semibold',
        className
      )}
      title={`Confianza: ${Math.round(score)}%`}
    >
      {getText()}
    </Badge>
  );
}