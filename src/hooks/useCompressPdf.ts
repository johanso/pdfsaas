import { useCallback, useMemo } from "react";
import { gzipSync } from "fflate";
import { useProcessingPipeline, ProcessingResult } from "./useProcessingPipeline";

// ============================================================================
// TYPES
// ============================================================================

export type CompressionPreset = "extreme" | "recommended" | "low";
export type CompressionMode = "simple" | "advanced";
export type ProcessingPhase = "idle" | "preparing" | "compressing" | "uploading" | "processing" | "downloading" | "ready" | "error";

export interface CompressionResult extends ProcessingResult {
  fileId: string;
  fileName: string;
  originalSize: number;
  compressedSize: number;
  reduction: number;
  saved: number;
}

// Re-export UploadStats for compatibility
export type { UploadStats } from "./useProcessingPipeline";

// ============================================================================
// HELPERS
// ============================================================================

export { formatBytes, formatTime } from "@/lib/format";

async function compressFileGzip(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const compressed = gzipSync(uint8Array, { level: 6 });

  return {
    blob: new Blob([new Uint8Array(compressed)], { type: "application/gzip" }),
    originalSize: file.size,
    compressedSize: compressed.length,
  };
}

// ============================================================================
// HOOK
// ============================================================================

export function useCompressPdf() {
  const pipeline = useProcessingPipeline();

  const compress = useCallback(async (
    file: File,
    options: {
      mode: CompressionMode;
      preset?: CompressionPreset;
      dpi?: number;
      imageQuality?: number;
      fileName: string;
      onSuccess?: () => void;
    }
  ) => {

    // Configurar pipeline
    await pipeline.start({
      files: [file],
      endpoint: "/api/worker/compress-pdf",
      operationName: "Comprimiendo PDF",
      createFormData: async (files) => {
        const f = files[0];
        // Custom Logic: Gzip compression before upload
        const { blob: compressedBlob } = await compressFileGzip(f);

        const formData = new FormData();
        formData.append("file", compressedBlob, f.name + ".gz");
        formData.append("compressed", "true");
        formData.append("mode", options.mode);

        if (options.mode === "simple" && options.preset) {
          formData.append("preset", options.preset);
        } else {
          formData.append("dpi", String(options.dpi || 120));
          formData.append("imageQuality", String(options.imageQuality || 60));
        }

        return formData;
      }
    });

    options.onSuccess?.();
  }, [pipeline]);

  // Map Pipeline State to UI Requirements
  const { state, cancel, uploadHook, downloadHook } = pipeline;

  const phase = useMemo((): ProcessingPhase => {
    if (state.phase === "idle") return "idle";

    // Map internal pipeline phases to legacy/UI phases
    // "preparing" -> "compressing" (in UI terms for this tool)
    if (state.phase === "preparing") return "compressing";
    if (state.phase === "uploading") {
      // If upload is 100% but still in uploading phase, it means we are waiting for server
      if (uploadHook.progress >= 100) return "processing";
      return "uploading";
    }
    if (state.phase === "processing") return "processing";
    if (state.phase === "downloading") return "processing"; // Keep showing processing while downloading result? Or "processing" -> "ready"?
    // Actually legacy UI uses "ready" only when complete.
    // Legacy `useCompressPdf` had: idle, compressing, uploading, processing, ready.
    if (state.phase === "complete") return "ready";
    if (state.phase === "error") return "idle"; // Or error state

    return "processing";
  }, [state.phase, uploadHook.progress]);

  // Weighted Progress Calculation
  const progress = useMemo(() => {
    if (state.phase === "idle") return 0;
    if (state.phase === "complete") return 100;

    // 0-10%: Preparing (Gzip)
    if (state.phase === "preparing") return 5;

    // 10-30%: Uploading
    if (state.phase === "uploading") {
      const p = uploadHook.progress;
      if (p >= 100) return 30; // Max out at 30 when upload done, start processing
      return 10 + (p * 0.2);
    }

    // 30-100%: Processing + Downloading
    // Since pipeline combines these...
    // If waiting for XHR (Phase=Uploading, Progress=100)... we can simulate 30->80
    // But we don't have a timer running for that in the pipeline yet (as discussed).
    // The pipeline uses `timerHook` during `downloading` (Phase 4).

    if (state.phase === "downloading") {
      // 90-100% during download
      return 90 + (state.progress * 0.1);
    }

    return state.progress;
  }, [state.phase, state.progress, uploadHook.progress]);

  const operation = useMemo(() => {
    if (phase === "compressing") return "Preparando archivo...";
    if (phase === "uploading") return "Subiendo archivo...";
    if (phase === "processing") return "Procesando en servidor...";
    if (phase === "ready") return "¡Completado!";
    return state.operation;
  }, [phase, state.operation]);

  const result = state.result as CompressionResult | null;

  return {
    isProcessing: state.isProcessing,
    isComplete: state.phase === "complete",
    progress,
    phase,
    operation,
    uploadStats: state.uploadStats, // This comes from pipeline which gets it from useXhrUpload
    result,
    compress,
    handleDownloadAgain: () => {
      if (result && result.fileId) {
        const url = `/api/worker/download/${result.fileId}`;
        downloadHook.downloadFromUrl(url, result.fileName);
      }
    },
    handleStartNew: () => cancel(), // Reset pipeline
    cancelOperation: cancel
  };
}