'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui/molecules/card'
import { Settings } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Configuración</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Personaliza tu experiencia y configuración de la aplicación
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <CardTitle>Configuración General</CardTitle>
            </div>
            <CardDescription>
              Ajusta las preferencias generales de la aplicación
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Tema</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configuración de tema disponible en el header
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Notificaciones</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Configuración de notificaciones (próximamente)
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Idioma</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Español (por defecto)
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}