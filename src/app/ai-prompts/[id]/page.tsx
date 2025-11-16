'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Brain,
  Edit,
  Copy,
  Trash2,
  ArrowLeft,
  Eye,
  Clock,
  User,
  Tag,
  AlertCircle,
  CheckCircle,
  Package,
  FileText,
  Layers,
  UserPlus,
  BarChart3,
  FileSearch,
  Mic,
  MessageSquare
} from 'lucide-react';

import { Button } from '@/components/shared-ui/atoms/button';
import { Badge } from '@/components/shared-ui/atoms/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/shared-ui/molecules/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/shared-ui/atoms/textarea';
import { Label } from '@/components/ui/label';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useAIPrompts } from '@/hooks/use-ai-prompts';
import type { AIPrompt, AgentType } from '@/types/ai-prompts';
import { AGENT_METADATA, getAgentScope } from '@/types/ai-prompts';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

export default function PromptDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  const { getPrompt, deletePrompt, canManageGlobal } = useAIPrompts();
  
  const [prompt, setPrompt] = useState<AIPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const promptId = params.id as string;

  // Cargar el prompt
  useEffect(() => {
    const loadPrompt = async () => {
      if (!promptId) return;
      
      setLoading(true);
      setError(null);
      
      try {
        const promptData = await getPrompt(promptId);
        if (promptData) {
          setPrompt(promptData);
        } else {
          setError('Prompt no encontrado');
        }
      } catch (err) {
        setError('Error cargando el prompt');
      } finally {
        setLoading(false);
      }
    };

    loadPrompt();
  }, [promptId, getPrompt]);

  // Configurar header
  useEffect(() => {
    if (prompt) {
      const AgentIcon = agentIcons[prompt.agent_name] || Brain;
      setHeaderProps({
        title: `${AGENT_METADATA[prompt.agent_name]?.label || prompt.agent_name} - ${prompt.operation}`,
        subtitle: `Detalle del prompt ${prompt.prompt_key || ''}`,
        icon: <AgentIcon className="w-5 h-5 text-white" />,
        breadcrumbs: [
          { label: 'Prompts AI', href: '/ai-prompts' },
          { label: 'Detalle', href: `/ai-prompts/${promptId}` }
        ]
      });
    }

    return () => {
      clearHeaderProps();
    };
  }, [setHeaderProps, clearHeaderProps, prompt, promptId]);

  // Determinar permisos
  const canEdit = useMemo(() => {
    if (!prompt) return false;
    const scope = getAgentScope(prompt.agent_name);
    return scope === 'tenant' || canManageGlobal;
  }, [prompt, canManageGlobal]);

  const canDelete = useMemo(() => {
    return canEdit;
  }, [canEdit]);

  // Handlers
  const handleEdit = () => {
    router.push(`/ai-prompts/${promptId}/edit`);
  };

  const handleDelete = async () => {
    if (!prompt) return;
    
    if (confirm(`¿Estás seguro de eliminar el prompt "${prompt.prompt_key}"?`)) {
      const success = await deletePrompt(promptId);
      if (success) {
        router.push('/ai-prompts');
      }
    }
  };

  const handleDuplicate = () => {
    // TODO: Implementar duplicación
    console.log('Duplicar prompt:', prompt);
  };

  const handleBack = () => {
    router.push('/ai-prompts');
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <div className="flex space-x-2">
            <Skeleton className="h-10 w-20" />
            <Skeleton className="h-10 w-20" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-40" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !prompt) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" onClick={handleBack} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || 'Prompt no encontrado'}
            </h3>
            <p className="text-gray-600 mb-4">
              El prompt que estás buscando no existe o no tienes permisos para verlo.
            </p>
            <Button onClick={handleBack}>
              Volver a Prompts AI
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const AgentIcon = agentIcons[prompt.agent_name] || Brain;
  const agentMetadata = AGENT_METADATA[prompt.agent_name];
  const scope = getAgentScope(prompt.agent_name);

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={handleBack} size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Volver a Prompts AI
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="w-4 h-4 mr-2" />
            Duplicar
          </Button>
          
          {canEdit && (
            <Button onClick={handleEdit}>
              <Edit className="w-4 h-4 mr-2" />
              Editar
            </Button>
          )}
          
          {canDelete && (
            <Button variant="destructive" onClick={handleDelete}>
              <Trash2 className="w-4 h-4 mr-2" />
              Eliminar
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Content Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Prompts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="w-5 h-5 mr-2" />
                Contenido del Prompt
              </CardTitle>
              <CardDescription>
                Prompts del sistema y usuario para el agente {agentMetadata?.label || prompt.agent_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Prompt */}
              <div className="space-y-2">
                <Label htmlFor="system-prompt" className="text-sm font-medium">
                  System Prompt
                </Label>
                <Textarea
                  id="system-prompt"
                  value={prompt.system_prompt}
                  readOnly
                  className="min-h-[120px] font-mono text-sm bg-gray-50"
                />
              </div>

              {/* User Prompt */}
              <div className="space-y-2">
                <Label htmlFor="user-prompt" className="text-sm font-medium">
                  User Prompt
                </Label>
                <Textarea
                  id="user-prompt"
                  value={prompt.user_prompt}
                  readOnly
                  className="min-h-[120px] font-mono text-sm bg-gray-50"
                />
              </div>

              {/* Variables */}
              {prompt.variables && prompt.variables.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Variables</Label>
                  <div className="flex flex-wrap gap-2">
                    {prompt.variables.map((variable, index) => (
                      <Badge key={index} variant="outline">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Información General */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AgentIcon className="w-5 h-5 mr-2" />
                Información General
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium text-gray-600">Agente</Label>
                  <p className="text-sm font-medium">{agentMetadata?.label || prompt.agent_name}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Operación</Label>
                  <p className="text-sm">{prompt.operation}</p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Clave</Label>
                  <p className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {prompt.prompt_key}
                  </p>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Versión</Label>
                  <Badge variant="outline">{prompt.version}</Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Ámbito</Label>
                  <Badge variant={scope === 'global' ? 'default' : 'secondary'}>
                    {scope === 'global' ? 'Global' : 'Tenant'}
                  </Badge>
                </div>

                <div>
                  <Label className="text-sm font-medium text-gray-600">Estado</Label>
                  <Badge variant={prompt.is_active ? 'default' : 'secondary'}>
                    <CheckCircle className="w-3 h-3 mr-1" />
                    {prompt.is_active ? 'Activo' : 'Inactivo'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Metadatos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="w-5 h-5 mr-2" />
                Metadatos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-sm font-medium text-gray-600">Creado</Label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(prompt.created_at), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </p>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-600">Última modificación</Label>
                <p className="text-sm">
                  {formatDistanceToNow(new Date(prompt.updated_at), { 
                    addSuffix: true,
                    locale: es 
                  })}
                </p>
              </div>

              {prompt.metadata && Object.keys(prompt.metadata).length > 0 && (
                <div>
                  <Label className="text-sm font-medium text-gray-600">Metadata adicional</Label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(prompt.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Descripción del Agente */}
          {agentMetadata && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Sobre este Agente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {agentMetadata.description}
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
