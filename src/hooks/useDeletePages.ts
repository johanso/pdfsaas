/**
 * Hook para eliminar páginas de un PDF
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

export interface PageInstruction {
  originalIndex: number;
  rotation: number;
}

export interface DeletePagesOptions {
  /** Instrucciones para las páginas que se MANTIENEN (no las eliminadas) */
  pageInstructions: PageInstruction[];
  fileName: string;
}

export interface DeletePagesResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  deletedPages: number;
  remainingPages: number;
  totalOriginalPages: number;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useDeletePages() {
  const processor = useToolProcessor<DeletePagesOptions, DeletePagesResult>({
    toolId: "delete-pages",
    endpoint: "/api/worker/delete-pages",
    operationName: "Eliminando páginas",
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
      formData.append("pageInstructions", JSON.stringify(options.pageInstructions));
      
      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  // Mapear fase a formato legacy para compatibilidad con UI
  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  /**
   * Eliminar páginas de un PDF
   */
  const deletePages = useCallback(
    async (file: File, options: DeletePagesOptions): Promise<DeletePagesResult | null> => {
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
    deletePages,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
