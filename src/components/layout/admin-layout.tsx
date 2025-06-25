"use client"

import { createContext, useContext, useState, ReactNode, useCallback } from "react"
import { AdminSidebar } from "./admin-sidebar"
import { AdminHeader } from "./admin-header"
import { ServicesHealthSidebar } from "@/components/ServicesHealthSidebar"

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
        {/* Navigation Sidebar - Left */}
        <AdminSidebar />
        
        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <AdminHeader {...headerProps} />
          
          {/* Page Content */}
          <main className="flex-1 p-6 overflow-auto">
            {children}
          </main>
        </div>
        
        {/* Services Health Sidebar - Right (Full Height) */}
        <div className="hidden xl:block w-80 border-l border-slate-200 dark:border-slate-700">
          <ServicesHealthSidebar />
        </div>
      </div>
    </HeaderContext.Provider>
  )
} 