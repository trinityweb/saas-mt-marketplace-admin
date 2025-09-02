'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { toast } from 'sonner';
import type {
  AIPrompt,
  PromptFilters,
  PromptListResponse,
  CreatePromptRequest,
  UpdatePromptRequest,
  TestPromptRequest,
  TestPromptResponse,
  PromptScope,
  AgentType
} from '@/types/ai-prompts';
import { GLOBAL_AGENTS, getAgentScope } from '@/types/ai-prompts';

export interface UseAIPromptsReturn {
  // State
  prompts: AIPrompt[];
  globalPrompts: AIPrompt[];
  tenantPrompts: AIPrompt[];
  loading: boolean;
  error: string | null;
  selectedPrompt: AIPrompt | null;
  
  // Permissions
  canManageGlobal: boolean;
  
  // Pagination
  total: number;
  limit: number;
  offset: number;
  
  // Actions
  loadPrompts: (filters?: PromptFilters) => Promise<void>;
  getPrompt: (promptId: string) => Promise<AIPrompt | null>;
  createPrompt: (data: CreatePromptRequest) => Promise<AIPrompt | null>;
  updatePrompt: (promptId: string, data: UpdatePromptRequest) => Promise<AIPrompt | null>;
  deletePrompt: (promptId: string) => Promise<boolean>;
  testPrompt: (promptId: string, variables: Record<string, any>) => Promise<TestPromptResponse | null>;
  
  // State management
  setSelectedPrompt: (prompt: AIPrompt | null) => void;
  refreshPrompts: () => Promise<void>;
  
  // Utilities
  extractVariables: (content: string) => string[];
  validatePromptContent: (content: string) => { isValid: boolean; errors: string[] };
}

export function useAIPrompts(initialFilters?: PromptFilters): UseAIPromptsReturn {
  const { user, token } = useAuth();
  const [prompts, setPrompts] = useState<AIPrompt[]>([]);
  const [globalPrompts, setGlobalPrompts] = useState<AIPrompt[]>([]);
  const [tenantPrompts, setTenantPrompts] = useState<AIPrompt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPrompt, setSelectedPrompt] = useState<AIPrompt | null>(null);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(initialFilters?.limit || 20);
  const [offset, setOffset] = useState(initialFilters?.offset || 0);
  
  // Check if user can manage global prompts
  const canManageGlobal = user?.role === 'marketplace_admin';
  
  // Load prompts with optional filters
  const loadPrompts = useCallback(async (filters?: PromptFilters) => {
    setLoading(true);
    setError(null);
    
    try {
      // Build query string
      const params = new URLSearchParams();
      if (filters?.agent_name) params.append('agent_name', filters.agent_name);
      if (filters?.is_active !== undefined) params.append('is_active', String(filters.is_active));
      if (filters?.scope) params.append('scope', filters.scope);
      if (filters?.search) params.append('search', filters.search);
      params.append('limit', String(filters?.limit || limit));
      params.append('offset', String(filters?.offset || offset));
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const response = await fetch(`/api/ai/prompts?${params.toString()}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error('Failed to load prompts');
      }
      
      const data: PromptListResponse = await response.json();
      
      // Categorize prompts by scope
      const global: AIPrompt[] = [];
      const tenant: AIPrompt[] = [];
      
      data.prompts.forEach(prompt => {
        const scope = getAgentScope(prompt.agent_name);
        if (scope === 'global') {
          global.push(prompt);
        } else {
          tenant.push(prompt);
        }
      });
      
      setPrompts(data.prompts);
      setGlobalPrompts(global);
      setTenantPrompts(tenant);
      setTotal(data.total);
      setLimit(data.limit);
      setOffset(data.offset);
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error loading prompts';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setLoading(false);
    }
  }, [token, limit, offset]);
  
  // Get specific prompt by ID
  const getPrompt = useCallback(async (promptId: string): Promise<AIPrompt | null> => {
    try {
      const response = await fetch(`/api/ai/prompts/${promptId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to get prompt');
      }
      
      const prompt: AIPrompt = await response.json();
      return prompt;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error getting prompt';
      toast.error(errorMsg);
      return null;
    }
  }, [token]);
  
  // Create new prompt
  const createPrompt = useCallback(async (data: CreatePromptRequest): Promise<AIPrompt | null> => {
    try {
      // Check permissions for global prompts
      if (GLOBAL_AGENTS.includes(data.agent_name) && !canManageGlobal) {
        toast.error('No tienes permisos para crear prompts globales');
        return null;
      }
      
      const response = await fetch('/api/ai/prompts', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to create prompt');
      }
      
      const prompt: AIPrompt = await response.json();
      toast.success('Prompt creado exitosamente');
      
      // Refresh the list
      await loadPrompts();
      
      return prompt;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error creating prompt';
      toast.error(errorMsg);
      return null;
    }
  }, [token, canManageGlobal, loadPrompts]);
  
  // Update existing prompt
  const updatePrompt = useCallback(async (promptId: string, data: UpdatePromptRequest): Promise<AIPrompt | null> => {
    try {
      const response = await fetch(`/api/ai/prompts/${promptId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update prompt');
      }
      
      const prompt: AIPrompt = await response.json();
      toast.success('Prompt actualizado exitosamente');
      
      // Refresh the list
      await loadPrompts();
      
      return prompt;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error updating prompt';
      toast.error(errorMsg);
      return null;
    }
  }, [token, loadPrompts]);
  
  // Delete prompt (soft delete)
  const deletePrompt = useCallback(async (promptId: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/ai/prompts/${promptId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete prompt');
      }
      
      toast.success('Prompt eliminado exitosamente');
      
      // Refresh the list
      await loadPrompts();
      
      return true;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error deleting prompt';
      toast.error(errorMsg);
      return false;
    }
  }, [token, loadPrompts]);
  
  // Test prompt with variables
  const testPrompt = useCallback(async (promptId: string, variables: Record<string, any>): Promise<TestPromptResponse | null> => {
    try {
      const params = new URLSearchParams();
      params.append('test_variables', JSON.stringify(variables));
      
      const response = await fetch(`/api/ai/prompts/${promptId}?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to test prompt');
      }
      
      const result: TestPromptResponse = await response.json();
      return result;
      
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Error testing prompt';
      toast.error(errorMsg);
      return null;
    }
  }, [token]);
  
  // Refresh prompts
  const refreshPrompts = useCallback(async () => {
    await loadPrompts();
  }, [loadPrompts]);
  
  // Extract variables from prompt content
  const extractVariables = useCallback((content: string): string[] => {
    const regex = /\{([^}]+)\}/g;
    const variables = new Set<string>();
    let match;
    
    while ((match = regex.exec(content)) !== null) {
      variables.add(match[1]);
    }
    
    return Array.from(variables);
  }, []);
  
  // Validate prompt content
  const validatePromptContent = useCallback((content: string): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check for basic structure
    if (!content || content.trim().length === 0) {
      errors.push('El contenido del prompt no puede estar vacío');
    }
    
    // Check for unmatched braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      errors.push('Las llaves {} no están balanceadas');
    }
    
    // Check for empty variables
    if (content.includes('{}')) {
      errors.push('Hay variables vacías en el prompt');
    }
    
    // Check minimum length
    if (content.trim().length < 10) {
      errors.push('El prompt es demasiado corto (mínimo 10 caracteres)');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }, []);
  
  // Initial load
  useEffect(() => {
    if (token) {
      loadPrompts(initialFilters);
    }
  }, [token, initialFilters]); // eslint-disable-line react-hooks/exhaustive-deps
  
  return {
    // State
    prompts,
    globalPrompts,
    tenantPrompts,
    loading,
    error,
    selectedPrompt,
    
    // Permissions
    canManageGlobal,
    
    // Pagination
    total,
    limit,
    offset,
    
    // Actions
    loadPrompts,
    getPrompt,
    createPrompt,
    updatePrompt,
    deletePrompt,
    testPrompt,
    
    // State management
    setSelectedPrompt,
    refreshPrompts,
    
    // Utilities
    extractVariables,
    validatePromptContent
  };
}