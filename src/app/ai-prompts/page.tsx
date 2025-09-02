'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Plus, 
  Edit,
  Trash2,
  Eye,
  Copy,
  MessageSquare,
  Brain,
  Shield,
  ShieldCheck,
  Package,
  FileText,
  Layers,
  UserPlus,
  BarChart3,
  FileSearch,
  Mic,
  ArrowUpDown,
  MoreHorizontal
} from 'lucide-react';

import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import { Input } from '@/components/shared-ui/atoms/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui/molecules/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/shared-ui/molecules/dropdown-menu';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useAIPrompts } from '@/hooks/use-ai-prompts';
import { CriteriaDataTable } from '@/components/ui/criteria-data-table';
import { ColumnDef } from '@tanstack/react-table';
import type { AIPrompt, AgentType } from '@/types/ai-prompts';
import { AGENT_METADATA, getAgentScope } from '@/types/ai-prompts';

// Iconos para los agentes
const agentIcons: Record<AgentType, any> = {
  product_curator: Package,
  template_generator: FileText,
  categorization: Layers,
  onboarding: UserPlus,
  business_intelligence: BarChart3,
  document: FileSearch,
  voice: Mic
};

export default function AIPromptsPage() {
  const router = useRouter();
  const { user, token } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  const [activeTab, setActiveTab] = useState<'global' | 'tenant'>('global');
  const [searchTerm, setSearchTerm] = useState('');
  
  const {
    globalPrompts,
    tenantPrompts,
    loading,
    canManageGlobal,
    loadPrompts,
    deletePrompt,
    total,
    limit,
    offset
  } = useAIPrompts();

  // Cargar prompts al montar el componente
  useEffect(() => {
    loadPrompts();
  }, [loadPrompts]);

  // Icono memoizado para el header
  const headerIcon = useMemo(() => <Brain className="w-5 h-5 text-white" />, []);

  // Configurar header
  useEffect(() => {
    const promptCount = globalPrompts.length + tenantPrompts.length;
    setHeaderProps({
      title: 'Gestión de Prompts AI',
      subtitle: `Administra los prompts de los agentes de inteligencia artificial (${promptCount} prompts)`,
      icon: headerIcon
    });

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, headerIcon, globalPrompts.length, tenantPrompts.length]);

  // Determinar qué prompts mostrar según el tab activo
  const displayedPrompts = useMemo(() => {
    if (canManageGlobal) {
      return activeTab === 'global' ? globalPrompts : tenantPrompts;
    }
    return tenantPrompts;
  }, [activeTab, globalPrompts, tenantPrompts, canManageGlobal]);

  // Filtrar prompts según búsqueda
  const filteredPrompts = useMemo(() => {
    if (!searchTerm) return displayedPrompts;
    
    return displayedPrompts.filter(prompt => 
      prompt.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.operation.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.prompt_key?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [displayedPrompts, searchTerm]);

  // Columnas para la tabla
  const columns: ColumnDef<AIPrompt>[] = useMemo(() => [
    {
      accessorKey: 'agent_name',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Agente
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const agent = row.original.agent_name;
        const metadata = AGENT_METADATA[agent];
        const Icon = agentIcons[agent];
        const scope = getAgentScope(agent);
        
        return (
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg bg-${metadata.color}-100 dark:bg-${metadata.color}-900/20`}>
              <Icon className={`w-4 h-4 text-${metadata.color}-600 dark:text-${metadata.color}-400`} />
            </div>
            <div>
              <div className="font-medium">{metadata.label}</div>
              <div className="text-sm text-muted-foreground">{agent}</div>
            </div>
            {scope === 'global' && (
              <Badge variant="outline" className="text-xs">
                <Shield className="w-3 h-3 mr-1" />
                Global
              </Badge>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: 'operation',
      header: 'Operación',
      cell: ({ row }) => (
        <div>
          <div className="font-medium">{row.original.operation}</div>
          {row.original.prompt_key && (
            <div className="text-sm text-muted-foreground">{row.original.prompt_key}</div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'variables',
      header: 'Variables',
      cell: ({ row }) => {
        const variables = row.original.variables;
        const count = Array.isArray(variables) ? variables.length : 0;
        
        if (count === 0) return <span className="text-muted-foreground">Sin variables</span>;
        
        return (
          <div className="flex items-center space-x-2">
            <Badge variant="secondary">{count} variable{count !== 1 ? 's' : ''}</Badge>
            {Array.isArray(variables) && variables.slice(0, 2).map((v, i) => (
              <Badge key={i} variant="outline" className="text-xs">
                {typeof v === 'string' ? v : v.name}
              </Badge>
            ))}
            {count > 2 && <span className="text-xs text-muted-foreground">+{count - 2}</span>}
          </div>
        );
      },
    },
    {
      accessorKey: 'version',
      header: 'Versión',
      cell: ({ row }) => (
        <Badge variant="outline">{row.original.version || '1.0'}</Badge>
      ),
    },
    {
      accessorKey: 'is_active',
      header: 'Estado',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Activo' : 'Inactivo'}
        </Badge>
      ),
    },
    {
      accessorKey: 'updated_at',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Actualizado
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.updated_at);
        return (
          <div className="text-sm">
            <div>{date.toLocaleDateString('es-AR')}</div>
            <div className="text-muted-foreground">{date.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' })}</div>
          </div>
        );
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      cell: ({ row }) => {
        const prompt = row.original;
        const scope = getAgentScope(prompt.agent_name);
        
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => router.push(`/ai-prompts/${prompt.id}`)}>
                <Eye className="mr-2 h-4 w-4" />
                Ver detalle
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push(`/ai-prompts/${prompt.id}/edit`)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDuplicatePrompt(prompt)}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicar
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {(scope === 'tenant' || canManageGlobal) && (
                <DropdownMenuItem 
                  onClick={() => handleDeletePrompt(prompt.id)}
                  className="text-red-600"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Eliminar
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    }
  ], [canManageGlobal, router]);

  // Handlers
  const handleDeletePrompt = async (promptId: string) => {
    if (confirm('¿Estás seguro de eliminar este prompt?')) {
      await deletePrompt(promptId);
    }
  };

  const handleDuplicatePrompt = (prompt: AIPrompt) => {
    // TODO: Implementar duplicación
    console.log('Duplicar prompt:', prompt);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header con acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompts de Agentes AI</CardTitle>
              <CardDescription>
                Gestiona los prompts que controlan el comportamiento de los agentes de inteligencia artificial
              </CardDescription>
            </div>
            <Button 
              onClick={() => router.push('/ai-prompts/create')}
              className="flex items-center space-x-2"
            >
              <Plus className="w-4 h-4" />
              <span>Nuevo Prompt</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Búsqueda */}
          <div className="mb-4">
            <Input
              placeholder="Buscar por agente, operación o clave..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
          </div>

          {/* Tabs para separar global vs tenant */}
          {canManageGlobal ? (
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'global' | 'tenant')}>
              <TabsList className="mb-4">
                <TabsTrigger value="global" className="flex items-center space-x-2">
                  <Shield className="w-4 h-4" />
                  <span>Prompts Globales</span>
                  <Badge variant="secondary" className="ml-2">
                    {globalPrompts.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="tenant" className="flex items-center space-x-2">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Prompts del Tenant</span>
                  <Badge variant="secondary" className="ml-2">
                    {tenantPrompts.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="global">
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <Shield className="w-4 h-4 inline mr-1" />
                    Los prompts globales aplican a todo el marketplace y solo pueden ser gestionados por administradores.
                    Incluyen: curación de productos, generación de templates y categorización automática.
                  </p>
                </div>
                <CriteriaDataTable
                  columns={columns}
                  data={filteredPrompts}
                  loading={loading}
                />
              </TabsContent>

              <TabsContent value="tenant">
                <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    <ShieldCheck className="w-4 h-4 inline mr-1" />
                    Los prompts del tenant son específicos para cada cliente y pueden personalizarse según sus necesidades.
                    Incluyen: onboarding, business intelligence, chat con documentos y procesamiento de voz.
                  </p>
                </div>
                <CriteriaDataTable
                  columns={columns}
                  data={filteredPrompts}
                  loading={loading}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <div className="mb-4 p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  <ShieldCheck className="w-4 h-4 inline mr-1" />
                  Estos prompts controlan el comportamiento de los agentes AI para tu tenant.
                  Puedes personalizarlos según las necesidades de tu negocio.
                </p>
              </div>
              <CriteriaDataTable
                columns={columns}
                data={filteredPrompts}
                loading={loading}
              />
            </>
          )}
        </CardContent>
      </Card>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{globalPrompts.length + tenantPrompts.length}</div>
            <p className="text-xs text-muted-foreground">
              {globalPrompts.length} globales, {tenantPrompts.length} tenant
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Prompts Activos</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {[...globalPrompts, ...tenantPrompts].filter(p => p.is_active).length}
            </div>
            <p className="text-xs text-muted-foreground">
              Configurados y funcionando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agentes Únicos</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set([...globalPrompts, ...tenantPrompts].map(p => p.agent_name)).size}
            </div>
            <p className="text-xs text-muted-foreground">
              De 7 agentes disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Última Actualización</CardTitle>
            <Edit className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(() => {
                const allPrompts = [...globalPrompts, ...tenantPrompts];
                if (allPrompts.length === 0) return 'N/A';
                const latest = allPrompts.reduce((prev, current) => 
                  new Date(current.updated_at) > new Date(prev.updated_at) ? current : prev
                );
                const date = new Date(latest.updated_at);
                const today = new Date();
                const diffTime = Math.abs(today.getTime() - date.getTime());
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                return diffDays === 0 ? 'Hoy' : `Hace ${diffDays} día${diffDays !== 1 ? 's' : ''}`;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">
              Último cambio registrado
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}