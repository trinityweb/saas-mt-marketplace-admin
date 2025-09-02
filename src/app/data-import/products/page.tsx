'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui/molecules/card';
import { Button } from '@/components/shared-ui/atoms/button';
import { Package } from 'lucide-react';
import { useHeader } from '@/components/layout/admin-layout';

export default function ImportedProductsPage() {
  const router = useRouter();
  const { setHeaderProps } = useHeader();

  useEffect(() => {
    setHeaderProps({
      title: 'Productos Importados',
      subtitle: 'Gestión de productos importados desde fuentes externas',
      backUrl: '/data-import',
      backLabel: 'Volver a Importación',
    });
  }, [setHeaderProps]);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            Productos Importados
          </CardTitle>
          <CardDescription>
            Lista de todos los productos importados desde fuentes externas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-lg font-medium">No hay productos importados</p>
            <p className="text-sm mt-2">Los productos importados aparecerán aquí</p>
            <Button className="mt-4" onClick={() => router.push('/data-import')}>
              Ir a Panel de Importación
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}