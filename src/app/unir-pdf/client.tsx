"use client";

import { useState, useRef, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";

import { Separator } from "@/components/ui/separator";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";

// Hooks
import { useMergePdf } from "@/hooks/useMergePdf";
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
    isLoading,
    hasPasswordError,
    passwordProtectedFileName,
    clearPasswordError
  } = usePdfFiles();
  const {
    isProcessing,
    progress,
    isComplete,
    phase,
    operation,
    uploadStats,
    result,
    merge,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useMergePdf();

  const handleFiles = useCallback(async (newFiles: File[]) => {
    await addFiles(newFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [addFiles]);

  const handleSubmit = useCallback(async (outputName: string) => {
    if (files.length < 2) {
      notify.error("Por favor sube al menos 2 archivos para unir.");
      return;
    }

    setIsDialogOpen(false);

    const fileList = files.map(f => f.file);
    await merge(fileList, { fileName: `${outputName}.pdf` });
  }, [files, merge]);

  const extractCardData = useCallback((f: any) => ({
    id: f.id,
    file: f.file,
    name: f.name,
    size: f.file.size,
    pageCount: f.pageCount,
    rotation: f.rotation
  }), []);

  const handleReset = () => {
    reset();
    clearPasswordError(); // Ensure we clear errors
  };

  return (
    <>
      <PdfToolLayout
        toolId="merge-pdf"
        title="Unir PDF: Juntar y combinar PDF"
        description="Combina múltiples documentos en un solo archivo PDF. Sin marcas de agua, sin registro y con un límite de hasta 150MB por archivo."
        hasFiles={files.length > 0 || hasPasswordError}
        onFilesSelected={handleFiles}
        dropzoneMultiple={true}
        onReset={handleReset}
        textAdd="Añadir otro PDF"
        hasPasswordError={hasPasswordError}
        passwordProtectedFileName={passwordProtectedFileName}
        features={{ sorting: true }}
        actions={{
          onSortAZ: sortAZ,
          onSortZA: sortZA,
        }}
        summaryItems={[
          { label: "Archivos cargados", value: files.length },
          { label: "Total páginas a unir", value: files.reduce((acc, f) => acc + (f.pageCount || 0), 0) },
          { label: "Peso final total", value: (files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2) + " MB" },
        ]}
        downloadButtonText={isProcessing ? "Procesando..." : "Descargar PDF"}
        isDownloadDisabled={files.length < 2 || isProcessing}
        onDownload={() => setIsDialogOpen(true)}
        isGridLoading={isLoading && files.length === 0 && !hasPasswordError}
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: "archivos-unidos",
          onSave: handleSubmit,
          isProcessing,
          description: "Asigna un nombre a tu archivo PDF fusionado antes de descargarlo.",
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
          config={PDF_CARD_PRESETS.merge}
          layout="grid"
          extractCardData={extractCardData}
          onReorder={reorderFiles}
          onRemove={removeFile}
          showAddCard={true}
          onAddFiles={handleFiles}
          addCardText="Añadir PDF"
          addCardSubtext="Arrastra o haz clic"
          addCardDisabled={isProcessing}
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
              reset();
            }}
            onCancel={cancelOperation}
            toolMetrics={
              result
                ? {
                  type: "merge",
                  data: {
                    filesCount: files.length,
                    totalPages: files.reduce((acc, f) => acc + (f.pageCount || 0), 0),
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
