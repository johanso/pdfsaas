import { useRef } from "react";
import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export interface ProcessOptions {
  endpoint: string;
  extension?: string;
  operation?: string;
  compress?: boolean;
  successMessage?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onContinueEditing?: () => void;
  onStartNew?: () => void;
}

// Re-export para compatibilidad
export type { UploadStats };

// ============================================================================
// HOOK
// ============================================================================

export function usePdfProcessing() {
  // Ref para guardar opciones dinámicas (endpoint cambia por herramienta)
  const optionsRef = useRef<ProcessOptions | null>(null);

  const processor = useToolProcessor<FormData, ProcessingResult>({
    toolId: "pdf-processing",
    // Endpoint dinámico basado en opciones
    endpoint: () => optionsRef.current?.endpoint || "",
    operationName: "Procesando",
    useGzipCompression: true,
    responseType: "json",

    prepareFormData: async (_, formData) => formData,

    progressWeights: {
      preparing: 10,
      uploading: 45,
      processing: 35,
      downloading: 10,
    },

    onSuccess: () => {
      optionsRef.current?.onSuccess?.();
    },

    onError: (err) => {
      optionsRef.current?.onError?.(err);
    },
  });

  /**
   * Procesar y descargar PDF
   * @param fileName - Nombre del archivo de salida (sin extensión)
   * @param formData - FormData con los datos a enviar
   * @param options - Opciones de procesamiento
   */
  const processAndDownload = async (
    fileName: string,
    formData: FormData,
    options: ProcessOptions
  ) => {
    // Guardar opciones en ref para que el hook las use
    optionsRef.current = options;

    const ext = options.extension || "pdf";
    const fullFileName = fileName.endsWith(`.${ext}`) ? fileName : `${fileName}.${ext}`;

    const result = await processor.process([], formData, fullFileName);

    return result;
  };

  return {
    // Estado
    isProcessing: processor.isProcessing,
    progress: processor.progress,
    isComplete: processor.isComplete,
    fileName: processor.result?.fileName || "",
    operation: processor.operation,
    phase: processor.phase,
    uploadStats: processor.uploadStats,
    lastResponse: processor.result,

    // Acciones
    processAndDownload,
    handleDownloadAgain: processor.downloadAgain,
    handleContinueEditing: (cb?: () => void) => {
      processor.reset();
      cb?.();
    },
    handleStartNew: (cb?: () => void) => {
      processor.reset();
      cb?.();
    },
    cancelProcess: processor.cancel,
  };
}