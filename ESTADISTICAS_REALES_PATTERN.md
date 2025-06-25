# Patrón de Estadísticas Reales del Backend

## Problema Identificado

Las páginas que usan `CriteriaDataTable` estaban calculando estadísticas basándose en los datos paginados del frontend, mostrando valores incorrectos. Por ejemplo, si una página muestra 20 productos de un total de 692, las estadísticas mostraban valores basados en esos 20 productos en lugar del total real.

## Solución Implementada

### ✅ Patrón Correcto (Global Catalog)

El backend debe devolver estadísticas reales en un campo `summary`:

```typescript
interface BackendResponse {
  data: Array<any>;
  pagination: {
    offset: number;
    limit: number;
    total: number;
    has_next: boolean;
    has_prev: boolean;
    total_pages: number;
  };
  summary: {
    total_items: number;
    // Otras estadísticas específicas del dominio
    verified_items: number;
    high_quality_items: number;
    average_quality: number;
  };
}
```

### Frontend Implementation

```typescript
// ❌ INCORRECTO - Calcular estadísticas localmente
const stats = useMemo(() => {
  const verified = products.filter(p => p.is_verified).length; // Solo cuenta la página actual
  return { verified };
}, [products]); // products solo contiene 20 items de la página actual

// ✅ CORRECTO - Usar estadísticas del backend
const [summary, setSummary] = useState<BackendSummary>({
  total_items: 0,
  verified_items: 0,
  // ...
});

const fetchData = async (criteria: SearchCriteria) => {
  const response = await fetch('/api/endpoint');
  const data: BackendResponse = await response.json();
  
  // Usar estadísticas reales del backend
  setSummary(data.summary);
  
  // Los datos paginados van a la tabla
  setCriteriaResponse({
    data: data.data,
    total_count: data.pagination.total,
    page: criteria.page || 1,
    page_size: criteria.page_size || 20
  });
};
```

## Páginas que Necesitan Corrección

### ✅ Corregidas
- `/global-catalog` - Ya implementado correctamente

### 🔄 Por Corregir
- `/taxonomy` - Usando datos mock, necesita endpoint real con estadísticas
- `/business-types` - Verificar si calcula estadísticas localmente
- `/attributes` - Verificar si calcula estadísticas localmente
- `/business-type-templates` - Verificar si calcula estadísticas localmente

## Implementación por Página

### 1. Global Catalog ✅
```typescript
// Ya implementado correctamente
const [summary, setSummary] = useState<GlobalCatalogSummary>({
  total_products: 0,
  verified_products: 0,
  high_quality_products: 0,
  average_quality: 0
});

// Stats Cards usan summary del backend
<Card className="p-6">
  <div className="flex items-center gap-3">
    <Package className="w-8 h-8 text-blue-500" />
    <div>
      <p className="text-sm text-muted-foreground">Total Productos</p>
      <p className="text-2xl font-semibold">{summary.total_products}</p>
    </div>
  </div>
</Card>
```

### 2. Taxonomy 🔄 (Necesita endpoint real)
```typescript
// TODO: Implementar endpoint de categorías con estadísticas
interface CategorySummary {
  total_categories: number;
  root_categories: number;
  active_categories: number;
  inactive_categories: number;
}

// Cambiar de:
{categories.filter(c => c.is_active).length}

// A:
{summary.active_categories}
```

## Checklist de Implementación

Para cada página que use CriteriaDataTable:

### Backend
- [ ] El endpoint devuelve un campo `summary` con estadísticas reales
- [ ] Las estadísticas se calculan en la base de datos, no en memoria
- [ ] El `summary` es independiente de la paginación

### Frontend
- [ ] Se usa `useState` para almacenar el `summary` del backend
- [ ] Las Stats Cards usan datos del `summary`, no cálculos locales
- [ ] Se elimina cualquier `useMemo` que calcule estadísticas de datos paginados
- [ ] El resumen inferior también usa datos del `summary`

### Ejemplo de Migración

```typescript
// ❌ ANTES
const stats = useMemo(() => {
  const active = categories.filter(c => c.is_active).length;
  const inactive = categories.filter(c => !c.is_active).length;
  return { active, inactive, total: categories.length };
}, [categories]);

// ✅ DESPUÉS  
const [summary, setSummary] = useState<CategorySummary>({
  total_categories: 0,
  active_categories: 0,
  inactive_categories: 0,
  root_categories: 0
});

const fetchData = async (criteria: SearchCriteria) => {
  const response = await fetch('/api/categories');
  const data = await response.json();
  setSummary(data.summary); // Estadísticas reales del backend
};
```

## Beneficios

1. **Precisión**: Las estadísticas reflejan la realidad completa, no solo la página actual
2. **Performance**: Las estadísticas se calculan eficientemente en la base de datos
3. **Consistencia**: Todas las páginas siguen el mismo patrón
4. **Escalabilidad**: Funciona correctamente con grandes volúmenes de datos

## Próximos Pasos

1. Verificar qué páginas calculan estadísticas localmente
2. Implementar endpoints con `summary` donde falten
3. Migrar páginas una por una siguiendo este patrón
4. Documentar el patrón en el style guide del proyecto 