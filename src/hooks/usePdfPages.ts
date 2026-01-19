import { useState, useEffect, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
import { PageData } from "@/types";
import { usePdfjs } from "@/hooks/core/usePdfjs";

export function usePdfPages(file: File | null) {
  const [pages, setPages] = useState<PageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [passwordProtectedFileName, setPasswordProtectedFileName] = useState<string | null>(null);
  const { loadDocument } = usePdfjs();

  useEffect(() => {
    if (!file) {
      setPages([]);
      setIsLoading(false);
      setHasPasswordError(false);
      setPasswordProtectedFileName(null);
      return;
    }

    const loadPages = async () => {
      let objectUrl: string | null = null;
      setIsLoading(true);
      // Limpiar errores previos
      setHasPasswordError(false);
      setPasswordProtectedFileName(null);
      try {
        if (typeof window === "undefined") {
          throw new Error("PDF loading only works in browser");
        }

        objectUrl = URL.createObjectURL(file);
        const pdf = await loadDocument(objectUrl);

        const newPages: PageData[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          newPages.push({
            id: crypto.randomUUID(),
            originalIndex: i,
            rotation: 0,
            file: file,
            isBlank: false
          });
        }
        setPages(newPages);

        // Cleanup document
        await pdf.destroy();
      } catch (error: any) {
        console.error(error);

        // IMPORTANTE: Resetear isLoading ANTES de mostrar el error
        // Esto evita que el modal de "Preparando archivo..." se quede bloqueado
        setIsLoading(false);

        if (error.name === "PasswordException") {
          // Setear el estado de error de contraseña
          setHasPasswordError(true);
          setPasswordProtectedFileName(file.name);

          const protectedError = createError.fileProtected(file.name);
          notify.error(protectedError.userMessage.description);
        } else {
          const appError = createError.fromUnknown(error, { context: "pdf-pages" });
          notify.error(appError.userMessage.description);
        }
        setPages([]);
        return; // Salir temprano para evitar el finally
      } finally {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        // Solo resetear isLoading aquí si no hubo error
        setIsLoading(false);
      }
    };

    loadPages();
  }, [file, loadDocument]);

  const rotatePage = useCallback((id: string, degrees: number = 90) => {
    setPages(prev => prev.map(p =>
      p.id === id ? { ...p, rotation: p.rotation + degrees } : p
    ));
  }, []);

  const rotateAllPages = useCallback((degrees: number) => {
    setPages(prev => prev.map(p => ({
      ...p,
      rotation: p.rotation + degrees
    })));
  }, []);

  const resetRotation = useCallback(() => {
    setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
  }, []);

  const reorderPages = useCallback((newPages: PageData[]) => {
    setPages(newPages);
  }, []);

  const removePage = useCallback((id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  }, []);

  const clearPasswordError = useCallback(() => {
    setHasPasswordError(false);
    setPasswordProtectedFileName(null);
  }, []);

  return {
    pages,
    setPages,
    isLoading,
    hasPasswordError,
    passwordProtectedFileName,
    rotatePage,
    rotateAllPages,
    resetRotation,
    reorderPages,
    removePage,
    clearPasswordError
  };
}
