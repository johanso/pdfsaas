import { useState, useEffect } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
import { usePdfjs } from "@/hooks/core/usePdfjs";

interface UsePdfLoaderOptions {
  onLoad?: (numPages: number) => void;
  onError?: (error: Error) => void;
}

export function usePdfLoader(file: File | null, options?: UsePdfLoaderOptions) {
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [passwordProtectedFileName, setPasswordProtectedFileName] = useState<string | null>(null);
  const { getPageCount } = usePdfjs();

  useEffect(() => {
    if (!file) {
      setNumPages(0);
      setIsLoading(false);
      setHasPasswordError(false);
      setPasswordProtectedFileName(null);
      return;
    }

    const loadPdf = async () => {
      setIsLoading(true);
      // Limpiar errores previos
      setHasPasswordError(false);
      setPasswordProtectedFileName(null);
      try {
        const pages = await getPageCount(file);
        setNumPages(pages);
        options?.onLoad?.(pages);
      } catch (err: any) {
        console.error(err);

        // IMPORTANTE: Resetear isLoading ANTES de mostrar el error
        // Esto evita que el modal de "Preparando archivo..." se quede bloqueado
        setIsLoading(false);

        // Manejar específicamente archivos con contraseña
        if (err.name === "PasswordException") {
          setHasPasswordError(true);
          setPasswordProtectedFileName(file.name);

          const protectedError = createError.fileProtected(file.name);
          notify.error(protectedError.userMessage.description);
          options?.onError?.(protectedError);
        } else {
          const appError = createError.fromUnknown(err, { context: "pdf-loader" });
          notify.error(appError.userMessage.description);
          options?.onError?.(appError);
        }
        return; // Salir temprano para evitar el finally
      } finally {
        // Solo resetear isLoading aquí si no hubo error
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [file, getPageCount, options]);

  const clearPasswordError = () => {
    setHasPasswordError(false);
    setPasswordProtectedFileName(null);
  };

  return { numPages, isLoading, hasPasswordError, passwordProtectedFileName, clearPasswordError };
}