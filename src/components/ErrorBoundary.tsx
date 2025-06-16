'use client'

import React from 'react'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  AlertTriangle,
  RefreshCw,
  Home
} from "lucide-react"

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error!} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error!} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error
  resetError: () => void
}

function DefaultErrorFallback({ error, resetError }: ErrorFallbackProps) {
  const isNetworkError = error.message.includes('fetch') || 
                         error.message.includes('network') ||
                         error.message.includes('conectar')

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-red-50 to-orange-50 dark:from-gray-900 dark:to-gray-800">
      <Card className="max-w-md w-full p-6">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 mx-auto bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              {isNetworkError ? 'Error de Conexión' : 'Error de Aplicación'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {isNetworkError 
                ? 'No se puede conectar con los servicios backend. Verifique que estén ejecutándose.'
                : 'Ha ocurrido un error inesperado en la aplicación.'
              }
            </p>
          </div>

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-left">
              <strong>Error:</strong> {error.message}
            </AlertDescription>
          </Alert>

          <div className="flex gap-2 justify-center">
            <Button onClick={resetError} variant="outline" size="sm">
              <RefreshCw className="w-4 h-4 mr-2" />
              Reintentar
            </Button>
            <Button 
              onClick={() => window.location.href = '/auth/login'} 
              variant="default" 
              size="sm"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al Login
            </Button>
          </div>

          {process.env.NODE_ENV === 'development' && (
            <details className="text-left">
              <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">
                Detalles técnicos (desarrollo)
              </summary>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>
      </Card>
    </div>
  )
}

// Hook para usar en componentes funcionales
export function useErrorHandler() {
  return (error: Error) => {
    console.error('Unhandled error:', error)
    // Aquí podrías enviar el error a un servicio de logging
  }
} 