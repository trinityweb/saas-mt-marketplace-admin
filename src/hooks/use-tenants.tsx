"use client";

import { useState, useEffect } from 'react';
import { iamClient } from '@/lib/api/iam-client';
import { IamTenant, IamTenantCreate, TenantAdapter, TenantsResponse } from '@/lib/types/iam-api';
import { API_CONFIG } from '@/lib/config/api';

interface TenantsCriteria {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  name?: string;
  status?: string;
  type?: string;
}

export function useTenants() {
  const [tenants, setTenants] = useState<TenantAdapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginación del lado del servidor
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [criteria, setCriteria] = useState<TenantsCriteria>({
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_dir: 'desc'
  });

  const fetchTenants = async (searchCriteria?: TenantsCriteria) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching tenants with criteria:', searchCriteria || criteria);
      
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
      
      const response = await fetch(`${API_CONFIG.iamBaseUrl}/tenants?${queryParams.toString()}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
      
      const tenantsResponse = await response.json();
      console.log('Tenants response:', tenantsResponse);
      
      // Manejar tanto la estructura {tenants: [...]} como {items: [...]}
      const tenantsArray = tenantsResponse.tenants || tenantsResponse.items || [];
      
      // Convertir a TenantAdapter
      const tenantAdapters = tenantsArray.map((tenant: IamTenant) => TenantAdapter.fromResponse(tenant));
      
      setTenants(tenantAdapters);
      setTotalCount(tenantsResponse.total_count || 0);
      setCurrentPage(tenantsResponse.page || 1);
      setPageSize(tenantsResponse.page_size || 10);
      
    } catch (error) {
      console.error('Error al obtener tenants:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener los tenants');
      setTenants([]);
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

  const handleCreate = async (tenant: IamTenantCreate) => {
    try {
      console.log('Creating tenant:', tenant);
      await iamClient.createTenant(tenant);
      await fetchTenants(); // Recargar con los criterios actuales
    } catch (error) {
      console.error('Error al crear tenant:', error);
      setError('Error al crear el tenant');
      throw error;
    }
  };

  const handleUpdate = async (id: string, tenant: Partial<IamTenant>) => {
    try {
      console.log('Updating tenant:', id, tenant);
      await iamClient.updateTenant(id, tenant);
      await fetchTenants(); // Recargar con los criterios actuales
    } catch (error) {
      console.error('Error al actualizar tenant:', error);
      setError('Error al actualizar el tenant');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting tenant:', id);
      if (confirm('¿Estás seguro de que deseas eliminar este tenant?')) {
        await iamClient.deleteTenant(id);
        await fetchTenants(); // Recargar con los criterios actuales
      }
    } catch (error) {
      console.error('Error al eliminar tenant:', error);
      setError('Error al eliminar el tenant');
      throw error;
    }
  };

  const handlePageChange = (page: number) => {
    const newCriteria = { ...criteria, page };
    setCriteria(newCriteria);
    fetchTenants(newCriteria);
  };

  const handlePageSizeChange = (page_size: number) => {
    const newCriteria = { ...criteria, page_size, page: 1 }; // Reset a página 1
    setCriteria(newCriteria);
    fetchTenants(newCriteria);
  };

  const handleSortChange = (sort_by: string, sort_dir: 'asc' | 'desc') => {
    const newCriteria = { ...criteria, sort_by, sort_dir };
    setCriteria(newCriteria);
    fetchTenants(newCriteria);
  };

  const handleFiltersChange = (filters: Partial<TenantsCriteria>) => {
    const newCriteria = { ...criteria, ...filters, page: 1 }; // Reset a página 1
    setCriteria(newCriteria);
    fetchTenants(newCriteria);
  };

  useEffect(() => {
    fetchTenants();
  }, []); // Solo cargar una vez al montar

  return {
    tenants,
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
    refetch: () => fetchTenants()
  };
} 