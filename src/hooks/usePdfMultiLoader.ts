import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
import { usePdfjs } from "@/hooks/core/usePdfjs";

export function usePdfMultiLoader() {
  const [isLoading, setIsLoading] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [passwordProtectedFileName, setPasswordProtectedFileName] = useState<string | null>(null);
  const { loadDocument } = usePdfjs();

  const loadPdfPages = useCallback(async (files: File[]) => {
    setIsLoading(true);
    // Limpiar errores previos al iniciar nueva carga
    setHasPasswordError(false);
    setPasswordProtectedFileName(null);

    try {
      if (typeof window === "undefined") {
        throw new Error("PDF loading only works in browser");
      }

      const allPages: Array<{
        id: string;
        file: File;
        originalIndex: number;
        rotation: number;
        isBlank: boolean;
        width: number;
        height: number;
      }> = [];

      for (const file of files) {
        if (file.type !== "application/pdf") {
          const error = createError.fileInvalidType(file.name, file.type, ["application/pdf"]);
          notify.error(error.userMessage.description);
          continue;
        }

        let objectUrl: string | null = null;
        try {
          objectUrl = URL.createObjectURL(file);
          const pdf = await loadDocument(objectUrl);

          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const viewport = page.getViewport({ scale: 1 });

            allPages.push({
              id: crypto.randomUUID(),
              file: file,
              originalIndex: i,
              rotation: 0,
              isBlank: false,
              width: viewport.width,
              height: viewport.height
            });
          }

          // Cleanup document
          await pdf.destroy();
        } catch (error: any) {
          console.error(`Error loading ${file.name}:`, error);
          if (error.name === "PasswordException") {
            setHasPasswordError(true);
            setPasswordProtectedFileName(file.name);

            const protectedError = createError.fileProtected(file.name);
            notify.error(protectedError.userMessage.description);
            // We continue to the next file, this one is skipped as we don't push to allPages
          } else {
            const appError = createError.fromUnknown(error, { context: "pdf-multi-loader" });
            notify.error(appError.userMessage.description);
          }
        } finally {
          if (objectUrl) {
            URL.revokeObjectURL(objectUrl);
          }
        }
      }

      return allPages;
    } catch (error) {
      console.error("Error in loadPdfPages:", error);
      const appError = createError.fromUnknown(error, { context: "pdf-multi-loader" });
      notify.error(appError.userMessage.description);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [loadDocument]);

  const clearPasswordError = useCallback(() => {
    setHasPasswordError(false);
    setPasswordProtectedFileName(null);
  }, []);

  return {
    loadPdfPages,
    isLoading,
    hasPasswordError,
    passwordProtectedFileName,
    clearPasswordError
  };
}