"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { notify } from "@/lib/errors/notifications";

// UI Components
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import ProcessingScreen from "@/components/processing-screen";

// Custom Components
import { WatermarkTextConfig } from "@/components/pdf-system/watermark/watermark-text-config";
import { WatermarkImageConfig } from "@/components/pdf-system/watermark/watermark-image-config";
import { WatermarkOverlay } from "@/components/pdf-system/watermark/watermark-overlay";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Hooks
import { usePdfMultiLoader } from "@/hooks/usePdfMultiLoader";
import { useWatermarkPdf, WatermarkOptions } from "@/hooks/useWatermarkPdf";
import { PageData } from "@/types";

const DEFAULT_CONFIG: WatermarkOptions = {
  type: 'text',
  text: 'CONFIDENCIAL',
  fontSize: 36, // Reduced from 48 for more reasonable default
  color: '#FF0000',
  opacity: 0.5,
  rotation: 0,
  position: 'center',
  pages: 'all',
  width: 200,
  maintainAspectRatio: 'true',
  fileName: ""
};

export default function WatermarkClient() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [config, setConfig] = useState<WatermarkOptions>(DEFAULT_CONFIG);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [isGridLoading, setIsGridLoading] = useState(false);

  const { loadPdfPages, hasPasswordError, passwordProtectedFileName, clearPasswordError } = usePdfMultiLoader();

  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    result,
    uploadStats,
    process: applyWatermark,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useWatermarkPdf();


  // Get unique files from pages
  const uniqueFiles = useMemo(() => {
    return Array.from(
      new Set(pages.map(p => p.file).filter(f => f !== undefined))
    ) as File[];
  }, [pages]);

  const handleFilesSelected = useCallback(async (newFiles: File[]) => {
    const pdfs = newFiles.filter(f => f.type === "application/pdf");
    if (pdfs.length === 0) {
      notify.error("Selecciona archivos PDF válidos");
      return;
    }

    setIsGridLoading(true);
    try {
      const newPages = await loadPdfPages(pdfs);
      if (newPages.length > 0) {
        setPages(prev => [...prev, ...newPages]);
        notify.success(`${newPages.length} página(s) añadida(s)`);
      } else {
        notify.error("No se pudieron cargar archivos PDF");
      }
    } catch (error) {
      notify.error("Error al cargar los archivos");
    } finally {
      setIsGridLoading(false);
    }
  }, [loadPdfPages]);


  const handlePreSubmit = () => {
    if (pages.length === 0) return;

    if (config.type === 'text' && !config.text) {
      notify.error("Ingresa el texto de la marca de agua");
      return;
    }
    if (config.type === 'image' && !config.watermarkImage) {
      notify.error("Sube una imagen para la marca de agua");
      return;
    }

    setIsSaveDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (uniqueFiles.length === 0) return;
    setIsSaveDialogOpen(false);

    console.log('📄 Submitting watermark:', {
      fileName,
      fileToProcess: uniqueFiles[0].name,
      fileSize: uniqueFiles[0].size,
      totalUniqueFiles: uniqueFiles.length,
      totalPages: pages.length,
      config: {
        type: config.type,
        pages: config.pages,
        position: config.position,
        rotation: config.rotation,
      }
    });

    // For now, apply to first file only
    // TODO: Support multiple files in the future
    await applyWatermark(uniqueFiles[0], {
      ...config,
      fileName: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`
    });
  };

  const handleReset = () => {
    setPages([]);
    setIsSaveDialogOpen(false);
    clearPasswordError();
    setConfig(DEFAULT_CONFIG);
  };

  const extractCardData = useCallback((page: PageData) => ({
    id: page.id,
    file: page.file,
    pageNumber: page.originalIndex,
    rotation: page.rotation,
    width: page.width,
    height: page.height
  }), []);

  // Check if a page should have watermark based on config.pages
  const shouldShowWatermark = useCallback((pageNumber: number) => {
    console.log('Checking watermark for page:', pageNumber, 'config.pages:', config.pages);

    if (config.pages === 'all') return true;

    try {
      const selectedPages = JSON.parse(config.pages) as number[];
      const shouldShow = selectedPages.includes(pageNumber);
      console.log('  → selectedPages:', selectedPages, 'shouldShow:', shouldShow);
      return shouldShow;
    } catch (error) {
      console.log('  → Parse error, showing on all pages:', error);
      return true; // If parsing fails, show on all pages
    }
  }, [config.pages]);

  // Memoize the PdfGrid config to regenerate when dependencies change
  const pdfGridConfig = useMemo(() => {
    console.log('♻️ Regenerating PdfGrid config, pages:', config.pages);
    return {
      ...PDF_CARD_PRESETS.watermark,
      overlayContent: (cardData: any) => {
        // Only show watermark overlay on selected pages
        // Note: cardData is PdfCardData (mapped from extractedData), so use pageNumber
        if (!shouldShowWatermark(cardData.pageNumber || 1)) return null;
        return <WatermarkOverlay config={config} pageData={cardData} />;
      }
    };
  }, [config, shouldShowWatermark]);

  return (
    <>

      <PdfToolLayout
        toolId="add-watermark"
        title="Marca de Agua PDF: Poner Logo o Texto en tus Documentos"
        description='Protege tu propiedad intelectual. Añade sellos de "Confidencial", "Borrador" o tu propio logotipo en todas las páginas de tu PDF en segundos.'
        hasFiles={pages.length > 0 || hasPasswordError}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        hasPasswordError={hasPasswordError}
        passwordProtectedFileName={passwordProtectedFileName}
        summaryItems={pages.length > 0 ? [
          { label: "Páginas", value: pages.length.toString() },
          { label: "Tipo", value: config.type === 'text' ? 'Texto' : 'Imagen' },
          { label: "Posición", value: config.position }
        ] : []}
        layout="grid"
        isGridLoading={isGridLoading}
        sidebarCustomControls={
          <div className="space-y-6">
            {/* Config Controls */}
            {pages.length > 0 && (
              <div className="space-y-4">
                <Tabs
                  value={config.type}
                  onValueChange={(value) => setConfig(prev => ({
                    ...prev,
                    type: value as 'text' | 'image',
                    rotation: 0 // Reset rotation when changing type
                  }))}
                  className="w-full"
                >
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="text">Texto</TabsTrigger>
                    <TabsTrigger value="image">Imagen</TabsTrigger>
                  </TabsList>

                  <TabsContent value="text" className="mt-4">
                    <WatermarkTextConfig
                      config={config}
                      onChange={(updates) => setConfig(prev => ({ ...prev, ...updates }))}
                    />
                  </TabsContent>
                  <TabsContent value="image" className="mt-4">
                    <WatermarkImageConfig
                      config={config}
                      onChange={(updates) => setConfig(prev => ({ ...prev, ...updates }))}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        }
        downloadButtonText="Aplicar marca de agua"
        isDownloadDisabled={isProcessing || pages.length === 0 || (config.type === 'image' && !config.watermarkImage)}
        onDownload={handlePreSubmit}
        saveDialogProps={{
          open: isSaveDialogOpen,
          onOpenChange: setIsSaveDialogOpen,
          defaultName: uniqueFiles[0] ? uniqueFiles[0].name.replace(".pdf", "") : "documento",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar PDF con marca de agua",
          description: config.type === 'text'
            ? `Se aplicará marca de agua de texto: "${config.text}".`
            : "Se aplicará marca de agua con imagen.",
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: handleStartNew,
        }}
      >
        <PdfGrid
          items={pages}
          config={pdfGridConfig}
          layout="grid"
          extractCardData={extractCardData}
        />
      </PdfToolLayout>

      {(isProcessing || isComplete) && (
        <ProcessingScreen
          fileName={result?.fileName || (uniqueFiles[0]?.name.replace(".pdf", "-watermarked.pdf")) || "documento.pdf"}
          operation="Aplicando marca de agua"
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
        />
      )}
    </>
  );
}
