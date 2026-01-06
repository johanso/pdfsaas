"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import {
  Camera,
  Image as ImageIcon,
  Globe,
  Server,
  FileImage,
  Printer,
  Info
} from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
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
} from "@/components/ui/select"

// Hooks
import { usePageSelection } from "@/hooks/usePageSelection";
import { usePdfPages } from "@/hooks/usePdfPages";
import {
  usePdfToImage,
  shouldUseServer,
  getFormatInfo
} from "@/hooks/usePdfToImage";
import { ImageFormat, DpiOption } from "@/types";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";

// Configuración de formatos
const FORMATS: {
  id: ImageFormat;
  label: string;
  icon: any;
  badge?: string;
  badgeColor?: string;
}[] = [
    { id: "jpg", label: "JPG", icon: Camera, badgeColor: "green" },
    { id: "png", label: "PNG", icon: ImageIcon },
    { id: "webp", label: "WebP", icon: Globe },
    { id: "tiff", label: "TIFF", icon: Printer, badgeColor: "blue" },
    { id: "bmp", label: "BMP", icon: FileImage, badgeColor: "blue" },
  ];

// Opciones de DPI
const DPI_OPTIONS: { value: DpiOption; label: string; description: string }[] = [
  { value: 72, label: "72 DPI", description: "Web / Pantalla" },
  { value: 150, label: "150 DPI", description: "Calidad media" },
  { value: 300, label: "300 DPI", description: "Impresión estándar" },
  { value: 600, label: "600 DPI", description: "Alta calidad" },
];


export default function PdfToImageClient() {
  const [file, setFile] = useState<File | null>(null);
  const [format, setFormat] = useState<ImageFormat>("jpg");
  const [quality, setQuality] = useState(85);
  const [dpi, setDpi] = useState<DpiOption>(150);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { pages, reorderPages } = usePdfPages(file);
  const {
    selectedPages,
    setSelectedPages,
    togglePage,
    deselectAll,
    reset: resetSelection
  } = usePageSelection(pages.length);

  const {
    isProcessing,
    isComplete,
    progress,
    processingMode,
    convertAndDownload,
    handleDownloadAgain,
    handleStartNew
  } = usePdfToImage();

  const selectedIds = useMemo(() => pages
    .filter(p => selectedPages.includes(p.originalIndex))
    .map(p => p.id),
    [pages, selectedPages]
  );

  const handleToggle = useCallback((id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) togglePage(page.originalIndex);
  }, [pages, togglePage]);

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      if (f.type !== "application/pdf") {
        notify.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      setIsInitialLoading(true);
      setFile(f);
      resetSelection();
    }
  }, [resetSelection]);

  const extractCardData = useCallback((p: any) => ({
    id: p.id,
    file: p.file,
    pageNumber: p.originalIndex,
    rotation: p.rotation,
    isBlank: p.isBlank
  }), []);

  // Información del formato actual
  const currentFormatInfo = useMemo(() => getFormatInfo(format), [format]);

  // Determinar si se usará el servidor
  const serverInfo = useMemo(() => {
    return shouldUseServer(file, pages.length, selectedPages.length, format, dpi);
  }, [file, pages.length, selectedPages.length, format, dpi]);

  // Cuando cambia el formato, ajustar DPI si es necesario
  useEffect(() => {
    if (currentFormatInfo.requiresServer && dpi < 150) {
      setDpi(150);
    }
  }, [format, currentFormatInfo.requiresServer, dpi]);

  const [isInitialLoading, setIsInitialLoading] = useState(false);

  // Mark loading as finished when pages arrive
  useEffect(() => {
    if (pages.length > 0) {
      setIsInitialLoading(false);
    }
  }, [pages.length]);

  // handleFilesSelected is now a useCallback defined above

  const handleReset = () => {
    setFile(null);
    resetSelection();
    setFormat("jpg");
    setQuality(85);
    setDpi(150);
    setIsDialogOpen(false);
    setIsInitialLoading(false);
    handleStartNew();
  };

  const handleDeleteSelected = () => {
    if (selectedPages.length === 0) return;

    // Obtener los IDs de las páginas seleccionadas
    const idsToRemove = pages
      .filter(p => selectedPages.includes(p.originalIndex))
      .map(p => p.id);

    // Eliminar las páginas
    const newPages = pages.filter(p => !idsToRemove.includes(p.id));

    if (newPages.length === 0) {
      handleReset();
      notify.success("Todas las páginas eliminadas, puedes subir un nuevo archivo");
      return;
    }

    reorderPages(newPages);

    // Limpiar selección
    deselectAll();
    notify.success(`${idsToRemove.length} páginas eliminadas de la selección`);
  };

  const handlePreSubmit = () => {
    if (!file) return;
    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;
    setIsDialogOpen(false);

    // Si no hay selección, convertir todas las páginas actuales
    const pagesToConvert = selectedPages.length > 0
      ? pages.filter(p => selectedPages.includes(p.originalIndex))
      : pages;

    const orderedSelectedPages = pagesToConvert.map(p => p.originalIndex - 1);

    await convertAndDownload(file, orderedSelectedPages, fileName, {
      format,
      quality,
      dpi,
      scale: dpi >= 300 ? 3.0 : 2.0, // Mayor escala para DPI alto
      mode: "auto",
      onSuccess: () => {
        setIsDialogOpen(false);
      },
      onError: (error) => console.error(error)
    });
  };

  const showQualityControl = currentFormatInfo.supportsQuality;

  return (
    <>
      <PdfToolLayout
        toolId="pdf-to-image"
        title="Convertir PDF a Imagenes de Alta Calidad"
        description="Transforma páginas de PDF en archivos de imagen nítidos. Elige resolución de hasta 600 DPI para impresión o formatos ligeros para web."
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        features={{
          selection: true,
          bulkActions: true,
        }}
        actions={{
          onSelectAll: () => setSelectedPages(pages.map(p => p.originalIndex)),
          onDeselectAll: deselectAll,
          onInvertSelection: () => {
            const currentIndices = pages.map(p => p.originalIndex);
            setSelectedPages(prev => currentIndices.filter(idx => !prev.includes(idx)));
          },
          onDeleteSelected: handleDeleteSelected,
        }}
        state={{
          hasSelection: selectedPages.length > 0,
          isAllSelected: selectedPages.length === pages.length && pages.length > 0,
        }}
        summaryItems={[
          { label: "Páginas", value: selectedPages.length > 0 ? `${selectedPages.length} de ${pages.length}` : `Todas (${pages.length})` },
          { label: "Descarga", value: (selectedPages.length > 1 || (selectedPages.length === 0 && pages.length > 1)) ? "Archivo .ZIP" : `Imagen .${format}` }
        ]}
        downloadButtonText={(selectedPages.length > 1 || (selectedPages.length === 0 && pages.length > 1)) ? "Descargar imágenes en .ZIP" : "Descargar Imagen"}
        isDownloadDisabled={isProcessing || (file !== null && pages.length === 0)}
        onDownload={handlePreSubmit}
        isGridLoading={isInitialLoading && pages.length === 0}
        sidebarCustomControls={
          <div className="space-y-5">
            {/* Formato de salida */}
            <div className="space-y-2">
              <Label className="text-sm font-medium mb-2 block">Formato de salida</Label>
              <div className="grid gap-1.5">
                <Select value={format} onValueChange={(v) => setFormat(v as ImageFormat)}>
                  <SelectTrigger className="w-full shadow-none">
                    <SelectValue placeholder="Selecciona un formato" />
                  </SelectTrigger>
                  <SelectContent>
                    {FORMATS.map((fmt) => (
                      <SelectItem key={fmt.id} value={fmt.id}>
                        {fmt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {
                  FORMATS.map((fmt) => {
                    const info = getFormatInfo(fmt.id);
                    return fmt.id === format && (
                      <div key={fmt.id} className="relative py-1 rounded-lg text-left">
                        <div className="flex items-center gap-2">
                          <div className="p-1 rounded-md transition-colors bg-primary/10 text-primary">
                            <fmt.icon className="w-3 h-3 xl:w-4 lg:h-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="xl:block text-xs text-zinc-500 dark:text-zinc-400">
                              {info.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })
                }
              </div>
            </div>


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
                <p className="text-xs text-zinc-500 text-left">
                  {DPI_OPTIONS.find(o => o.value === dpi)?.description}
                </p>
              </div>

              <Select value={dpi.toString()} onValueChange={(v) => setDpi(Number(v) as DpiOption)}>
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue placeholder="Selecciona un DPI" />
                </SelectTrigger>
                <SelectContent>
                  {DPI_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value.toString()}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Indicador de procesamiento */}
            {serverInfo.useServer && serverInfo.reason && (
              <div className="hidden lg:block">
                <div className="flex items-center gap-2 text-xs">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  <p className="text-zinc-600 dark:text-zinc-400">
                    Procesamiento en servidor
                    <span className="text-[10px] block text-zinc-400">
                      {serverInfo.reason}
                    </span>
                  </p>
                </div>
              </div>
            )}

            <Separator />

          </div>
        }
        saveDialogProps={{
          isOpen: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file ? file.name.replace(".pdf", "") : "pdf-images",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar imágenes",
          description: selectedPages.length > 0
            ? `Se convertirán ${selectedPages.length} página${selectedPages.length > 1 ? 'es' : ''} a ${format.toUpperCase()} (${dpi} DPI).`
            : `Se convertirán las ${pages.length} páginas a ${format.toUpperCase()} (${dpi} DPI).`,
          extension: (selectedPages.length > 1 || (selectedPages.length === 0 && pages.length > 1)) ? "zip" : format === "jpg" ? "jpg" : format,
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <PdfGrid
          items={pages}
          config={PDF_CARD_PRESETS.pdftoImg}
          extractCardData={extractCardData}
          selectedIds={selectedIds}
          onToggle={handleToggle}
          onReorder={reorderPages}
        />
      </PdfToolLayout>

      {(isProcessing || isComplete) && (
        <ProcessingScreen
          progress={progress.total > 0 ? (progress.current / progress.total) * 100 : 0}
          isComplete={isComplete}
          fileName={file?.name || "documento.pdf"}
          operation={processingMode === "server" ? "Procesando en servidor..." : "Convirtiendo páginas..."}
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
