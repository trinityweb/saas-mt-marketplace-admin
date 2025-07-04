'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/hooks/use-auth'
import { Button } from '@/components/shared-ui/atoms/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui/molecules/card'
import { LogOut } from 'lucide-react'

export default function LogoutPage() {
  const router = useRouter()
  const { logout } = useAuth()

  const handleLogout = async () => {
    try {
      await logout()
      router.push('/auth/login')
    } catch (error) {
      console.error('Error durante el logout:', error)
      // Forzar redirección incluso si hay error
      router.push('/auth/login')
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <LogOut className="h-12 w-12 text-red-500" />
          </div>
          <CardTitle>Cerrar Sesión</CardTitle>
          <CardDescription>
            ¿Estás seguro de que quieres cerrar sesión?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={handleLogout}
            variant="destructive" 
            className="w-full"
          >
            Sí, cerrar sesión
          </Button>
          <Button 
            onClick={() => router.back()}
            variant="outline" 
            className="w-full"
          >
            Cancelar
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}