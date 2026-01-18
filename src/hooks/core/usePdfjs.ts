import { useState, useCallback, useRef } from "react";

/**
 * Hook para lazy loading de pdfjs-dist
 *
 * Optimización: Este hook evita que pdfjs-dist (~2.5MB) se incluya en el bundle inicial.
 * La librería solo se carga cuando realmente se necesita usar PDFs.
 *
 * Beneficios:
 * - Reduce bundle inicial en ~2.5MB
 * - Cachea la instancia de pdfjs para múltiples usos
 * - Configura automáticamente el worker
 */

let pdfjsInstance: any = null;
let pdfjsLoadingPromise: Promise<any> | null = null;

export interface PdfDocument {
  numPages: number;
  destroy: () => Promise<void>;
  getPage: (pageNumber: number) => Promise<any>;
}

export interface UsePdfjsReturn {
  /** Carga y retorna la instancia de pdfjs-dist */
  loadPdfjs: () => Promise<any>;
  /** Carga un documento PDF y retorna información del mismo */
  loadDocument: (source: ArrayBuffer | string) => Promise<PdfDocument>;
  /** Obtiene el número de páginas de un archivo PDF */
  getPageCount: (file: File) => Promise<number>;
  /** Indica si pdfjs está cargando actualmente */
  isLoading: boolean;
}

/**
 * Hook para cargar pdfjs-dist de forma lazy
 *
 * @example
 * ```tsx
 * const { loadPdfjs, getPageCount } = usePdfjs();
 *
 * const handleFile = async (file: File) => {
 *   const pageCount = await getPageCount(file);
 *   console.log(`El PDF tiene ${pageCount} páginas`);
 * };
 * ```
 */
export function usePdfjs(): UsePdfjsReturn {
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  /**
   * Carga pdfjs-dist dinámicamente y cachea la instancia
   */
  const loadPdfjs = useCallback(async () => {
    // Si ya está cargado, retornar instancia cacheada
    if (pdfjsInstance) {
      return pdfjsInstance;
    }

    // Si ya está cargando, esperar a que termine
    if (pdfjsLoadingPromise) {
      return pdfjsLoadingPromise;
    }

    // Solo cargar en el navegador
    if (typeof window === "undefined") {
      throw new Error("pdfjs-dist solo funciona en el navegador");
    }

    setIsLoading(true);

    try {
      // Crear promesa de carga compartida
      pdfjsLoadingPromise = import("pdfjs-dist").then((module) => {
        const pdfjs = module.default || module;

        // Configurar worker
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        // Cachear instancia
        pdfjsInstance = pdfjs;

        return pdfjs;
      });

      const result = await pdfjsLoadingPromise;
      return result;

    } catch (error) {
      // Limpiar en caso de error
      pdfjsLoadingPromise = null;
      throw new Error(`Error al cargar pdfjs-dist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Carga un documento PDF desde un ArrayBuffer o URL
   */
  const loadDocument = useCallback(async (source: ArrayBuffer | string): Promise<PdfDocument> => {
    const pdfjs = await loadPdfjs();

    const loadingTask = pdfjs.getDocument(source);
    const pdf = await loadingTask.promise;

    return pdf;
  }, [loadPdfjs]);

  /**
   * Obtiene el número de páginas de un archivo PDF
   * Maneja archivos protegidos lanzando un error específico
   */
  const getPageCount = useCallback(async (file: File): Promise<number> => {
    const pdfjs = await loadPdfjs();

    let arrayBuffer: ArrayBuffer;

    try {
      arrayBuffer = await file.arrayBuffer();
    } catch (error) {
      throw new Error("Error al leer el archivo");
    }

    let pdf: PdfDocument | null = null;

    try {
      pdf = await pdfjs.getDocument(arrayBuffer).promise;

      if (!pdf) {
        throw new Error("Error al cargar el documento PDF");
      }

      const pageCount = pdf.numPages;
      return pageCount;
    } catch (error: any) {
      // Propagar error de contraseña para manejo específico
      if (error.name === "PasswordException") {
        throw error;
      }

      throw new Error("Error al procesar el PDF");
    } finally {
      // Limpiar recursos
      if (pdf) {
        try {
          await pdf.destroy();
        } catch (e) {
          // Ignorar errores de cleanup
          console.warn("Error al destruir documento PDF:", e);
        }
      }
    }
  }, [loadPdfjs]);

  return {
    loadPdfjs,
    loadDocument,
    getPageCount,
    isLoading,
  };
}

/**
 * Función standalone para obtener el conteo de páginas
 * Útil para uso fuera de componentes React
 */
export async function getPdfPageCount(file: File): Promise<number> {
  if (typeof window === "undefined") {
    throw new Error("Esta función solo funciona en el navegador");
  }

  // Reutilizar instancia cacheada si existe
  if (!pdfjsInstance) {
    const module = await import("pdfjs-dist");
    pdfjsInstance = module.default || module;
    pdfjsInstance.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
  }

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsInstance.getDocument(arrayBuffer).promise;
  const pageCount = pdf.numPages;
  await pdf.destroy();

  return pageCount;
}
