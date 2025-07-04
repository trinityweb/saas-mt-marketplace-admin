"use client"

import { createContext, useContext, useState, ReactNode, useCallback, Suspense, useEffect } from "react"
import dynamic from 'next/dynamic'
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { Loading } from "@/components/shared-ui/atoms/loading"

// Lazy load el ServicesHealthSidebar
const ServicesHealthSidebar = dynamic(
  () => import("@/components/ServicesHealthSidebar").then(mod => ({ default: mod.ServicesHealthSidebar })),
  { 
    loading: () => <div className="w-80 border-l border-slate-200 dark:border-slate-700 flex items-center justify-center"><Loading /></div>,
    ssr: false 
  }
)

interface HeaderContextType {
  setHeaderProps: (props: {
    title?: string
    subtitle?: string
    backUrl?: string
    backLabel?: string
    icon?: React.ReactNode
    actions?: React.ReactNode
  }) => void
  clearHeaderProps: () => void
}

const HeaderContext = createContext<HeaderContextType | undefined>(undefined)

export function useHeader() {
  const context = useContext(HeaderContext)
  if (!context) {
    throw new Error('useHeader must be used within HeaderProvider')
  }
  return context
}

interface AdminLayoutProps {
  children: ReactNode
}

export function AdminLayoutOptimized({ children }: AdminLayoutProps) {
  const [headerProps, setHeaderPropsState] = useState<{
    title?: string
    subtitle?: string
    backUrl?: string
    backLabel?: string
    icon?: React.ReactNode
    actions?: React.ReactNode
  }>({})

  const [showHealthSidebar, setShowHealthSidebar] = useState(false)

  const setHeaderProps = useCallback((props: typeof headerProps) => {
    setHeaderPropsState(props)
  }, [])

  const clearHeaderProps = useCallback(() => {
    setHeaderPropsState({})
  }, [])

  // Cargar el health sidebar solo después de un delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowHealthSidebar(true)
    }, 1000) // Cargar después de 1 segundo

    return () => clearTimeout(timer)
  }, [])

  return (
    <HeaderContext.Provider value={{ setHeaderProps, clearHeaderProps }}>
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        {/* Navigation Sidebar - Left */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <AdminHeader {...headerProps} />
          
          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </main>
        </div>
        
        {/* Services Health Sidebar - Right (Lazy loaded) */}
        {showHealthSidebar && (
          <div className="hidden xl:block w-80 border-l border-slate-200 dark:border-slate-700">
            <ServicesHealthSidebar />
          </div>
        )}
      </div>
    </HeaderContext.Provider>
  )
}