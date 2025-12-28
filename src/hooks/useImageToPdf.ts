import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PDFDocument } from "pdf-lib";

// Tipos
export type PageSize = "a4" | "letter" | "legal" | "fit";
export type PageOrientation = "auto" | "portrait" | "landscape";
export type MarginPreset = "none" | "small" | "normal";
export type ImageQuality = "original" | "compressed";

// Límites
const CLIENT_LIMIT = 50;

// Dimensiones de página en puntos (72 DPI)
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

interface ConvertOptions {
  pageSize: PageSize;
  orientation: PageOrientation;
  margin: MarginPreset;
  quality: ImageQuality;
  onProgress?: (current: number, total: number) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface ImageItem {
  id: string;
  file: File;
  rotation: number;
  preview?: string;
}

// Detectar si debe usar servidor
export function shouldUseServer(imageCount: number): {
  useServer: boolean;
  reason?: string
} {
  if (imageCount >= CLIENT_LIMIT) {
    return {
      useServer: true,
      reason: `Más de ${CLIENT_LIMIT} imágenes, procesando en servidor`
    };
  }
  return { useServer: false };
}

// Obtener dimensiones de imagen
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

// Convertir imagen a bytes
async function imageToBytes(file: File, quality: ImageQuality): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = async () => {
      if (quality === "compressed" && !file.type.includes("png")) {
        // Comprimir usando canvas
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d")!;
          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (blob) {
                blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
              } else {
                resolve(new Uint8Array(reader.result as ArrayBuffer));
              }
            },
            "image/jpeg",
            0.8
          );
          URL.revokeObjectURL(img.src);
        };
        img.onerror = () => resolve(new Uint8Array(reader.result as ArrayBuffer));
        img.src = URL.createObjectURL(file);
      } else {
        resolve(new Uint8Array(reader.result as ArrayBuffer));
      }
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
}

export function useImageToPdf() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [processingMode, setProcessingMode] = useState<"client" | "server" | null>(null);

  // Conversión en cliente
  const convertOnClient = useCallback(
    async (
      images: ImageItem[],
      fileName: string,
      options: ConvertOptions
    ): Promise<boolean> => {
      const { pageSize, orientation, margin, quality, onProgress } = options;
      const marginPx = MARGINS[margin];

      try {
        const pdfDoc = await PDFDocument.create();

        for (let i = 0; i < images.length; i++) {
          const { file, rotation } = images[i];

          setProgress({ current: i + 1, total: images.length });
          onProgress?.(i + 1, images.length);

          // Obtener dimensiones originales
          const dimensions = await getImageDimensions(file);
          let imgWidth = dimensions.width;
          let imgHeight = dimensions.height;

          // Ajustar por rotación
          if (rotation === 90 || rotation === 270) {
            [imgWidth, imgHeight] = [imgHeight, imgWidth];
          }

          // Determinar tamaño de página
          let pageWidth: number;
          let pageHeight: number;

          if (pageSize === "fit") {
            // Ajustar página a imagen + márgenes
            pageWidth = imgWidth + marginPx * 2;
            pageHeight = imgHeight + marginPx * 2;
          } else {
            const size = PAGE_SIZES[pageSize];

            // Determinar orientación
            let usePortrait = true;
            if (orientation === "landscape") {
              usePortrait = false;
            } else if (orientation === "auto") {
              usePortrait = imgHeight >= imgWidth;
            }

            if (usePortrait) {
              pageWidth = size.width;
              pageHeight = size.height;
            } else {
              pageWidth = size.height;
              pageHeight = size.width;
            }
          }

          // Crear página
          const page = pdfDoc.addPage([pageWidth, pageHeight]);

          // Calcular dimensiones de imagen para que quepa
          const availableWidth = pageWidth - marginPx * 2;
          const availableHeight = pageHeight - marginPx * 2;

          let drawWidth = imgWidth;
          let drawHeight = imgHeight;

          if (pageSize !== "fit") {
            // Escalar para que quepa manteniendo proporción
            const scaleX = availableWidth / imgWidth;
            const scaleY = availableHeight / imgHeight;
            const scale = Math.min(scaleX, scaleY, 1); // No escalar hacia arriba

            drawWidth = imgWidth * scale;
            drawHeight = imgHeight * scale;
          }

          // Centrar imagen
          const x = marginPx + (availableWidth - drawWidth) / 2;
          const y = marginPx + (availableHeight - drawHeight) / 2;

          // Cargar imagen
          const imageBytes = await imageToBytes(file, quality);

          let pdfImage;
          const fileType = file.type.toLowerCase();

          if (fileType.includes("png")) {
            pdfImage = await pdfDoc.embedPng(imageBytes);
          } else if (fileType.includes("jpeg") || fileType.includes("jpg")) {
            pdfImage = await pdfDoc.embedJpg(imageBytes);
          } else {
            // Convertir otros formatos a JPEG
            const converted = await convertToJpeg(file);
            pdfImage = await pdfDoc.embedJpg(converted);
          }

          // Dibujar imagen con rotación
          if (rotation === 0) {
            page.drawImage(pdfImage, {
              x,
              y,
              width: drawWidth,
              height: drawHeight,
            });
          } else {
            // Manejar rotación
            const centerX = x + drawWidth / 2;
            const centerY = y + drawHeight / 2;
            const radians = (rotation * Math.PI) / 180;

            page.drawImage(pdfImage, {
              x: centerX,
              y: centerY,
              width: rotation === 90 || rotation === 270 ? drawHeight : drawWidth,
              height: rotation === 90 || rotation === 270 ? drawWidth : drawHeight,
              rotate: { angle: radians, type: 'radians' as any },
            });
          }
        }

        // Guardar PDF
        const pdfBytes = await pdfDoc.save();
        const blob = new Blob([new Uint8Array(pdfBytes)], { type: "application/pdf" });
        downloadBlob(blob, `${fileName}.pdf`);

        return true;
      } catch (error) {
        console.error("Client conversion error:", error);
        throw error;
      }
    },
    []
  );

  // Conversión en servidor
  const convertOnServer = useCallback(
    async (
      images: ImageItem[],
      fileName: string,
      options: ConvertOptions
    ): Promise<boolean> => {
      const { pageSize, orientation, margin, quality, onProgress } = options;

      try {
        const formData = new FormData();

        // Agregar imágenes
        for (let i = 0; i < images.length; i++) {
          formData.append("images", images[i].file);
          formData.append(`rotations`, images[i].rotation.toString());

          setProgress({ current: i + 1, total: images.length });
          onProgress?.(i + 1, images.length);
        }

        // Agregar opciones
        formData.append("pageSize", pageSize);
        formData.append("orientation", orientation);
        formData.append("margin", margin);
        formData.append("quality", quality);

        const response = await fetch("/api/worker/image-to-pdf", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Error en el servidor");
        }

        const blob = await response.blob();
        downloadBlob(blob, `${fileName}.pdf`);

        return true;
      } catch (error) {
        console.error("Server conversion error:", error);
        throw error;
      }
    },
    []
  );

  // Función principal
  const convertAndDownload = useCallback(
    async (
      images: ImageItem[],
      fileName: string,
      options: ConvertOptions
    ): Promise<boolean> => {
      const { onSuccess, onError } = options;

      if (images.length === 0) {
        toast.error("Agrega al menos una imagen");
        return false;
      }

      setIsProcessing(true);
      setProgress({ current: 0, total: images.length });

      // Determinar si usar servidor
      const { useServer, reason } = shouldUseServer(images.length);
      setProcessingMode(useServer ? "server" : "client");

      if (reason) {
        toast.info(reason);
      }

      try {
        let success: boolean;

        if (useServer) {
          success = await convertOnServer(images, fileName, options);
        } else {
          success = await convertOnClient(images, fileName, options);
        }

        if (success) {
          toast.success("¡PDF creado correctamente!");
          onSuccess?.();
        }

        return success;
      } catch (error) {
        console.error("Conversion error:", error);
        const errorMessage = error instanceof Error ? error.message : "Error al crear PDF";
        toast.error(errorMessage);
        onError?.(error instanceof Error ? error : new Error(errorMessage));
        return false;
      } finally {
        setIsProcessing(false);
        setProgress({ current: 0, total: 0 });
        setProcessingMode(null);
      }
    },
    [convertOnClient, convertOnServer]
  );

  return {
    isProcessing,
    progress,
    processingMode,
    convertAndDownload,
    shouldUseServer,
    CLIENT_LIMIT,
  };
}

// Convertir imagen a JPEG
async function convertToJpeg(file: File): Promise<Uint8Array> {
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
            blob.arrayBuffer().then(buf => resolve(new Uint8Array(buf)));
          } else {
            reject(new Error("Error convirtiendo imagen"));
          }
        },
        "image/jpeg",
        0.9
      );
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Descargar blob
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