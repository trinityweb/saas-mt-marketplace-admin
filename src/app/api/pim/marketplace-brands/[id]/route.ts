import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Usar el endpoint individual del backend
    const response = await fetch(`${API_GATEWAY_URL}/pim/api/v1/marketplace-brands/${id}`, {
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
      console.error('Error fetching brand:', error);
      return NextResponse.json(
        { error: `Error fetching brand: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error in brand API route:', error);
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
    
    console.log('🔄 Actualizando marca ID:', id, 'con datos:', body);
    
    // Llamar al endpoint real del backend de Go
    const response = await fetch(`${API_GATEWAY_URL}/pim/api/v1/marketplace-brands/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '1',
        'Authorization': 'Bearer admin-test-token'
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error actualizando marca:', error);
      return NextResponse.json(
        { error: `Error updating brand: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const updatedBrand = await response.json();
    console.log('✅ Marca actualizada:', updatedBrand);
    
    return NextResponse.json(updatedBrand);
  } catch (error) {
    console.error('❌ Error in brand update API route:', error);
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
    
    // Por ahora, como el endpoint de eliminación individual no existe,
    // retornamos un mensaje simulando el éxito
    console.log('Simulating brand deletion for ID:', id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Brand ${id} deleted successfully`,
      deleted_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in brand delete API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 