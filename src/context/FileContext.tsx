"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { getOfficePageCount } from "@/lib/office-utils";
import { FILE_SIZE_LIMITS, formatBytes } from "@/lib/config";

export interface PdfFile {
  id: string;
  file: File;
  name: string;
  rotation: number;
  pageCount?: number;
}

interface FileContextType {
  files: PdfFile[];
  setFiles: React.Dispatch<React.SetStateAction<PdfFile[]>>;
  addFiles: (newFiles: File[], skipValidation?: boolean) => Promise<void>;
  rotateFile: (id: string, degrees?: number) => void;
  removeFile: (id: string) => void;
  reorderFiles: (newFiles: PdfFile[]) => void;
  sortAZ: () => void;
  sortZA: () => void;
  reset: () => void;
  getTotalSize: () => number;
  getTotalPages: () => number;
}

export const FileContext = createContext<FileContextType | undefined>(undefined);

export function useFileContext() {
  const context = useContext(FileContext);
  if (context === undefined) {
    throw new Error("useFileContext must be used within a FileContextProvider");
  }
  return context;
}

export function FileContextProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<PdfFile[]>([]);

  // We can't pass skipPdfValidation as a prop easily if we want it global
  // For now, we'll assume validation is needed, or allow all and handle in UI
  // But usePdfFiles had a parameter. 
  // Let's implement addFiles to accept options or just handle everything.
  // The previous usePdfFiles took `skipPdfValidation` as an arg to the hook.
  // Since this is global, we need a way to know if we should skip validation.
  // Ideally, the "Tool" sets the mode. But for simplicity, we can let addFiles take a "skipValidation" flag?
  // Or better, checking the current route?
  // User request: "Manejar un estado global".
  // Let's modify addFiles to accept options.

  const addFiles = async (newFiles: File[], skipPdfValidation: boolean = false) => {
    // ===== VALIDACIÓN 1: Tamaño individual =====
    const oversizedFiles = newFiles.filter(f => f.size > FILE_SIZE_LIMITS.max);
    if (oversizedFiles.length > 0) {
      toast.error(
        `${oversizedFiles.length} archivo${oversizedFiles.length > 1 ? 's exceden' : ' excede'} el límite de ${formatBytes(FILE_SIZE_LIMITS.max)}`,
        {
          description: oversizedFiles.map(f => f.name).slice(0, 3).join(", ") + (oversizedFiles.length > 3 ? "..." : ""),
          duration: 5000
        }
      );
    }

    const sizedFiles = newFiles.filter(f => f.size <= FILE_SIZE_LIMITS.max);
    if (sizedFiles.length === 0) return;

    // ===== VALIDACIÓN 2: Tamaño total del batch =====
    const currentTotalSize = files.reduce((acc, f) => acc + f.file.size, 0);
    const newTotalSize = sizedFiles.reduce((acc, f) => acc + f.size, 0);
    
    if (currentTotalSize + newTotalSize > FILE_SIZE_LIMITS.maxBatch) {
      const availableSpace = FILE_SIZE_LIMITS.maxBatch - currentTotalSize;
      toast.error("Límite total excedido", {
        description: `Máximo ${formatBytes(FILE_SIZE_LIMITS.maxBatch)} por lote. Espacio disponible: ${formatBytes(availableSpace)}`,
        duration: 5000
      });
      return;
    }

    // ===== VALIDACIÓN 3: Tipo de archivo =====
    const validFiles = skipPdfValidation
      ? sizedFiles
      : sizedFiles.filter(f => f.type === "application/pdf");

    if (!skipPdfValidation && validFiles.length < sizedFiles.length) {
      toast.error("Algunos archivos no eran PDF y fueron ignorados.");
    }

    if (validFiles.length === 0) return;

    let protectedCount = 0;

    const mappedFilesPromises = validFiles.map(async (f): Promise<PdfFile | null> => {
      let pageCount: number | undefined;

      if (f.type === "application/pdf") {
        try {
          const { pdfjs } = await import("react-pdf");
          pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

          const buffer = await f.arrayBuffer();
          const pdf = await pdfjs.getDocument(buffer).promise;
          pageCount = pdf.numPages;
        } catch (error: any) {
          if (error.name === "PasswordException") {
            protectedCount++;
            return null;
          }
          console.error("Error extracting PDF page count:", error);
        }
      } else if (skipPdfValidation) {
        // Office files logic
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

    const resolvedFiles = await Promise.all(mappedFilesPromises);
    const mappedFiles = resolvedFiles.filter((f): f is PdfFile => f !== null);

    if (protectedCount > 0) {
      toast.error(
        `${protectedCount} archivo${protectedCount > 1 ? 's' : ''} protegido${protectedCount > 1 ? 's' : ''} detectado${protectedCount > 1 ? 's' : ''} y descartado${protectedCount > 1 ? 's' : ''}.`,
        {
          description: "Por favor, desbloquéalos primero.",
          action: {
            label: "Desbloquear PDF",
            onClick: () => window.location.href = "/desbloquear-pdf"
          },
          duration: 6000
        }
      );
    }

    if (mappedFiles.length > 0) {
      setFiles(prev => [...mappedFiles, ...prev]);
    }
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
    // toast.success("Archivos restablecidos."); // Optional, might be annoying on nav
  };

  const getTotalSize = () => {
    return files.reduce((acc, f) => acc + f.file.size, 0);
  };

  const getTotalPages = () => {
    return files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  };

  return (
    <FileContext.Provider value={{
      files,
      setFiles,
      addFiles,
      // Actually, let's expose specific add methods or update interface
      // To keep it simple and compatible with current usage (which expects addFiles(files)),
      // I'll stick to default validation=true (PDF only).
      // But wait, Word-to-PDF needs non-PDFs.
      // I should update the interface to: addFiles: (files: File[], skipValidation?: boolean) => Promise<void>
      rotateFile,
      removeFile,
      reorderFiles,
      sortAZ,
      sortZA,
      reset,
      getTotalSize,
      getTotalPages
    }}>
      {children}
    </FileContext.Provider>
  );
}
