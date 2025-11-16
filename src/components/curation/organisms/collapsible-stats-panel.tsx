'use client';

import { useState } from 'react';
import { CollapsibleStatsCard } from '../atoms/collapsible-stats-card';
import { Button } from '@/components/shared-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  TrendingUp,
  AlertCircle,
  Zap,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react';
import { CurationStats as CurationStatsType } from '@/types/curation';
import { cn } from '@/lib/utils';

interface CollapsibleStatsPanelProps {
  stats: CurationStatsType;
  className?: string;
}

export function CollapsibleStatsPanel({ stats, className }: CollapsibleStatsPanelProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [cardsCollapsed, setCardsCollapsed] = useState(false);

  const completionRate = stats.total_products > 0 
    ? ((stats.curated + stats.published) / stats.total_products) * 100
    : 0;

  const rejectionRate = stats.total_products > 0
    ? (stats.rejected / stats.total_products) * 100
    : 0;

  const statCards = [
    {
      title: 'Total Productos',
      value: stats.total_products,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      trend: null
    },
    {
      title: 'Pendientes',
      value: stats.pending,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      badge: stats.pending > 0 ? 'Requiere atención' : null
    },
    {
      title: 'En Proceso',
      value: stats.processing,
      icon: AlertCircle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      trend: null
    },
    {
      title: 'Curados',
      value: stats.curated,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      trend: stats.today_curated > 0 ? `+${stats.today_curated} hoy` : null
    },
    {
      title: 'Publicados',
      value: stats.published,
      icon: Send,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      trend: null
    },
    {
      title: 'Rechazados',
      value: stats.rejected,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      badge: rejectionRate > 20 ? 'Alta tasa' : null
    }
  ];

  if (isCollapsed) {
    return (
      <Card className={cn('mb-6', className)}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Estadísticas de Curación</CardTitle>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>Total: <span className="font-semibold text-foreground">{stats.total_products.toLocaleString()}</span></span>
                <span>Pendientes: <span className="font-semibold text-yellow-600">{stats.pending.toLocaleString()}</span></span>
                <span>Completado: <span className="font-semibold text-green-600">{completionRate.toFixed(1)}%</span></span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsCollapsed(false)}
                className="h-8 w-8 p-0"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className={cn('mb-6', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Estadísticas de Curación</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCardsCollapsed(!cardsCollapsed)}
              className="text-xs"
            >
              {cardsCollapsed ? 'Expandir Cards' : 'Colapsar Cards'}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCollapsed(true)}
              className="h-8 w-8 p-0"
            >
              <ChevronUp className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Grid de estadísticas principales */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {statCards.map((stat, index) => (
            <CollapsibleStatsCard
              key={index}
              title={stat.title}
              value={stat.value}
              icon={stat.icon}
              color={stat.color}
              bgColor={stat.bgColor}
              trend={stat.trend}
              badge={stat.badge}
              isCollapsed={cardsCollapsed}
              className="h-fit"
            />
          ))}
        </div>

        {!cardsCollapsed && (
          <>
            {/* Métricas de rendimiento */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Tasa de completado */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Tasa de Completado
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">
                      {completionRate?.toFixed(1) || 0}%
                    </span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </div>
                  <Progress value={completionRate} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.curated + stats.published} de {stats.total_products} productos
                  </p>
                </CardContent>
              </Card>

              {/* Confianza promedio */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Confianza Promedio
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-2xl font-bold">
                      {stats.avg_confidence?.toFixed(0) || 0}%
                    </span>
                    <Zap className={cn(
                      'h-4 w-4',
                      stats.avg_confidence >= 80 ? 'text-green-600' :
                      stats.avg_confidence >= 60 ? 'text-yellow-600' :
                      'text-red-600'
                    )} />
                  </div>
                  <Progress 
                    value={stats.avg_confidence} 
                    className="h-2"
                  />
                  <p className="text-xs text-muted-foreground mt-2">
                    {stats.avg_confidence >= 80 ? 'Excelente' :
                     stats.avg_confidence >= 60 ? 'Buena' :
                     'Necesita mejora'}
                  </p>
                </CardContent>
              </Card>

              {/* Actividad reciente */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">
                    Actividad Reciente
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Hoy</span>
                      <span className="text-sm font-semibold">{stats.today_curated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Esta semana</span>
                      <span className="text-sm font-semibold">{stats.week_curated}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Este mes</span>
                      <span className="text-sm font-semibold">{stats.month_curated}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
