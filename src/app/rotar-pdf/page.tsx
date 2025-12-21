"use client";

import { useState } from "react";
import { toast } from "sonner";
// components
import { Card, CardContent } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { GlobalToolbar } from "@/components/globalToolbar";
import { SuccessDialog } from "@/components/success-dialog";
// hooks
import { usePdfPages } from "@/hooks/usePdfPages";
import { useIsMobile } from "@/hooks/useMobile";
import { SummaryList } from "@/components/summaryList";
import { cn } from "@/lib/utils";
import BootstrapIcon from "@/components/bootstrapIcon";
import { ButtonDownload } from "@/components/buttonDownload";

export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const isMobile = useIsMobile();

  const { pages, rotateAllPages, resetRotation, rotatePage, reorderPages } = usePdfPages(file);

  const rotatePageLeft = (id: string) => rotatePage(id, -90);
  const rotatePageRight = (id: string) => rotatePage(id, 90);
  const { isProcessing, processAndDownload } = usePdfProcessing();

  const handleRotateRight = () => {
    rotateAllPages(90);
    toast.success("Documento rotado a la derecha");
  };

  const handleRotateLeft = () => {
    rotateAllPages(-90);
    toast.success("Documento rotado a la izquierda");
  };

  const handleResetRotation = () => {
    resetRotation();
    toast.info("Rotación restablecida");
  };

  const handleSave = async (outputName: string) => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const pageInstructions = pages.map(p => ({
      originalIndex: p.originalIndex - 1,
      rotation: p.rotation
    }));

    formData.append("pageInstructions", JSON.stringify(pageInstructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/rotate-pdf",
      successMessage: "¡PDF rotado correctamente!",
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      }
    });
  };

  const handleReset = () => {
    setFile(null);
    setIsSuccessDialogOpen(false);
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
    }
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl pb-24">
      <div className="space-y-6">
        <HeadingPage
          titlePage="Rotar PDF"
          descriptionPage="Corrige la orientación de tus documentos. Rota páginas sueltas o el archivo completo en segundos."
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
                          rotation: true,
                        }}
                        actions={{
                          onRotateRights: handleRotateRight,
                          onRotateLefts: handleRotateLeft,
                          onResetOrientation: handleResetRotation,
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
                        config={PDF_CARD_PRESETS.rotate}
                        extractCardData={(page) => ({
                          id: page.id,
                          file: page.file,
                          pageNumber: page.originalIndex,
                          rotation: page.rotation
                        })}
                        onReorder={reorderPages}
                        onRotate={rotatePage}
                        onRotateLeft={rotatePageLeft}
                        onRotateRight={rotatePageRight}
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
                              rotation: true,
                            }}
                            actions={{
                              onRotateRights: () => {
                                handleRotateRight();
                                setIsOptionsOpen(false);
                              },
                              onRotateLefts: () => {
                                handleRotateLeft();
                                setIsOptionsOpen(false);
                              },
                              onResetOrientation: () => {
                                handleResetRotation();
                                setIsOptionsOpen(false);
                              },
                            }}
                          />
                        )}

                        <SummaryList
                          title="Resumen"
                          items={[
                            pages.some(p => (p.rotation % 360) !== 0) ? (
                              {
                                label: "Páginas modificadas",
                                value: `${pages.filter(p => (p.rotation % 360) !== 0).length} de ${pages.length}`,
                              }
                            ) : (
                              {
                                label: "Sin cambios pendientes",
                                value: "",
                              }
                            ),
                          ]}
                        />

                        <ButtonDownload
                          handleOpenSaveDialog={() => setIsDialogOpen(true)}
                          buttonText={isProcessing ? "Procesando..." : "Aplicar Giro y Descargar"}
                          disabled={isProcessing || !pages.some(p => (p.rotation % 360) !== 0)}
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
                        buttonText={isProcessing ? "Procesando..." : "Aplicar Giro y Descargar"}
                        disabled={isProcessing || !pages.some(p => (p.rotation % 360) !== 0)}
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
        title="Guardar archivo"
        description="Asigna un nombre a tu archivo PDF rotado."
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