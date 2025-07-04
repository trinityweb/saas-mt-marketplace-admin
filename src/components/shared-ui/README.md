# Shared UI Components Library

Esta librería contiene componentes UI reutilizables siguiendo los principios de Atomic Design.

## Estructura

```
shared-ui/
├── atoms/          # Componentes básicos (Button, Input, Badge, etc.)
├── molecules/      # Combinaciones de átomos
├── organisms/      # Componentes complejos
├── utils/          # Utilidades (cn, etc.)
└── index.ts        # Exportaciones principales
```

## Uso

### Durante la migración (transición gradual)

Los componentes pueden ser importados desde dos ubicaciones:

```typescript
// Ubicación antigua (mantenida para compatibilidad)
import { Button } from '@/components/ui/button'

// Nueva ubicación (recomendada)
import { Button } from '@/components/shared-ui'
```

### Después de la migración completa

```typescript
// Importar desde shared-ui
import { Button, Input, Badge } from '@/components/shared-ui'

// O importar específicamente
import { Button } from '@/components/shared-ui/atoms/button'
```

## Principios de Atomic Design

### Átomos
- Componentes más básicos e indivisibles
- No dependen de otros componentes
- Ejemplos: Button, Input, Label, Badge

### Moléculas
- Combinaciones simples de átomos
- Funcionan como una unidad
- Ejemplos: FormField (Label + Input), SearchBox (Input + Button)

### Organismos
- Componentes complejos formados por moléculas y/o átomos
- Pueden tener lógica de negocio
- Ejemplos: Header, Sidebar, DataTable

## Migración

La migración se está realizando de forma gradual:

1. ✅ Fase 1: Crear estructura y migrar átomos básicos
2. ⏳ Fase 2: Actualizar imports gradualmente
3. ⏳ Fase 3: Migrar moléculas y organismos
4. ⏳ Fase 4: Eliminar componentes antiguos

## Convenciones

- Todos los componentes deben ser TypeScript
- Usar `cn()` para combinar clases
- Seguir las convenciones de naming de React
- Documentar props con JSDoc cuando sea necesario