"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  Loader2,
  FileUp,
  StickyNote,
  Copy,
  Trash2,
  RotateCw,
  RotateCcw,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfMultiLoader } from "@/hooks/usePdfMultiLoader"; // ✨ NUEVO HOOK
import { PageData } from "@/types";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { usePdfPages } from "@/hooks/usePdfPages";


export default function OrganizePdfPage() {
  const [pages, setPages] = useState<PageData[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Unique files for summary
  const uniqueFiles = Array.from(
    new Set(pages.map(p => p.file).filter(f => f !== undefined))
  ) as File[];

  const { isProcessing, processAndDownload } = usePdfProcessing();
  const { loadPdfPages, isLoading } = usePdfMultiLoader();

  // --- Actions ---

  const handleAddFiles = async (files: File[]) => {
    const newPages = await loadPdfPages(files); // ✨ SIMPLE!

    if (newPages.length > 0) {
      setPages(prev => [...prev, ...newPages]);
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
        return { ...p, rotation: (p.rotation + degrees + 360) % 360 };
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
      p.id === id ? { ...p, rotation: (p.rotation + degrees + 360) % 360 } : p
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
    if (confirm("¿Estás seguro de querer borrar todo y empezar de cero?")) {
      setPages([]);
      setSelectedIds([]);
      toast.success("Todo limpiado");
    }
  };

  // --- API Submit ---

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
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  // --- Selection Handlers ---

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

  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
      <div className="space-y-6">
        <HeadingPage
          titlePage="Organizar PDF"
          descriptionPage="Ordena, añade, gira y elimina páginas de múltiples archivos PDF."
        />

        {pages.length === 0 ? (
          <Dropzone
            onFilesSelected={handleAddFiles}
            multiple={true}
            className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
            title="Arrastra tus archivos PDF aquí para empezar"
          />
        ) : (
          <div className="space-y-6">
            <PdfToolbar
              showAddButton={true}
              onAdd={() => document.getElementById("hidden-add-input")?.click()}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onInvertSelection={handleInvert}
              onRotateRight={() => handleRotate(90)}
              onRotateLeft={() => handleRotate(-90)}
              onResetRotation={handleResetRotation}
              onReset={handleReset}
            >
              {/* Hidden input for adding more files */}
              <input
                id="hidden-add-input"
                type="file"
                multiple
                accept=".pdf"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files) {
                    handleAddFiles(Array.from(e.target.files));
                  }
                  e.target.value = ""; // reset
                }}
              />


              {/* Delete Button */}
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleDelete}
                    disabled={selectedIds.length === 0}
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Eliminar seleccionadas</TooltipContent>
              </Tooltip>
            </PdfToolbar>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              {/* Left Panel: Info & Save */}
              <div className="lg:col-span-1 space-y-6">
                <Card className="sticky top-24">
                  <CardContent className="space-y-6 py-4">
                    <div className="space-y-4">
                      <h2 className="text-md font-semibold">Resumen</h2>

                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-2">
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Páginas totales:</span>
                          <span className="font-medium">{pages.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Archivos origen:</span>
                          <span className="font-medium">{uniqueFiles.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-500">Seleccionadas:</span>
                          <span className={selectedIds.length > 0 ? "text-primary font-bold" : "font-medium"}>
                            {selectedIds.length}
                          </span>
                        </div>
                      </div>

                      <ul className="text-xs text-zinc-500 list-disc list-inside space-y-1">
                        <li>Arrastra las páginas para reordenar.</li>
                        <li>Gira, elimina o duplica según necesites.</li>
                        <li>Combina múltiples PDFs en uno solo.</li>
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 cursor-pointer disabled:bg-red-600 disabled:hover:bg-red-600 disabled:cursor-not-allowed"
                        size="lg"
                        onClick={() => setIsDialogOpen(true)}
                        disabled={isProcessing || pages.length === 0}
                      >
                        {isProcessing ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            Procesando...
                          </>
                        ) : (
                          <>
                            <FileUp className="w-4 h-4 mr-2" />
                            Guardar PDF
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <SaveDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                defaultName="documento-organizado"
                onSave={handleSave}
                isProcessing={isProcessing}
                title="Guardar PDF Organizado"
                description="Tu nuevo documento está listo para descargar."
              />

              {/* Right Panel: Grid */}
              <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
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
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}