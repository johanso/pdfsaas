"use client";
import { useState, useRef } from "react";
import { toast } from "sonner";
// components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownToLine, Loader2 } from "lucide-react";
import { HeadingPage } from "@/components/ui/heading-page";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { Dropzone } from "@/components/ui/dropzone";
import { SaveDialog } from "@/components/save-dialog";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { SummaryList } from "@/components/summaryList";
import { GlobalToolbar } from "@/components/globalToolbar";
import { SuccessDialog } from "@/components/success-dialog";
// hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { useIsMobile } from "@/hooks/useMobile";
import { ButtonDownload } from "@/components/buttonDownload";
import { cn } from "@/lib/utils";
import BootstrapIcon from "@/components/bootstrapIcon";

export default function UnirPdfPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
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

    await processAndDownload(outputName, formData, {
      endpoint: "/api/merge-pdf",
      successMessage: "¡PDF unido correctamente!",
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
          titlePage={"Unir PDF"}
          descriptionPage="Combina múltiples archivos PDF en un solo documento ordenado."
        />

        <div className="w-full">
          {files.length === 0 ? (
            <Dropzone
              onFilesSelected={handleFiles}
              multiple={true}
              className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
            />
          ) : (
            <div className="space-y-2">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                <div className="lg:col-span-3 space-y-2 relative">
                  {isMobile && (
                    <PdfToolbar
                      onAdd={() => fileInputRef.current?.click()}
                      onReset={() => reset()}
                    />
                  )}

                  {!isMobile && (
                    <section className="sticky m-0 top-0 py-2 lg:py-0 lg:top-2 z-10 bg-white dark:bg-zinc-900">
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
                  )}

                  <section className="lg:ml-12 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-4 md:p-6 min-h-[500px]">
                    {files.length === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                      </div>
                    ) : (
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
                    )}
                  </section>
                </div>

                <div className="lg:col-span-1">
                  {isMobile && isOptionsOpen && (
                    <div
                      className="fixed inset-0 bg-black/10 z-40 dark:bg-white/20 transition-opacity"
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
                      <PdfToolbar
                        onAdd={() => fileInputRef.current?.click()}
                        onReset={() => reset()}
                      />
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
                              sorting: true,
                            }}
                            actions={{
                              onSortAZ: () => {
                                sortAZ();
                                setIsOptionsOpen(false);
                              },
                              onSortZA: () => {
                                sortZA();
                                setIsOptionsOpen(false);
                              },
                            }}
                          />
                        )}

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

                        <ButtonDownload
                          handleOpenSaveDialog={() => setIsDialogOpen(true)}
                          buttonText={isProcessing ? "Procesando..." : "Unir y Descargar PDF"}
                          disabled={files.length < 2 || isProcessing}
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
                        handleOpenSaveDialog={() => setIsDialogOpen(true)}
                        buttonText={isProcessing ? "Procesando..." : "Unir y Descargar PDF"}
                        disabled={files.length < 2 || isProcessing}
                      />
                    </div>
                  )}

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

      <SuccessDialog
        open={isSuccessDialogOpen}
        onOpenChange={setIsSuccessDialogOpen}
        onContinue={() => setIsSuccessDialogOpen(false)}
        onStartNew={() => {
          setIsSuccessDialogOpen(false);
          reset();
        }}
      />
    </div>
  );
}
