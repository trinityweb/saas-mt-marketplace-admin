# Troubleshooting - Marketplace Admin

## Problemas Comunes y Soluciones

### 1. Error de Puerto en Uso (EADDRINUSE)

**Problema:**
```
Error: listen EADDRINUSE: address already in use :::3004
```

**Solución:**
```bash
# Encontrar el proceso que usa el puerto
lsof -ti:3004

# Terminar el proceso
kill -9 $(lsof -ti:3004)

# O usar el comando combinado
lsof -ti:3004 | xargs kill -9
```

### 2. Error de Fetch en IAM Client

**Problema:**
```
IamApiClient.fetch error at line 84
```

**Causa:** Conflicto con la función global `fetch()`

**Solución:** Ya implementada - usar `globalThis.fetch()` en lugar de `fetch()`

### 3. Servicios Backend No Disponibles

**Problema:** Los health checks muestran servicios como "unhealthy"

**Causa:** Los servicios Go no están ejecutándose

**Soluciones:**

#### Opción 1: Usar el Helper de Desarrollo
1. Ve a la página de login (`http://localhost:3004/auth/login`)
2. Verás una tarjeta naranja "Modo Desarrollo"
3. Haz clic en "Simular Login"
4. Esto te permitirá acceder a la interfaz sin servicios backend

#### Opción 2: Ejecutar Servicios con Docker
```bash
# Desde la raíz del proyecto
docker-compose up -d

# Verificar que los servicios estén ejecutándose
docker-compose ps
```

#### Opción 3: Ejecutar Servicios Individualmente
```bash
# IAM Service
cd services/saas-mt-iam-service
go run main.go

# PIM Service  
cd services/saas-mt-pim-service
go run main.go

# Stock Service
cd services/saas-mt-stock-service
go run main.go
```

### 4. Dependencias Faltantes

**Problema:**
```
Module not found: Can't resolve '@radix-ui/react-scroll-area'
```

**Solución:**
```bash
cd services/saas-mt-marketplace-admin
npm install @radix-ui/react-scroll-area
```

### 5. Variables de Entorno

**Problema:** URLs de API no configuradas

**Solución:** Crear `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8001
API_GATEWAY_URL=http://localhost:8001
NODE_ENV=development
```

### 6. Error de Autenticación Automática

**Problema:** La aplicación intenta refrescar tokens automáticamente y falla

**Solución:** Ya implementada - el hook `useAuth` ahora maneja errores de conectividad sin redirigir automáticamente

### 7. Errores de Compilación TypeScript

**Problema:** Errores de tipos en componentes

**Solución:**
```bash
# Limpiar cache de Next.js
rm -rf .next

# Reinstalar dependencias
rm -rf node_modules package-lock.json
npm install

# Reiniciar servidor
npm run dev
```

## Comandos Útiles

### Verificar Estado de Servicios
```bash
# Health check de la aplicación
curl http://localhost:3004/api/health | jq

# Verificar servicios individuales
curl http://localhost:8080/health  # IAM
curl http://localhost:8090/health  # PIM
curl http://localhost:8100/health  # Stock
```

### Logs de Desarrollo
```bash
# Ver logs del servidor Next.js
npm run dev

# Ver logs de Docker Compose
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f iam-service
```

### Limpiar Estado de Desarrollo
```bash
# Limpiar localStorage (en DevTools del navegador)
localStorage.clear()

# Limpiar cache de Next.js
rm -rf .next

# Reiniciar Docker Compose
docker-compose down && docker-compose up -d
```

## Características de Desarrollo

### 1. Helper de Login de Desarrollo
- Solo visible en `NODE_ENV=development`
- Simula tokens válidos para testing
- Usuario simulado: `admin@dev.com`
- Tenant ID: `dev-tenant`

### 2. Error Boundary
- Captura errores de la aplicación
- Muestra información técnica en desarrollo
- Permite reintentar operaciones fallidas

### 3. Monitoreo de Servicios
- Health checks automáticos cada 30 segundos
- Sidebar con estado detallado de servicios
- Indicadores visuales en el header
- Alertas contextuales en páginas específicas

### 4. Manejo Robusto de Errores
- No redirección automática en errores de conectividad
- Limpieza automática de tokens inválidos
- Mensajes de error descriptivos
- Logs detallados para debugging

## Próximos Pasos

1. **Configurar Docker Compose** para desarrollo local
2. **Implementar autenticación real** cuando los servicios estén disponibles
3. **Agregar más endpoints** al monitoreo de salud
4. **Implementar notificaciones** para cambios de estado de servicios
5. **Agregar métricas** de rendimiento y uso 