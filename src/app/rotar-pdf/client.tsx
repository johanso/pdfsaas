"use client";

import { useState, useEffect, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";

// Hooks
import { useRotatePdf } from "@/hooks/useRotatePdf";
import { usePdfPages } from "@/hooks/usePdfPages";

export default function RotatePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const { pages, rotateAllPages, resetRotation, rotatePage, reorderPages, isLoading: isPagesLoading, hasPasswordError, passwordProtectedFileName, clearPasswordError } = usePdfPages(file);
  const {
    isProcessing,
    progress,
    isComplete,
    phase,
    operation,
    uploadStats,
    result,
    rotate,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useRotatePdf();


  useEffect(() => {
    if (pages.length > 0) {
      setIsInitialLoading(false);
    }
  }, [pages.length]);

  const handleRotateRight = () => {
    rotateAllPages(90);
    notify.success("Documento rotado a la derecha");
  };

  const handleRotateLeft = () => {
    rotateAllPages(-90);
    notify.success("Documento rotado a la izquierda");
  };

  const handleResetRotation = () => {
    resetRotation();
    notify.info("Rotación restablecida");
  };

  const handleSave = async (outputName: string) => {
    if (!file) return;

    // Close dialog immediately
    setIsDialogOpen(false);

    const pageInstructions = pages.map(p => ({
      originalIndex: p.originalIndex - 1,
      rotation: p.rotation
    }));

    await rotate(file, {
      pageInstructions,
      fileName: outputName,
    });
  };

  const handleReset = () => {
    setFile(null);
    setIsInitialLoading(false);
    clearPasswordError();
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setIsInitialLoading(true);
    }
  };

  const handleRemovePage = useCallback((id: string) => {
    const newPages = pages.filter(p => p.id !== id);
    if (newPages.length === 0) {
      handleReset();
    } else {
      reorderPages(newPages);
    }
  }, [pages, reorderPages, handleReset]);

  const extractCardData = useCallback((page: any) => ({
    id: page.id,
    file: page.file,
    pageNumber: page.originalIndex,
    rotation: page.rotation
  }), []);

  const handleGridRotateLeft = useCallback((id: string) => rotatePage(id, -90), [rotatePage]);
  const handleGridRotateRight = useCallback((id: string) => rotatePage(id, 90), [rotatePage]);

  const hasModifications = pages.some(p => (p.rotation % 360) !== 0);

  return (
    <>
      <PdfToolLayout
        toolId="rotate-pdf"
        title="Rotar / Girar PDF"
        description="Endereza tus documentos escaneados. Rota páginas individuales o todo el archivo a la vez y guarda los cambios permanentemente."
        hasFiles={!!file || hasPasswordError}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        features={{ rotation: true }}
        actions={{
          onRotateRights: handleRotateRight,
          onRotateLefts: handleRotateLeft,
          onResetOrientation: handleResetRotation,
        }}
        summaryItems={[
          { label: "Archivo", value: file ? file.name : "Ninguno" },
          { label: "Total páginas", value: pages.length },
          hasModifications ? (
            {
              label: "Páginas modificadas",
              value: `${pages.filter(p => (p.rotation % 360) !== 0).length} de ${pages.length}`,
            }
          ) : (
            {
              label: "Sin cambios pendientes",
              value: "",
            }
          ),
        ]}
        downloadButtonText={isProcessing ? "Procesando..." : "Descargar PDF"}
        isDownloadDisabled={isProcessing || !hasModifications}
        onDownload={() => setIsDialogOpen(true)}
        isGridLoading={isPagesLoading && !hasPasswordError}
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: "documento-modificado",
          onSave: handleSave,
          isProcessing,
          title: "Guardar archivo",
          description: "Asigna un nombre a tu archivo PDF rotado.",
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
            config={PDF_CARD_PRESETS.rotate}
            extractCardData={extractCardData}
            onReorder={reorderPages}
            onRotate={rotatePage}
            onRotateLeft={handleGridRotateLeft}
            onRotateRight={handleGridRotateRight}
            onRemove={handleRemovePage}
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
                    pagesProcessed: pages.filter(p => (p.rotation % 360) !== 0).length,
                    pagesTotal: pages.length,
                    operation: "Rotadas",
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
