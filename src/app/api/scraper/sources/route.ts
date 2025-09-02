import { NextRequest, NextResponse } from 'next/server';

// SIEMPRE usar Kong Gateway como punto de entrada único
const API_GATEWAY_URL = process.env.API_GATEWAY_URL || 'http://localhost:8001';

export async function GET(request: NextRequest) {
  try {
    // Hacer la llamada al servicio de scraping a través de Kong
    const response = await fetch(
      `${API_GATEWAY_URL}/scraper/api/v1/scraping/sources`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.detail || 'Error al obtener fuentes' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sources:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al conectar con el servicio de scraping',
        sources: []
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Hacer la llamada al servicio de scraping a través de Kong
    const response = await fetch(
      `${API_GATEWAY_URL}/scraper/api/v1/scraping/sources`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      }
    );

    const data = await response.json();
    
    if (!response.ok) {
      return NextResponse.json(
        { 
          success: false, 
          error: data.detail || 'Error al crear fuente' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error creating source:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al conectar con el servicio de scraping' 
      },
      { status: 500 }
    );
  }
}