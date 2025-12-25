import { useState } from "react";
import { toast } from "sonner";

import { getOfficePageCount } from "@/lib/office-utils";

export interface PdfFile {
  id: string;
  file: File;
  name: string;
  rotation: number;
  pageCount?: number;
}

export function usePdfFiles(skipPdfValidation: boolean = false) {
  const [files, setFiles] = useState<PdfFile[]>([]);

  const addFiles = async (newFiles: File[]) => {
    // Si skipPdfValidation es true, aceptamos cualquier archivo
    const validFiles = skipPdfValidation
      ? newFiles
      : newFiles.filter(f => f.type === "application/pdf");

    if (!skipPdfValidation && validFiles.length < newFiles.length) {
      toast.error("Algunos archivos no eran PDF y fueron ignorados.");
    }

    if (validFiles.length === 0) return;

    // Extract page counts for each PDF or Office file
    const mappedFilesPromises = validFiles.map(async (f) => {
      let pageCount: number | undefined;

      // Extract pages for PDF
      if (f.type === "application/pdf") {
        try {
          const { pdfjs } = await import("react-pdf");
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

          const buffer = await f.arrayBuffer();
          const pdf = await pdfjs.getDocument(buffer).promise;
          pageCount = pdf.numPages;
        } catch (error) {
          console.error("Error extracting PDF page count:", error);
        }
      }
      // Estimate pages for Office files if skipPdfValidation is true
      else if (skipPdfValidation) {
        const ext = f.name.toLowerCase().split('.').pop();
        const officeExtensions = ['docx', 'doc', 'pptx', 'ppt', 'xlsx', 'xls'];
        if (ext && officeExtensions.includes(ext)) {
          pageCount = await getOfficePageCount(f);
        }
      }

      return {
        id: crypto.randomUUID(),
        file: f,
        name: f.name,
        rotation: 0,
        pageCount
      };
    });

    const mappedFiles = await Promise.all(mappedFilesPromises);
    setFiles(prev => [...mappedFiles, ...prev]);
  };

  const rotateFile = (id: string, degrees: number = 90) => {
    setFiles(files => files.map(f => {
      if (f.id === id) {
        return { ...f, rotation: (f.rotation + degrees) % 360 };
      }
      return f;
    }));
  };

  const removeFile = (id: string) => {
    setFiles(files => files.filter(f => f.id !== id));
  };

  const reorderFiles = (newFiles: PdfFile[]) => {
    setFiles(newFiles);
  };

  const sortAZ = () => {
    setFiles(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
    toast.success("Archivos ordenados alfabéticamente (A-Z).");
  };

  const sortZA = () => {
    setFiles(prev => [...prev].sort((a, b) => b.name.localeCompare(a.name)));
    toast.success("Archivos ordenados alfabéticamente (Z-A).");
  };

  const reset = () => {
    setFiles([]);
    toast.success("Archivos restablecidos.");
  };

  const getTotalSize = () => {
    return files.reduce((acc, f) => acc + f.file.size, 0);
  };

  const getTotalPages = () => {
    return files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  };

  return {
    files,
    setFiles,
    addFiles,
    rotateFile,
    removeFile,
    reorderFiles,
    sortAZ,
    sortZA,
    reset,
    getTotalSize,
    getTotalPages
  };
}