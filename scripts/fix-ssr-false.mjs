#!/usr/bin/env node
/**
 * Script para remover ssr: false de dynamic imports
 * ssr: false no está permitido en Server Components
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const APP_DIR = join(process.cwd(), 'src', 'app');

function getAllToolDirs() {
  const entries = readdirSync(APP_DIR);
  return entries.filter(entry => {
    const fullPath = join(APP_DIR, entry);
    if (!statSync(fullPath).isDirectory()) return false;

    try {
      statSync(join(fullPath, 'page.tsx'));
      return true;
    } catch {
      return false;
    }
  });
}

function removeSsrFalse(content) {
  // Buscar dynamic import con ssr: false
  if (!content.includes('ssr: false')) {
    return null; // Ya está corregido
  }

  // Patrón para dynamic con ssr: false
  const pattern = /const\s+(\w+)\s+=\s+dynamic\(\(\)\s*=>\s*import\(["']\.\/client["']\),\s*\{[\s\S]*?ssr:\s*false,?\s*\}\);/g;

  // Reemplazar con versión sin ssr: false
  const fixed = content.replace(
    pattern,
    (match, componentName) => {
      return `const ${componentName} = dynamic(() => import("./client"), {
  loading: () => <ToolLoadingSkeleton />,
});`;
    }
  );

  return fixed !== content ? fixed : null;
}

function main() {
  console.log('🔧 Removiendo ssr: false de dynamic imports...\n');

  const toolDirs = getAllToolDirs();
  let fixed = 0;

  toolDirs.forEach(dir => {
    const pagePath = join(APP_DIR, dir, 'page.tsx');

    try {
      const content = readFileSync(pagePath, 'utf-8');
      const fixedContent = removeSsrFalse(content);

      if (fixedContent) {
        writeFileSync(pagePath, fixedContent, 'utf-8');
        console.log(`  ✅ ${dir}/page.tsx`);
        fixed++;
      }
    } catch (error) {
      console.error(`  ❌ ${dir}/page.tsx - Error: ${error.message}`);
    }
  });

  console.log(`\n✨ Corregidos: ${fixed} archivos\n`);
}

main();
