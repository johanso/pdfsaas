# Sistema de Manejo de Errores

Sistema completo de manejo de errores, retry y notificaciones para PDF Tools.

## Estructura

```
src/
├── lib/errors/
│   ├── index.ts              # Exportaciones centralizadas
│   ├── error-types.ts        # Tipos, códigos y clase AppError
│   ├── logger.ts             # Logging estructurado
│   ├── retry.ts              # Sistema de reintentos
│   └── notifications.ts      # Sistema de notificaciones
├── hooks/
│   ├── useErrorHandler.ts    # Hook principal de errores
│   └── useToolProcessorEnhanced.ts # Ejemplo de integración
└── components/
    ├── ui/toast.tsx          # Componente Toast
    └── ErrorBoundary.tsx     # Error Boundary de React
```

## Uso Básico

### 1. Errores Tipados

```typescript
import { createError, ErrorCodes, AppError } from "@/lib/errors";

// Crear errores específicos
const error = createError.fileTooLarge("documento.pdf", 200_000_000, 150_000_000);
const networkError = createError.networkTimeout({ endpoint: "/api/compress" });

// Convertir errores desconocidos
try {
  await someOperation();
} catch (e) {
  const appError = createError.fromUnknown(e, { context: "upload" });
  // appError tiene código, categoría, mensaje amigable, etc.
}
```

### 2. Retry Automático

```typescript
import { retry, retryNetwork } from "@/lib/errors";

// Retry básico
const result = await retry(
  () => uploadFile(file),
  {
    maxRetries: 3,
    baseDelay: 1000,
    onRetry: (error, attempt, delay) => {
      console.log(`Intento ${attempt}, esperando ${delay}ms...`);
    }
  }
);

if (result.success) {
  console.log("Datos:", result.data);
} else {
  console.log("Error:", result.error);
}

// Retry optimizado para red
const networkResult = await retryNetwork(() => fetch("/api/process"));
```

### 3. Notificaciones

```typescript
import { notify, pdfNotify } from "@/lib/errors";

// Notificaciones básicas
notify.success("Archivo procesado correctamente");
notify.error("No se pudo conectar con el servidor");
notify.warning("El archivo es muy grande");

// Progreso
const id = notify.loading("Procesando...");
notify.progress(id, "Comprimiendo...", 50);
notify.complete(id, "¡Listo!", "success");

// Notificaciones específicas de PDF
pdfNotify.processingStart("documento.pdf", "Comprimir");
pdfNotify.processingProgress("documento.pdf", 75, "Optimizando");
pdfNotify.processingComplete("documento.pdf");

// Desde un error
notify.fromError(appError, {
  onRetry: () => retryOperation()
});
```

### 4. Hook useErrorHandler

```typescript
import { useErrorHandler } from "@/hooks/useErrorHandler";

function MyComponent() {
  const {
    errorState,
    execute,
    executeNetwork,
    handleError,
    clearError,
  } = useErrorHandler({
    toolId: "compress-pdf",
    showNotifications: true,
    retryOptions: { maxRetries: 3 },
  });

  const handleUpload = async (file: File) => {
    const result = await executeNetwork(
      () => uploadFile(file),
      {
        fileName: file.name,
        showLoading: true,
        showSuccess: true,
      }
    );

    if (result) {
      // Éxito
      console.log("URL:", result);
    }
    // Los errores ya están manejados automáticamente
  };

  return (
    <div>
      {errorState.isRetrying && (
        <p>Reintentando ({errorState.retryCount}/3)...</p>
      )}
      {errorState.hasError && (
        <button onClick={clearError}>Cerrar error</button>
      )}
    </div>
  );
}
```

### 5. Error Boundary

```tsx
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Nivel de aplicación (layout)
<ErrorBoundary level="app">
  <App />
</ErrorBoundary>

// Nivel de página
<ErrorBoundary level="page" boundaryId="compress-tool">
  <CompressTool />
</ErrorBoundary>

// Nivel de componente (inline)
<ErrorBoundary level="component">
  <FileUploader />
</ErrorBoundary>

// Con fallback personalizado
<ErrorBoundary
  fallback={(error, reset) => (
    <CustomErrorUI error={error} onRetry={reset} />
  )}
>
  <RiskyComponent />
</ErrorBoundary>
```

### 6. Toast Container

```tsx
// En tu layout principal
import { ToastContainer } from "@/components/ui/toast";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <ToastContainer position="bottom-right" maxVisible={5} />
      </body>
    </html>
  );
}
```

### 7. Logging

```typescript
import { logger } from "@/lib/errors";

// Niveles de log
logger.debug("Detalle para desarrollo", { data: someData });
logger.info("Operación iniciada", { toolId: "compress" });
logger.warn("Archivo grande detectado", { size: file.size });
logger.error("Error en procesamiento", appError, { context });

// Log específico de herramientas
logger.toolOperation("compress-pdf", "start", { fileName: "doc.pdf" });
logger.toolOperation("compress-pdf", "success", { duration: 2500 });
logger.toolOperation("compress-pdf", "error", { error: appError });

// Exportar logs para debugging
const logsJson = logger.exportLogs();
console.log(logsJson);
```

## Códigos de Error

| Prefijo | Categoría | Ejemplos |
|---------|-----------|----------|
| E1xxx | Network | NETWORK_OFFLINE, NETWORK_TIMEOUT |
| E2xxx | File | FILE_TOO_LARGE, FILE_PROTECTED |
| E3xxx | Processing | PROCESSING_FAILED, PROCESSING_OCR_FAILED |
| E4xxx | Validation | VALIDATION_REQUIRED, VALIDATION_PAGE_SELECTION |
| E5xxx | Server | SERVER_ERROR, SERVER_RATE_LIMITED |
| E6xxx | Client | CLIENT_BROWSER_UNSUPPORTED, CLIENT_MEMORY_EXCEEDED |

## Configuración

### Variables de Entorno

```env
# Nivel de log (development: debug, production: info)
NEXT_PUBLIC_LOG_LEVEL=info

# Enviar errores a servicio externo
NEXT_PUBLIC_ERROR_REPORTING_URL=https://...
```

### Configurar Logger

```typescript
import { logger } from "@/lib/errors";

logger.configure({
  minLevel: "warn",
  console: process.env.NODE_ENV === "development",
  localStorage: true,
  externalHandler: (entry) => {
    // Enviar a Sentry, LogRocket, etc.
    if (entry.level === "error") {
      Sentry.captureException(entry);
    }
  },
});
```

## Integración con Hooks Existentes

Para migrar hooks existentes al nuevo sistema:

```typescript
// Antes
const handleError = (error: Error) => {
  console.error(error);
  toast.error("Algo salió mal");
};

// Después
import { useErrorHandler } from "@/hooks/useErrorHandler";

const { execute, errorState } = useErrorHandler({ toolId: "my-tool" });

const result = await execute(
  () => myOperation(),
  { operationName: "process", fileName: file.name }
);
// Manejo automático de errores, retry y notificaciones
```

## Características

- ✅ **Errores tipados** con códigos únicos y mensajes amigables
- ✅ **Retry automático** con backoff exponencial y jitter
- ✅ **Notificaciones contextuales** con progreso y acciones
- ✅ **Logging estructurado** con almacenamiento local
- ✅ **Error Boundaries** para errores de React
- ✅ **Soporte para cancelación** con AbortController
- ✅ **Dark mode** en todos los componentes
- ✅ **Sanitización** de datos sensibles en logs
- ✅ **TypeScript** completo
