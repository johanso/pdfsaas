import { useState, useCallback } from "react";
import { toast } from "sonner";
import * as pdfjs from "pdfjs-dist";
import JSZip from "jszip";

// Worker configuration with fallback
// pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
pdfjs.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';

type ImageFormat = "jpg" | "png" | "webp";

interface ConvertOptions {
    format: ImageFormat;
    quality: number; // 50-100
    scale?: number;
    onProgress?: (current: number, total: number) => void;
    onSuccess?: () => void;
    onError?: (error: Error) => void;
}

export function usePdfToImage() {
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState({ current: 0, total: 0 });

    const convertAndDownload = useCallback(
        async (
            file: File,
            selectedPageIndices: number[],
            fileName: string,
            options: ConvertOptions
        ) => {
            const { format, quality, scale = 2.0, onProgress, onSuccess, onError } = options;

            // Validations
            if (selectedPageIndices.length === 0) {
                toast.error("Selecciona al menos una página");
                return { success: false, error: "No pages selected" };
            }

            if (selectedPageIndices.length > 50) {
                toast.error("Máximo 50 páginas por conversión");
                return { success: false, error: "Too many pages" };
            }

            if (selectedPageIndices.length > 20) {
                toast.info("Procesando muchas páginas, esto puede tardar...");
            }

            setIsProcessing(true);
            setProgress({ current: 0, total: selectedPageIndices.length });

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

                    // White background for JPG/WebP
                    if (format !== "png") {
                        context.fillStyle = "#ffffff";
                        context.fillRect(0, 0, canvas.width, canvas.height);
                    }

                    await page.render({ canvasContext: context, viewport }).promise;

                    const mimeType = format === "jpg" ? "image/jpeg" : `image/${format}`;
                    const ext = format;

                    const blob = await new Promise<Blob>((resolve, reject) => {
                        canvas.toBlob(
                            (b) => (b ? resolve(b) : reject(new Error("Blob creation failed"))),
                            mimeType,
                            format === "png" ? undefined : quality / 100
                        );
                    });

                    imageBlobs.push({ blob, name: `page-${pageNum}.${ext}` });
                    page.cleanup();
                }

                pdf.destroy();

                if (imageBlobs.length === 0) {
                    throw new Error("No se pudieron convertir las páginas");
                }

                // Download
                if (imageBlobs.length === 1) {
                    const { blob, name } = imageBlobs[0];
                    downloadBlob(blob, `${fileName}.${name.split(".").pop()}`);
                } else {
                    const zip = new JSZip();
                    imageBlobs.forEach(({ blob, name }) => zip.file(name, blob));
                    const zipBlob = await zip.generateAsync({ type: "blob" });
                    downloadBlob(zipBlob, `${fileName}.zip`);
                }

                toast.success("¡Conversión completada!");
                onSuccess?.();
                return { success: true };
            } catch (error) {
                console.error("Conversion error:", error);
                const errorMessage = error instanceof Error ? error.message : "Error durante la conversión";
                toast.error(errorMessage);
                onError?.(error instanceof Error ? error : new Error(errorMessage));
                return { success: false, error: errorMessage };
            } finally {
                setIsProcessing(false);
                setProgress({ current: 0, total: 0 });
            }
        },
        []
    );

    return { isProcessing, progress, convertAndDownload };
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