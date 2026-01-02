import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

// Tipos
export type DpiOption = 150 | 300 | 600;
export type OcrStatus = "scanned" | "has-text" | "unknown";

export interface Language {
  code: string;
  name: string;
  nativeName?: string;
}

export interface DetectResult {
  needsOcr: boolean;
  status: OcrStatus;
  confidence?: number;
  message?: string;
}

export interface OcrOptions {
  languages: string[];
  dpi: DpiOption;
  optimize: boolean;
  onProgress?: (current: number, total: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface OcrResult {
  success: boolean;
  error?: string;
  blob?: Blob;
  fileName?: string;
}

// Opciones de DPI
export const DPI_OPTIONS: { value: DpiOption; label: string; description: string }[] = [
  { value: 150, label: "150 DPI", description: "Rápido" },
  { value: 300, label: "300 DPI", description: "Estándar" },
  { value: 600, label: "600 DPI", description: "Alta calidad" },
];

// Idiomas predeterminados
export const DEFAULT_LANGUAGES = ["spa"];

export function useOcrPdf() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [downloadData, setDownloadData] = useState<{ blob: Blob; fileName: string } | null>(null);
  const [availableLanguages, setAvailableLanguages] = useState<Language[]>([]);
  const [isLoadingLanguages, setIsLoadingLanguages] = useState(false);

  // Cargar idiomas disponibles
  useEffect(() => {
    loadLanguages();
  }, []);

  const loadLanguages = useCallback(async () => {
    setIsLoadingLanguages(true);
    try {
      const response = await fetch(getApiUrl("/api/worker/ocr-pdf/languages"));
      if (response.ok) {
        const data = await response.json();
        if (data.languages && data.languages.length > 0) {
          setAvailableLanguages(data.languages);
          setIsLoadingLanguages(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error loading languages:", error);
    }

    // Usar idiomas por defecto si falla la carga o no hay respuesta
    setAvailableLanguages([
      { code: "spa", name: "Spanish", nativeName: "Español" },
      { code: "eng", name: "English", nativeName: "English" },
      { code: "fra", name: "French", nativeName: "Français" },
      { code: "deu", name: "German", nativeName: "Deutsch" },
      { code: "por", name: "Portuguese", nativeName: "Português" },
      { code: "ita", name: "Italian", nativeName: "Italiano" },
    ]);
    setIsLoadingLanguages(false);
  }, []);

  // Detectar si el PDF necesita OCR
  const detectOcr = useCallback(async (file: File): Promise<DetectResult> => {
    setIsDetecting(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch(getApiUrl("/api/worker/ocr-pdf/detect"), {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Error detectando OCR");
      }

      const data = await response.json();

      return {
        needsOcr: data.needsOcr || false,
        status: data.needsOcr ? "scanned" : "has-text",
        confidence: data.confidence,
        message: data.message,
      };
    } catch (error) {
      console.error("Error detecting OCR:", error);
      // En caso de error, asumimos que necesita OCR
      return {
        needsOcr: true,
        status: "unknown",
        message: "No se pudo detectar el estado del PDF",
      };
    } finally {
      setIsDetecting(false);
    }
  }, []);

  // Aplicar OCR al PDF
  const applyOcr = useCallback(
    async (
      file: File,
      fileName: string,
      options: OcrOptions
    ): Promise<OcrResult> => {
      const { languages, dpi, optimize, onProgress, onSuccess, onError } = options;

      setIsProcessing(true);
      setProgress({ current: 0, total: 100 });

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("languages", languages.join(","));
        formData.append("dpi", dpi.toString());
        formData.append("optimize", optimize.toString());

        // Simular progreso durante el upload
        onProgress?.(10, 100);
        setProgress({ current: 10, total: 100 });

        const response = await fetch(getApiUrl("/api/worker/ocr-pdf"), {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const text = await response.text();
          let errorMsg = "Error en el servidor";
          try {
            const error = JSON.parse(text);
            errorMsg = error.error || errorMsg;
          } catch {
            errorMsg = text || errorMsg;
          }
          throw new Error(errorMsg);
        }

        // Progreso de procesamiento
        onProgress?.(50, 100);
        setProgress({ current: 50, total: 100 });

        // El backend devuelve JSON con fileId
        const data = await response.json();

        if (!data.success || !data.fileId) {
          throw new Error(data.error || "Error al procesar OCR");
        }

        // Descargar el archivo desde el endpoint de download
        onProgress?.(75, 100);
        setProgress({ current: 75, total: 100 });

        const downloadUrl = getApiUrl(`/api/worker/download/${data.fileId}`);
        const downloadResponse = await fetch(downloadUrl);

        if (!downloadResponse.ok) {
          throw new Error("Error al descargar el archivo procesado");
        }

        const blob = await downloadResponse.blob();
        const finalName = data.fileName || `${fileName}-ocr.pdf`;

        // Descargar el archivo
        downloadBlob(blob, finalName);

        onProgress?.(100, 100);
        setProgress({ current: 100, total: 100 });

        setIsComplete(true);
        setDownloadData({ blob, fileName: finalName });

        toast.success("¡OCR aplicado correctamente!");
        onSuccess?.();

        return { success: true, blob, fileName: finalName };
      } catch (error) {
        console.error("OCR error:", error);
        const errorMessage = error instanceof Error ? error.message : "Error durante el OCR";
        toast.error(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));

        // Reset on error
        setIsProcessing(false);
        setProgress({ current: 0, total: 0 });

        return { success: false, error: errorMessage };
      }
    },
    []
  );

  const handleDownloadAgain = useCallback(() => {
    if (downloadData) {
      const url = URL.createObjectURL(downloadData.blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = downloadData.fileName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Archivo descargado nuevamente");
    }
  }, [downloadData]);

  const handleStartNew = useCallback(() => {
    setIsProcessing(false);
    setIsComplete(false);
    setProgress({ current: 0, total: 0 });
    setDownloadData(null);
  }, []);

  return {
    // Estado
    isProcessing,
    isDetecting,
    isComplete,
    progress,
    downloadData,
    availableLanguages,
    isLoadingLanguages,

    // Métodos
    detectOcr,
    applyOcr,
    handleDownloadAgain,
    handleStartNew,
    loadLanguages,
  };
}

// Utilidad para descargar blob
function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
