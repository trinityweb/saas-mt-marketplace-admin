import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ 
    message: 'API Test OK',
    timestamp: new Date().toISOString(),
    env_check: {
      API_GATEWAY_URL: process.env.API_GATEWAY_URL || 'NOT_SET'
    }
  });
} 