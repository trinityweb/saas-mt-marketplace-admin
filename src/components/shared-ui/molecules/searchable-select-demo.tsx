"use client"

import { useState } from "react"
import { Star, Package, User, Tag } from "lucide-react"
import { SearchableSelect, SearchableSelectOption, useSearchableSelectOptions } from "./searchable-select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared-ui"

// ============================================================================
// EJEMPLO 1: OPCIONES SIMPLES
// ============================================================================
const simpleOptions: SearchableSelectOption[] = [
  { value: "option1", label: "Opción 1" },
  { value: "option2", label: "Opción 2" },
  { value: "option3", label: "Opción 3" },
  { value: "option4", label: "Opción 4" },
  { value: "option5", label: "Opción 5" },
]

// ============================================================================
// EJEMPLO 2: OPCIONES CON ICONOS Y BADGES  
// ============================================================================
const advancedOptions: SearchableSelectOption[] = [
  {
    value: "premium",
    label: "Plan Premium",
    description: "Acceso completo a todas las funciones",
    icon: <Star className="h-4 w-4 text-yellow-500" />,
    badge: { text: "Recomendado", variant: "default" }
  },
  {
    value: "basic",
    label: "Plan Básico", 
    description: "Funciones esenciales para empezar",
    icon: <Package className="h-4 w-4 text-blue-500" />,
    badge: { text: "Básico", variant: "secondary" }
  },
  {
    value: "enterprise",
    label: "Plan Enterprise",
    description: "Solución para grandes empresas",
    icon: <User className="h-4 w-4 text-purple-500" />,
    badge: { text: "Empresarial", variant: "outline" }
  }
]

// ============================================================================
// EJEMPLO 3: OPCIONES AGRUPADAS
// ============================================================================
const groupedOptions: SearchableSelectOption[] = [
  // Grupo: Frutas
  {
    value: "apple",
    label: "Manzana",
    description: "Fruta roja y dulce",
    group: "Frutas",
    badge: { text: "Temporada", variant: "secondary" }
  },
  {
    value: "banana",
    label: "Banana", 
    description: "Fruta amarilla rica en potasio",
    group: "Frutas"
  },
  {
    value: "orange",
    label: "Naranja",
    description: "Cítrico rico en vitamina C",
    group: "Frutas"
  },
  
  // Grupo: Verduras
  {
    value: "carrot",
    label: "Zanahoria",
    description: "Verdura naranja rica en betacaroteno",
    group: "Verduras",
    badge: { text: "Orgánico", variant: "outline" }
  },
  {
    value: "broccoli", 
    label: "Brócoli",
    description: "Verdura verde rica en nutrientes",
    group: "Verduras"
  },
  
  // Grupo: Lácteos
  {
    value: "milk",
    label: "Leche",
    description: "Lácteo rico en calcio",
    group: "Lácteos"
  },
  {
    value: "cheese",
    label: "Queso",
    description: "Lácteo fermentado",
    group: "Lácteos",
    badge: { text: "Artesanal", variant: "default" }
  }
]

// ============================================================================
// EJEMPLO 4: USANDO DATOS REALES CON EL HOOK
// ============================================================================
interface Product {
  id: string
  name: string
  category: string
  price: number
  inStock: boolean
}

const sampleProducts: Product[] = [
  { id: "1", name: "iPhone 15", category: "Electrónicos", price: 999, inStock: true },
  { id: "2", name: "MacBook Pro", category: "Electrónicos", price: 1999, inStock: false },
  { id: "3", name: "Camiseta Nike", category: "Ropa", price: 29, inStock: true },
  { id: "4", name: "Zapatillas Adidas", category: "Calzado", price: 79, inStock: true },
  { id: "5", name: "Mesa de Oficina", category: "Muebles", price: 299, inStock: false },
  { id: "6", name: "Silla Ergonómica", category: "Muebles", price: 199, inStock: true },
]

export function SearchableSelectDemo() {
  const [simpleValue, setSimpleValue] = useState<string>("")
  const [advancedValue, setAdvancedValue] = useState<string>("")
  const [groupedValue, setGroupedValue] = useState<string>("")
  const [productValue, setProductValue] = useState<string>("")
  const [multipleValue, setMultipleValue] = useState<string[]>([])

  // Usar el hook para convertir productos a opciones
  const productOptions = useSearchableSelectOptions(
    sampleProducts,
    "name",        // labelKey
    "id",          // valueKey
    "category",    // descriptionKey
    "category"     // groupKey
  ).map(option => ({
    ...option,
    // Agregar información adicional
    description: `${option.description} - $${sampleProducts.find(p => p.id === option.value)?.price}`,
    badge: {
      text: sampleProducts.find(p => p.id === option.value)?.inStock ? "En Stock" : "Agotado",
      variant: sampleProducts.find(p => p.id === option.value)?.inStock ? "default" : "danger"
    } as any,
    icon: <Tag className="h-4 w-4" />,
    disabled: !sampleProducts.find(p => p.id === option.value)?.inStock
  }))

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="text-center">
        <h1 className="text-3xl font-bold">SearchableSelect Demo</h1>
        <p className="text-muted-foreground mt-2">
          Componente de select con búsqueda para uso atómico y reutilizable
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* EJEMPLO 1: Select Simple */}
        <Card>
          <CardHeader>
            <CardTitle>1. Select Simple</CardTitle>
            <CardDescription>
              Uso básico con opciones simples y búsqueda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchableSelect
              options={simpleOptions}
              value={simpleValue}
              onValueChange={setSimpleValue}
              placeholder="Seleccionar opción..."
              searchPlaceholder="Buscar opción..."
              allowClear={true}
            />
            <p className="text-sm text-muted-foreground">
              Valor seleccionado: {simpleValue || "Ninguno"}
            </p>
          </CardContent>
        </Card>

        {/* EJEMPLO 2: Select Avanzado */}
        <Card>
          <CardHeader>
            <CardTitle>2. Select con Iconos y Badges</CardTitle>
            <CardDescription>
              Opciones con iconos, descripciones y badges
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchableSelect
              options={advancedOptions}
              value={advancedValue}
              onValueChange={setAdvancedValue}
              placeholder="Seleccionar plan..."
              searchPlaceholder="Buscar plan..."
              allowClear={true}
            />
            <p className="text-sm text-muted-foreground">
              Plan seleccionado: {advancedValue || "Ninguno"}
            </p>
          </CardContent>
        </Card>

        {/* EJEMPLO 3: Select Agrupado */}
        <Card>
          <CardHeader>
            <CardTitle>3. Select con Grupos</CardTitle>
            <CardDescription>
              Opciones organizadas por grupos con búsqueda
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchableSelect
              options={groupedOptions}
              value={groupedValue}
              onValueChange={setGroupedValue}
              placeholder="Seleccionar alimento..."
              searchPlaceholder="Buscar alimento..."
              allowClear={true}
            />
            <p className="text-sm text-muted-foreground">
              Alimento seleccionado: {groupedValue || "Ninguno"}
            </p>
          </CardContent>
        </Card>

        {/* EJEMPLO 4: Select con Datos Reales */}
        <Card>
          <CardHeader>
            <CardTitle>4. Select con Hook de Datos</CardTitle>
            <CardDescription>
              Usando useSearchableSelectOptions con datos reales
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchableSelect
              options={productOptions}
              value={productValue}
              onValueChange={setProductValue}
              placeholder="Seleccionar producto..."
              searchPlaceholder="Buscar producto..."
              allowClear={true}
            />
            <p className="text-sm text-muted-foreground">
              Producto seleccionado: {productValue || "Ninguno"}
            </p>
          </CardContent>
        </Card>

        {/* EJEMPLO 5: Selección Múltiple */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>5. Selección Múltiple</CardTitle>
            <CardDescription>
              Permitir seleccionar múltiples opciones
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <SearchableSelect
              options={groupedOptions}
              value={multipleValue.join(',')}
              onValueChange={(val) => setMultipleValue(val ? val.split(',') : [])}
              placeholder="Seleccionar múltiples alimentos..."
              searchPlaceholder="Buscar alimentos..."
              allowClear={true}
              multiple={true}
              maxSelectedDisplay={3}
            />
            <p className="text-sm text-muted-foreground">
              Alimentos seleccionados: {multipleValue.length > 0 ? multipleValue.join(", ") : "Ninguno"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* CÓDIGO DE EJEMPLO */}
      <Card>
        <CardHeader>
          <CardTitle>💻 Código de Ejemplo</CardTitle>
          <CardDescription>
            Así puedes usar el SearchableSelect en tu código
          </CardDescription>
        </CardHeader>
        <CardContent>
          <pre className="bg-muted p-4 rounded-lg text-sm overflow-x-auto">
            <code>{`// Importar
import { SearchableSelect, SearchableSelectOption } from '@/components/shared-ui/molecules/searchable-select'

// Definir opciones
const options: SearchableSelectOption[] = [
  {
    value: "option1",
    label: "Mi Opción",
    description: "Descripción opcional",
    icon: <Icon className="h-4 w-4" />,
    badge: { text: "Nuevo", variant: "default" },
    group: "Grupo Opcional"
  }
]

// Usar en JSX
<SearchableSelect
  options={options}
  value={value}
  onValueChange={setValue}
  placeholder="Seleccionar..."
  searchPlaceholder="Buscar..."
  allowClear={true}
  loading={isLoading}
  emptyMessage="No hay opciones"
  multiple={false}
/>`}</code>
          </pre>
        </CardContent>
      </Card>
    </div>
  )
} 