"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  ArrowDownToLine,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfMultiLoader } from "@/hooks/usePdfMultiLoader";
import { PageData } from "@/types";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { useIsMobile } from "@/hooks/useMobile";
import { GlobalToolbar } from "@/components/globalToolbar";
import { SummaryList } from "@/components/summaryList";
import { SuccessDialog } from "@/components/success-dialog";


export default function OrganizePdfPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const isMobile = useIsMobile();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Unique files for summary
  const uniqueFiles = Array.from(
    new Set(pages.map(p => p.file).filter(f => f !== undefined))
  ) as File[];

  const { isProcessing, processAndDownload } = usePdfProcessing();
  const { loadPdfPages, isLoading } = usePdfMultiLoader();

  // --- Actions ---

  const handleAddFiles = async (files: File[]) => {
    const newPages = await loadPdfPages(files);

    if (newPages.length > 0) {
      setPages(prev => [...newPages, ...prev]);
      toast.success(`${newPages.length} página(s) añadida(s)`);
    } else if (files.length > 0) {
      toast.error("No se pudieron cargar archivos PDF válidos");
    }
  };

  const handleDelete = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos una página para eliminar");
      return;
    }

    const count = selectedIds.length;
    setPages(prev => prev.filter(p => !selectedIds.includes(p.id)));
    setSelectedIds([]);
    toast.success(`${count} página(s) eliminada(s)`);
  };

  const handleRotate = (degrees: number) => {
    if (selectedIds.length === 0) {
      toast.info("Selecciona páginas para rotar");
      return;
    }
    setPages(prev => prev.map(p => {
      if (selectedIds.includes(p.id)) {
        return { ...p, rotation: p.rotation + degrees };
      }
      return p;
    }));
    toast.success(`Rotación aplicada a ${selectedIds.length} página(s)`);
  };

  const handleResetRotation = () => {
    if (selectedIds.length === 0) {
      toast.info("Selecciona páginas para restablecer su rotación");
      return;
    }
    setPages(prev => prev.map(p =>
      selectedIds.includes(p.id) ? { ...p, rotation: 0 } : p
    ));
    toast.success("Rotación restablecida");
  };

  const handleRotatePage = (id: string, degrees: number) => {
    setPages(prev => prev.map(p =>
      p.id === id ? { ...p, rotation: p.rotation + degrees } : p
    ));
  };

  const handleDuplicatePage = (id: string) => {
    const pageToDuplicate = pages.find(p => p.id === id);
    if (!pageToDuplicate) return;

    setPages(prev => {
      const index = prev.findIndex(p => p.id === id);
      const newPage = { ...pageToDuplicate, id: crypto.randomUUID() };
      const newArr = [...prev];
      newArr.splice(index + 1, 0, newPage);
      return newArr;
    });
    toast.success("Página duplicada");
  };

  const handleInsertBlankPage = (id: string) => {
    const newPage: PageData = {
      id: crypto.randomUUID(),
      // @ts-ignore: Intentionally undefined for blank page
      file: undefined,
      originalIndex: 0,
      rotation: 0,
      isBlank: true
    };

    setPages(prev => {
      const index = prev.findIndex(p => p.id === id);
      const newArr = [...prev];
      newArr.splice(index + 1, 0, newPage);
      return newArr;
    });
    toast.success("Página en blanco insertada");
  };

  const handleRemovePage = (id: string) => {
    setPages(prev => prev.filter(p => p.id !== id));
    setSelectedIds(prev => prev.filter(pid => pid !== id));
  };

  const handleReset = () => {
    setPages([]);
    setSelectedIds([]);
    setIsSuccessDialogOpen(false);
  };

  const handleSave = async (outputName: string) => {
    if (pages.length === 0) {
      toast.error("No hay páginas para guardar");
      return;
    }

    const formData = new FormData();

    // Unique files to upload
    const uniqueFilesToUpload = new Set<File>();
    pages.forEach(p => {
      if (p.file) uniqueFilesToUpload.add(p.file);
    });

    const filesArray = Array.from(uniqueFilesToUpload);

    // Append files
    filesArray.forEach((f, index) => {
      formData.append(`file-${index}`, f);
    });

    // Build instructions
    const instructions = pages.map(p => {
      let fileIndex = -1;
      if (p.file) {
        fileIndex = filesArray.indexOf(p.file);
      }

      return {
        fileIndex,
        originalIndex: p.originalIndex,
        rotation: p.rotation,
        isBlank: !!p.isBlank
      };
    });

    formData.append("instructions", JSON.stringify(instructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/organize-pdf",
      successMessage: "¡PDF organizado correctamente!",
      onSuccess: () => {
        setIsDialogOpen(false);
        setIsSuccessDialogOpen(true);
      }
    });
  };

  const handleToggle = (id: string) => {
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    setSelectedIds(pages.map(p => p.id));
    toast.info("Todas las páginas seleccionadas");
  };

  const handleDeselectAll = () => {
    setSelectedIds([]);
    toast.info("Selección limpiada");
  };

  const handleInvert = () => {
    const all = pages.map(p => p.id);
    setSelectedIds(all.filter(id => !selectedIds.includes(id)));
    toast.info("Selección invertida");
  };

  const handleDuplicateSelected = () => {
    if (selectedIds.length === 0) {
      toast.error("Selecciona al menos una página para duplicar");
      return;
    }

    setPages(prev => {
      const newPages = [...prev];

      for (let i = newPages.length - 1; i >= 0; i--) {
        const page = newPages[i];

        if (selectedIds.includes(page.id)) {
          const duplicate = {
            ...page,
            id: crypto.randomUUID()
          };

          newPages.splice(i + 1, 0, duplicate);
        }
      }

      return newPages;
    });

    toast.success(`${selectedIds.length} página(s) duplicada(s)`);
    setSelectedIds([]);
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
      <div className="space-y-6">

        <HeadingPage
          titlePage="Organizar PDF"
          descriptionPage="Ordena, añade, gira y elimina páginas de múltiples archivos PDF."
        />

        <div className="w-full">
          {pages.length === 0 ? (
            <Dropzone
              onFilesSelected={handleAddFiles}
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
                      onReset={() => handleReset()}
                    />
                  )}

                  <section className="sticky top-0 z-10 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg p-2">
                    <GlobalToolbar
                      features={{
                        selection: true,
                        rotation: true,
                        bulkActions: true,
                      }}
                      actions={{
                        onSelectAll: handleSelectAll,
                        onDeselectAll: handleDeselectAll,
                        onInvertSelection: handleInvert,
                        onRotateRights: () => handleRotate(90),
                        onRotateLefts: () => handleRotate(-90),
                        onResetOrientation: handleResetRotation,
                        onDuplicateSelected: handleDuplicateSelected,
                        onDeleteSelected: handleDelete,
                      }}
                      state={{
                        hasSelection: selectedIds.length > 0,
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
                        config={PDF_CARD_PRESETS.organize}
                        selectedIds={selectedIds}
                        extractCardData={(page) => ({
                          id: page.id,
                          file: page.file,
                          pageNumber: page.originalIndex,
                          rotation: page.rotation,
                          isBlank: page.isBlank
                        })}
                        onReorder={setPages}
                        onToggle={handleToggle}
                        onRotateLeft={(id) => handleRotatePage(id, -90)}
                        onRotateRight={(id) => handleRotatePage(id, 90)}
                        onDuplicate={handleDuplicatePage}
                        onInsertBlank={handleInsertBlankPage}
                        onRemove={(id) => handleRemovePage(id)}
                      />
                    )}
                  </section>
                </div>

                <div className="lg:col-span-1">
                  <div className="fixed bottom-0 lg:sticky lg:top-4 space-y-6 z-9 w-[calc(100svw-2rem)] lg:w-auto">
                    {!isMobile && (
                      <PdfToolbar
                        onAdd={() => fileInputRef.current?.click()}
                        onReset={() => handleReset()}
                      />
                    )}

                    <Card>
                      <CardContent className="space-y-4 py-4">

                        <SummaryList
                          title="Resumen"
                          items={[
                            {
                              label: "PDFs combinados",
                              value: uniqueFiles.length
                            },
                            {
                              label: "Total páginas",
                              value: pages.length
                            },
                            {
                              label: "Páginas seleccionadas",
                              value: selectedIds.length
                            },
                            {
                              label: "Páginas en blanco",
                              value: pages.filter(p => p.isBlank).length
                            },
                            {
                              label: "Páginas rotadas",
                              value: pages.filter(p => (p.rotation % 360) !== 0).length
                            }
                          ].filter(item => typeof item.value === 'number' ? item.value > 0 : true)}
                        />

                        <div className="text-zinc-700 dark:text-zinc-300 text-xs">
                          Arrastra para reordenar, haz clic en las tarjetas para seleccionar, y usa los botones individuales para editar cada página.
                        </div>

                        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                          <Button
                            variant="hero"
                            className="w-full py-6 font-medium"
                            size="lg"
                            onClick={() => setIsDialogOpen(true)}
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

      <input
        ref={fileInputRef}
        type="file"
        accept="application/pdf"
        multiple
        className="hidden"
        onChange={(e) => {
          if (e.target.files) {
            handleAddFiles(Array.from(e.target.files));
          }
          e.target.value = "";
        }}
      />

      <SaveDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        defaultName="documento-organizado"
        onSave={handleSave}
        isProcessing={isProcessing}
        title="Guardar PDF Organizado"
        description="Tu nuevo documento está listo para descargar."
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