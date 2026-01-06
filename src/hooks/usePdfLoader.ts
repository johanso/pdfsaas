import { useState, useEffect } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";

interface UsePdfLoaderOptions {
  onLoad?: (numPages: number) => void;
  onError?: (error: Error) => void;
}

// Función auxiliar para cargar pdfjs solo en el cliente
async function loadPdfInfo(file: File): Promise<number> {
  if (typeof window === "undefined") {
    throw new Error("PDF loading only works in browser");
  }

  try {
    // Importar dinámicamente para evitar que sea empaquetado en build-time
    const pdfjsModule = await import("pdfjs-dist");
    const pdfjs = pdfjsModule.default || pdfjsModule;
    pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

    const objectUrl = URL.createObjectURL(file);
    const pdf = await pdfjs.getDocument(objectUrl).promise;
    const numPages = pdf.numPages;

    await pdf.destroy();
    URL.revokeObjectURL(objectUrl);

    return numPages;
  } catch (error) {
    throw error;
  }
}

export function usePdfLoader(file: File | null, options?: UsePdfLoaderOptions) {
  const [numPages, setNumPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!file) {
      setNumPages(0);
      return;
    }

    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const pages = await loadPdfInfo(file);
        setNumPages(pages);
        options?.onLoad?.(pages);
      } catch (err) {
        console.error(err);
        const appError = createError.fromUnknown(err, { context: "pdf-loader" });
        notify.error(appError.userMessage.description);
        options?.onError?.(appError);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [file]);

  return { numPages, isLoading };
}