import { useState, useEffect } from "react";
import { toast } from "sonner";
import { PageData } from "@/types";

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
        const { pdfjs } = await import("react-pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
          toast.error("Este PDF está protegido. Usa 'Desbloquear PDF' primero.", {
            action: {
              label: "Desbloquear",
              onClick: () => window.location.href = "/desbloquear-pdf"
            },
            duration: 6000
          });
        } else {
          toast.error("Error al leer el PDF.");
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

  const rotatePage = (id: string, degrees: number = 90) => {
    setPages(prev => prev.map(p =>
      p.id === id ? { ...p, rotation: p.rotation + degrees } : p
    ));
  };

  const rotateAllPages = (degrees: number) => {
    setPages(prev => prev.map(p => ({
      ...p,
      rotation: p.rotation + degrees
    })));
  };

  const resetRotation = () => {
    setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
  };

  const reorderPages = (newPages: PageData[]) => {
    setPages(newPages);
  };

  const removePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
  };

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