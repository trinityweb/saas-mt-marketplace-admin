'use client';

import React from 'react';
import { SourceManagerTableSimple } from '@/components/scraper/SourceManagerTableSimple';
import { ActiveJobsPanel } from '@/components/scraper/ActiveJobsPanel';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ScraperSourcesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Fuentes de Scraping</h1>
        <p className="text-muted-foreground">
          Gestiona las fuentes de datos para el scraping automático
        </p>
      </div>
      
      <Tabs defaultValue="sources" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sources">Fuentes Disponibles</TabsTrigger>
          <TabsTrigger value="jobs">Trabajos Activos</TabsTrigger>
        </TabsList>
        
        <TabsContent value="sources" className="space-y-4">
          <SourceManagerTableSimple />
        </TabsContent>
        
        <TabsContent value="jobs" className="space-y-4">
          <ActiveJobsPanel />
        </TabsContent>
      </Tabs>
    </div>
  );
}