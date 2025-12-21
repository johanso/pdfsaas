"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
// components
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Loader2 } from "lucide-react";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { GlobalToolbar } from "@/components/globalToolbar";
import { SummaryList } from "@/components/summaryList";
import { SuccessDialog } from "@/components/success-dialog";
// hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfPages } from "@/hooks/usePdfPages";
import { usePageSelection } from "@/hooks/usePageSelection";
import { useIsMobile } from "@/hooks/useMobile";
import { ButtonDownload } from "@/components/buttonDownload";
import BootstrapIcon from "@/components/bootstrapIcon";

export default function DeletePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const isMobile = useIsMobile();

  // Hooks principales
  const { pages, reorderPages } = usePdfPages(file);
  const {
    selectedPages,
    togglePage,
    selectAll,
    deselectAll,
    invertSelection,
    selectByRange,
    reset: resetSelection
  } = usePageSelection(pages.length);
  const { isProcessing, processAndDownload } = usePdfProcessing();

  // Convertir selectedPages (números) a IDs
  const selectedIds = pages
    .filter(p => selectedPages.includes(p.originalIndex))
    .map(p => p.id);

  const handleToggle = (id: string) => {
    const page = pages.find(p => p.id === id);
    if (page) {
      togglePage(page.originalIndex);
    }
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      resetSelection();
    }
  };

  const handleRangeChange = (input: string) => {
    const sanitized = input
      .replace(/[^0-9,-]/g, "")
      .replace(/^0+|(?<=[,-])0+/g, "");

    selectByRange(sanitized);
  };

  const handleReset = () => {
    setFile(null);
    resetSelection();
    setIsSuccessDialogOpen(false);
  };

  const handleOpenSaveDialog = () => {
    if (!file || pages.length === 0) {
      toast.error("No hay páginas para procesar");
      return;
    }

    if (selectedPages.length === pages.length) {
      toast.error("No puedes eliminar todas las páginas.");
      return;
    }

    setIsDialogOpen(true);
  };

  const handleSave = async (outputName: string) => {
    if (!file || pages.length === 0) return;

    const formData = new FormData();
    formData.append("file", file);

    // Enviar solo las páginas que NO están seleccionadas para eliminar
    const remainingPages = pages.filter(p => !selectedPages.includes(p.originalIndex));

    const pageInstructions = remainingPages.map(p => ({
      originalIndex: p.originalIndex - 1, // API espera índice base 0
      rotation: p.rotation
    }));

    formData.append("pageInstructions", JSON.stringify(pageInstructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/delete-pages",
      successMessage: "¡PDF procesado correctamente!",
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      }
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl pb-24">
      <div className="space-y-6">
        <HeadingPage
          titlePage="Eliminar Páginas PDF"
          descriptionPage="Selecciona, reordena y elimina las páginas que no necesites de tu documento."
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
                        config={PDF_CARD_PRESETS.delete}
                        selectedIds={selectedIds}
                        extractCardData={(p) => ({
                          id: p.id,
                          file: p.file,
                          pageNumber: p.originalIndex,
                          rotation: p.rotation,
                          isBlank: p.isBlank
                        })}
                        onReorder={reorderPages}
                        onToggle={handleToggle}
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
                          <label className="text-sm lg:text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Selección por rango:
                          </label>
                          <Input
                            className="h-12 text-sm lg:text-xs bg-white dark:bg-zinc-900 shadow-none"
                            placeholder="Ej: 1, 3-5, 8"
                            onChange={(e) => handleRangeChange(e.target.value)}
                          />
                          <p className="text-[11px] text-zinc-500">
                            Usa comas y guiones para especificar páginas
                          </p>
                        </div>

                        <SummaryList
                          title="Resumen"
                          items={[
                            {
                              label: "Total páginas cargadas",
                              value: pages.length,
                            },
                            {
                              label: "Páginas a eliminar",
                              value: selectedPages.length,
                            },
                            {
                              label: "Documento final",
                              value: `${pages.length - selectedPages.length} páginas`,
                            },
                          ]}
                        />

                        <ButtonDownload
                          handleOpenSaveDialog={handleOpenSaveDialog}
                          buttonText={isProcessing ? "Procesando..." : "Guardar Documento"}
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
                        handleOpenSaveDialog={handleOpenSaveDialog}
                        buttonText={isProcessing ? "Procesando..." : "Guardar Documento"}
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
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultName="documento-modificado"
        onSave={handleSave}
        isProcessing={isProcessing}
        title="Guardar documento"
        description="Asigna un nombre a tu documento PDF modificado."
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
