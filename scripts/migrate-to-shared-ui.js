#!/usr/bin/env node

/**
 * Script para ayudar con la migración gradual a shared-ui
 * Uso: node scripts/migrate-to-shared-ui.js [archivo|directorio]
 */

const fs = require('fs');
const path = require('path');

// Mapeo de imports antiguos a nuevos
const importMappings = {
  // Átomos
  '@/components/ui/button': '@/shared-ui',
  '@/components/ui/input': '@/shared-ui',
  '@/components/ui/label': '@/shared-ui',
  '@/components/ui/badge': '@/shared-ui',
  '@/components/ui/loading': '@/shared-ui',
  '@/components/ui/alert': '@/shared-ui',
  '@/components/ui/checkbox': '@/shared-ui',
  '@/components/ui/separator': '@/shared-ui',
  '@/components/ui/switch': '@/shared-ui',
};

// Componentes que han sido migrados
const migratedComponents = [
  'Button', 'buttonVariants',
  'Input',
  'Label',
  'Badge', 'badgeVariants',
  'Loading',
  'Alert', 'AlertTitle', 'AlertDescription',
  'Checkbox',
  'Separator',
  'Switch'
];

function processFile(filePath) {
  if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) {
    return;
  }

  console.log(`Procesando: ${filePath}`);
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Buscar imports de componentes migrados
  const importRegex = /import\s*{([^}]+)}\s*from\s*["']([^"']+)["']/g;
  
  content = content.replace(importRegex, (match, imports, modulePath) => {
    if (importMappings[modulePath]) {
      const importedItems = imports.split(',').map(item => item.trim());
      const migratedItems = importedItems.filter(item => 
        migratedComponents.includes(item)
      );

      if (migratedItems.length > 0) {
        modified = true;
        console.log(`  ✓ Migrando: ${migratedItems.join(', ')} desde ${modulePath}`);
        
        // Si todos los items fueron migrados, reemplazar todo el import
        if (migratedItems.length === importedItems.length) {
          return `import { ${imports} } from "${importMappings[modulePath]}"`;
        } else {
          // Si solo algunos fueron migrados, mantener ambos imports
          const remainingItems = importedItems.filter(item => 
            !migratedComponents.includes(item)
          );
          console.log(`  ⚠ Manteniendo imports no migrados: ${remainingItems.join(', ')}`);
          return match + `\nimport { ${migratedItems.join(', ')} } from "${importMappings[modulePath]}"`;
        }
      }
    }
    return match;
  });

  if (modified) {
    // Crear backup
    const backupPath = filePath + '.backup';
    fs.copyFileSync(filePath, backupPath);
    console.log(`  📁 Backup creado: ${backupPath}`);
    
    // Escribir archivo modificado
    fs.writeFileSync(filePath, content);
    console.log(`  ✅ Archivo actualizado\n`);
  }
}

function processDirectory(dirPath) {
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
      processDirectory(fullPath);
    } else if (stat.isFile()) {
      processFile(fullPath);
    }
  });
}

// Main
const target = process.argv[2];

if (!target) {
  console.log('Uso: node scripts/migrate-to-shared-ui.js [archivo|directorio]');
  console.log('\nComponentes migrados:');
  migratedComponents.forEach(comp => console.log(`  - ${comp}`));
  process.exit(1);
}

const targetPath = path.resolve(target);

if (!fs.existsSync(targetPath)) {
  console.error(`Error: ${targetPath} no existe`);
  process.exit(1);
}

const stat = fs.statSync(targetPath);

console.log('🚀 Iniciando migración a shared-ui...\n');

if (stat.isDirectory()) {
  processDirectory(targetPath);
} else {
  processFile(targetPath);
}

console.log('✨ Migración completada!');
console.log('\nNota: Revisa los cambios y elimina los archivos .backup cuando estés seguro');