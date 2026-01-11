/**
 * Hook para extraer páginas de un PDF
 * Soporta extracción como archivos separados o fusionados
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

export type ExtractMode = "separate" | "merge";

export interface ExtractConfig {
  pages: number[];
  merge: boolean;
}

export interface ExtractOptions {
  mode: ExtractMode;
  config: ExtractConfig;
  fileName: string;
  /** Si el resultado será un ZIP (múltiples archivos separados) */
  isZip?: boolean;
}

export interface ExtractResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  extractedPages: number;
  totalPages: number;
  mode: ExtractMode;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useExtractPages() {
  const processor = useToolProcessor<ExtractOptions, ExtractResult>({
    toolId: "extract-pages",
    endpoint: "/api/worker/split-pdf", // Usa el mismo endpoint que split
    operationName: "Extrayendo páginas",
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
      formData.append("mode", "extract");
      formData.append("config", JSON.stringify(options.config));
      
      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  // Mapear fase a formato legacy para compatibilidad con UI
  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  /**
   * Extraer páginas de un PDF
   */
  const extract = useCallback(
    async (file: File, options: ExtractOptions): Promise<ExtractResult | null> => {
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
    extract,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
