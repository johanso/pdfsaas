"use client";

import { useState } from "react";
import { toast } from "sonner";
import { FileOutput, ArrowDownToLine, Loader2, CheckCircle2, Circle } from "lucide-react";
// Components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { HeadingPage } from "@/components/ui/heading-page";
import { Dropzone } from "@/components/ui/dropzone";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { GlobalToolbar } from "@/components/globalToolbar";
import { SuccessDialog } from "@/components/success-dialog";
// Hooks
import { useIsMobile } from "@/hooks/useMobile";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePageSelection } from "@/hooks/usePageSelection";
import { usePdfPages } from "@/hooks/usePdfPages";
import { cn } from "@/lib/utils";
import BootstrapIcon from "@/components/bootstrapIcon";
import { ButtonDownload } from "@/components/buttonDownload";

export default function ExtractPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractMode, setExtractMode] = useState<"separate" | "merge">("separate");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const { pages, reorderPages } = usePdfPages(file);

  const numPages = pages.length;

  const {
    selectedPages,
    togglePage,
    selectAll,
    deselectAll,
    invertSelection,
    reset: resetSelection
  } = usePageSelection(numPages);
  const { isProcessing, processAndDownload } = usePdfProcessing();
  const isMobile = useIsMobile();


  const handleSubmit = async (fileName: string) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", "extract");

    const orderedSelectedPages = pages
      .filter(p => selectedPages.includes(p.originalIndex))
      .map(p => p.originalIndex);

    const config = {
      pages: orderedSelectedPages,
      merge: extractMode === "merge"
    };
    formData.append("config", JSON.stringify(config));

    await processAndDownload(fileName, formData, {
      endpoint: "/api/split-pdf",
      successMessage: "¡Páginas extraídas correctamente!",
      onSuccess: () => {
        setShowSaveDialog(false);
        setIsSuccessDialogOpen(true);
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    resetSelection();
    setIsSuccessDialogOpen(false);
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      if (f.type !== "application/pdf") {
        toast.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      resetSelection();
      setFile(f);
    }
  };

  const handlePreSubmit = () => {
    if (!file) return;
    if (selectedPages.length === 0) {
      toast.error("Selecciona al menos una página para extraer");
      return;
    }
    setShowSaveDialog(true);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl pb-24">
      <div className="space-y-6">
        <HeadingPage
          titlePage="Extraer Páginas PDF"
          descriptionPage="Selecciona las páginas que quieres conservar y crea un nuevo PDF o descárgalas por separado."
        />

        <div className="w-full">
          {!file ? (
            <Dropzone
              onFilesSelected={handleFilesSelected}
              multiple={false}
              className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
            />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-2 relative">
                  {isMobile && (
                    <PdfToolbar onReset={handleReset} />
                  )}

                  {!isMobile && (
                    <section className="sticky m-0 top-0 py-2 lg:py-0 lg:top-2 z-10 bg-white dark:bg-zinc-900">
                      <GlobalToolbar
                        features={{
                          selection: true,
                        }}
                        actions={{
                          onSelectAll: selectAll,
                          onDeselectAll: deselectAll,
                          onInvertSelection: invertSelection,
                        }}
                      />
                    </section>
                  )}

                  <section className="lg:ml-12 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-4 md:p-6 min-h-[500px]">
                    {pages.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                      </div>
                    ) : (
                      <PdfGrid
                        items={pages}
                        config={PDF_CARD_PRESETS.extract}
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
                    )}
                  </section>
                </div>

                <div className="lg:col-span-1">
                  {isMobile && isOptionsOpen && (
                    <div
                      className="fixed inset-0 bg-black/10 z-40 transition-opacity"
                      onClick={() => setIsOptionsOpen(false)}
                    />
                  )}

                  <div className={cn(
                    "z-50 transition-transform duration-300 ease-in-out space-y-6",
                    isMobile
                      ? "fixed bottom-0 left-0 right-0 rounded-t-3xl shadow-[0_-8px_30px_rgb(0,0,0,0.12)] dark:border-zinc-800"
                      : "sticky top-4 block",
                    isMobile && (isOptionsOpen ? "translate-y-0" : "translate-y-full")
                  )}>
                    {!isMobile && (
                      <PdfToolbar onReset={handleReset} />
                    )}

                    {isMobile && (
                      <div
                        className={cn(
                          "w-12 h-12 absolute -top-14 right-4 flex items-center justify-center p-3 rounded-full z-10 bg-white dark:bg-zinc-900 shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform",
                          isOptionsOpen ? "" : "hidden"
                        )}
                        onClick={() => setIsOptionsOpen(!isOptionsOpen)}>
                        <BootstrapIcon name="gear" size={26} animated="rotate" />
                      </div>
                    )}

                    <Card>
                      <CardContent className="space-y-4 py-4">

                        {isMobile && (
                          <GlobalToolbar
                            features={{
                              selection: true,
                            }}
                            actions={{
                              onSelectAll: () => {
                                selectAll();
                                setIsOptionsOpen(false);
                              },
                              onDeselectAll: () => {
                                deselectAll();
                                setIsOptionsOpen(false);
                              },
                              onInvertSelection: () => {
                                invertSelection();
                                setIsOptionsOpen(false);
                              },
                            }}
                          />
                        )}

                        <div className="space-y-2">
                          <h3 className="text-base mb-2 flex items-center gap-2">
                            ¿Cómo quieres descargar?
                          </h3>

                          <p className="text-sm text-zinc-500 mb-4">
                            Descarga cada página por separado o créalas en un solo PDF
                          </p>

                          <div className="flex flex-col gap-4">
                            <button
                              className={cn(
                                "relative px-3 py-2 rounded-lg border transition-all text-left",
                                extractMode === "separate"
                                  ? "border-primary dark:border-primary/40 bg-primary/5 dark:bg-primary/6"
                                  : "border-zinc-100 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                              )}
                              onClick={() => setExtractMode("separate")}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {extractMode === "separate" ? (
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-zinc-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm mb-1">Páginas separadas</p>
                                  <p className="text-xs text-zinc-500 mt-0.5 mb-1">
                                    {selectedPages.length} archivos PDF en un .zip
                                  </p>
                                </div>
                              </div>
                            </button>
                            <button
                              className={cn(
                                "relative px-3 py-2 rounded-lg border transition-all text-left",
                                extractMode === "merge"
                                  ? "border-primary bg-primary/5"
                                  : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600"
                              )}
                              onClick={() => setExtractMode("merge")}
                            >
                              <div className="flex items-start gap-2">
                                <div className="mt-0.5">
                                  {extractMode === "merge" ? (
                                    <CheckCircle2 className="w-5 h-5 text-primary" />
                                  ) : (
                                    <Circle className="w-5 h-5 text-zinc-300" />
                                  )}
                                </div>
                                <div>
                                  <p className="text-sm mb-1">Fusionar en un PDF</p>
                                  <p className="text-xs text-zinc-500 mt-0.5 mb-1">
                                    1 archivo PDF con {selectedPages.length} página{selectedPages.length !== 1 ? 's' : ''}
                                  </p>
                                </div>
                              </div>
                            </button>
                          </div>
                        </div>

                        <ButtonDownload
                          handleOpenSaveDialog={handlePreSubmit}
                          buttonText={isProcessing ? "Procesando..." : extractMode === "separate" && selectedPages.length > 1 ? "Descargar ZIP" : "Descargar PDF"}
                          disabled={isProcessing || selectedPages.length === 0}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {isMobile && (
                    <div
                      className={cn(
                        "fixed bottom-24 right-4 p-3 rounded-full z-10 bg-white dark:bg-zinc-900 shadow-md cursor-pointer hover:scale-110 active:scale-95 transition-transform",
                        !isOptionsOpen ? "" : "hidden"
                      )}
                      onClick={() => setIsOptionsOpen(!isOptionsOpen)}
                    >
                      <BootstrapIcon name={isOptionsOpen ? "x-lg" : "gear"} size={26} animated={isOptionsOpen ? "" : "rotate"} />
                    </div>
                  )}

                  {isMobile && !isOptionsOpen && (
                    <div className="p-4 fixed bottom-1 z-9 w-[calc(100svw-2rem)] bg-white dark:bg-zinc-900 rounded-md shadow-md">
                      <ButtonDownload
                        handleOpenSaveDialog={handlePreSubmit}
                        buttonText={isProcessing ? "Procesando..." : extractMode === "separate" && selectedPages.length > 1 ? "Descargar ZIP" : "Descargar PDF"}
                        disabled={isProcessing || selectedPages.length === 0}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <SaveDialog
        open={showSaveDialog}
        onOpenChange={setShowSaveDialog}
        defaultName="documento-modificado"
        onSave={handleSubmit}
        isProcessing={isProcessing}
        title={extractMode === "separate" ? "Guardar archivo ZIP" : "Guardar archivo PDF"}
        description={extractMode === "separate"
          ? "Asigna un nombre a tu archivo comprimido."
          : "Asigna un nombre a tu nuevo archivo PDF."
        }
        extension={extractMode === "separate" ? "zip" : "pdf"}
      />

      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        onContinue={() => setIsSuccessDialogOpen(false)}
        onStartNew={handleReset}
      />
    </div>
  );
}