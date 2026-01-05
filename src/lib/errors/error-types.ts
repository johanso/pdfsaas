/**
 * Sistema de Errores Tipados para PDF Tools
 * 
 * Proporciona:
 * - Clasificación de errores por categoría
 * - Códigos de error únicos para tracking
 * - Mensajes amigables para el usuario
 * - Sugerencias de acción
 * - Metadata para logging
 */

// ============================================================================
// ERROR CATEGORIES
// ============================================================================

export type ErrorCategory =
  | "network"      // Problemas de conexión
  | "file"         // Problemas con archivos
  | "processing"   // Errores durante procesamiento
  | "validation"   // Validación de datos
  | "permission"   // Permisos/autenticación
  | "server"       // Errores del servidor
  | "client"       // Errores del cliente/navegador
  | "timeout"      // Timeouts
  | "unknown";     // No clasificados

export type ErrorSeverity = "low" | "medium" | "high" | "critical";

// ============================================================================
// ERROR CODES
// ============================================================================

export const ErrorCodes = {
  // Network (1xxx)
  NETWORK_OFFLINE: "E1001",
  NETWORK_TIMEOUT: "E1002",
  NETWORK_ABORTED: "E1003",
  NETWORK_DNS_FAILURE: "E1004",
  NETWORK_SSL_ERROR: "E1005",
  
  // File (2xxx)
  FILE_TOO_LARGE: "E2001",
  FILE_INVALID_TYPE: "E2002",
  FILE_CORRUPTED: "E2003",
  FILE_PROTECTED: "E2004",
  FILE_EMPTY: "E2005",
  FILE_READ_ERROR: "E2006",
  FILE_BATCH_LIMIT: "E2007",
  FILE_NAME_INVALID: "E2008",
  
  // Processing (3xxx)
  PROCESSING_FAILED: "E3001",
  PROCESSING_CANCELLED: "E3002",
  PROCESSING_TIMEOUT: "E3003",
  PROCESSING_MEMORY: "E3004",
  PROCESSING_UNSUPPORTED: "E3005",
  PROCESSING_OCR_FAILED: "E3006",
  PROCESSING_COMPRESSION_FAILED: "E3007",
  PROCESSING_CONVERSION_FAILED: "E3008",
  
  // Validation (4xxx)
  VALIDATION_REQUIRED: "E4001",
  VALIDATION_FORMAT: "E4002",
  VALIDATION_RANGE: "E4003",
  VALIDATION_PAGE_SELECTION: "E4004",
  
  // Server (5xxx)
  SERVER_ERROR: "E5001",
  SERVER_UNAVAILABLE: "E5002",
  SERVER_OVERLOADED: "E5003",
  SERVER_MAINTENANCE: "E5004",
  SERVER_RATE_LIMITED: "E5005",
  
  // Client (6xxx)
  CLIENT_BROWSER_UNSUPPORTED: "E6001",
  CLIENT_WEBGL_UNAVAILABLE: "E6002",
  CLIENT_STORAGE_FULL: "E6003",
  CLIENT_MEMORY_EXCEEDED: "E6004",
  
  // Unknown
  UNKNOWN: "E9999",
} as const;

export type ErrorCode = typeof ErrorCodes[keyof typeof ErrorCodes];

// ============================================================================
// ERROR MESSAGES (User-friendly)
// ============================================================================

export const ErrorMessages: Record<ErrorCode, {
  title: string;
  description: string;
  suggestion?: string;
}> = {
  // Network
  [ErrorCodes.NETWORK_OFFLINE]: {
    title: "Sin conexión a internet",
    description: "No pudimos conectar con nuestros servidores.",
    suggestion: "Verifica tu conexión y vuelve a intentarlo."
  },
  [ErrorCodes.NETWORK_TIMEOUT]: {
    title: "La conexión tardó demasiado",
    description: "El servidor no respondió a tiempo.",
    suggestion: "El archivo puede ser muy grande. Intenta con un archivo más pequeño o vuelve a intentarlo."
  },
  [ErrorCodes.NETWORK_ABORTED]: {
    title: "Operación cancelada",
    description: "La transferencia fue interrumpida.",
    suggestion: "Puedes volver a intentar cuando quieras."
  },
  [ErrorCodes.NETWORK_DNS_FAILURE]: {
    title: "Error de conexión",
    description: "No se pudo resolver el servidor.",
    suggestion: "Verifica tu conexión a internet."
  },
  [ErrorCodes.NETWORK_SSL_ERROR]: {
    title: "Error de seguridad",
    description: "No se pudo establecer una conexión segura.",
    suggestion: "Intenta refrescar la página o usar otro navegador."
  },
  
  // File
  [ErrorCodes.FILE_TOO_LARGE]: {
    title: "Archivo demasiado grande",
    description: "El archivo excede el límite permitido.",
    suggestion: "El máximo es 150MB por archivo. Intenta comprimir el PDF primero."
  },
  [ErrorCodes.FILE_INVALID_TYPE]: {
    title: "Tipo de archivo no válido",
    description: "Este tipo de archivo no es compatible.",
    suggestion: "Asegúrate de subir un archivo PDF válido."
  },
  [ErrorCodes.FILE_CORRUPTED]: {
    title: "Archivo dañado",
    description: "No pudimos leer el contenido del archivo.",
    suggestion: "El archivo puede estar corrupto. Intenta con otra copia."
  },
  [ErrorCodes.FILE_PROTECTED]: {
    title: "PDF protegido",
    description: "Este archivo tiene contraseña.",
    suggestion: "Usa nuestra herramienta 'Desbloquear PDF' primero."
  },
  [ErrorCodes.FILE_EMPTY]: {
    title: "Archivo vacío",
    description: "El archivo no tiene contenido.",
    suggestion: "Selecciona un archivo con contenido."
  },
  [ErrorCodes.FILE_READ_ERROR]: {
    title: "Error al leer archivo",
    description: "No pudimos acceder al archivo.",
    suggestion: "Verifica que el archivo no esté en uso por otro programa."
  },
  [ErrorCodes.FILE_BATCH_LIMIT]: {
    title: "Demasiados archivos",
    description: "Has excedido el límite de archivos simultáneos.",
    suggestion: "El máximo es 50 archivos o 500MB en total."
  },
  [ErrorCodes.FILE_NAME_INVALID]: {
    title: "Nombre de archivo inválido",
    description: "El nombre contiene caracteres no permitidos.",
    suggestion: "Usa solo letras, números, guiones y guiones bajos."
  },
  
  // Processing
  [ErrorCodes.PROCESSING_FAILED]: {
    title: "Error al procesar",
    description: "Algo salió mal durante el procesamiento.",
    suggestion: "Vuelve a intentarlo. Si el error persiste, prueba con otro archivo."
  },
  [ErrorCodes.PROCESSING_CANCELLED]: {
    title: "Procesamiento cancelado",
    description: "Has cancelado la operación.",
    suggestion: "Puedes volver a empezar cuando quieras."
  },
  [ErrorCodes.PROCESSING_TIMEOUT]: {
    title: "Tiempo de procesamiento excedido",
    description: "El archivo tardó demasiado en procesarse.",
    suggestion: "Archivos muy complejos pueden requerir más tiempo. Intenta con menos páginas."
  },
  [ErrorCodes.PROCESSING_MEMORY]: {
    title: "Memoria insuficiente",
    description: "El archivo requiere más memoria de la disponible.",
    suggestion: "Cierra otras pestañas o intenta con un archivo más pequeño."
  },
  [ErrorCodes.PROCESSING_UNSUPPORTED]: {
    title: "Operación no soportada",
    description: "Este tipo de PDF no es compatible con esta operación.",
    suggestion: "Algunos PDFs con características especiales no son compatibles."
  },
  [ErrorCodes.PROCESSING_OCR_FAILED]: {
    title: "Error en OCR",
    description: "No pudimos reconocer el texto del documento.",
    suggestion: "Asegúrate de que el documento esté bien escaneado y legible."
  },
  [ErrorCodes.PROCESSING_COMPRESSION_FAILED]: {
    title: "Error al comprimir",
    description: "No pudimos reducir el tamaño del archivo.",
    suggestion: "El archivo puede ya estar optimizado o tener un formato especial."
  },
  [ErrorCodes.PROCESSING_CONVERSION_FAILED]: {
    title: "Error en conversión",
    description: "No pudimos convertir el archivo.",
    suggestion: "Verifica que el archivo de origen no esté dañado."
  },
  
  // Validation
  [ErrorCodes.VALIDATION_REQUIRED]: {
    title: "Campo requerido",
    description: "Falta información necesaria.",
    suggestion: "Completa todos los campos obligatorios."
  },
  [ErrorCodes.VALIDATION_FORMAT]: {
    title: "Formato inválido",
    description: "El dato ingresado no tiene el formato correcto.",
    suggestion: "Verifica el formato requerido."
  },
  [ErrorCodes.VALIDATION_RANGE]: {
    title: "Valor fuera de rango",
    description: "El valor está fuera de los límites permitidos.",
    suggestion: "Ingresa un valor dentro del rango válido."
  },
  [ErrorCodes.VALIDATION_PAGE_SELECTION]: {
    title: "Selección de páginas inválida",
    description: "Las páginas seleccionadas no son válidas.",
    suggestion: "Verifica que los números de página existan en el documento."
  },
  
  // Server
  [ErrorCodes.SERVER_ERROR]: {
    title: "Error del servidor",
    description: "Nuestro servidor encontró un problema.",
    suggestion: "Estamos trabajando en ello. Vuelve a intentar en unos minutos."
  },
  [ErrorCodes.SERVER_UNAVAILABLE]: {
    title: "Servicio no disponible",
    description: "El servidor no está respondiendo.",
    suggestion: "Intenta de nuevo en unos minutos."
  },
  [ErrorCodes.SERVER_OVERLOADED]: {
    title: "Servidor ocupado",
    description: "Hay mucha demanda en este momento.",
    suggestion: "Espera unos segundos e intenta de nuevo."
  },
  [ErrorCodes.SERVER_MAINTENANCE]: {
    title: "En mantenimiento",
    description: "Estamos mejorando el servicio.",
    suggestion: "Vuelve a intentar en unos minutos."
  },
  [ErrorCodes.SERVER_RATE_LIMITED]: {
    title: "Demasiadas solicitudes",
    description: "Has realizado muchas operaciones en poco tiempo.",
    suggestion: "Espera un momento antes de continuar."
  },
  
  // Client
  [ErrorCodes.CLIENT_BROWSER_UNSUPPORTED]: {
    title: "Navegador no compatible",
    description: "Tu navegador no soporta esta función.",
    suggestion: "Actualiza tu navegador o usa Chrome, Firefox o Edge."
  },
  [ErrorCodes.CLIENT_WEBGL_UNAVAILABLE]: {
    title: "WebGL no disponible",
    description: "Tu dispositivo no soporta gráficos avanzados.",
    suggestion: "Intenta activar la aceleración por hardware en tu navegador."
  },
  [ErrorCodes.CLIENT_STORAGE_FULL]: {
    title: "Almacenamiento lleno",
    description: "No hay espacio disponible en tu dispositivo.",
    suggestion: "Libera espacio en tu dispositivo e intenta de nuevo."
  },
  [ErrorCodes.CLIENT_MEMORY_EXCEEDED]: {
    title: "Memoria del navegador agotada",
    description: "El navegador no tiene suficiente memoria.",
    suggestion: "Cierra otras pestañas y recarga la página."
  },
  
  // Unknown
  [ErrorCodes.UNKNOWN]: {
    title: "Error inesperado",
    description: "Algo salió mal.",
    suggestion: "Vuelve a intentarlo. Si el error persiste, contáctanos."
  },
};

// ============================================================================
// APP ERROR CLASS
// ============================================================================

export interface AppErrorOptions {
  code?: ErrorCode;
  category?: ErrorCategory;
  severity?: ErrorSeverity;
  originalError?: Error | unknown;
  context?: Record<string, unknown>;
  retryable?: boolean;
  retryCount?: number;
  retryDelay?: number;
}

export class AppError extends Error {
  readonly code: ErrorCode;
  readonly category: ErrorCategory;
  readonly severity: ErrorSeverity;
  readonly timestamp: Date;
  readonly originalError?: Error | unknown;
  readonly context: Record<string, unknown>;
  readonly retryable: boolean;
  readonly retryCount: number;
  readonly retryDelay: number;
  readonly userMessage: {
    title: string;
    description: string;
    suggestion?: string;
  };

  constructor(message: string, options: AppErrorOptions = {}) {
    super(message);
    this.name = "AppError";
    
    this.code = options.code || ErrorCodes.UNKNOWN;
    this.category = options.category || this.inferCategory(this.code);
    this.severity = options.severity || this.inferSeverity(this.category);
    this.timestamp = new Date();
    this.originalError = options.originalError;
    this.context = options.context || {};
    this.retryable = options.retryable ?? this.isRetryableByDefault();
    this.retryCount = options.retryCount ?? 3;
    this.retryDelay = options.retryDelay ?? 1000;
    this.userMessage = ErrorMessages[this.code] || ErrorMessages[ErrorCodes.UNKNOWN];

    // Mantener stack trace correctamente
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AppError);
    }
  }

  private inferCategory(code: ErrorCode): ErrorCategory {
    const prefix = code.substring(0, 2);
    const categoryMap: Record<string, ErrorCategory> = {
      "E1": "network",
      "E2": "file",
      "E3": "processing",
      "E4": "validation",
      "E5": "server",
      "E6": "client",
    };
    return categoryMap[prefix] || "unknown";
  }

  private inferSeverity(category: ErrorCategory): ErrorSeverity {
    const severityMap: Record<ErrorCategory, ErrorSeverity> = {
      network: "medium",
      file: "low",
      processing: "medium",
      validation: "low",
      permission: "high",
      server: "high",
      client: "medium",
      timeout: "medium",
      unknown: "medium",
    };
    return severityMap[category];
  }

  private isRetryableByDefault(): boolean {
    const retryableCategories: ErrorCategory[] = ["network", "server", "timeout"];
    const nonRetryableCodes: ErrorCode[] = [
      ErrorCodes.FILE_TOO_LARGE,
      ErrorCodes.FILE_INVALID_TYPE,
      ErrorCodes.FILE_PROTECTED,
      ErrorCodes.VALIDATION_REQUIRED,
      ErrorCodes.PROCESSING_CANCELLED,
    ];
    
    return retryableCategories.includes(this.category) && 
           !nonRetryableCodes.includes(this.code);
  }

  /**
   * Serializa el error para logging
   */
  toJSON(): Record<string, unknown> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      category: this.category,
      severity: this.severity,
      timestamp: this.timestamp.toISOString(),
      context: this.context,
      retryable: this.retryable,
      stack: this.stack,
      originalError: this.originalError instanceof Error 
        ? { message: this.originalError.message, stack: this.originalError.stack }
        : this.originalError,
    };
  }

  /**
   * Crea una versión con contexto adicional
   */
  withContext(additionalContext: Record<string, unknown>): AppError {
    return new AppError(this.message, {
      code: this.code,
      category: this.category,
      severity: this.severity,
      originalError: this.originalError,
      context: { ...this.context, ...additionalContext },
      retryable: this.retryable,
      retryCount: this.retryCount,
      retryDelay: this.retryDelay,
    });
  }
}

// ============================================================================
// ERROR FACTORY
// ============================================================================

export const createError = {
  // Network
  networkOffline: (context?: Record<string, unknown>) => 
    new AppError("No internet connection", { 
      code: ErrorCodes.NETWORK_OFFLINE, 
      context 
    }),
  
  networkTimeout: (context?: Record<string, unknown>) => 
    new AppError("Request timed out", { 
      code: ErrorCodes.NETWORK_TIMEOUT, 
      context,
      retryDelay: 2000
    }),
  
  networkAborted: (context?: Record<string, unknown>) => 
    new AppError("Request aborted", { 
      code: ErrorCodes.NETWORK_ABORTED, 
      context,
      retryable: false
    }),

  // File
  fileTooLarge: (fileName: string, size: number, maxSize: number) => 
    new AppError(`File ${fileName} exceeds size limit`, { 
      code: ErrorCodes.FILE_TOO_LARGE,
      context: { fileName, size, maxSize },
      retryable: false
    }),
  
  fileInvalidType: (fileName: string, actualType: string, expectedTypes: string[]) => 
    new AppError(`Invalid file type for ${fileName}`, { 
      code: ErrorCodes.FILE_INVALID_TYPE,
      context: { fileName, actualType, expectedTypes },
      retryable: false
    }),
  
  fileProtected: (fileName: string) => 
    new AppError(`File ${fileName} is password protected`, { 
      code: ErrorCodes.FILE_PROTECTED,
      context: { fileName },
      retryable: false
    }),
  
  fileCorrupted: (fileName: string, originalError?: Error) => 
    new AppError(`File ${fileName} appears to be corrupted`, { 
      code: ErrorCodes.FILE_CORRUPTED,
      context: { fileName },
      originalError,
      retryable: false
    }),

  // Processing
  processingFailed: (operation: string, originalError?: Error) => 
    new AppError(`Processing failed: ${operation}`, { 
      code: ErrorCodes.PROCESSING_FAILED,
      context: { operation },
      originalError
    }),
  
  processingCancelled: () => 
    new AppError("Processing was cancelled by user", { 
      code: ErrorCodes.PROCESSING_CANCELLED,
      severity: "low",
      retryable: false
    }),
  
  processingTimeout: (operation: string, timeoutMs: number) => 
    new AppError(`Operation timed out: ${operation}`, { 
      code: ErrorCodes.PROCESSING_TIMEOUT,
      context: { operation, timeoutMs }
    }),

  // Server
  serverError: (statusCode: number, serverMessage?: string) => 
    new AppError(`Server error: ${statusCode}`, { 
      code: ErrorCodes.SERVER_ERROR,
      context: { statusCode, serverMessage },
      severity: "high"
    }),
  
  serverUnavailable: () => 
    new AppError("Server is unavailable", { 
      code: ErrorCodes.SERVER_UNAVAILABLE,
      severity: "high",
      retryDelay: 5000
    }),
  
  rateLimited: (retryAfter?: number) => 
    new AppError("Rate limited", { 
      code: ErrorCodes.SERVER_RATE_LIMITED,
      context: { retryAfter },
      retryDelay: retryAfter ? retryAfter * 1000 : 10000
    }),

  // Generic from unknown
  fromUnknown: (error: unknown, context?: Record<string, unknown>): AppError => {
    if (error instanceof AppError) {
      return context ? error.withContext(context) : error;
    }
    
    if (error instanceof Error) {
      // Detectar tipo de error por mensaje
      const message = error.message.toLowerCase();
      
      if (message.includes("network") || message.includes("fetch")) {
        return new AppError(error.message, {
          code: ErrorCodes.NETWORK_OFFLINE,
          originalError: error,
          context
        });
      }
      
      if (message.includes("timeout") || message.includes("timed out")) {
        return new AppError(error.message, {
          code: ErrorCodes.NETWORK_TIMEOUT,
          originalError: error,
          context
        });
      }
      
      if (message.includes("abort") || message.includes("cancel")) {
        return new AppError(error.message, {
          code: ErrorCodes.NETWORK_ABORTED,
          originalError: error,
          context,
          retryable: false
        });
      }
      
      if (error.name === "PasswordException") {
        return new AppError("PDF is password protected", {
          code: ErrorCodes.FILE_PROTECTED,
          originalError: error,
          context,
          retryable: false
        });
      }
      
      return new AppError(error.message, {
        code: ErrorCodes.UNKNOWN,
        originalError: error,
        context
      });
    }
    
    return new AppError(String(error), {
      code: ErrorCodes.UNKNOWN,
      context
    });
  }
};
