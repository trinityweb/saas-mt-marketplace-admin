import { NextRequest, NextResponse } from 'next/server';
import { getAuthHeaders } from '@/lib/api/auth-helpers';

const KONG_GATEWAY_URL = process.env.KONG_GATEWAY_URL || 'http://localhost:8001';

// GET /api/ai/prompts/[promptId] - Obtener prompt específico
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
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

    const { promptId } = await params;
    
    // Obtener parámetros de query (para test_variables)
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    const url = `${KONG_GATEWAY_URL}/ai/ai/prompts/${promptId}${queryString ? `?${queryString}` : ''}`;
    
    const response = await fetch(url, {
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error fetching prompt:', errorText);
      return NextResponse.json(
        { error: 'Failed to fetch prompt', detail: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in prompt GET route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/ai/prompts/[promptId] - Actualizar prompt
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
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

    const { promptId } = await params;
    const body = await request.json();
    
    // Agregar updated_by con UUID válido para desarrollo
    if (!body.updated_by) {
      body.updated_by = '00000000-0000-0000-0000-000000000001'; // UUID de desarrollo
    }
    
    // Simplificar: siempre activo, nunca versionar
    body.is_active = true;
    body.bump_version = false;
    
    // Verificar permisos para prompts globales
    const globalAgents = ['product_curator', 'template_generator', 'categorization'];
    if (body.agent_name && globalAgents.includes(body.agent_name) && !('error' in authResult)) {
      const userRole = authResult.headers['X-User-Role'];
      if (userRole !== 'marketplace_admin') {
        return NextResponse.json(
          { error: 'Insufficient permissions for global prompts' },
          { status: 403 }
        );
      }
    }
    
    const response = await fetch(`${KONG_GATEWAY_URL}/ai/ai/prompts/${promptId}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(body)
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error updating prompt:', errorText);
      return NextResponse.json(
        { error: 'Failed to update prompt', detail: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in prompt PUT route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE /api/ai/prompts/[promptId] - Eliminar prompt (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ promptId: string }> }
) {
  try {
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

    const { promptId } = await params;
    
    // Primero obtener el prompt para verificar si es global
    const getResponse = await fetch(`${KONG_GATEWAY_URL}/ai/ai/prompts/${promptId}`, {
      headers
    });
    
    if (getResponse.ok) {
      const prompt = await getResponse.json();
      const globalAgents = ['product_curator', 'template_generator', 'categorization'];
      
      if (globalAgents.includes(prompt.agent_name) && !('error' in authResult)) {
        const userRole = authResult.headers['X-User-Role'];
        if (userRole !== 'marketplace_admin') {
          return NextResponse.json(
            { error: 'Insufficient permissions to delete global prompts' },
            { status: 403 }
          );
        }
      }
    }
    
    const response = await fetch(`${KONG_GATEWAY_URL}/ai/ai/prompts/${promptId}`, {
      method: 'DELETE',
      headers
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error deleting prompt:', errorText);
      return NextResponse.json(
        { error: 'Failed to delete prompt', detail: errorText },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Error in prompt DELETE route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}