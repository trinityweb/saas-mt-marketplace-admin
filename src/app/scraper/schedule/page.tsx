'use client';

import React from 'react';
import { ScheduleConfig } from '@/components/scraper/ScheduleConfig';

export default function ScraperSchedulePage() {
  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Programación de Scraping</h1>
        <p className="text-muted-foreground">
          Configura horarios automáticos para la recolección de datos
        </p>
      </div>
      
      <ScheduleConfig />
    </div>
  );
}