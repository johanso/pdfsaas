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
      try {
        const { pdfjs } = await import("react-pdf");
        pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

        const buffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument(buffer).promise;

        const newPages: PageData[] = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          newPages.push({
            id: crypto.randomUUID(),
            originalIndex: i,
            rotation: 0,
            file: file
          });
        }
        setPages(newPages);
      } catch (error) {
        console.error(error);
        toast.error("Error al leer el PDF.");
        setPages([]);
      }
    };

    loadPages();
  }, [file]);

  const rotatePage = (id: string, degrees: number = 90) => {
    setPages(prev => prev.map(p =>
      p.id === id ? { ...p, rotation: (p.rotation + degrees) % 360 } : p
    ));
  };

  const rotateAllPages = (degrees: number) => {
    setPages(prev => prev.map(p => ({
      ...p,
      rotation: (p.rotation + degrees + 360) % 360
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