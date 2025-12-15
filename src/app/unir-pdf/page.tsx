"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, GripVertical, Loader2 } from "lucide-react";
import { HeadingPage } from "@/components/ui/heading-page";
import { toast } from "sonner";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { Dropzone } from "@/components/ui/dropzone";
import { SaveDialog } from "@/components/save-dialog";

// hooks
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";

export default function UnirPdfPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
            <div className="space-y-6">
              <PdfToolbar
                title={`${files.length} Archivos seleccionados`}
                subtitle={''}
                onAdd={() => fileInputRef.current?.click()}
                onSortAZ={sortAZ}
                onSortZA={sortZA}
                onReset={() => reset()}
                showAddButton={true}
              />

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                <div className="lg:col-span-1 space-y-6">
                  <Card className="sticky top-24">
                    <CardContent className="space-y-6 py-4">
                      <div className="space-y-4">
                        <div>
                          <h2 className="text-md font-semibold mb-2">Resumen:</h2>
                          <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-inside">
                            <li>Estás a punto de combinar <strong className="underline">{files.length} archivos</strong> en un único PDF.</li>
                            <li>Arrastra (<GripVertical className="w-4 h-4 text-zinc-400 inline" />) y suelta las tarjetas para definir el orden de las páginas en tu documento final.</li>
                          </ul>
                        </div>

                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
                          <div className="flex justify-between">
                            <span>Total páginas a unir:</span>
                            <span className="font-bold">
                              {files.reduce((acc, f) => acc + (f.pageCount || 0), 0)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Peso de archivo final:</span>
                            <span className="font-bold">
                              {(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                        <Button
                          className="w-full bg-red-500 hover:bg-red-600 cursor-pointer disabled:bg-red-600 disabled:hover:bg-red-600 disabled:cursor-not-allowed"
                          size="lg"
                          onClick={() => setIsDialogOpen(true)}
                          disabled={files.length < 2 || isProcessing}
                        >
                          {isProcessing ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <FileUp className="w-4 h-4" />
                          )}
                          {isProcessing ? "Procesando..." : "Unir y Descargar PDF"}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <SaveDialog
                  open={isDialogOpen}
                  onOpenChange={setIsDialogOpen}
                  defaultName="merged-document"
                  onSave={handleSubmit}
                  isProcessing={isProcessing}
                  title="Guardar archivo"
                  description="Asigna un nombre a tu archivo PDF fusionado antes de descargarlo."
                />

                {/* Right Panel: PDF Grid */}
                <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
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
    </div>
  );
}
