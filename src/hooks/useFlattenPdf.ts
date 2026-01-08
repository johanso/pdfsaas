/**
 * Hook para aplanar PDFs (convertir formularios y anotaciones en contenido estático)
 * Refactorizado usando createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type FlattenMode = "all" | "forms" | "annotations";

export interface FlattenOptions {
  mode: FlattenMode;
  compress: boolean;
  fileName: string;
}

export interface FlattenResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  reduction: number;
  mode: FlattenMode;
  compressed: boolean;
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
const useFlattenPdfBase = createPdfToolHook<FlattenOptions, FlattenResult>({
  toolId: "flatten-pdf",
  endpoint: "/api/worker/flatten-pdf",
  operationName: "Aplanando documento...",

  buildFormData: (file, options) => [
    ["mode", options.mode],
    ["compress", String(options.compress)],
  ],

  getFileName: (result, original) =>
    result.fileName || original.replace(".pdf", "-aplanado.pdf"),

  progressWeights: {
    preparing: 5,
    uploading: 35,
    processing: 50,
    downloading: 10,
  },
});

/**
 * Hook público con compatibilidad legacy
 * Mantiene el método 'flatten' usado por componentes existentes
 */
export function useFlattenPdf() {
  const hook = useFlattenPdfBase();

  return {
    ...hook,
    // Alias para compatibilidad con código existente
    flatten: hook.process,
  };
}
