"use client";

import { useState, useRef, useEffect, useCallback, useMemo, memo } from "react";
import { Document, Page } from "react-pdf";
import { setupPdfjs } from "@/lib/pdfjs-config";
import { Button } from "@/components/ui/button";
import { Signature } from "@/hooks/useSignPdf";
import {
  Loader2, ZoomIn, ZoomOut, X,
  ChevronLeft, ChevronRight, LayoutPanelLeft,
  MousePointer2, Edit3
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ScrollArea } from "../ui/scroll-area";

// --- Sub-componente: Firma en el documento ---
interface PlacedSignatureProps {
  id: string;
  image: string;
  x: number;
  y: number;
  width: number;
  height: number;
  onRemove: (id: string) => void;
  onUpdate: (id: string, updates: Partial<PlacedSignatureProps>) => void;
  onEdit?: (id: string) => void;
  disabled?: boolean;
}

const PlacedSignature = memo(({ id, image, x, y, width, height, onRemove, onUpdate, onEdit, disabled }: PlacedSignatureProps) => {
  const [isInteraction, setIsInteraction] = useState<'move' | 'nw' | 'sw' | 'se' | null>(null);
  const startPos = useRef({ x: 0, y: 0, initialX: 0, initialY: 0, initialW: 0, initialH: 0 });

  const handleMouseDown = (e: React.MouseEvent, type: 'move' | 'nw' | 'sw' | 'se') => {
    if (disabled) return;
    e.stopPropagation();
    setIsInteraction(type);
    startPos.current = {
      x: e.clientX,
      y: e.clientY,
      initialX: x,
      initialY: y,
      initialW: width,
      initialH: height
    };
  };

  useEffect(() => {
    if (!isInteraction) return;

    const handleMouseMove = (e: MouseEvent) => {
      const parent = document.getElementById(`viewer-page-${id.split('-')[1]}`) || document.querySelector(`[id^="viewer-page-"]`);
      const container = parent?.getBoundingClientRect();
      if (!container) return;

      const dx = (e.clientX - startPos.current.x) / container.width;
      const dy = (e.clientY - startPos.current.y) / container.height;

      if (isInteraction === 'move') {
        onUpdate(id, {
          x: Math.max(0, Math.min(1 - width, startPos.current.initialX + dx)),
          y: Math.max(0, Math.min(1 - height, startPos.current.initialY + dy))
        });
      } else {
        // Redimensionamiento Proporcional Inteligente (con anclajes)
        const { initialX, initialY, initialW, initialH } = startPos.current;
        const pageAspectRatio = container.width / container.height;
        const sigAspectRatio = initialW / initialH;

        let newWidth = initialW;
        let newX = initialX;
        let newY = initialY;

        if (isInteraction === 'se') {
          newWidth = Math.max(0.05, initialW + dx);
        } else if (isInteraction === 'sw') {
          newWidth = Math.max(0.05, initialW - dx);
          newX = initialX + (initialW - newWidth);
        } else if (isInteraction === 'nw') {
          newWidth = Math.max(0.05, initialW - dx);
          newX = initialX + (initialW - newWidth);
          const newHeight = (newWidth * initialH) / initialW;
          newY = initialY + (initialH - newHeight);
        }

        onUpdate(id, {
          width: newWidth,
          height: (newWidth * initialH) / initialW,
          x: newX,
          y: newY
        });
      }
    };

    const handleMouseUp = () => {
      setIsInteraction(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isInteraction, id, onUpdate]);

  return (
    <div
      style={{
        left: `${x * 100}%`,
        top: `${y * 100}%`,
        width: `${width * 100}%`,
        height: `${height * 100}%`,
        position: 'absolute',
        zIndex: 10
      }}
      className={cn(
        "group select-none",
        !disabled && (isInteraction === 'move' ? "cursor-grabbing" : "cursor-grab")
      )}
      onMouseDown={(e) => handleMouseDown(e, 'move')}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (!disabled && onEdit) onEdit(id);
      }}
    >
      <div className={cn(
        "relative w-full h-full border-2 transition-all bg-white/0 rounded",
        isInteraction ? "border-primary shadow-xl ring-1 ring-primary/20" : "border-transparent group-hover:border-primary/50"
      )}>
        <img src={image} alt="Firma" className="w-full h-full object-contain pointer-events-none select-none" />

        {!disabled && (
          <>
            {/* Botones de Acción */}
            <div className="absolute -top-3 -right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                onClick={(e) => { e.stopPropagation(); if (onEdit) onEdit(id); }}
                className="bg-primary text-white rounded-full p-1 shadow-lg hover:bg-primary/90"
                title="Editar firma"
              >
                <Edit3 className="w-3 h-3" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); onRemove(id); }}
                className="bg-red-500 text-white rounded-full p-1 shadow-lg hover:bg-red-600"
                title="Eliminar"
              >
                <X className="w-3 h-3" />
              </button>
            </div>

            {/* Handles de Resize (Esquinas excepto superior-derecha) */}
            {/* Inferior Derecha */}
            <div
              className="absolute -bottom-1 -right-1 w-2.5 h-2.5 bg-primary rounded-full border border-white shadow-sm cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
              onMouseDown={(e) => handleMouseDown(e, 'se')}
            />
            {/* Inferior Izquierda */}
            <div
              className="absolute -bottom-1 -left-1 w-2.5 h-2.5 bg-primary rounded-full border border-white shadow-sm cursor-nesw-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
              onMouseDown={(e) => handleMouseDown(e, 'sw')}
            />
            {/* Superior Izquierda */}
            <div
              className="absolute -top-1 -left-1 w-2.5 h-2.5 bg-primary rounded-full border border-white shadow-sm cursor-nwse-resize opacity-0 group-hover:opacity-100 transition-opacity z-20"
              onMouseDown={(e) => handleMouseDown(e, 'nw')}
            />

            {/* Visual feedback of being selected */}
            <div className="absolute inset-x-0 -bottom-6 text-[9px] font-bold text-primary text-center opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-tighter">
              Mover o Escalar
            </div>
          </>
        )}
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
  onUpdateSignature: (id: string, updates: any) => void;
  onEditSignature: (id: string) => void;
  onDropSignature: (image: string, x: number, y: number, meta?: string) => void;
  registerPageRef: (el: HTMLDivElement | null, pageNumber: number) => void;
  isPanMode?: boolean;
}

const LazyViewerPage = memo(({ pageNumber, width, signatures, onRemoveSignature, onUpdateSignature, onEditSignature, onDropSignature, registerPageRef, isPanMode }: PdfSignerPageProps) => {
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
    const meta = e.dataTransfer.getData("signature-meta");
    if (!image || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    onDropSignature(image, x, y, meta);
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
              onUpdate={onUpdateSignature}
              onEdit={onEditSignature}
              disabled={isPanMode}
            />
          ))}
        </div>
      </div>
    </div>
  );
});

LazyViewerPage.displayName = "LazyViewerPage";

// --- Sub-componente: Miniatura de la página (Optimizada) ---
const LazyThumbnailPage = memo(({ pageNumber, onClick, active, registerRef }: { pageNumber: number, onClick: () => void, active: boolean, registerRef: (el: HTMLDivElement | null) => void }) => {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) setIsInView(true);
    }, { rootMargin: "180px" });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={(el) => {
        ref.current = el;
        registerRef(el);
      }}
      onClick={onClick}
      className={cn(
        "cursor-pointer group relative rounded-lg mb-2 border-2 transition-all p-1 min-h-[100px] flex items-center justify-center",
        active ? "border-primary bg-primary/5 shadow-md" : "border-transparent hover:border-zinc-300 dark:hover:border-zinc-700"
      )}
    >
      {isInView ? (
        <Page pageNumber={pageNumber} width={120} height={120} renderTextLayer={false} renderAnnotationLayer={false} className="block" loading={null} />
      ) : (
        <div className="w-[140px] h-[180px] bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-[10px] text-zinc-400">
          Pág {pageNumber}
        </div>
      )}
      <div className="absolute top-1 left-1 bg-zinc-800/80 text-white text-xs font-bold py-0 px-1 rounded z-10">
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
  initialSignatures?: any[];
  onSignaturesUpdate: (sigs: any[]) => void;
  onEditSignature?: (id: string) => void;
}

export function PdfSignerEditorArea({ file, fileId, initialSignatures = [], onSignaturesUpdate, onEditSignature }: PdfSignerEditorAreaProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [containerWidth, setContainerWidth] = useState<number>(800);
  const [placedSignatures, setPlacedSignatures] = useState<any[]>([]);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { w: number, h: number }>>({});
  const [showThumbnails, setShowThumbnails] = useState<boolean>(true);
  const [isCapturingDimensions, setIsCapturingDimensions] = useState(false);

  // Sync signatures to parent ONLY when they change and NOT from initialSignatures sync
  const lastSyncedSigs = useRef<string>("");

  useEffect(() => {
    const sigsString = JSON.stringify(placedSignatures);
    if (lastSyncedSigs.current !== sigsString) {
      lastSyncedSigs.current = sigsString;
      onSignaturesUpdate(placedSignatures);
    }
  }, [placedSignatures, onSignaturesUpdate]);

  // Sync external signatures (e.g. from editing dialog)
  useEffect(() => {
    const incomingSigsString = JSON.stringify(initialSignatures);
    if (incomingSigsString !== JSON.stringify(placedSignatures)) {
      setPlacedSignatures(initialSignatures);
      lastSyncedSigs.current = incomingSigsString; // Update ref to prevent feedback loop
    }
  }, [initialSignatures]);

  const vScrollRef = useRef<HTMLDivElement>(null);
  const thumbScrollRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const thumbRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Sincronizar scroll de miniaturas cuando cambia la página actual
  useEffect(() => {
    if (!showThumbnails) return;
    const thumbEl = thumbRefs.current[currentPage];
    if (thumbEl && thumbScrollRef.current) {
      const scrollArea = thumbScrollRef.current;
      const thumbTop = thumbEl.offsetTop;
      const thumbHeight = thumbEl.offsetHeight;
      const scrollHeight = scrollArea.offsetHeight;
      const currentScroll = scrollArea.scrollTop;

      // Si la miniatura está fuera del área visible del sidebar, centrarla
      if (thumbTop < currentScroll || (thumbTop + thumbHeight) > (currentScroll + scrollHeight)) {
        scrollArea.scrollTo({
          top: thumbTop - (scrollHeight / 2) + (thumbHeight / 2),
          behavior: "smooth"
        });
      }
    }
  }, [currentPage, showThumbnails]);

  useEffect(() => { setupPdfjs(); }, []);

  useEffect(() => {
    const updateWidth = () => {
      if (vScrollRef.current) {
        // Ocupar el 100% del ancho disponible menos un pequeño margen para el padding
        setContainerWidth(vScrollRef.current.clientWidth - 48);
      }
    };
    updateWidth();
    window.addEventListener("resize", updateWidth);
    return () => window.removeEventListener("resize", updateWidth);
  }, []); // Ya no depende de showThumbnails porque vScrollRef ya lo tiene en cuenta

  const pageWidth = containerWidth;

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

  const handleDropSignature = useCallback((pageNumber: number, image: string, x: number, y: number, meta?: string) => {
    let sourceMeta = null;
    if (meta) {
      try {
        sourceMeta = JSON.parse(meta);
      } catch (e) {
        console.error("Error parsing signature meta", e);
      }
    }

    // Calcular ancho inicial proporcional (aprox 150px en vista estándar)
    const initialWidth = 0.25; // 25% del ancho de página
    const initialHeight = 0.10; // 10% del alto aprox

    const newSig = {
      id: `sig-${Date.now()}-${Math.random()}`,
      pageNumber,
      image,
      x: Math.max(0, x - (initialWidth / 2)),
      y: Math.max(0, y - (initialHeight / 2)),
      width: initialWidth,
      height: initialHeight,
      rotation: 0,
      source: sourceMeta
    };
    setPlacedSignatures(prev => [...prev, newSig]);
  }, []);

  const removeSignature = useCallback((id: string) => {
    setPlacedSignatures(prev => prev.filter(s => s.id !== id));
  }, []); // No need for onSignaturesUpdate in deps anymore

  const updateSignature = useCallback((id: string, updates: any) => {
    setPlacedSignatures(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  useEffect(() => {
    const triggerSign = (e: any) => {
      if (e.detail.fileId !== fileId) return;
      const finalSignatures: Signature[] = placedSignatures.map(sig => {
        const dimensions = pageDimensions[sig.pageNumber] || { w: 595, h: 841 };

        // Al usar coordenadas porcentuales (0-1), multiplicamos directamente por las dimensiones del PDF
        return {
          id: sig.id,
          pageNumber: sig.pageNumber,
          image: sig.image,
          x: sig.x * dimensions.w,
          y: dimensions.h - (sig.y * dimensions.h) - (sig.height * dimensions.h),
          width: sig.width * dimensions.w,
          height: sig.height * dimensions.h,
          rotation: sig.rotation || 0,
          opacity: 1
        };
      });
      document.dispatchEvent(new CustomEvent('sign-pdf-final-submit', { detail: { signatures: finalSignatures, fileId } }));
    };
    document.addEventListener('trigger-sign-process', triggerSign);
    return () => document.removeEventListener('trigger-sign-process', triggerSign);
  }, [placedSignatures, pageDimensions, fileId]);

  return (
    <div className="flex h-full bg-zinc-100/30 dark:bg-zinc-950/20 relative overflow-hidden">

      {/* Miniaturas Sidebar */}
      {showThumbnails && (
        <div className="w-[180px] border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col z-20">
          <div className="p-3 border-b flex items-center justify-between">
            <h3 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Páginas ({numPages})</h3>
          </div>
          <ScrollArea className="flex-1" ref={thumbScrollRef}>
            <div className="px-2 py-3 space-y-4">
              <Document file={file} loading={null}>
                {Array.from(new Array(numPages), (_, i) => (
                  <LazyThumbnailPage
                    key={`thumb_${i + 1}`}
                    pageNumber={i + 1}
                    active={currentPage === i + 1}
                    onClick={() => scrollToPage(i + 1)}
                    registerRef={(el) => thumbRefs.current[i + 1] = el}
                  />
                ))}
              </Document>
            </div>
          </ScrollArea>
        </div>
      )}

      {/* Visor Area */}
      <div className="flex-1 min-w-0 flex flex-col relative overflow-hidden">

        {/* Floating Toolbar */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1.5 p-1.5 bg-white/60 dark:bg-zinc-900/95 backdrop-blur-md border border-zinc-200 dark:border-zinc-800 rounded-full shadow-2xl shadow-primary/5 transition-all">
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setShowThumbnails(!showThumbnails)} title="Ver Miniaturas">
            <LayoutPanelLeft className={cn("w-6 h-6", showThumbnails && "text-primary")} />
          </Button>

          <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

          {/* Navigación */}
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={currentPage <= 1} onClick={() => scrollToPage(currentPage - 1)}>
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <div className="text-xs font-bold min-w-max text-center flex flex-col leading-tight">
            <span>{currentPage} / {numPages}</span>
            {isCapturingDimensions && <span className="text-xs text-primary animate-pulse">Capturando...</span>}
          </div>
          <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" disabled={currentPage >= numPages} onClick={() => scrollToPage(currentPage + 1)}>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        <ScrollArea
          className="flex-1"
          ref={vScrollRef}
          onScroll={handleScroll}
        >
          <div className="p-6 pt-16 flex flex-col items-center">
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
                  onUpdateSignature={updateSignature}
                  onEditSignature={onEditSignature || (() => { })}
                  onDropSignature={(img, x, y, meta) => handleDropSignature(index + 1, img, x, y, meta)}
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
