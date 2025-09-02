import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';

// GET /api/ai/prompts - Listar prompts
export async function GET(request: NextRequest) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    
    // En desarrollo, usar token por defecto si no hay autenticación
    const headers = ('error' in authResult) 
      ? {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-marketplace-admin',
          'X-API-Key': process.env.MARKETPLACE_ADMIN_API_KEY || 'marketplace-admin-key-2025',
          'X-User-Role': 'marketplace_admin'
        }
      : authResult.headers;

    // Obtener parámetros de query
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // Proxy a Kong Gateway - Usar la ruta correcta que Kong espera
    // Kong tiene configurado /ai/ con strip_path: true, entonces /ai/ai/prompts llegará como /ai/prompts al AI Gateway
    // El AI Gateway requiere trailing slash
    const url = `${KONG_GATEWAY_URL}/ai/ai/prompts/${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching prompts:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch prompts', detail: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in prompts GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/ai/prompts - Crear nuevo prompt
export async function POST(request: NextRequest) {
  try {
    // Obtener headers de autenticación
    const authResult = getAuthHeaders(request);
    
    // En desarrollo, usar token por defecto si no hay autenticación
    const headers = ('error' in authResult) 
      ? {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer dev-marketplace-admin',
          'X-API-Key': process.env.MARKETPLACE_ADMIN_API_KEY || 'marketplace-admin-key-2025',
          'X-User-Role': 'marketplace_admin'
        }
      : authResult.headers;

    const body = await request.json();
    
    // Determinar si es un prompt global basado en el agente
    const globalAgents = ['product_curator', 'template_generator', 'categorization'];
    const isGlobal = globalAgents.includes(body.agent_name);
    
    // Si es global, necesita permisos de marketplace_admin
    if (isGlobal && !('error' in authResult)) {
      const userRole = authResult.headers['X-User-Role'];
      if (userRole !== 'marketplace_admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions for global prompts' },
          { status: 403 }
        );
      }
    }
    
    // Proxy a Kong Gateway - usar la ruta correcta con trailing slash
    const response = await fetch(`${KONG_GATEWAY_URL}/ai/ai/prompts/`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error creating prompt:', errorText);
      return NextResponse.json(
        { error: 'Failed to create prompt', detail: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in prompts POST route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}