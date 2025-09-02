'use client';

import { 
  Package, 
  Clock, 
  CheckCircle, 
  XCircle, 
  Send,
  TrendingUp,
  AlertCircle,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/shared-ui';
import { Progress } from '@/components/shared-ui';
import { Badge } from '@/components/shared-ui';
import { CurationStats as CurationStatsType } from '@/types/curation';
import { cn } from '@/lib/utils';

interface CurationStatsProps {
  stats: CurationStatsType;
  className?: string;
}

export function CurationStats({ stats, className }: CurationStatsProps) {
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

  return (
    <div className={cn('space-y-4', className)}>
      {/* Grid de estadísticas principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index} className="relative overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={cn(
                  'rounded-full p-2',
                  stat.bgColor
                )}>
                  <Icon className={cn('h-4 w-4', stat.color)} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value?.toLocaleString() || 0}</div>
                {stat.trend && (
                  <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    {stat.trend}
                  </p>
                )}
                {stat.badge && (
                  <Badge variant="secondary" className="mt-2 text-xs">
                    {stat.badge}
                  </Badge>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

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
                <Badge variant="outline">{stats.today_curated}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Esta semana</span>
                <Badge variant="outline">{stats.week_curated}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">Este mes</span>
                <Badge variant="outline">{stats.month_curated}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}