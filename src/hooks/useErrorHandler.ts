/**
 * Hook useErrorHandler
 * 
 * Integra el sistema de errores, retry y notificaciones
 * para uso simplificado en los hooks de herramientas PDF.
 * 
 * Proporciona:
 * - Manejo automático de errores con clasificación
 * - Reintentos configurables
 * - Notificaciones contextuales
 * - Logging estructurado
 * - Estado de error para UI
 */

import { useState, useCallback, useRef } from "react";
import { AppError, createError, ErrorCode } from "@/lib/errors/error-types";
import { logger } from "@/lib/errors/logger";
import { retry, retryNetwork, RetryOptions, RetryResult } from "@/lib/errors/retry";
import { notify, pdfNotify } from "@/lib/errors/notifications";

// ============================================================================
// TYPES
// ============================================================================

export interface ErrorState {
  hasError: boolean;
  error: AppError | null;
  isRetrying: boolean;
  retryCount: number;
}

export interface UseErrorHandlerOptions {
  /** ID de la herramienta para logging */
  toolId: string;
  /** Mostrar notificaciones automáticamente */
  showNotifications?: boolean;
  /** Opciones de retry por defecto */
  retryOptions?: Partial<RetryOptions>;
  /** Callback cuando ocurre un error */
  onError?: (error: AppError) => void;
  /** Callback cuando se recupera de un error */
  onRecovery?: () => void;
}

export interface ErrorHandler {
  /** Estado actual del error */
  errorState: ErrorState;
  /** Ejecuta una operación con manejo de errores y retry */
  execute: <T>(
    operation: () => Promise<T>,
    options?: ExecuteOptions
  ) => Promise<T | null>;
  /** Ejecuta una operación de red con retry optimizado */
  executeNetwork: <T>(
    operation: () => Promise<T>,
    options?: ExecuteOptions
  ) => Promise<T | null>;
  /** Maneja un error manualmente */
  handleError: (error: unknown, context?: Record<string, unknown>) => AppError;
  /** Limpia el estado de error */
  clearError: () => void;
  /** Crea un error tipado */
  createError: typeof createError;
}

export interface ExecuteOptions {
  /** Nombre de la operación para logging */
  operationName?: string;
  /** Nombre del archivo (para notificaciones) */
  fileName?: string;
  /** Mostrar notificación de loading */
  showLoading?: boolean;
  /** Mensaje de loading personalizado */
  loadingMessage?: string;
  /** Mostrar notificación de éxito */
  showSuccess?: boolean;
  /** Mensaje de éxito personalizado */
  successMessage?: string;
  /** Opciones de retry específicas */
  retryOptions?: Partial<RetryOptions>;
  /** Signal para cancelación */
  signal?: AbortSignal;
  /** Callback de progreso */
  onProgress?: (progress: number) => void;
}

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialErrorState: ErrorState = {
  hasError: false,
  error: null,
  isRetrying: false,
  retryCount: 0,
};

// ============================================================================
// HOOK IMPLEMENTATION
// ============================================================================

export function useErrorHandler(options: UseErrorHandlerOptions): ErrorHandler {
  const {
    toolId,
    showNotifications = true,
    retryOptions: defaultRetryOptions,
    onError,
    onRecovery,
  } = options;

  const [errorState, setErrorState] = useState<ErrorState>(initialErrorState);
  const notificationIdRef = useRef<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Limpia el estado de error
   */
  const clearError = useCallback(() => {
    setErrorState(initialErrorState);
    if (notificationIdRef.current) {
      notify.dismiss(notificationIdRef.current);
      notificationIdRef.current = null;
    }
    onRecovery?.();
  }, [onRecovery]);

  /**
   * Maneja un error y lo convierte a AppError
   */
  const handleError = useCallback(
    (error: unknown, context?: Record<string, unknown>): AppError => {
      const appError = createError.fromUnknown(error, {
        toolId,
        ...context,
      });

      // Logging
      logger.error(`[${toolId}] Error occurred`, appError, context);

      // Actualizar estado
      setErrorState((prev) => ({
        ...prev,
        hasError: true,
        error: appError,
        isRetrying: false,
      }));

      // Notificación
      if (showNotifications) {
        notificationIdRef.current = notify.fromError(appError);
      }

      // Callback
      onError?.(appError);

      return appError;
    },
    [toolId, showNotifications, onError]
  );

  /**
   * Ejecuta una operación con manejo de errores y retry
   */
  const execute = useCallback(
    async <T>(
      operation: () => Promise<T>,
      execOptions: ExecuteOptions = {}
    ): Promise<T | null> => {
      const {
        operationName = "operation",
        fileName,
        showLoading = true,
        loadingMessage,
        showSuccess = true,
        successMessage,
        retryOptions: execRetryOptions,
        signal,
        onProgress,
      } = execOptions;

      // Limpiar error previo
      clearError();

      // Crear AbortController si no se proporciona signal
      if (!signal) {
        abortControllerRef.current = new AbortController();
      }
      const effectiveSignal = signal || abortControllerRef.current?.signal;

      // Mostrar loading
      if (showNotifications && showLoading) {
        const loadingMsg = loadingMessage || 
          (fileName ? `Procesando ${fileName}...` : "Procesando...");
        notificationIdRef.current = fileName
          ? pdfNotify.processingStart(fileName, operationName)
          : notify.loading(loadingMsg);
      }

      // Logging inicio
      logger.toolOperation(toolId, "start", { fileName });
      const startTime = Date.now();

      // Configurar retry
      const mergedRetryOptions: Partial<RetryOptions> = {
        ...defaultRetryOptions,
        ...execRetryOptions,
        signal: effectiveSignal,
        operationId: `${toolId}-${operationName}`,
        onRetry: (error, attempt, delay) => {
          setErrorState((prev) => ({
            ...prev,
            isRetrying: true,
            retryCount: attempt,
          }));

          if (showNotifications && notificationIdRef.current) {
            notify.retrying(
              notificationIdRef.current,
              attempt,
              mergedRetryOptions.maxRetries || 3,
              delay
            );
          }

          logger.info(`[${toolId}] Retrying`, {
            attempt,
            delay,
            errorCode: error.code,
          });
        },
      };

      try {
        // Ejecutar con retry
        const result = await retry(operation, mergedRetryOptions);

        if (result.success && result.data !== undefined) {
          // Éxito
          const duration = Date.now() - startTime;
          logger.toolOperation(toolId, "success", { fileName, duration });

          if (showNotifications && notificationIdRef.current) {
            if (showSuccess) {
              const successMsg = successMessage ||
                (fileName ? `${fileName} procesado correctamente` : "Completado");
              notify.complete(notificationIdRef.current, successMsg, "success");
            } else {
              notify.dismiss(notificationIdRef.current);
            }
          }

          setErrorState(initialErrorState);
          return result.data;
        } else {
          // Fallo después de reintentos
          const appError = result.error || createError.processingFailed(operationName);
          
          setErrorState({
            hasError: true,
            error: appError,
            isRetrying: false,
            retryCount: result.attempts,
          });

          if (showNotifications) {
            if (notificationIdRef.current) {
              notify.dismiss(notificationIdRef.current);
            }
            notificationIdRef.current = fileName
              ? pdfNotify.processingError(fileName, appError)
              : notify.fromError(appError);
          }

          logger.toolOperation(toolId, "error", {
            fileName,
            duration: result.totalTime,
            error: appError,
          });

          onError?.(appError);
          return null;
        }
      } catch (error) {
        // Error inesperado (no debería llegar aquí normalmente)
        const appError = handleError(error, { operationName, fileName });
        return null;
      }
    },
    [toolId, showNotifications, defaultRetryOptions, clearError, handleError, onError]
  );

  /**
   * Ejecuta una operación de red con configuración optimizada
   */
  const executeNetwork = useCallback(
    async <T>(
      operation: () => Promise<T>,
      execOptions: ExecuteOptions = {}
    ): Promise<T | null> => {
      return execute(operation, {
        ...execOptions,
        retryOptions: {
          maxRetries: 3,
          baseDelay: 1000,
          timeout: 60000,
          ...execOptions.retryOptions,
        },
      });
    },
    [execute]
  );

  return {
    errorState,
    execute,
    executeNetwork,
    handleError,
    clearError,
    createError,
  };
}

// ============================================================================
// HOOK SIMPLIFICADO PARA ERRORES SIN RETRY
// ============================================================================

export interface SimpleErrorHandler {
  error: AppError | null;
  hasError: boolean;
  setError: (error: unknown, context?: Record<string, unknown>) => void;
  clearError: () => void;
}

export function useSimpleErrorHandler(toolId: string): SimpleErrorHandler {
  const [error, setErrorState] = useState<AppError | null>(null);

  const setError = useCallback(
    (err: unknown, context?: Record<string, unknown>) => {
      const appError = createError.fromUnknown(err, { toolId, ...context });
      logger.error(`[${toolId}] Error`, appError, context);
      setErrorState(appError);
      notify.fromError(appError);
    },
    [toolId]
  );

  const clearError = useCallback(() => {
    setErrorState(null);
  }, []);

  return {
    error,
    hasError: error !== null,
    setError,
    clearError,
  };
}

// ============================================================================
// EXPORTS
// ============================================================================

export type { AppError, ErrorCode };
