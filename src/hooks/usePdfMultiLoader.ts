import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";

let isWorkerConfigured = false;

// Función auxiliar para configurar pdfjs
async function setupPdfjs() {
  if (typeof window === "undefined") return;
  
  if (!isWorkerConfigured) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    // @ts-ignore - cMapUrl might be missing in types but is valid in pdfjs-dist
    pdfjs.GlobalWorkerOptions.cMapUrl = `//unpkg.com/pdfjs-dist@3.11.174/cmaps/`;
    // @ts-ignore
    pdfjs.GlobalWorkerOptions.cMapPacked = true;
    isWorkerConfigured = true;
  }
}

export function usePdfMultiLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const loadPdfPages = useCallback(async (files: File[]) => {
    setIsLoading(true);

    try {
      if (typeof window === "undefined") {
        throw new Error("PDF loading only works in browser");
      }

      await setupPdfjs();
      const pdfjs = await import("pdfjs-dist");

      const allPages: Array<{
        id: string;
        file: File;
        originalIndex: number;
        rotation: number;
        isBlank: boolean;
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
          const loadingTask = pdfjs.getDocument(objectUrl);
          const pdf = await loadingTask.promise;

          for (let i = 1; i <= pdf.numPages; i++) {
            allPages.push({
              id: crypto.randomUUID(),
              file: file,
              originalIndex: i,
              rotation: 0,
              isBlank: false
            });
          }

          // Cleanup document
          await pdf.destroy();
        } catch (error: any) {
          console.error(`Error loading ${file.name}:`, error);
          if (error.name === "PasswordException") {
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
  }, []);

  return {
    loadPdfPages,
    isLoading
  };
}