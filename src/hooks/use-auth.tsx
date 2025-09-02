"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { iamClient } from '@/lib/api/iam-client';
import React from 'react';
import { jwtDecode } from "jwt-decode";

interface TokenData {
  tenant_id: string;
  user_id: string;
  role_id: string;
  email: string;
  role?: string;
}

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; email: string; role: string } | null>(null);

  const getTokenData = () => {
    if (typeof window === 'undefined') return null;
    const token = localStorage.getItem('iam_access_token');
    if (!token) return null;
    try {
      return jwtDecode<TokenData>(token);
    } catch {
      return null;
    }
  };

  // Verificar autenticación solo una vez al montar
  useEffect(() => {
    const checkAuth = async () => {
      if (typeof window === 'undefined') return;

      const accessToken = localStorage.getItem('iam_access_token');
      const refreshToken = localStorage.getItem('iam_refresh_token');
      
      if (!accessToken || !refreshToken) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      // Validar el token sin hacer refresh
      try {
        // Decodificar el JWT para ver si ha expirado
        const [, payload] = accessToken.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        const expirationTime = decodedPayload.exp * 1000; // Convertir a milisegundos
        
        if (expirationTime > Date.now()) {
          // Token aún válido
          setIsAuthenticated(true);
          setToken(accessToken);
          const tokenData = getTokenData();
          if (tokenData) {
            setTenantId(tokenData.tenant_id);
            // Guardar tenant_id en localStorage para que lo usen las APIs
            localStorage.setItem('current_tenant_id', tokenData.tenant_id);
            // Set user info
            setUser({
              id: tokenData.user_id,
              email: tokenData.email,
              role: tokenData.role || 'marketplace_admin' // Default role for marketplace admin
            });
          }
          setIsLoading(false);
          return;
        }

        // Token expirado, redirigir a login (refresh deshabilitado temporalmente)
        console.warn('Token expirado, redirigiendo a login');
        setIsAuthenticated(false);
        router.replace('/auth/login');
      } catch {
        setIsAuthenticated(false);
        router.replace('/auth/login');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await iamClient.login({
        email,
        password,
        provider: 'LOCAL'
      });
      
      // Esperar un poco para asegurar que los tokens se guarden
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const accessToken = localStorage.getItem('iam_access_token');
      setToken(accessToken);
      
      const tokenData = getTokenData();
      if (tokenData) {
        setTenantId(tokenData.tenant_id);
        // Guardar tenant_id en localStorage para que lo usen las APIs
        localStorage.setItem('current_tenant_id', tokenData.tenant_id);
        // Set user info
        setUser({
          id: tokenData.user_id,
          email: tokenData.email,
          role: tokenData.role || 'marketplace_admin'
        });
      }
      
      setIsAuthenticated(true);
      setIsLoading(false);
      
      // Usar window.location para forzar la navegación
      window.location.href = '/';
      
      return response;
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      // Intentar hacer logout en el servidor
      await iamClient.logout();
    } catch (error) {
      // Si falla el logout (ej: token expirado), solo logueamos el error
      // pero continuamos con la limpieza local
      console.warn('Error al hacer logout en el servidor:', error);
    } finally {
      // Siempre limpiar el estado local independientemente del resultado del servidor
      setIsAuthenticated(false);
      setTenantId(null);
      setToken(null);
      setUser(null);
      localStorage.removeItem('iam_access_token');
      localStorage.removeItem('iam_refresh_token');
      localStorage.removeItem('current_tenant_id');
      router.push('/auth/login');
    }
  };

  const getToken = async () => {
    const token = localStorage.getItem('iam_access_token');
    if (!token) throw new Error('No token found');
    return token;
  };

  return {
    isAuthenticated,
    isLoading,
    login,
    logout,
    getToken,
    tenantId,
    token,
    user
  };
}

// HOC para proteger rutas
export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      const checkAndRedirect = async () => {
        if (!isLoading) {
          if (!isAuthenticated) {
            console.log('No autenticado, redirigiendo a login...');
            router.replace('/auth/login');
          } else {
            console.log('Autenticado, mostrando componente...');
          }
        }
      };
      
      checkAndRedirect();
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return <div>Cargando...</div>;
    }

    if (!isAuthenticated) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };
  
  return WithAuthComponent;
} 