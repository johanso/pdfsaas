/**
 * Hook para convertir PDFs a escala de grises
 * Refactorizado usando createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type GrayscaleContrast = "light" | "normal" | "high" | "extreme";

export interface GrayscaleOptions {
  contrast: GrayscaleContrast;
  fileName: string;
}

export interface GrayscaleResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  savings: number;
  contrast: GrayscaleContrast;
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
const useGrayscalePdfBase = createPdfToolHook<GrayscaleOptions, GrayscaleResult>({
  toolId: "grayscale-pdf",
  endpoint: "/api/worker/grayscale-pdf",
  operationName: "Convirtiendo a escala de grises",

  buildFormData: (file, options) => [
    ["contrast", options.contrast],
    ["fileName", options?.fileName || ''],
  ],

  getFileName: (result, original) =>
    result.fileName || original.replace(".pdf", "-grayscale.pdf"),

  progressWeights: {
    preparing: 5,
    uploading: 35,
    processing: 50,
    downloading: 10,
  },
});

/**
 * Hook público con compatibilidad legacy
 * Mantiene el método 'convert' usado por componentes existentes
 */
export function useGrayscalePdf() {
  const hook = useGrayscalePdfBase();

  return {
    ...hook,
    // Alias para compatibilidad con código existente
    convert: hook.process,
  };
}
