/**
 * Hook para organizar páginas de PDF
 * Soporta reordenamiento, rotación, duplicación, eliminación y páginas en blanco
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

export interface OrganizeInstruction {
  fileIndex: number;
  originalIndex: number;
  rotation: number;
  isBlank?: boolean;
}

export interface OrganizeOptions {
  instructions: OrganizeInstruction[];
  fileName: string;
}

export interface OrganizeResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  totalPages: number;
  blankPages: number;
  filesUsed: number;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useOrganizePdf() {
  const processor = useToolProcessor<OrganizeOptions, OrganizeResult>({
    toolId: "organize-pdf",
    endpoint: "/api/worker/organize-pdf",
    operationName: "Organizando PDF",
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
      
      // Agregar archivos únicos con índice
      files.forEach((file, index) => {
        formData.append(`file-${index}`, file);
      });
      
      formData.append("instructions", JSON.stringify(options.instructions));
      
      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  // Mapear fase a formato legacy para compatibilidad con UI
  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  /**
   * Organizar páginas de uno o múltiples PDFs
   */
  const organize = useCallback(
    async (files: File[], options: OrganizeOptions): Promise<OrganizeResult | null> => {
      const fileName = options.fileName.endsWith(".pdf") 
        ? options.fileName 
        : `${options.fileName}.pdf`;
      
      return processor.process(files, options, fileName);
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
    organize,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
