/**
 * Hook para convertir Word (DOC/DOCX) a PDF
 * Usa createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export interface WordToPdfOptions {
  fileName: string;
}

export interface WordToPdfResult extends ProcessingResult {
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
const useWordToPdfBase = createPdfToolHook<WordToPdfOptions, WordToPdfResult>({
  toolId: "word-to-pdf",
  endpoint: "/api/worker/word-to-pdf",
  operationName: "Convirtiendo Word a PDF",

  buildFormData: (file, options) => [
    ['fileName', options?.fileName || '']
  ],

  getFileName: (result, original) =>
    result.fileName || original.replace(/\.(docx?|doc)$/i, ".pdf"),

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
export function useWordToPdf() {
  const hook = useWordToPdfBase();

  return {
    ...hook,
    convert: hook.process,
  };
}