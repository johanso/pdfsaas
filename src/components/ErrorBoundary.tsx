"use client";

/**
 * Error Boundary para capturar errores de React
 * 
 * Características:
 * - Captura errores en el árbol de componentes
 * - UI de fallback amigable
 * - Logging automático
 * - Opción de reintentar
 */

import React, { Component, ReactNode } from "react";
import { AppError, createError, ErrorCodes } from "@/lib/errors/error-types";
import { logger } from "@/lib/errors/logger";
import { AlertTriangle, RefreshCw, Home, ChevronDown, ChevronUp } from "lucide-react";

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Componente de fallback personalizado */
  fallback?: ReactNode | ((error: AppError, reset: () => void) => ReactNode);
  /** Callback cuando ocurre un error */
  onError?: (error: AppError, errorInfo: React.ErrorInfo) => void;
  /** Nivel del boundary (para logging) */
  level?: "app" | "page" | "component";
  /** ID para identificar el boundary */
  boundaryId?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
  errorInfo: React.ErrorInfo | null;
}

// ============================================================================
// ERROR BOUNDARY CLASS
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    const appError = createError.fromUnknown(error, {
      source: "ErrorBoundary",
      isReactError: true,
    });

    return {
      hasError: true,
      error: appError,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    const { onError, level = "component", boundaryId } = this.props;

    const appError = this.state.error || createError.fromUnknown(error);

    // Logging estructurado
    logger.error(`[ErrorBoundary:${level}] React error caught`, appError, {
      boundaryId,
      componentStack: errorInfo.componentStack,
    });

    this.setState({ errorInfo });

    // Callback
    onError?.(appError, errorInfo);
  }

  handleReset = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    const { hasError, error } = this.state;
    const { children, fallback, level } = this.props;

    if (hasError && error) {
      // Fallback personalizado
      if (fallback) {
        if (typeof fallback === "function") {
          return fallback(error, this.handleReset);
        }
        return fallback;
      }

      // Fallback por defecto según nivel
      if (level === "app") {
        return (
          <AppLevelErrorFallback
            error={error}
            errorInfo={this.state.errorInfo}
            onReset={this.handleReset}
          />
        );
      }

      if (level === "page") {
        return (
          <PageLevelErrorFallback
            error={error}
            onReset={this.handleReset}
          />
        );
      }

      return (
        <ComponentLevelErrorFallback
          error={error}
          onReset={this.handleReset}
        />
      );
    }

    return children;
  }
}

// ============================================================================
// FALLBACK COMPONENTS
// ============================================================================

interface ErrorFallbackProps {
  error: AppError;
  errorInfo?: React.ErrorInfo | null;
  onReset: () => void;
}

/**
 * Fallback para errores a nivel de aplicación (pantalla completa)
 */
function AppLevelErrorFallback({ error, errorInfo, onReset }: ErrorFallbackProps) {
  const [showDetails, setShowDetails] = React.useState(false);
  const isDev = process.env.NODE_ENV === "development";

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="max-w-lg w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center">
          {/* Icon */}
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {error.userMessage.title}
          </h1>

          {/* Description */}
          <p className="text-slate-600 dark:text-slate-300 mb-6">
            {error.userMessage.description}
          </p>

          {/* Suggestion */}
          {error.userMessage.suggestion && (
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3">
              💡 {error.userMessage.suggestion}
            </p>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={onReset}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Intentar de nuevo
            </button>
            <a
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-medium rounded-lg transition-colors"
            >
              <Home className="w-4 h-4" />
              Ir al inicio
            </a>
          </div>

          {/* Error details (dev only) */}
          {isDev && (
            <div className="mt-8 text-left">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                {showDetails ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
                Detalles técnicos
              </button>

              {showDetails && (
                <div className="mt-3 p-4 bg-slate-900 rounded-lg overflow-auto max-h-64">
                  <pre className="text-xs text-slate-300 whitespace-pre-wrap">
                    <strong>Error Code:</strong> {error.code}
                    {"\n"}
                    <strong>Category:</strong> {error.category}
                    {"\n"}
                    <strong>Message:</strong> {error.message}
                    {"\n\n"}
                    <strong>Stack:</strong>
                    {"\n"}
                    {error.stack}
                    {errorInfo?.componentStack && (
                      <>
                        {"\n\n"}
                        <strong>Component Stack:</strong>
                        {"\n"}
                        {errorInfo.componentStack}
                      </>
                    )}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* Error code badge */}
          <div className="mt-6 text-xs text-slate-400">
            Código: {error.code}
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Fallback para errores a nivel de página
 */
function PageLevelErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-12 h-12 mb-4 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
        <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
      </div>

      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">
        {error.userMessage.title}
      </h2>

      <p className="text-slate-600 dark:text-slate-300 text-center max-w-md mb-6">
        {error.userMessage.description}
      </p>

      <button
        onClick={onReset}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors"
      >
        <RefreshCw className="w-4 h-4" />
        Reintentar
      </button>
    </div>
  );
}

/**
 * Fallback para errores a nivel de componente (inline)
 */
function ComponentLevelErrorFallback({ error, onReset }: ErrorFallbackProps) {
  return (
    <div className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0" />
      
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-red-800 dark:text-red-200">
          {error.userMessage.title}
        </p>
        <p className="text-xs text-red-600 dark:text-red-300 mt-0.5">
          {error.userMessage.description}
        </p>
      </div>

      <button
        onClick={onReset}
        className="flex-shrink-0 p-1.5 rounded-md hover:bg-red-100 dark:hover:bg-red-800/50 text-red-600 dark:text-red-400 transition-colors"
        aria-label="Reintentar"
      >
        <RefreshCw className="w-4 h-4" />
      </button>
    </div>
  );
}

// ============================================================================
// HOOK WRAPPER
// ============================================================================

/**
 * HOC para envolver componentes con ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  options?: Omit<ErrorBoundaryProps, "children">
): React.FC<P> {
  const WrappedComponent: React.FC<P> = (props) => (
    <ErrorBoundary {...options}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
}

// ============================================================================
// EXPORTS
// ============================================================================

export default ErrorBoundary;
