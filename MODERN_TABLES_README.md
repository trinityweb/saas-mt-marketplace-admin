# Componentes Modernos de Tabla

Este proyecto incluye componentes avanzados para crear listados con filtros, paginado y ordenamiento, manteniendo compatibilidad con el diseño existente.

## Componentes Principales

### 1. CriteriaDataTable

Componente de tabla avanzado que incluye:
- Paginado del lado del servidor
- Ordenamiento por columnas
- Manejo de estados de carga
- Búsqueda integrada
- Filtros personalizables

### 2. TableToolbar

Barra de herramientas que incluye:
- Campo de búsqueda con icono
- Filtros dinámicos (select e input)
- Botón de acción principal (crear/agregar)

### 3. useTableCriteria

Hook personalizado para manejar:
- Criterios de búsqueda con debounce
- Paginación
- Ordenamiento
- Filtros múltiples

## Ejemplo de Uso

```tsx
import { CriteriaDataTable, CriteriaResponse, SearchCriteria } from '@/components/ui/criteria-data-table';
import { useTableCriteria } from '@/hooks/use-table-criteria';
import { Filter } from '@/components/ui/table-toolbar';

// 1. Define tus filtros
const filters: Filter[] = [
  {
    type: 'select',
    key: 'status',
    placeholder: 'Estado',
    value: criteria.status || 'all',
    options: [
      { value: 'all', label: 'Todos' },
      { value: 'active', label: 'Activos' },
      { value: 'inactive', label: 'Inactivos' }
    ],
    onChange: (value) => handleFilterChange('status', value === 'all' ? undefined : value)
  }
];

// 2. Define las columnas
const columns: ColumnDef<MyEntity>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  // ... más columnas
];

// 3. Usa el hook de criterios
const criteriaState = useTableCriteria({
  defaultPageSize: 20,
  onSearch: (criteria: SearchCriteria) => {
    fetchData(criteria);
  }
});

// 4. Renderiza la tabla
<CriteriaDataTable
  columns={columns}
  data={response.data}
  totalCount={response.total_count}
  currentPage={response.page}
  pageSize={response.page_size}
  loading={loading}
  searchValue={criteriaState.criteria.search || ''}
  filters={filters}
  onSearchChange={criteriaState.handleSearchChange}
  onPageChange={criteriaState.handlePageChange}
  onPageSizeChange={criteriaState.handlePageSizeChange}
  onSortChange={criteriaState.handleSortChange}
/>
```

## Implementación en Taxonomy

La página de taxonomía ahora incluye **dos modos de vista**:

1. **Tabla**: Vista moderna con CriteriaDataTable + filtros + paginación (por defecto)
2. **Árbol**: Vista jerárquica de categorías

### Características de la Vista de Tabla

- **Búsqueda avanzada**: Por nombre, descripción y slug
- **Filtros configurables**:
  - Nivel de categoría (0, 1, 2, 3+)
  - Estado (activas/inactivas)
  - Filtro por nombre de categoría padre
- **Paginación server-side**: 20 elementos por página por defecto
- **Ordenamiento**: Por cualquier columna (nombre, nivel, estado, fecha)
- **Acciones**: Ver, editar, eliminar desde dropdown

## Patrón de Implementación Simplificado

### 1. Estructura limpia con dos vistas

```tsx
export default function MyPage() {
  const [viewMode, setViewMode] = useState<'table' | 'tree'>('table');
  
  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* ... cards de estadísticas */}
      </div>

      {/* Selector de vista */}
      <Card className="p-6">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === 'table' ? 'default' : 'outline'}
              onClick={() => setViewMode('table')}
            >
              <TableIcon className="w-4 h-4 mr-2" />
              Tabla
            </Button>
            <Button
              variant={viewMode === 'tree' ? 'default' : 'outline'}
              onClick={() => setViewMode('tree')}
            >
              <TreeIcon className="w-4 h-4 mr-2" />
              Árbol
            </Button>
          </div>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Nuevo Item
          </Button>
        </div>
      </Card>

      {/* Contenido condicional */}
      {viewMode === 'table' ? (
        /* Tabla moderna con todas las funcionalidades */
        <CriteriaDataTable
          columns={columns}
          data={response.data}
          totalCount={response.total_count}
          filters={filters}
          {/* ... resto de props */}
        />
      ) : (
        /* Vista alternativa (árbol, cards, etc.) */
        <Card className="p-6">
          <CustomTreeView data={data} />
        </Card>
      )}
    </div>
  );
}
```

### 2. Tipos de Filtros Disponibles

#### Select Filter
```tsx
{
  type: 'select',
  key: 'category',
  placeholder: 'Categoría',
  value: currentValue,
  options: [
    { value: 'all', label: 'Todas' },
    { value: 'electronics', label: 'Electrónicos' },
    { value: 'clothing', label: 'Ropa' }
  ],
  onChange: (value) => handleChange(value)
}
```

#### Input Filter
```tsx
{
  type: 'input',
  key: 'description',
  placeholder: 'Buscar por descripción...',
  value: currentValue,
  onChange: (value) => handleChange(value)
}
```

### 3. Configuración de Columnas con Ordenamiento

```tsx
{
  accessorKey: 'created_at',
  header: ({ column }) => (
    <Button
      variant="ghost"
      onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      className="h-auto p-0 font-semibold"
    >
      Fecha Creación
      <ArrowUpDown className="ml-2 h-4 w-4" />
    </Button>
  ),
  cell: ({ row }) => (
    <div className="text-sm">
      {new Date(row.getValue('created_at')).toLocaleDateString()}
    </div>
  ),
}
```

## Ventajas del Patrón

1. **Compatibilidad**: Mantiene el diseño y UX existente
2. **Progresivo**: Los usuarios pueden elegir entre vista clásica y moderna
3. **Escalabilidad**: Maneja grandes volúmenes de datos eficientemente
4. **Consistencia**: Mismo patrón en todas las páginas del admin
5. **Mantenibilidad**: Código reutilizable y bien estructurado

## Dependencias

- `@tanstack/react-table`: Para la funcionalidad de tabla avanzada
- `lucide-react`: Para iconos
- Componentes UI existentes del proyecto

## Páginas Implementadas

- ✅ `/taxonomy` - Gestión de categorías del marketplace
- 🔄 `/attributes` - Gestión de atributos de productos (en desarrollo)
- 📋 `/business-types` - Tipos de negocio (pendiente)

## Próximos Pasos

1. Migrar gradualmente otras páginas de listado al patrón moderno
2. Implementar filtros basados en especificaciones OpenAPI de PIM
3. Agregar funcionalidades de exportación de datos
4. Optimizar rendimiento para grandes datasets 