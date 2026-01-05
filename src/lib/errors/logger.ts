/**
 * Sistema de Logging Estructurado
 * 
 * Proporciona:
 * - Logging por niveles (debug, info, warn, error)
 * - Contexto automático (timestamp, sessionId, etc.)
 * - Almacenamiento local para debugging
 * - Envío a servicios externos (preparado para Sentry, LogRocket, etc.)
 * - Sanitización de datos sensibles
 */

import { AppError, ErrorCode, ErrorCategory, ErrorSeverity } from "./error-types";

// ============================================================================
// TYPES
// ============================================================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogEntry {
  id: string;
  level: LogLevel;
  message: string;
  timestamp: string;
  sessionId: string;
  context?: Record<string, unknown>;
  error?: {
    code?: ErrorCode;
    category?: ErrorCategory;
    severity?: ErrorSeverity;
    stack?: string;
    originalMessage?: string;
  };
  metadata?: {
    url?: string;
    userAgent?: string;
    toolId?: string;
    fileName?: string;
    fileSize?: number;
    duration?: number;
  };
}

export interface LoggerConfig {
  /** Nivel mínimo para loguear (default: "info" en prod, "debug" en dev) */
  minLevel: LogLevel;
  /** Máximo de entries a mantener en memoria */
  maxEntries: number;
  /** Si se debe enviar a consola */
  console: boolean;
  /** Si se debe almacenar en localStorage */
  localStorage: boolean;
  /** Key para localStorage */
  localStorageKey: string;
  /** Callback para envío a servicio externo */
  externalHandler?: (entry: LogEntry) => void;
  /** Campos sensibles a sanitizar */
  sensitiveFields: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const DEFAULT_CONFIG: LoggerConfig = {
  minLevel: typeof window !== "undefined" && window.location.hostname === "localhost" ? "debug" : "info",
  maxEntries: 100,
  console: true,
  localStorage: true,
  localStorageKey: "pdf_tools_logs",
  sensitiveFields: ["password", "token", "apiKey", "secret", "authorization"],
};

const CONSOLE_STYLES = {
  debug: "color: #6B7280; font-weight: normal;",
  info: "color: #3B82F6; font-weight: normal;",
  warn: "color: #F59E0B; font-weight: bold;",
  error: "color: #EF4444; font-weight: bold;",
};

// ============================================================================
// LOGGER CLASS
// ============================================================================

class Logger {
  private config: LoggerConfig;
  private entries: LogEntry[] = [];
  private sessionId: string;
  private startTime: number;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    
    // Cargar entries anteriores de localStorage si está habilitado
    if (typeof window !== "undefined" && this.config.localStorage) {
      this.loadFromStorage();
    }
  }

  private generateSessionId(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 9)}`;
  }

  private shouldLog(level: LogLevel): boolean {
    return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
  }

  private sanitize(obj: unknown): unknown {
    if (obj === null || obj === undefined) return obj;
    
    if (typeof obj === "string") return obj;
    
    if (Array.isArray(obj)) {
      return obj.map((item) => this.sanitize(item));
    }
    
    if (typeof obj === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (this.config.sensitiveFields.some((field) => 
          key.toLowerCase().includes(field.toLowerCase())
        )) {
          sanitized[key] = "[REDACTED]";
        } else {
          sanitized[key] = this.sanitize(value);
        }
      }
      return sanitized;
    }
    
    return obj;
  }

  private createEntry(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: AppError | Error
  ): LogEntry {
    const entry: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      level,
      message,
      timestamp: new Date().toISOString(),
      sessionId: this.sessionId,
    };

    if (context) {
      entry.context = this.sanitize(context) as Record<string, unknown>;
    }

    if (error) {
      if (error instanceof AppError) {
        entry.error = {
          code: error.code,
          category: error.category,
          severity: error.severity,
          stack: error.stack,
          originalMessage: error.originalError instanceof Error 
            ? error.originalError.message 
            : undefined,
        };
      } else {
        entry.error = {
          stack: error.stack,
          originalMessage: error.message,
        };
      }
    }

    // Metadata del navegador
    if (typeof window !== "undefined") {
      entry.metadata = {
        url: window.location.pathname,
        userAgent: navigator.userAgent,
      };
    }

    return entry;
  }

  private store(entry: LogEntry): void {
    // Agregar a memoria
    this.entries.push(entry);
    
    // Limitar cantidad
    if (this.entries.length > this.config.maxEntries) {
      this.entries = this.entries.slice(-this.config.maxEntries);
    }

    // Guardar en localStorage
    if (typeof window !== "undefined" && this.config.localStorage) {
      try {
        const stored = this.entries.slice(-50); // Últimos 50 en storage
        localStorage.setItem(this.config.localStorageKey, JSON.stringify(stored));
      } catch {
        // localStorage puede fallar (quota, private mode, etc.)
      }
    }

    // Enviar a handler externo
    if (this.config.externalHandler) {
      try {
        this.config.externalHandler(entry);
      } catch (e) {
        console.error("[Logger] External handler failed:", e);
      }
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.config.localStorageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Filtrar entries muy antiguos (más de 24h)
          const dayAgo = Date.now() - 24 * 60 * 60 * 1000;
          this.entries = parsed.filter((e) => {
            const entryTime = new Date(e.timestamp).getTime();
            return entryTime > dayAgo;
          });
        }
      }
    } catch {
      // Ignorar errores de parsing
    }
  }

  private logToConsole(entry: LogEntry): void {
    if (!this.config.console || typeof console === "undefined") return;

    const style = CONSOLE_STYLES[entry.level];
    const prefix = `[${entry.level.toUpperCase()}]`;
    const time = new Date(entry.timestamp).toLocaleTimeString();

    if (entry.error) {
      console.groupCollapsed(`%c${prefix} ${time} - ${entry.message}`, style);
      if (entry.context) console.log("Context:", entry.context);
      if (entry.error.code) console.log("Error Code:", entry.error.code);
      if (entry.error.stack) console.log("Stack:", entry.error.stack);
      console.groupEnd();
    } else if (entry.context && Object.keys(entry.context).length > 0) {
      console.log(`%c${prefix} ${time} - ${entry.message}`, style, entry.context);
    } else {
      console.log(`%c${prefix} ${time} - ${entry.message}`, style);
    }
  }

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  debug(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("debug")) return;
    const entry = this.createEntry("debug", message, context);
    this.logToConsole(entry);
    this.store(entry);
  }

  info(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("info")) return;
    const entry = this.createEntry("info", message, context);
    this.logToConsole(entry);
    this.store(entry);
  }

  warn(message: string, context?: Record<string, unknown>): void {
    if (!this.shouldLog("warn")) return;
    const entry = this.createEntry("warn", message, context);
    this.logToConsole(entry);
    this.store(entry);
  }

  error(message: string, error?: AppError | Error | unknown, context?: Record<string, unknown>): void {
    if (!this.shouldLog("error")) return;
    
    const appError = error instanceof AppError 
      ? error 
      : error instanceof Error 
        ? error 
        : undefined;
    
    const entry = this.createEntry("error", message, context, appError);
    this.logToConsole(entry);
    this.store(entry);
  }

  /**
   * Log específico para operaciones de herramientas PDF
   */
  toolOperation(
    toolId: string,
    operation: "start" | "progress" | "success" | "error",
    data?: {
      fileName?: string;
      fileSize?: number;
      progress?: number;
      duration?: number;
      error?: AppError | Error;
    }
  ): void {
    const level: LogLevel = operation === "error" ? "error" : "info";
    const message = `[${toolId}] ${operation}`;
    
    const context: Record<string, unknown> = { toolId, operation };
    if (data?.fileName) context.fileName = data.fileName;
    if (data?.fileSize) context.fileSize = data.fileSize;
    if (data?.progress !== undefined) context.progress = data.progress;
    if (data?.duration !== undefined) context.duration = data.duration;

    if (operation === "error" && data?.error) {
      this.error(message, data.error, context);
    } else {
      if (level === "info") {
        this.info(message, context);
      }
    }
  }

  /**
   * Obtiene todos los logs de la sesión actual
   */
  getSessionLogs(): LogEntry[] {
    return this.entries.filter((e) => e.sessionId === this.sessionId);
  }

  /**
   * Obtiene todos los logs almacenados
   */
  getAllLogs(): LogEntry[] {
    return [...this.entries];
  }

  /**
   * Obtiene logs filtrados por nivel
   */
  getLogsByLevel(level: LogLevel): LogEntry[] {
    return this.entries.filter((e) => e.level === level);
  }

  /**
   * Obtiene logs de errores con código específico
   */
  getLogsByErrorCode(code: ErrorCode): LogEntry[] {
    return this.entries.filter((e) => e.error?.code === code);
  }

  /**
   * Exporta logs como JSON para debugging
   */
  exportLogs(): string {
    return JSON.stringify({
      sessionId: this.sessionId,
      exportedAt: new Date().toISOString(),
      sessionDuration: Date.now() - this.startTime,
      totalEntries: this.entries.length,
      entries: this.entries,
    }, null, 2);
  }

  /**
   * Limpia todos los logs
   */
  clear(): void {
    this.entries = [];
    if (typeof window !== "undefined" && this.config.localStorage) {
      localStorage.removeItem(this.config.localStorageKey);
    }
  }

  /**
   * Actualiza la configuración
   */
  configure(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Obtiene el ID de sesión actual
   */
  getSessionId(): string {
    return this.sessionId;
  }
}

// ============================================================================
// SINGLETON EXPORT
// ============================================================================

export const logger = new Logger();

// Re-export para crear loggers personalizados
export { Logger };
