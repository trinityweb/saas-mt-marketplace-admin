const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Buscar archivos con imports problemáticos
const pattern = path.join(__dirname, 'src/**/*.{ts,tsx}');
const files = glob.sync(pattern);

let problemsFound = 0;

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf-8');
  
  // Buscar imports de @/shared-ui que no sean desde el path correcto
  if (content.includes("from '@/shared-ui'") || content.includes('from "@/shared-ui"')) {
    console.log(`❌ ${file}: Contiene import directo de @/shared-ui`);
    problemsFound++;
  }
  
  // Buscar imports de componentes UI antiguos
  const oldImports = [
    '@/components/ui/button',
    '@/components/ui/badge',
    '@/components/ui/card',
    '@/components/ui/dialog',
    '@/components/ui/table',
    '@/components/ui/select',
    '@/components/ui/input',
    '@/components/ui/label',
    '@/components/ui/checkbox',
    '@/components/ui/switch',
    '@/components/ui/separator',
    '@/components/ui/tabs',
    '@/components/ui/form',
    '@/components/ui/dropdown-menu'
  ];
  
  oldImports.forEach(oldImport => {
    if (content.includes(oldImport)) {
      console.log(`⚠️  ${file}: Contiene import antiguo de ${oldImport}`);
      problemsFound++;
    }
  });
});

if (problemsFound === 0) {
  console.log('✅ No se encontraron problemas de imports!');
} else {
  console.log(`\n🔍 Se encontraron ${problemsFound} problemas de imports`);
  console.log('Ejecuta el script de migración: node migrate-to-shared-ui.js');
}