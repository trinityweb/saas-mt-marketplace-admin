// Types for AI Prompt Management System

export type AgentType = 
  | 'product_curator'
  | 'template_generator'
  | 'categorization'
  | 'onboarding'
  | 'business_intelligence'
  | 'document'
  | 'voice';

export type PromptScope = 'global' | 'tenant';

export interface PromptVariable {
  name: string;
  type?: 'string' | 'number' | 'boolean' | 'array' | 'object';
  description?: string;
  required?: boolean;
  default_value?: any;
  validation_rules?: ValidationRule[];
}

export interface ValidationRule {
  type: 'min_length' | 'max_length' | 'pattern' | 'enum' | 'range';
  value: any;
  message?: string;
}

export interface AIPrompt {
  id: string;
  agent_name: AgentType;
  operation: string;
  prompt_key: string;
  system_prompt: string;
  user_prompt: string;
  variables: string[] | PromptVariable[];
  version: string;
  is_active: boolean;
  tenant_scope?: PromptScope;
  tenant_id?: string;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  formatted_example?: string;
}

export interface CreatePromptRequest {
  agent_name: AgentType;
  operation: string;
  system_prompt: string;
  user_prompt: string;
  variables: string[] | PromptVariable[];
  version?: string;
  is_active?: boolean;
  metadata?: Record<string, any>;
}

export interface UpdatePromptRequest {
  system_prompt?: string;
  user_prompt?: string;
  variables?: string[] | PromptVariable[];
  is_active?: boolean;
  metadata?: Record<string, any>;
  bump_version?: boolean;
}

export interface PromptListResponse {
  prompts: AIPrompt[];
  total: number;
  limit: number;
  offset: number;
}

export interface PromptFilters {
  agent_name?: AgentType;
  is_active?: boolean;
  scope?: PromptScope;
  search?: string;
  limit?: number;
  offset?: number;
}

export interface TestPromptRequest {
  prompt_id: string;
  variables: Record<string, any>;
}

export interface TestPromptResponse {
  formatted_system_prompt: string;
  formatted_user_prompt: string;
  variables_used: string[];
  validation_errors?: string[];
}

// Agent categorization by scope
export const GLOBAL_AGENTS: AgentType[] = [
  'product_curator',
  'template_generator',
  'categorization'
];

export const TENANT_AGENTS: AgentType[] = [
  'onboarding',
  'business_intelligence',
  'document',
  'voice'
];

// Agent metadata for UI
export const AGENT_METADATA: Record<AgentType, {
  label: string;
  description: string;
  scope: PromptScope;
  icon?: string;
  color?: string;
}> = {
  product_curator: {
    label: 'Curador de Productos',
    description: 'Curación y enriquecimiento de productos del marketplace',
    scope: 'global',
    icon: 'Package',
    color: 'purple'
  },
  template_generator: {
    label: 'Generador de Templates',
    description: 'Generación de templates basados en tendencias del mercado',
    scope: 'global',
    icon: 'FileText',
    color: 'blue'
  },
  categorization: {
    label: 'Categorizador',
    description: 'Categorización automática de productos',
    scope: 'global',
    icon: 'Layers',
    color: 'green'
  },
  onboarding: {
    label: 'Onboarding',
    description: 'Asistente de onboarding personalizado',
    scope: 'tenant',
    icon: 'UserPlus',
    color: 'orange'
  },
  business_intelligence: {
    label: 'Business Intelligence',
    description: 'Análisis y consultas de datos del negocio',
    scope: 'tenant',
    icon: 'BarChart3',
    color: 'indigo'
  },
  document: {
    label: 'Chat con Documentos',
    description: 'Análisis y chat con documentos del tenant',
    scope: 'tenant',
    icon: 'FileSearch',
    color: 'teal'
  },
  voice: {
    label: 'Voz a Venta',
    description: 'Procesamiento de comandos de voz para ventas',
    scope: 'tenant',
    icon: 'Mic',
    color: 'red'
  }
};

// Helper functions
export function getAgentScope(agentType: AgentType): PromptScope {
  return GLOBAL_AGENTS.includes(agentType) ? 'global' : 'tenant';
}

export function isGlobalAgent(agentType: AgentType): boolean {
  return GLOBAL_AGENTS.includes(agentType);
}

export function getAgentsByScope(scope: PromptScope): AgentType[] {
  return scope === 'global' ? GLOBAL_AGENTS : TENANT_AGENTS;
}

export function getAgentMetadata(agentType: AgentType) {
  return AGENT_METADATA[agentType];
}