/**
 * Hook para convertir HTML/URL a PDF
 * Soporta archivos HTML locales o URLs remotas
 */

import { useCallback } from "react";
import {
  useToolProcessor,
  type ProcessingResult
} from "./core/useToolProcessor";
import { mapProcessorPhaseToLegacy} from "./core/phase-mapper";

// ============================================================================
// TYPES
// ============================================================================

export type HtmlInputMode = "file" | "url";

export interface ViewportConfig {
  width: number;
  height: number;
}

export interface MarginsConfig {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface HtmlToPdfOptions {
  mode: HtmlInputMode;
  file?: File;
  url?: string;
  viewport: ViewportConfig;
  margins: MarginsConfig;
  fileName: string;
}

export interface HtmlToPdfResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize?: number;
  resultSize: number;
  sourceType: HtmlInputMode;
  viewport: ViewportConfig;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats } from "./core/useToolProcessor";

// ============================================================================
// HOOK
// ============================================================================

export function useHtmlToPdf() {
  const processor = useToolProcessor<HtmlToPdfOptions, HtmlToPdfResult>({
    toolId: "html-to-pdf",
    endpoint: "/api/worker/html-to-pdf",
    operationName: "Convirtiendo HTML a PDF",
    useGzipCompression: false,
    responseType: "json",

    progressWeights: {
      preparing: 5,
      uploading: 20,
      processing: 65,
      downloading: 10,
    },

    prepareFormData: async (files, options) => {
      const formData = new FormData();
      
      if (options.mode === "file" && options.file) {
        formData.append("file", options.file);
        formData.append("isUrl", "false");
      } else if (options.mode === "url" && options.url) {
        formData.append("url", options.url);
        formData.append("isUrl", "true");
      }
      
      formData.append("viewport", JSON.stringify(options.viewport));
      formData.append("margins", JSON.stringify(options.margins));
      formData.append("fileName", options.fileName);
      
      return formData;
    },

    getResultFileName: (result, original) => result.fileName || original,
  });

  const legacyPhase = mapProcessorPhaseToLegacy(processor.phase);

  /**
   * Convertir HTML o URL a PDF
   */
  const convert = useCallback(
    async (options: HtmlToPdfOptions): Promise<HtmlToPdfResult | null> => {
      const fileName = options.fileName.endsWith(".pdf") 
        ? options.fileName 
        : `${options.fileName}.pdf`;
      
      // Si es un archivo, lo pasamos; si no, array vacío
      const files = options.file ? [options.file] : [];
      
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
    convert,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
