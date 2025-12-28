"use client";

import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle2, Circle } from "lucide-react";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePageSelection } from "@/hooks/usePageSelection";
import { usePdfPages } from "@/hooks/usePdfPages";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

export default function ExtractPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractMode, setExtractMode] = useState<"separate" | "merge">("separate");
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { pages, reorderPages } = usePdfPages(file);
  const {
    selectedPages,
    togglePage,
    selectAll,
    deselectAll,
    invertSelection,
    reset: resetSelection
  } = usePageSelection(pages.length);

  const { isProcessing,
    progress,
    isComplete,
    fileName,
    operation,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew } = usePdfProcessing();

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      if (f.type !== "application/pdf") {
        toast.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      resetSelection();
      setFile(f);
    }
  };

  const handleReset = () => {
    setFile(null);
    resetSelection();
  };

  const handlePreSubmit = () => {
    if (!file) return;
    if (selectedPages.length === 0) {
      toast.error("Selecciona al menos una página para extraer");
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;

    setShowSaveDialog(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "extract");

    const orderedSelectedPages = pages
      .filter(p => selectedPages.includes(p.originalIndex))
      .map(p => p.originalIndex);

    const config = {
      pages: orderedSelectedPages,
      merge: extractMode === "merge"
    };
    formData.append("config", JSON.stringify(config));

    await processAndDownload(fileName, formData, {
      endpoint: "/api/split-pdf",
      extension: extractMode === "separate" && selectedPages.length > 1 ? "zip" : "pdf",
      operation: "Extrayendo páginas",
      successMessage: "¡Páginas extraídas correctamente!",
      onContinueEditing: () => {
        // Keep state
      }
    });
  };

  return (
    <>
      <PdfToolLayout
        toolId="extract-pages"
        title="Extraer Páginas PDF"
        description="Selecciona las páginas que quieres conservar y crea un nuevo PDF o descárgalas por separado."
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
          { label: "Total páginas", value: pages.length },
          { label: "Seleccionadas", value: selectedPages.length },
          { label: "Modo", value: extractMode === "merge" ? "Fusionar en un PDF" : "Archivos separados" },
        ]}
        downloadButtonText={isProcessing ? "Procesando..." : (extractMode === "separate" && selectedPages.length > 1 ? "Descargar ZIP" : "Descargar PDF")}
        isDownloadDisabled={isProcessing || selectedPages.length === 0}
        onDownload={handlePreSubmit}
        isGridLoading={file !== null && pages.length === 0}
        sidebarCustomControls={
          <>
            <div className="space-y-4 pt-2">
              <p className="text-sm font-medium">¿Cómo quieres descargar?</p>
              <div className="flex flex-col gap-3">
                <button
                  className={cn(
                    "relative flex items-start gap-3 px-3 py-3 rounded-lg border transition-all text-left",
                    extractMode === "separate"
                      ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                  )}
                  onClick={() => setExtractMode("separate")}
                >
                  <div className="mt-0.5">
                    {extractMode === "separate" ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Páginas separadas</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                      Genera un archivo ZIP con {selectedPages.length} PDF{selectedPages.length !== 1 ? 's' : ''} individuales.
                    </p>
                  </div>
                </button>

                <button
                  className={cn(
                    "relative flex items-start gap-3 px-3 py-3 rounded-lg border transition-all text-left",
                    extractMode === "merge"
                      ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                  )}
                  onClick={() => setExtractMode("merge")}
                >
                  <div className="mt-0.5">
                    {extractMode === "merge" ? <CheckCircle2 className="w-5 h-5 text-primary" /> : <Circle className="w-5 h-5 text-zinc-300 dark:text-zinc-700" />}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Fusionar en un PDF</p>
                    <p className="text-[11px] text-zinc-500 mt-0.5 leading-relaxed">
                      Crea un único documento con las {selectedPages.length} página{selectedPages.length !== 1 ? 's' : ''} seleccionadas.
                    </p>
                  </div>
                </button>
              </div>
            </div>
            <Separator className="my-4" />
          </>
        }
        saveDialogProps={{
          isOpen: showSaveDialog,
          onOpenChange: setShowSaveDialog,
          defaultName: "paginas-extraidas",
          onSave: handleSubmit,
          isProcessing,
          title: extractMode === "separate" ? "Guardar archivo ZIP" : "Guardar archivo PDF",
          description: extractMode === "separate" ? "Asigna un nombre a tu archivo comprimido." : "Asigna un nombre a tu nuevo archivo PDF.",
          extension: extractMode === "separate" ? "zip" : "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <PdfGrid
          items={pages}
          config={PDF_CARD_PRESETS.extract}
          extractCardData={(p) => ({
            id: p.id,
            file: p.file,
            pageNumber: p.originalIndex,
            rotation: p.rotation,
            isBlank: p.isBlank
          })}
          selectedIds={pages
            .filter(p => selectedPages.includes(p.originalIndex))
            .map(p => p.id)
          }
          onToggle={(id) => {
            const page = pages.find(p => p.id === id);
            if (page) togglePage(page.originalIndex);
          }}
          onReorder={reorderPages}
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
