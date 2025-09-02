"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/shared-ui"
import { Button } from "@/components/shared-ui"
import { Input } from "@/components/shared-ui"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/shared-ui"
import { Separator } from "@/components/shared-ui/atoms/separator"
import { useTheme } from "next-themes"
import { Sun, Moon, Monitor } from "lucide-react"

export default function ThemeTestPage() {
  const { theme, setTheme } = useTheme()

  return (
    <div className="min-h-screen bg-background text-foreground p-8 space-y-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Prueba de Tema - Tienda Vecina
          </h1>
          <p className="text-muted-foreground">
            Esta página permite verificar que todos los colores del tema se estén aplicando correctamente.
          </p>
        </div>

        {/* Theme Selector */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Selector de Tema</CardTitle>
            <CardDescription>
              Cambia entre temas para verificar que los colores se aplican correctamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Claro
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Oscuro
              </Button>
              <Button
                variant={theme === "system" ? "default" : "outline"}
                onClick={() => setTheme("system")}
                className="flex items-center gap-2"
              >
                <Monitor className="h-4 w-4" />
                Sistema
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Primary Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Colores Primarios</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="w-full h-12 bg-primary rounded-md flex items-center justify-center">
                  <span className="text-primary-foreground font-medium">Primary</span>
                </div>
                <div className="w-full h-12 bg-secondary rounded-md flex items-center justify-center">
                  <span className="text-secondary-foreground font-medium">Secondary</span>
                </div>
                <div className="w-full h-12 bg-accent rounded-md flex items-center justify-center">
                  <span className="text-accent-foreground font-medium">Accent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Background Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Fondos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="w-full h-12 bg-background border border-border rounded-md flex items-center justify-center">
                  <span className="text-foreground font-medium">Background</span>
                </div>
                <div className="w-full h-12 bg-card border border-border rounded-md flex items-center justify-center">
                  <span className="text-card-foreground font-medium">Card</span>
                </div>
                <div className="w-full h-12 bg-muted rounded-md flex items-center justify-center">
                  <span className="text-muted-foreground font-medium">Muted</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sidebar Colors */}
          <Card>
            <CardHeader>
              <CardTitle>Sidebar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="w-full h-12 bg-sidebar rounded-md flex items-center justify-center">
                  <span className="text-sidebar-foreground font-medium">Sidebar</span>
                </div>
                <div className="w-full h-12 bg-sidebar-primary rounded-md flex items-center justify-center">
                  <span className="text-sidebar-primary-foreground font-medium">Sidebar Primary</span>
                </div>
                <div className="w-full h-12 bg-sidebar-accent rounded-md flex items-center justify-center">
                  <span className="text-sidebar-accent-foreground font-medium">Sidebar Accent</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Elements */}
          <Card>
            <CardHeader>
              <CardTitle>Elementos de Formulario</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="test-input">Input de prueba</Label>
                <Input 
                  id="test-input" 
                  placeholder="Escribe algo aquí..." 
                  className="bg-background border-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Botones</Label>
                <div className="flex flex-wrap gap-2">
                  <Button variant="default" size="sm">Default</Button>
                  <Button variant="secondary" size="sm">Secondary</Button>
                  <Button variant="outline" size="sm">Outline</Button>
                  <Button variant="destructive" size="sm">Destructive</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges */}
          <Card>
            <CardHeader>
              <CardTitle>Badges</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="default">Default</Badge>
                <Badge variant="secondary">Secondary</Badge>
                <Badge variant="outline">Outline</Badge>
                <Badge variant="danger">Danger</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Text Examples */}
          <Card>
            <CardHeader>
              <CardTitle>Texto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <p className="text-foreground font-semibold">Texto principal (foreground)</p>
                <p className="text-muted-foreground">Texto secundario (muted-foreground)</p>
                <p className="text-primary">Texto primario (primary)</p>
                <p className="text-secondary">Texto secundario (secondary)</p>
                <p className="text-destructive">Texto destructivo (destructive)</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* CSS Variables Display */}
        <Card>
          <CardHeader>
            <CardTitle>Variables CSS Actuales</CardTitle>
            <CardDescription>
              Estas son las variables CSS que se están aplicando actualmente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm font-mono">
              <div>
                <h4 className="font-semibold text-foreground mb-2">Colores principales:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>--background: <span className="text-foreground">hsl(var(--background))</span></li>
                  <li>--foreground: <span className="text-foreground">hsl(var(--foreground))</span></li>
                  <li>--primary: <span className="text-foreground">hsl(var(--primary))</span></li>
                  <li>--secondary: <span className="text-foreground">hsl(var(--secondary))</span></li>
                  <li>--accent: <span className="text-foreground">hsl(var(--accent))</span></li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-foreground mb-2">Sidebar:</h4>
                <ul className="space-y-1 text-muted-foreground">
                  <li>--sidebar-background: <span className="text-foreground">hsl(var(--sidebar-background))</span></li>
                  <li>--sidebar-foreground: <span className="text-foreground">hsl(var(--sidebar-foreground))</span></li>
                  <li>--sidebar-primary: <span className="text-foreground">hsl(var(--sidebar-primary))</span></li>
                  <li>--sidebar-accent: <span className="text-foreground">hsl(var(--sidebar-accent))</span></li>
                  <li>--sidebar-border: <span className="text-foreground">hsl(var(--sidebar-border))</span></li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Instrucciones de Prueba</CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="list-decimal list-inside space-y-2 text-muted-foreground">
              <li>Cambia entre los temas claro y oscuro usando los botones arriba</li>
              <li>Verifica que todos los colores cambien correctamente</li>
              <li>Asegúrate de que el texto sea legible en todos los fondos</li>
              <li>Prueba la interacción con los botones y elementos de formulario</li>
              <li>Verifica que el sidebar (izquierda) use los colores correctos</li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 