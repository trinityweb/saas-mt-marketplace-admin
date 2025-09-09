'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui/molecules/card';
import { Button } from '@/components/shared-ui/atoms/button';
import { Activity, Package, FileText, Upload } from 'lucide-react';
import { useHeader } from '@/components/layout/admin-layout';

export default function DataImportPage() {
  const router = useRouter();
  const { setHeaderProps } = useHeader();

  useEffect(() => {
    setHeaderProps({
      title: 'Importación de Datos',
      subtitle: 'Panel de control para importación de productos externos'
    });
  }, [setHeaderProps]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={() => router.push('/data-import/products')}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5 text-blue-600" />
              Productos Importados
            </CardTitle>
            <CardDescription>
              Ver y gestionar productos importados desde fuentes externas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold">0</span>
              <Button size="sm">Ver todos</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-green-600" />
              Nueva Importación
            </CardTitle>
            <CardDescription>
              Importar nuevos productos desde archivo CSV o API
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full">Iniciar importación</Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-purple-600" />
              Estado del Sistema
            </CardTitle>
            <CardDescription>
              Monitorear procesos de importación activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Activos</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Completados</span>
                <span className="font-medium">0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Errores</span>
                <span className="font-medium text-red-600">0</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Actividad Reciente</CardTitle>
          <CardDescription>
            Últimas importaciones y actualizaciones
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No hay actividad reciente para mostrar
          </div>
        </CardContent>
      </Card>
    </div>
  );
}