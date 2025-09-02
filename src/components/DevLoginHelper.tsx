'use client'

import { useState } from 'react'
import { Button } from "@/components/shared-ui"
import { Card } from "@/components/shared-ui"
import { Badge } from "@/components/shared-ui"
import { 
  Code,
  Zap
} from "lucide-react"

interface DevLoginHelperProps {
  onDevLogin?: () => void
}

export function DevLoginHelper({ onDevLogin }: DevLoginHelperProps) {
  const [isSimulating, setIsSimulating] = useState(false)

  // Solo mostrar en desarrollo
  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  const simulateLogin = () => {
    setIsSimulating(true)
    
    // Crear un JWT válido con exp en el futuro
    const header = { alg: 'HS256', typ: 'JWT' }
    const payload = {
      tenant_id: '00000000-0000-0000-0000-000000000001',
      user_id: 'dev-user-001',
      role_id: 'marketplace_admin',
      role: 'marketplace_admin',
      email: 'admin@dev.com',
      exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24), // Expira en 24 horas
      iat: Math.floor(Date.now() / 1000),
      iss: 'dev-marketplace-admin'
    }
    
    // Codificar el JWT (formato básico pero válido para desarrollo)
    const base64Header = btoa(JSON.stringify(header))
    const base64Payload = btoa(JSON.stringify(payload))
    const mockAccessToken = `${base64Header}.${base64Payload}.dev-signature`
    
    const mockRefreshToken = 'mock-refresh-token'
    const mockTenantId = '00000000-0000-0000-0000-000000000001'

    // Guardar en localStorage
    localStorage.setItem('iam_access_token', mockAccessToken)
    localStorage.setItem('iam_refresh_token', mockRefreshToken)
    localStorage.setItem('current_tenant_id', mockTenantId)

    setTimeout(() => {
      setIsSimulating(false)
      if (onDevLogin) {
        onDevLogin()
      } else {
        // Recargar la página para activar el estado de autenticación
        window.location.reload()
      }
    }, 1000)
  }

  return (
    <Card className="p-4 border-dashed border-orange-300 bg-orange-50 dark:bg-orange-950/20">
      <div className="flex items-start gap-3">
        <Code className="w-5 h-5 text-orange-600 mt-0.5" />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-medium text-orange-800 dark:text-orange-200">
              Modo Desarrollo
            </h3>
            <Badge variant="outline" className="text-xs border-orange-300 text-orange-700">
              DEV
            </Badge>
          </div>
          <p className="text-sm text-orange-700 dark:text-orange-300 mb-3">
            Los servicios backend no están disponibles. Puedes simular un login para probar la interfaz.
          </p>
          <div className="flex items-center gap-2">
            <Button
              onClick={simulateLogin}
              disabled={isSimulating}
              size="sm"
              variant="outline"
              className="border-orange-300 text-orange-700 hover:bg-orange-100"
            >
              {isSimulating ? (
                <>
                  <Zap className="w-3 h-3 mr-1 animate-pulse" />
                  Simulando...
                </>
              ) : (
                <>
                  <Zap className="w-3 h-3 mr-1" />
                  Simular Login
                </>
              )}
            </Button>
            <div className="text-xs text-orange-600 dark:text-orange-400">
              Usuario: admin@dev.com
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
} 