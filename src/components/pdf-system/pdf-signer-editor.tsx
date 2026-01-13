"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Document, Page } from "react-pdf";
import { setupPdfjs } from "@/lib/pdfjs-config";
import { Button } from "@/components/ui/button";
import { Signature } from "@/hooks/useSignPdf";
import {
  Loader2, ZoomIn, ZoomOut, X,
  ChevronLeft, ChevronRight, LayoutPanelLeft,
  MousePointer2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// --- Sub-componente: Firma en el documento ---
interface PlacedSignatureProps {
  id: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onRemove: (id: string) => void;
}

const PlacedSignature = memo(({ id, image, x, y, width, height, onRemove }: PlacedSignatureProps) => {
  return (
    <div
      style={{ left: x, top: y, width, height, position: 'absolute', zIndex: 10 }}
      className="group"
    >
      <div className="relative w-full h-full border-2 border-transparent group-hover:border-primary rounded transition-all bg-primary/5 backdrop-blur-[1px]">
        <img src={image} alt="Firma" className="w-full h-full object-contain pointer-events-none select-none" />
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(id); }}
          className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg hover:bg-red-600"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
});

PlacedSignature.displayName = "PlacedSignature";

// --- Sub-componente: Página del PDF (Optimizada con Lazy Loading) ---
interface PdfSignerPageProps {
  pageNumber: number;
  width: number;
  signatures: any[];
  onRemoveSignature: (id: string) => void;
  onDropSignature: (image: string, x: number, y: number) => void;
  registerPageRef: (el: HTMLDivElement | null, pageNumber: number) => void;
}

const LazyViewerPage = memo(({ pageNumber, width, signatures, onRemoveSignature, onDropSignature, registerPageRef }: PdfSignerPageProps) => {
  const [isInView, setIsInView] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          // Opcional: no desconectar si se quiere descargar de memoria al salir, 
          // pero para firmar es mejor mantenerlo una vez cargado para evitar parpadeos.
        }
      },
      { rootMargin: "600px", threshold: 0.1 }
    );

    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const image = e.dataTransfer.getData("signature-image");
    if (!image || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    onDropSignature(image, x, y);
  };

  return (
    <div
      ref={(el) => {
        containerRef.current = el;
        registerPageRef(el, pageNumber);
      }}
      onDragOver={(e) => e.preventDefault()}
      onDrop={handleDrop}
      className="relative mb-8 shadow-2xl bg-white border border-zinc-200 group/page transition-all min-h-[400px]"
      id={`viewer-page-${pageNumber}`}
      style={{ width }}
    >
      {isInView ? (
        <Page
          pageNumber={pageNumber}
          width={width}
          renderTextLayer={false}
          renderAnnotationLayer={false}
          className="block"
          loading={<div style={{ width, height: width * 1.4 }} className="bg-zinc-50 flex items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-zinc-300" /></div>}
        />
      ) : (
        <div style={{ width, height: width * 1.4 }} className="bg-zinc-50/50 flex items-center justify-center">
          <span className="text-[10px] text-zinc-300 font-bold uppercase tracking-widest">Página {pageNumber}</span>
        </div>
      )}

      <div className="absolute inset-0 pointer-events-none">
        <div className="relative w-full h-full pointer-events-auto">
          {signatures.map((sig) => (
            <PlacedSignature
              key={sig.id}
              {...sig}
              onRemove={onRemoveSignature}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

LazyViewerPage.displayName = "LazyViewerPage";

// --- Sub-componente: Miniatura de la página (Optimizada) ---
const LazyThumbnailPage = memo(({ pageNumber, onClick, active }: { pageNumber: number, onClick: () => void, active: boolean }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsInView(true);
    }, { rootMargin: "200px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      onClick={onClick}
      className={cn(
        "cursor-pointer group relative rounded-lg mb-2 border-2 transition-all p-1 min-h-[100px] flex items-center justify-center",
        active ? "border-primary bg-primary/5 shadow-md" : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      {isInView ? (
        <Page pageNumber={pageNumber} width={160} renderTextLayer={false} renderAnnotationLayer={false} className="block" loading={null} />
      ) : (
        <div className="w-[160px] h-[200px] bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-400">
          Pág {pageNumber}
        </div>
      )}
      <div className="absolute top-1 left-1 bg-zinc-800/80 text-white text-[9px] font-bold px-1.5 py-0.5 rounded z-10">
        {pageNumber}
      </div>
    </div>
  );
});

LazyThumbnailPage.displayName = "LazyThumbnailPage";

// --- Componente Principal ---
interface PdfSignerEditorAreaProps {
  file: File;
  fileId: string;
  onSignaturesUpdate: (sigs: any[]) => void;
}

export function PdfSignerEditorArea({ file, fileId, onSignaturesUpdate }: PdfSignerEditorAreaProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [scale, setScale] = useState<number>(0.85);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [placedSignatures, setPlacedSignatures] = useState<any[]>([]);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { w: number, h: number }>>({});
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [isCapturingDimensions, setIsCapturingDimensions] = useState(false);

  // Sync signatures to parent when they change
  useEffect(() => {
    onSignaturesUpdate(placedSignatures);
  }, [placedSignatures, onSignaturesUpdate]);

  const vScrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});

  useEffect(() => { setupPdfjs(); }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (vScrollRef.current) {
        setContainerWidth(vScrollRef.current.clientWidth - (showThumbnails ? 240 : 80));
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, [showThumbnails]);

  const pageWidth = containerWidth * scale;

  // Seguimiento de página actual al hacer scroll (Debounced)
  const handleScroll = useCallback(() => {
    if (!vScrollRef.current) return;
    const scrollContainer = vScrollRef.current;

    // Solo checkeamos el centro de la pantalla
    const viewCenter = scrollContainer.scrollTop + (scrollContainer.clientHeight / 2);

    for (let i = 1; i <= numPages; i++) {
      const el = pageRefs.current[i];
      if (el && el.offsetTop <= viewCenter && (el.offsetTop + el.offsetHeight) > viewCenter) {
        if (currentPage !== i) setCurrentPage(i);
        break;
      }
    }
  }, [numPages, currentPage]);

  const scrollToPage = (page: number) => {
    const el = pageRefs.current[page];
    if (el && vScrollRef.current) {
      vScrollRef.current.scrollTo({
        top: el.offsetTop - 40,
        behavior: "smooth"
      });
      setCurrentPage(page);
    }
  };

  const handleDocumentLoadSuccess = async (pdf: any) => {
    setNumPages(pdf.numPages);
    setIsCapturingDimensions(true);

    // OPTIMIZACIÓN: Capturar dimensiones sin renderizar componentes ocultos
    const dims: Record<number, { w: number, h: number }> = {};
    try {
      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 1 });
        dims[i] = { w: viewport.width, h: viewport.height };

        // Chunking para no bloquear el hilo principal en PDFs enormes
        if (i % 20 === 0) {
          setPageDimensions(prev => ({ ...prev, ...dims }));
          await new Promise(r => setTimeout(r, 10));
        }
      }
      setPageDimensions(dims);
    } catch (err) {
      console.error("Error capturing dimensions", err);
    } finally {
      setIsCapturingDimensions(false);
    }
  };

  const handleDropSignature = useCallback((pageNumber: number, image: string, x: number, y: number) => {
    const newSig = {
      id: `sig-${Date.now()}-${Math.random()}`,
      pageNumber,
      image,
      x: x - 75,
      y: y - 30,
      width: 150,
      height: 60,
      rotation: 0
    };
    setPlacedSignatures(prev => [...prev, newSig]);
  }, []); // No need for onSignaturesUpdate in deps anymore as we use useEffect

  const removeSignature = useCallback((id: string) => {
    setPlacedSignatures(prev => prev.filter(s => s.id !== id));
  }, []); // No need for onSignaturesUpdate in deps anymore

  useEffect(() => {
    const triggerSign = (e: any) => {
      if (e.detail.fileId !== fileId) return;
      const finalSignatures: Signature[] = placedSignatures.map(sig => {
        const dimensions = pageDimensions[sig.pageNumber] || { w: 595, h: 841 };
        const renderScale = dimensions.w / pageWidth;
        return {
          id: sig.id,
          pageNumber: sig.pageNumber,
          image: sig.image,
          x: sig.x * renderScale,
          y: dimensions.h - (sig.y * renderScale) - (sig.height * renderScale),
          width: sig.width * renderScale,
          height: sig.height * renderScale,
          rotation: sig.rotation || 0,
          opacity: 1
        };
      });
      document.dispatchEvent(new CustomEvent('sign-pdf-final-submit', { detail: { signatures: finalSignatures, fileId } }));
    };
    document.addEventListener('trigger-sign-process', triggerSign);
    return () => document.removeEventListener('trigger-sign-process', triggerSign);
  }, [placedSignatures, pageWidth, pageDimensions, fileId]);

  return (
    <div className="flex h-full bg-zinc-100/30 dark:bg-zinc-950/20 relative overflow-hidden">

      {/* Miniaturas Sidebar */}
      {showThumbnails && (
        <div className="w-[200px] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col z-20">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Páginas</h3>
            <span className="text-[10px] bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded font-bold">{numPages}</span>
          </div>
          <ScrollArea className="flex-1">
            <div className="px-2 py-3 space-y-4">
              <Document file={file} loading={null}>
                {Array.from(new Array(numPages), (_, i) => (
                  <LazyThumbnailPage
                    key={`thumb_${i + 1}`}
                    pageNumber={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => scrollToPage(i + 1)}
                  />
                ))}
              </Document>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Visor Area */}
      <div className="flex-1 flex flex-col relative">

        {/* Floating Toolbar */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-2xl shadow-primary/5 transition-all">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowThumbnails(!showThumbnails)} title="Ver Miniaturas">
            <LayoutPanelLeft className={cn("w-4 h-4", showThumbnails && "text-primary")} />
          </Button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Navigación */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={currentPage <= 1} onClick={() => scrollToPage(currentPage - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-[11px] font-bold min-w-[70px] text-center flex flex-col leading-tight">
            <span>{currentPage} / {numPages}</span>
            {isCapturingDimensions && <span className="text-[9px] text-primary animate-pulse">Capturando...</span>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={currentPage >= numPages} onClick={() => scrollToPage(currentPage + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Zoom */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setScale(s => Math.max(0.4, s - 0.1))}>
            <ZoomOut className="w-4 h-4" />
          </Button>
          <div className="px-2 text-[10px] font-mono font-bold">{Math.round(scale * 100)}%</div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setScale(s => Math.min(2, s + 0.1))}>
            <ZoomIn className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea className="flex-1" ref={vScrollRef} onScroll={handleScroll}>
          <div className="p-12 pb-32 flex flex-col items-center">
            <Document
              file={file}
              onLoadSuccess={handleDocumentLoadSuccess}
              loading={
                <div className="flex flex-col items-center gap-4 py-40">
                  <div className="relative">
                    <Loader2 className="w-12 h-12 animate-spin text-primary relative z-10" />
                    <div className="absolute inset-0 blur-xl bg-primary/20 animate-pulse rounded-full" />
                  </div>
                  <p className="text-sm font-bold tracking-widest uppercase text-muted-foreground">Iniciando motor de renderizado...</p>
                </div>
              }
              className="flex flex-col items-center"
            >
              {Array.from(new Array(numPages), (_, index) => (
                <LazyViewerPage
                  key={`vpage-${index + 1}`}
                  pageNumber={index + 1}
                  width={pageWidth}
                  signatures={placedSignatures.filter(s => s.pageNumber === index + 1)}
                  onRemoveSignature={removeSignature}
                  onDropSignature={(img, x, y) => handleDropSignature(index + 1, img, x, y)}
                  registerPageRef={(el, p) => pageRefs.current[p] = el}
                />
              ))}
            </Document>
          </div>
        </ScrollArea>
      </div>

      {placedSignatures.length === 0 && (
        <div className="absolute bottom-3 right-4 pointer-events-none animate-bounce bg-primary text-primary-foreground px-4 py-2 rounded-full text-xs font-bold shadow-2xl flex items-center gap-2 z-30">
          <MousePointer2 className="w-3.5 h-3.5" />
          Suelta tu firma aquí
        </div>
      )}
    </div>
  );
}
