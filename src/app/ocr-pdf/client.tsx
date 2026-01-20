"use client";

import { useState, useCallback, useMemo } from "react";
import { notify } from "@/lib/errors/notifications";
import { Info, FileText, Loader2, Check, X } from "lucide-react";

// UI Components
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
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

// PDF Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import ProcessingScreen from "@/components/processing-screen";
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";

// Hook
import { useOcrPdf, DPI_OPTIONS, type DpiOption } from "@/hooks/useOcrPdf";

// ============================================================================
// COMPONENT
// ============================================================================

export default function OcrPdfClient() {
  const {
    // State
    file,
    pages,
    ocrStatus,
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    tip,
    uploadStats,
    availableLanguages,
    selectedLanguages,
    dpi,
    optimize,
    result,
    hasPasswordError,
    passwordProtectedFileName,
    clearPasswordError,


    // Setters
    setFile,
    setSelectedLanguages,
    setDpi,
    setOptimize,

    // Page operations
    removePage,
    reorderPages,

    // Actions
    applyOcr,
    downloadAgain,
    reset,
    startNew,
    cancelOperation,

    // Assets
    funFacts,
    customTips,
  } = useOcrPdf();

  // Estado para el diálogo de guardar
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length === 0) return;

    if (files.length > 1) {
      notify.warning("Solo se procesará el primer archivo");
    }

    setFile(files[0]);
  }, [setFile]);

  const handleReset = () => {
    reset();
    clearPasswordError(); // Ensure we clear errors
  };

  const handleRemovePage = useCallback((id: string) => {
    removePage(id);
  }, [removePage]);

  const handleReorderPages = useCallback((newPages: any[]) => {
    reorderPages(newPages);
  }, [reorderPages]);

  const handleApplyOcr = useCallback(() => {
    if (!file) return;
    setIsDialogOpen(true);
  }, [file]);

  const handleSaveWithName = useCallback(async (fileName: string) => {
    setIsDialogOpen(false);
    await applyOcr(`${fileName}.pdf`);
  }, [applyOcr]);

  const gridItems = useMemo(() => pages.map(p => ({
    ...p,
    id: p.id,
    file: file!,
    originalIndex: p.pageNumber,
    rotation: p.rotation,
    isBlank: false,
  })), [pages, file]);

  const extractCardData = useCallback((p: any) => ({
    id: p.id,
    file: p.file,
    pageNumber: p.originalIndex,
    rotation: p.rotation,
    isBlank: p.isBlank,
  }), []);

  // ---------------------------------------------------------------------------
  // Status Badge
  // ---------------------------------------------------------------------------

  const renderStatusBadge = () => {
    switch (ocrStatus) {
      case "detecting":
        return (
          <Badge variant="outline" className="gap-1.5">
            <Loader2 className="w-3 h-3 animate-spin" />
            Detectando...
          </Badge>
        );
      case "scanned":
        return (
          <Badge variant="destructive" className="gap-1.5">
            <FileText className="w-3 h-3" color="white" />
            <span className="text-white">Documento escaneado</span>
          </Badge>
        );
      case "has-text":
        return (
          <Badge className="gap-1.5 bg-green-500 hover:bg-green-600">
            <Check className="w-3 h-3" />
            Documento(s) con texto
          </Badge>
        );
      case "error":
        return (
          <Badge variant="secondary" className="gap-1.5">
            <X className="w-3 h-3" />
            No detectado
          </Badge>
        );
      default:
        return null;
    }
  };

  // ---------------------------------------------------------------------------
  // Sidebar Controls
  // ---------------------------------------------------------------------------

  const sidebarControls = (
    <div className="space-y-5">
      {/* Estado OCR */}
      {file && (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {renderStatusBadge()}
            {ocrStatus === "has-text" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
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

      {/* Idiomas */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Idiomas del documento</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                <p className="text-xs">
                  Selecciona los idiomas presentes en el documento para mejorar la precisión del OCR.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <MultiSelect
          values={selectedLanguages}
          onValuesChange={setSelectedLanguages}
        >
          <MultiSelectTrigger className="w-full shadow-none">
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

      {/* DPI */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium">Calidad de procesamiento</Label>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Info className="w-3.5 h-3.5 text-zinc-400 cursor-help" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[220px]">
                <p className="text-xs">
                  Mayor DPI = mejor precisión pero más tiempo. 300 DPI es estándar.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <Select
          value={dpi.toString()}
          onValueChange={(v) => setDpi(Number(v) as DpiOption)}
        >
          <SelectTrigger className="w-full shadow-none">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DPI_OPTIONS.map((opt) => (
              <SelectItem key={opt.value} value={opt.value.toString()}>
                {opt.label} - {opt.description}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Optimizar */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="optimize"
          checked={optimize}
          onCheckedChange={(checked) => setOptimize(checked === true)}
        />
        <Label htmlFor="optimize" className="text-sm cursor-pointer">
          Optimizar PDF resultante
        </Label>
      </div>

      <Separator className="my-4" />
    </div>
  );

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const hasContent = !!file && pages.length > 0;
  const isLoading = !!file && pages.length === 0 && ocrStatus !== "error";

  return (
    <>
      <PdfToolLayout
        toolId="ocr-pdf"
        title="OCR PDF: Reconocimiento de Texto y PDF Buscable"
        description="Convierte documentos escaneados en PDFs con texto seleccionable. Haz que tus archivos sean buscables (Searchable) y copia el contenido fácilmente."
        hasFiles={hasContent || hasPasswordError}
        onFilesSelected={handleFilesSelected}
        acceptedFileTypes=".pdf,application/pdf"
        onReset={handleReset}
        hasPasswordError={hasPasswordError}
        passwordProtectedFileName={passwordProtectedFileName}
        summaryItems={[
          { label: "Archivo", value: file?.name || "-" },
          { label: "Páginas", value: pages.length || "-" },
          { label: "Peso", value: file ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : "-" },
          { label: "Idiomas", value: `${selectedLanguages.length} seleccionado${selectedLanguages.length !== 1 ? "s" : ""}` },
        ]}
        downloadButtonText="Descargar PDF"
        isDownloadDisabled={isProcessing || !hasContent || selectedLanguages.length === 0}
        onDownload={handleApplyOcr}
        isGridLoading={isLoading && !hasPasswordError}
        sidebarCustomControls={sidebarControls}
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file?.name.replace(/\.pdf$/i, "") || "documento",
          onSave: handleSaveWithName,
          isProcessing,
          title: "Aplicar OCR",
          description: `Se aplicará OCR en ${dpi} DPI con ${selectedLanguages.length} idioma${selectedLanguages.length !== 1 ? "s" : ""}.`,
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <PdfGrid
          items={gridItems}
          config={PDF_CARD_PRESETS.ocr}
          extractCardData={extractCardData}
          onRemove={handleRemovePage}
          onReorder={handleReorderPages}
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
          customTip={tip}
          customTipLabel="PROCESO"
          customFunFacts={funFacts}
          customTips={customTips}
          processingDescription="El reconocimiento de texto puede tardar dependiendo de la complejidad."
          onDownload={downloadAgain}
          onEditAgain={startNew}
          onStartNew={reset}
          onCancel={phase === "uploading" || phase === "compressing" ? cancelOperation : undefined}
          toolMetrics={
            result
              ? {
                type: "pages",
                data: {
                  operation: "OCR aplicado",
                  resultSize: result.resultSize,
                  pagesProcessed: pages.length,
                  pagesTotal: pages.length,
                }
              }
              : undefined
          }
        />
      )}
    </>
  );
}