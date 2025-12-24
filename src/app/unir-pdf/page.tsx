"use client";

import { useState, useRef } from "react";
import { toast } from "sonner";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";

// Hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfFiles } from "@/hooks/usePdfFiles";

export default function UnirPdfPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
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
  const { isProcessing, processAndDownload } = usePdfProcessing();

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

    const formData = new FormData();
    files.forEach((f) => {
      formData.append("files", f.file);
    });

    await processAndDownload(outputName, formData, {
      endpoint: "/api/merge-pdf",
      successMessage: "¡PDF unido correctamente!",
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      }
    });
  };

  return (
    <PdfToolLayout
      toolId="merge-pdf"
      title="Unir PDF"
      description="Combina múltiples archivos PDF en un solo documento ordenado."
      hasFiles={files.length > 0}
      onFilesSelected={handleFiles}
      dropzoneMultiple={true}
      onReset={reset}
      onAdd={() => fileInputRef.current?.click()}
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
        defaultName: "merged-document",
        onSave: handleSubmit,
        isProcessing,
        title: "Guardar archivo",
        description: "Asigna un nombre a tu archivo PDF fusionado antes de descargarlo.",
      }}
      successDialogProps={{
        isOpen: isSuccessDialogOpen,
        onOpenChange: setIsSuccessDialogOpen,
        onContinue: () => setIsSuccessDialogOpen(false),
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
  );
}

