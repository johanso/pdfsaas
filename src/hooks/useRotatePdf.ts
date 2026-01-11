/**
 * Hook para rotar páginas de PDF
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

export interface RotateOptions {
  pageInstructions: PageInstruction[];
  fileName: string;
}

export interface RotateResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  rotatedPages: number;
  totalPages: number;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useRotatePdf() {
  const processor = useToolProcessor<RotateOptions, RotateResult>({
    toolId: "rotate-pdf",
    endpoint: "/api/worker/rotate-pdf",
    operationName: "Rotando PDF",
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
      formData.append("fileName", options.fileName);

      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  // Mapear fase a formato legacy para compatibilidad con UI
  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  /**
   * Rotar páginas de un PDF
   */
  const rotate = useCallback(
    async (file: File, options: RotateOptions): Promise<RotateResult | null> => {
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
    rotate,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
