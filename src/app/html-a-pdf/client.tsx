"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Globe, FileCode, Eye, Smartphone, Tablet, Monitor, Maximize, Layout, Trash2, RefreshCw, Search } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import ProcessingScreen from "@/components/processing-screen";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";

// Hooks
import { useHtmlToPdf } from "@/hooks/useHtmlToPdf";
import { getApiUrl } from "@/lib/api";

type InputMode = "file" | "url";
type ViewportKey = "mobile" | "tablet" | "desktop" | "desktopLarge";
type MarginPreset = "none" | "narrow" | "normal" | "wide" | "custom";

const VIEWPORT_CONFIG: Record<ViewportKey, { width: number; height: number; label: string }> = {
  mobile: { width: 375, height: 667, label: "Móvil" },
  tablet: { width: 768, height: 1024, label: "Tablet" },
  desktop: { width: 1440, height: 900, label: "Escritorio" },
  desktopLarge: { width: 1920, height: 1080, label: "Grande" }
};

const VIEWPORT_ICONS: Record<ViewportKey, any> = {
  mobile: Smartphone,
  tablet: Tablet,
  desktop: Monitor,
  desktopLarge: Maximize
};

const MARGIN_PRESETS: Record<Exclude<MarginPreset, "custom">, { top: number; right: number; bottom: number; left: number }> = {
  none: { top: 0, right: 0, bottom: 0, left: 0 },
  narrow: { top: 10, right: 10, bottom: 10, left: 10 },
  normal: { top: 20, right: 20, bottom: 20, left: 20 },
  wide: { top: 30, right: 30, bottom: 30, left: 30 }
};

// Extraer nombre del dominio de una URL
const getDomainName = (urlString: string): string => {
  try {
    const url = new URL(urlString);
    let domain = url.hostname.replace(/^www\./, '');
    domain = domain.split('.')[0];
    return domain || 'webpage';
  } catch {
    return 'webpage';
  }
};

export default function HtmlToPdfClient() {
  const [inputMode, setInputMode] = useState<InputMode>("file");
  const [file, setFile] = useState<File | null>(null);
  const [url, setUrl] = useState("");
  const [isUrlLoading, setIsUrlLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Detectar viewport inicial basado en el ancho de pantalla
  const getInitialViewport = (): ViewportKey => {
    if (typeof window === 'undefined') return 'desktop';
    const width = window.innerWidth;
    if (width < 640) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  };

  const [viewport, setViewport] = useState<ViewportKey>(getInitialViewport);
  const [marginPreset, setMarginPreset] = useState<MarginPreset>("narrow");
  const [customMargin, setCustomMargin] = useState({ top: 10, right: 10, bottom: 10, left: 10 });

  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [previewScale, setPreviewScale] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  const {
    isProcessing,
    progress,
    isComplete,
    phase,
    operation,
    uploadStats,
    result,
    convert,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useHtmlToPdf();

  const buildViewportPayload = (key: ViewportKey) => ({
    width: VIEWPORT_CONFIG[key].width,
    height: VIEWPORT_CONFIG[key].height
  });

  const buildMarginsPayload = () => {
    if (marginPreset === "custom") {
      return customMargin;
    }
    return MARGIN_PRESETS[marginPreset];
  };

  const calculateScale = useCallback((viewportKey: ViewportKey) => {
    if (!containerRef.current) {
      // Fallback: usar window.innerWidth si el container no está listo
      if (typeof window === 'undefined') return 1;
      const padding = 32;
      const containerWidth = window.innerWidth - 350 - padding;
      const targetWidth = VIEWPORT_CONFIG[viewportKey].width;

      if (containerWidth < targetWidth) {
        return Math.max(0.3, containerWidth / targetWidth);
      }
      return 1;
    }

    const padding = 32;
    const containerWidth = containerRef.current.clientWidth - padding;
    const targetWidth = VIEWPORT_CONFIG[viewportKey].width;

    if (containerWidth < targetWidth) {
      return Math.max(0.3, containerWidth / targetWidth);
    }
    return 1;
  }, []);

  const handleFileChange = async (newFiles: File[]) => {
    if (newFiles[0]) {
      const selectedFile = newFiles[0];
      setFile(selectedFile);
      setTimeout(() => generatePreview(selectedFile, null), 100);
    }
  };

  const generatePreview = async (
    selectedFile: File | null = null,
    selectedUrl: string | null = null,
    viewportOverride: ViewportKey | null = null
  ) => {
    const targetFile = selectedFile || file;
    const targetUrl = selectedUrl || url;
    const targetViewport = viewportOverride || viewport;

    if (!targetFile && !targetUrl) return;

    // Calcular scale inmediatamente para el nuevo viewport
    const newScale = calculateScale(targetViewport);
    setPreviewScale(newScale);

    setIsGeneratingPreview(true);
    try {
      const formData = new FormData();

      if (inputMode === "file" && targetFile) {
        formData.append("file", targetFile);
        formData.append("isUrl", "false");
      } else if (inputMode === "url" && targetUrl) {
        formData.append("url", targetUrl);
        formData.append("isUrl", "true");
      }

      formData.append("viewport", JSON.stringify(buildViewportPayload(targetViewport)));

      const response = await fetch(getApiUrl("/api/worker/html-to-pdf/preview"), {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const blob = await response.blob();
        if (previewImageUrl) URL.revokeObjectURL(previewImageUrl);
        const newUrl = URL.createObjectURL(blob);
        setPreviewImageUrl(newUrl);

        // Recalcular scale después de que la imagen esté lista
        requestAnimationFrame(() => {
          setPreviewScale(calculateScale(targetViewport));
        });
      } else {
        console.error("Error al generar vista previa");
      }
    } catch (error) {
      console.error("Error al obtener preview:", error);
    } finally {
      setIsGeneratingPreview(false);
      setIsUrlLoading(false);
    }
  };

  const handleUrlPreview = async () => {
    if (!url) return;
    setIsUrlLoading(true);
    await generatePreview(null, url);
  };

  const handleReset = () => {
    setFile(null);
    setUrl("");
    setPreviewImageUrl(null);
  };

  const updatePreviewScale = useCallback(() => {
    setPreviewScale(calculateScale(viewport));
  }, [viewport, calculateScale]);

  // Inicialización: calcular scale cuando el container esté listo
  useEffect(() => {
    if (!isInitialized && containerRef.current) {
      setPreviewScale(calculateScale(viewport));
      setIsInitialized(true);
    }
  }, [isInitialized, viewport, calculateScale]);

  // Actualizar scale en resize
  useEffect(() => {
    updatePreviewScale();
    window.addEventListener("resize", updatePreviewScale);
    return () => window.removeEventListener("resize", updatePreviewScale);
  }, [updatePreviewScale]);

  const handleConvert = async (saveName: string) => {
    setIsDialogOpen(false);

    await convert({
      mode: inputMode,
      file: file || undefined,
      url: url || undefined,
      viewport: buildViewportPayload(viewport),
      margins: buildMarginsPayload(),
      fileName: saveName,
    });
  };

  const getDefaultFileName = (): string => {
    if (inputMode === "file" && file) {
      return file.name.replace(/\.html?$/i, "");
    }
    if (inputMode === "url" && url) {
      return getDomainName(url);
    }
    return "documento";
  };

  const hasFiles = inputMode === "file" ? !!file : !!previewImageUrl;

  return (
    <>
      <PdfToolLayout
        toolId="html-to-pdf"
        title="HTML a PDF: Convertir Webs a PDF"
        description="Guarda cualquier página web como un documento portátil. Renderizado perfecto de CSS y JavaScript, con opciones de vista móvil o escritorio y limpieza automática de anuncios."
        hasFiles={hasFiles}
        onFilesSelected={handleFileChange}
        acceptedFileTypes=".html,.htm"
        onReset={handleReset}
        customEmptyState={
          inputMode === "url" ? (
            <div className="flex flex-col items-center justify-center min-h-[320px] text-center p-8 bg-white/40 dark:bg-zinc-900/40 rounded-3xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
              <div className="w-full max-w-lg space-y-6">
                <div className="p-4 bg-primary/5 rounded-full w-fit mx-auto mb-2">
                  <Globe className="w-12 h-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-xl">Convierte cualquier URL</h3>
                  <p className="text-sm text-muted-foreground">
                    Pega la dirección de la página web que deseas convertir a PDF.
                  </p>
                </div>

                <div className="flex gap-2 relative">
                  <div className="relative flex-1 group">
                    <Input
                      placeholder="https://ejemplo.com"
                      value={url}
                      onChange={(e) => setUrl(e.target.value)}
                      className="pl-5 pr-12 h-12 rounded-full shadow-none border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 focus-visible:ring-primary placeholder:text-zinc-500/50"
                      onKeyDown={(e) => e.key === "Enter" && handleUrlPreview()}
                    />
                  </div>
                  <Button
                    variant="default"
                    size="icon"
                    onClick={handleUrlPreview}
                    disabled={!url || isUrlLoading}
                    className="absolute right-2 top-1.5 rounded-full p-4 transition-all flex items-center gap-2"
                  >
                    {isUrlLoading ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <Search className="w-5 h-5" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
          ) : undefined
        }
        headerContent={
          <Tabs
            value={inputMode}
            onValueChange={(v) => {
              setInputMode(v as InputMode);
              handleReset();
            }}
            className="w-full max-w-xs"
          >
            <TabsList className="grid w-full grid-cols-2 rounded-xl p-1 bg-zinc-100 dark:bg-zinc-800">
              <TabsTrigger value="file" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <FileCode className="w-4 h-4 mr-2" />
                Archivo
              </TabsTrigger>
              <TabsTrigger value="url" className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm">
                <Globe className="w-4 h-4 mr-2" />
                URL
              </TabsTrigger>
            </TabsList>
          </Tabs>
        }
        sidebarCustomControls={
          <div className="space-y-4">
            {/* Viewport Selection */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                <Layout className="w-4 h-4" />
                Resolución
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(VIEWPORT_CONFIG) as ViewportKey[]).map((key) => {
                  const config = VIEWPORT_CONFIG[key];
                  const Icon = VIEWPORT_ICONS[key];
                  return (
                    <Button
                      key={key}
                      variant={viewport === key ? "default" : "outline"}
                      size="sm"
                      className="flex flex-col h-auto py-2 gap-1 text-[10px]"
                      disabled={isGeneratingPreview}
                      onClick={() => {
                        setViewport(key);
                        if (file || url) {
                          generatePreview(null, null, key);
                        }
                      }}
                    >
                      <Icon className="w-4 h-4 mb-1" />
                      <span className="text-[12px] leading-none">{config.label}</span>
                      <span className="text-[10px] opacity-60 leading-none">({config.width}px)</span>
                    </Button>
                  );
                })}
              </div>
            </div>

            {/* Margins */}
            <div className="space-y-2">
              <Label className="block text-sm font-medium">Márgenes del PDF</Label>
              <Select
                value={marginPreset}
                onValueChange={(v) => setMarginPreset(v as MarginPreset)}
              >
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Sin márgenes</SelectItem>
                  <SelectItem value="narrow">Estrechos (10mm)</SelectItem>
                  <SelectItem value="normal">Normales (20mm)</SelectItem>
                  <SelectItem value="wide">Amplios (30mm)</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>

              {marginPreset === "custom" && (
                <div className="grid grid-cols-4 gap-2">
                  <div className="space-y-1">
                    <Label className="text-[10px]">Sup.</Label>
                    <Input
                      type="number"
                      value={customMargin.top}
                      className="h-8 text-xs"
                      onChange={(e) => setCustomMargin({ ...customMargin, top: +e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Der.</Label>
                    <Input
                      type="number"
                      value={customMargin.right}
                      className="h-8 text-xs"
                      onChange={(e) => setCustomMargin({ ...customMargin, right: +e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Inf.</Label>
                    <Input
                      type="number"
                      value={customMargin.bottom}
                      className="h-8 text-xs"
                      onChange={(e) => setCustomMargin({ ...customMargin, bottom: +e.target.value })}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-[10px]">Izq.</Label>
                    <Input
                      type="number"
                      value={customMargin.left}
                      className="h-8 text-xs"
                      onChange={(e) => setCustomMargin({ ...customMargin, left: +e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <Separator className="my-4" />
          </div>
        }
        summaryItems={[
          {
            label: "Origen",
            value: inputMode === "file" ? (file ? file.name : "Archivo") : (url ? getDomainName(url) : "URL")
          },
          {
            label: "Resolución",
            value: `${VIEWPORT_CONFIG[viewport].label} (${VIEWPORT_CONFIG[viewport].width}px)`
          }
        ]}
        downloadButtonText="Convertir a PDF"
        isDownloadDisabled={!hasFiles || isProcessing}
        onDownload={() => setIsDialogOpen(true)}
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: getDefaultFileName(),
          onSave: handleConvert,
          isProcessing,
          title: "Guardar PDF",
          description: "Elige un nombre para tu archivo PDF.",
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <div ref={containerRef} className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950/50 rounded-lg border dark:border-zinc-800 overflow-hidden relative">
          {/* Header del preview */}
          <div className="flex items-center justify-between px-4 py-2 bg-white dark:bg-zinc-900 border-b dark:border-zinc-800 z-10">
            <div className="flex items-center gap-2">
              {isGeneratingPreview ? (
                <Badge variant="outline" className="bg-amber-50 text-amber-600 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800 flex items-center gap-2 px-2 py-0.5 font-medium">
                  <RefreshCw className="w-3 h-3 animate-spin" />
                  Generando...
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 flex items-center gap-2 px-2 py-0.5 font-medium">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                  Vista previa
                </Badge>
              )}
              <span className="text-[10px] text-muted-foreground bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                {VIEWPORT_CONFIG[viewport].width}px
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-zinc-400 hover:text-red-500 transition-colors"
              onClick={handleReset}
              title="Limpiar"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>

          {/* Área del preview */}
          <div className="flex-1 overflow-auto p-4 flex justify-center items-start bg-zinc-100/50 dark:bg-zinc-900/30">
            {isGeneratingPreview ? (
              <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
                <RefreshCw className="w-10 h-10 animate-spin opacity-30" />
                <p className="text-sm">Generando vista previa...</p>
              </div>
            ) : previewImageUrl ? (
              <div
                key={viewport}
                style={{
                  width: VIEWPORT_CONFIG[viewport].width * previewScale,
                  minHeight: 200,
                }}
              >
                <div
                  className="bg-white shadow-lg origin-top-left ring-1 ring-zinc-200 dark:ring-zinc-700"
                  style={{
                    width: VIEWPORT_CONFIG[viewport].width,
                    transform: `scale(${previewScale})`,
                  }}
                >
                  <img
                    src={previewImageUrl}
                    alt="Vista previa"
                    className="w-full h-auto select-none pointer-events-none"
                  />
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center p-12 gap-3 text-muted-foreground">
                <Eye className="w-10 h-10 opacity-15" />
                <p className="text-sm">Sube un archivo HTML o ingresa una URL</p>
              </div>
            )}
          </div>

          {/* Indicador de escala */}
          {previewScale < 1 && previewImageUrl && !isGeneratingPreview && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-zinc-900/80 text-white rounded-full text-[10px] backdrop-blur-sm">
              {(previewScale * 100).toFixed(0)}%
            </div>
          )}
        </div>
      </PdfToolLayout>

      {(isProcessing || isComplete) && (
        <ProcessingScreen
          fileName={result?.fileName || "documento.pdf"}
          operation={operation}
          progress={progress}
          isComplete={isComplete}
          phase={phase}
          uploadStats={uploadStats}
          onDownload={handleDownloadAgain}
          onEditAgain={handleStartNew}
          onStartNew={() => {
            handleStartNew();
            handleReset();
          }}
          onCancel={cancelOperation}
          toolMetrics={
            result
              ? {
                  type: "convert",
                  data: {
                    originalFormat: result.sourceType === 'url' ? 'URL' : 'HTML',
                    resultSize: result.resultSize,
                  }
                }
              : undefined
          }
        />
      )}
    </>
  );
}
