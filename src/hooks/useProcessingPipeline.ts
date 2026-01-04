import { useState, useCallback, useRef } from "react";
import {
  useXhrUpload,
  UploadStats as BaseUploadStats,
} from "./core/useXhrUpload";
import { useProcessingTimer } from "./core/useProcessingTimer";
import { useDownload } from "./core/useDownload";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

// Defines the stats expected by the UI (ProcessingScreen)
export interface UploadStats extends BaseUploadStats {
  currentFile: number;
  totalFiles: number;
  currentFileName: string;
  currentFileSize: number;
  compressedSize: number;
  compressionRatio: number;
  phase: "compressing" | "uploading";
}

// Standard result shape for all PDF tools
export interface ProcessingResult {
  success: boolean;
  fileId: string;
  fileName: string;
  blob?: Blob;
  [key: string]: any;
}

export type PipelinePhase =
  | "idle"
  | "preparing"
  | "uploading"
  | "processing"
  | "downloading"
  | "complete"
  | "error";

export interface PipelineState {
  isProcessing: boolean;
  phase: PipelinePhase;
  progress: number;
  operation: string;
  error: Error | null;
  result: ProcessingResult | null;
  uploadStats: UploadStats | null;
}

export interface StartOptions {
  files: File[];
  operationName: string; // e.g. "Comprimiendo PDF"
  endpoint: string; // e.g. /api/worker/compress-pdf
  createFormData?: (files: File[]) => Promise<FormData>;
  responseType?: "json" | "blob";
}

export function useProcessingPipeline() {
  const [state, setState] = useState<PipelineState>({
    isProcessing: false,
    phase: "idle",
    progress: 0,
    operation: "",
    error: null,
    result: null,
    uploadStats: null,
  });

  const [fileInfo, setFileInfo] = useState<{
    count: number;
    currentName: string;
    totalSize: number;
  }>({ count: 1, currentName: "", totalSize: 0 });

  // Compose Sub-Hooks
  const uploadHook = useXhrUpload<ProcessingResult>();
  const timerHook = useProcessingTimer();
  const downloadHook = useDownload();

  const abortControllerRef = useRef<AbortController | null>(null);

  const start = useCallback(
    async (options: StartOptions) => {
      const {
        endpoint,
        operationName,
        createFormData,
        files,
        responseType = "json",
      } = options;

      // Reset & Calculate Info
      const totalSize = files.reduce((acc, f) => acc + f.size, 0);
      setFileInfo({
        count: files.length,
        currentName: files[0]?.name || "archivo.pdf",
        totalSize,
      });

      // Initial State
      setState({
        isProcessing: true,
        phase: "preparing",
        progress: 0,
        operation: "Preparando...",
        error: null,
        result: null,
        uploadStats: {
          currentFile: 1,
          totalFiles: files.length,
          currentFileName: files[0]?.name || "archivo.pdf",
          currentFileSize: files[0]?.size || 0,
          compressedSize: 0,
          compressionRatio: 0,
          bytesUploaded: 0,
          totalBytes: totalSize,
          speed: 0,
          timeRemaining: 0,
          phase: "compressing",
        },
      });

      try {
        // 1. PREPARE
        let formData: FormData;
        if (createFormData) {
          formData = await createFormData(files);
        } else {
          formData = new FormData();
          files.forEach((f) => formData.append("file", f));
        }

        // 2. UPLOAD
        setState((prev) => ({
          ...prev,
          phase: "uploading",
          operation: "Subiendo archivo...",
        }));

        const uploadPromise = uploadHook.upload(
          endpoint,
          formData,
          responseType
        );
        const result = await uploadPromise;

        // 3. DOWNLOAD OR COMPLETE
        // If result is a Blob (responseType="blob"), we are done with processing/downloading conceptually
        if (responseType === "blob" && result.blob) {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            phase: "complete",
            operation: "¡Listo!",
            result: result, // result contains blob
            progress: 100,
          }));
          toast.success("¡Proceso completado!");
          return;
        }

        // Normal JSON flow
        setState((prev) => ({
          ...prev,
          phase: "downloading",
          operation: "Descargando...",
        }));
        timerHook.start({
          duration: 2000,
          startProgress: 90,
          endProgress: 100,
        });

        if (result.fileId) {
          const downloadUrl = `/api/worker/download/${result.fileId}`;
          await downloadHook.downloadFromUrl(
            downloadUrl,
            result.fileName || "document.pdf"
          );
        }

        timerHook.set(100);

        setState((prev) => ({
          ...prev,
          isProcessing: false,
          phase: "complete",
          operation: "¡Listo!",
          result: result,
          progress: 100,
        }));

        toast.success("¡Proceso completado!");
        return result;
      } catch (e: any) {
        if (e.message === "Upload Cancelled" || e.message === "Cancelled") {
          setState((prev) => ({ ...prev, isProcessing: false, phase: "idle" }));
          toast.info("Cancelado");
        } else {
          setState((prev) => ({
            ...prev,
            isProcessing: false,
            phase: "error",
            error: e,
          }));
          toast.error(e.message || "Error desconocido");
        }
        throw e;
      }
    },
    [uploadHook, downloadHook, timerHook]
  );

  const cancel = useCallback(() => {
    uploadHook.cancel();
    timerHook.stop();
    setState((prev) => ({
      ...prev,
      isProcessing: false,
      phase: "idle",
      progress: 0,
    }));
  }, [uploadHook, timerHook]);

  // Derived state
  const activeProgress =
    state.phase === "uploading"
      ? uploadHook.progress
      : state.phase === "processing"
      ? timerHook.progress
      : state.phase === "downloading"
      ? timerHook.progress
      : state.progress;

  // Enrich uploadStats with file info
  const richUploadStats: UploadStats | null = uploadHook.uploadStats
    ? {
        ...uploadHook.uploadStats,
        currentFile: 1, // Simplified for batch
        totalFiles: fileInfo.count,
        currentFileName: fileInfo.currentName,
        currentFileSize: fileInfo.totalSize, // Approx
        compressedSize: 0,
        compressionRatio: 0,
        phase: "uploading",
      }
    : state.uploadStats;

  return {
    start,
    cancel,
    state: {
      ...state,
      progress: activeProgress,
      uploadStats: richUploadStats,
    },
    uploadHook,
    timerHook,
    downloadHook,
  };
}
