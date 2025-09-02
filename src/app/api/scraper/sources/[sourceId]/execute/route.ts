import { NextRequest, NextResponse } from 'next/server';

const SCRAPER_SERVICE_URL = process.env.SCRAPER_SERVICE_URL || 'http://localhost:8086';

export async function POST(
  request: NextRequest,
  { params }: { params: { sourceId: string } }
) {
  try {
    const { sourceId } = params;
    
    // Hacer la llamada al servicio de scraping
    const response = await fetch(
      `${SCRAPER_SERVICE_URL}/api/v1/scraping/sources/${sourceId}/execute`,
      {
        method: 'POST',
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
          error: data.detail || 'Error al ejecutar scraping' 
        },
        { status: response.status }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error executing scraping:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al conectar con el servicio de scraping' 
      },
      { status: 500 }
    );
  }
}