# Puertos de Servicios Docker - SaaS Multi-Tenant

## Frontend Services
| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **Backoffice** | 3000 | http://localhost:3000 | Panel administrativo principal |
| **Marketplace Admin** | 3004 | http://localhost:3004 | Panel de administración del marketplace |
| **Marketplace Frontend** | 3005 | http://localhost:3005 | Marketplace público para usuarios |

## Backend Services
| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **API Gateway** | 8001 | http://localhost:8001 | Gateway principal de APIs |
| **Kong Admin** | 8444 | http://localhost:8444 | API de administración de Kong |
| **IAM Service** | 8080 | http://localhost:8080 | Servicio de autenticación |
| **Chat Service** | 8000 | http://localhost:8000 | Servicio de chat/WhatsApp |
| **PIM Service** | 8090 | http://localhost:8090 | Gestión de productos |
| **Stock Service** | 8100 | http://localhost:8100 | Gestión de inventario |

## Monitoring & Observability
| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **Grafana** | 3002 | http://localhost:3002 | Dashboards y visualización |
| **Prometheus** | 9090 | http://localhost:9090 | Métricas y alertas |
| **Loki** | 3100 | http://localhost:3100 | Agregación de logs |
| **cAdvisor** | 8082 | http://localhost:8082 | Métricas de contenedores |

## Database & Infrastructure
| Servicio | Puerto | URL | Descripción |
|----------|--------|-----|-------------|
| **PostgreSQL** | 5432 | localhost:5432 | Base de datos principal |
| **Postgres Exporter** | 9187 | http://localhost:9187 | Métricas de PostgreSQL |

## Prometheus Metrics Endpoints
| Servicio | Puerto | Endpoint |
|----------|--------|----------|
| **IAM Service** | 2112 | http://localhost:2112/metrics |
| **Chat Service** | 8002 | http://localhost:8002/metrics |
| **PIM Service** | 2113 | http://localhost:2113/metrics |
| **Stock Service** | 2114 | http://localhost:2114/metrics |

## Credenciales por Defecto

### Grafana
- **Usuario**: admin
- **Contraseña**: admin123
- **URL**: http://localhost:3002

### PostgreSQL
- **Usuario**: postgres
- **Contraseña**: postgres
- **Host**: localhost
- **Puerto**: 5432
- **Bases de datos**: iam_db, chat_db, pim_db, stock_db, grafana_db

## Comandos Útiles

### Iniciar todos los servicios
```bash
docker-compose up -d
```

### Iniciar solo servicios específicos
```bash
# Solo frontend
docker-compose up backoffice marketplace-admin marketplace-frontend -d

# Solo backend
docker-compose up api-gateway iam-service chat-service pim-service stock-service -d

# Solo monitoring
docker-compose up prometheus grafana loki -d
```

### Ver logs
```bash
# Logs de un servicio específico
docker-compose logs marketplace-admin -f

# Logs de múltiples servicios
docker-compose logs marketplace-admin marketplace-frontend -f
```

### Reconstruir servicios
```bash
# Reconstruir un servicio específico
docker-compose build marketplace-admin

# Reconstruir y reiniciar
docker-compose up --build marketplace-admin -d
```

### Estado de servicios
```bash
docker-compose ps
```

### Parar servicios
```bash
# Parar todos
docker-compose down

# Parar servicios específicos
docker-compose stop marketplace-admin marketplace-frontend
```

## Notas Importantes

1. **Puerto 3002**: Ocupado por Grafana, por eso los nuevos servicios usan 3004 y 3005
2. **Dependencias**: Los servicios frontend dependen del API Gateway
3. **Health Checks**: Algunos servicios tienen health checks configurados
4. **Volúmenes**: Los datos de PostgreSQL, Prometheus, Grafana y Loki son persistentes
5. **Red**: Todos los servicios están en la red `saas-network` para comunicación interna 