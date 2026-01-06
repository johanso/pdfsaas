import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type FlattenMode = "all" | "forms" | "annotations";

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

export interface FlattenOptions {
  mode: FlattenMode;
  compress: boolean;
  fileName: string;
}

export interface FlattenResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  reduction: number;
  mode: FlattenMode;
  compressed: boolean;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats };

// ============================================================================
// HOOK
// ============================================================================

export function useFlattenPdf() {
  const processor = useToolProcessor<FlattenOptions, FlattenResult>({
    toolId: "flatten-pdf",
    endpoint: "/api/worker/flatten-pdf",
    operationName: "Aplanando documento...",
    useGzipCompression: true,
    responseType: "json",

    prepareFormData: async (files, options) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("mode", options.mode);
      formData.append("compress", String(options.compress));
      return formData;
    },

    getResultFileName: (result, original) =>
      result.fileName || original.replace(".pdf", "-aplanado.pdf"),

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
    flatten: (file: File, options: FlattenOptions) =>
      processor.process([file], options, options.fileName),

    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
