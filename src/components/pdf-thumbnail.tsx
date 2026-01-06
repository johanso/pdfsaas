"use client";

import { useEffect, useState, memo, useRef } from "react";
import { pdfjs } from "react-pdf";
import { Loader2, FileX2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { canvasToOptimizedDataURL } from "@/lib/canvas-utils";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
// @ts-ignore
pdfjs.GlobalWorkerOptions.cMapUrl = `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`;
// @ts-ignore
pdfjs.GlobalWorkerOptions.cMapPacked = true;

interface PdfThumbnailProps {
    file: File;
    className?: string;
    pageNumber?: number;
}

export const PdfThumbnail = memo(function PdfThumbnail({ file, className, pageNumber = 1 }: PdfThumbnailProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Intersection Observer to detect when the thumbnail enters the viewport
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsInView(true);
                    observer.disconnect();
                }
            },
            {
                rootMargin: "200px", // Load a bit before it enters the viewport
                threshold: 0.1
            }
        );

        if (containerRef.current) {
            observer.observe(containerRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView) return;

        let active = true;
        let loadingTask: any = null;
        let objectUrl: string | null = null;
        let pdfDoc: any = null;

        const loadThumbnail = async () => {
            try {
                setIsLoading(true);
                setError(false);

                // Convert File to ObjectURL for efficiency
                objectUrl = URL.createObjectURL(file);

                loadingTask = pdfjs.getDocument({
                    url: objectUrl,
                    // Optimization: Disable some features not needed for thumbnails
                    disableFontFace: true,
                    isEvalSupported: false,
                });

                const pdf = await loadingTask.promise;
                pdfDoc = pdf;
                if (!active) return;

                const page = await pdf.getPage(pageNumber);
                if (!active) return;

                const viewport = page.getViewport({ scale: 1.0 });
                // Calculate scale to fit a reasonable thumbnail size (e.g. width 300px)
                const scale = 300 / viewport.width;
                const scaledViewport = page.getViewport({ scale });

                const canvas = document.createElement("canvas");
                canvas.width = scaledViewport.width;
                canvas.height = scaledViewport.height;
                const context = canvas.getContext("2d");

                if (!context) throw new Error("Canvas context not available");

                await page.render({
                    canvasContext: context,
                    viewport: scaledViewport,
                    // Optimization: High-speed rendering for thumbnails
                    intent: 'display'
                }).promise;

                if (active) {
                    setImageUrl(canvasToOptimizedDataURL(canvas));
                    setIsLoading(false);
                }

                // Cleanup document
                if (pdfDoc) {
                    await pdfDoc.destroy();
                    pdfDoc = null;
                }

            } catch (err: any) {
                // Ignore "Worker was destroyed" error as it is expected when cancelling/cleaning up
                if (err?.message !== "Worker was destroyed" && active) {
                    console.error("Error generating thumbnail:", err);
                    setError(true);
                    setIsLoading(false);
                }
            } finally {
                if (objectUrl) {
                    URL.revokeObjectURL(objectUrl);
                    objectUrl = null;
                }
            }
        };

        loadThumbnail();

        return () => {
            active = false;
            loadingTask?.destroy().catch(() => { });
            pdfDoc?.destroy().catch(() => { });
            if (objectUrl) {
                URL.revokeObjectURL(objectUrl);
            }
        };
    }, [file, pageNumber, isInView]);

    return (
        <div
            ref={containerRef}
            className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-900 select-none min-h-[100px]", className)}
        >
            {/* Loading State */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 z-10">
                    <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-red-50 dark:bg-red-900/10 z-10 p-2 text-center">
                    <FileX2 className="w-8 h-8 text-red-400 mb-1" />
                    <span className="text-[10px] text-red-500 font-medium leading-tight">
                        Vista no disponible
                    </span>
                </div>
            )}

            {/* Image */}
            {imageUrl && !isLoading && !error && (
                <img
                    src={imageUrl}
                    alt={`Página ${pageNumber}`}
                    className="rounded-md w-full h-full object-contain pointer-events-none shadow-sm"
                />
            )}
        </div>
    );
});

