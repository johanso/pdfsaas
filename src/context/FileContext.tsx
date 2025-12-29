"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";
import { toast } from "sonner";
import { getOfficePageCount } from "@/lib/office-utils";

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
    const validFiles = skipPdfValidation
      ? newFiles
      : newFiles.filter(f => f.type === "application/pdf");

    if (!skipPdfValidation && validFiles.length < newFiles.length) {
      toast.error("Algunos archivos no eran PDF y fueron ignorados.");
    }

    if (validFiles.length === 0) return;

    const mappedFilesPromises = validFiles.map(async (f) => {
      let pageCount: number | undefined;

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

    const mappedFiles = await Promise.all(mappedFilesPromises);
    setFiles(prev => [...prev, ...mappedFiles]); // Append to existing
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
