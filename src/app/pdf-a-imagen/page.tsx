"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Camera, Image as ImageIcon, Globe, CheckCircle2, Circle } from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";

// Hooks
import { usePageSelection } from "@/hooks/usePageSelection";
import { usePdfPages } from "@/hooks/usePdfPages";
import { usePdfToImage } from "@/hooks/usepdftoimage";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type ImageFormat = "jpg" | "png" | "webp";

const FORMATS: { id: ImageFormat; label: string; icon: any; badge?: string }[] = [
  { id: "jpg", label: "JPG", icon: Camera, badge: "Recomendado" },
  { id: "png", label: "PNG", icon: ImageIcon },
  { id: "webp", label: "WebP", icon: Globe }
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

  const { isProcessing, progress, convertAndDownload } = usePdfToImage();

  useEffect(() => {
    return () => {
      if (isProcessing) toast.info("Conversión cancelada");
    };
  }, [isProcessing]);

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
      scale: 2.0,
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      },
      onError: (error) => console.error(error)
    });
  };

  const showQualityControl = ["jpg", "webp"].includes(format);

  return (
    <PdfToolLayout
      title="Convertir PDF a Imagen"
      description="Convierte páginas de tu PDF a imágenes de alta calidad (JPG, PNG, WebP)."
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
        { label: "Total páginas", value: pages.length },
        { label: "Seleccionadas", value: selectedPages.length },
        { label: "Formato", value: format.toUpperCase() },
        { label: "Descarga", value: selectedPages.length > 1 ? "Archivo ZIP" : "Imagen única" }
      ]}
      downloadButtonText={selectedPages.length > 1 ? "Descargar ZIP" : "Descargar Imagen"}
      isDownloadDisabled={isProcessing || selectedPages.length === 0}
      onDownload={handlePreSubmit}
      isGridLoading={file !== null && pages.length === 0}
      sidebarCustomControls={
        <div className="space-y-6">
          <div className="space-y-2">
            <Label className="block text-sm font-medium">Formato de salida</Label>
            <div className="flex flex-col gap-2">
              {FORMATS.map((fmt) => (
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
                      "p-2 rounded-md transition-colors",
                      format === fmt.id ? "bg-primary/10 text-primary" : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300"
                    )}>
                      <fmt.icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{fmt.label}</span>
                        {fmt.badge && (
                          <Badge className="text-[10px] px-1.5 h-4 font-normal bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-0">
                            {fmt.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    {format === fmt.id ? <CheckCircle2 className="w-4 h-4 text-primary" /> : <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-700" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {showQualityControl && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Calidad</Label>
                <span className="text-xs font-medium text-zinc-500">{quality}%</span>
              </div>
              <Slider
                value={[quality]}
                min={50}
                max={100}
                step={5}
                onValueChange={(val) => setQuality(val[0])}
              />
              <div className="flex justify-between text-[10px] text-zinc-400 px-1">
                <span>Menor archivo</span>
                <span>Mejor calidad</span>
              </div>
            </div>
          )}

          {isProcessing && progress.total > 0 && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-100">
              <Card className="p-6 space-y-4 w-80">
                <p className="text-sm font-medium text-center">Convirtiendo páginas...</p>
                <Progress value={progress.total > 0 ? (progress.current / progress.total) * 100 : 0} className="h-2" />
                <p className="text-xs text-zinc-500 text-center font-mono">
                  {progress.current} de {progress.total}
                </p>
              </Card>
            </div>
          )}
        </div>
      }
      saveDialogProps={{
        isOpen: isDialogOpen,
        onOpenChange: setIsDialogOpen,
        defaultName: file ? file.name.replace(".pdf", "") + "-images" : "pdf-to-images",
        onSave: handleSubmit,
        isProcessing,
        title: "Guardar imágenes",
        description: `Se guardarán ${selectedPages.length} imágenes en formato ${format.toUpperCase()}.`,
        extension: selectedPages.length > 1 ? "zip" : format,
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
