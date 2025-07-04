const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Midiendo performance de la aplicación...\n');

// Limpiar cache
console.log('1. Limpiando cache...');
try {
  execSync('rm -rf .next', { stdio: 'inherit' });
} catch (e) {
  console.log('No hay cache que limpiar');
}

// Build de producción
console.log('\n2. Creando build de producción...');
const startBuild = Date.now();
execSync('npm run build', { stdio: 'inherit' });
const buildTime = Date.now() - startBuild;

// Analizar el output del build
console.log('\n3. Analizando tamaño del bundle...');
const buildOutput = execSync('find .next -name "*.js" -type f | wc -l').toString().trim();
console.log(`   - Archivos JS generados: ${buildOutput}`);

// Mostrar resumen
console.log('\n📊 Resumen de Performance:');
console.log(`   - Tiempo de build: ${(buildTime / 1000).toFixed(2)}s`);
console.log(`   - Archivos JS: ${buildOutput}`);

// Recomendaciones
console.log('\n💡 Recomendaciones:');
console.log('   - Para analizar el bundle: npm run analyze');
console.log('   - Para desarrollo rápido: npm run dev:webpack');
console.log('   - Para desarrollo con Turbopack: npm run dev');

console.log('\n✅ Análisis completado');