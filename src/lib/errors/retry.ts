/**
 * Sistema de Retry con Backoff Exponencial
 * 
 * Proporciona:
 * - Reintentos automáticos con backoff exponencial
 * - Jitter para evitar thundering herd
 * - Condiciones personalizables para retry
 * - Hooks para tracking de progreso
 * - Soporte para cancelación
 */

import { AppError, createError, ErrorCodes, ErrorCode } from "./error-types";
import { logger } from "./logger";

// ============================================================================
// TYPES
// ============================================================================

export interface RetryOptions {
  /** Número máximo de reintentos (default: 3) */
  maxRetries: number;
  /** Delay base en ms (default: 1000) */
  baseDelay: number;
  /** Delay máximo en ms (default: 30000) */
  maxDelay: number;
  /** Factor multiplicador para backoff (default: 2) */
  backoffFactor: number;
  /** Agregar jitter aleatorio (default: true) */
  jitter: boolean;
  /** Función para determinar si se debe reintentar */
  shouldRetry?: (error: AppError, attempt: number) => boolean;
  /** Callback en cada reintento */
  onRetry?: (error: AppError, attempt: number, delay: number) => void;
  /** Signal para cancelación */
  signal?: AbortSignal;
  /** Timeout por intento en ms (default: 60000) */
  timeout?: number;
  /** Identificador para logging */
  operationId?: string;
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: AppError;
  attempts: number;
  totalTime: number;
}

// ============================================================================
// DEFAULT OPTIONS
// ============================================================================

const DEFAULT_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 30000,
  backoffFactor: 2,
  jitter: true,
  timeout: 60000,
};

// ============================================================================
// RETRY FUNCTIONS
// ============================================================================

/**
 * Calcula el delay para el próximo reintento
 */
function calculateDelay(
  attempt: number,
  options: RetryOptions
): number {
  // Backoff exponencial: baseDelay * (factor ^ attempt)
  let delay = options.baseDelay * Math.pow(options.backoffFactor, attempt);
  
  // Limitar al máximo
  delay = Math.min(delay, options.maxDelay);
  
  // Agregar jitter (±25%)
  if (options.jitter) {
    const jitterRange = delay * 0.25;
    delay = delay - jitterRange + Math.random() * jitterRange * 2;
  }
  
  return Math.round(delay);
}

/**
 * Verifica si un error es reintentable por defecto
 */
function isRetryableByDefault(error: AppError): boolean {
  // Los errores marcados explícitamente como no reintentables
  if (!error.retryable) return false;
  
  // Códigos que nunca se reintentan
  const nonRetryableCodes: ErrorCode[] = [
    ErrorCodes.FILE_TOO_LARGE,
    ErrorCodes.FILE_INVALID_TYPE,
    ErrorCodes.FILE_PROTECTED,
    ErrorCodes.PROCESSING_CANCELLED,
    ErrorCodes.VALIDATION_REQUIRED,
    ErrorCodes.VALIDATION_FORMAT,
    ErrorCodes.CLIENT_BROWSER_UNSUPPORTED,
  ];
  
  if (nonRetryableCodes.includes(error.code)) return false;
  
  return true;
}

/**
 * Espera un tiempo determinado (con soporte para cancelación)
 */
function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    
    const timeout = setTimeout(resolve, ms);
    
    signal?.addEventListener("abort", () => {
      clearTimeout(timeout);
      reject(new DOMException("Aborted", "AbortError"));
    });
  });
}

/**
 * Envuelve una función con timeout
 */
async function withTimeout<T>(
  fn: () => Promise<T>,
  timeoutMs: number,
  signal?: AbortSignal
): Promise<T> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }
    
    const timeout = setTimeout(() => {
      reject(createError.networkTimeout({ timeoutMs }));
    }, timeoutMs);
    
    const cleanup = () => clearTimeout(timeout);
    
    signal?.addEventListener("abort", () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    });
    
    fn()
      .then((result) => {
        cleanup();
        resolve(result);
      })
      .catch((error) => {
        cleanup();
        reject(error);
      });
  });
}

// ============================================================================
// MAIN RETRY FUNCTION
// ============================================================================

/**
 * Ejecuta una función con reintentos automáticos
 * 
 * @example
 * ```ts
 * const result = await retry(
 *   () => uploadFile(file),
 *   {
 *     maxRetries: 3,
 *     onRetry: (error, attempt) => {
 *       toast.info(`Reintentando (${attempt}/3)...`);
 *     }
 *   }
 * );
 * ```
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  const opts: RetryOptions = { ...DEFAULT_OPTIONS, ...options };
  const startTime = Date.now();
  let lastError: AppError | undefined;
  
  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      // Verificar cancelación
      if (opts.signal?.aborted) {
        throw createError.processingCancelled();
      }
      
      // Ejecutar con timeout si está configurado
      const result = opts.timeout
        ? await withTimeout(fn, opts.timeout, opts.signal)
        : await fn();
      
      // Éxito
      const totalTime = Date.now() - startTime;
      
      if (attempt > 0) {
        logger.info("Retry succeeded", {
          operationId: opts.operationId,
          attempt,
          totalTime,
        });
      }
      
      return {
        success: true,
        data: result,
        attempts: attempt + 1,
        totalTime,
      };
      
    } catch (error) {
      // Convertir a AppError
      lastError = createError.fromUnknown(error, {
        attempt,
        operationId: opts.operationId,
      });
      
      // Verificar si fue cancelado
      if (error instanceof DOMException && error.name === "AbortError") {
        lastError = createError.processingCancelled();
        break;
      }
      
      // Verificar si se puede reintentar
      const shouldRetry = opts.shouldRetry
        ? opts.shouldRetry(lastError, attempt)
        : isRetryableByDefault(lastError);
      
      // Si es el último intento o no se puede reintentar, salir
      if (attempt >= opts.maxRetries || !shouldRetry) {
        logger.warn("Retry exhausted or not retryable", {
          operationId: opts.operationId,
          attempt,
          maxRetries: opts.maxRetries,
          shouldRetry,
          errorCode: lastError.code,
        });
        break;
      }
      
      // Calcular delay y esperar
      const delay = calculateDelay(attempt, opts);
      
      logger.info("Retrying operation", {
        operationId: opts.operationId,
        attempt: attempt + 1,
        maxRetries: opts.maxRetries,
        delay,
        errorCode: lastError.code,
      });
      
      // Callback de retry
      opts.onRetry?.(lastError, attempt + 1, delay);
      
      // Esperar antes del siguiente intento
      try {
        await sleep(delay, opts.signal);
      } catch {
        // Cancelado durante el sleep
        lastError = createError.processingCancelled();
        break;
      }
    }
  }
  
  // Falló después de todos los reintentos
  const totalTime = Date.now() - startTime;
  
  logger.error("Operation failed after retries", lastError, {
    operationId: opts.operationId,
    attempts: opts.maxRetries + 1,
    totalTime,
  });
  
  return {
    success: false,
    error: lastError,
    attempts: opts.maxRetries + 1,
    totalTime,
  };
}

// ============================================================================
// SPECIALIZED RETRY FUNCTIONS
// ============================================================================

/**
 * Retry específico para operaciones de red (fetch, upload, etc.)
 */
export async function retryNetwork<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  return retry(fn, {
    maxRetries: 3,
    baseDelay: 1000,
    backoffFactor: 2,
    timeout: 60000,
    shouldRetry: (error) => {
      // Solo reintentar errores de red y servidor
      return ["network", "server", "timeout"].includes(error.category);
    },
    ...options,
  });
}

/**
 * Retry específico para procesamiento de archivos
 */
export async function retryProcessing<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  return retry(fn, {
    maxRetries: 2,
    baseDelay: 2000,
    timeout: 120000, // 2 minutos para procesamiento
    shouldRetry: (error) => {
      // Solo reintentar errores transitorios, no de validación
      return error.retryable && error.category !== "validation";
    },
    ...options,
  });
}

/**
 * Retry rápido para operaciones ligeras
 */
export async function retryQuick<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  return retry(fn, {
    maxRetries: 2,
    baseDelay: 500,
    maxDelay: 2000,
    timeout: 10000,
    ...options,
  });
}

// ============================================================================
// RETRY WITH FALLBACK
// ============================================================================

/**
 * Ejecuta una función con reintentos y fallback
 * 
 * @example
 * ```ts
 * const result = await retryWithFallback(
 *   () => processOnServer(file),
 *   () => processLocally(file),
 *   { maxRetries: 2 }
 * );
 * ```
 */
export async function retryWithFallback<T>(
  primary: () => Promise<T>,
  fallback: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<RetryResult<T>> {
  // Intentar primario
  const primaryResult = await retry(primary, {
    ...options,
    operationId: options.operationId ? `${options.operationId}-primary` : "primary",
  });
  
  if (primaryResult.success) {
    return primaryResult;
  }
  
  // Intentar fallback
  logger.info("Primary failed, trying fallback", {
    operationId: options.operationId,
    primaryError: primaryResult.error?.code,
  });
  
  const fallbackResult = await retry(fallback, {
    ...options,
    maxRetries: options.maxRetries ?? 1, // Menos reintentos para fallback
    operationId: options.operationId ? `${options.operationId}-fallback` : "fallback",
  });
  
  return {
    ...fallbackResult,
    attempts: primaryResult.attempts + fallbackResult.attempts,
    totalTime: primaryResult.totalTime + fallbackResult.totalTime,
  };
}

// ============================================================================
// BATCH RETRY
// ============================================================================

export interface BatchRetryResult<T> {
  successful: Array<{ index: number; data: T }>;
  failed: Array<{ index: number; error: AppError }>;
  totalAttempts: number;
}

/**
 * Ejecuta múltiples operaciones con reintentos individuales
 */
export async function retryBatch<T, I>(
  items: I[],
  fn: (item: I, index: number) => Promise<T>,
  options: Partial<RetryOptions> & {
    /** Máximo de operaciones en paralelo */
    concurrency?: number;
    /** Continuar aunque algunas fallen */
    continueOnError?: boolean;
  } = {}
): Promise<BatchRetryResult<T>> {
  const { concurrency = 3, continueOnError = true, ...retryOpts } = options;
  
  const results: BatchRetryResult<T> = {
    successful: [],
    failed: [],
    totalAttempts: 0,
  };
  
  // Procesar en chunks para controlar concurrencia
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    
    const promises = chunk.map(async (item, chunkIndex) => {
      const index = i + chunkIndex;
      const result = await retry(
        () => fn(item, index),
        {
          ...retryOpts,
          operationId: `${retryOpts.operationId || "batch"}-${index}`,
        }
      );
      
      results.totalAttempts += result.attempts;
      
      if (result.success) {
        results.successful.push({ index, data: result.data! });
      } else {
        results.failed.push({ index, error: result.error! });
        if (!continueOnError) {
          throw result.error;
        }
      }
    });
    
    await Promise.all(promises);
  }
  
  return results;
}
