"use client";

import { useState, useEffect } from 'react';
import { iamClient } from '@/lib/api/iam-client';
import { IamRole, IamRoleCreate, IamRoleUpdate, RoleAdapter, RolesResponse } from '@/lib/types/iam-api';
import { API_CONFIG } from '@/lib/config/api';

interface RolesCriteria {
  page?: number;
  page_size?: number;
  sort_by?: string;
  sort_dir?: 'asc' | 'desc';
  name?: string;
  status?: string;
}

export function useRoles() {
  const [roles, setRoles] = useState<RoleAdapter[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para paginación del lado del servidor
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [criteria, setCriteria] = useState<RolesCriteria>({
    page: 1,
    page_size: 10,
    sort_by: 'created_at',
    sort_dir: 'desc'
  });

  const fetchRoles = async (searchCriteria?: RolesCriteria) => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching roles with criteria:', searchCriteria || criteria);
      
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
      
      const response = await fetch(`${API_CONFIG.iamBaseUrl}/roles?${queryParams.toString()}`, {
        headers
      });
      
      if (!response.ok) {
        throw new Error(`Error del servidor: ${response.status} ${response.statusText}`);
      }
      
      const rolesResponse = await response.json();
      console.log('Roles response:', rolesResponse);
      
      // Manejar tanto la estructura {roles: [...]} como {items: [...]}
      const rolesArray = rolesResponse.roles || rolesResponse.items || [];
      
      // Convertir a RoleAdapter
      const roleAdapters = rolesArray.map((role: IamRole) => RoleAdapter.fromResponse(role));
      
      setRoles(roleAdapters);
      setTotalCount(rolesResponse.total_count || 0);
      setCurrentPage(rolesResponse.page || 1);
      setPageSize(rolesResponse.page_size || 10);
      
    } catch (error) {
      console.error('Error al obtener roles:', error);
      setError(error instanceof Error ? error.message : 'Error al obtener los roles');
      setRoles([]);
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

  const handleCreate = async (role: IamRoleCreate) => {
    try {
      console.log('Creating role:', role);
      await iamClient.createRole(role);
      await fetchRoles(); // Recargar con los criterios actuales
    } catch (error) {
      console.error('Error al crear role:', error);
      setError('Error al crear el rol');
      throw error;
    }
  };

  const handleUpdate = async (id: string, role: IamRoleUpdate) => {
    try {
      console.log('Updating role:', id, role);
      await iamClient.updateRole(id, role);
      await fetchRoles(); // Recargar con los criterios actuales
    } catch (error) {
      console.error('Error al actualizar role:', error);
      setError('Error al actualizar el rol');
      throw error;
    }
  };

  const handleDelete = async (id: string) => {
    try {
      console.log('Deleting role:', id);
      if (confirm('¿Estás seguro de que deseas eliminar este rol?')) {
        await iamClient.deleteRole(id);
        await fetchRoles(); // Recargar con los criterios actuales
      }
    } catch (error) {
      console.error('Error al eliminar role:', error);
      setError('Error al eliminar el rol');
      throw error;
    }
  };

  const handlePageChange = (page: number) => {
    const newCriteria = { ...criteria, page };
    setCriteria(newCriteria);
    fetchRoles(newCriteria);
  };

  const handlePageSizeChange = (page_size: number) => {
    const newCriteria = { ...criteria, page_size, page: 1 }; // Reset a página 1
    setCriteria(newCriteria);
    fetchRoles(newCriteria);
  };

  const handleSortChange = (sort_by: string, sort_dir: 'asc' | 'desc') => {
    const newCriteria = { ...criteria, sort_by, sort_dir };
    setCriteria(newCriteria);
    fetchRoles(newCriteria);
  };

  const handleFiltersChange = (filters: Partial<RolesCriteria>) => {
    const newCriteria = { ...criteria, ...filters, page: 1 }; // Reset a página 1
    setCriteria(newCriteria);
    fetchRoles(newCriteria);
  };

  useEffect(() => {
    fetchRoles();
  }, []); // Solo cargar una vez al montar

  return {
    roles,
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
    refetch: () => fetchRoles()
  };
} 