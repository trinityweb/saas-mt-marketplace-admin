'use client'

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/shared-ui/molecules/card"
import { Badge } from "@/components/shared-ui/atoms/badge"
import { Activity, RefreshCw } from "lucide-react"
import { Button } from "@/components/shared-ui/atoms/button"

export function ServicesHealthSidebar() {
  const [isVisible, setIsVisible] = useState(false)
  
  // Solo mostrar después de 2 segundos para no afectar la carga inicial
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 2000)
    return () => clearTimeout(timer)
  }, [])
  if (!isVisible) {
    return (
      <div className="h-full p-4 flex items-center justify-center">
        <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="h-full p-4 space-y-4 animate-in fade-in-0 duration-500">
      <div className="flex items-center gap-2">
        <Activity className="h-5 w-5 text-muted-foreground" />
        <h3 className="font-semibold">Estado de Servicios</h3>
      </div>
      
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Servicios Backend</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">IAM Service</span>
            <Badge variant="success" className="text-xs">Online</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">PIM Service</span>
            <Badge variant="success" className="text-xs">Online</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">Stock Service</span>
            <Badge variant="success" className="text-xs">Online</Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm">API Gateway</span>
            <Badge variant="success" className="text-xs">Online</Badge>
          </div>
        </CardContent>
      </Card>
      
      <div className="text-xs text-muted-foreground text-center">
        Última actualización: Ahora
      </div>
    </div>
  )
}