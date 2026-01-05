/**
 * Sistema de Notificaciones Mejorado
 * 
 * Proporciona:
 * - Toasts contextuales con iconos y acciones
 * - Notificaciones de progreso con retry
 * - Alertas persistentes para errores críticos
 * - Integración con el sistema de errores
 */

import { AppError, ErrorCategory, ErrorSeverity, ErrorCodes } from "./error-types";

// ============================================================================
// TYPES
// ============================================================================

export type NotificationType = "success" | "error" | "warning" | "info" | "loading";

export interface NotificationAction {
  label: string;
  onClick: () => void;
  variant?: "primary" | "secondary" | "destructive";
}

export interface NotificationOptions {
  /** Título de la notificación */
  title?: string;
  /** Descripción/mensaje */
  description: string;
  /** Tipo de notificación */
  type: NotificationType;
  /** Duración en ms (0 = permanente) */
  duration?: number;
  /** ID único (para actualizaciones) */
  id?: string;
  /** Acciones disponibles */
  actions?: NotificationAction[];
  /** Se puede cerrar manualmente */
  dismissible?: boolean;
  /** Progreso (0-100) */
  progress?: number;
  /** Metadata adicional */
  meta?: {
    errorCode?: string;
    category?: ErrorCategory;
    retryable?: boolean;
    retryCount?: number;
    fileName?: string;
  };
}

export interface Notification extends NotificationOptions {
  id: string;
  createdAt: number;
}

// ============================================================================
// NOTIFICATION PRESETS
// ============================================================================

/**
 * Configuraciones predeterminadas por tipo
 */
const DURATION_PRESETS: Record<NotificationType, number> = {
  success: 4000,
  error: 8000,
  warning: 6000,
  info: 5000,
  loading: 0, // Permanente hasta completar
};

/**
 * Iconos por tipo (nombres de Lucide icons)
 */
export const NOTIFICATION_ICONS: Record<NotificationType, string> = {
  success: "CheckCircle",
  error: "XCircle",
  warning: "AlertTriangle",
  info: "Info",
  loading: "Loader2",
};

/**
 * Colores por tipo (clases Tailwind)
 */
export const NOTIFICATION_COLORS: Record<NotificationType, {
  bg: string;
  border: string;
  icon: string;
  text: string;
}> = {
  success: {
    bg: "bg-green-50 dark:bg-green-950",
    border: "border-green-200 dark:border-green-800",
    icon: "text-green-600 dark:text-green-400",
    text: "text-green-800 dark:text-green-200",
  },
  error: {
    bg: "bg-red-50 dark:bg-red-950",
    border: "border-red-200 dark:border-red-800",
    icon: "text-red-600 dark:text-red-400",
    text: "text-red-800 dark:text-red-200",
  },
  warning: {
    bg: "bg-amber-50 dark:bg-amber-950",
    border: "border-amber-200 dark:border-amber-800",
    icon: "text-amber-600 dark:text-amber-400",
    text: "text-amber-800 dark:text-amber-200",
  },
  info: {
    bg: "bg-blue-50 dark:bg-blue-950",
    border: "border-blue-200 dark:border-blue-800",
    icon: "text-blue-600 dark:text-blue-400",
    text: "text-blue-800 dark:text-blue-200",
  },
  loading: {
    bg: "bg-slate-50 dark:bg-slate-900",
    border: "border-slate-200 dark:border-slate-700",
    icon: "text-slate-600 dark:text-slate-400",
    text: "text-slate-800 dark:text-slate-200",
  },
};

// ============================================================================
// NOTIFICATION MANAGER
// ============================================================================

type NotificationListener = (notifications: Notification[]) => void;

class NotificationManager {
  private notifications: Map<string, Notification> = new Map();
  private listeners: Set<NotificationListener> = new Set();
  private timeouts: Map<string, NodeJS.Timeout> = new Map();

  /**
   * Genera un ID único
   */
  private generateId(): string {
    return `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Notifica a los listeners
   */
  private emit(): void {
    const notifs = Array.from(this.notifications.values())
      .sort((a, b) => b.createdAt - a.createdAt);
    this.listeners.forEach((listener) => listener(notifs));
  }

  /**
   * Programa la eliminación automática
   */
  private scheduleRemoval(id: string, duration: number): void {
    if (duration <= 0) return;
    
    // Limpiar timeout anterior si existe
    const existing = this.timeouts.get(id);
    if (existing) clearTimeout(existing);
    
    const timeout = setTimeout(() => {
      this.dismiss(id);
    }, duration);
    
    this.timeouts.set(id, timeout);
  }

  /**
   * Suscribirse a cambios
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    // Emitir estado actual
    listener(Array.from(this.notifications.values()));
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Muestra una notificación
   */
  show(options: NotificationOptions): string {
    const id = options.id || this.generateId();
    const duration = options.duration ?? DURATION_PRESETS[options.type];
    
    const notification: Notification = {
      ...options,
      id,
      duration,
      dismissible: options.dismissible ?? true,
      createdAt: Date.now(),
    };
    
    this.notifications.set(id, notification);
    this.scheduleRemoval(id, duration);
    this.emit();
    
    return id;
  }

  /**
   * Actualiza una notificación existente
   */
  update(id: string, updates: Partial<NotificationOptions>): void {
    const existing = this.notifications.get(id);
    if (!existing) return;
    
    const updated: Notification = {
      ...existing,
      ...updates,
    };
    
    this.notifications.set(id, updated);
    
    // Re-programar si cambió la duración
    if (updates.duration !== undefined) {
      this.scheduleRemoval(id, updates.duration);
    }
    
    this.emit();
  }

  /**
   * Elimina una notificación
   */
  dismiss(id: string): void {
    const timeout = this.timeouts.get(id);
    if (timeout) {
      clearTimeout(timeout);
      this.timeouts.delete(id);
    }
    
    this.notifications.delete(id);
    this.emit();
  }

  /**
   * Elimina todas las notificaciones
   */
  dismissAll(): void {
    this.timeouts.forEach((timeout) => clearTimeout(timeout));
    this.timeouts.clear();
    this.notifications.clear();
    this.emit();
  }

  /**
   * Obtiene una notificación por ID
   */
  get(id: string): Notification | undefined {
    return this.notifications.get(id);
  }

  /**
   * Obtiene todas las notificaciones
   */
  getAll(): Notification[] {
    return Array.from(this.notifications.values());
  }
}

// Singleton
export const notificationManager = new NotificationManager();

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Helpers para mostrar notificaciones rápidamente
 */
export const notify = {
  success: (description: string, options?: Partial<NotificationOptions>) =>
    notificationManager.show({ type: "success", description, ...options }),
  
  error: (description: string, options?: Partial<NotificationOptions>) =>
    notificationManager.show({ type: "error", description, ...options }),
  
  warning: (description: string, options?: Partial<NotificationOptions>) =>
    notificationManager.show({ type: "warning", description, ...options }),
  
  info: (description: string, options?: Partial<NotificationOptions>) =>
    notificationManager.show({ type: "info", description, ...options }),
  
  loading: (description: string, options?: Partial<NotificationOptions>) =>
    notificationManager.show({ type: "loading", description, duration: 0, ...options }),

  /**
   * Notificación de progreso
   */
  progress: (
    id: string,
    description: string,
    progress: number,
    options?: Partial<NotificationOptions>
  ) => {
    const existing = notificationManager.get(id);
    if (existing) {
      notificationManager.update(id, { description, progress });
    } else {
      notificationManager.show({
        id,
        type: "loading",
        description,
        progress,
        duration: 0,
        ...options,
      });
    }
    return id;
  },

  /**
   * Completa una notificación de progreso
   */
  complete: (id: string, description: string, type: "success" | "error" = "success") => {
    notificationManager.update(id, {
      type,
      description,
      progress: type === "success" ? 100 : undefined,
      duration: DURATION_PRESETS[type],
    });
  },

  /**
   * Muestra notificación desde un AppError
   */
  fromError: (error: AppError, options?: {
    onRetry?: () => void;
    showDetails?: boolean;
  }): string => {
    const actions: NotificationAction[] = [];
    
    // Agregar botón de reintentar si es reintentable
    if (error.retryable && options?.onRetry) {
      actions.push({
        label: "Reintentar",
        onClick: options.onRetry,
        variant: "primary",
      });
    }
    
    // Determinar duración basada en severidad
    const durationMap: Record<ErrorSeverity, number> = {
      low: 5000,
      medium: 7000,
      high: 10000,
      critical: 0, // Permanente
    };
    
    return notificationManager.show({
      type: "error",
      title: error.userMessage.title,
      description: error.userMessage.suggestion 
        ? `${error.userMessage.description} ${error.userMessage.suggestion}`
        : error.userMessage.description,
      duration: durationMap[error.severity],
      actions: actions.length > 0 ? actions : undefined,
      meta: {
        errorCode: error.code,
        category: error.category,
        retryable: error.retryable,
      },
    });
  },

  /**
   * Notificación para operación con retry en progreso
   */
  retrying: (id: string, attempt: number, maxAttempts: number, delay: number): string => {
    const message = `Reintentando (${attempt}/${maxAttempts})... ${Math.round(delay / 1000)}s`;
    
    const existing = notificationManager.get(id);
    if (existing) {
      notificationManager.update(id, {
        type: "warning",
        description: message,
        meta: { ...existing.meta, retryCount: attempt },
      });
    } else {
      notificationManager.show({
        id,
        type: "warning",
        description: message,
        duration: 0,
        meta: { retryCount: attempt },
      });
    }
    return id;
  },

  dismiss: notificationManager.dismiss.bind(notificationManager),
  dismissAll: notificationManager.dismissAll.bind(notificationManager),
  update: notificationManager.update.bind(notificationManager),
};

// ============================================================================
// SPECIALIZED NOTIFICATIONS
// ============================================================================

/**
 * Notificaciones específicas para operaciones de PDF
 */
export const pdfNotify = {
  /**
   * Inicio de procesamiento
   */
  processingStart: (fileName: string, operation: string): string => {
    return notify.loading(`Procesando ${fileName}...`, {
      id: `process-${fileName}`,
      title: operation,
      meta: { fileName },
    });
  },

  /**
   * Progreso de procesamiento
   */
  processingProgress: (fileName: string, progress: number, stage?: string): string => {
    const description = stage 
      ? `${stage} (${progress}%)`
      : `Procesando... ${progress}%`;
    
    return notify.progress(`process-${fileName}`, description, progress, {
      meta: { fileName },
    });
  },

  /**
   * Procesamiento completado
   */
  processingComplete: (fileName: string, resultInfo?: string): void => {
    notify.complete(
      `process-${fileName}`,
      resultInfo || `${fileName} procesado correctamente`,
      "success"
    );
  },

  /**
   * Error en procesamiento
   */
  processingError: (fileName: string, error: AppError, onRetry?: () => void): string => {
    // Actualizar la notificación de loading si existe
    const loadingId = `process-${fileName}`;
    notificationManager.dismiss(loadingId);
    
    return notify.fromError(
      error.withContext({ fileName }),
      { onRetry }
    );
  },

  /**
   * Archivo demasiado grande
   */
  fileTooLarge: (fileName: string, size: number, maxSize: number): string => {
    const sizeMB = (size / 1024 / 1024).toFixed(1);
    const maxMB = (maxSize / 1024 / 1024).toFixed(0);
    
    return notify.error(
      `${fileName} (${sizeMB}MB) excede el límite de ${maxMB}MB`,
      { title: "Archivo demasiado grande" }
    );
  },

  /**
   * Tipo de archivo inválido
   */
  invalidFileType: (fileName: string, expectedTypes: string[]): string => {
    return notify.error(
      `Tipo de archivo no válido. Esperado: ${expectedTypes.join(", ")}`,
      { title: `${fileName} no es compatible` }
    );
  },

  /**
   * Descarga lista
   */
  downloadReady: (fileName: string, onDownload?: () => void): string => {
    const actions: NotificationAction[] = onDownload 
      ? [{ label: "Descargar", onClick: onDownload, variant: "primary" }]
      : [];
    
    return notify.success(`${fileName} está listo para descargar`, {
      title: "Procesamiento completado",
      actions,
      duration: 10000,
    });
  },

  /**
   * Múltiples archivos procesados
   */
  batchComplete: (
    total: number,
    successful: number,
    failed: number
  ): string => {
    if (failed === 0) {
      return notify.success(
        `${successful} archivo${successful !== 1 ? "s" : ""} procesado${successful !== 1 ? "s" : ""} correctamente`,
        { title: "Procesamiento completado" }
      );
    } else if (successful === 0) {
      return notify.error(
        `No se pudo procesar ningún archivo`,
        { title: "Error en procesamiento" }
      );
    } else {
      return notify.warning(
        `${successful} exitoso${successful !== 1 ? "s" : ""}, ${failed} fallido${failed !== 1 ? "s" : ""}`,
        { title: "Procesamiento parcial" }
      );
    }
  },

  /**
   * Servidor no disponible
   */
  serverUnavailable: (onRetry?: () => void): string => {
    return notify.error(
      "El servidor de procesamiento no está disponible. Intenta de nuevo en unos minutos.",
      {
        title: "Servicio temporalmente no disponible",
        actions: onRetry 
          ? [{ label: "Reintentar", onClick: onRetry, variant: "primary" }]
          : undefined,
        duration: 0,
      }
    );
  },
};
