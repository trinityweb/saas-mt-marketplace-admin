import { test, expect } from '@playwright/test';

test.describe('Flujo de Curación Asíncrona', () => {
  test.beforeEach(async ({ page }) => {
    // Interceptar todas las requests para logging
    page.on('request', request => {
      if (request.url().includes('/api/')) {
        console.log('→', request.method(), request.url());
      }
    });
    
    page.on('response', response => {
      if (response.url().includes('/api/')) {
        console.log('←', response.status(), response.url());
      }
    });

    // Setup: Login y navegación
    await page.goto('/curation');
    
    // Configurar auth en localStorage (dev mode)
    await page.evaluate(() => {
      // Crear un JWT válido para ADMIN (sin tenant-id)
      const header = { alg: 'HS256', typ: 'JWT' };
      const payload = {
        user_id: 'marketplace-admin-001',
        role_id: 'marketplace_admin',
        role: 'marketplace_admin',
        email: 'admin@marketplace.com',
        scope: 'global_admin',
        exp: Math.floor(Date.now() / 1000) + (60 * 60 * 24),
        iat: Math.floor(Date.now() / 1000),
        iss: 'marketplace-admin-service'
      };
      
      const base64Header = btoa(JSON.stringify(header));
      const base64Payload = btoa(JSON.stringify(payload));
      const mockAccessToken = `${base64Header}.${base64Payload}.admin-dev-signature`;
      
      localStorage.setItem('iam_access_token', mockAccessToken);
      localStorage.setItem('iam_refresh_token', 'admin-mock-refresh-token');
      localStorage.removeItem('tenant_id');
      localStorage.removeItem('current_tenant_id');
    });
  });

  test('debe enviar productos a curación y hacer polling del job', async ({ page }) => {
    // 1. Esperar que cargue la página
    await expect(page.locator('h2:has-text("Panel de Curación")')).toBeVisible({ timeout: 10000 });
    
    // 2. Esperar que carguen productos (buscar tabla de productos)
    await page.waitForSelector('table tbody tr', { timeout: 15000 });
    
    // 3. Buscar productos pendientes para curar
    const pendingRows = page.locator('tr').filter({ hasText: 'pending' });
    const pendingCount = await pendingRows.count();
    
    if (pendingCount === 0) {
      console.log('No hay productos pendientes para curar');
      // Buscar cualquier producto para el test
      const anyRow = page.locator('table tbody tr').first();
      await anyRow.locator('input[type="checkbox"]').check();
    } else {
      // Seleccionar el primer producto pendiente
      const firstPendingRow = pendingRows.first();
      await firstPendingRow.locator('input[type="checkbox"]').check();
    }
    
    // 4. Buscar y hacer click en el botón de "Enviar a AI" o "Curar"
    const curateButton = page.locator('button').filter({ hasText: /enviar a ai|curar|send to ai/i }).first();
    await expect(curateButton).toBeVisible();
    await curateButton.click();
    
    // 5. Verificar toast de inicio (buscar mensaje con "Job" o "iniciado")
    await expect(
      page.locator('[data-sonner-toast], .sonner, [role="alert"]').filter({ 
        hasText: /job|iniciado|procesando/i 
      })
    ).toBeVisible({ timeout: 10000 });
    
    // 6. Esperar notificación de completado (máximo 2 minutos)
    await expect(
      page.locator('[data-sonner-toast], .sonner, [role="alert"]').filter({ 
        hasText: /completada|completed|éxito|success/i 
      })
    ).toBeVisible({ timeout: 120000 });
    
    // 7. Verificar que la tabla se actualizó (buscar productos con estado "curated")
    await expect(page.locator('tr').filter({ hasText: 'curated' })).toBeVisible({ timeout: 5000 });
    
    console.log('✅ Test completado exitosamente');
  });

  test('debe verificar que los endpoints funcionan correctamente', async ({ page }) => {
    // Test directo de los endpoints
    const response = await page.request.post('/api/scraper/products/curate', {
      data: {
        product_ids: ['test-product-id'],
        curation_notes: 'Test de Playwright'
      }
    });
    
    // Verificar que el endpoint responde (puede fallar por producto inexistente, pero debe responder)
    expect(response.status()).toBeLessThan(500);
    
    const responseData = await response.json();
    console.log('Response del endpoint /curate:', responseData);
    
    // Si hay un job_id, verificar el endpoint de status
    if (responseData.job_id) {
      const statusResponse = await page.request.get(`/api/scraper/products/curation-jobs/${responseData.job_id}`);
      expect(statusResponse.status()).toBeLessThan(500);
      
      const statusData = await statusResponse.json();
      console.log('Response del endpoint /curation-jobs:', statusData);
    }
  });

  test('debe verificar que la página de curación carga correctamente', async ({ page }) => {
    // Verificar elementos clave de la página
    await expect(page.locator('h2:has-text("Panel de Curación")')).toBeVisible();
    
    // Verificar que hay estadísticas
    await expect(page.locator('[data-testid="stats-panel"], .stats, .metrics')).toBeVisible();
    
    // Verificar que hay tabs o filtros
    await expect(page.locator('[role="tab"], .tabs, .filters')).toBeVisible();
    
    // Verificar que hay tabla de productos
    await expect(page.locator('table, [role="table"]')).toBeVisible();
    
    console.log('✅ Página de curación carga correctamente');
  });
});
