import { useState, useCallback } from "react";
import { toast } from "sonner";
import * as pdfjs from "pdfjs-dist";
import JSZip from "jszip";

pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

// Tipos
export type ImageFormat = "jpg" | "png" | "webp" | "tiff" | "bmp";
export type ProcessingMode = "client" | "server" | "auto";
export type DpiOption = 72 | 150 | 300 | 600;

// Formatos que solo soporta el servidor
const SERVER_ONLY_FORMATS: ImageFormat[] = ["tiff", "bmp"];

// Límites para procesamiento en cliente
const CLIENT_LIMITS = {
    maxFileSize: 20 * 1024 * 1024, // 20MB
    maxPages: 30,
    maxSelectedPages: 50,
};

interface ConvertOptions {
    format: ImageFormat;
    quality: number; // 50-100
    scale?: number;
    dpi?: DpiOption;
    mode?: ProcessingMode;
    onProgress?: (current: number, total: number) => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

interface ConvertResult {
    success: boolean;
    error?: string;
    usedServer?: boolean;
    blob?: Blob;
    fileName?: string;
}

// Detectar si debe usar servidor
export function shouldUseServer(
    file: File | null,
    totalPages: number,
    selectedPagesCount: number,
    format: ImageFormat,
    dpi?: DpiOption
): { useServer: boolean; reason?: string } {
    if (!file) return { useServer: false };

    // Formatos que solo soporta el servidor
    if (SERVER_ONLY_FORMATS.includes(format)) {
        return { useServer: true, reason: `El formato ${format.toUpperCase()} requiere procesamiento en servidor` };
    }

    // DPI alto requiere servidor
    if (dpi && dpi > 300) {
        return { useServer: true, reason: "DPI alto requiere procesamiento en servidor" };
    }

    // Archivo muy grande
    if (file.size > CLIENT_LIMITS.maxFileSize) {
        return { useServer: true, reason: "Archivo grande, procesando en servidor para mejor rendimiento" };
    }

    // Muchas páginas en el PDF
    if (totalPages > CLIENT_LIMITS.maxPages) {
        return { useServer: true, reason: "PDF con muchas páginas, procesando en servidor" };
    }

    // Muchas páginas seleccionadas
    if (selectedPagesCount > CLIENT_LIMITS.maxSelectedPages) {
        return { useServer: true, reason: "Muchas páginas seleccionadas, procesando en servidor" };
    }

    return { useServer: false };
}

// Información del formato
export function getFormatInfo(format: ImageFormat): {
    label: string;
    description: string;
    supportsQuality: boolean;
    requiresServer: boolean;
    recommended?: boolean;
} {
    const formats: Record<ImageFormat, ReturnType<typeof getFormatInfo>> = {
        jpg: {
            label: "JPG",
            description: "Ideal para fotos, menor tamaño",
            supportsQuality: true,
            requiresServer: false,
            recommended: true,
        },
        png: {
            label: "PNG",
            description: "Sin pérdida, soporta transparencia",
            supportsQuality: false,
            requiresServer: false,
        },
        webp: {
            label: "WebP",
            description: "Moderno, excelente compresión",
            supportsQuality: true,
            requiresServer: false,
        },
        tiff: {
            label: "TIFF",
            description: "Profesional, ideal para imprenta",
            supportsQuality: false,
            requiresServer: true,
        },
        bmp: {
            label: "BMP",
            description: "Sin compresión, compatible legacy",
            supportsQuality: false,
            requiresServer: true,
        },
    };
    return formats[format];
}

export function usePdfToImage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });
    const [processingMode, setProcessingMode] = useState<"client" | "server" | null>(null);
    const [isComplete, setIsComplete] = useState(false);
    const [downloadData, setDownloadData] = useState<{ blob: Blob; fileName: string } | null>(null);

    // Conversión en cliente (tu código original mejorado)
    const convertOnClient = useCallback(
        async (
            file: File,
            selectedPageIndices: number[],
            fileName: string,
            options: ConvertOptions
        ): Promise<ConvertResult> => {
            const { format, quality, scale = 2.0, onProgress } = options;

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
                const totalPages = pdf.numPages;
                const imageBlobs: { blob: Blob; name: string }[] = [];

                for (let i = 0; i < selectedPageIndices.length; i++) {
                    const pageIndex = selectedPageIndices[i];
                    const pageNum = pageIndex + 1;

                    if (pageNum < 1 || pageNum > totalPages) continue;

                    setProgress({ current: i + 1, total: selectedPageIndices.length });
                    onProgress?.(i + 1, selectedPageIndices.length);

                    const page = await pdf.getPage(pageNum);
                    const viewport = page.getViewport({ scale });

                    const canvas = document.createElement("canvas");
                    const context = canvas.getContext("2d", { alpha: format === "png" })!;
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    // Fondo blanco para JPG/WebP
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

                    imageBlobs.push({ blob, name: `page-${pageNum}.${format === "jpg" ? "jpg" : format}` });
                    page.cleanup();
                }

                pdf.destroy();

                if (imageBlobs.length === 0) {
                    throw new Error("No se pudieron convertir las páginas");
                }

                if (imageBlobs.length === 1) {
                    const { blob, name } = imageBlobs[0];
                    const finalName = `${fileName}.${name.split(".").pop()}`;
                    downloadBlob(blob, finalName);
                    return { success: true, usedServer: false, blob, fileName: finalName };
                } else {
                    const zip = new JSZip();
                    imageBlobs.forEach(({ blob, name }) => zip.file(name, blob));
                    const zipBlob = await zip.generateAsync({
                        type: "blob",
                        compression: "DEFLATE",
                        compressionOptions: { level: 6 }
                    });
                    const finalName = `${fileName}.zip`;
                    downloadBlob(zipBlob, finalName);
                    return { success: true, usedServer: false, blob: zipBlob, fileName: finalName };
                }
            } catch (error) {
                console.error("Client conversion error:", error);
                throw error;
            }
        },
        []
    );

    // Conversión en servidor
    // Conversión en servidor - UNA sola petición, recibe ZIP directo
    const convertOnServer = useCallback(
        async (
            file: File,
            selectedPageIndices: number[],
            fileName: string,
            options: ConvertOptions
        ): Promise<ConvertResult> => {
            const { format, quality, dpi = 150, onProgress } = options;

            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("format", format);
                formData.append("quality", quality.toString());
                formData.append("dpi", dpi.toString());
                formData.append("pages", selectedPageIndices.map(i => i + 1).join(","));

                onProgress?.(1, 2);
                setProgress({ current: 1, total: 2 });

                const response = await fetch("/api/worker/pdf-to-image", {
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

                onProgress?.(2, 2);
                setProgress({ current: 2, total: 2 });

                const blob = await response.blob();
                const ext = selectedPageIndices.length === 1 ? (format === "jpg" ? "jpg" : format) : "zip";
                downloadBlob(blob, `${fileName}.${ext}`);

                return { success: true, usedServer: true };
            } catch (error) {
                console.error("Server conversion error:", error);
                throw error;
            }
        },
        []
    );

    // Función principal de conversión
    const convertAndDownload = useCallback(
        async (
            file: File,
            selectedPageIndices: number[],
            fileName: string,
            options: ConvertOptions
        ): Promise<ConvertResult> => {
            const { format, mode = "auto", onSuccess, onError } = options;

            // Validaciones
            if (selectedPageIndices.length === 0) {
                toast.error("Selecciona al menos una página");
                return { success: false, error: "No pages selected" };
            }

            if (selectedPageIndices.length > 100) {
                toast.error("Máximo 100 páginas por conversión");
                return { success: false, error: "Too many pages" };
            }

            setIsProcessing(true);
            setProgress({ current: 0, total: selectedPageIndices.length });

            // Determinar si usar servidor
            const formatInfo = getFormatInfo(format);
            let useServer = formatInfo.requiresServer;

            if (mode === "server") {
                useServer = true;
            } else if (mode === "client" && !formatInfo.requiresServer) {
                useServer = false;
            } else if (mode === "auto") {
                const serverCheck = shouldUseServer(
                    file,
                    0, // No necesitamos el total aquí
                    selectedPageIndices.length,
                    format,
                    options.dpi
                );
                useServer = serverCheck.useServer;
                if (serverCheck.reason) {
                    toast.info(serverCheck.reason);
                }
            }

            setProcessingMode(useServer ? "server" : "client");

            if (selectedPageIndices.length > 20) {
                toast.info("Procesando muchas páginas, esto puede tardar...");
            }

            try {
                let result: ConvertResult;

                if (useServer) {
                    result = await convertOnServer(file, selectedPageIndices, fileName, options);
                } else {
                    result = await convertOnClient(file, selectedPageIndices, fileName, options);
                }

                if (result.success && result.blob && result.fileName) {
                    setIsComplete(true);
                    setDownloadData({ blob: result.blob, fileName: result.fileName });
                    toast.success("¡Conversión completada!");
                    options.onSuccess?.();
                } else {
                    throw new Error(result.error || "Error en la conversión");
                }

                return result;
            } catch (error) {
                console.error("Conversion error:", error);
                const errorMessage = error instanceof Error ? error.message : "Error durante la conversión";
                toast.error(errorMessage);
                options.onError?.(error instanceof Error ? error : new Error(errorMessage));

                // Reset on error
                setIsProcessing(false);
                setProgress({ current: 0, total: 0 });
                setProcessingMode(null);

                return { success: false, error: errorMessage };
            }
        },
        [convertOnClient, convertOnServer]
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
        setProcessingMode(null);
        setDownloadData(null);
    }, []);

    return {
        isProcessing,
        isComplete,
        progress,
        processingMode,
        convertAndDownload,
        handleDownloadAgain,
        handleStartNew,
        shouldUseServer,
        getFormatInfo,
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
