// app/html-a-pdf/page.tsx
"use client";

import { useState } from "react";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import ProcessingScreen from "@/components/processing-screen";
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";

export default function HtmlToPdfPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { files, addFiles, removeFile, reset } = usePdfFiles(true);

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
    const validExtensions = ['.html', '.htm'];
    const file = newFiles[0];
    const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

    if (!validExtensions.includes(fileExtension)) {
      alert('Por favor, selecciona un archivo HTML válido (.html o .htm)');
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

    const formData = new FormData();
    formData.append("file", files[0].file);

    await processAndDownload(fileName, formData, {
      endpoint: "/api/worker/html-to-pdf",
      extension: "pdf",
      operation: "Convirtiendo HTML a PDF",
      successMessage: "¡Página HTML convertida a PDF correctamente!",
      onContinueEditing: () => { }
    });
  };

  return (
    <>
      <PdfToolLayout
        toolId="html-to-pdf"
        title="Convertir HTML a PDF"
        description="Convierte páginas web y archivos HTML a documentos PDF profesionales con estilos CSS preservados."
        hasFiles={files.length > 0}
        onFilesSelected={handleFilesSelected}
        acceptedFileTypes=".html,.htm,text/html"
        onReset={reset}
        summaryItems={[
          {
            label: "Archivo",
            value: files[0] ? `${files[0].name}` : "-"
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
        saveDialogProps={{
          isOpen: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: files[0]?.name.replace(/\.(html|htm)$/i, "") || "pagina-web",
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

      {isProcessing && (
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