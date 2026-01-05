import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
// El import de pdfjs se movió a inside de las funciones que lo usan para lazy loading
// import * as pdfjs from "pdfjs-dist";
import JSZip from "jszip";
import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

// Configurar worker de pdfjs (se hará dinámicamente)
// pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// ============================================================================
// TYPES
// ============================================================================

export type ImageFormat = "jpg" | "png" | "webp" | "tiff" | "bmp";
export type ProcessingMode = "client" | "server" | "auto";
export type DpiOption = 72 | 150 | 300 | 600;

export type { UploadStats };

export interface ConvertOptions {
  format: ImageFormat;
  quality: number;
  scale?: number;
  dpi?: DpiOption;
  mode?: ProcessingMode;
  onProgress?: (current: number, total: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export interface FormatInfo {
  label: string;
  description: string;
  supportsQuality: boolean;
  requiresServer: boolean;
  recommended?: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const SERVER_ONLY_FORMATS: ImageFormat[] = ["tiff", "bmp"];

const CLIENT_LIMITS = {
  maxFileSize: 20 * 1024 * 1024, // 20MB
  maxPages: 30,
  maxSelectedPages: 50,
};

const FORMAT_INFO: Record<ImageFormat, FormatInfo> = {
  jpg: {
    label: "JPG",
    description: "Ideal para fotos",
    supportsQuality: true,
    requiresServer: false,
    recommended: true,
  },
  png: {
    label: "PNG",
    description: "Sin pérdida",
    supportsQuality: false,
    requiresServer: false,
  },
  webp: {
    label: "WebP",
    description: "Moderno",
    supportsQuality: true,
    requiresServer: false,
  },
  tiff: {
    label: "TIFF",
    description: "Profesional",
    supportsQuality: false,
    requiresServer: true,
  },
  bmp: {
    label: "BMP",
    description: "Legacy",
    supportsQuality: false,
    requiresServer: true,
  },
};

// ============================================================================
// HELPERS
// ============================================================================

export function shouldUseServer(
  file: File | null,
  totalPages: number,
  selectedPagesCount: number,
  format: ImageFormat,
  dpi?: DpiOption
): { useServer: boolean; reason?: string } {
  if (!file) return { useServer: false };

  if (SERVER_ONLY_FORMATS.includes(format)) {
    return {
      useServer: true,
      reason: `El formato ${format.toUpperCase()} requiere procesamiento en servidor`,
    };
  }

  if (dpi && dpi > 300) {
    return {
      useServer: true,
      reason: "DPI alto requiere procesamiento en servidor",
    };
  }

  if (file.size > CLIENT_LIMITS.maxFileSize) {
    return {
      useServer: true,
      reason: "Archivo grande, procesando en servidor",
    };
  }

  if (totalPages > CLIENT_LIMITS.maxPages) {
    return {
      useServer: true,
      reason: "PDF con muchas páginas, procesando en servidor",
    };
  }

  if (selectedPagesCount > CLIENT_LIMITS.maxSelectedPages) {
    return {
      useServer: true,
      reason: "Muchas páginas seleccionadas, procesando en servidor",
    };
  }

  return { useServer: false };
}

export function getFormatInfo(format: ImageFormat): FormatInfo {
  return FORMAT_INFO[format];
}

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

// ============================================================================
// HOOK
// ============================================================================

export function usePdfToImage() {
  const [processingMode, setProcessingMode] = useState<"client" | "server" | null>(null);
  const [clientProgress, setClientProgress] = useState({ current: 0, total: 0 });
  const [isInternalComplete, setIsInternalComplete] = useState(false);

  const processor = useToolProcessor<
    { file: File; selectedPageIndices: number[]; options: ConvertOptions },
    ProcessingResult
  >({
    toolId: "pdf-to-image",
    endpoint: "/api/worker/pdf-to-image",
    operationName: "Convirtiendo páginas...",
    responseType: "blob",

    prepareFormData: async (_, { file, selectedPageIndices, options }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("format", options.format);
      formData.append("quality", options.quality.toString());
      formData.append("dpi", (options.dpi || 150).toString());
      formData.append("pages", selectedPageIndices.map((i) => i + 1).join(","));
      return formData;
    },

    getResultFileName: (_, original) => original,
  });

  // -- Conversión en cliente --
  const convertOnClient = useCallback(
    async (
      file: File,
      selectedPageIndices: number[],
      fileName: string,
      options: ConvertOptions
    ): Promise<ProcessingResult> => {
      const { format, quality, scale = 2.0, onProgress } = options;

      try {
        const pdfjs = await import("pdfjs-dist");
        pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const imageBlobs: { blob: Blob; name: string }[] = [];

        for (let i = 0; i < selectedPageIndices.length; i++) {
          const pageNum = selectedPageIndices[i] + 1;

          setClientProgress({ current: i + 1, total: selectedPageIndices.length });
          onProgress?.(i + 1, selectedPageIndices.length);

          const page = await pdf.getPage(pageNum);
          const viewport = page.getViewport({ scale });

          const canvas = document.createElement("canvas");
          const context = canvas.getContext("2d", { alpha: format === "png" })!;
          canvas.width = viewport.width;
          canvas.height = viewport.height;

          if (format !== "png") {
            context.fillStyle = "#ffffff";
            context.fillRect(0, 0, canvas.width, canvas.height);
          }

          await page.render({ canvasContext: context, viewport }).promise;

          const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
          const blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => (b ? resolve(b) : reject(new Error("Error creando imagen"))),
              mimeType,
              format === "png" ? undefined : quality / 100
            );
          });

          const extension = format === "jpg" ? "jpg" : format;
          imageBlobs.push({ blob, name: `page-${pageNum}.${extension}` });

          page.cleanup();
        }

        pdf.destroy();

        let finalBlob: Blob;
        let finalName: string;

        if (imageBlobs.length === 1) {
          finalBlob = imageBlobs[0].blob;
          finalName = `${fileName}.${imageBlobs[0].name.split(".").pop()}`;
        } else {
          const zip = new JSZip();
          imageBlobs.forEach((b) => zip.file(b.name, b.blob));
          finalBlob = await zip.generateAsync({ type: "blob" });
          finalName = `${fileName}.zip`;
        }

        downloadBlob(finalBlob, finalName);

        return { success: true, blob: finalBlob, fileName: finalName };
      } catch (error) {
        console.error("Client conversion error:", error);
        throw error;
      }
    },
    []
  );

  // -- Método principal de conversión --
  const convertAndDownload = useCallback(
    async (
      file: File,
      selectedPageIndices: number[],
      fileName: string,
      options: ConvertOptions
    ): Promise<ProcessingResult> => {
      if (selectedPageIndices.length === 0) {
        toast.error("Selecciona al menos una página");
        return { success: false };
      }

      const mode = options.mode || "auto";
      const formatInfo = getFormatInfo(options.format);
      let useServer = formatInfo.requiresServer;

      if (mode === "server") {
        useServer = true;
      } else if (mode === "client" && !formatInfo.requiresServer) {
        useServer = false;
      } else if (mode === "auto") {
        const check = shouldUseServer(
          file,
          0,
          selectedPageIndices.length,
          options.format,
          options.dpi
        );
        useServer = check.useServer;
        if (check.reason) {
          toast.info(check.reason);
        }
      }

      setProcessingMode(useServer ? "server" : "client");

      try {
        let result: ProcessingResult | null;

        if (useServer) {
          const ext =
            selectedPageIndices.length === 1
              ? options.format === "jpg"
                ? "jpg"
                : options.format
              : "zip";

          result = await processor.process(
            [file],
            { file, selectedPageIndices, options },
            `${fileName}.${ext}`
          );
        } else {
          result = await convertOnClient(file, selectedPageIndices, fileName, options);
        }

        if (result?.success) {
          setIsInternalComplete(true);
          if (!useServer) {
            toast.success("¡Conversión completada!");
          }
          options.onSuccess?.();
          return result;
        }

        throw new Error("Error en la conversión");
      } catch (error) {
        const err = error instanceof Error ? error : new Error("Error en conversión");
        if (processingMode === "client") {
          toast.error(err.message);
        }
        options.onError?.(err);
        setProcessingMode(null);
        setClientProgress({ current: 0, total: 0 });
        return { success: false };
      }
    },
    [convertOnClient, processor, processingMode]
  );

  // -- Progreso combinado --
  const progressValue = useMemo(() => {
    if (processingMode === "server") {
      return { current: processor.progress, total: 100 };
    }
    return clientProgress;
  }, [processingMode, processor.progress, clientProgress]);

  return {
    // Estado
    isProcessing: processor.isProcessing || (clientProgress.total > 0 && !isInternalComplete),
    isComplete: isInternalComplete || processor.isComplete,
    progress: progressValue,
    processingMode,

    // Acciones
    convertAndDownload,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew: () => {
      setIsInternalComplete(false);
      setProcessingMode(null);
      setClientProgress({ current: 0, total: 0 });
      processor.reset();
    },

    // Utilidades
    shouldUseServer,
    getFormatInfo,
  };
}