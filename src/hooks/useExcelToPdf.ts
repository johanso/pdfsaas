/**
 * Hook para convertir Excel (XLS/XLSX) a PDF
 */

import { useCallback } from "react";
import {
  useToolProcessor,
  type ProcessingResult
} from "./core/useToolProcessor";
import { mapProcessorPhaseToLegacy } from "./core/phase-mapper";

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
  sheets?: number;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useExcelToPdf() {
  const processor = useToolProcessor<ExcelToPdfOptions, ExcelToPdfResult>({
    toolId: "excel-to-pdf",
    endpoint: "/api/worker/excel-to-pdf",
    operationName: "Convirtiendo Excel a PDF",
    useGzipCompression: true,
    responseType: "json",

    progressWeights: {
      preparing: 5,
      uploading: 35,
      processing: 50,
      downloading: 10,
    },

    prepareFormData: async (files, options) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("fileName", options.fileName);
      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  const convert = useCallback(
    async (file: File, options: ExcelToPdfOptions): Promise<ExcelToPdfResult | null> => {
      const fileName = options.fileName.endsWith(".pdf") 
        ? options.fileName 
        : `${options.fileName}.pdf`;
      
      return processor.process([file], options, fileName);
    },
    [processor]
  );

  return {
    // Estado
    isProcessing: processor.isProcessing,
    isComplete: processor.isComplete,
    progress: processor.progress,
    phase: legacyPhase,
    operation: processor.operation,
    uploadStats: processor.uploadStats,
    result: processor.result,

    // Acciones
    convert,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}