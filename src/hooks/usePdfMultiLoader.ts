import { useState, useCallback } from "react";
import { toast } from "sonner";

let isWorkerConfigured = false;

export function usePdfMultiLoader() {
  const [isLoading, setIsLoading] = useState(false);

  const loadPdfPages = useCallback(async (files: File[]) => {
    setIsLoading(true);

    try {
      const { pdfjs } = await import("react-pdf");

      if (!isWorkerConfigured) {
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;
        // @ts-ignore - cMapUrl might be missing in types but is valid in pdfjs-dist
        pdfjs.GlobalWorkerOptions.cMapUrl = `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`;
        // @ts-ignore
        pdfjs.GlobalWorkerOptions.cMapPacked = true;
        isWorkerConfigured = true;
      }

      const allPages: Array<{
        id: string;
        file: File;
        originalIndex: number;
        rotation: number;
        isBlank: boolean;
      }> = [];

      for (const file of files) {
        if (file.type !== "application/pdf") {
          toast.error(`${file.name} no es un archivo PDF válido`);
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
            toast.error(`${file.name} está protegido. Usa "Desbloquear PDF" primero.`, {
              action: {
                label: "Desbloquear",
                onClick: () => window.location.href = "/desbloquear-pdf"
              },
              duration: 6000
            });
            // We continue to the next file, this one is skipped as we don't push to allPages
          } else {
            toast.error(`Error al cargar ${file.name}`);
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
      toast.error("Error al procesar los archivos PDF");
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