"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";

// Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";

// Hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfPages } from "@/hooks/usePdfPages";
import { usePageSelection } from "@/hooks/usePageSelection";

export default function DeletePagesClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Hooks principales
  const { pages, reorderPages } = usePdfPages(file);
  const {
    selectedPages,
    togglePage,
    selectAll,
    deselectAll,
    invertSelection,
    selectByRange,
    reset: resetSelection
  } = usePageSelection(pages.length);
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

  // Convertir selectedPages (números) a IDs para el PdfGrid
  const selectedIds = useMemo(() => pages
    .filter(p => selectedPages.includes(p.originalIndex))
    .map(p => p.id),
    [pages, selectedPages]
  );

  const handleToggle = useCallback((id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) togglePage(page.originalIndex);
  }, [pages, togglePage]);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      resetSelection();
    }
  }, [resetSelection]);

  const extractCardData = useCallback((p: any) => ({
    id: p.id,
    file: p.file,
    pageNumber: p.originalIndex,
    rotation: p.rotation,
    isBlank: p.isBlank
  }), []);

  const handleRangeChange = (input: string) => {
    const sanitized = input
      .replace(/[^0-9,-]/g, "")
      .replace(/^0+|(?<=[,-])0+/g, "");
    selectByRange(sanitized);
  };

  const handleReset = () => {
    setFile(null);
    resetSelection();
  };

  const handleOpenSaveDialog = () => {
    if (!file || pages.length === 0) {
      toast.error("No hay páginas para procesar");
      return;
    }
    if (selectedPages.length === pages.length) {
      toast.error("No puedes eliminar todas las páginas.");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (outputName: string) => {
    if (!file || pages.length === 0) return;

    // Close dialog immediately
    setIsDialogOpen(false);

    const formData = new FormData();
    formData.append("file", file);

    // Enviar solo las páginas que NO están seleccionadas para eliminar
    const remainingPages = pages.filter(p => !selectedPages.includes(p.originalIndex));

    const pageInstructions = remainingPages.map(p => ({
      originalIndex: p.originalIndex - 1, // API espera índice base 0
      rotation: p.rotation
    }));

    formData.append("pageInstructions", JSON.stringify(pageInstructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/worker/delete-pages",
      extension: "pdf",
      operation: "Eliminando páginas",
      successMessage: "¡PDF procesado correctamente!",
      onContinueEditing: () => {
        // Keep state
      }
    });
  };

  return (
    <>
      <PdfToolLayout
        toolId="delete-pages"
        title="Eliminar Páginas PDF"
        description="Selecciona visualmente las páginas que no sirven y descarga un documento limpio. Fácil, rápido y compatible con selección por rangos."
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        features={{ selection: true }}
        actions={{
          onSelectAll: selectAll,
          onDeselectAll: deselectAll,
          onInvertSelection: invertSelection,
        }}
        summaryItems={[
          { label: "Total páginas cargadas", value: pages.length },
          { label: "Páginas a eliminar", value: selectedPages.length },
          { label: "Documento final", value: `${Math.max(0, pages.length - selectedPages.length)} páginas` },
        ]}
        downloadButtonText={isProcessing ? "Procesando..." : "Guardar Documento"}
        isDownloadDisabled={isProcessing || selectedPages.length === 0}
        onDownload={handleOpenSaveDialog}
        isGridLoading={file !== null && pages.length === 0}
        sidebarCustomControls={
          <>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selección por rango:</Label>
              <Input
                className="h-10 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800"
                placeholder="Ej: 1, 3-5, 8"
                onChange={(e) => handleRangeChange(e.target.value)}
              />
              <p className="text-[11px] text-zinc-500">
                Usa comas y guiones para especificar páginas
              </p>
            </div>
            <Separator className="my-4" />
          </>
        }
        saveDialogProps={{
          isOpen: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: "documento-modificado",
          onSave: handleSave,
          isProcessing,
          title: "Guardar documento",
          description: "Asigna un nombre a tu documento PDF modificado.",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <PdfGrid
          items={pages}
          config={PDF_CARD_PRESETS.delete}
          selectedIds={selectedIds}
          extractCardData={extractCardData}
          onReorder={reorderPages}
          onToggle={handleToggle}
        />
      </PdfToolLayout>

      {/* Processing Screen */}
      {
        (isProcessing || isComplete) && (
          <ProcessingScreen
            fileName={fileName}
            operation={operation}
            progress={progress}
            isComplete={isComplete}
            onDownload={handleDownloadAgain}
            onEditAgain={() => handleContinueEditing()}
            onStartNew={() => handleStartNew(handleReset)}
          />
        )
      }
    </>
  );
}
