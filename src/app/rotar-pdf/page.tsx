"use client";

import { useState } from "react";
import { toast } from "sonner";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";

// Hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfPages } from "@/hooks/usePdfPages";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const { pages, rotateAllPages, resetRotation, rotatePage, reorderPages } = usePdfPages(file);
  const { isProcessing, processAndDownload } = usePdfProcessing();

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

    const formData = new FormData();
    formData.append("file", file);

    const pageInstructions = pages.map(p => ({
      originalIndex: p.originalIndex - 1,
      rotation: p.rotation
    }));

    formData.append("pageInstructions", JSON.stringify(pageInstructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/rotate-pdf",
      successMessage: "¡PDF rotado correctamente!",
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    setIsSuccessDialogOpen(false);
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  const hasModifications = pages.some(p => (p.rotation % 360) !== 0);

  return (
    <PdfToolLayout
      toolId="rotate-pdf"
      title="Rotar PDF"
      description="Corrige la orientación de tus documentos. Rota páginas sueltas o el archivo completo en segundos."
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
      isGridLoading={file !== null && pages.length === 0}
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
        isOpen: isSuccessDialogOpen,
        onOpenChange: setIsSuccessDialogOpen,
        onContinue: () => setIsSuccessDialogOpen(false),
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
      />
    </PdfToolLayout>
  );
}
