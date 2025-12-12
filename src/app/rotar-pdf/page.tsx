"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Download, FileUp, Loader2, RotateCw } from "lucide-react";
import { toast } from "sonner";
import { pdfjs } from "react-pdf";
import { SortablePageGrid } from "@/components/sortable-page-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { usePdfPages } from "@/hooks/usePdfPages";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";



export default function RotatePdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { pages, rotatePage, rotateAllPages, resetRotation, reorderPages } = usePdfPages(file);
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
      onSuccess: () => setIsDialogOpen(false)
    });
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

        {!file ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            multiple={false}
            className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
          />
        ) : (
          <div className="space-y-6">
            <PdfToolbar
              title={file.name}
              subtitle={`${pages.length} páginas | ${(file.size / 1024 / 1024).toFixed(2)} MB total`}
              onAdd={() => { }}
              showAddButton={false}
              onRotateRight={handleRotateRight}
              onRotateLeft={handleRotateLeft}
              onResetRotation={handleResetRotation}
              onReset={() => setFile(null)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Panel: Instructions & Download */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardContent className="space-y-6 pt-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="font-medium mb-2 flex items-center gap-2">
                          {/* <RotateCw className="w-4 h-4 text-primary" /> */}
                          Resumen:
                        </h3>
                        <ol className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-inside">
                          <li>Gira las páginas individualmente o usa los controles superiores para rotar todo el documento</li>
                        </ol>
                      </div>

                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">

                        {/* Detecta cuántas páginas tienen una rotación != 0.
                        Muestra: "Páginas modificadas: 3 de 6".
                        Si todas están en 0°, muestra: "Sin cambios pendientes". */}

                        {pages.some(p => p.rotation !== 0) ? (
                          <div className="flex justify-between">
                            <span>Páginas modificadas:</span>
                            <span className="font-bold">{pages.filter(p => p.rotation !== 0).length} de {pages.length}</span>
                          </div>
                        ) : (
                          <div className="flex justify-between">
                            <span>Sin cambios pendientes</span>
                          </div>
                        )}

                      </div>
                    </div>

                    <div className="py-4 border-t border-zinc-200 dark:border-zinc-800">
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 cursor-pointer disabled:bg-red-600 disabled:hover:bg-red-600 disabled:cursor-not-allowed"
                        size="lg"
                        onClick={() => setIsDialogOpen(true)}
                        disabled={isProcessing || !pages.some(p => p.rotation !== 0)}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Download className="w-4 h-4" />
                        )}
                        {isProcessing ? "Procesando..." : "Aplicar Giro y Descargar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
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

              {/* Right Panel: Pages Grid */}
              <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
                <SortablePageGrid
                  pages={pages}
                  selectedIds={[]}
                  onReorder={reorderPages}
                  onToggle={() => { }}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
