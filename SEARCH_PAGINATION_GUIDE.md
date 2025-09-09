# 🔍 Guía: Búsqueda con Botón y Paginado Funcional

## 🎯 Problema Resuelto

Anteriormente:
- ❌ Búsqueda automática al escribir (no controlada)
- ❌ Paginado que se rompía con filtros
- ❌ No había botón "Buscar" explícito
- ❌ Filtros se aplicaban inmediatamente sin control

Ahora:
- ✅ **Botón "Buscar" explícito** para ejecutar búsqueda
- ✅ **Filtros temporales** que se aplican solo al buscar
- ✅ **Paginado funcional** que respeta los filtros
- ✅ **Control total** sobre cuándo buscar
- ✅ **Indicador visual** cuando hay cambios sin aplicar

## 📁 Archivos Creados

### 1. `SearchWithButton` Component
```typescript
// services/saas-mt-marketplace-admin/src/components/ui/search-with-button.tsx
```
**Funcionalidad:**
- Input de búsqueda + botón "Buscar"
- Submit con Enter o click
- Estado de loading
- Controlado externamente

### 2. `useSearchWithFilters` Hook
```typescript
// services/saas-mt-marketplace-admin/src/hooks/use-search-with-filters.ts
```
**Funcionalidad:**
- Maneja filtros temporales vs aplicados
- Ejecuta búsqueda solo cuando se solicita
- Paginado que mantiene filtros
- Detección de cambios sin aplicar

### 3. Ejemplo Completo
```typescript
// services/saas-mt-marketplace-admin/src/app/global-catalog/page-with-search-button.tsx
```
**Funcionalidad:**
- Implementación completa con búsqueda + filtros + paginado
- Integración con `CriteriaDataTable`
- API calls optimizados

## 🚀 Cómo Implementar en Tu Página

### Paso 1: Importar el Hook y Componente

```typescript
import { useSearchWithFilters } from '@/hooks/use-search-with-filters';
import { SearchWithButton } from '@/components/ui/search-with-button';
```

### Paso 2: Configurar el Hook

```typescript
const {
  filters,        // Filtros aplicados actualmente
  tempFilters,    // Filtros temporales (sin aplicar)
  loading,        // Estado de carga
  updateTempFilters,  // Actualizar filtros temporales
  executeSearch,      // Ejecutar búsqueda
  handlePageChange,   // Cambio de página
  handlePageSizeChange, // Cambio tamaño página
  handleSortChange,     // Cambio ordenamiento
  hasChanges           // Hay cambios sin aplicar
} = useSearchWithFilters({
  initialFilters: { search: '', page: 1, page_size: 20 },
  onSearch: fetchData  // Tu función de API
});
```

### Paso 3: Implementar la UI

```typescript
return (
  <div className="space-y-6">
    {/* Búsqueda con Botón */}
    <SearchWithButton
      value={tempFilters.search || ''}
      placeholder="Buscar..."
      onSearch={(searchTerm) => {
        updateTempFilters({ search: searchTerm });
        executeSearch(true); // Reset a página 1
      }}
      loading={loading}
    />

    {/* Indicador de Cambios Pendientes */}
    {hasChanges && (
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-blue-700">Tienes filtros sin aplicar.</p>
        <Button onClick={() => executeSearch(true)}>
          Aplicar Filtros
        </Button>
      </div>
    )}

    {/* Tabla con Paginado */}
    <CriteriaDataTable
      // ... otros props
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
      onSortChange={handleSortChange}
      showSearch={false} // Deshabilitamos búsqueda automática
    />
  </div>
);
```

### Paso 4: Función de API

```typescript
const fetchData = async (filters: any) => {
  const params = new URLSearchParams();
  
  // Parámetros de búsqueda
  if (filters.search) params.append('search', filters.search);
  if (filters.category) params.append('category', filters.category);
  
  // Paginación (CRÍTICO)
  params.append('page', String(filters.page || 1));
  params.append('page_size', String(filters.page_size || 20));
  
  // Ordenamiento
  if (filters.sort_by) params.append('sort_by', filters.sort_by);
  if (filters.sort_dir) params.append('sort_dir', filters.sort_dir);

  const response = await fetch(`/api/your-endpoint?${params}`);
  const data = await response.json();
  
  setItems(data.items);
  setTotalCount(data.total_count);
};
```

## 🔧 Migrar Página Existente

### Si usas `CriteriaDataTable` actualmente:

```typescript
// ANTES
<CriteriaDataTable
  onSearchChange={(value) => setSearch(value)} // Búsqueda automática
  // ...
/>

// DESPUÉS
<SearchWithButton
  onSearch={handleSearchSubmit} // Búsqueda controlada
/>
<CriteriaDataTable
  showSearch={false} // Deshabilitar búsqueda automática
  onSearchChange={() => {}} // Vacío
  // ...
/>
```

### Si usas filtros locales:

```typescript
// ANTES - Filtrado local
const filteredData = data.filter(item => 
  item.name.includes(searchTerm)
);

// DESPUÉS - Filtrado en backend
const fetchData = async (filters) => {
  const response = await fetch(`/api/data?search=${filters.search}`);
  // Backend hace el filtrado
};
```

## 📋 Ejemplo: Migrar página de Marcas

```typescript
// ANTES: marketplace-brands/page.tsx
export default function BrandsPage() {
  const [search, setSearch] = useState('');
  
  return (
    <CriteriaDataTable
      onSearchChange={setSearch} // Inmediato
      // ...
    />
  );
}

// DESPUÉS: marketplace-brands/page-improved.tsx
export default function BrandsPageImproved() {
  const { 
    filters, 
    tempFilters, 
    loading, 
    updateTempFilters, 
    executeSearch, 
    handlePageChange 
  } = useSearchWithFilters({
    initialFilters: { search: '' },
    onSearch: fetchBrands
  });

  const handleSearchSubmit = (searchTerm: string) => {
    updateTempFilters({ search: searchTerm });
    executeSearch(true);
  };

  return (
    <div>
      <SearchWithButton
        value={tempFilters.search || ''}
        onSearch={handleSearchSubmit}
        loading={loading}
        placeholder="Buscar marcas..."
      />
      
      <CriteriaDataTable
        showSearch={false}
        onPageChange={handlePageChange}
        // ...
      />
    </div>
  );
}
```

## ✅ Características del Sistema

### 🔍 Búsqueda Controlada
- Solo busca cuando presionas "Buscar" o Enter
- No hace requests mientras escribes
- Optimizado para mejor performance

### 📄 Paginado Inteligente  
- Reset a página 1 en nueva búsqueda
- Mantiene filtros al cambiar página
- Tamaño de página configurable

### 🎯 Filtros Avanzados
- Filtros temporales vs aplicados
- Indicador visual de cambios pendientes
- Múltiples filtros combinables

### ⚡ Performance
- Debounce opcional
- Requests optimizados
- Loading states claros

## 🐛 Troubleshooting

### Problema: Paginado se rompe con filtros
```typescript
// ❌ MAL
const changePage = (page) => {
  setCurrentPage(page);
  fetchData(page); // Pierde filtros
};

// ✅ BIEN  
const changePage = (page) => {
  const newFilters = { ...currentFilters, page };
  fetchData(newFilters); // Mantiene filtros
};
```

### Problema: Demasiadas requests
```typescript
// ❌ MAL - Busca al escribir
onChange={(e) => search(e.target.value)}

// ✅ BIEN - Solo con botón/Enter
onSubmit={(searchTerm) => search(searchTerm)}
```

### Problema: Estado inconsistente
```typescript
// ✅ Usar el hook que maneja todo
const { filters, tempFilters, executeSearch } = useSearchWithFilters({
  onSearch: fetchData
});
```

## 🎯 Próximos Pasos

1. **Identifica tu página problemática**
2. **Copia el patrón de `page-with-search-button.tsx`**  
3. **Adapta tu función de API**
4. **Testea búsqueda + paginado + filtros**
5. **Migra otras páginas similares**

¿En qué página específica necesitas implementar esto? 🤔
