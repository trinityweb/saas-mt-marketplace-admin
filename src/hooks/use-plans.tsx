"use client";

import { useState, useEffect } from 'react';
import { iamClient } from '@/lib/api/iam-client';
import { IamPlan, IamPlanCreate, IamPlanUpdate, PlanAdapter, PlansResponse } from '@/lib/types/iam-api';
import { API_CONFIG } from '@/lib/config/api';

interface PlansCriteria {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  name?: string;
  status?: string;
}

export function usePlans() {
  const [plans, setPlans] = useState<PlanAdapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginación del lado del servidor
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [criteria, setCriteria] = useState<PlansCriteria>({
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_dir: 'desc'
  });

  const fetchPlans = async (searchCriteria?: PlansCriteria) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching plans with criteria:', searchCriteria || criteria);
      
      // Usar criterios proporcionados o los del estado
      const finalCriteria = { ...criteria, ...searchCriteria };
      
      // Construir query params
      const queryParams = new URLSearchParams();
      Object.entries(finalCriteria).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          queryParams.append(key, value.toString());
        }
      });
      
      // Hacer la solicitud directamente con fetch para manejar la respuesta del patrón Criteria
      const { accessToken, tenantId } = getStoredTokens();
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      if (accessToken) {
        headers['Authorization'] = `Bearer ${accessToken}`;
      }
      
      if (tenantId) {
        headers['X-Tenant-ID'] = tenantId;
      }
      
      const response = await fetch(`${API_CONFIG.iamBaseUrl}/plans?${queryParams.toString()}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
      
      const plansResponse = await response.json();
      console.log('Plans response:', plansResponse);
      
      // Manejar tanto la estructura {plans: [...]} como {items: [...]}
      const plansArray = plansResponse.plans || plansResponse.items || [];
      
      // Convertir a PlanAdapter
      const planAdapters = plansArray.map((plan: IamPlan) => PlanAdapter.fromResponse(plan));
      
      setPlans(planAdapters);
      setTotalCount(plansResponse.total_count || 0);
      setCurrentPage(plansResponse.page || 1);
      setPageSize(plansResponse.page_size || 10);
      
    } catch (error) {
      console.error('Error al obtener plans:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener los planes');
      setPlans([]);
      setTotalCount(0);
    } finally {
      setLoading(false);
    }
  };

  // Función auxiliar para obtener tokens (copiada del cliente IAM)
  const getStoredTokens = () => {
    if (typeof window !== 'undefined') {
      return {
        accessToken: localStorage.getItem('iam_access_token'),
        tenantId: localStorage.getItem('current_tenant_id')
      };
    }
    return { accessToken: null, tenantId: null };
  };

  const handleCreate = async (plan: IamPlanCreate) => {
    try {
      console.log('Creating plan:', plan);
      await iamClient.createPlan(plan);
      await fetchPlans(); // Recargar con los criterios actuales
    } catch (error) {
      console.error('Error al crear plan:', error);
      setError('Error al crear el plan');
      throw error;
    }
  };

  const handleUpdate = async (id: string, plan: IamPlanUpdate) => {
    try {
      console.log('Updating plan:', id, plan);
      await iamClient.updatePlan(id, plan);
      await fetchPlans(); // Recargar con los criterios actuales
    } catch (error) {
      console.error('Error al actualizar plan:', error);
      setError('Error al actualizar el plan');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting plan:', id);
      if (confirm('¿Estás seguro de que deseas eliminar este plan?')) {
        await iamClient.deletePlan(id);
        await fetchPlans(); // Recargar con los criterios actuales
      }
    } catch (error) {
      console.error('Error al eliminar plan:', error);
      setError('Error al eliminar el plan');
      throw error;
    }
  };

  const handlePageChange = (page: number) => {
    const newCriteria = { ...criteria, page };
    setCriteria(newCriteria);
    fetchPlans(newCriteria);
  };

  const handlePageSizeChange = (page_size: number) => {
    const newCriteria = { ...criteria, page_size, page: 1 }; // Reset a página 1
    setCriteria(newCriteria);
    fetchPlans(newCriteria);
  };

  const handleSortChange = (sort_by: string, sort_dir: 'asc' | 'desc') => {
    const newCriteria = { ...criteria, sort_by, sort_dir };
    setCriteria(newCriteria);
    fetchPlans(newCriteria);
  };

  const handleFiltersChange = (filters: Partial<PlansCriteria>) => {
    const newCriteria = { ...criteria, ...filters, page: 1 }; // Reset a página 1
    setCriteria(newCriteria);
    fetchPlans(newCriteria);
  };

  useEffect(() => {
    fetchPlans();
  }, []); // Solo cargar una vez al montar

  return {
    plans,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    criteria,
    handlePageChange,
    handlePageSizeChange,
    handleSortChange,
    handleFiltersChange,
    handleCreate,
    handleUpdate,
    handleDelete,
    refetch: () => fetchPlans()
  };
} 