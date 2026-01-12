/**
 * Hook para convertir Excel (XLS/XLSX) a PDF
 * Usa createPdfToolHook factory
 */

import { createPdfToolHook } from "./factories/createPdfToolHook";
import type { ProcessingResult } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export interface ExcelToPdfOptions {
  fileName: string;
}

export interface ExcelToPdfResult extends ProcessingResult {
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
const useExcelToPdfBase = createPdfToolHook<ExcelToPdfOptions, ExcelToPdfResult>({
  toolId: "excel-to-pdf",
  endpoint: "/api/worker/excel-to-pdf",
  operationName: "Convirtiendo Excel a PDF",

  buildFormData: (file, options) => [
    ['fileName', options?.fileName || '']
  ],

  getFileName: (result, original) =>
    result.fileName || original.replace(/\.(xlsx?|xls)$/i, ".pdf"),

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
export function useExcelToPdf() {
  const hook = useExcelToPdfBase();

  return {
    ...hook,
    convert: hook.process,
  };
}