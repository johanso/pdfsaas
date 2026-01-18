#!/usr/bin/env node
/**
 * Script para añadir dynamic imports a todos los page.tsx de las herramientas
 * Optimización: Reduce bundle inicial mediante code splitting
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

const APP_DIR = join(process.cwd(), 'src', 'app');

// Archivos ya procesados manualmente
const PROCESSED = new Set([
  'comprimir-pdf',
  'unir-pdf',
  'dividir-pdf',
  'pdf-a-imagen',
]);

function getAllToolDirs() {
  const entries = readdirSync(APP_DIR);
  return entries.filter(entry => {
    const fullPath = join(APP_DIR, entry);
    if (!statSync(fullPath).isDirectory()) return false;
    if (PROCESSED.has(entry)) return false;

    // Verificar que tenga page.tsx y client.tsx
    try {
      statSync(join(fullPath, 'page.tsx'));
      statSync(join(fullPath, 'client.tsx'));
      return true;
    } catch {
      return false;
    }
  });
}

function transformPageTsx(content) {
  // Encontrar el import del cliente
  const clientImportRegex = /import\s+(\w+)\s+from\s+['"]\.\/client['"]\s*;?/;
  const match = content.match(clientImportRegex);

  if (!match) {
    console.warn('  ⚠️  No se encontró import del cliente');
    return null;
  }

  const clientName = match[1];

  // Verificar si ya tiene dynamic import (con el nombre correcto)
  if (content.includes(`const ${clientName} = dynamic(`)) {
    // Ya procesado, pero verificar orden de imports
    const lines = content.split('\n');
    const metadataImportIdx = lines.findIndex(l => l.includes('import type { Metadata }'));
    const dynamicImportIdx = lines.findIndex(l => l.includes('import dynamic'));

    // Si dynamic está después de Metadata, reordenar
    if (dynamicImportIdx > metadataImportIdx && metadataImportIdx >= 0) {
      // Extraer líneas de import
      const metadataLine = lines[metadataImportIdx];
      const dynamicLine = lines[dynamicImportIdx];
      const skeletonIdx = lines.findIndex(l => l.includes('ToolLoadingSkeleton'));
      const skeletonLine = skeletonIdx >= 0 ? lines[skeletonIdx] : null;

      // Remover imports antiguos
      lines.splice(metadataImportIdx, 1);
      const newDynamicIdx = lines.findIndex(l => l.includes('import dynamic'));
      if (newDynamicIdx >= 0) lines.splice(newDynamicIdx, 1);
      if (skeletonIdx >= 0) {
        const newSkeletonIdx = lines.findIndex(l => l.includes('ToolLoadingSkeleton'));
        if (newSkeletonIdx >= 0) lines.splice(newSkeletonIdx, 1);
      }

      // Insertar en orden correcto al inicio
      const firstImport = lines.findIndex(l => l.trim().startsWith('import'));
      const orderedImports = [
        metadataLine,
        dynamicLine,
      ];
      if (skeletonLine) orderedImports.push(skeletonLine);

      lines.splice(firstImport, 0, ...orderedImports);
      return lines.join('\n');
    }

    return null; // Ya está procesado y ordenado
  }

  // Construir nuevo import block
  const dynamicImportBlock = `import dynamic from "next/dynamic";
import { ToolLoadingSkeleton } from "@/components/tool-loading-skeleton";

const ${clientName} = dynamic(() => import("./client"), {
  loading: () => <ToolLoadingSkeleton />,
  ssr: false,
});`;

  // Reemplazar import original y reordenar
  let transformed = content.replace(clientImportRegex, dynamicImportBlock);

  // Reordenar imports: Metadata debe estar primero
  const lines = transformed.split('\n');
  const imports = {
    metadata: -1,
    dynamic: -1,
    skeleton: -1,
    toolLayout: -1,
    content: -1,
  };

  lines.forEach((line, idx) => {
    if (line.includes('import type { Metadata }')) imports.metadata = idx;
    if (line.includes('import dynamic')) imports.dynamic = idx;
    if (line.includes('ToolLoadingSkeleton')) imports.skeleton = idx;
    if (line.includes('ToolPageLayout')) imports.toolLayout = idx;
    if (line.includes('Content } from "@/content/tools"') || line.includes('from "@/content/tools"')) imports.content = idx;
  });

  // Si dynamic está antes de metadata, reordenar
  if (imports.dynamic < imports.metadata && imports.dynamic >= 0) {
    const importLines = [];
    const otherLines = [];

    lines.forEach((line, idx) => {
      if (idx === imports.metadata || idx === imports.dynamic || idx === imports.skeleton || idx === imports.toolLayout || idx === imports.content) {
        importLines.push({ line, type: idx });
      } else {
        otherLines.push(line);
      }
    });

    // Ordenar: metadata, dynamic, skeleton, toolLayout, content
    const ordered = [
      lines[imports.metadata],
      lines[imports.dynamic],
      lines[imports.skeleton],
      lines[imports.toolLayout],
      lines[imports.content],
    ].filter(Boolean);

    // Reconstruir
    const firstImportIdx = Math.min(...Object.values(imports).filter(i => i >= 0));
    const result = [...otherLines];
    result.splice(firstImportIdx, 0, ...ordered);
    transformed = result.join('\n');
  }

  return transformed;
}

function main() {
  console.log('🚀 Añadiendo dynamic imports a herramientas...\n');

  const toolDirs = getAllToolDirs();

  if (toolDirs.length === 0) {
    console.log('✅ Todos los archivos ya están procesados.\n');
    return;
  }

  console.log(`📁 Encontradas ${toolDirs.length} herramientas para procesar:\n`);

  let processed = 0;
  let skipped = 0;

  toolDirs.forEach(dir => {
    const pagePath = join(APP_DIR, dir, 'page.tsx');

    try {
      const content = readFileSync(pagePath, 'utf-8');
      const transformed = transformPageTsx(content);

      if (transformed) {
        writeFileSync(pagePath, transformed, 'utf-8');
        console.log(`  ✅ ${dir}/page.tsx`);
        processed++;
      } else {
        console.log(`  ⏭️  ${dir}/page.tsx (ya procesado)`);
        skipped++;
      }
    } catch (error) {
      console.error(`  ❌ ${dir}/page.tsx - Error: ${error.message}`);
    }
  });

  console.log(`\n✨ Completado:`);
  console.log(`   Procesados: ${processed}`);
  console.log(`   Omitidos:   ${skipped}`);
  console.log(`   Total:      ${toolDirs.length}\n`);
}

main();
