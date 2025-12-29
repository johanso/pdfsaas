"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfMultiLoader } from "@/hooks/usePdfMultiLoader";
import { PageData } from "@/types";

export default function OrganizePdfClient() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    isProcessing,
    progress,
    isComplete,
    fileName,
    operation,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew
  } = usePdfProcessing();
  const { loadPdfPages } = usePdfMultiLoader();

  // Unique files for summary
  const uniqueFiles = Array.from(
    new Set(pages.map(p => p.file).filter(f => f !== undefined))
  ) as File[];

  const handleAddFiles = async (files: File[]) => {
    const newPages = await loadPdfPages(files);
    if (newPages.length > 0) {
      setPages(prev => [...newPages, ...prev]);
      toast.success(`${newPages.length} página(s) añadida(s)`);
    } else if (files.length > 0) {
      toast.error("No se pudieron cargar archivos PDF");
    }
  };

  const handleReset = () => {
    setPages([]);
    setSelectedIds([]);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) return;
    const count = selectedIds.length;
    setPages(prev => prev.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    toast.success(`${count} página(s) eliminada(s)`);
  };

  const handleRotateBulk = (degrees: number) => {
    if (selectedIds.length === 0) return;
    setPages(prev => prev.map(p =>
      selectedIds.includes(p.id) ? { ...p, rotation: p.rotation + degrees } : p
    ));
  };

  const handleResetRotationBulk = () => {
    if (selectedIds.length === 0) return;
    setPages(prev => prev.map(p =>
      selectedIds.includes(p.id) ? { ...p, rotation: 0 } : p
    ));
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) return;
    setPages(prev => {
      const newPages = [...prev];
      for (let i = newPages.length - 1; i >= 0; i--) {
        if (selectedIds.includes(newPages[i].id)) {
          newPages.splice(i + 1, 0, { ...newPages[i], id: crypto.randomUUID() });
        }
      }
      return newPages;
    });
    toast.success(`${selectedIds.length} página(s) duplicada(s)`);
    setSelectedIds([]);
  };

  const handleSave = async (outputName: string) => {
    if (pages.length === 0) return;

    // Close dialog immediately
    setShowSaveDialog(false);

    const formData = new FormData();
    const uniqueFilesToUpload = Array.from(new Set(pages.map(p => p.file).filter(f => !!f))) as File[];

    uniqueFilesToUpload.forEach((f, i) => formData.append(`file-${i}`, f));

    const instructions = pages.map(p => ({
      fileIndex: p.file ? uniqueFilesToUpload.indexOf(p.file) : -1,
      originalIndex: p.originalIndex,
      rotation: p.rotation,
      isBlank: !!p.isBlank
    }));

    formData.append("instructions", JSON.stringify(instructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/organize-pdf",
      extension: "pdf",
      operation: "Organizando PDF",
      successMessage: "¡PDF organizado correctamente!",
      onContinueEditing: () => {
        // Keep state
      }
    });
  };

  const summaryItems = [
    { label: "Archivos", value: uniqueFiles.length },
    { label: "Total páginas", value: pages.length },
    { label: "Seleccionadas", value: selectedIds.length },
    { label: "En blanco", value: pages.filter(p => p.isBlank).length },
  ].filter(i => (typeof i.value === 'number' && i.value > 0) || typeof i.value !== 'number');

  return (
    <>
      <PdfToolLayout
        toolId="organize-pdf"
        title="Organizar PDF"
        description="Ordena, añade, gira y elimina páginas de múltiples archivos PDF."
        hasFiles={pages.length > 0}
        onFilesSelected={handleAddFiles}
        dropzoneMultiple
        onReset={handleReset}
        onAdd={() => fileInputRef.current?.click()}
        features={{
          selection: true,
          rotation: true,
          bulkActions: true,
        }}
        actions={{
          onSelectAll: () => setSelectedIds(pages.map(p => p.id)),
          onDeselectAll: () => setSelectedIds([]),
          onInvertSelection: () => setSelectedIds(pages.map(p => p.id).filter(id => !selectedIds.includes(id))),
          onRotateRights: () => handleRotateBulk(90),
          onRotateLefts: () => handleRotateBulk(-90),
          onResetOrientation: handleResetRotationBulk,
          onDuplicateSelected: handleDuplicateSelected,
          onDeleteSelected: handleDeleteSelected,
        }}
        state={{ hasSelection: selectedIds.length > 0 }}
        summaryItems={summaryItems}
        downloadButtonText={isProcessing ? "Procesando..." : "Guardar Documento"}
        isDownloadDisabled={isProcessing || pages.length === 0}
        onDownload={() => setShowSaveDialog(true)}
        isGridLoading={false}
        saveDialogProps={{
          isOpen: showSaveDialog,
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
        <PdfGrid
          items={pages}
          config={PDF_CARD_PRESETS.organize}
          selectedIds={selectedIds}
          extractCardData={(page) => ({
            id: page.id,
            file: page.file,
            pageNumber: page.originalIndex,
            rotation: page.rotation,
            isBlank: page.isBlank
          })}
          onReorder={setPages}
          onToggle={(id) => setSelectedIds(prev => prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id])}
          onRotateLeft={(id) => setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: p.rotation - 90 } : p))}
          onRotateRight={(id) => setPages(prev => prev.map(p => p.id === id ? { ...p, rotation: p.rotation + 90 } : p))}
          onDuplicate={(id) => {
            const idx = pages.findIndex(p => p.id === id);
            if (idx === -1) return;
            const newPages = [...pages];
            newPages.splice(idx + 1, 0, { ...pages[idx], id: crypto.randomUUID() });
            setPages(newPages);
            toast.success("Página duplicada");
          }}
          onInsertBlank={(id) => {
            const idx = pages.findIndex(p => p.id === id);
            if (idx === -1) return;
            const newPages = [...pages];
            newPages.splice(idx + 1, 0, { id: crypto.randomUUID(), file: undefined as any, originalIndex: 0, rotation: 0, isBlank: true });
            setPages(newPages);
            toast.success("Página en blanco insertada");
          }}
          onRemove={(id) => {
            setPages(prev => prev.filter(p => p.id !== id));
            setSelectedIds(prev => prev.filter(pid => pid !== id));
          }}
        />
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
      </PdfToolLayout>

      {/* Processing Screen */}
      {isProcessing && (
        <ProcessingScreen
          fileName={fileName}
          operation={operation}
          progress={progress}
          isComplete={isComplete}
          onDownload={handleDownloadAgain}
          onEditAgain={() => handleContinueEditing()}
          onStartNew={() => handleStartNew(handleReset)}
        />
      )}
    </>
  );
}
