"use client";

import { useState } from "react";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { usePowerPointToPdf } from "@/hooks/usePowerPointToPdf";

export default function PowerPointToPdfClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    reset,
    isLoading,
  } = usePdfFiles(true);

  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    result,
    convert,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = usePowerPointToPdf();

  const handleFilesSelected = (newFiles: File[]) => {
    // Validar extensión
    const validExtensions = ['.pptx', '.ppt'];
    const file = newFiles[0];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      alert('Por favor, selecciona un archivo PowerPoint válido (.pptx o .ppt)');
      return;
    }

    if (files.length > 0) {
      reset();
    }
    addFiles([file]);
  };

  const handleSubmit = async (fileName: string) => {
    if (files.length === 0) return;
    setIsDialogOpen(false);
    await convert(files[0].file, { fileName });
  };

  return (
    <>
      <PdfToolLayout
        toolId="powerpoint-to-pdf"
        title="Convertir PowerPoint: PPT y PPTX a PDF"
        description="Transforma tus presentaciones en documentos portátiles. Asegura que nadie mueva tus textos o imágenes al compartir tus diapositivas."
        hasFiles={files.length > 0}
        onFilesSelected={handleFilesSelected}
        acceptedFileTypes=".ppt,.pptx,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
        onReset={reset}
        summaryItems={[
          { label: "Formato de salida", value: "PDF" }
        ]}
        downloadButtonText="Convertir a PDF"
        isDownloadDisabled={isProcessing || files.length === 0}
        onDownload={() => setIsDialogOpen(true)}
        isGridLoading={isLoading && files.length === 0}
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: files[0]?.name.replace(/\.(pptx|ppt)$/i, "") || "presentacion",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar como PDF",
          description: "Elige un nombre para tu archivo PDF.",
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
        layout="grid"
      >
        <PdfGrid
          items={files}
          layout="list"
          config={PDF_CARD_PRESETS.officeToPdf}
          extractCardData={(f) => ({
            id: f.id,
            file: f.file,
            name: f.name,
            size: f.file.size,
            pageCount: f.pageCount,
          })}
          onRemove={removeFile}
        />
      </PdfToolLayout>

      {/* Processing Screen */}
      {(isProcessing || isComplete) && (
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
            reset();
          }}
          onCancel={cancelOperation}
          toolMetrics={
            result
              ? {
                  type: "convert",
                  data: {
                    originalFormat: files[0]?.name.split('.').pop()?.toUpperCase() || "PPT",
                    slides: result.slides,
                    resultSize: result.resultSize,
                  }
                }
              : undefined
          }
        />
      )}
    </>
  );
}
