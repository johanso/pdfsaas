"use client";

import { useState } from "react";
import { toast } from "sonner";
// components
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowDownToLine, Loader2 } from "lucide-react";
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



export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
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
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
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
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-3 space-y-2">
                  {isMobile && (
                    <PdfToolbar onReset={handleReset} />
                  )}

                  <section className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2">
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

                  <section className="bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-2 md:p-6 min-h-[500px]">
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
                  <div className="fixed bottom-0 lg:sticky lg:top-4 space-y-6 z-9 w-[calc(100svw-2rem)] lg:w-auto">
                    {!isMobile && (
                      <PdfToolbar onReset={handleReset} />
                    )}

                    <Card>
                      <CardContent className="space-y-4 py-4">
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

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                          <Button
                            variant="hero"
                            className="w-full py-6 font-medium"
                            size="lg"
                            onClick={() => setIsDialogOpen(true)}
                            disabled={isProcessing || !pages.some(p => (p.rotation % 360) !== 0)}
                          >
                            {isProcessing ? "Procesando..." : "Aplicar Giro y Descargar"}
                            <ArrowDownToLine className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              <SaveDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                defaultName={`rotated-${file.name.replace(".pdf", "")}`}
                onSave={handleSave}
                isProcessing={isProcessing}
                title="Guardar archivo"
                description="Asigna un nombre a tu archivo PDF rotado."
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