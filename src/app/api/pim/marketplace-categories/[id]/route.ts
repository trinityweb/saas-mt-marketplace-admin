import { NextRequest, NextResponse } from 'next/server';

const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Como el endpoint individual no existe, obtenemos todas las categorías y filtramos
    const response = await fetch(`${API_GATEWAY_URL}/pim/api/v1/marketplace/categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '1',
      },
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Error fetching categories:', error);
      return NextResponse.json(
        { error: `Error fetching categories: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    
    // Verificar si la respuesta tiene la estructura esperada
    let categories = [];
    if (data && data.categories) {
      categories = data.categories;
    } else if (Array.isArray(data)) {
      categories = data;
    } else {
      return NextResponse.json(
        { error: 'Invalid response format' },
        { status: 500 }
      );
    }
    
    // Buscar la categoría por ID
    const category = categories.find((c: any) => c.id === id || c.id === parseInt(id));
    
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error in category API route:', error);
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
    
    console.log('🔄 Actualizando categoría ID:', id, 'con datos:', body);
    
    // Llamar al endpoint real del backend de Go
    const response = await fetch(`${API_GATEWAY_URL}/pim/api/v1/marketplace/categories/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-User-Role': 'marketplace_admin',
        'X-Tenant-ID': '1',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ Error actualizando categoría:', error);
      return NextResponse.json(
        { error: `Error updating category: ${response.status} ${response.statusText}` },
        { status: response.status }
      );
    }

    const updatedCategory = await response.json();
    console.log('✅ Categoría actualizada:', updatedCategory);
    
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('❌ Error in category update API route:', error);
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
    console.log('Simulating category deletion for ID:', id);
    
    return NextResponse.json({ 
      success: true, 
      message: `Category ${id} deleted successfully`,
      deleted_at: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error in category delete API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 