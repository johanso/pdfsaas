"use client";

import { useState } from "react";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";

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
    progress,
    isComplete,
    fileName,
    operation,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew
  } = usePdfProcessing();

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

    const formData = new FormData();
    formData.append("file", files[0].file);

    await processAndDownload(fileName, formData, {
      endpoint: "/api/worker/word-to-pdf",
      extension: "pdf",
      operation: "Convirtiendo Word a PDF",
      successMessage: "¡Documento convertido a PDF correctamente!",
      onContinueEditing: () => {
        // Keep files, just close processing screen
      }
    });
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
          {
            label: "Archivo",
            value: files[0]
              ? `${files[0].name}`
              : "-"
          },
          {
            label: "Peso total",
            value: files[0]
              ? `${(files[0].file.size / 1024 / 1024).toFixed(2)} MB`
              : "-"
          },
          { label: "Formato de salida", value: "PDF" }
        ]}
        downloadButtonText="Convertir a PDF"
        isDownloadDisabled={isProcessing || files.length === 0}
        onDownload={() => setIsDialogOpen(true)}
        isGridLoading={isLoading && files.length === 0}
        saveDialogProps={{
          isOpen: isDialogOpen,
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
      >
        <PdfGrid
          items={files}
          config={{
            ...PDF_CARD_PRESETS.merge,
            draggable: false,
            selectable: false,
            removable: false,
          }}
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
          fileName={fileName}
          operation={operation}
          progress={progress}
          isComplete={isComplete}
          onDownload={handleDownloadAgain}
          onEditAgain={() => handleContinueEditing()}
          onStartNew={() => handleStartNew(reset)}
        />
      )}
    </>
  );
}
