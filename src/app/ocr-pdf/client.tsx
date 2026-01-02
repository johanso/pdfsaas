"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MultiSelect,
  MultiSelectContent,
  MultiSelectItem,
  MultiSelectTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { usePdfPages } from "@/hooks/usePdfPages";
import { extractPagesToBlob } from "@/lib/pdf-page-utils";
import {
  useOcrPdf,
  DPI_OPTIONS,
  DEFAULT_LANGUAGES,
  type DpiOption,
  type OcrStatus
} from "@/hooks/useOcrPdf";

export default function OcrPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [languages, setLanguages] = useState<string[]>(DEFAULT_LANGUAGES);
  const [dpi, setDpi] = useState<DpiOption>(300);
  const [optimize, setOptimize] = useState(true);
  const [ocrStatus, setOcrStatus] = useState<OcrStatus>("unknown");
  const [isDetecting, setIsDetecting] = useState(false);
  const [originalPageCount, setOriginalPageCount] = useState<number>(0);

  const { pages, removePage, reorderPages, setPages } = usePdfPages(file);

  // Guardar el número de páginas original cuando se cargan las páginas por primera vez
  useEffect(() => {
    if (pages.length > 0 && originalPageCount === 0) {
      setOriginalPageCount(pages.length);
    }
  }, [pages, originalPageCount]);

  const {
    isProcessing,
    isComplete,
    progress,
    availableLanguages,
    detectOcr,
    applyOcr,
    handleDownloadAgain,
    handleStartNew
  } = useOcrPdf();

  // Si se eliminan todas las páginas, volver al dropzone
  useEffect(() => {
    if (file && pages.length === 0 && !isProcessing) {
      setFile(null);
      setOcrStatus("unknown");
    }
  }, [pages.length, file, isProcessing]);

  // Detectar OCR cuando se carga un archivo
  useEffect(() => {
    if (file) {
      detectOcrStatus(file);
    }
  }, [file]);

  const detectOcrStatus = async (file: File) => {
    setIsDetecting(true);
    try {
      const result = await detectOcr(file);
      setOcrStatus(result.status);

      if (result.message) {
        toast.info(result.message);
      }
    } catch (error) {
      console.error("Error detecting OCR status:", error);
      setOcrStatus("unknown");
    } finally {
      setIsDetecting(false);
    }
  };

  const handleFilesSelected = async (newFiles: File[]) => {
    if (newFiles.length === 0) return;

    if (newFiles.length > 1) {
      toast.warning("Solo se procesará el primer archivo", {
        description: "Esta herramienta solo acepta un archivo PDF a la vez",
        duration: 4000
      });
    }

    const f = newFiles[0];
    if (f.type !== "application/pdf") {
      toast.error("Por favor selecciona un archivo PDF válido");
      return;
    }

    setFile(f);
    setOcrStatus("unknown");
  };

  const handleReset = () => {
    setFile(null);
    setLanguages(DEFAULT_LANGUAGES);
    setDpi(300);
    setOptimize(true);
    setOcrStatus("unknown");
    setOriginalPageCount(0);
    setIsDialogOpen(false);
    handleStartNew();
  };

  const toggleLanguage = (langCode: string) => {
    setLanguages(prev => {
      if (prev.includes(langCode)) {
        // No permitir deseleccionar si es el último
        if (prev.length === 1) {
          toast.error("Debes seleccionar al menos un idioma");
          return prev;
        }
        return prev.filter(l => l !== langCode);
      } else {
        return [...prev, langCode];
      }
    });
  };

  const handlePreSubmit = () => {
    if (!file) return;
    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file || pages.length === 0) return;
    setIsDialogOpen(false);

    try {
      let fileToProcess = file;

      // Si el número de páginas actual es menor al original, reconstruimos el PDF.
      if (pages.length < originalPageCount) {
        const pageIndices = pages.map(p => p.originalIndex - 1);
        const extractedBlob = await extractPagesToBlob(file, pageIndices);
        fileToProcess = new File([extractedBlob], file.name, { type: "application/pdf" });
      }

      await applyOcr(fileToProcess, fileName, {
        languages,
        dpi,
        optimize,
        onSuccess: () => {
          setIsDialogOpen(false);
        },
        onError: (error) => console.error(error)
      });
    } catch (error) {
      console.error("Error preparing PDF for OCR:", error);
      toast.error("Error al preparar el PDF");
    }
  };

  // Badge de estado OCR
  const getOcrStatusBadge = () => {
    if (isDetecting) {
      return (
        <Badge variant="outline" className="gap-1.5">
          <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
          Detectando...
        </Badge>
      );
    }

    switch (ocrStatus) {
      case "scanned":
        return (
          <Badge variant="destructive" className="gap-1.5">
            Escaneado
          </Badge>
        );
      case "has-text":
        return (
          <Badge className="gap-1.5 bg-green-500 hover:bg-green-600">
            Ya tiene texto
          </Badge>
        );
      default:
        return null;
    }
  };

  const isDownloadDisabled = isProcessing || !file || pages.length === 0;

  return (
    <>
      <PdfToolLayout
        toolId="ocr-pdf"
        title="Aplicar OCR a PDFs Escaneados"
        description="Convierte tus PDFs escaneados en documentos con texto seleccionable y buscable. Detecta automáticamente si necesita OCR y procesa en múltiples idiomas."
        hasFiles={!!file && pages.length > 0}
        onFilesSelected={handleFilesSelected}
        acceptedFileTypes=".pdf,application/pdf"
        onReset={handleReset}
        summaryItems={[
          {
            label: "Archivo",
            value: file?.name || "-"
          },
          {
            label: "Páginas",
            value: pages.length || "-"
          },
          {
            label: "Peso",
            value: file
              ? `${(file.size / 1024 / 1024).toFixed(2)} MB`
              : "-"
          },
          {
            label: "Idiomas",
            value: `${languages.length} seleccionado${languages.length !== 1 ? 's' : ''}`
          }
        ]}
        downloadButtonText="Aplicar OCR"
        isDownloadDisabled={isDownloadDisabled}
        onDownload={handlePreSubmit}
        isGridLoading={file !== null && pages.length === 0}
        sidebarCustomControls={
          <div className="space-y-5">
            {/* Estado OCR */}
            {file && (
              <div className="flex align-center justify-between">
                <span className="block text-sm font-medium">Estado del documento</span>
                <div className="flex items-center gap-2">
                  {getOcrStatusBadge()}
                  {ocrStatus === "has-text" && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Info className="w-3.5 h-3.5 text-zinc-400" />
                        </TooltipTrigger>
                        <TooltipContent side="top" className="max-w-[200px]">
                          <p className="text-xs">
                            Este PDF ya tiene texto seleccionable. El OCR puede no ser necesario.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              </div>
            )}

            {/* Selección de idiomas */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">Idiomas del documento</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">
                        Selecciona todos los idiomas que contiene el documento para mejor precisión del OCR.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <MultiSelect values={languages} onValuesChange={setLanguages}>
                <MultiSelectTrigger className="w-full">
                  <MultiSelectValue placeholder="Seleccionar idiomas" />
                </MultiSelectTrigger>
                <MultiSelectContent search={{ placeholder: "Buscar idioma..." }}>
                  {availableLanguages.map((lang) => (
                    <MultiSelectItem key={lang.code} value={lang.code}>
                      {lang.name}
                    </MultiSelectItem>
                  ))}
                </MultiSelectContent>
              </MultiSelect>
            </div>

            {/* Control de DPI */}
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <Label className="text-sm font-medium">Calidad de procesamiento</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">
                        Mayor DPI = mejor precisión pero más tiempo de procesamiento.
                        300 DPI es estándar para la mayoría de documentos.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>

              <Select value={dpi.toString()} onValueChange={(v) => setDpi(Number(v) as DpiOption)}>
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue placeholder="Selecciona calidad" />
                </SelectTrigger>
                <SelectContent>
                  {DPI_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label} - {option.description}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Optimizar */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="optimize"
                checked={optimize}
                onCheckedChange={(checked) => setOptimize(checked as boolean)}
              />
              <Label htmlFor="optimize" className="text-sm cursor-pointer">
                Optimizar PDF resultante
              </Label>
            </div>

            <Separator />
          </div>
        }
        saveDialogProps={{
          isOpen: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file?.name.replace(".pdf", "") || "documento",
          onSave: handleSubmit,
          isProcessing,
          title: "Aplicar OCR",
          description: `Se aplicará OCR en ${dpi} DPI con ${languages.length} idioma${languages.length !== 1 ? 's' : ''}.`,
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <PdfGrid
          items={pages}
          config={PDF_CARD_PRESETS.ocr}
          extractCardData={(p) => ({
            id: p.id,
            file: p.file,
            pageNumber: p.originalIndex,
            rotation: p.rotation,
            isBlank: p.isBlank
          })}
          onRemove={removePage}
          onReorder={reorderPages}
        />
      </PdfToolLayout>

      {isProcessing && (
        <ProcessingScreen
          progress={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
          isComplete={isComplete}
          fileName={file?.name || "documento.pdf"}
          operation="Aplicando OCR..."
          onDownload={handleDownloadAgain}
          onEditAgain={() => {
            handleStartNew();
          }}
          onStartNew={handleReset}
        />
      )}
    </>
  );
}
