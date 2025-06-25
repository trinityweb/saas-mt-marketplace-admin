# 📦 Repositorios SaaS Multi-Tenant

## 🏢 Organización: [trinityweb](https://github.com/orgs/trinityweb/repositories)

### 🎯 Servicios Frontend

| Repositorio | Descripción | Puerto | Estado |
|-------------|-------------|--------|--------|
| [saas-mt-marketplace-admin](https://github.com/trinityweb/saas-mt-marketplace-admin) | Panel de administración del marketplace | 3004 | ✅ Activo |
| [saas-mt-marketplace-frontend](https://github.com/trinityweb/saas-mt-marketplace-frontend) | Marketplace público para compradores | 3005 | ✅ Activo |
| [saas-mt-backoffice](https://github.com/trinityweb/saas-mt-backoffice) | Panel administrativo principal | 3000 | ✅ Activo |

### ⚙️ Servicios Backend

| Repositorio | Descripción | Puerto | Estado |
|-------------|-------------|--------|--------|
| [saas-mt-iam-service](https://github.com/trinityweb/saas-mt-iam-service) | Servicio de autenticación y autorización | 8080 | ✅ Activo |
| [saas-mt-pim-service](https://github.com/trinityweb/saas-mt-pim-service) | Gestión de productos e información | 8090 | ✅ Activo |
| [saas-mt-stock-service](https://github.com/trinityweb/saas-mt-stock-service) | Gestión de inventario y stock | 8100 | ✅ Activo |
| [saas-mt-chat-service](https://github.com/trinityweb/saas-mt-chat-service) | Servicio de chat y WhatsApp | 8000 | ✅ Activo |
| [saas-mt-api-gateway](https://github.com/trinityweb/saas-mt-api-gateway) | Gateway principal de APIs (Kong) | 8001 | ✅ Activo |

### 🔧 Infraestructura y Herramientas

| Repositorio | Descripción | Estado |
|-------------|-------------|--------|
| [saas-mt-monitoring](https://github.com/trinityweb/saas-mt-monitoring) | Prometheus, Grafana, Loki | ✅ Activo |
| [saas-mt-terraform](https://github.com/trinityweb/saas-mt-terraform) | Infraestructura como código | ✅ Activo |

### 🤖 MCP Servers (Model Context Protocol)

| Repositorio | Descripción | Estado |
|-------------|-------------|--------|
| [mcp-go-generator-node](https://github.com/trinityweb/mcp-go-generator-node) | Generador de servicios Go (Node.js) | ✅ Activo |
| [mcp-backoffice-integrator](https://github.com/trinityweb/mcp-backoffice-integrator) | Integrador de backoffice | ✅ Activo |
| [mcp-go-generator](https://github.com/trinityweb/mcp-go-generator) | Generador de servicios Go (Python) | ✅ Activo |

### 📚 Documentación

| Repositorio | Descripción | Estado |
|-------------|-------------|--------|
| [documentation](https://github.com/trinityweb/documentation) | Documentación técnica del proyecto | ✅ Activo |

## 🚀 Comandos Útiles

### Clonar todos los repositorios
```bash
# Crear directorio base
mkdir saas-mt && cd saas-mt

# Clonar documentación
git clone https://github.com/trinityweb/documentation.git

# Crear directorio services
mkdir -p services && cd services

# Clonar servicios
git clone https://github.com/trinityweb/saas-mt-iam-service.git
git clone https://github.com/trinityweb/saas-mt-pim-service.git
git clone https://github.com/trinityweb/saas-mt-stock-service.git
git clone https://github.com/trinityweb/saas-mt-chat-service.git
git clone https://github.com/trinityweb/saas-mt-api-gateway.git
git clone https://github.com/trinityweb/saas-mt-backoffice.git
git clone https://github.com/trinityweb/saas-mt-marketplace-admin.git
git clone https://github.com/trinityweb/saas-mt-marketplace-frontend.git
git clone https://github.com/trinityweb/saas-mt-monitoring.git
git clone https://github.com/trinityweb/saas-mt-terraform.git

# Volver al directorio base y crear directorio mcp
cd .. && mkdir -p mcp && cd mcp

# Clonar MCP servers
git clone https://github.com/trinityweb/mcp-go-generator-node.git
git clone https://github.com/trinityweb/mcp-backoffice-integrator.git
git clone https://github.com/trinityweb/mcp-go-generator.git
```

### Gestión multi-repositorio
```bash
# Estado de todos los repositorios
make repos-status

# Gestión interactiva de cambios
make check-changes

# Iniciar nueva tarea multi-repo
make task-start

# Finalizar tarea activa
make task-finish
```

### Docker y desarrollo
```bash
# Levantar todo el stack
make up

# Solo servicios específicos
docker-compose up marketplace-admin marketplace-frontend -d

# Rebuild rápido
make rebuild-marketplace-admin
make rebuild-marketplace-frontend
```

## 📊 Arquitectura del Proyecto

```
saas-mt/
├── documentation/              # Documentación técnica
├── services/                   # Microservicios
│   ├── saas-mt-iam-service/           # Autenticación
│   ├── saas-mt-pim-service/           # Productos
│   ├── saas-mt-stock-service/         # Inventario
│   ├── saas-mt-chat-service/          # Chat/WhatsApp
│   ├── saas-mt-api-gateway/           # Gateway (Kong)
│   ├── saas-mt-backoffice/            # Admin principal
│   ├── saas-mt-marketplace-admin/     # Admin marketplace
│   ├── saas-mt-marketplace-frontend/  # Marketplace público
│   ├── saas-mt-monitoring/            # Observabilidad
│   └── saas-mt-terraform/             # Infraestructura
├── mcp/                        # MCP Servers
│   ├── mcp-go-generator-node/         # Generador Go (Node.js)
│   ├── mcp-backoffice-integrator/     # Integrador backoffice
│   └── mcp-go-generator/              # Generador Go (Python)
├── docker-compose.yml          # Orquestación local
├── Makefile                    # Comandos de gestión
└── scripts/                    # Scripts de automatización
```

## 🔗 Enlaces Importantes

- **Organización**: https://github.com/orgs/trinityweb/repositories
- **Marketplace Admin**: http://localhost:3004
- **Marketplace Frontend**: http://localhost:3005
- **Backoffice**: http://localhost:3000
- **API Gateway**: http://localhost:8001
- **Grafana**: http://localhost:3002

## 📝 Notas

- Todos los repositorios están bajo la organización **trinityweb**
- Los servicios frontend usan puertos 3000, 3004, 3005
- Los servicios backend usan puertos 8000, 8001, 8080, 8090, 8100
- El monitoreo usa puertos 3002 (Grafana), 9090 (Prometheus)
- La base de datos PostgreSQL usa puerto 5432 