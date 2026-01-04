"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfPages } from "@/hooks/usePdfPages";

export default function RotatePdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  const { pages, rotateAllPages, resetRotation, rotatePage, reorderPages } = usePdfPages(file);
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


  useEffect(() => {
    if (pages.length > 0) {
      setIsInitialLoading(false);
    }
  }, [pages.length]);

  const handleRotateRight = () => {
    rotateAllPages(90);
    toast.success("Documento rotado a la derecha");
  };

  const handleRotateLeft = () => {
    rotateAllPages(-90);
    toast.success("Documento rotado a la izquierda");
  };

  const handleResetRotation = () => {
    resetRotation();
    toast.info("Rotación restablecida");
  };

  const handleSave = async (outputName: string) => {
    if (!file) return;

    // Close dialog immediately
    setIsDialogOpen(false);

    const formData = new FormData();
    formData.append("file", file);

    const pageInstructions = pages.map(p => ({
      originalIndex: p.originalIndex - 1,
      rotation: p.rotation
    }));

    formData.append("pageInstructions", JSON.stringify(pageInstructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/worker/rotate-pdf",
      extension: "pdf",
      operation: "Rotando PDF",
      successMessage: "¡PDF rotado correctamente!",
      onContinueEditing: () => {
        // Keep files and state
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    setIsInitialLoading(false);
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setIsInitialLoading(true);
    }
  };

  const handleRemovePage = (id: string) => {
    const newPages = pages.filter(p => p.id !== id);
    if (newPages.length === 0) {
      handleReset();
    } else {
      reorderPages(newPages);
    }
  };

  const hasModifications = pages.some(p => (p.rotation % 360) !== 0);

  return (
    <>
      <PdfToolLayout
        toolId="rotate-pdf"
        title="Rotar / Girar PDF"
        description="Endereza tus documentos escaneados. Rota páginas individuales o todo el archivo a la vez y guarda los cambios permanentemente."
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        features={{ rotation: true }}
        actions={{
          onRotateRights: handleRotateRight,
          onRotateLefts: handleRotateLeft,
          onResetOrientation: handleResetRotation,
        }}
        summaryItems={[
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
        downloadButtonText={isProcessing ? "Procesando..." : "Aplicar Giro y Descargar"}
        isDownloadDisabled={isProcessing || !hasModifications}
        onDownload={() => setIsDialogOpen(true)}
        isGridLoading={isInitialLoading && pages.length === 0}
        saveDialogProps={{
          isOpen: isDialogOpen,
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
        <PdfGrid
          items={pages}
          config={PDF_CARD_PRESETS.rotate}
          extractCardData={(page) => ({
            id: page.id,
            file: page.file,
            pageNumber: page.originalIndex,
            rotation: page.rotation
          })}
          onReorder={reorderPages}
          onRotate={rotatePage}
          onRotateLeft={(id) => rotatePage(id, -90)}
          onRotateRight={(id) => rotatePage(id, 90)}
          onRemove={handleRemovePage}
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
