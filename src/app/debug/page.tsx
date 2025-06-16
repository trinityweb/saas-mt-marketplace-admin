'use client';

import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';

export default function DebugPage() {
  const { token, isAuthenticated, isLoading, tenantId } = useAuth();
  const [localStorageData, setLocalStorageData] = useState<{
    access_token: string | null;
    refresh_token: string | null;
    tenant_id: string | null;
  }>({
    access_token: null,
    refresh_token: null,
    tenant_id: null,
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLocalStorageData({
        access_token: localStorage.getItem('iam_access_token'),
        refresh_token: localStorage.getItem('iam_refresh_token'),
        tenant_id: localStorage.getItem('current_tenant_id'),
      });
    }
  }, []);

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug - Estado de Autenticación</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Hook useAuth:</h2>
          <p><strong>isAuthenticated:</strong> {isAuthenticated ? 'true' : 'false'}</p>
          <p><strong>isLoading:</strong> {isLoading ? 'true' : 'false'}</p>
          <p><strong>token:</strong> {token ? `${token.substring(0, 50)}...` : 'null'}</p>
          <p><strong>tenantId:</strong> {tenantId || 'null'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">localStorage:</h2>
          <p><strong>access_token:</strong> {localStorageData.access_token ? `${localStorageData.access_token.substring(0, 50)}...` : 'null'}</p>
          <p><strong>refresh_token:</strong> {localStorageData.refresh_token ? `${localStorageData.refresh_token.substring(0, 30)}...` : 'null'}</p>
          <p><strong>tenant_id:</strong> {localStorageData.tenant_id || 'null'}</p>
        </div>

        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-semibold mb-2">Acciones:</h2>
          <button 
            onClick={() => window.location.href = '/auth/login'}
            className="bg-blue-500 text-white px-4 py-2 rounded mr-2"
          >
            Ir a Login
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="bg-red-500 text-white px-4 py-2 rounded"
          >
            Limpiar localStorage
          </button>
        </div>
      </div>
    </div>
  );
} 