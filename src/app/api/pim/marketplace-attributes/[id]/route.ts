import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Usar el endpoint individual del backend
    const response = await fetch(`${API_GATEWAY_URL}/pim/api/v1/marketplace/attributes/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-Tenant-ID': 'marketplace-admin',
        'X-User-Role': 'marketplace_admin',
        'X-Role': 'admin',
        'Authorization': 'Bearer admin-test-token'
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching attribute:', error);
      return NextResponse.json(
        { error: `Error fetching attribute: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in attribute API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    console.log('🔄 Actualizando atributo ID:', id, 'con datos:', body);
    
    // Llamar al endpoint real del backend de Go
    const response = await fetch(`${API_GATEWAY_URL}/pim/api/v1/marketplace/attributes/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': 'marketplace-admin',
        'Authorization': 'Bearer admin-test-token'
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error actualizando atributo:', error);
      return NextResponse.json(
        { error: `Error updating attribute: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const updatedAttribute = await response.json();
    console.log('✅ Atributo actualizado:', updatedAttribute);
    
    return NextResponse.json(updatedAttribute);
  } catch (error) {
    console.error('❌ Error in attribute update API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Llamar al endpoint real del backend de Go
    const response = await fetch(`${API_GATEWAY_URL}/pim/api/v1/marketplace/attributes/${id}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': 'marketplace-admin',
        'Authorization': 'Bearer admin-test-token'
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error eliminando atributo:', error);
      return NextResponse.json(
        { error: `Error deleting attribute: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }
    
    console.log('✅ Atributo eliminado:', id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Attribute ${id} deleted successfully`,
      deleted_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in attribute delete API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}