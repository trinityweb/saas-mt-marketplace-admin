#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Mapeo de imports antiguos a nuevos (optimizados con rutas directas)
const importMapping = {
  // Atoms
  "@/components/ui/button": "@/components/shared-ui/atoms/button",
  "@/components/ui/badge": "@/components/shared-ui/atoms/badge",
  "@/components/ui/input": "@/components/shared-ui/atoms/input",
  "@/components/ui/label": "@/components/shared-ui/atoms/label",
  "@/components/ui/checkbox": "@/components/shared-ui/atoms/checkbox",
  "@/components/ui/switch": "@/components/shared-ui/atoms/switch",
  "@/components/ui/separator": "@/components/shared-ui/atoms/separator",
  "@/components/ui/alert": "@/components/shared-ui/atoms/alert",
  "@/components/ui/textarea": "@/components/shared-ui/atoms/textarea",
  "@/components/ui/tabs": "@/components/shared-ui/atoms/tabs",
  
  // Molecules
  "@/components/ui/card": "@/components/shared-ui/molecules/card",
  "@/components/ui/select": "@/components/shared-ui/molecules/select",
  "@/components/ui/form": "@/components/shared-ui/molecules/form",
  "@/components/ui/dropdown-menu": "@/components/shared-ui/molecules/dropdown-menu",
  
  // Organisms
  "@/components/ui/dialog": "@/components/shared-ui/organisms/dialog",
  "@/components/ui/table": "@/components/shared-ui/organisms/table",
};

// Componentes que no deben migrarse (mantener como están)
const excludedComponents = [
  'criteria-data-table',
  'table-toolbar',
  'stats-card',
  'data-table',
];

function migrateFile(filePath, dryRun = false) {
  console.log(`Processing: ${filePath}`);
  
  let content = fs.readFileSync(filePath, 'utf-8');
  let hasChanges = false;
  const changes = [];

  // Procesar cada mapeo de import
  Object.entries(importMapping).forEach(([oldImport, newImport]) => {
    // Regex para encontrar imports completos
    const importRegex = new RegExp(
      `import\\s*{([^}]+)}\\s*from\\s*['"\`]${oldImport.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}['"\`]`,
      'g'
    );
    
    if (importRegex.test(content)) {
      hasChanges = true;
      changes.push(`  ${oldImport} → ${newImport}`);
      
      content = content.replace(importRegex, (match, imports) => {
        return `import {${imports}} from '${newImport}'`;
      });
    }
  });

  // Agregar import de cn si se usa y no existe
  if (content.includes('className={cn(') && !content.includes("from '@/components/shared-ui/utils/cn'")) {
    // Verificar si ya existe un import de cn
    const cnImportRegex = /import\s*{\s*cn\s*}\s*from\s*['"]@\/lib\/utils['"]/;
    if (cnImportRegex.test(content)) {
      hasChanges = true;
      changes.push('  @/lib/utils → @/components/shared-ui/utils/cn (cn utility)');
      content = content.replace(cnImportRegex, "import { cn } from '@/components/shared-ui/utils/cn'");
    }
  }

  if (hasChanges) {
    console.log(`✅ Found changes:`);
    changes.forEach(change => console.log(change));
    
    if (!dryRun) {
      fs.writeFileSync(filePath, content, 'utf-8');
      console.log(`✅ File updated successfully\n`);
    } else {
      console.log(`🔍 Dry run - no changes written\n`);
    }
  } else {
    console.log(`⏭️  No changes needed\n`);
  }

  return hasChanges;
}

function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const targetFile = args.find(arg => !arg.startsWith('--'));

  console.log('🚀 Shared UI Migration Script');
  console.log('============================\n');
  
  if (dryRun) {
    console.log('🔍 Running in dry-run mode (no files will be modified)\n');
  }

  let files;
  
  if (targetFile) {
    // Procesar un archivo específico
    files = [targetFile];
  } else {
    // Procesar todos los archivos en src/app
    const pattern = path.join(process.cwd(), 'src/app/**/*.{tsx,ts,jsx,js}');
    files = glob.sync(pattern, {
      ignore: [
        '**/node_modules/**',
        '**/*.test.*',
        '**/*.spec.*',
        '**/page-refactored.tsx',
        '**/page-refactored-optimized.tsx'
      ]
    });
  }

  console.log(`Found ${files.length} files to process\n`);

  let filesChanged = 0;
  files.forEach(file => {
    // Skip if file is in excluded list
    const fileName = path.basename(file);
    if (excludedComponents.some(excluded => fileName.includes(excluded))) {
      console.log(`⏭️  Skipping excluded: ${file}\n`);
      return;
    }

    if (migrateFile(file, dryRun)) {
      filesChanged++;
    }
  });

  console.log('\n============================');
  console.log(`✨ Migration complete!`);
  console.log(`📊 Files changed: ${filesChanged}/${files.length}`);
  
  if (dryRun && filesChanged > 0) {
    console.log('\n💡 Run without --dry-run to apply changes');
  }
}

// Ejecutar el script
main();