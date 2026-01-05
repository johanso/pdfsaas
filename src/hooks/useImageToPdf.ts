import { useState, useCallback, useMemo } from "react";
import { notify } from "@/lib/errors/notifications";
import { createError } from "@/lib/errors/error-types";
// Import dinámico de pdf-lib para reducir bundle inicial
// import { PDFDocument, degrees } from "pdf-lib";
import { useToolProcessor, ProcessingResult, UploadStats } from "./core/useToolProcessor";

// ============================================================================
// TYPES
// ============================================================================

export type PageSize = "a4" | "letter" | "legal" | "fit";
export type PageOrientation = "auto" | "portrait" | "landscape";
export type MarginPreset = "none" | "small" | "normal";
export type ImageQuality = "original" | "compressed";

export type { UploadStats };

export interface ImageItem {
  id: string;
  file: File;
  rotation: number;
  preview?: string;
}

export interface ConvertOptions {
  pageSize: PageSize;
  orientation: PageOrientation;
  margin: MarginPreset;
  quality: ImageQuality;
  onProgress?: (current: number, total: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CLIENT_LIMIT = 50;

const PAGE_SIZES = {
  a4: { width: 595.28, height: 841.89 },
  letter: { width: 612, height: 792 },
  legal: { width: 612, height: 1008 },
};

const MARGINS = {
  none: 0,
  small: 20,
  normal: 40,
};

// ============================================================================
// HELPERS
// ============================================================================

export function shouldUseServer(imageCount: number): {
  useServer: boolean;
  reason?: string;
} {
  if (imageCount >= CLIENT_LIMIT) {
    return {
      useServer: true,
      reason: `Más de ${CLIENT_LIMIT} imágenes, procesando en servidor`,
    };
  }
  return { useServer: false };
}

async function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

async function imageToBytes(file: File, quality: ImageQuality): Promise<Uint8Array> {
  const buf = await file.arrayBuffer();
  if (quality === "compressed" && !file.type.includes("png")) {
    return convertToJpeg(file, 0.8);
  }
  return new Uint8Array(buf);
}

async function convertToJpeg(file: File, quality = 0.9): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            blob.arrayBuffer().then((buf) => resolve(new Uint8Array(buf)));
          } else {
            reject(new Error("Error convirtiendo imagen"));
          }
        },
        "image/jpeg",
        quality
      );

      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
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

export function useImageToPdf() {
  const [processingMode, setProcessingMode] = useState<"client" | "server" | null>(null);
  const [clientProgress, setClientProgress] = useState({ current: 0, total: 0 });
  const [isInternalComplete, setIsInternalComplete] = useState(false);

  const processor = useToolProcessor<
    { images: ImageItem[]; options: ConvertOptions },
    ProcessingResult
  >({
    toolId: "image-to-pdf",
    endpoint: "/api/worker/image-to-pdf",
    operationName: "Creando PDF...",
    responseType: "blob",

    prepareFormData: async (_, { images, options }) => {
      const formData = new FormData();
      for (let i = 0; i < images.length; i++) {
        formData.append("images", images[i].file);
        formData.append("rotations", images[i].rotation.toString());
      }
      formData.append("pageSize", options.pageSize);
      formData.append("orientation", options.orientation);
      formData.append("margin", options.margin);
      formData.append("quality", options.quality);
      return formData;
    },
  });

  // -- Conversión en cliente --
  const convertOnClient = useCallback(
    async (
      images: ImageItem[],
      fileName: string,
      options: ConvertOptions
    ): Promise<ProcessingResult> => {
      const { pageSize, orientation, margin, quality, onProgress } = options;
      const marginPx = MARGINS[margin];

      try {
        const { PDFDocument, degrees } = await import("pdf-lib");
        const pdfDoc = await PDFDocument.create();

        for (let i = 0; i < images.length; i++) {
          const { file, rotation } = images[i];

          setClientProgress({ current: i + 1, total: images.length });
          onProgress?.(i + 1, images.length);

          const dimensions = await getImageDimensions(file);
          let imgWidth = dimensions.width;
          let imgHeight = dimensions.height;

          // Ajustar dimensiones si hay rotación
          if (rotation === 90 || rotation === 270) {
            [imgWidth, imgHeight] = [imgHeight, imgWidth];
          }

          let pageWidth: number;
          let pageHeight: number;

          if (pageSize === "fit") {
            pageWidth = imgWidth + marginPx * 2;
            pageHeight = imgHeight + marginPx * 2;
          } else {
            const size = PAGE_SIZES[pageSize];
            const usePortrait =
              orientation === "portrait" ||
              (orientation === "auto" && imgHeight >= imgWidth);

            pageWidth = usePortrait ? size.width : size.height;
            pageHeight = usePortrait ? size.height : size.width;
          }

          const page = pdfDoc.addPage([pageWidth, pageHeight]);
          const availableWidth = pageWidth - marginPx * 2;
          const availableHeight = pageHeight - marginPx * 2;

          let drawWidth = imgWidth;
          let drawHeight = imgHeight;

          if (pageSize !== "fit") {
            const scale = Math.min(
              availableWidth / imgWidth,
              availableHeight / imgHeight,
              1
            );
            drawWidth = imgWidth * scale;
            drawHeight = imgHeight * scale;
          }

          const x = marginPx + (availableWidth - drawWidth) / 2;
          const y = marginPx + (availableHeight - drawHeight) / 2;

          const imageBytes = await imageToBytes(file, quality);
          let pdfImage;
          const fileType = file.type.toLowerCase();

          if (fileType.includes("png")) {
            pdfImage = await pdfDoc.embedPng(imageBytes);
          } else if (fileType.includes("jpeg") || fileType.includes("jpg")) {
            pdfImage = await pdfDoc.embedJpg(imageBytes);
          } else {
            const converted = await convertToJpeg(file);
            pdfImage = await pdfDoc.embedJpg(converted);
          }

          if (rotation === 0) {
            page.drawImage(pdfImage, { x, y, width: drawWidth, height: drawHeight });
          } else {
            page.drawImage(pdfImage, {
              x: x + drawWidth / 2,
              y: y + drawHeight / 2,
              width: rotation % 180 === 0 ? drawWidth : drawHeight,
              height: rotation % 180 === 0 ? drawHeight : drawWidth,
              rotate: degrees(rotation),
            });
          }
        }

        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });

        return { success: true, blob, fileName: `${fileName}.pdf` };
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
      images: ImageItem[],
      fileName: string,
      options: ConvertOptions
    ): Promise<ProcessingResult> => {
      if (images.length === 0) {
        notify.error("Debes agregar al menos una imagen");
        return { success: false };
      }

      const { useServer, reason } = shouldUseServer(images.length);
      setProcessingMode(useServer ? "server" : "client");

      if (reason) {
        notify.info(reason);
      }

      try {
        let result: ProcessingResult | null;

        if (useServer) {
          result = await processor.process(
            images.map((i) => i.file),
            { images, options },
            `${fileName}.pdf`
          );
        } else {
          result = await convertOnClient(images, fileName, options);
          if (result.success && result.blob && result.fileName) {
            downloadBlob(result.blob, result.fileName);
          }
        }

        if (result?.success) {
          setIsInternalComplete(true);
          if (!useServer) {
            notify.success("¡PDF creado correctamente!");
          }
          options.onSuccess?.();
          return result;
        }

        throw new Error("Error en la conversión");
      } catch (error) {
        const appError = createError.fromUnknown(error, { context: "image-to-pdf" });
        if (processingMode === "client") {
          notify.error(appError.userMessage.description);
        }
        options.onError?.(appError);
        setProcessingMode(null);
        setClientProgress({ current: 0, total: 0 });
        return { success: false };
      }
    },
    [convertOnClient, processor, processingMode]
  );

  // -- Reset --
  const handleStartNew = useCallback(() => {
    setIsInternalComplete(false);
    setProcessingMode(null);
    setClientProgress({ current: 0, total: 0 });
    processor.reset();
  }, [processor]);

  // -- Progreso combinado --
  const progress = useMemo(() => {
    if (processingMode === "server") {
      return { current: processor.progress, total: 100 };
    }
    return clientProgress;
  }, [processingMode, processor.progress, clientProgress]);

  return {
    // Estado
    isProcessing: processor.isProcessing || (clientProgress.total > 0 && !isInternalComplete),
    isComplete: isInternalComplete || processor.isComplete,
    progress,
    processingMode,

    // Acciones
    convertAndDownload,
    handleDownloadAgain: processor.downloadAgain,
    handleStartNew,

    // Utilidades
    shouldUseServer,
    CLIENT_LIMIT,
  };
}