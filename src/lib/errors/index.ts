/**
 * Sistema de Manejo de Errores
 * 
 * Exporta todos los módulos del sistema de errores para uso centralizado.
 * 
 * @example
 * ```ts
 * import { 
 *   AppError, 
 *   createError, 
 *   ErrorCodes,
 *   logger,
 *   retry,
 *   notify 
 * } from "@/lib/errors";
 * ```
 */

// Error types y clases
export {
  AppError,
  ErrorCodes,
  ErrorMessages,
  createError,
  type ErrorCode,
  type ErrorCategory,
  type ErrorSeverity,
  type AppErrorOptions,
} from "./error-types";

// Logger
export {
  logger,
  Logger,
  type LogEntry,
  type LogLevel,
  type LoggerConfig,
} from "./logger";

// Retry
export {
  retry,
  retryNetwork,
  retryProcessing,
  retryQuick,
  retryWithFallback,
  retryBatch,
  type RetryOptions,
  type RetryResult,
  type BatchRetryResult,
} from "./retry";

// Notifications
export {
  notify,
  pdfNotify,
  notificationManager,
  NOTIFICATION_ICONS,
  NOTIFICATION_COLORS,
  type Notification,
  type NotificationOptions,
  type NotificationAction,
  type NotificationType,
} from "./notifications";
