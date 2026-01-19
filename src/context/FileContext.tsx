"use client";

import React, { createContext, useContext, useState, ReactNode, useEffect, useRef, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { notify } from "@/lib/errors/notifications";
import { getOfficePageCount } from "@/lib/office-utils";
import { FILE_SIZE_LIMITS, formatBytes } from "@/lib/config";
import { usePdfjs } from "@/hooks/core/usePdfjs";

export interface PdfFile {
  id: string;
  file: File;
  name: string;
  rotation: number;
  pageCount?: number;
}

// ============================================
// SEPARACIÓN DE STATE Y ACTIONS
// ============================================

interface FileStateType {
  files: PdfFile[];
  isLoading: boolean;
  hasPasswordError: boolean;
  passwordProtectedFileName: string | null;
}

interface FileActionsType {
  setFiles: React.Dispatch<React.SetStateAction<PdfFile[]>>;
  addFiles: (newFiles: File[], skipValidation?: boolean) => Promise<void>;
  rotateFile: (id: string, degrees?: number) => void;
  removeFile: (id: string) => void;
  reorderFiles: (newFiles: PdfFile[]) => void;
  sortAZ: () => void;
  sortZA: () => void;
  reset: () => void;
  clearPasswordError: () => void;
  getTotalSize: () => number;
  getTotalPages: () => number;
}

interface FileContextType extends FileStateType, FileActionsType { }

// Contextos separados para optimizar re-renders
const FileStateContext = createContext<FileStateType | undefined>(undefined);
const FileActionsContext = createContext<FileActionsType | undefined>(undefined);

// Hook para acceder solo al estado (se re-renderiza cuando files o isLoading cambian)
export function useFileState() {
  const context = useContext(FileStateContext);
  if (context === undefined) {
    throw new Error("useFileState must be used within a FileContextProvider");
  }
  return context;
}

// Hook para acceder solo a las acciones (NO se re-renderiza cuando files cambia)
export function useFileActions() {
  const context = useContext(FileActionsContext);
  if (context === undefined) {
    throw new Error("useFileActions must be used within a FileContextProvider");
  }
  return context;
}

// Hook combinado para backward compatibility
export function useFileContext(): FileContextType {
  const state = useFileState();
  const actions = useFileActions();
  return { ...state, ...actions };
}

export function FileContextProvider({ children }: { children: ReactNode }) {
  const [files, setFiles] = useState<PdfFile[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasPasswordError, setHasPasswordError] = useState(false);
  const [passwordProtectedFileName, setPasswordProtectedFileName] = useState<string | null>(null);
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);
  const { getPageCount } = usePdfjs();

  // Reset files when changing routes (to free memory and avoid confusion)
  useEffect(() => {
    if (previousPathname.current && previousPathname.current !== pathname) {
      // Only reset if we're navigating between different tools
      const isToolRoute = (path: string) =>
        path.startsWith('/unir-pdf') ||
        path.startsWith('/imagen-a-pdf') ||
        path.startsWith('/organizar-pdf') ||
        path.startsWith('/excel-a-pdf') ||
        path.startsWith('/word-a-pdf') ||
        path.startsWith('/powerpoint-a-pdf') ||
        path.startsWith('/html-a-pdf') ||
        path.startsWith('/dividir-pdf') ||
        path.startsWith('/eliminar-paginas-pdf') ||
        path.startsWith('/extraer-paginas-pdf') ||
        path.startsWith('/rotar-pdf') ||
        path.startsWith('/pdf-a-imagen') ||
        path.startsWith('/comprimir-pdf') ||
        path.startsWith('/ocr-pdf') ||
        path.startsWith('/proteger-pdf') ||
        path.startsWith('/pdf-escala-grises') ||
        path.startsWith('/aplanar-pdf') ||
        path.startsWith('/reparar-pdf') ||
        path.startsWith('/firmar-pdf') ||
        path.startsWith('/desbloquear-pdf');

      const wasToolRoute = isToolRoute(previousPathname.current);
      const isNowToolRoute = isToolRoute(pathname);

      // Reset if navigating between different tools
      if (wasToolRoute && isNowToolRoute && previousPathname.current !== pathname) {
        setFiles([]);
        setHasPasswordError(false);
        setPasswordProtectedFileName(null);
      }
    }
    previousPathname.current = pathname;
  }, [pathname]);

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

  const addFiles = useCallback(async (newFiles: File[], skipPdfValidation: boolean = false) => {
    setIsLoading(true);
    // Limpiar errores previos de contraseña
    setHasPasswordError(false);
    setPasswordProtectedFileName(null);

    try {
      // Verificar si estamos en la herramienta de desbloqueo
      const isUnlockTool = pathname.startsWith('/desbloquear-pdf');

      // ... same logic
      const oversizedFiles = newFiles.filter(f => f.size > FILE_SIZE_LIMITS.max);
      if (oversizedFiles.length > 0) {
        notify.error(
          `${oversizedFiles.length} archivo${oversizedFiles.length > 1 ? 's exceden' : ' excede'} el límite de ${formatBytes(FILE_SIZE_LIMITS.max)}`
        );
      }

      const sizedFiles = newFiles.filter(f => f.size <= FILE_SIZE_LIMITS.max);
      if (sizedFiles.length === 0) return;

      const currentTotalSize = files.reduce((acc, f) => acc + f.file.size, 0);
      const newTotalSize = sizedFiles.reduce((acc, f) => acc + f.size, 0);

      if (currentTotalSize + newTotalSize > FILE_SIZE_LIMITS.maxBatch) {
        const availableSpace = FILE_SIZE_LIMITS.maxBatch - currentTotalSize;
        notify.error(
          `Máximo ${formatBytes(FILE_SIZE_LIMITS.maxBatch)} por lote. Espacio disponible: ${formatBytes(availableSpace)}`
        );
        return;
      }

      const validFiles = skipPdfValidation
        ? sizedFiles
        : sizedFiles.filter(f => f.type === "application/pdf");

      if (!skipPdfValidation && validFiles.length < sizedFiles.length) {
        notify.warning("Algunos archivos no eran PDF y fueron ignorados.");
      }

      if (validFiles.length === 0) return;

      let protectedCount = 0;
      const protectedFileNames: string[] = [];

      const mappedFilesPromises = validFiles.map(async (f): Promise<PdfFile | null> => {
        let pageCount: number | undefined;

        if (f.type === "application/pdf") {
          try {
            // Usar hook optimizado para lazy loading de pdfjs
            if (typeof window !== "undefined") {
              pageCount = await getPageCount(f);
            }
          } catch (error: any) {
            if (error.name === "PasswordException") {
              // Si estamos en la herramienta de desbloqueo, permitir archivos protegidos
              if (isUnlockTool) {
                // No contar el pageCount pero permitir el archivo
                pageCount = undefined;
              } else {
                // En otras herramientas, descartar archivos protegidos
                protectedCount++;
                protectedFileNames.push(f.name);
                return null;
              }
            } else {
              console.error("Error extracting PDF page count:", error);
            }
          }
        } else if (skipPdfValidation) {
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

      // IMPORTANTE: Resetear isLoading ANTES de mostrar errores
      // Esto evita que el modal de "Preparando archivo..." se quede bloqueado
      setIsLoading(false);

      // Mostrar mensaje de error mejorado para archivos protegidos
      if (protectedCount > 0) {
        const fileList = protectedFileNames.length <= 3
          ? protectedFileNames.join(', ')
          : `${protectedFileNames.slice(0, 2).join(', ')} y ${protectedCount - 2} más`;

        // Setear el estado de error de contraseña para mostrar el componente visual
        setHasPasswordError(true);
        setPasswordProtectedFileName(protectedFileNames[0]);

        notify.error(
          `${protectedCount > 1 ? 'Los archivos' : 'El archivo'} ${fileList} ${protectedCount > 1 ? 'están protegidos' : 'está protegido'} con contraseña. Usa la herramienta "Desbloquear PDF" para trabajar con ${protectedCount > 1 ? 'estos archivos' : 'este archivo'}.`,
          {
            title: "Archivos protegidos detectados",
            duration: 8000
          }
        );
      }

      if (mappedFiles.length > 0) {
        setFiles(prev => [...mappedFiles, ...prev]);
      }
    } catch (unexpectedError) {
      // Capturar cualquier error inesperado y asegurar que el estado de carga se resetee
      console.error("Unexpected error in addFiles:", unexpectedError);
      notify.error("Ocurrió un error al procesar los archivos. Por favor, intenta de nuevo.");
      setIsLoading(false);
    }
  }, [files, pathname]);

  const rotateFile = useCallback((id: string, degrees: number = 90) => {
    setFiles(files => files.map(f => {
      if (f.id === id) {
        return { ...f, rotation: (f.rotation + degrees) % 360 };
      }
      return f;
    }));
  }, []);

  const removeFile = useCallback((id: string) => {
    setFiles(files => files.filter(f => f.id !== id));
  }, []);

  const reorderFiles = useCallback((newFiles: PdfFile[]) => {
    setFiles(newFiles);
  }, []);

  const sortAZ = useCallback(() => {
    setFiles(prev => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
    notify.success("Archivos ordenados alfabéticamente (A-Z).");
  }, []);

  const sortZA = useCallback(() => {
    setFiles(prev => [...prev].sort((a, b) => b.name.localeCompare(a.name)));
    notify.success("Archivos ordenados alfabéticamente (Z-A).");
  }, []);

  const reset = useCallback(() => {
    setFiles([]);
    setHasPasswordError(false);
    setPasswordProtectedFileName(null);
  }, []);

  const clearPasswordError = useCallback(() => {
    setHasPasswordError(false);
    setPasswordProtectedFileName(null);
  }, []);

  const getTotalSize = useCallback(() => {
    return files.reduce((acc, f) => acc + f.file.size, 0);
  }, [files]);

  const getTotalPages = useCallback(() => {
    return files.reduce((acc, f) => acc + (f.pageCount || 0), 0);
  }, [files]);

  // Memoizar el objeto de estado (cambia cuando files o isLoading cambian)
  const stateValue = useMemo<FileStateType>(() => ({
    files,
    isLoading,
    hasPasswordError,
    passwordProtectedFileName
  }), [files, isLoading, hasPasswordError, passwordProtectedFileName]);

  // Memoizar el objeto de acciones (estable, no cambia porque las funciones están en useCallback)
  const actionsValue = useMemo<FileActionsType>(() => ({
    setFiles,
    addFiles,
    rotateFile,
    removeFile,
    reorderFiles,
    sortAZ,
    sortZA,
    reset,
    clearPasswordError,
    getTotalSize,
    getTotalPages,
  }), [setFiles, addFiles, rotateFile, removeFile, reorderFiles, sortAZ, sortZA, reset, clearPasswordError, getTotalSize, getTotalPages]);

  return (
    <FileStateContext.Provider value={stateValue}>
      <FileActionsContext.Provider value={actionsValue}>
        {children}
      </FileActionsContext.Provider>
    </FileStateContext.Provider>
  );
}
