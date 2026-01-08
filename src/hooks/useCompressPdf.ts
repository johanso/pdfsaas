/**
 * Hook para comprimir PDFs
 * Refactorizado usando createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type CompressionPreset = "extreme" | "recommended" | "low";
export type CompressionMode = "simple" | "advanced";

export interface CompressOptions {
  mode: CompressionMode;
  preset?: CompressionPreset;
  dpi?: number;
  imageQuality?: number;
  fileName: string;
}

export interface CompressResult extends ProcessingResult {
  originalSize: number;
  compressedSize: number;
  reduction: number;
  saved: number;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

/**
 * Hook base creado con factory
 */
const useCompressPdfBase = createPdfToolHook<CompressOptions, CompressResult>({
  toolId: "compress-pdf",
  endpoint: "/api/worker/compress-pdf",
  operationName: "Comprimiendo PDF",

  buildFormData: (file, options) => {
    const entries: [string, string][] = [
      ["mode", options.mode],
    ];

    // Agregar campos según el modo
    if (options.mode === "simple" && options.preset) {
      entries.push(["preset", options.preset]);
    } else {
      entries.push(["dpi", String(options.dpi || 120)]);
      entries.push(["imageQuality", String(options.imageQuality || 60)]);
    }

    return entries;
  },

  getFileName: (result, original) =>
    result.fileName || original.replace(".pdf", "-comprimido.pdf"),

  progressWeights: {
    preparing: 5,
    uploading: 35,
    processing: 50,
    downloading: 10,
  },
});

/**
 * Hook público con compatibilidad legacy
 * Mantiene el método 'compress' usado por componentes existentes
 */
export function useCompressPdf() {
  const hook = useCompressPdfBase();

  return {
    ...hook,
    // Alias para compatibilidad con código existente
    compress: hook.process,
  };
}