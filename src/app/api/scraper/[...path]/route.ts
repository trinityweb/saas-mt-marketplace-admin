import { NextRequest, NextResponse } from 'next/server';

// Conectar directamente al scraper service en lugar de pasar por Kong
const SCRAPER_URL = process.env.SCRAPER_URL || 'http://localhost:8086';
const SCRAPER_PATH = '';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const targetUrl = `${SCRAPER_URL}${SCRAPER_PATH}/${path}${url.search}`;
    
    console.log('[Scraper Proxy] GET', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        ...(request.headers.get('x-tenant-id') && {
          'X-Tenant-ID': request.headers.get('x-tenant-id')!
        }),
      },
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('[Scraper Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const targetUrl = `${SCRAPER_URL}${SCRAPER_PATH}/${path}${url.search}`;
    
    console.log('[Scraper Proxy] POST', targetUrl);
    
    let body = null;
    const contentType = request.headers.get('content-type');
    
    if (contentType?.includes('application/json')) {
      try {
        body = await request.json();
      } catch {
        // No body or invalid JSON
      }
    }
    
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        ...(request.headers.get('x-tenant-id') && {
          'X-Tenant-ID': request.headers.get('x-tenant-id')!
        }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('[Scraper Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const targetUrl = `${SCRAPER_URL}${SCRAPER_PATH}/${path}${url.search}`;
    
    console.log('[Scraper Proxy] PATCH', targetUrl);
    
    let body = null;
    try {
      body = await request.json();
    } catch {
      // No body or invalid JSON
    }
    
    const response = await fetch(targetUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        ...(request.headers.get('x-tenant-id') && {
          'X-Tenant-ID': request.headers.get('x-tenant-id')!
        }),
      },
      ...(body && { body: JSON.stringify(body) }),
    });
    
    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('[Scraper Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathSegments } = await params;
    const path = pathSegments.join('/');
    const url = new URL(request.url);
    const targetUrl = `${SCRAPER_URL}${SCRAPER_PATH}/${path}${url.search}`;
    
    console.log('[Scraper Proxy] DELETE', targetUrl);
    
    const response = await fetch(targetUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        // Forward auth headers if present
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')!
        }),
        ...(request.headers.get('x-tenant-id') && {
          'X-Tenant-ID': request.headers.get('x-tenant-id')!
        }),
      },
    });
    
    if (response.status === 204) {
      return new NextResponse(null, { status: 204 });
    }
    
    const data = await response.json();
    
    return NextResponse.json(data, { 
      status: response.status,
      headers: {
        'Content-Type': 'application/json',
      }
    });
  } catch (error) {
    console.error('[Scraper Proxy] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}