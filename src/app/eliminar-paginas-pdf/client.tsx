"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { notify } from "@/lib/errors/notifications";
import { CheckCircle2, Circle } from "lucide-react";

// Components
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";

// Hooks
import { useDeletePages } from "@/hooks/useDeletePages";
import { usePdfPages } from "@/hooks/usePdfPages";
import { usePageSelection } from "@/hooks/usePageSelection";
import { cn } from "@/lib/utils";

export default function DeletePagesClient() {
  const [file, setFile] = useState<File | null>(null);
  const [extractMode, setExtractMode] = useState<"separate" | "merge">("merge");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const pathname = usePathname();
  const previousPathname = useRef<string | null>(null);

  // Hooks principales
  const { pages, reorderPages, isLoading: isPagesLoading, hasPasswordError, passwordProtectedFileName, clearPasswordError } = usePdfPages(file);
  const {
    selectedPages,
    togglePage,
    selectAll,
    deselectAll,
    invertSelection,
    selectByRange,
    reset: resetSelection
  } = usePageSelection(pages.length);

  // Reset state when navigating away from this tool
  useEffect(() => {
    if (previousPathname.current && previousPathname.current !== pathname) {
      setFile(null);
      setExtractMode("merge");
      setIsDialogOpen(false);
      resetSelection();
    }
    previousPathname.current = pathname;
  }, [pathname, resetSelection]);

  const {
    isProcessing,
    progress,
    isComplete,
    phase,
    operation,
    uploadStats,
    result,
    deletePages,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useDeletePages();

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
    clearPasswordError();
  };

  const handleOpenSaveDialog = () => {
    if (!file || pages.length === 0) {
      notify.error("No hay páginas para procesar");
      return;
    }
    if (selectedPages.length === pages.length) {
      notify.error("No puedes eliminar todas las páginas.");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSave = async (outputName: string) => {
    if (!file || pages.length === 0) return;

    // Close dialog immediately
    setIsDialogOpen(false);

    // Enviar solo las páginas que NO están seleccionadas para eliminar
    const remainingPages = pages.filter(p => !selectedPages.includes(p.originalIndex));

    const pageInstructions = remainingPages.map(p => ({
      originalIndex: p.originalIndex - 1, // API espera índice base 0
      rotation: p.rotation
    }));

    const isZip = extractMode === "separate" && remainingPages.length > 1;

    await deletePages(file, {
      pageInstructions,
      fileName: outputName,
      mode: extractMode,
      isZip,
    });
  };

  return (
    <>
      <PdfToolLayout
        toolId="delete-pages"
        title="Eliminar Páginas PDF"
        description="Selecciona las páginas que deseas eliminar. Herramienta visual rápida para separar hojas sueltas o crear nuevos documentos PDF. Compatible con selección por rangos"
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
          { label: "Archivo", value: file ? file.name : "Ninguno" },
          { label: "Total páginas", value: pages.length },
          { label: "Páginas a eliminar", value: selectedPages.length },
        ]}
        downloadButtonText={isProcessing ? "Procesando..." : (extractMode === "separate" && (pages.length - selectedPages.length) > 1 ? "Descargar ZIP" : "Descargar PDF")}
        isDownloadDisabled={isProcessing || selectedPages.length === 0}
        onDownload={handleOpenSaveDialog}
        isGridLoading={isPagesLoading}
        sidebarCustomControls={
          <>
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Selección por rango:</Label>
                <Input
                  className="h-10 text-sm bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-none"
                  placeholder="Ej: 1, 3-5, 8"
                  onChange={(e) => handleRangeChange(e.target.value)}
                />
                <p className="text-[11px] text-zinc-500">
                  Usa comas y guiones para especificar páginas
                </p>
              </div>

              <div className="space-y-4">
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
                        Genera un archivo ZIP con {Math.max(0, pages.length - selectedPages.length)} PDF individuales.
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
                        Crea un único documento con las páginas restantes.
                      </p>
                    </div>
                  </button>
                </div>
              </div>
            </div>
            <Separator className="my-4" />
          </>
        }
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: "documento-modificado",
          onSave: handleSave,
          isProcessing,
          title: extractMode === "separate" && (pages.length - selectedPages.length) > 1 ? "Guardar archivo ZIP" : "Guardar archivo PDF",
          description: extractMode === "separate" && (pages.length - selectedPages.length) > 1
            ? "Asigna un nombre a tu archivo comprimido."
            : "Asigna un nombre a tu nuevo archivo PDF.",
          extension: extractMode === "separate" && (pages.length - selectedPages.length) > 1 ? "zip" : "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        {hasPasswordError ? (
          <PasswordProtectedState
            fileName={passwordProtectedFileName || undefined}
            onReset={handleReset}
          />
        ) : (
          <PdfGrid
            items={pages}
            config={PDF_CARD_PRESETS.delete}
            selectedIds={selectedIds}
            extractCardData={extractCardData}
            onReorder={reorderPages}
            onToggle={handleToggle}
          />
        )}
      </PdfToolLayout>

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
                    pagesProcessed: pages.length - selectedPages.length,
                    pagesTotal: pages.length,
                    operation: "Restantes",
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
