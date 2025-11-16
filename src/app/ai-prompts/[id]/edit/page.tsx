'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Brain,
  Save,
  ArrowLeft,
  AlertCircle,
  CheckCircle,
  Package,
  FileText,
  Layers,
  UserPlus,
  BarChart3,
  FileSearch,
  Mic,
  Plus,
  X
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
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/shared-ui/molecules/select';
import { Textarea } from '@/components/shared-ui/atoms/textarea';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';

import { useAuth } from '@/hooks/use-auth';
import { useHeader } from '@/components/layout/admin-layout';
import { useAIPrompts } from '@/hooks/use-ai-prompts';
import type { AIPrompt, AgentType, UpdatePromptRequest } from '@/types/ai-prompts';
import { AGENT_METADATA, getAgentScope } from '@/types/ai-prompts';
import { toast } from 'sonner';

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

// Schema de validación
const promptFormSchema = z.object({
  system_prompt: z.string().min(10, 'El system prompt debe tener al menos 10 caracteres'),
  user_prompt: z.string().min(5, 'El user prompt debe tener al menos 5 caracteres'),
  variables: z.array(z.string()).optional(),
  metadata: z.record(z.any()).optional()
});

type PromptFormData = z.infer<typeof promptFormSchema>;

export default function EditPromptPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { setHeaderProps, clearHeaderProps } = useHeader();
  const { getPrompt, updatePrompt, canManageGlobal } = useAIPrompts();
  
  const [prompt, setPrompt] = useState<AIPrompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newVariable, setNewVariable] = useState('');

  const promptId = params.id as string;

  const form = useForm<PromptFormData>({
    resolver: zodResolver(promptFormSchema),
    defaultValues: {
      system_prompt: '',
      user_prompt: '',
      variables: [],
      metadata: {}
    }
  });

  const { watch, setValue } = form;
  const variables = watch('variables') || [];

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
          
          // Llenar el formulario
          form.reset({
            system_prompt: promptData.system_prompt,
            user_prompt: promptData.user_prompt,
            variables: promptData.variables || [],
            metadata: promptData.metadata || {}
          });
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
  }, [promptId, getPrompt, form]);

  // Configurar header
  useEffect(() => {
    if (prompt) {
      const AgentIcon = agentIcons[prompt.agent_name] || Brain;
      setHeaderProps({
        title: `Editar Prompt - ${AGENT_METADATA[prompt.agent_name]?.label || prompt.agent_name}`,
        subtitle: `Editando: ${prompt.prompt_key || ''}`,
        icon: <AgentIcon className="w-5 h-5 text-white" />,
        breadcrumbs: [
          { label: 'Prompts AI', href: '/ai-prompts' },
          { label: 'Detalle', href: `/ai-prompts/${promptId}` },
          { label: 'Editar', href: `/ai-prompts/${promptId}/edit` }
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

  // Handlers
  const handleBack = () => {
    router.push(`/ai-prompts/${promptId}`);
  };

  const handleAddVariable = () => {
    if (newVariable.trim() && !variables.includes(newVariable.trim())) {
      const updatedVariables = [...variables, newVariable.trim()];
      setValue('variables', updatedVariables);
      setNewVariable('');
    }
  };

  const handleRemoveVariable = (index: number) => {
    const updatedVariables = variables.filter((_, i) => i !== index);
    setValue('variables', updatedVariables);
  };

  const onSubmit = async (data: PromptFormData) => {
    if (!prompt || !canEdit) return;
    
    setSaving(true);
    
    try {
      const updateData: UpdatePromptRequest = {
        system_prompt: data.system_prompt,
        user_prompt: data.user_prompt,
        variables: data.variables,
        metadata: data.metadata
      };
      
      console.log('Updating prompt with data:', updateData);
      
      const updatedPrompt = await updatePrompt(promptId, updateData);
      
      if (updatedPrompt) {
        router.push(`/ai-prompts/${promptId}`);
      } else {
        console.error('Update failed: no prompt returned');
      }
    } catch (err) {
      console.error('Error updating prompt:', err);
      toast.error(`Error al actualizar el prompt: ${err instanceof Error ? err.message : 'Error desconocido'}`);
    } finally {
      setSaving(false);
    }
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
        
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-32 w-full" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !prompt || !canEdit) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center space-x-2 mb-6">
          <Button variant="ghost" onClick={() => router.push('/ai-prompts')} size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver
          </Button>
        </div>
        
        <Card className="max-w-2xl mx-auto">
          <CardContent className="text-center py-8">
            <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || 'No tienes permisos para editar este prompt'}
            </h3>
            <p className="text-gray-600 mb-4">
              {error || 'No tienes los permisos necesarios para editar este prompt.'}
            </p>
            <Button onClick={() => router.push('/ai-prompts')}>
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
          Volver al detalle
        </Button>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleBack}>
            Cancelar
          </Button>
          <Button 
            onClick={form.handleSubmit(onSubmit)} 
            disabled={saving}
          >
            <Save className="w-4 h-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </Button>
        </div>
      </div>

      {/* Información del Prompt */}
      <Card className="bg-blue-50 border-blue-200">
        <CardContent className="pt-6">
          <div className="flex items-center space-x-3">
            <AgentIcon className="w-8 h-8 text-blue-600" />
            <div>
              <h3 className="font-medium text-blue-900">
                {agentMetadata?.label || prompt.agent_name} - {prompt.operation}
              </h3>
              <div className="flex items-center gap-2 text-sm text-blue-700">
                <span>{prompt.prompt_key} · Versión {prompt.version}</span>
                <Badge variant={scope === 'global' ? 'default' : 'secondary'}>
                  {scope === 'global' ? 'Global' : 'Tenant'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Contenido del Prompt</CardTitle>
              <CardDescription>
                Edita el contenido de los prompts del sistema y usuario
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* System Prompt */}
              <FormField
                control={form.control}
                name="system_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>System Prompt</FormLabel>
                    <FormDescription>
                      Instrucciones del sistema que definen el comportamiento del agente
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px] font-mono text-sm"
                        placeholder="You are an expert..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* User Prompt */}
              <FormField
                control={form.control}
                name="user_prompt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User Prompt</FormLabel>
                    <FormDescription>
                      Template del prompt que se envía con los datos del usuario
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="min-h-[120px] font-mono text-sm"
                        placeholder="Analyze the following data: {{variable}}..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Variables */}
              <div className="space-y-4">
                <div>
                  <FormLabel>Variables del Prompt</FormLabel>
                  <FormDescription>
                    Variables que se pueden usar en los prompts con formato {"{{variable}}"}
                  </FormDescription>
                </div>
                
                {/* Variables existentes */}
                <div className="flex flex-wrap gap-2">
                  {variables.map((variable, index) => (
                    <Badge key={index} variant="outline" className="flex items-center gap-1">
                      {variable}
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 hover:bg-red-100"
                        onClick={() => handleRemoveVariable(index)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </Badge>
                  ))}
                </div>
                
                {/* Agregar nueva variable */}
                <div className="flex gap-2">
                  <Input
                    value={newVariable}
                    onChange={(e) => setNewVariable(e.target.value)}
                    placeholder="Nombre de la variable"
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddVariable())}
                  />
                  <Button type="button" variant="outline" onClick={handleAddVariable}>
                    <Plus className="w-4 h-4 mr-1" />
                    Agregar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Los prompts siempre están activos por defecto */}
        </form>
      </Form>
    </div>
  );
}
