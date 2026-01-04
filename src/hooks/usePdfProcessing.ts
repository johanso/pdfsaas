import { useCallback, useMemo } from "react";
import { gzipSync } from "fflate";
import { useProcessingPipeline, ProcessingResult } from "./useProcessingPipeline";

export interface ProcessOptions {
  endpoint: string;
  successMessage?: string;
  errorMessage?: string;
  extension?: string;
  operation?: string;
  compress?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onContinueEditing?: () => void;
  onStartNew?: () => void;
}

// Re-export UploadStats
export type { UploadStats } from "./useProcessingPipeline";

// Internal helper for compression
async function compressFile(file: File): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const compressed = gzipSync(uint8Array, { level: 6 });

  return {
    blob: new Blob([new Uint8Array(compressed)], { type: "application/gzip" }),
    originalSize: file.size,
    compressedSize: compressed.length,
  };
}

export function usePdfProcessing() {
  const pipeline = useProcessingPipeline();
  const { state, cancel, uploadHook, downloadHook } = pipeline;

  const processAndDownload = useCallback(async (
    fileName: string,
    formData: FormData,
    options: ProcessOptions
  ) => {
    const ext = options.extension || "pdf";
    // Full filename for download
    const fullFileName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;
    const useCompression = options.compress !== false;

    // Extract files from formData for the pipeline stats
    const filesToUpload: File[] = [];
    // Helper to extract files from FormData (client-side)
    // Note: iterating formData might not work in all envs if it's not standard, but usually supports entries()
    try {
      const entries = Array.from((formData as any).entries()) as [string, FormDataEntryValue][];
      for (const [key, value] of entries) {
        if (value instanceof File) {
          filesToUpload.push(value);
        }
      }
    } catch (e) {
      console.warn("Could not extract files from formData", e);
    }

    // Start Pipeline
    await pipeline.start({
      files: filesToUpload,
      endpoint: options.endpoint,
      operationName: options.operation || "Procesando archivos",
      createFormData: async () => {
        // ... (existing logic to reconstruct/compress)
        // Since we already parsed to find files, we could reuse, but let's keep logic close to original

        if (!useCompression) {
          return formData;
        }

        const newFormData = new FormData();
        const extractedFiles: { file: File, key: string }[] = [];

        // Re-iterate
        const entries = Array.from((formData as any).entries()) as [string, FormDataEntryValue][];
        for (const [key, value] of entries) {
          if (value instanceof File) {
            extractedFiles.push({ file: value, key });
          } else {
            newFormData.append(key, value);
          }
        }

        // Compress files
        for (const { file, key } of extractedFiles) {
          const { blob } = await compressFile(file);
          newFormData.append(key, blob, file.name + ".gz");
        }

        newFormData.append("compressed", "true");
        return newFormData;
      }
    });

    // Callbacks
    options.onSuccess?.();

  }, [pipeline]);

  // Derived State Logic
  const progress = useMemo(() => {
    if (state.phase === "idle") return 0;
    if (state.phase === "complete") return 100;

    // Preparing (Compression): 0-15%
    if (state.phase === "preparing") return 10;

    // Uploading: 15-90%
    if (state.phase === "uploading") {
      const p = uploadHook.progress;
      // If p=0 -> 15
      // If p=100 -> 90
      // 15 + (p * 0.75)
      return 15 + (p * 0.75);
    }

    // Processing / Downloading: 90-100%
    if (state.phase === "processing" || state.phase === "downloading") {
      // Simple simulation or just stay at 90 until complete
      return 95;
    }

    return state.progress;
  }, [state.phase, state.progress, uploadHook.progress]);

  const phase = useMemo((): "idle" | "preparing" | "compressing" | "uploading" | "processing" | "downloading" | "ready" | "complete" | "error" => {
    // Map pipeline phase to UI phase expected by ProcessingScreen
    if (state.phase === "preparing") return "compressing"; // Reuse 'compressing' as 'preparing'
    if (state.phase === "uploading") return "uploading";
    if (state.phase === "processing") return "processing";
    if (state.phase === "downloading") return "processing"; // UI usually shows processing until download starts
    if (state.phase === "complete") return "ready";
    return "idle";
  }, [state.phase]);

  // Handle Legacy Return Interface
  const handleDownloadAgain = useCallback(() => {
    if (state.result && state.result.fileId) {
      const url = `/api/worker/download/${state.result.fileId}`;
      downloadHook.downloadFromUrl(url, state.result.fileName || "download.pdf");
    }
  }, [state.result, downloadHook]);

  return {
    isProcessing: state.isProcessing,
    progress,
    isComplete: state.phase === "complete",
    fileName: state.result?.fileName || "",
    operation: state.operation,
    phase, // mapped phase
    uploadStats: state.uploadStats,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing: (cb?: () => void) => {
      cancel();
      cb?.();
    },
    handleStartNew: (cb?: () => void) => {
      cancel();
      cb?.();
    },
    cancelProcess: cancel,
    lastResponse: state.result
  };
}
