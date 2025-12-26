"use client";

import { useEffect, useState, useMemo } from "react";
import { toast } from "sonner";
import {
  Camera,
  Image as ImageIcon,
  Globe,
  CheckCircle2,
  Circle,
  Server,
  Monitor,
  FileImage,
  Printer,
  Info
} from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

// Hooks
import { usePageSelection } from "@/hooks/usePageSelection";
import { usePdfPages } from "@/hooks/usePdfPages";
import {
  usePdfToImage,
  shouldUseServer,
  getFormatInfo,
  type ImageFormat,
  type DpiOption
} from "@/hooks/usepdftoimage";
import { cn } from "@/lib/utils";

// Configuración de formatos
const FORMATS: {
  id: ImageFormat;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}[] = [
    { id: "jpg", label: "JPG", icon: Camera, badge: "Recomendado", badgeColor: "green" },
    { id: "png", label: "PNG", icon: ImageIcon },
    { id: "webp", label: "WebP", icon: Globe },
    { id: "tiff", label: "TIFF", icon: Printer, badge: "Servidor", badgeColor: "blue" },
    { id: "bmp", label: "BMP", icon: FileImage, badge: "Servidor", badgeColor: "blue" },
  ];

// Opciones de DPI
const DPI_OPTIONS: { value: DpiOption; label: string; description: string }[] = [
  { value: 72, label: "72 DPI", description: "Web / Pantalla" },
  { value: 150, label: "150 DPI", description: "Calidad media" },
  { value: 300, label: "300 DPI", description: "Impresión estándar" },
  { value: 600, label: "600 DPI", description: "Alta calidad" },
];

const PDF_IMAGE_CONFIG = {
  draggable: true,
  selectable: true,
  rotatable: false,
  removable: false,
  showPageNumber: true,
  selectedColorName: "green" as const,
  iconSelectedName: "check" as const,
};

export default function PdfToImagePage() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [quality, setQuality] = useState(85);
  const [dpi, setDpi] = useState<DpiOption>(150);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const { pages, reorderPages } = usePdfPages(file);
  const {
    selectedPages,
    togglePage,
    selectAll,
    deselectAll,
    invertSelection,
    reset: resetSelection
  } = usePageSelection(pages.length);

  const { isProcessing, progress, processingMode, convertAndDownload } = usePdfToImage();

  // Información del formato actual
  const currentFormatInfo = useMemo(() => getFormatInfo(format), [format]);

  // Determinar si se usará el servidor
  const serverInfo = useMemo(() => {
    return shouldUseServer(file, pages.length, selectedPages.length, format, dpi);
  }, [file, pages.length, selectedPages.length, format, dpi]);

  useEffect(() => {
    return () => {
      if (isProcessing) toast.info("Conversión cancelada");
    };
  }, [isProcessing]);

  // Cuando cambia el formato, ajustar DPI si es necesario
  useEffect(() => {
    if (currentFormatInfo.requiresServer && dpi < 150) {
      setDpi(150);
    }
  }, [format, currentFormatInfo.requiresServer, dpi]);

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      if (f.type !== "application/pdf") {
        toast.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      setFile(f);
      resetSelection();
    }
  };

  const handleReset = () => {
    setFile(null);
    resetSelection();
    setFormat("jpg");
    setQuality(85);
    setDpi(150);
    setIsDialogOpen(false);
    setIsSuccessDialogOpen(false);
  };

  const handlePreSubmit = () => {
    if (!file) return;
    if (selectedPages.length === 0) {
      toast.error("Selecciona al menos una página para convertir");
      return;
    }
    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;

    const orderedSelectedPages = pages
      .filter(p => selectedPages.includes(p.originalIndex))
      .map(p => p.originalIndex - 1);

    await convertAndDownload(file, orderedSelectedPages, fileName, {
      format,
      quality,
      dpi,
      scale: dpi >= 300 ? 3.0 : 2.0, // Mayor escala para DPI alto
      mode: "auto",
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      },
      onError: (error) => console.error(error)
    });
  };

  const showQualityControl = currentFormatInfo.supportsQuality;

  // Calcular tamaño estimado
  const estimatedSize = useMemo(() => {
    if (selectedPages.length === 0) return null;

    // Estimación muy aproximada basada en formato y calidad
    const baseSize = format === "png" ? 2 : format === "tiff" ? 5 : 0.5; // MB por página
    const qualityFactor = quality / 100;
    const dpiFactor = dpi / 150;

    const totalMB = selectedPages.length * baseSize * qualityFactor * dpiFactor;

    if (totalMB < 1) return `~${Math.round(totalMB * 1024)} KB`;
    return `~${totalMB.toFixed(1)} MB`;
  }, [selectedPages.length, format, quality, dpi]);

  return (
    <PdfToolLayout
      toolId="pdf-to-image"
      title="Convertir PDF a Imagen"
      description="Convierte páginas de tu PDF a imágenes de alta calidad."
      hasFiles={!!file}
      onFilesSelected={handleFilesSelected}
      onReset={handleReset}
      features={{ selection: true }}
      actions={{
        onSelectAll: selectAll,
        onDeselectAll: deselectAll,
        onInvertSelection: invertSelection,
      }}
      summaryItems={[
        { label: "Páginas", value: `${selectedPages.length} de ${pages.length}` },
        { label: "Formato", value: format.toUpperCase() },
        { label: "Descarga", value: selectedPages.length > 1 ? "ZIP" : "Imagen" }
      ]}
      downloadButtonText={selectedPages.length > 1 ? "Descargar ZIP" : "Descargar Imagen"}
      isDownloadDisabled={isProcessing || selectedPages.length === 0}
      onDownload={handlePreSubmit}
      isGridLoading={file !== null && pages.length === 0}
      sidebarCustomControls={
        <div className="space-y-5">
          {/* Formato de salida */}
          <div className="space-y-2">
            <Label className="text-sm font-medium mb-2 block">Formato de salida</Label>
            <div className="flex flex-col gap-1.5">
              {FORMATS.map((fmt) => {
                const info = getFormatInfo(fmt.id);
                return (
                  <button
                    key={fmt.id}
                    onClick={() => setFormat(fmt.id)}
                    className={cn(
                      "relative px-3 py-2 rounded-lg border transition-all text-left group hover:shadow-sm",
                      format === fmt.id
                        ? "border-primary bg-primary/5 dark:bg-primary/10 ring-1 ring-primary/20"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-white dark:bg-zinc-900"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        "p-1 rounded-md transition-colors",
                        format === fmt.id
                          ? "bg-primary/10 text-primary"
                          : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                      )}>
                        <fmt.icon className="w-4 h-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{fmt.label}</span>
                          {fmt.badge && (
                            <Badge
                              className={cn(
                                "text-[9px] px-1.5 h-4 font-normal border-0",
                                fmt.badgeColor === "green"
                                  ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                                  : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                              )}
                            >
                              {fmt.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400">
                          {info.description}
                        </p>
                      </div>
                      {format === fmt.id
                        ? <CheckCircle2 className="w-4 h-4 text-primary shrink-0" />
                        : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 shrink-0" />
                      }
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <Separator />

          {/* Control de calidad */}
          {showQualityControl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Calidad</Label>
                <span className="text-xs font-semibold text-primary">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                min={50}
                max={100}
                step={5}
                onValueChange={(val) => setQuality(val[0])}
              />
            </div>
          )}

          {/* Control de DPI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-sm font-medium">Resolución (DPI)</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="mr-auto">
                    <Info className="w-3.5 h-3.5 text-zinc-400" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-[200px]">
                    <p className="text-xs">
                      Mayor DPI = mejor calidad pero archivos más grandes.
                      300 DPI es ideal para impresión.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <p className="text-[10px] text-zinc-500 text-center">
                {DPI_OPTIONS.find(o => o.value === dpi)?.description}
              </p>
            </div>
            <ButtonGroup className="w-full">
              {DPI_OPTIONS.map((option) => (
                <Button
                  key={option.value}
                  variant={dpi === option.value ? "default" : "outline"}
                  size="sm"
                  className="flex-1 h-8 text-xs font-medium px-0"
                  onClick={() => setDpi(option.value)}
                >
                  {option.label}
                </Button>
              ))}
            </ButtonGroup>

          </div>

          <Separator />

          {/* Indicador de procesamiento */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs">
              {serverInfo.useServer ? (
                <>
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Procesamiento en servidor
                  </span>
                </>
              ) : (
                <>
                  <Monitor className="w-3.5 h-3.5 text-green-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Procesamiento local
                  </span>
                </>
              )}
            </div>
            {serverInfo.reason && (
              <p className="text-[10px] text-zinc-400 pl-5">
                {serverInfo.reason}
              </p>
            )}
          </div>

          {/* Tamaño estimado */}
          {estimatedSize && selectedPages.length > 0 && (
            <div className="px-3 py-2 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-500">Tamaño estimado:</span>
                <span className="font-medium">{estimatedSize}</span>
              </div>
            </div>
          )}

          {/* Modal de progreso */}
          {isProcessing && progress.total > 0 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <Card className="p-6 space-y-4 w-80 mx-4">
                <div className="flex items-center justify-center gap-2">
                  {processingMode === "server" ? (
                    <Server className="w-5 h-5 text-blue-500 animate-pulse" />
                  ) : (
                    <Monitor className="w-5 h-5 text-green-500 animate-pulse" />
                  )}
                  <p className="text-sm font-medium">
                    Convirtiendo páginas...
                  </p>
                </div>
                <Progress
                  value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
                  className="h-2"
                />
                <p className="text-xs text-zinc-500 text-center font-mono">
                  {progress.current} de {progress.total}
                </p>
                <p className="text-[10px] text-zinc-400 text-center">
                  {processingMode === "server"
                    ? "Procesando en servidor..."
                    : "Procesando localmente..."}
                </p>
              </Card>
            </div>
          )}
        </div>
      }
      saveDialogProps={{
        isOpen: isDialogOpen,
        onOpenChange: setIsDialogOpen,
        defaultName: file ? file.name.replace(".pdf", "") : "pdf-images",
        onSave: handleSubmit,
        isProcessing,
        title: "Guardar imágenes",
        description: `Se convertirán ${selectedPages.length} página${selectedPages.length > 1 ? 's' : ''} a ${format.toUpperCase()} (${dpi} DPI).`,
        extension: selectedPages.length > 1 ? "zip" : format === "jpg" ? "jpg" : format,
      }}
      successDialogProps={{
        isOpen: isSuccessDialogOpen,
        onOpenChange: setIsSuccessDialogOpen,
        onContinue: () => setIsSuccessDialogOpen(false),
      }}
    >
      <PdfGrid
        items={pages}
        config={PDF_IMAGE_CONFIG}
        extractCardData={(p) => ({
          id: p.id,
          file: p.file,
          pageNumber: p.originalIndex,
          rotation: p.rotation,
          isBlank: p.isBlank
        })}
        selectedIds={pages
          .filter(p => selectedPages.includes(p.originalIndex))
          .map(p => p.id)
        }
        onToggle={(id) => {
          const page = pages.find(p => p.id === id);
          if (page) togglePage(page.originalIndex);
        }}
        onReorder={reorderPages}
      />
    </PdfToolLayout>
  );
}