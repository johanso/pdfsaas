import { useState, useCallback, useRef, useEffect, useMemo } from "react";
import { useXhrUpload, UploadStats as BaseUploadStats } from "./useXhrUpload";
import { useDownload } from "./useDownload";
import { useProcessingTimer } from "./useProcessingTimer";
import { gzipSync } from "fflate";
import { notify } from "@/lib/errors/notifications";

// ============================================================================
// TYPES
// ============================================================================

export type ProcessingPhase =
  | "idle"
  | "preparing"
  | "uploading"
  | "processing"
  | "downloading"
  | "complete"
  | "error";

export interface UploadStats extends BaseUploadStats {
  currentFileName: string;
  currentFileSize: number;
}

export interface ProcessingResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  blob?: Blob;
  [key: string]: any;
}

export interface ProgressWeights {
  preparing: number;
  uploading: number;
  processing: number;
  downloading: number;
}

export interface ToolProcessorConfig<TOptions, TResult = ProcessingResult> {
  toolId: string;
  endpoint: string | ((options: TOptions) => string);
  operationName: string;
  prepareFormData: (files: File[], options: TOptions) => Promise<FormData>;
  responseType?: "json" | "blob";
  useGzipCompression?: boolean;
  getResultFileName?: (result: TResult, originalFileName: string) => string;
  progressWeights?: Partial<ProgressWeights>;
  processingSimulationDuration?: number;
  onStart?: () => void;
  onPhaseChange?: (phase: ProcessingPhase) => void;
  onProgress?: (progress: number) => void;
  onSuccess?: (result: TResult) => void;
  onError?: (error: Error) => void;
}

export interface ToolProcessorState<TResult = ProcessingResult> {
  isProcessing: boolean;
  isComplete: boolean;
  phase: ProcessingPhase;
  progress: number;
  operation: string;
  error: Error | null;
  result: TResult | null;
  uploadStats: UploadStats | null;
}

export interface ToolProcessorActions<TOptions, TResult> {
  process: (files: File[], options: TOptions, outputFileName: string) => Promise<TResult | null>;
  cancel: () => void;
  downloadAgain: () => void;
  reset: () => void;
}

export type UseToolProcessorReturn<TOptions, TResult = ProcessingResult> =
  ToolProcessorState<TResult> & ToolProcessorActions<TOptions, TResult>;

// ============================================================================
// HELPERS
// ============================================================================

async function compressFileGzip(file: File): Promise<Blob> {
  const arrayBuffer = await file.arrayBuffer();
  const uint8Array = new Uint8Array(arrayBuffer);
  const compressed = gzipSync(uint8Array, { level: 6 });
  return new Blob([new Uint8Array(compressed)], { type: "application/gzip" });
}

function getOperationMessage(phase: ProcessingPhase, baseName: string): string {
  switch (phase) {
    case "preparing": return "Preparando archivos...";
    case "uploading": return "Subiendo archivos...";
    case "processing": return baseName;
    case "downloading": return "Descargando resultado...";
    case "complete": return "¡Completado!";
    case "error": return "Error en el proceso";
    default: return "";
  }
}

/**
 * Calcular progreso total basado en fase y progreso de fase
 * NOTA: Esta es una función PURA sin dependencias de estado
 */
function calculateWeightedProgress(
  currentPhase: ProcessingPhase,
  subProgress: number,
  weights: ProgressWeights
): number {
  const { preparing, uploading, processing, downloading } = weights;

  switch (currentPhase) {
    case "idle":
      return 0;
    case "preparing":
      return Math.round(subProgress * (preparing / 100));
    case "uploading":
      return Math.round(preparing + subProgress * (uploading / 100));
    case "processing":
      return Math.round(preparing + uploading + subProgress * (processing / 100));
    case "downloading":
      return Math.round(preparing + uploading + processing + subProgress * (downloading / 100));
    case "complete":
      return 100;
    case "error":
      return 0;
    default:
      return 0;
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useToolProcessor<TOptions, TResult = ProcessingResult>(
  config: ToolProcessorConfig<TOptions, TResult>
): UseToolProcessorReturn<TOptions, TResult> {

  // -- State --
  const [state, setState] = useState<ToolProcessorState<TResult>>({
    isProcessing: false,
    isComplete: false,
    phase: "idle",
    progress: 0,
    operation: "",
    error: null,
    result: null,
    uploadStats: null
  });

  // -- Refs --
  const currentFileRef = useRef<{ name: string; size: number } | null>(null);
  const lastDownloadRef = useRef<{ blob: Blob; fileName: string } | null>(null);
  const phaseRef = useRef<ProcessingPhase>("idle");

  // -- Sub-Hooks --
  const uploadHook = useXhrUpload<any>();
  const downloadHook = useDownload();
  const timerHook = useProcessingTimer();

  // -- Config Defaults (memoized) --
  const weights: ProgressWeights = useMemo(() => ({
    preparing: config.progressWeights?.preparing ?? 10,
    uploading: config.progressWeights?.uploading ?? 40,
    processing: config.progressWeights?.processing ?? 40,
    downloading: config.progressWeights?.downloading ?? 10
  }), [
    config.progressWeights?.preparing,
    config.progressWeights?.uploading,
    config.progressWeights?.processing,
    config.progressWeights?.downloading
  ]);

  // -- Helper: Update Phase --
  const setPhase = useCallback((phase: ProcessingPhase) => {
    phaseRef.current = phase;
    const operation = getOperationMessage(phase, config.operationName);
    setState(s => ({
      ...s,
      phase,
      operation,
      isProcessing: !["idle", "complete", "error"].includes(phase),
      isComplete: phase === "complete"
    }));
    config.onPhaseChange?.(phase);
  }, [config.operationName, config.onPhaseChange]);


  // -- Action: Process --
  const process = useCallback(async (
    files: File[],
    options: TOptions,
    outputFileName: string
  ): Promise<TResult | null> => {

    // Reset state for new process
    phaseRef.current = "preparing";
    setState({
      isProcessing: true,
      isComplete: false,
      phase: "preparing",
      progress: 0,
      operation: "Preparando archivos...",
      error: null,
      result: null,
      uploadStats: null
    });

    config.onStart?.();

    try {
      // 1. PREPARING
      if (files.length > 0) {
        currentFileRef.current = { name: files[0].name, size: files[0].size };
        setState(s => ({ 
          ...s, 
          progress: calculateWeightedProgress("preparing", 20, weights) 
        }));
      }

      let formData = await config.prepareFormData(files, options);

      if (config.useGzipCompression) {
        const compressedFormData = new FormData();
        const entries = Array.from(formData.entries()) as [string, FormDataEntryValue][];

        for (const [key, value] of entries) {
          if (value instanceof File) {
            const compressed = await compressFileGzip(value);
            compressedFormData.append(key, compressed, value.name + ".gz");
          } else {
            compressedFormData.append(key, value);
          }
        }
        compressedFormData.append("compressed", "true");
        formData = compressedFormData;
      }

      setState(s => ({ 
        ...s, 
        progress: calculateWeightedProgress("preparing", 100, weights) 
      }));


      // 2. UPLOADING
      setPhase("uploading");

      const endpointUrl = typeof config.endpoint === "function"
        ? config.endpoint(options)
        : config.endpoint;

      const response = await uploadHook.upload(
        endpointUrl,
        formData,
        config.responseType || "json"
      );


      // 3. PROCESSING (simulate if JSON response)
      if (config.responseType !== "blob") {
        setPhase("processing");
        const duration = config.processingSimulationDuration || 500;
        const steps = 10;

        for (let i = 1; i <= steps; i++) {
          await new Promise(r => setTimeout(r, duration / steps));
          setState(s => ({ 
            ...s, 
            progress: calculateWeightedProgress("processing", (i / steps) * 100, weights) 
          }));
        }
      }


      // 4. DOWNLOADING
      setPhase("downloading");

      let finalResult: TResult;
      let downloadBlob: Blob;
      let finalFileName = outputFileName;

      if (config.responseType === "blob") {
        const blobResp = response as unknown as { blob: Blob };
        downloadBlob = blobResp.blob;

        finalResult = {
          success: true,
          blob: downloadBlob,
          fileName: outputFileName
        } as unknown as TResult;

      } else {
        const jsonResp = response as unknown as ProcessingResult;

        if (config.getResultFileName) {
          finalFileName = config.getResultFileName(jsonResp as TResult, outputFileName);
        } else if (jsonResp.fileName) {
          finalFileName = jsonResp.fileName;
        }

        if (jsonResp.fileId) {
          const downloadUrl = `/api/worker/download/${jsonResp.fileId}`;
          downloadBlob = await downloadHook.downloadFromUrl(downloadUrl, finalFileName);
        } else {
          throw new Error("No fileId returned from server");
        }

        finalResult = jsonResp as TResult;
      }

      lastDownloadRef.current = { blob: downloadBlob, fileName: finalFileName };


      // 5. COMPLETE
      setPhase("complete");
      setState(s => ({
        ...s,
        result: finalResult,
        progress: 100
      }));

      config.onSuccess?.(finalResult);
      notify.success("¡Proceso completado!");

      return finalResult;

    } catch (error) {
      const err = error instanceof Error ? error : new Error("Error desconocido");

      // Handle cancellation gracefully
      if (err.message === "Upload Cancelled" || err.message === "Aborted") {
        phaseRef.current = "idle";
        setState({
          isProcessing: false,
          isComplete: false,
          phase: "idle",
          progress: 0,
          operation: "",
          error: null,
          result: null,
          uploadStats: null
        });
        notify.info("Operación cancelada");
        return null;
      }

      setPhase("error");
      setState(s => ({ ...s, error: err }));
      config.onError?.(err);
      notify.error(err.message || "Error al procesar archivo");

      return null;
    }
  }, [config, uploadHook, downloadHook, weights, setPhase]);


  // -- Action: Cancel --
  const cancel = useCallback(() => {
    uploadHook.cancel();
    timerHook.stop();
    phaseRef.current = "idle";

    setState({
      isProcessing: false,
      isComplete: false,
      phase: "idle",
      progress: 0,
      operation: "",
      error: null,
      result: null,
      uploadStats: null
    });
  }, [uploadHook, timerHook]);


  // -- Action: Download Again --
  const downloadAgain = useCallback(() => {
    if (lastDownloadRef.current) {
      const { blob, fileName } = lastDownloadRef.current;
      downloadHook.downloadBlob(blob, fileName);
      notify.success("Descarga iniciada");
    } else if (state.result && (state.result as any).fileId) {
      const res = state.result as any;
      const url = `/api/worker/download/${res.fileId}`;
      downloadHook.downloadFromUrl(url, res.fileName || "document.pdf");
    }
  }, [downloadHook, state.result]);


  // -- Action: Reset --
  const reset = useCallback(() => {
    cancel();
    lastDownloadRef.current = null;
  }, [cancel]);


  // -- Effect: Sync Upload Stats & Progress --
  // FIXED: Removed circular dependency, using refs and proper comparison
  useEffect(() => {
    // Only sync during uploading phase
    if (phaseRef.current !== "uploading") return;

    const newProgress = calculateWeightedProgress("uploading", uploadHook.progress, weights);
    
    // Build new upload stats if available
    const newUploadStats: UploadStats | null = uploadHook.uploadStats 
      ? {
          ...uploadHook.uploadStats,
          currentFileName: currentFileRef.current?.name || "",
          currentFileSize: currentFileRef.current?.size || 0
        }
      : null;

    // Single setState call to avoid multiple re-renders
    setState(s => {
      // Skip update if nothing changed
      const progressChanged = Math.abs(s.progress - newProgress) > 0.5;
      const statsChanged = newUploadStats && (
        s.uploadStats?.bytesUploaded !== newUploadStats.bytesUploaded ||
        s.uploadStats?.speed !== newUploadStats.speed
      );

      if (!progressChanged && !statsChanged) {
        return s; // No change, return same reference
      }

      return {
        ...s,
        progress: newProgress,
        ...(newUploadStats && { uploadStats: newUploadStats })
      };
    });
  }, [uploadHook.progress, uploadHook.uploadStats, weights]);


  return {
    ...state,
    process,
    cancel,
    downloadAgain,
    reset
  };
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "--:--";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  if (mins > 0) {
    return `${mins}m ${secs}s`;
  }
  return `${secs}s`;
}