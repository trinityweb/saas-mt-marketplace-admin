import { useState, useEffect, useCallback } from 'react';
import { marketplaceApi, TenantCustomAttribute } from '@/lib/api';

interface UseMarketplaceAttributesOptions {
  adminToken?: string;
}

export function useMarketplaceAttributes({ adminToken }: UseMarketplaceAttributesOptions = {}) {
  const [attributes, setAttributes] = useState<TenantCustomAttribute[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAttributes = useCallback(async () => {
    if (!adminToken) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await marketplaceApi.getTenantCustomAttributes(
        {
          page: 1,
          page_size: 100, // Cargar todos para filtrado local
        },
        adminToken
      );

      if (response.error) {
        setError(response.error);
        // Datos de ejemplo para desarrollo
        setAttributes([
          {
            id: '1',
            marketplace_attribute_id: 'color',
            tenant_id: '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
            attribute_values: ['Rojo Fuego', 'Azul Cielo', 'Verde Bosque'],
            is_active: true,
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z',
          },
          {
            id: '2',
            marketplace_attribute_id: 'size',
            tenant_id: '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
            attribute_values: ['XS Local', 'S Local', 'M Local', 'L Local'],
            is_active: true,
            created_at: '2024-01-15T10:05:00Z',
            updated_at: '2024-01-15T10:05:00Z',
          },
          {
            id: '3',
            marketplace_attribute_id: 'material',
            tenant_id: '9a4c3eb9-2471-4688-bfc8-973e5b3e4ce8',
            attribute_values: ['Algodón Pima', 'Lino Premium'],
            is_active: false,
            created_at: '2024-01-15T10:10:00Z',
            updated_at: '2024-01-15T10:10:00Z',
          },
        ]);
      } else if (response.data) {
        setAttributes(response.data.data);
      }
    } catch (err) {
      setError('Error al cargar los atributos');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [adminToken]);

  const deleteAttribute = useCallback(async (attributeId: string): Promise<boolean> => {
    if (!adminToken) return false;

    try {
      const response = await marketplaceApi.deleteTenantCustomAttribute(attributeId, adminToken);
      if (!response.error) {
        await loadAttributes();
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error al eliminar atributo:', err);
      return false;
    }
  }, [adminToken, loadAttributes]);

  useEffect(() => {
    loadAttributes();
  }, [loadAttributes]);

  return {
    attributes,
    loading,
    error,
    deleteAttribute,
    refetch: loadAttributes,
  };
} 