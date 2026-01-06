import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type GrayscaleContrast = "light" | "normal" | "high" | "extreme";

/** Fase de procesamiento para compatibilidad con UI legacy */
export type ProcessingPhase =
  | "idle"
  | "preparing"
  | "compressing"
  | "uploading"
  | "processing"
  | "downloading"
  | "ready"
  | "error";

export interface GrayscaleOptions {
  contrast: GrayscaleContrast;
  fileName: string;
}

export interface GrayscaleResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  savings: number;
  contrast: GrayscaleContrast;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats };

// ============================================================================
// HOOK
// ============================================================================

export function useGrayscalePdf() {
  const processor = useToolProcessor<GrayscaleOptions, GrayscaleResult>({
    toolId: "grayscale-pdf",
    endpoint: "/api/worker/grayscale-pdf",
    operationName: "Convirtiendo a escala de grises",
    useGzipCompression: true,
    responseType: "json",

    prepareFormData: async (files, options) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("contrast", options.contrast);
      return formData;
    },

    getResultFileName: (result, original) =>
      result.fileName || original.replace(".pdf", "-grayscale.pdf"),

    progressWeights: {
      preparing: 5,
      uploading: 35,
      processing: 50,
      downloading: 10,
    },
  });

  // Mapear fase interna a fase legacy de UI
  const uiPhase: ProcessingPhase = (() => {
    switch (processor.phase) {
      case "preparing":
        return "compressing";
      case "uploading":
        return "uploading";
      case "processing":
        return "processing";
      case "downloading":
        return "processing";
      case "complete":
        return "ready";
      case "error":
        return "error";
      default:
        return "idle";
    }
  })();

  return {
    // Estado
    isProcessing: processor.isProcessing,
    isComplete: processor.isComplete,
    progress: processor.progress,
    phase: uiPhase,
    operation: processor.operation,
    uploadStats: processor.uploadStats,
    result: processor.result,

    // Acciones (API legacy)
    convert: (file: File, options: GrayscaleOptions) =>
      processor.process([file], options, options.fileName),

    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
