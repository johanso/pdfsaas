/**
 * Hook para convertir PowerPoint (PPT/PPTX) a PDF
 * Usa createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export interface PowerPointToPdfOptions {
  fileName: string;
}

export interface PowerPointToPdfResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  originalFormat: string;
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
const usePowerPointToPdfBase = createPdfToolHook<PowerPointToPdfOptions, PowerPointToPdfResult>({
  toolId: "powerpoint-to-pdf",
  endpoint: "/api/worker/ppt-to-pdf",
  operationName: "Convirtiendo PowerPoint a PDF",

  buildFormData: (file, options) => [
    ['fileName', options?.fileName || ''] 
  ],

  getFileName: (result, original) =>
    result.fileName || original.replace(/\.(pptx?|ppt)$/i, ".pdf"),

  progressWeights: {
    preparing: 5,
    uploading: 35,
    processing: 50,
    downloading: 10,
  },
});

/**
 * Hook público con compatibilidad
 */
export function usePowerPointToPdf() {
  const hook = usePowerPointToPdfBase();

  return {
    ...hook,
    convert: hook.process,
  };
}