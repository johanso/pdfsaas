#!/usr/bin/env node
/**
 * Script para reordenar imports en page.tsx
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

function fixImportOrder(content) {
  const lines = content.split('\n');

  // Buscar todos los imports
  const importIndices = [];
  const imports = [];

  lines.forEach((line, idx) => {
    if (line.trim().startsWith('import ')) {
      importIndices.push(idx);
      imports.push({ line, idx });
    }
  });

  if (imports.length === 0) return null;

  // Ordenar imports: next primero, luego @/, luego relativo
  const sorted = imports.map(i => i.line).sort((a, b) => {
    const aIsNext = a.includes('from "next');
    const bIsNext = b.includes('from "next');
    const aIsLocal = a.includes('from "@/');
    const bIsLocal = b.includes('from "@/');
    const aIsRelative = a.includes('from "./');
    const bIsRelative = b.includes('from "./');

    if (aIsNext && !bIsNext) return -1;
    if (!aIsNext && bIsNext) return 1;
    if (aIsLocal && !bIsLocal && !bIsNext) return -1;
    if (!aIsLocal && bIsLocal && !aIsNext) return 1;
    if (aIsRelative && !bIsRelative && !bIsNext && !bIsLocal) return -1;
    if (!aIsRelative && bIsRelative && !aIsNext && !aIsLocal) return 1;

    return 0;
  });

  // Reemplazar imports
  const result = [...lines];
  importIndices.forEach((idx, i) => {
    result[idx] = sorted[i];
  });

  const newContent = result.join('\n');
  return newContent !== content ? newContent : null;
}

function main() {
  console.log('🔧 Reordenando imports...\n');

  const toolDirs = getAllToolDirs();
  let fixed = 0;

  toolDirs.forEach(dir => {
    const pagePath = join(APP_DIR, dir, 'page.tsx');

    try {
      const content = readFileSync(pagePath, 'utf-8');
      const fixedContent = fixImportOrder(content);

      if (fixedContent) {
        writeFileSync(pagePath, fixedContent, 'utf-8');
        console.log(`  ✅ ${dir}/page.tsx`);
        fixed++;
      }
    } catch (error) {
      console.error(`  ❌ ${dir}/page.tsx - Error: ${error.message}`);
    }
  });

  console.log(`\n✨ Reordenados: ${fixed} archivos\n`);
}

main();
