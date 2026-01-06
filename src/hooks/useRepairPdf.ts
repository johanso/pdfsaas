import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type RepairMode = "auto" | "aggressive" | "linearize";

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

export interface RepairOptions {
  mode: RepairMode;
  fileName: string;
}

export interface RepairResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  resultSize: number;
  mode: RepairMode;
  repairActions: string[];
  warnings: string[];
  fullyRepaired: boolean;
}

export interface RepairCheckResult {
  success: boolean;
  fileName: string;
  status: "ok" | "damaged" | "encrypted" | "invalid";
  issues: string[];
  canRepair: boolean;
  recommendation: string;
}

// Re-exports para compatibilidad
export { formatBytes, formatTime } from "./core/useToolProcessor";
export type { UploadStats };

// ============================================================================
// HOOK
// ============================================================================

export function useRepairPdf() {
  const processor = useToolProcessor<RepairOptions, RepairResult>({
    toolId: "repair-pdf",
    endpoint: "/api/worker/repair-pdf",
    operationName: "Reparando documento...",
    useGzipCompression: true,
    responseType: "json",

    prepareFormData: async (files, options) => {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("mode", options.mode);
      return formData;
    },

    getResultFileName: (result, original) =>
      result.fileName || original.replace(".pdf", "-repaired.pdf"),

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
    repair: (file: File, options: RepairOptions) =>
      processor.process([file], options, options.fileName),

    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: processor.reset,
    cancelOperation: processor.cancel,
  };
}
