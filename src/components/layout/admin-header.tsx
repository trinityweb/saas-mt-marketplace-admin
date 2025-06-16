"use client"

import { Search, Bell, Globe, Zap, Activity, ArrowLeft, Layers } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ServicesStatusIndicator } from "@/components/ServicesStatusIndicator"
import Link from "next/link"

interface AdminHeaderProps {
  title?: string
  subtitle?: string
  backUrl?: string
  backLabel?: string
  icon?: React.ReactNode
}

export function AdminHeader({ 
  title, 
  subtitle, 
  backUrl, 
  backLabel = "Volver",
  icon 
}: AdminHeaderProps = {}) {
  const showCustomHeader = title || backUrl

  return (
    <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-6 py-4">
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          {showCustomHeader ? (
            <div className="flex items-center space-x-4">
              {backUrl && (
                <Link href={backUrl}>
                  <Button variant="ghost" size="sm">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    {backLabel}
                  </Button>
                </Link>
              )}
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                  {icon || <Layers className="w-5 h-5 text-white" />}
                </div>
                <div>
                  <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">{title}</h1>
                  {subtitle && (
                    <p className="text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-slate-800 dark:text-slate-200">Marketplace Admin</h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">Panel de administración marketplace multi-tenant</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex items-center space-x-4">
          {/* Theme Toggle */}
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
} 