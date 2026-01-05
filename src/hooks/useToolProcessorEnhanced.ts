/**
 * Ejemplo de integración del sistema de errores con useToolProcessor
 * 
 * Este archivo muestra cómo integrar el nuevo sistema de manejo de errores
 * con el hook useToolProcessor existente.
 */

import { useState, useCallback, useRef } from "react";
import { useErrorHandler } from "./useErrorHandler";
import { AppError, createError, ErrorCodes } from "@/lib/errors/error-types";
import { logger } from "@/lib/errors/logger";
import { pdfNotify } from "@/lib/errors/notifications";
import { retryNetwork } from "@/lib/errors/retry";

// ============================================================================
// TYPES (basados en el sistema existente)
// ============================================================================

export type ProcessingStatus = "idle" | "uploading" | "processing" | "completed" | "error";

export interface ProcessedFile {
  id: string;
  originalName: string;
  processedUrl?: string;
  status: ProcessingStatus;
  progress: number;
  error?: AppError;
  metadata?: Record<string, unknown>;
}

export interface UseToolProcessorOptions {
  toolId: string;
  endpoint: string;
  maxFileSize?: number;
  allowedTypes?: string[];
  maxRetries?: number;
}

// ============================================================================
// HOOK MEJORADO
// ============================================================================

export function useToolProcessorEnhanced(options: UseToolProcessorOptions) {
  const {
    toolId,
    endpoint,
    maxFileSize = 150 * 1024 * 1024, // 150MB
    allowedTypes = ["application/pdf"],
    maxRetries = 3,
  } = options;

  // Estados
  const [files, setFiles] = useState<ProcessedFile[]>([]);
  const [overallStatus, setOverallStatus] = useState<ProcessingStatus>("idle");
  const abortControllerRef = useRef<AbortController | null>(null);

  // Sistema de errores integrado
  const {
    errorState,
    execute,
    executeNetwork,
    handleError,
    clearError,
  } = useErrorHandler({
    toolId,
    showNotifications: true,
    retryOptions: { maxRetries },
    onError: (error) => {
      setOverallStatus("error");
    },
    onRecovery: () => {
      setOverallStatus("idle");
    },
  });

  /**
   * Valida un archivo antes de procesarlo
   */
  const validateFile = useCallback(
    (file: File): AppError | null => {
      // Validar tamaño
      if (file.size > maxFileSize) {
        return createError.fileTooLarge(file.name, file.size, maxFileSize);
      }

      // Validar tipo
      if (!allowedTypes.includes(file.type)) {
        return createError.fileInvalidType(file.name, file.type, allowedTypes);
      }

      return null;
    },
    [maxFileSize, allowedTypes]
  );

  /**
   * Actualiza el estado de un archivo específico
   */
  const updateFileState = useCallback(
    (fileId: string, updates: Partial<ProcessedFile>) => {
      setFiles((prev) =>
        prev.map((f) => (f.id === fileId ? { ...f, ...updates } : f))
      );
    },
    []
  );

  /**
   * Sube un archivo al servidor con retry
   */
  const uploadFile = useCallback(
    async (file: File, fileId: string): Promise<string | null> => {
      const formData = new FormData();
      formData.append("file", file);

      updateFileState(fileId, { status: "uploading", progress: 0 });

      const result = await executeNetwork(
        async () => {
          const response = await fetch(endpoint, {
            method: "POST",
            body: formData,
            signal: abortControllerRef.current?.signal,
          });

          if (!response.ok) {
            // Clasificar error del servidor
            if (response.status === 413) {
              throw createError.fileTooLarge(file.name, file.size, maxFileSize);
            }
            if (response.status === 429) {
              throw createError.rateLimited();
            }
            if (response.status >= 500) {
              throw createError.serverError(response.status);
            }
            throw createError.processingFailed("upload");
          }

          const data = await response.json();
          return data.url as string;
        },
        {
          operationName: "upload",
          fileName: file.name,
          showLoading: false, // Manejamos el estado nosotros
        }
      );

      if (result) {
        updateFileState(fileId, {
          status: "completed",
          progress: 100,
          processedUrl: result,
        });
      } else {
        updateFileState(fileId, {
          status: "error",
          error: errorState.error || undefined,
        });
      }

      return result;
    },
    [endpoint, maxFileSize, executeNetwork, updateFileState, errorState.error]
  );

  /**
   * Procesa un archivo completo (validación + upload)
   */
  const processFile = useCallback(
    async (file: File): Promise<ProcessedFile | null> => {
      const fileId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Agregar a la lista
      const newFile: ProcessedFile = {
        id: fileId,
        originalName: file.name,
        status: "idle",
        progress: 0,
      };
      setFiles((prev) => [...prev, newFile]);

      // Validar
      const validationError = validateFile(file);
      if (validationError) {
        logger.warn(`[${toolId}] Validation failed`, {
          fileName: file.name,
          errorCode: validationError.code,
        });

        // Notificación específica
        if (validationError.code === ErrorCodes.FILE_TOO_LARGE) {
          pdfNotify.fileTooLarge(file.name, file.size, maxFileSize);
        } else if (validationError.code === ErrorCodes.FILE_INVALID_TYPE) {
          pdfNotify.invalidFileType(file.name, allowedTypes);
        }

        updateFileState(fileId, {
          status: "error",
          error: validationError,
        });

        return null;
      }

      // Procesar
      setOverallStatus("processing");
      pdfNotify.processingStart(file.name, toolId);

      const url = await uploadFile(file, fileId);

      if (url) {
        pdfNotify.processingComplete(file.name);
        return {
          ...newFile,
          status: "completed",
          progress: 100,
          processedUrl: url,
        };
      }

      return null;
    },
    [toolId, validateFile, uploadFile, maxFileSize, allowedTypes, updateFileState]
  );

  /**
   * Procesa múltiples archivos
   */
  const processFiles = useCallback(
    async (fileList: File[]): Promise<void> => {
      clearError();
      setOverallStatus("processing");
      abortControllerRef.current = new AbortController();

      let successful = 0;
      let failed = 0;

      for (const file of fileList) {
        // Verificar cancelación
        if (abortControllerRef.current.signal.aborted) {
          break;
        }

        const result = await processFile(file);
        if (result) {
          successful++;
        } else {
          failed++;
        }
      }

      // Notificación de batch
      if (fileList.length > 1) {
        pdfNotify.batchComplete(fileList.length, successful, failed);
      }

      setOverallStatus(failed === fileList.length ? "error" : "completed");
    },
    [processFile, clearError]
  );

  /**
   * Cancela el procesamiento actual
   */
  const cancel = useCallback(() => {
    abortControllerRef.current?.abort();
    setOverallStatus("idle");
    setFiles((prev) =>
      prev.map((f) =>
        f.status === "uploading" || f.status === "processing"
          ? { ...f, status: "error" as ProcessingStatus, error: createError.processingCancelled() }
          : f
      )
    );
  }, []);

  /**
   * Reintenta un archivo fallido
   */
  const retryFile = useCallback(
    async (fileId: string, file: File): Promise<void> => {
      const existingFile = files.find((f) => f.id === fileId);
      if (!existingFile || existingFile.status !== "error") return;

      // Limpiar error del archivo
      updateFileState(fileId, {
        status: "idle",
        error: undefined,
        progress: 0,
      });

      await uploadFile(file, fileId);
    },
    [files, uploadFile, updateFileState]
  );

  /**
   * Limpia todos los archivos
   */
  const reset = useCallback(() => {
    cancel();
    setFiles([]);
    setOverallStatus("idle");
    clearError();
  }, [cancel, clearError]);

  return {
    // Estado
    files,
    overallStatus,
    errorState,
    isProcessing: overallStatus === "processing" || overallStatus === "uploading",
    hasError: errorState.hasError,

    // Acciones
    processFile,
    processFiles,
    cancel,
    retryFile,
    reset,
    clearError,

    // Utilidades
    validateFile,
  };
}

// ============================================================================
// EJEMPLO DE USO EN UN COMPONENTE
// ============================================================================

/*
import { useToolProcessorEnhanced } from "@/hooks/useToolProcessorEnhanced";
import { ToastContainer } from "@/components/ui/toast";

function CompressPdfTool() {
  const {
    files,
    overallStatus,
    errorState,
    isProcessing,
    processFiles,
    cancel,
    retryFile,
    reset,
  } = useToolProcessorEnhanced({
    toolId: "compress-pdf",
    endpoint: `${process.env.NEXT_PUBLIC_PDF_WORKER_URL}/compress`,
    maxFileSize: 150 * 1024 * 1024,
    maxRetries: 3,
  });

  const handleDrop = async (acceptedFiles: File[]) => {
    await processFiles(acceptedFiles);
  };

  return (
    <div>
      <ToastContainer position="bottom-right" />
      
      <DropZone onDrop={handleDrop} disabled={isProcessing} />
      
      {files.map((file) => (
        <FileCard
          key={file.id}
          file={file}
          onRetry={file.error ? () => retryFile(file.id, originalFile) : undefined}
        />
      ))}
      
      {isProcessing && (
        <button onClick={cancel}>Cancelar</button>
      )}
      
      {errorState.isRetrying && (
        <div>Reintentando ({errorState.retryCount}/3)...</div>
      )}
    </div>
  );
}
*/
