"use client";

import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import {
  Info,
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
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import {
  useGrayscalePdf,
  type GrayscaleContrast,
} from "@/hooks/useGrayscalePdf";

// Información de los niveles de contraste
const CONTRAST_INFO = {
  light: {
    title: "Claro",
    description: "Documentos con fondos oscuros, los aclara",
    badge: null,
    explanation: "Ideal para documentos con fondos oscuros que dificultan la lectura. Aclara el documento manteniendo la legibilidad.",
  },
  normal: {
    title: "Normal",
    description: "Conversión estándar (por defecto)",
    badge: "RECOMENDADO",
    explanation: "Conversión estándar a escala de grises. Balance perfecto entre calidad y tamaño. Opción más utilizada.",
  },
  high: {
    title: "Alto contraste",
    description: "Textos más nítidos, negros más intensos",
    badge: null,
    explanation: "Aumenta el contraste para textos más nítidos. Los negros son más intensos y los blancos más puros. Perfecto para lectura.",
  },
  extreme: {
    title: "Máximo",
    description: "Casi blanco/negro puro, ideal para escaneos sucios",
    badge: null,
    explanation: "Conversión casi a blanco/negro puro. Ideal para limpiar escaneos sucios o documentos con colores no deseados.",
  },
};

export default function GrayscalePdfClient() {
  const [contrast, setContrast] = useState<GrayscaleContrast>("normal");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    reset: resetFiles,
    isLoading: isFilesLoading,
  } = usePdfFiles();

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
  } = useGrayscalePdf();

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
    setContrast("normal");
    setIsDialogOpen(false);
    handleStartNew();
  };

  const handlePreSubmit = () => {
    if (!file) return;
    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;
    setIsDialogOpen(false);

    await convert(file, {
      contrast,
      fileName,
    });
  };

  const contrastInfo = CONTRAST_INFO[contrast];

  return (
    <>
      <PdfToolLayout
        toolId="grayscale-pdf"
        title="PDF a Escala de Grises: Blanco y Negro"
        description="Elimina el color de tus documentos PDF para ahorrar tinta y reducir el tamaño. Ajusta el contraste para mejorar la legibilidad de textos escaneados."
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[]}
        downloadButtonText="Convertir a escala de grises"
        isDownloadDisabled={isProcessing || files.length === 0}
        onDownload={handlePreSubmit}
        isGridLoading={isFilesLoading && files.length === 0}
        sidebarCustomControls={
          <div className="space-y-2">
            <div className="space-y-3 mb-4">
              <Label className="block text-sm font-semibold">
                Nivel de Contraste
              </Label>

              <Select value={contrast} onValueChange={(value) => setContrast(value as GrayscaleContrast)}>
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue placeholder="Selecciona un nivel de contraste" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(CONTRAST_INFO) as GrayscaleContrast[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="font-medium">{CONTRAST_INFO[key].title}</span>
                          {CONTRAST_INFO[key].badge && (
                            <span className="ml-2 text-[10px] bg-green-500 text-white px-1.5 py-0.5 rounded-full">
                              {CONTRAST_INFO[key].badge}
                            </span>
                          )}
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
                    {contrastInfo.explanation}
                  </p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />
          </div>
        }
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file ? file.name.replace(".pdf", "") : "grayscale",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar PDF en escala de grises",
          description: `Se aplicará contraste ${contrastInfo.title.toLowerCase()}. ${CONTRAST_INFO[contrast].explanation}`,
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
        layout="list"
      >
        <PdfGrid
          items={files}
          config={PDF_CARD_PRESETS.compress}
          layout="list"
          extractCardData={extractCardData}
          onRemove={removeFile}
        />
      </PdfToolLayout>

      {(isProcessing || isComplete) && (
        <ProcessingScreen
          progress={progress}
          isComplete={isComplete}
          phase={phase}
          uploadStats={uploadStats}
          fileName={file?.name || "documento.pdf"}
          operation={operation}
          onDownload={handleDownloadAgain}
          onEditAgain={handleStartNew}
          onStartNew={handleReset}
          onCancel={phase === "uploading" || phase === "processing" ? cancelOperation : undefined}
          successDetails={
            result
              ? {
                originalSize: result.originalSize,
                compressedSize: result.resultSize,
                reductionPercentage: (result.savings / result.originalSize) * 100,
                savedBytes: result.savings,
              }
              : undefined
          }
        />
      )}
    </>
  );
}

