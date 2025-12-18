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
import { SummaryList } from "@/components/summaryList";
import { SuccessDialog } from "@/components/success-dialog";
// Hooks
import { useIsMobile } from "@/hooks/useMobile";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePageSelection } from "@/hooks/usePageSelection";
import { usePdfPages } from "@/hooks/usePdfPages";
import { cn } from "@/lib/utils";

export default function ExtractPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [extractMode, setExtractMode] = useState<"separate" | "merge">("separate");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

  const { pages } = usePdfPages(file);
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

    const config = {
      pages: selectedPages,
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
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
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
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-2">
                  {isMobile && (
                    <PdfToolbar onReset={handleReset} />
                  )}

                  <section className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2">
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

                  <section className="bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-2 md:p-6 min-h-[500px]">
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
                      />
                    )}
                  </section>
                </div>

                <div className="lg:col-span-1">
                  <div className="fixed bottom-0 lg:sticky lg:top-4 space-y-6 z-9 w-[calc(100svw-2rem)] lg:w-auto">
                    {!isMobile && (
                      <PdfToolbar onReset={handleReset} />
                    )}

                    <Card>
                      <CardContent className="space-y-4 py-4">
                        <div className="space-y-2">
                          <div>
                            <h3 className="text-base mb-2 flex items-center gap-2">
                              ¿Cómo quieres descargar?
                            </h3>

                            <p className="text-sm text-zinc-500 mb-4">
                              Descarga cada página por separado o créalas en un solo PDF
                            </p>

                            <div className="flex flex-col gap-2">
                              <button
                                className={cn(
                                  "relative px-3 py-2 rounded-lg border-2 transition-all text-left",
                                  extractMode === "separate"
                                    ? "border-primary bg-primary/5"
                                    : "border-zinc-100 hover:border-zinc-300"
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
                                    <p className="font-medium">Páginas separadas</p>
                                    <p className="text-xs text-zinc-500 mt-0.5 mb-1">
                                      {selectedPages.length} archivos PDF en un .zip
                                    </p>
                                  </div>
                                </div>
                              </button>
                              <button
                                className={cn(
                                  "relative px-3 py-2 rounded-lg border-2 transition-all text-left",
                                  extractMode === "merge"
                                    ? "border-primary bg-primary/5"
                                    : "border-zinc-100 hover:border-zinc-200"
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
                                    <p className="font-medium">Fusionar en un PDF</p>
                                    <p className="text-xs text-zinc-500 mt-0.5 mb-1">
                                      1 archivo PDF con {selectedPages.length} página{selectedPages.length !== 1 ? 's' : ''}
                                    </p>
                                  </div>
                                </div>
                              </button>
                            </div>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                          <Button
                            variant="hero"
                            className="w-full py-6 font-medium"
                            size="lg"
                            onClick={handlePreSubmit}
                            disabled={isProcessing || selectedPages.length === 0}
                          >
                            {isProcessing ? "Procesando..." : extractMode === "separate" && selectedPages.length > 1 ? "Descargar ZIP" : "Descargar PDF"}
                            <ArrowDownToLine className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>
              <SaveDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                defaultName={file.name.replace(".pdf", "") + "-extract"}
                onSave={handleSubmit}
                isProcessing={isProcessing}
                title={extractMode === "separate" ? "Guardar archivo ZIP" : "Guardar archivo PDF"}
                description={extractMode === "separate"
                  ? "Asigna un nombre a tu archivo comprimido."
                  : "Asigna un nombre a tu nuevo archivo PDF."
                }
                extension={extractMode === "separate" ? "zip" : "pdf"}
              />
            </div>
          )}
        </div>
      </div>
      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        onContinue={() => setIsSuccessDialogOpen(false)}
        onStartNew={handleReset}
      />
    </div>
  );
}