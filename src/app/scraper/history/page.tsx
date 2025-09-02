'use client';

import React from 'react';
import { ScrapingHistory } from '@/components/scraper/ScrapingHistory';

export default function ScraperHistoryPage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Historial de Scraping</h1>
        <p className="text-muted-foreground">
          Revisa el historial de ejecuciones y resultados
        </p>
      </div>
      
      <ScrapingHistory />
    </div>
  );
}