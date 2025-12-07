"use client";

import { useEffect, useState, memo } from "react";
import { pdfjs } from "react-pdf";
import { Loader2, FileX2 } from "lucide-react";
import { cn } from "@/lib/utils";

// Configure worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfThumbnailProps {
    file: File;
    className?: string;
    pageNumber?: number;
}

export const PdfThumbnail = memo(function PdfThumbnail({ file, className, pageNumber = 1 }: PdfThumbnailProps) {
    const [imageUrl, setImageUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        let active = true;
        let loadingTask: any = null;

        const loadThumbnail = async () => {
            try {
                setIsLoading(true);
                setError(false);

                // Convert File to ArrayBuffer to avoid detached buffer issues or use ObjectURL
                const objectUrl = URL.createObjectURL(file);

                loadingTask = pdfjs.getDocument(objectUrl);
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(pageNumber);

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
                }).promise;

                if (active) {
                    setImageUrl(canvas.toDataURL("image/png"));
                    setIsLoading(false);
                }

                // Cleanup
                URL.revokeObjectURL(objectUrl);
                // We can destroy the pdf document to free memory
                pdf.destroy();

            } catch (err: any) {
                // Ignore "Worker was destroyed" error as it is expected when cancelling/cleaning up
                if (err?.message !== "Worker was destroyed") {
                    console.error("Error generating thumbnail:", err);
                    if (active) {
                        setError(true);
                        setIsLoading(false);
                    }
                }
            }
        };

        loadThumbnail();

        return () => {
            active = false;
            // logic to cancel rendering if possible, but pdf.js cancellation makes things complicated.
            // basic flag check is usually enough.
            if (loadingTask) {
                loadingTask.destroy().catch(() => { });
            }
        };
    }, [file, pageNumber]);

    return (
        <div className={cn("relative w-full h-full flex items-center justify-center overflow-hidden bg-white dark:bg-zinc-900 select-none", className)}>
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
                    alt="PDF Thumbnail"
                    className="w-full h-full object-contain pointer-events-none shadow-sm"
                />
            )}
        </div>
    );
});
