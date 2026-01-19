"use client";

import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import {
  Info
} from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import {
  useFlattenPdf,
  type FlattenMode,
} from "@/hooks/useFlattenPdf";

// Información de los modos de aplanado
const MODE_INFO = {
  all: {
    title: "Aplanar todo",
    description: "Formularios, anotaciones, comentarios y capas",
    explanation: "Convierte todos los elementos interactivos (formularios, anotaciones, comentarios y capas) en contenido estático. Opción más completa.",
  },
  forms: {
    title: "Solo formularios",
    description: "Convierte campos editables en texto fijo",
    explanation: "Convierte únicamente los campos de formulario editables en texto fijo. Mantiene anotaciones y comentarios intactos.",
  },
  annotations: {
    title: "Solo anotaciones",
    description: "Aplana comentarios, notas adhesivas y marcas",
    explanation: "Convierte únicamente anotaciones, notas adhesivas y marcas en contenido estático. Mantiene los formularios editables.",
  },
};

export default function FlattenPdfClient() {
  const [mode, setMode] = useState<FlattenMode>("all");
  const [compress, setCompress] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    reset: resetFiles,
    isLoading: isFilesLoading,
    hasPasswordError,
    passwordProtectedFileName,
    clearPasswordError,
  } = usePdfFiles();

  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    result,
    flatten,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useFlattenPdf();

  const file = files[0]?.file || null;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      const f = newFiles[0];
      if (f.type !== "application/pdf") {
        notify.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      addFiles([f]);
    }
  }, [addFiles]);

  const extractCardData = useCallback((f: any) => ({
    id: f.id,
    file: f.file,
    name: f.name,
    size: f.file.size,
    pageCount: f.pageCount,
    rotation: f.rotation,
  }), []);

  const handleReset = () => {
    resetFiles();
    setMode("all");
    setCompress(true);
    setIsDialogOpen(false);
    handleStartNew();
    clearPasswordError();
  };

  const handlePreSubmit = () => {
    if (!file) return;
    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;
    setIsDialogOpen(false);

    await flatten(file, {
      mode,
      compress,
      fileName,
    });
  };

  const modeInfo = MODE_INFO[mode];

  return (
    <>
      <PdfToolLayout
        toolId="flatten-pdf"
        title="Aplanar PDF: Unir Capas y Bloquear Edición"
        description="Convierte formularios rellenables y comentarios en contenido permanente. Evita la edición de tus documentos y asegura una impresión correcta uniendo todas las capas."
        hasFiles={!!file || hasPasswordError}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[]}
        downloadButtonText="Descargar PDF"
        isDownloadDisabled={isProcessing || files.length === 0}
        onDownload={handlePreSubmit}
        isGridLoading={isFilesLoading && files.length === 0 && !hasPasswordError}
        sidebarCustomControls={
          <div className="space-y-2">
            <div className="space-y-3 mb-4">
              <Label className="block text-sm font-semibold">
                Modo de Aplanado
              </Label>

              <Select value={mode} onValueChange={(value) => setMode(value as FlattenMode)}>
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue placeholder="Selecciona un modo de aplanado" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MODE_INFO) as FlattenMode[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="font-medium">{MODE_INFO[key].title}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {modeInfo.explanation}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Optimizar tamaño</Label>
                <Switch
                  checked={compress}
                  onCheckedChange={setCompress}
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Comprime el archivo después de aplanar para reducir aún más el peso del documento.
              </p>
            </div>

            <Separator className="my-4" />
          </div>
        }
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file ? file.name.replace(".pdf", "") : "aplanado",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar PDF aplanado",
          description: `Se aplicará modo ${modeInfo.title.toLowerCase()}. ${compress ? "El archivo será comprimido automáticamente." : ""}`,
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
        layout="grid"
      >
        {hasPasswordError ? (
          <PasswordProtectedState
            fileName={passwordProtectedFileName || undefined}
            onReset={handleReset}
          />
        ) : (
          <PdfGrid
            items={files}
            config={PDF_CARD_PRESETS.compress}
            layout="list"
            extractCardData={extractCardData}
            onRemove={removeFile}
          />
        )}
      </PdfToolLayout>

      {(isProcessing || isComplete) && (
        <ProcessingScreen
          progress={progress}
          isComplete={isComplete}
          phase={phase}
          uploadStats={uploadStats}
          fileName={result?.fileName || file?.name || "documento.pdf"}
          operation={operation}
          onDownload={handleDownloadAgain}
          onEditAgain={handleStartNew}
          onStartNew={handleReset}
          onCancel={phase === "uploading" || phase === "processing" ? cancelOperation : undefined}
          toolMetrics={
            result
              ? {
                type: "compression",
                data: {
                  originalSize: result.originalSize,
                  resultSize: result.resultSize,
                  reduction: (result.reduction / result.originalSize) * 100,
                }
              }
              : undefined
          }
        />
      )}
    </>
  );
}
