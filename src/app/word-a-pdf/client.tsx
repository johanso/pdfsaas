"use client";

import { useState } from "react";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { useWordToPdf } from "@/hooks/useWordToPdf";

export default function WordToPdfClient() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    reset,
    isLoading,
  } = usePdfFiles(true); // Skip PDF validation for Word files

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
  } = useWordToPdf();

  const handleFilesSelected = (newFiles: File[]) => {
    // Validar extensión
    const validExtensions = ['.docx', '.doc'];
    const file = newFiles[0];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      alert('Por favor, selecciona un archivo Word válido (.docx o .doc)');
      return;
    }

    // Solo permitimos un archivo a la vez
    if (files.length > 0) {
      reset();
    }
    addFiles([file]);
  };

  const handleSubmit = async (fileName: string) => {
    if (files.length === 0) return;

    // Close dialog immediately
    setIsDialogOpen(false);

    await convert(files[0].file, { fileName });
  };

  return (
    <>
      <PdfToolLayout
        toolId="word-to-pdf"
        title="Convertir Word: DOC y DOCX a PDF"
        description="Transforma tus documentos de texto en archivos PDF de alta calidad. Mantenemos el formato original, las tablas y las imágenes intactas."
        hasFiles={files.length > 0}
        onFilesSelected={handleFilesSelected}
        acceptedFileTypes=".doc,.docx,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
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
          defaultName: files[0]?.name.replace(/\.(docx|doc)$/i, "") || "documento",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar como PDF",
          description: "Elige un nombre para tu archivo PDF.",
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false, // Controlled by ProcessingScreen now
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
                    originalFormat: files[0]?.name.split('.').pop()?.toUpperCase() || "WORD",
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
