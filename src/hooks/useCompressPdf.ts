import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type CompressionPreset = "extreme" | "recommended" | "low";
export type CompressionMode = "simple" | "advanced";

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

export interface CompressOptions {
  mode: CompressionMode;
  preset?: CompressionPreset;
  dpi?: number;
  imageQuality?: number;
  fileName: string;
}

export interface CompressResult extends ProcessingResult {
  originalSize: number;
  compressedSize: number;
  reduction: number;
  saved: number;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats };

// ============================================================================
// HOOK
// ============================================================================

export function useCompressPdf() {
  const processor = useToolProcessor<CompressOptions, CompressResult>({
    toolId: "compress-pdf",
    endpoint: "/api/worker/compress-pdf",
    operationName: "Comprimiendo PDF",
    useGzipCompression: true,
    responseType: "json",

    prepareFormData: async (files, options) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("mode", options.mode);

      if (options.mode === "simple" && options.preset) {
        formData.append("preset", options.preset);
      } else {
        formData.append("dpi", String(options.dpi || 120));
        formData.append("imageQuality", String(options.imageQuality || 60));
      }

      return formData;
    },

    getResultFileName: (result, original) =>
      result.fileName || original.replace(".pdf", "-comprimido.pdf"),

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
    compress: (file: File, options: CompressOptions) =>
      processor.process([file], options, options.fileName),

    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}