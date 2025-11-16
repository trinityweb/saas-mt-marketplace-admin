'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CollapsibleStatsCardProps {
  title: string;
  value: number;
  icon: React.ComponentType<{ className?: string }>;
  color?: string;
  bgColor?: string;
  trend?: string | null;
  badge?: string | null;
  isCollapsed?: boolean;
  onToggle?: () => void;
  className?: string;
}

export function CollapsibleStatsCard({
  title,
  value,
  icon: Icon,
  color = 'text-blue-600',
  bgColor = 'bg-blue-100',
  trend,
  badge,
  isCollapsed = false,
  onToggle,
  className
}: CollapsibleStatsCardProps) {
  const [localCollapsed, setLocalCollapsed] = useState(isCollapsed);
  
  const collapsed = onToggle ? isCollapsed : localCollapsed;
  const handleToggle = onToggle || (() => setLocalCollapsed(!localCollapsed));

  if (collapsed) {
    return (
      <Card className={cn('relative overflow-hidden transition-all duration-200', className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 py-2">
          <div className="flex items-center gap-2">
            <div className={cn('rounded-full p-1', bgColor)}>
              <Icon className={cn('h-3 w-3', color)} />
            </div>
            <CardTitle className="text-xs font-medium truncate">{title}</CardTitle>
          </div>
          <div className="flex items-center gap-1">
            <span className="text-sm font-bold">{value?.toLocaleString() || 0}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggle}
              className="h-6 w-6 p-0 hover:bg-transparent"
            >
              <ChevronDown className="h-3 w-3" />
            </Button>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn('relative overflow-hidden transition-all duration-200', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className="flex items-center gap-2">
          <div className={cn('rounded-full p-2', bgColor)}>
            <Icon className={cn('h-4 w-4', color)} />
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleToggle}
            className="h-6 w-6 p-0 hover:bg-transparent"
          >
            <ChevronUp className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value?.toLocaleString() || 0}</div>
        {trend && (
          <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
            {trend}
          </p>
        )}
        {badge && (
          <div className="mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-secondary text-secondary-foreground">
              {badge}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
