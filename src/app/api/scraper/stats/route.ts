import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// MongoDB connection for scraper data
async function getScraperStats() {
  try {
    // For now, we'll use the scraper service API
    const response = await fetch('http://localhost:8888/api/stats', {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch scraper stats');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching scraper stats:', error);
    // Return mock data if scraper service is not running
    return {
      total_products: 85,
      products_by_target: {
        materiales_moreno: 30,
        carrefour: 15,
        jumbo: 8,
        garbarino: 8,
        fravega: 8,
        disco: 8,
        coto: 8,
      },
      last_update: new Date().toISOString(),
      scraping_targets: 7,
      active_targets: 7,
    };
  }
}

export async function GET() {
  try {
    const stats = await getScraperStats();
    
    // Transform to match frontend expectations
    const metrics = {
      total_products: stats.total_products || 0,
      new_today: 0, // TODO: Calculate based on timestamps
      duplicates_detected: 0, // TODO: Implement duplicate tracking
      success_rate: 1.0, // 100% for now
      last_run: stats.last_update || new Date().toISOString(),
      active_sources: stats.active_targets || 0,
      jobs_in_progress: 0, // TODO: Real-time job tracking
      by_source: Object.entries(stats.products_by_target || {}).reduce(
        (acc, [source, count]) => ({
          ...acc,
          [source]: {
            products: count as number,
            last_run: stats.last_update || new Date().toISOString(),
            success_rate: 1.0,
          },
        }),
        {}
      ),
    };
    
    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error in scraper stats API:', error);
    return NextResponse.json(
      { error: 'Failed to fetch scraper metrics' },
      { status: 500 }
    );
  }
}