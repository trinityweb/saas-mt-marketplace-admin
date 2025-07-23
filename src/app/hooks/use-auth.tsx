"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { iamClient } from '@/lib/api/iam-client';
import { Loading } from '@/components/ui/loading';
import React from 'react';
import { jwtDecode } from "jwt-decode";

interface TokenData {
  tenant_id: string;
  user_id: string;
  role_id: string;
  email: string;
}

export function useAuth() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [tenantId, setTenantId] = useState<string | null>(null);

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

      try {
        const [, payload] = accessToken.split('.');
        const decodedPayload = JSON.parse(atob(payload));
        const expirationTime = decodedPayload.exp * 1000;
        
        if (expirationTime > Date.now()) {
          setIsAuthenticated(true);
          const tokenData = getTokenData();
          if (tokenData) {
            setTenantId(tokenData.tenant_id);
            localStorage.setItem('current_tenant_id', tokenData.tenant_id);
          }
          setIsLoading(false);
          return;
        }

        try {
          const refreshToken = localStorage.getItem('iam_refresh_token');
          if (refreshToken) {
            const tokens = await iamClient.refreshToken({ refresh_token: refreshToken });
            if (tokens) {
              setIsAuthenticated(true);
              const tokenData = getTokenData();
              if (tokenData) {
                setTenantId(tokenData.tenant_id);
                localStorage.setItem('current_tenant_id', tokenData.tenant_id);
              }
            } else {
              setIsAuthenticated(false);
              // No redirigir automáticamente si hay problemas de conectividad
            }
          } else {
            setIsAuthenticated(false);
            // No redirigir automáticamente si no hay refresh token
          }
        } catch (error) {
          console.warn('Error al refrescar token:', error);
          setIsAuthenticated(false);
          // Limpiar tokens inválidos pero no redirigir automáticamente
          localStorage.removeItem('iam_access_token');
          localStorage.removeItem('iam_refresh_token');
          localStorage.removeItem('current_tenant_id');
        }
      } catch (error) {
        console.warn('Error al verificar autenticación:', error);
        setIsAuthenticated(false);
        // Limpiar tokens inválidos
        localStorage.removeItem('iam_access_token');
        localStorage.removeItem('iam_refresh_token');
        localStorage.removeItem('current_tenant_id');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [router]);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      await iamClient.login({
        email,
        password
      });
      await new Promise(resolve => setTimeout(resolve, 100));
      const tokenData = getTokenData();
      if (tokenData) {
        setTenantId(tokenData.tenant_id);
        localStorage.setItem('current_tenant_id', tokenData.tenant_id);
      }
      setIsAuthenticated(true);
      setIsLoading(false);
      window.location.href = '/';
    } catch (error) {
      setIsLoading(false);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await iamClient.logout();
    } catch {
      // Ignorar error
    } finally {
      setIsAuthenticated(false);
      setTenantId(null);
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
    tenantId
  };
}

export function withAuth<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAuthComponent: React.FC<P> = (props) => {
    const { isAuthenticated, isLoading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      const checkAndRedirect = async () => {
        if (!isLoading && !isAuthenticated) {
          // Solo redirigir si no estamos ya en la página de login
          if (typeof window !== 'undefined' && !window.location.pathname.includes('/auth/login')) {
            router.replace('/auth/login');
          }
        }
      };
      checkAndRedirect();
    }, [isLoading, isAuthenticated, router]);

    if (isLoading) {
      return <Loading />;
    }
    if (!isAuthenticated) {
      return null;
    }
    return <WrappedComponent {...props} />;
  };
  return WithAuthComponent;
} 