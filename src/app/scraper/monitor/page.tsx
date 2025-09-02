'use client';

import React from 'react';
import { RealTimeScraperMonitor } from '@/components/shared-ui/organisms';

export default function ScraperMonitorPage() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Monitor de Scrapers</h1>
          <p className="text-muted-foreground">
            Monitoreo en tiempo real de todas las fuentes de scraping
          </p>
        </div>
      </div>

      <RealTimeScraperMonitor />
    </div>
  );
}