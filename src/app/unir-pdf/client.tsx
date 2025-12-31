"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfFiles } from "@/hooks/usePdfFiles";

export default function UnirPdfClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    sortAZ,
    sortZA,
    reset,
  } = usePdfFiles();
  const {
    isProcessing,
    progress,
    isComplete,
    fileName,
    operation,
    phase,
    uploadStats,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew,
    cancelProcess
  } = usePdfProcessing();

  const handleFiles = async (newFiles: File[]) => {
    await addFiles(newFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (outputName: string) => {
    if (files.length < 2) {
      toast.error("Por favor sube al menos 2 archivos para unir.");
      return;
    }

    // Close dialog immediately
    setIsDialogOpen(false);

    const formData = new FormData();
    files.forEach((f) => {
      formData.append("files", f.file);
    });

    await processAndDownload(outputName, formData, {
      endpoint: "/api/worker/merge-pdf",
      extension: "pdf",
      operation: "Uniendo PDFs",
      successMessage: "¡PDF unido correctamente!",
      onContinueEditing: () => {
        // Keep files, just close processing screen
      }
    });
  };

  return (
    <>
      <PdfToolLayout
        toolId="merge-pdf"
        title="Unir PDF: Juntar y combinar PDF"
        description="Combina múltiples documentos en un solo archivo PDF. Sin marcas de agua, sin registro y con un límite de hasta 150MB por archivo."
        hasFiles={files.length > 0}
        onFilesSelected={handleFiles}
        dropzoneMultiple={true}
        onReset={reset}
        onAdd={() => fileInputRef.current?.click()}
        textAdd="Añadir PDF"
        features={{ sorting: true }}
        actions={{
          onSortAZ: sortAZ,
          onSortZA: sortZA,
        }}
        summaryItems={[
          { label: "Total archivos", value: files.length },
          { label: "Total páginas a unir", value: files.reduce((acc, f) => acc + (f.pageCount || 0), 0) },
          { label: "Peso total", value: (files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2) + " MB" },
        ]}
        downloadButtonText={isProcessing ? "Procesando..." : "Unir y Descargar PDF"}
        isDownloadDisabled={files.length < 2 || isProcessing}
        onDownload={() => setIsDialogOpen(true)}
        isGridLoading={false}
        saveDialogProps={{
          isOpen: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: "archivos-unidos",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar archivo",
          description: "Asigna un nombre a tu archivo PDF fusionado antes de descargarlo.",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <PdfGrid
          items={files}
          config={PDF_CARD_PRESETS.merge}
          extractCardData={(f) => ({
            id: f.id,
            file: f.file,
            name: f.name,
            size: f.file.size,
            pageCount: f.pageCount,
            rotation: f.rotation
          })}
          onReorder={reorderFiles}
          onRemove={removeFile}
        />

        {/* Hidden file input for "Añadir PDF" button */}
        <input
          ref={fileInputRef}
          type="file"
          accept="application/pdf"
          multiple
          className="hidden"
          onChange={(e) => {
            if (e.target.files) {
              handleFiles(Array.from(e.target.files));
            }
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
          phase={phase}
          uploadStats={uploadStats}
          onDownload={handleDownloadAgain}
          onEditAgain={() => handleContinueEditing()}
          onStartNew={() => handleStartNew(reset)}
          onCancel={cancelProcess}
        />
      )}
    </>
  );
}
