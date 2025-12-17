"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";
// components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownToLine } from "lucide-react";
import { HeadingPage } from "@/components/ui/heading-page";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { Dropzone } from "@/components/ui/dropzone";
import { SaveDialog } from "@/components/save-dialog";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { SummaryList } from "@/components/summaryList";
import { GlobalToolbar } from "@/components/globalToolbar";
// hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { useIsMobile } from "@/hooks/useMobile";

export default function UnirPdfPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isMobile = useIsMobile();

  const {
    files,
    addFiles,
    removeFile,
    reorderFiles,
    sortAZ,
    sortZA,
    reset,
  } = usePdfFiles();
  const { isProcessing, processAndDownload } = usePdfProcessing();

  const handleFiles = async (newFiles: File[]) => {
    await addFiles(newFiles);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (outputName: string) => {
    if (files.length < 2) {
      toast.error("Por favor sube al menos 2 archivos para unir.");
      return;
    }

    const formData = new FormData();
    files.forEach((f) => {
      formData.append("files", f.file);
    });

    const success = await processAndDownload(outputName, formData, {
      endpoint: "/api/merge-pdf",
      successMessage: "¡PDF unido correctamente!",
      onSuccess: () => {
        setIsDialogOpen(false);
        reset();
      }
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
      <div className="space-y-6">

        <HeadingPage
          titlePage={"Unir PDF"}
          descriptionPage="Combina múltiples archivos PDF en un solo documento ordenado."
        />

        <div className="w-full">
          {files.length === 0 ? (
            <Dropzone
              onFilesSelected={handleFiles}
              multiple={true}
              className="bg-zinc-50/50 dark:bg-zinc-900/50 h-80"
            />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-2">

                  {isMobile && (
                    <PdfToolbar
                      onAdd={() => fileInputRef.current?.click()}
                      onReset={() => reset()}
                    />
                  )}

                  <section className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2">
                    <GlobalToolbar
                      features={{
                        sorting: true,
                      }}
                      actions={{
                        onSortAZ: sortAZ,
                        onSortZA: sortZA,
                      }}
                    />
                  </section>

                  <section className="bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-2 md:p-6 min-h-[500px]">
                    <PdfGrid
                      items={files}
                      config={PDF_CARD_PRESETS.merge}
                      extractCardData={(f) => ({
                        id: f.id,
                        file: f.file,
                        name: f.name,
                        size: f.file.size,
                        pageCount: f.pageCount,
                        rotation: f.rotation
                      })}
                      onReorder={reorderFiles}
                      onRemove={removeFile}
                    />
                  </section>
                </div>

                <div className="lg:col-span-1">
                  <div className="fixed bottom-0 lg:sticky lg:top-4 space-y-6 z-9 w-[calc(100svw-2rem)] lg:w-auto">

                    {!isMobile && (
                      <PdfToolbar
                        onAdd={() => fileInputRef.current?.click()}
                        onReset={() => reset()}
                      />
                    )}

                    <Card>
                      <CardContent className="space-y-4 py-4">

                        <SummaryList
                          title="Resumen"
                          items={[
                            {
                              label: "Total archivos",
                              value: files.length
                            },
                            {
                              label: "Total páginas a unir",
                              value: files.reduce((acc, f) => acc + (f.pageCount || 0), 0)
                            },
                            {
                              label: "Peso archivo final",
                              value: (files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2) + " MB"
                            }
                          ]}
                        />

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-700">
                          <Button
                            variant="hero"
                            className="w-full py-6 font-medium"
                            size="lg"
                            onClick={() => setIsDialogOpen(true)}
                            disabled={files.length < 2 || isProcessing}
                          >
                            {isProcessing ? "Procesando..." : "Unir y Descargar PDF"}
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

      {/* Hidden file input for "Añadir PDF" button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleFiles(Array.from(e.target.files));
          }
        }}
      />

      <SaveDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultName="merged-document"
        onSave={handleSubmit}
        isProcessing={isProcessing}
        title="Guardar archivo"
        description="Asigna un nombre a tu archivo PDF fusionado antes de descargarlo."
      />
    </div>
  );
}
