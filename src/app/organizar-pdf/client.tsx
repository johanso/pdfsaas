"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { notify } from "@/lib/errors/notifications";

// Components
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";


// Hooks
import { useOrganizePdf } from "@/hooks/useOrganizePdf";
import { usePdfMultiLoader } from "@/hooks/usePdfMultiLoader";
import { PageData } from "@/types";

export default function OrganizePdfClient() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  // Reset state when navigating away from this tool
  useEffect(() => {
    if (previousPathname.current && previousPathname.current !== pathname) {
      setPages([]);
      setSelectedIds([]);
      setShowSaveDialog(false);
      setIsGridLoading(false);
    }
    previousPathname.current = pathname;
  }, [pathname]);

  const {
    isProcessing,
    progress,
    isComplete,
    phase,
    operation,
    uploadStats,
    result,
    organize,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useOrganizePdf();
  const { loadPdfPages, hasPasswordError, passwordProtectedFileName, clearPasswordError } = usePdfMultiLoader();

  // Unique files for summary
  const uniqueFiles = Array.from(
    new Set(pages.map(p => p.file).filter(f => f !== undefined))
  ) as File[];

  const handleAddFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    setIsGridLoading(true);
    try {
      const newPages = await loadPdfPages(files);
      if (newPages.length > 0) {
        setPages(prev => [...newPages, ...prev]);
        notify.success(`${newPages.length} página(s) añadida(s)`);
      } else {
        notify.error("No se pudieron cargar archivos PDF");
      }
    } catch (error) {
      notify.error("Error al cargar los archivos");
    } finally {
      setIsGridLoading(false);
    }
  }, [loadPdfPages]);

  const handleReset = useCallback(() => {
    setPages([]);
    setSelectedIds([]);
    clearPasswordError(); // Clear password errors
  }, [clearPasswordError]);

  const handleToggle = useCallback((id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]);
  }, []);

  const handleGridRotateLeft = useCallback((id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: p.rotation - 90 } : p));
  }, []);

  const handleGridRotateRight = useCallback((id: string) => {
    setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: p.rotation + 90 } : p));
  }, []);

  const handleDuplicate = useCallback((id: string) => {
    setPages(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      const newPages = [...prev];
      newPages.splice(idx + 1, 0, { ...prev[idx], id: crypto.randomUUID() });
      return newPages;
    });
    notify.success("Página duplicada");
  }, []);

  const handleInsertBlank = useCallback((id: string) => {
    setPages(prev => {
      const idx = prev.findIndex(p => p.id === id);
      if (idx === -1) return prev;
      const newPages = [...prev];
      newPages.splice(idx + 1, 0, { id: crypto.randomUUID(), file: undefined as any, originalIndex: 0, rotation: 0, isBlank: true });
      return newPages;
    });
    notify.success("Página en blanco insertada");
  }, []);

  const handleRemove = useCallback((id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => prev.filter(pid => pid !== id));
  }, []);

  const extractCardData = useCallback((page: any) => ({
    id: page.id,
    file: page.file,
    pageNumber: page.originalIndex,
    rotation: page.rotation,
    isBlank: page.isBlank
  }), []);

  const handleSave = async (outputName: string) => {
    if (pages.length === 0) return;

    // Close dialog immediately
    setShowSaveDialog(false);

    const uniqueFilesToUpload = Array.from(new Set(pages.map(p => p.file).filter(f => !!f))) as File[];

    const instructions = pages.map(p => ({
      fileIndex: p.file ? uniqueFilesToUpload.indexOf(p.file) : -1,
      originalIndex: p.originalIndex,
      rotation: p.rotation,
      isBlank: !!p.isBlank
    }));

    await organize(uniqueFilesToUpload, {
      instructions,
      fileName: outputName,
    });
  };

  const summaryItems = [
    { label: "Archivos cargados", value: uniqueFiles.length },
    { label: "En blanco", value: pages.filter(p => p.isBlank).length },
    { label: "Total páginas", value: pages.length },
  ].filter(i => (typeof i.value === 'number' && i.value > 0) || typeof i.value !== 'number');

  return (
    <>
      <PdfToolLayout
        toolId="organize-pdf"
        title="Organizar, Ordenar, Eliminar y Añadir PDFs"
        description="El editor de estructura completo. Arrastra para cambiar el orden, inserta páginas en blanco, duplica hojas o combina varios archivos en uno nuevo."
        hasFiles={pages.length > 0 || hasPasswordError}
        onFilesSelected={handleAddFiles}
        onReset={handleReset}
        hasPasswordError={hasPasswordError}
        passwordProtectedFileName={passwordProtectedFileName}
        dropzoneMultiple={true}
        summaryItems={[
          { label: "Archivos", value: uniqueFiles.length },
          { label: "Total Páginas", value: pages.length },
          { label: "Seleccionadas", value: selectedIds.length },
        ]}
        downloadButtonText="Organizar y Descargar"
        isDownloadDisabled={pages.length === 0 || isProcessing}
        onDownload={() => setShowSaveDialog(true)}
        isGridLoading={isGridLoading && !hasPasswordError}
        saveDialogProps={{
          open: showSaveDialog,
          onOpenChange: setShowSaveDialog,
          defaultName: "documento-organizado",
          onSave: handleSave,
          isProcessing,
          title: "Guardar PDF Organizado",
          description: "Tu nuevo documento está listo para descargar.",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        {pages.length === 0 && hasPasswordError ? (
          <PasswordProtectedState
            fileName={passwordProtectedFileName || undefined}
            onReset={handleReset}
          />
        ) : (
          <PdfGrid
            items={pages}
            config={PDF_CARD_PRESETS.organize}
            layout="grid"
            extractCardData={extractCardData}
            onRemove={handleRemove}
            onReorder={setPages}
            showAddCard={true}
            onAddFiles={handleAddFiles}
            addCardText="Añadir PDF"
            addCardSubtext="Arrastra o haz clic"
            selectedIds={selectedIds}
            onToggle={handleToggle}
            onRotateLeft={handleGridRotateLeft}
            onRotateRight={handleGridRotateRight}
            onDuplicate={handleDuplicate}
            onInsertBlank={handleInsertBlank}
          />
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) handleAddFiles(Array.from(e.target.files));
            e.target.value = "";
          }}
        />
      </PdfToolLayout >

      {/* Processing Screen */}
      {
        (isProcessing || isComplete) && (
          <ProcessingScreen
            fileName={result?.fileName || "documento.pdf"}
            operation={operation}
            progress={progress}
            isComplete={isComplete}
            phase={phase}
            uploadStats={uploadStats}
            onDownload={handleDownloadAgain}
            onEditAgain={handleStartNew}
            onStartNew={() => {
              handleStartNew();
              handleReset();
            }}
            onCancel={cancelOperation}
            toolMetrics={
              result
                ? {
                  type: "pages",
                  data: {
                    pagesProcessed: pages.length,
                    pagesTotal: pages.length,
                    operation: `Organizadas (${result.filesUsed} archivo${result.filesUsed !== 1 ? 's' : ''}, ${result.blankPages} en blanco)`,
                    resultSize: result.resultSize,
                  }
                }
                : undefined
            }
          />
        )
      }
    </>
  );
}
