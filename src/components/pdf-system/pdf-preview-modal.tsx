"use client";

import React, { useState, useEffect, useRef, memo } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, ZoomIn, ZoomOut, Download, FileX2, X } from "lucide-react";
import { Button } from "@/components/ui/button";

// Configure worker with optimized options
pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";

// Page component with Intersection Observer for progressive loading
const LazyPage = memo(({
  pageNumber,
  scale,
  onLoadSuccess,
  onLoadError
}: {
  pageNumber: number,
  scale: number,
  onLoadSuccess?: () => void,
  onLoadError?: () => void
}) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Once it has been in view, we keep it loaded for smoother scrolling
          // but we could also disconnect if we wanted strict memory management
          observer.disconnect();
        }
      },
      {
        rootMargin: "400px", // High margin to start loading before the user gets there
        threshold: 0.01
      }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={containerRef}
      className="min-h-[400px] w-full flex items-center justify-center mb-8 last:mb-0"
    >
      {isInView ? (
        <Page
          pageNumber={pageNumber}
          scale={scale}
          className="shadow-xl border bg-white dark:bg-zinc-900 transition-opacity duration-300"
          renderAnnotationLayer={false}
          renderTextLayer={false}
          onRenderSuccess={onLoadSuccess}
          onRenderError={onLoadError}
          loading={
            <div className="flex flex-col items-center gap-2 p-12">
              <Loader2 className="h-6 w-6 animate-spin text-primary/40" />
              <span className="text-[10px] text-muted-foreground uppercase tracking-widest">Página {pageNumber}</span>
            </div>
          }
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg opacity-50">
          <div className="flex border rounded-lg p-12 flex-col items-center gap-2">
            <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />
            <span className="text-[10px] text-zinc-400">Página {pageNumber}</span>
          </div>
        </div>
      )}
    </div>
  );
});

LazyPage.displayName = "LazyPage";

interface PdfPreviewModalProps {
  file: File;
  pageNumber?: number;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  onRemove?: () => void;
}

export function PdfPreviewModal({
  file,
  pageNumber,
  isOpen,
  onOpenChange,
  title = "Vista Previa",
  onRemove,
}: PdfPreviewModalProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(1.0);
  const [fileUrl, setFileUrl] = useState<string | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (isOpen && file) {
      // Setup worker options (CMaps etc)
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.cMapUrl = `//unpkg.com/pdfjs-dist@${pdfjs.version}/cmaps/`;
      // @ts-ignore
      pdfjs.GlobalWorkerOptions.cMapPacked = true;

      const url = URL.createObjectURL(file);
      setFileUrl(url);
      setIsReady(true);
      return () => {
        URL.revokeObjectURL(url);
        setIsReady(false);
      };
    } else {
      setFileUrl(null);
      setIsReady(false);
    }
  }, [isOpen, file]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const handleDownload = () => {
    if (!fileUrl) return;
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = file.name;
    a.click();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] h-[90vh] flex flex-col p-0 gap-0 overflow-hidden bg-background">
        <DialogHeader className="p-4 border-b flex flex-row items-center justify-between shrink-0 space-y-0 bg-background z-20">
          <div className="flex flex-col">
            <DialogTitle className="text-base truncate max-w-[200px] sm:max-w-md">
              {title}
            </DialogTitle>
            {numPages > 0 && !file.type.startsWith("image/") && (
              <p className="text-xs text-muted-foreground">
                {pageNumber ? `Página ${pageNumber} de ${numPages}` : `${numPages} páginas total`}
              </p>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center border rounded-md overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none border-r border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setScale(s => Math.max(0.3, s - 0.1))}
                title="Alejar"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs px-2 min-w-14 text-center font-mono font-medium">
                {Math.round(scale * 100)}%
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 rounded-none border-l border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                onClick={() => setScale(s => Math.min(3, s + 0.1))}
                title="Acercar"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
            </div>

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={handleDownload}
              title="Descargar archivo original"
            >
              <Download className="h-4 w-4" />
            </Button>

            {onRemove && (
              <Button
                variant="outline"
                size="icon"
                className="h-8 w-8 hover:bg-red-50 dark:hover:bg-red-900/20 text-muted-foreground hover:text-red-600 border-zinc-200 dark:border-zinc-800"
                onClick={() => {
                  onRemove();
                  onOpenChange(false);
                }}
                title="Eliminar"
              >
                <FileX2 className="h-4 w-4" />
              </Button>
            )}

            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              onClick={() => onOpenChange(false)}
              title="Cerrar"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 bg-zinc-100/50 dark:bg-zinc-950 overflow-hidden relative flex flex-col">
          <div className="h-full w-full overflow-auto scroll-smooth custom-scrollbar">
            <div className="flex flex-col items-center p-4 min-h-full">
              {isReady && fileUrl && (
                file.type.startsWith("image/") ? (
                  <div className="flex items-center justify-center w-full">
                    <img
                      src={fileUrl}
                      alt={title}
                      className="max-w-full h-auto shadow-2xl border bg-white dark:bg-zinc-900 transition-all duration-300"
                      style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}
                    />
                  </div>
                ) : (
                  <Document
                    file={fileUrl}
                    onLoadSuccess={onDocumentLoadSuccess}
                    loading={
                      <div className="flex flex-col items-center justify-center p-24 gap-4">
                        <div className="relative">
                          <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
                          <Loader2 className="h-10 w-10 animate-spin text-primary relative z-10" />
                        </div>
                        <p className="text-xs font-medium text-muted-foreground animate-pulse uppercase tracking-[0.2em]">Preparando documento...</p>
                      </div>
                    }
                    error={
                      <div className="flex flex-col items-center justify-center p-12 gap-3 text-destructive">
                        <FileX2 className="h-10 w-10" />
                        <p className="text-sm font-semibold">Error al cargar el PDF</p>
                        <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>Cerrar</Button>
                      </div>
                    }
                    className="flex flex-col items-center"
                  >
                    {pageNumber ? (
                      <LazyPage
                        pageNumber={pageNumber}
                        scale={scale}
                      />
                    ) : (
                      Array.from({ length: numPages }, (_, i) => (
                        <LazyPage
                          key={`page_${i + 1}`}
                          pageNumber={i + 1}
                          scale={scale}
                        />
                      ))
                    )}
                  </Document>
                )
              )}
            </div>
          </div>
        </div>
      </DialogContent>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(144, 144, 144, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(144, 144, 144, 0.2);
        }
      `}</style>
    </Dialog>
  );
}
