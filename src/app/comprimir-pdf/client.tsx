"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Zap,
  CheckCircle2,
  Settings2,
  Info,
  Activity,
} from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import {
  useCompressPdf,
  formatBytes,
  type CompressionPreset,
  type CompressionMode,
} from "@/hooks/useCompressPdf";

// Presets info (sin estimaciones de tamaño)
const PRESETS_INFO = {
  extreme: {
    title: "Extrema",
    description: "Menor tamaño, menos calidad",
    icon: <Zap className="w-4 h-4 text-orange-500" />,
    badge: null,
  },
  recommended: {
    title: "Recomendada",
    description: "Buen balance calidad/tamaño",
    icon: <CheckCircle2 className="w-4 h-4 text-green-500" />,
    badge: "RECOMENDADO",
  },
  low: {
    title: "Baja Compresión",
    description: "Alta calidad, archivo más grande",
    icon: <Activity className="w-4 h-4 text-blue-500" />,
    badge: null,
  },
};

export default function CompressPdfClient() {
  const [mode, setMode] = useState<CompressionMode>("simple");
  const [preset, setPreset] = useState<CompressionPreset>("recommended");
  const [dpi, setDpi] = useState(120);
  const [imageQuality, setImageQuality] = useState(60);
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
    compress,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useCompressPdf();

  const file = files[0]?.file || null;

  const handleFilesSelected = (newFiles: File[]) => {
    if (newFiles.length > 0) {
      const f = newFiles[0];
      if (f.type !== "application/pdf") {
        toast.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      addFiles([f]);
    }
  };

  const handleReset = () => {
    resetFiles();
    setMode("simple");
    setPreset("recommended");
    setDpi(120);
    setImageQuality(60);
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

    await compress(file, {
      mode,
      preset,
      dpi,
      imageQuality,
      fileName,
    });
  };

  const presetInfo = PRESETS_INFO[preset];

  return (
    <>
      <PdfToolLayout
        toolId="compress-pdf"
        title="Comprimir, Reducir Tamaño y Peso de Archivos PDF"
        description="Optimiza tus documentos para web o correo electrónico. Elige entre máxima compresión o mantener la mejor calidad con nuestros ajustes inteligentes."
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[
          {
            label: "Modo",
            value: mode === "simple" ? "Preset" : "Personalizado",
          },
          {
            label: "Nivel",
            value: mode === "simple"
              ? presetInfo.title
              : `${dpi} DPI / ${imageQuality}%`,
          },
        ]}
        downloadButtonText="Comprimir PDF"
        isDownloadDisabled={isProcessing || files.length === 0}
        onDownload={handlePreSubmit}
        isGridLoading={isFilesLoading && files.length === 0}
        sidebarCustomControls={
          <div className="space-y-2">
            <div className="space-y-3 mb-4">
              <Label className="block text-sm font-semibold">
                Nivel de Compresión
              </Label>

              <div className="grid gap-2">
                {(Object.keys(PRESETS_INFO) as CompressionPreset[]).map((key) => (
                  <PresetCard
                    key={key}
                    selected={mode === "simple" && preset === key}
                    onClick={() => {
                      setMode("simple");
                      setPreset(key);
                    }}
                    icon={PRESETS_INFO[key].icon}
                    title={PRESETS_INFO[key].title}
                    description={PRESETS_INFO[key].description}
                    badge={PRESETS_INFO[key].badge}
                  />
                ))}
              </div>
            </div>

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="advanced" className="border-none">
                <AccordionTrigger className="py-2 px-4 hover:no-underline bg-zinc-100 dark:bg-zinc-800 rounded-lg text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <Settings2 className="w-4 h-4" />
                    <span>Opciones avanzadas</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="pt-4 px-1 space-y-6">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Resolución (DPI)</Label>
                      <span className="text-xs font-bold text-primary">{dpi} DPI</span>
                    </div>
                    <Slider
                      value={[dpi]}
                      min={36}
                      max={300}
                      step={1}
                      onValueChange={(val) => {
                        setDpi(val[0]);
                        setMode("advanced");
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>36</span>
                      <span>120</span>
                      <span>200</span>
                      <span>300</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm font-medium">Calidad de imagen</Label>
                      <span className="text-xs font-bold text-primary">{imageQuality}%</span>
                    </div>
                    <Slider
                      value={[imageQuality]}
                      min={10}
                      max={100}
                      step={5}
                      onValueChange={(val) => {
                        setImageQuality(val[0]);
                        setMode("advanced");
                      }}
                    />
                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>10%</span>
                      <span>50%</span>
                      <span>75%</span>
                      <span>100%</span>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {mode === "advanced" && (
              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-blue-700 dark:text-blue-300">
                    Ajustes personalizados. Menor DPI y calidad = archivo más pequeño pero menos nítido.
                  </p>
                </div>
              </div>
            )}

            <Separator className="my-4" />
          </div>
        }
        saveDialogProps={{
          isOpen: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file ? file.name.replace(".pdf", "") : "comprimido",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar PDF comprimido",
          description: mode === "simple"
            ? `Se aplicará compresión ${presetInfo.title.toLowerCase()}.`
            : `Ajustes: ${dpi} DPI y ${imageQuality}% calidad.`,
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <PdfGrid
          items={files}
          config={PDF_CARD_PRESETS.compress}
          extractCardData={(f) => ({
            id: f.id,
            file: f.file,
            name: f.name,
            size: f.file.size,
            pageCount: f.pageCount,
            rotation: f.rotation,
          })}
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
          onCancel={phase === "uploading" || phase === "compressing" ? cancelOperation : undefined}
          successDetails={
            result
              ? {
                originalSize: result.originalSize,
                compressedSize: result.compressedSize,
                reductionPercentage: result.reduction,
                savedBytes: result.saved,
              }
              : undefined
          }
        />
      )}
    </>
  );
}

// ============================================================================
// PresetCard Component (simplificado, sin estimaciones)
// ============================================================================

function PresetCard({
  selected,
  onClick,
  icon,
  title,
  description,
  badge,
}: {
  selected: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  title: string;
  description: string;
  badge?: string | null;
}) {
  return (
    <Card
      className={`relative cursor-pointer transition-all ${selected
          ? "border-primary bg-primary/5 ring-1 ring-primary/20"
          : "hover:border-zinc-300 dark:hover:border-zinc-700 bg-transparent"
        }`}
      onClick={onClick}
    >
      <CardContent className="py-3 px-3">
        <div className="flex items-center gap-3">
          <div className="shrink-0">{icon}</div>
          <div className="flex-1 min-w-0">
            <h4 className="text-sm font-bold truncate">{title}</h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              {description}
            </p>
          </div>
          {selected && (
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
          )}
        </div>
        {badge && !selected && (
          <div className="absolute top-1 right-1 bg-green-500 text-white text-[9px] font-medium px-1.5 py-0.5 rounded-xl">
            {badge}
          </div>
        )}
      </CardContent>
    </Card>
  );
}