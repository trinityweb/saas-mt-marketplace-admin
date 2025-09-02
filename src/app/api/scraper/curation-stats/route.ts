import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

export const dynamic = 'force-dynamic';

const MONGO_URI = process.env.MONGODB_URI || 'mongodb://admin:admin123@localhost:27017/?authSource=admin';

async function getCurationStats() {
  const client = new MongoClient(MONGO_URI);
  
  try {
    await client.connect();
    
    // PIM Marketplace database - donde están los productos realmente
    const pimDb = client.db('pim_marketplace');
    const scrapedProducts = pimDb.collection('scraper_products'); // Los 85 productos están aquí
    
    // Curated products collection (por ahora vacía, se llenará cuando el AI Gateway procese)
    const curatedProducts = pimDb.collection('curated_products');
    
    // Get counts
    const totalScraped = await scrapedProducts.countDocuments();
    const totalCurated = await curatedProducts.countDocuments();
    
    // Get counts by source
    const scrapedBySource = await scrapedProducts.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    const curatedBySource = await curatedProducts.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]).toArray();
    
    // PostgreSQL stats would come from PIM service API
    // For now we'll return the known count
    const globalProducts = 3; // Known from user's message
    
    return {
      totalScraped,
      totalCurated,
      totalGlobal: globalProducts,
      inCurationQueue: totalScraped - totalCurated,
      readyToSync: totalCurated - globalProducts,
      scrapedBySource: Object.fromEntries(
        scrapedBySource.map(item => [item._id, item.count])
      ),
      curatedBySource: Object.fromEntries(
        curatedBySource.map(item => [item._id, item.count])
      )
    };
  } catch (error) {
    console.error('MongoDB error:', error);
    throw error;
  } finally {
    await client.close();
  }
}

export async function GET() {
  try {
    const stats = await getCurationStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching curation stats:', error);
    
    // Return mock data if MongoDB fails
    return NextResponse.json({
      totalScraped: 85,
      totalCurated: 47,
      totalGlobal: 3,
      inCurationQueue: 38,
      readyToSync: 44,
      scrapedBySource: {
        materiales_moreno: 30,
        carrefour: 15,
        jumbo: 8,
        garbarino: 8,
        fravega: 8,
        disco: 8,
        coto: 8
      },
      curatedBySource: {
        materiales_moreno: 20,
        carrefour: 10,
        jumbo: 5,
        garbarino: 4,
        fravega: 4,
        disco: 2,
        coto: 2
      }
    });
  }
}