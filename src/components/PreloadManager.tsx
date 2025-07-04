'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

// Mapeo de rutas a componentes que se deben precargar
const routePreloads: Record<string, () => void> = {
  '/': () => {
    // Precargar componentes comunes del dashboard
    import('@/components/ui/stats-card')
  },
  '/marketplace-brands': () => {
    // Precargar componentes de la página de marcas
    import('@/components/ui/criteria-data-table')
    import('@/hooks/use-marketplace-brands')
  },
  '/global-catalog': () => {
    // Precargar componentes del catálogo
    import('@/components/ui/criteria-data-table')
    import('@tanstack/react-table')
  },
  '/taxonomy': () => {
    // Precargar componentes de taxonomía
    import('@/components/ui/criteria-data-table')
  }
}

export function PreloadManager() {
  const pathname = usePathname()

  useEffect(() => {
    // Precargar componentes comunes después de 1 segundo
    const commonTimer = setTimeout(() => {
      // Componentes usados en múltiples páginas
      import('@/components/shared-ui/molecules/dropdown-menu')
      import('@/components/shared-ui/organisms/dialog')
      import('@/components/shared-ui/molecules/select')
    }, 1000)

    // Precargar componentes específicos de la ruta actual
    const routeTimer = setTimeout(() => {
      const preload = routePreloads[pathname]
      if (preload) {
        preload()
      }
    }, 500)

    return () => {
      clearTimeout(commonTimer)
      clearTimeout(routeTimer)
    }
  }, [pathname])

  return null
}