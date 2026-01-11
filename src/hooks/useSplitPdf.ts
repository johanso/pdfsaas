/**
 * Hook para dividir/separar PDFs
 * Soporta división por rangos o por cantidad fija de páginas
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

export type SplitMode = "ranges" | "fixed";

export interface SplitRangesConfig {
  ranges: number[];
}

export interface SplitFixedConfig {
  size: number;
}

export interface SplitOptions {
  mode: SplitMode;
  config: SplitRangesConfig | SplitFixedConfig;
  fileName: string;
  /** Si el resultado será un ZIP (múltiples archivos) */
  isZip?: boolean;
}

export interface SplitResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  outputFiles: number;
  totalPages: number;
  mode: SplitMode;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useSplitPdf() {
  const processor = useToolProcessor<SplitOptions, SplitResult>({
    toolId: "split-pdf",
    endpoint: "/api/worker/split-pdf",
    operationName: "Dividiendo PDF",
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
      formData.append("mode", options.mode);
      formData.append("config", JSON.stringify(options.config));
      
      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  // Mapear fase a formato legacy para compatibilidad con UI
  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  /**
   * Dividir un archivo PDF
   */
  const split = useCallback(
    async (file: File, options: SplitOptions): Promise<SplitResult | null> => {
      const ext = options.isZip ? "zip" : "pdf";
      const fileName = options.fileName.endsWith(`.${ext}`) 
        ? options.fileName 
        : `${options.fileName}.${ext}`;
      
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
    split,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
