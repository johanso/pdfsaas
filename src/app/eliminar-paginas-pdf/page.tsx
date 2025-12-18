"use client";
import { useState } from "react";
import { toast } from "sonner";
// components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ArrowDownToLine, Loader2 } from "lucide-react";
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

export default function DeletePagesPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const isMobile = useIsMobile();

  // Hooks principales
  const { pages, reorderPages, removePage } = usePdfPages(file);
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
    // Solo permitir números, comas y guiones. Eliminar letras y el '0' si es el primer carácter o está después de una coma/guion
    const sanitized = input
      .replace(/[^0-9,-]/g, "") // Solo números, comas y guiones
      .replace(/^0+|(?<=[,-])0+/g, ""); // No permitir ceros a la izquierda o después de separadores

    selectByRange(sanitized);
  };

  const handleDeleteSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("No hay páginas seleccionadas para eliminar");
      return;
    }

    if (selectedIds.length === pages.length) {
      toast.error("No puedes eliminar todas las páginas");
      return;
    }

    // Eliminar páginas seleccionadas
    selectedIds.forEach(id => removePage(id));
    resetSelection();
    toast.success(`${selectedIds.length} página(s) eliminada(s)`);
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
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
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
                  <div className="fixed bottom-0 lg:sticky lg:top-4 space-y-6 z-9 w-[calc(100svw-2rem)] lg:w-auto">
                    {!isMobile && (
                      <PdfToolbar onReset={handleReset} />
                    )}

                    <Card>
                      <CardContent className="space-y-4 py-4">
                        <div className="space-y-2">
                          <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                            Selección por rango:
                          </label>
                          <Input
                            className="h-9 text-sm bg-white dark:bg-zinc-900"
                            placeholder="Ej: 1, 3-5, 8"
                            onChange={(e) => handleRangeChange(e.target.value)}
                          />
                          <p className="text-[10px] text-zinc-500">
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

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                          <Button
                            variant="hero"
                            className="w-full py-6 font-medium"
                            size="lg"
                            onClick={handleOpenSaveDialog}
                            disabled={isProcessing || pages.length === 0}
                          >
                            {isProcessing ? "Procesando..." : "Guardar Documento"}
                            <ArrowDownToLine className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
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