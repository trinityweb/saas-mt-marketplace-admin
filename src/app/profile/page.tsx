'use client'

import { useAuth } from '@/app/hooks/use-auth'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui/molecules/card'
import { User } from 'lucide-react'

export default function ProfilePage() {
  const { tenantId } = useAuth()

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Perfil de Usuario</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gestiona tu información personal y configuración de cuenta
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Información Personal</CardTitle>
            </div>
            <CardDescription>
              Información básica de tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Nombre</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Admin</p>
              </div>
              <div>
                <label className="text-sm font-medium">Tenant ID</label>
                <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                  {tenantId || 'No disponible'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium">Rol</label>
                <p className="text-sm text-gray-600 dark:text-gray-400">Administrador</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}