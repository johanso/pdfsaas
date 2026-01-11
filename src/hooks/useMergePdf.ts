/**
 * Hook para unir/fusionar múltiples PDFs
 * Usa useToolProcessor directamente porque maneja múltiples archivos
 */

import { useCallback } from "react";
import {
  useToolProcessor,
  type ProcessingResult,
  type UploadStats,
} from "./core/useToolProcessor";
import { mapProcessorPhaseToLegacy, type LegacyPhase } from "./core/phase-mapper";

// ============================================================================
// TYPES
// ============================================================================

export interface MergeOptions {
  fileName: string;
}

export interface MergeResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  filesCount: number;
  totalPages: number;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useMergePdf() {
  const processor = useToolProcessor<MergeOptions, MergeResult>({
    toolId: "merge-pdf",
    endpoint: "/api/worker/merge-pdf",
    operationName: "Uniendo PDFs",
    useGzipCompression: true,
    responseType: "json",

    progressWeights: {
      preparing: 5,
      uploading: 45,
      processing: 40,
      downloading: 10,
    },

    prepareFormData: async (files, options) => {
      const formData = new FormData();
      
      // Agregar todos los archivos
      files.forEach((file) => {
        formData.append("files", file);
      });
      
      formData.append("fileName", options.fileName);
      
      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  // Mapear fase a formato legacy para compatibilidad con UI
  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  /**
   * Fusionar múltiples archivos PDF
   */
  const merge = useCallback(
    async (files: File[], options: MergeOptions): Promise<MergeResult | null> => {
      return processor.process(files, options, options.fileName);
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
    merge,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
