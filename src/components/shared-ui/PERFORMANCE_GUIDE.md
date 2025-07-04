# Guía de Performance para Shared UI

## 🚀 Optimización de Imports

### ❌ Evitar - Import desde el índice principal
```typescript
// MALO - Carga TODOS los componentes
import { Button, Badge, Card } from '@/shared-ui';
```

### ✅ Recomendado - Imports directos
```typescript
// BUENO - Solo carga los componentes necesarios
import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { Card, CardContent, CardHeader } from '@/components/shared-ui/molecules/card';
```

## 📦 Beneficios de los Imports Directos

1. **Mejor Tree-shaking**: Next.js puede eliminar código no utilizado más eficientemente
2. **Bundles más pequeños**: Solo se incluye el código necesario
3. **Carga más rápida**: Menos JavaScript para parsear y ejecutar
4. **Mejor code splitting**: Los componentes se pueden dividir en chunks separados

## 🔧 Script de Migración Automática

Ejecuta el script de migración para actualizar automáticamente los imports:

```bash
# Ver qué archivos se cambiarán (dry run)
node migrate-to-shared-ui.js --dry-run

# Aplicar los cambios
node migrate-to-shared-ui.js

# Migrar un archivo específico
node migrate-to-shared-ui.js src/app/mi-pagina/page.tsx
```

## 🎯 Patrón de Imports Recomendado

```typescript
// 1. Imports de React/Next.js
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// 2. Imports de iconos
import { Plus, Edit, Trash2 } from 'lucide-react';

// 3. Imports de shared-ui (con rutas directas)
import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { 
  Card,
  CardContent,
  CardHeader,
  CardTitle 
} from '@/components/shared-ui/molecules/card';

// 4. Imports de hooks y utilidades
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/components/shared-ui/utils/cn';

// 5. Imports de tipos
import type { User } from '@/types';
```

## 📊 Análisis de Bundle

Para verificar el impacto en el tamaño del bundle:

```bash
# Analizar el bundle
npm run build
npm run analyze
```

## 🔍 Monitoreo de Performance

1. Usar las Chrome DevTools para medir:
   - Time to Interactive (TTI)
   - First Contentful Paint (FCP)
   - Largest Contentful Paint (LCP)

2. Verificar el tamaño de los chunks en `.next/analyze/client.html`

## 💡 Tips Adicionales

1. **Lazy Loading**: Para componentes pesados, considera usar dynamic imports:
   ```typescript
   import dynamic from 'next/dynamic';
   
   const HeavyComponent = dynamic(
     () => import('@/components/shared-ui/organisms/heavy-component'),
     { 
       loading: () => <Loading />,
       ssr: false 
     }
   );
   ```

2. **Memoización**: Usa `React.memo` para componentes que reciben props complejas
3. **Optimización de imágenes**: Usa `next/image` para cargar imágenes optimizadas
4. **Prefetching**: Usa `router.prefetch()` para precargar rutas críticas

## 🚨 Componentes que NO migrar

Mantén estos componentes con sus imports originales:
- `criteria-data-table`
- `table-toolbar`
- `stats-card`
- Cualquier componente específico del negocio

## 📈 Métricas de Mejora Esperadas

Con imports optimizados, deberías ver:
- 30-50% reducción en el tamaño del JavaScript inicial
- 20-40% mejora en Time to Interactive
- Mejor puntuación en Lighthouse