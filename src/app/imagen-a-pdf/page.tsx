"use client";

import { useState, useCallback, useMemo, useRef } from "react";
import { toast } from "sonner";
import {
  Maximize,
  RectangleHorizontal,
  RectangleVertical,
  Square,
  Info,
  CheckCircle2,
  Circle,
  Server,
  Monitor,
  AlertCircle,
  Image
} from "lucide-react";
import { nanoid } from "nanoid";

// Components
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
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
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { cn } from "@/lib/utils";

// Hooks
import {
  useImageToPdf,
  shouldUseServer,
  type PageSize,
  type PageOrientation,
  type MarginPreset,
  type ImageQuality
} from "@/hooks/useImageToPdf";
import { useMultiSelect } from "@/hooks/useMultiSelect";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { Separator } from "@/components/ui/separator";

// Tipos
interface ImageItem {
  id: string;
  file: File;
  rotation: number;
  preview: string;
}

// Configuración
const PAGE_SIZES: { id: PageSize; label: string; icon: any }[] = [
  { id: "a4", label: "A4", icon: RectangleVertical },
  { id: "letter", label: "Carta", icon: RectangleVertical },
  { id: "legal", label: "Legal", icon: RectangleVertical },
  { id: "fit", label: "Ajustar", icon: Maximize },
];

const ORIENTATIONS: { id: PageOrientation; label: string; icon: any }[] = [
  { id: "auto", label: "Auto", icon: Square },
  { id: "portrait", label: "Vertical", icon: RectangleVertical },
  { id: "landscape", label: "Horizontal", icon: RectangleHorizontal },
];

const MARGINS: { id: MarginPreset; label: string }[] = [
  { id: "none", label: "Sin margen" },
  { id: "small", label: "Pequeño" },
  { id: "normal", label: "Normal" },
];

const QUALITIES: { id: ImageQuality; label: string; description: string }[] = [
  { id: "original", label: "Original", description: "Sin compresión" },
  { id: "compressed", label: "Comprimida", description: "Menor tamaño" },
];

const ACCEPTED_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif", "image/bmp"];
const MAX_IMAGES = 200;

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pageSize, setPageSize] = useState<PageSize>("a4");
  const [orientation, setOrientation] = useState<PageOrientation>("auto");
  const [margin, setMargin] = useState<MarginPreset>("small");
  const [quality, setQuality] = useState<ImageQuality>("original");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  // Multi-selection hook
  const {
    selectedIds,
    toggle: toggleSelection,
    selectAll,
    deselectAll,
    invertSelection
  } = useMultiSelect(images, (img) => img.id);

  const { isProcessing, progress, processingMode, convertAndDownload, CLIENT_LIMIT } = useImageToPdf();

  // Info del servidor
  const serverInfo = useMemo(() => shouldUseServer(images.length), [images.length]);

  // Manejar archivos seleccionados
  const handleFilesSelected = useCallback((files: File[]) => {
    const validFiles = files.filter(f => ACCEPTED_TYPES.includes(f.type));

    if (validFiles.length !== files.length) {
      toast.warning("Algunos archivos no son imágenes válidas");
    }

    if (images.length + validFiles.length > MAX_IMAGES) {
      toast.error(`Máximo ${MAX_IMAGES} imágenes`);
      return;
    }

    const newImages: ImageItem[] = validFiles.map(file => ({
      id: nanoid(),
      file,
      rotation: 0,
      preview: URL.createObjectURL(file), // Usamos URL locales para preview rápido
    }));

    setImages(prev => [...newImages, ...prev]);
  }, [images.length]);

  // Rotar imagen
  const handleRotate = useCallback((id: string) => {
    setImages(prev => prev.map(img =>
      img.id === id
        ? { ...img, rotation: (img.rotation + 90) % 360 }
        : img
    ));
  }, []);

  // Eliminar imagen
  const handleRemove = useCallback((id: string) => {
    setImages(prev => {
      const img = prev.find(i => i.id === id);
      if (img?.preview) URL.revokeObjectURL(img.preview);
      return prev.filter(i => i.id !== id);
    });
  }, []);

  // Eliminar seleccionados
  const handleDeleteSelected = useCallback(() => {
    if (selectedIds.length === 0) return;
    setImages(prev => {
      prev.filter(img => selectedIds.includes(img.id)).forEach(img => {
        if (img.preview) URL.revokeObjectURL(img.preview);
      });
      return prev.filter(img => !selectedIds.includes(img.id));
    });
    deselectAll();
    toast.success(`${selectedIds.length} imágenes eliminadas`);
  }, [selectedIds, deselectAll]);

  // Reordenar (DnD)
  const handleReorder = useCallback((newItems: any[]) => {
    // Reconstruimos el array basado en los IDs devueltos por PdfGrid
    setImages(prev => {
      const newOrder: ImageItem[] = [];
      newItems.forEach(item => {
        const found = prev.find(img => img.id === item.id);
        if (found) newOrder.push(found);
      });
      return newOrder;
    });
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    images.forEach(img => {
      if (img.preview) URL.revokeObjectURL(img.preview);
    });
    setImages([]);
    setPageSize("a4");
    setOrientation("auto");
    setMargin("small");
    setQuality("original");
    setIsDialogOpen(false);
    setIsSuccessDialogOpen(false);
    deselectAll();
  }, [images, deselectAll]);

  // Pre-submit
  const handlePreSubmit = useCallback(() => {
    if (images.length === 0) {
      toast.error("Agrega al menos una imagen");
      return;
    }
    setIsDialogOpen(true);
  }, [images.length]);

  // Submit
  const handleSubmit = useCallback(async (fileName: string) => {
    await convertAndDownload(images, fileName, {
      pageSize,
      orientation,
      margin,
      quality,
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      },
      onError: (error) => console.error(error),
    });
  }, [images, pageSize, orientation, margin, quality, convertAndDownload]);

  return (
    <PdfToolLayout
      toolId="images-to-pdf"
      title="Convertir imagen a PDF"
      description="Convierte tus imágenes en un documento PDF."
      hasFiles={images.length > 0}
      onFilesSelected={handleFilesSelected}
      onReset={handleReset}
      onAdd={() => fileInputRef.current?.click()}
      acceptedFileTypes=".jpg,.jpeg,.png,.webp,.gif,.bmp"
      dropzoneMultiple={true}
      features={{
        selection: true,
        bulkActions: true,
      }}
      actions={{
        onSelectAll: selectAll,
        onDeselectAll: deselectAll,
        onInvertSelection: invertSelection,
        onDeleteSelected: handleDeleteSelected,
      }}
      state={{
        hasSelection: selectedIds.length > 0,
        isAllSelected: selectedIds.length === images.length && images.length > 0,
      }}
      summaryItems={[
        { label: "Imágenes", value: images.length },
        { label: "Procesamiento", value: serverInfo.useServer ? "Servidor" : "Local" },
      ]}
      downloadButtonText="Crear PDF"
      isDownloadDisabled={isProcessing || images.length === 0}
      onDownload={handlePreSubmit}
      sidebarCustomControls={
        <>
          <div className="space-y-4">
            {/* Tamaño de página */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium">Tamaño de página</Label>
              <div className="grid gap-1.5">
                <Select value={pageSize}>
                  <SelectTrigger className="w-full shadow-none">
                    <SelectValue placeholder="Selecciona un tamaño" />
                  </SelectTrigger>
                  <SelectContent>
                    {PAGE_SIZES.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Orientación */}
            {pageSize !== "fit" && (
              <div className="space-y-2">
                <Label className="block text-sm font-medium">Orientación</Label>
                <div className="grid gap-1.5">

                  <Select value={orientation}>
                    <SelectTrigger className="w-full shadow-none">
                      <SelectValue placeholder="Selecciona una orientación" />
                    </SelectTrigger>
                    <SelectContent>
                      {ORIENTATIONS.map((ori) => (
                        <SelectItem key={ori.id} value={ori.id}>
                          {ori.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                </div>
              </div>
            )}

            {/* Márgenes */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium">Márgenes</Label>
              <div className="grid gap-1.5">
                <Select value={margin}>
                  <SelectTrigger className="w-full shadow-none">
                    <SelectValue placeholder="Selecciona un margen" />
                  </SelectTrigger>
                  <SelectContent>
                    {MARGINS.map((m) => (
                      <SelectItem key={m.id} value={m.id}>
                        {m.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Calidad */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Label className="text-sm font-medium">Calidad</Label>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="w-3.5 h-3.5 text-zinc-400" />
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[200px]">
                      <p className="text-xs">
                        Original mantiene la calidad. Comprimida reduce el tamaño del PDF.
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <div className="grid grid-cols-2 gap-1.5">
                {QUALITIES.map((q) => (
                  <button
                    key={q.id}
                    onClick={() => setQuality(q.id)}
                    className={cn(
                      "flex flex-col justify-between p-2 rounded-lg border text-sm transition-all",
                      quality === q.id
                        ? "border-primary bg-primary/5"
                        : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300"
                    )}
                  >
                    <div className="flex gap-2">
                      {quality === q.id ? (
                        <CheckCircle2 className="w-4 h-4 text-primary" />
                      ) : (
                        <Circle className="w-4 h-4 text-zinc-300" />
                      )}
                      <span className={`text-xs ${quality === q.id ? "font-medium text-primary" : ""}`}>
                        {q.label}
                      </span>
                    </div>
                    <span className="block pl-1 text-[10px] text-zinc-500">{q.description}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Indicador de procesamiento */}

            {serverInfo.useServer && (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Server className="w-3.5 h-3.5 text-blue-500" />
                  <span className="text-zinc-600 dark:text-zinc-400">
                    Procesamiento en servidor
                  </span>
                </div>
              </div>
            )}

            {/* Advertencia si cerca del límite */}
            {images.length >= CLIENT_LIMIT * 0.8 && images.length < CLIENT_LIMIT && (
              <div className="flex items-start gap-2 p-2 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-700 dark:text-amber-400">
                  Con {CLIENT_LIMIT}+ imágenes se procesará en servidor
                </p>
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
                    <p className="text-sm font-medium">Creando PDF...</p>
                  </div>
                  <Progress
                    value={(progress.current / progress.total) * 100}
                    className="h-2"
                  />
                  <p className="text-xs text-zinc-500 text-center font-mono">
                    {progress.current} de {progress.total} imágenes
                  </p>
                </Card>
              </div>
            )}
          </div>
          <Separator className="my-4" />
        </>
      }
      saveDialogProps={{
        isOpen: isDialogOpen,
        onOpenChange: setIsDialogOpen,
        defaultName: images.length === 1
          ? images[0].file.name.replace(/\.[^/.]+$/, "")
          : "imagenes",
        onSave: handleSubmit,
        isProcessing,
        title: "Guardar PDF",
        description: `Se creará un PDF con ${images.length} imagen${images.length > 1 ? 'es' : ''}.`,
        extension: "pdf",
      }}
      successDialogProps={{
        isOpen: isSuccessDialogOpen,
        onOpenChange: setIsSuccessDialogOpen,
        onContinue: () => setIsSuccessDialogOpen(false),
      }}
    >
      <PdfGrid
        items={images}
        config={PDF_CARD_PRESETS.imageToPdf}
        selectedIds={selectedIds as string[]}
        onToggle={toggleSelection}
        onReorder={handleReorder}
        onRotate={handleRotate}
        onRemove={handleRemove}
        extractCardData={(img) => ({
          id: img.id,
          file: img.file,
          previewUrl: img.preview,
          rotation: img.rotation,
          name: img.file.name, // Asegurar que pasamos el nombre
          size: img.file.size
        })}
      />

      {/* Input oculto para añadir más imágenes */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFilesSelected(Array.from(e.target.files));
            e.target.value = ""; // Reset for same file selection
          }
        }}
      />
    </PdfToolLayout>
  );
}