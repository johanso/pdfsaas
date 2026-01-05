import { useState, useEffect, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
import { PageData } from "@/types";

let isWorkerConfigured = false;

// Función auxiliar para configurar pdfjs
async function setupPdfjs() {
  if (typeof window === "undefined") return;
  
  if (!isWorkerConfigured) {
    const pdfjs = await import("pdfjs-dist");
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
    isWorkerConfigured = true;
  }
}

export function usePdfPages(file: File | null) {
  const [pages, setPages] = useState<PageData[]>([]);

  useEffect(() => {
    if (!file) {
      setPages([]);
      return;
    }

    const loadPages = async () => {
      let objectUrl: string | null = null;
      try {
        if (typeof window === "undefined") {
          throw new Error("PDF loading only works in browser");
        }

        await setupPdfjs();
        const pdfjs = await import("pdfjs-dist");

        objectUrl = URL.createObjectURL(file);
        const pdf = await pdfjs.getDocument(objectUrl).promise;

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
        if (error.name === "PasswordException") {
          const protectedError = createError.fileProtected(file.name);
          notify.error(protectedError.userMessage.description);
        } else {
          const appError = createError.fromUnknown(error, { context: "pdf-pages" });
          notify.error(appError.userMessage.description);
        }
        setPages([]);
      } finally {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
      }
    };

    loadPages();
  }, [file]);

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

  return {
    pages,
    setPages,
    rotatePage,
    rotateAllPages,
    resetRotation,
    reorderPages,
    removePage
  };
}