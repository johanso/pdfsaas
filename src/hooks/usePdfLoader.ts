import { useState, useEffect } from "react";
import { toast } from "sonner";

interface UsePdfLoaderOptions {
  onLoad?: (numPages: number) => void;
  onError?: (error: Error) => void;
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
      let objectUrl: string | null = null;
      try {
        const { pdfjs } = await import("react-pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        objectUrl = URL.createObjectURL(file);
        const pdf = await pdfjs.getDocument(objectUrl).promise;

        setNumPages(pdf.numPages);
        options?.onLoad?.(pdf.numPages);

        // Cleanup document
        await pdf.destroy();
      } catch (err) {
        console.error(err);
        const error = err instanceof Error ? err : new Error("Error al leer el archivo PDF");
        toast.error(error.message);
        options?.onError?.(error);
      } finally {
        if (objectUrl) {
          URL.revokeObjectURL(objectUrl);
        }
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [file]);

  return { numPages, isLoading };
}