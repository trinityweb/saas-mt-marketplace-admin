'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { createPortal } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/shared-ui';
import { Button } from '@/components/shared-ui';
import { Copy, Download, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface MermaidDiagramProps {
  id: string;
  title: string;
  description?: string;
  diagram: string;
  className?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Componente interno que maneja Mermaid
function MermaidDiagramInternal({
  id,
  title,
  description,
  diagram,
  className,
  collapsible = true,
  defaultExpanded = true
}: MermaidDiagramProps) {
  const placeholderRef = useRef<HTMLDivElement>(null);
  const [mermaidContainer, setMermaidContainer] = useState<HTMLDivElement | null>(null);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Crear contenedor externo una sola vez
  useEffect(() => {
    const container = document.createElement('div');
    container.className = 'mermaid-external-container flex justify-center';
    container.style.minHeight = '200px';
    setMermaidContainer(container);
    
    return () => {
      // Cleanup seguro
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    };
  }, []);

  const renderDiagram = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Importar Mermaid dinámicamente
      const mermaidModule = await import('mermaid');
      const mermaid = mermaidModule.default;
      
      // Hacer disponible globalmente para debugging
      if (typeof window !== 'undefined') {
        (window as any).mermaid = mermaid;
      }
      
      // Configurar Mermaid
      mermaid.initialize({
        startOnLoad: false,
        theme: 'default',
        securityLevel: 'loose',
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: 14,
        logLevel: 'error',
      });

      // Generar el diagrama
      const result = await mermaid.render(id, diagram);
      
      // SOLUCIÓN PORTAL EXTERNO: Usar contenedor completamente separado de React
      if (mermaidContainer) {
        mermaidContainer.innerHTML = result.svg;
        console.log(`✅ [${id}] Mermaid diagram rendered safely (${result.svg.length} chars)`);
      } else {
        console.error(`❌ [${id}] mermaidContainer es null`);
        setError('Contenedor externo no disponible');
      }

    } catch (error) {
      console.error(`💥 [${id}] Error rendering Mermaid diagram:`, error);
      setError(error instanceof Error ? error.message : 'Error al renderizar diagrama');
      
      // Error handling externo
      if (mermaidContainer) {
        mermaidContainer.innerHTML = '<p style="color: red;">Error al generar diagrama</p>';
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Montar/desmontar contenedor externo en placeholder
  useEffect(() => {
    if (!mermaidContainer || !placeholderRef.current) return;
    
    if (isExpanded) {
      // Montar contenedor externo
      if (!mermaidContainer.parentNode) {
        placeholderRef.current.appendChild(mermaidContainer);
      }
      renderDiagram();
    } else {
      // Desmontar contenedor externo
      if (mermaidContainer.parentNode) {
        mermaidContainer.parentNode.removeChild(mermaidContainer);
      }
    }
  }, [mermaidContainer, isExpanded, id, diagram]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleCopyDiagram = useCallback(() => {
    navigator.clipboard.writeText(diagram);
    toast.success('Código del diagrama copiado');
  }, [diagram]);

  const handleDownloadSVG = useCallback(() => {
    if (!mermaidContainer) return;

    // Buscar SVG en el contenedor externo
    const svgElement = mermaidContainer.querySelector('svg');
    if (!svgElement) {
      toast.error('No hay diagrama para descargar');
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const svgUrl = URL.createObjectURL(svgBlob);

    const downloadLink = document.createElement('a');
    downloadLink.href = svgUrl;
    downloadLink.download = `${id}-diagram.svg`;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
    URL.revokeObjectURL(svgUrl);

    toast.success('Diagrama descargado como SVG');
  }, [mermaidContainer]);

  return (
    <Card className={cn('overflow-hidden', className)} data-testid="mermaid-diagram" id={id}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg mermaid-title">{title}</CardTitle>
            {description && (
              <CardDescription className="mt-1">{description}</CardDescription>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyDiagram}
              className="h-8 w-8 p-0"
              title="Copiar código Mermaid"
            >
              <Copy className="h-4 w-4" />
            </Button>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDownloadSVG}
              className="h-8 w-8 p-0"
              title="Descargar SVG"
              disabled={isLoading || !!error}
            >
              <Download className="h-4 w-4" />
            </Button>
            
            {collapsible && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 p-0"
                title={isExpanded ? 'Contraer' : 'Expandir'}
              >
                {isExpanded ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent>
          {isLoading && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin h-6 w-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-2"></div>
                <p className="text-sm text-muted-foreground">Renderizando diagrama...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <p className="text-sm text-red-600 mb-2">Error al renderizar diagrama:</p>
                <code className="text-xs bg-red-50 p-2 rounded">{error}</code>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <div 
              ref={placeholderRef}
              className="mermaid-placeholder"
              style={{ minHeight: '200px' }}
            >
              {isLoading && (
                <div className="flex items-center justify-center p-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
                  <span className="text-sm text-muted-foreground">Generando diagrama...</span>
                </div>
              )}
              {error && (
                <div className="flex items-center justify-center p-8 text-red-500">
                  <span className="text-sm">Error: {error}</span>
                </div>
              )}
            </div>
          </div>

          {/* Código fuente colapsible */}
          <details className="mt-6 border-t pt-4">
            <summary className="cursor-pointer text-sm font-medium text-muted-foreground hover:text-foreground">
              Ver código Mermaid
            </summary>
            <pre className="mt-2 p-4 bg-muted rounded-lg text-xs overflow-x-auto">
              <code>{diagram}</code>
            </pre>
          </details>
        </CardContent>
      )}
    </Card>
  );
}

// Export con dynamic loading - NO SSR para evitar conflictos de hidratación
export const MermaidDiagram = dynamic(() => Promise.resolve(MermaidDiagramInternal), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
      <span className="text-sm text-muted-foreground">Cargando diagrama...</span>
    </div>
  )
});
