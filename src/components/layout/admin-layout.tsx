"use client"

import { createContext, useContext, useState, ReactNode, useCallback, Suspense } from "react"
import dynamic from 'next/dynamic'
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { Loading } from "@/components/shared-ui/atoms/loading"

// Usar temporalmente la versión simple para evitar problemas
import { ServicesHealthSidebar } from "@/components/ServicesHealthSidebarSimple"
import { PreloadManager } from "@/components/PreloadManager"

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

export function AdminLayout({ children }: AdminLayoutProps) {
  const [headerProps, setHeaderPropsState] = useState<{
    title?: string
    subtitle?: string
    backUrl?: string
    backLabel?: string
    icon?: React.ReactNode
    actions?: React.ReactNode
  }>({})

  const setHeaderProps = useCallback((props: typeof headerProps) => {
    setHeaderPropsState(props)
  }, [])

  const clearHeaderProps = useCallback(() => {
    setHeaderPropsState({})
  }, [])

  return (
    <HeaderContext.Provider value={{ setHeaderProps, clearHeaderProps }}>
      <PreloadManager />
      <div className="h-screen bg-slate-50 dark:bg-slate-900 flex overflow-hidden">
        {/* Navigation Sidebar - Left */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <AdminHeader {...headerProps} />
          
          {/* Page Content - Wrapped in Suspense */}
          <main className="flex-1 p-4 overflow-y-auto">
            <Suspense fallback={<Loading />}>
              {children}
            </Suspense>
          </main>
        </div>
        
        {/* Services Health Sidebar - Right */}
        <div className="hidden xl:block w-80 border-l border-slate-200 dark:border-slate-700 overflow-y-auto">
          <ServicesHealthSidebar />
        </div>
      </div>
    </HeaderContext.Provider>
  )
}