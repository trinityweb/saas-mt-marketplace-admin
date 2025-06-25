"use client"

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import remarkBreaks from 'remark-breaks'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, FileText, Calendar, ExternalLink, Copy, Check } from 'lucide-react'
import Link from 'next/link'
import 'highlight.js/styles/github-dark.css'

interface DocumentData {
  content: string
  title: string
  filename: string
  lastModified?: string
}

// Tabla de contenidos automática
const TableOfContents = ({ content }: { content: string }) => {
  const [headings, setHeadings] = useState<Array<{ id: string; text: string; level: number }>>([])
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const lines = content.split('\n')
    const headingLines = lines.filter(line => line.startsWith('#'))
    
    const parsedHeadings = headingLines.map((line, index) => {
      const level = line.match(/^#+/)?.[0].length || 1
      const text = line.replace(/^#+\s*/, '').trim()
      const id = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '')
      
      return { id: `heading-${id}`, text, level }
    })

    setHeadings(parsedHeadings)
  }, [content])

  // Efecto para detectar qué sección está visible
  useEffect(() => {
    if (headings.length === 0) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        })
      },
      {
        rootMargin: '-20% 0% -35% 0%',
        threshold: 0
      }
    )

    // Observar todos los headings
    headings.forEach((heading) => {
      const element = document.getElementById(heading.id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [headings])

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, headingId: string) => {
    e.preventDefault()
    const element = document.getElementById(headingId)
    if (element) {
      const yOffset = -80 // Compensar por header fijo
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
      
      window.scrollTo({
        top: y,
        behavior: 'smooth'
      })
      
      // Actualizar URL sin causar scroll adicional
      window.history.pushState(null, '', `#${headingId}`)
      setActiveId(headingId)
    }
  }

  if (headings.length === 0) return null

  return (
    <Card className="p-4 sticky top-4">
      <h3 className="font-semibold text-sm mb-3 text-slate-900 dark:text-slate-100">
        Tabla de Contenidos
      </h3>
      <div className="space-y-1">
        {headings.map((heading) => (
          <a
            key={heading.id}
            href={`#${heading.id}`}
            onClick={(e) => handleClick(e, heading.id)}
            className={`block text-sm transition-colors cursor-pointer ${
              activeId === heading.id 
                ? 'text-purple-600 dark:text-purple-400 font-medium' 
                : 'hover:text-purple-600 dark:hover:text-purple-400'
            } ${
              heading.level === 1 ? 'font-medium text-slate-900 dark:text-slate-100' :
              heading.level === 2 ? 'pl-3 text-slate-700 dark:text-slate-300' :
              'pl-6 text-slate-600 dark:text-slate-400'
            }`}
          >
            {heading.text}
          </a>
        ))}
      </div>
    </Card>
  )
}

// Componente para copiar enlaces de secciones
const CopyLinkButton = ({ headingId }: { headingId: string }) => {
  const [copied, setCopied] = useState(false)

  const copyLink = async () => {
    const url = `${window.location.origin}${window.location.pathname}#${headingId}`
    await navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      onClick={copyLink}
      className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
      title="Copiar enlace"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Copy className="h-4 w-4 text-slate-500" />
      )}
    </button>
  )
}

export default function DocumentPage() {
  const params = useParams()
  const router = useRouter()
  const [document, setDocument] = useState<DocumentData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const slug = params.slug as string

  useEffect(() => {
    const fetchDocument = async () => {
      try {
        setLoading(true)
        const filename = `${slug}.md`
        
        // Intentar cargar el archivo desde la carpeta public/docs
        const response = await fetch(`/docs/${filename}`)
        
        if (!response.ok) {
          throw new Error(`Documento no encontrado: ${filename}`)
        }
        
        const content = await response.text()
        
        // Extraer título del contenido (primer # que encuentre)
        const titleMatch = content.match(/^#\s+(.+)$/m)
        const title = titleMatch ? titleMatch[1] : slug.replace(/-/g, ' ').toUpperCase()
        
        setDocument({
          content,
          title,
          filename,
          lastModified: new Date().toLocaleDateString('es-ES')
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    if (slug) {
      fetchDocument()
    }
  }, [slug])

  // Efecto para manejar enlaces directos con hash
  useEffect(() => {
    if (!document || loading) return

    const hash = window.location.hash
    if (hash) {
      // Esperar un poco para que el DOM se renderice completamente
      setTimeout(() => {
        const element = document.querySelector(hash)
        if (element) {
          const yOffset = -80
          const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset
          
          window.scrollTo({
            top: y,
            behavior: 'smooth'
          })
        }
      }, 100)
    }
  }, [document, loading])

  // Función para generar IDs consistentes
  const generateHeadingId = (text: string) => {
    return `heading-${text.toLowerCase().replace(/[^a-z0-9\s]/g, '').replace(/\s+/g, '-').replace(/(^-|-$)/g, '')}`
  }

  // Renderizador personalizado para agregar IDs a los headings
  const components = {
    h1: ({ children, ...props }: any) => {
      const text = children.toString()
      const id = generateHeadingId(text)
      return (
        <h1 {...props} id={id} className="group scroll-mt-20">
          {children}
          <CopyLinkButton headingId={id} />
        </h1>
      )
    },
    h2: ({ children, ...props }: any) => {
      const text = children.toString()
      const id = generateHeadingId(text)
      return (
        <h2 {...props} id={id} className="group scroll-mt-20">
          {children}
          <CopyLinkButton headingId={id} />
        </h2>
      )
    },
    h3: ({ children, ...props }: any) => {
      const text = children.toString()
      const id = generateHeadingId(text)
      return (
        <h3 {...props} id={id} className="group scroll-mt-20">
          {children}
          <CopyLinkButton headingId={id} />
        </h3>
      )
    },
    // Personalizar enlaces para que se abran en nueva pestaña si son externos
    a: ({ href, children, ...props }: any) => {
      const isExternal = href?.startsWith('http')
      const isAnchor = href?.startsWith('#')
      
      if (isExternal) {
        return (
          <a 
            {...props} 
            href={href} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-purple-600 hover:text-purple-800 inline-flex items-center gap-1"
          >
            {children}
            <ExternalLink className="h-3 w-3" />
          </a>
        )
      }
      
      if (isAnchor) {
        return <a {...props} href={href} className="text-purple-600 hover:text-purple-800">{children}</a>
      }
      
      return <a {...props} href={href} className="text-purple-600 hover:text-purple-800">{children}</a>
    },
    // Mejorar la presentación de código
    pre: ({ children, ...props }: any) => (
      <pre {...props} className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
        {children}
      </pre>
    ),
    code: ({ children, className, ...props }: any) => {
      const isInline = !className?.includes('language-')
      if (isInline) {
        return (
          <code {...props} className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded text-sm">
            {children}
          </code>
        )
      }
      return <code {...props} className={className}>{children}</code>
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-5/6"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-4/6"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !document) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-2">
            Documento no encontrado
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {error || 'El documento solicitado no pudo ser cargado'}
          </p>
          <Link href="/documentation">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver a Documentación
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header con navegación */}
      <div className="mb-6">
        <Link href="/documentation">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a Documentación
          </Button>
        </Link>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <FileText className="h-8 w-8 text-purple-600" />
            <div>
              <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
                {document.title}
              </h1>
              <div className="flex items-center space-x-4 text-sm text-slate-600 dark:text-slate-400 mt-1">
                <span>📄 {document.filename}</span>
                {document.lastModified && (
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>Actualizado: {document.lastModified}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Separator className="mb-6" />

      {/* Layout con tabla de contenidos y contenido */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tabla de contenidos (sidebar en desktop) */}
        <div className="lg:col-span-1 order-2 lg:order-1">
          <TableOfContents content={document.content} />
        </div>

        {/* Contenido principal */}
        <div className="lg:col-span-3 order-1 lg:order-2">
          <Card className="p-6">
            <div className="prose prose-slate dark:prose-invert max-w-none">
              <ReactMarkdown
                remarkPlugins={[remarkGfm, remarkBreaks]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={components}
              >
                {document.content}
              </ReactMarkdown>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
} 