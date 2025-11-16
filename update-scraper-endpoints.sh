#!/bin/bash

# Script para actualizar todos los endpoints de scraper para usar Kong Gateway

echo "🔄 Actualizando endpoints de scraper para usar Kong Gateway..."

# Lista de archivos a actualizar
files=(
  "src/app/api/scraper/stats/route.ts"
  "src/app/api/scraper/mongodb-stats/route.ts"
  "src/app/api/scraper/targets/route.ts"
  "src/app/api/scraper/curation-stats/route.ts"
  "src/app/api/scraper/execute/route.ts"
  "src/app/api/scraper/sources/route.ts"
  "src/app/api/scraper/sources/[sourceId]/execute/route.ts"
  "src/app/api/scraper/products/curate/route.ts"
  "src/app/api/scraper/products/curation-jobs/route.ts"
  "src/app/api/scraper/products/curation-jobs/[jobId]/route.ts"
)

# Contador
updated=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "📝 Actualizando: $file"
    
    # Verificar si ya usa Kong Gateway
    if grep -q "API_GATEWAY_URL" "$file"; then
      echo "  ✅ Ya actualizado"
    else
      # Hacer backup
      cp "$file" "$file.bak"
      
      # Reemplazar SCRAPER_SERVICE_URL con API_GATEWAY_URL
      sed -i '' 's/process\.env\.SCRAPER_SERVICE_URL || '\''http:\/\/localhost:8086'\''/process.env.API_GATEWAY_URL || '\''http:\/\/localhost:8001'\''/g' "$file"
      
      # Agregar const API_GATEWAY_URL si no existe
      if ! grep -q "const API_GATEWAY_URL" "$file"; then
        sed -i '' '1s/^/import { NextRequest, NextResponse } from '\''next\/server'\'';\n\nconst API_GATEWAY_URL = process.env.API_GATEWAY_URL || '\''http:\/\/localhost:8001'\'';\n\n/' "$file"
      fi
      
      # Actualizar las URLs para incluir /scraper prefix
      sed -i '' 's|`${scraperServiceUrl}/api/v1/|`${API_GATEWAY_URL}/scraper/api/v1/|g' "$file"
      sed -i '' 's|${scraperServiceUrl}/api/v1/|${API_GATEWAY_URL}/scraper/api/v1/|g' "$file"
      
      # Agregar headers de autenticación si no existen
      if ! grep -q "X-Tenant-ID" "$file"; then
        # Buscar donde se definen los headers y agregar los nuevos
        sed -i '' '/headers: {/,/}/ {
          s/'\''Content-Type'\'': '\''application\/json'\'',/'\''Content-Type'\'': '\''application\/json'\'',\
      '\''X-Tenant-ID'\'': '\''marketplace-admin'\'',\
      '\''X-User-Role'\'': '\''marketplace_admin'\'',\
      '\''Authorization'\'': '\''Bearer admin-test-token'\''/
        }' "$file"
      fi
      
      ((updated++))
      echo "  ✅ Actualizado"
    fi
  else
    echo "⚠️  No encontrado: $file"
  fi
done

echo ""
echo "✅ Actualización completada: $updated archivos actualizados"
echo ""
echo "⚠️  Recuerda:"
echo "   - Verificar que la variable API_GATEWAY_URL esté en .env.local"
echo "   - Reiniciar el servidor de desarrollo"
echo "   - Los archivos de backup están en *.bak"