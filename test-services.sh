#!/bin/bash

echo "🔍 Probando endpoints de health de los servicios..."
echo "=================================================="

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Función para probar un endpoint
test_endpoint() {
    local name=$1
    local url=$2
    local expected_status=${3:-200}
    
    echo -n "Testing $name ($url)... "
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --connect-timeout 5 --max-time 10 "$url" 2>/dev/null)
    
    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ OK ($response)${NC}"
        return 0
    else
        echo -e "${RED}✗ FAIL ($response)${NC}"
        return 1
    fi
}

# Servicios a probar
echo "🚀 Servicios Go:"
test_endpoint "IAM Service" "http://localhost:8080/health"
test_endpoint "Chat Service" "http://localhost:8000/health"
test_endpoint "PIM Service" "http://localhost:8090/health"
test_endpoint "Stock Service" "http://localhost:8100/health"

echo ""
echo "🌐 API Gateway:"
test_endpoint "Kong Admin API" "http://localhost:8444/status" 200

echo ""
echo "📊 Monitoreo:"
test_endpoint "Prometheus" "http://localhost:9090/-/healthy"
test_endpoint "Grafana" "http://localhost:3002/api/health"

echo ""
echo "💾 Bases de datos:"
# Para PostgreSQL, probamos si el puerto está abierto
if nc -z localhost 5432 2>/dev/null; then
    echo -e "PostgreSQL (localhost:5432)... ${GREEN}✓ OK${NC}"
else
    echo -e "PostgreSQL (localhost:5432)... ${RED}✗ FAIL${NC}"
fi

# Para MongoDB, probamos si el puerto está abierto
if nc -z localhost 27017 2>/dev/null; then
    echo -e "MongoDB (localhost:27017)... ${GREEN}✓ OK${NC}"
else
    echo -e "MongoDB (localhost:27017)... ${RED}✗ FAIL${NC}"
fi

echo ""
echo "🎯 Frontend:"
test_endpoint "Marketplace Admin" "http://localhost:3004" 200
test_endpoint "Backoffice" "http://localhost:3000" 200
test_endpoint "Marketplace Frontend" "http://localhost:3005" 200

echo ""
echo "=================================================="
echo "✅ Prueba de servicios completada" 