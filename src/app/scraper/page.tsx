'use client';

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RealTimeMonitor } from '@/components/scraper/RealTimeMonitor';
import { SourcesManager } from '@/components/scraper/SourcesManager';
import { CurationStatus } from '@/components/scraper/CurationStatus';
import { ScrapingMonitor } from '@/components/scraper/ScrapingMonitor';

export default function ScraperPage() {

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Sistema de Scraping</h1>
        <p className="text-muted-foreground">
          Monitorea y gestiona la recolección automática de productos del mercado
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-4">
        <TabsList>
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="sources">Fuentes</TabsTrigger>
          <TabsTrigger value="schedule">Programación</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard" className="space-y-4">
          <CurationStatus />
          <ScrapingMonitor />
        </TabsContent>

        <TabsContent value="sources" className="space-y-4">
          <SourcesManager />
        </TabsContent>

        <TabsContent value="schedule" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            Configuración de programación - Próximamente
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          <div className="text-center py-12 text-muted-foreground">
            Historial de ejecuciones - Próximamente
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}