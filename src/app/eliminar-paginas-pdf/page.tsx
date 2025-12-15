"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { usePdfPages } from "@/hooks/usePdfPages";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";

export default function DeletePagesPage() {

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [file, setFile] = useState<File | null>(null);
  const [rangeInput, setRangeInput] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { pages, reorderPages } = usePdfPages(file);
  const { isProcessing, processAndDownload } = usePdfProcessing();


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

  const handleInvertSelection = () => {
    const allIds = pages.map(p => p.id);
    const newSelection = allIds.filter(id => !selectedIds.includes(id));
    setSelectedIds(newSelection);
    toast.info("Selección invertida");
  };

  const handleSave = async (outputName: string) => {
    if (!file) return;

    const activePages = pages.filter(p => !selectedIds.includes(p.id));

    const formData = new FormData();
    formData.append("file", file);

    const pageInstructions = activePages.map(p => ({
      originalIndex: p.originalIndex - 1,
      rotation: p.rotation
    }));

    formData.append("pageInstructions", JSON.stringify(pageInstructions));

    await processAndDownload(outputName, formData, {
      endpoint: "/api/delete-pages",
      successMessage: "¡PDF procesado correctamente!",
      onSuccess: () => setIsDialogOpen(false)
    });
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setSelectedIds([]);
      setRangeInput("");
    }
  };

  const handleRangeChange = (input: string) => {
    setRangeInput(input);

    if (!input.trim()) return;

    const idsToSelect: string[] = [];
    const parts = input.split(",");

    // Map originalIndex to ID for easier lookup
    const indexToIdMap = new Map(pages.map(p => [p.originalIndex, p.id]));

    parts.forEach(part => {
      const range = part.trim().split("-");
      if (range.length === 2) {
        const start = parseInt(range[0]);
        const end = parseInt(range[1]);
        if (!isNaN(start) && !isNaN(end)) {
          for (let i = Math.min(start, end); i <= Math.max(start, end); i++) {
            const id = indexToIdMap.get(i);
            if (id) idsToSelect.push(id);
          }
        }
      } else if (range.length === 1) {
        const pageNum = parseInt(range[0]);
        if (!isNaN(pageNum)) {
          const id = indexToIdMap.get(pageNum);
          if (id) idsToSelect.push(id);
        }
      }
    });

    const uniqueIds = Array.from(new Set(idsToSelect));
    if (uniqueIds.length > 0) {
      setSelectedIds(uniqueIds);
    }
  };

  const handleOpenSaveDialog = () => {
    if (!file || pages.length === 0) return;

    // Check valid state
    const activePages = pages.filter(p => !selectedIds.includes(p.id));
    if (activePages.length === 0) {
      toast.error("No puedes eliminar todas las páginas.");
      return;
    }

    setIsDialogOpen(true);
  };



  return (
    <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
      <div className="space-y-6">

        <HeadingPage
          titlePage={"Eliminar Páginas PDF"}
          descriptionPage="Reordena páginas, rota o elimina las que no necesites permenentemente."
        />

        {!file ? (
          <Dropzone
            onFilesSelected={handleFilesSelected}
            multiple={false}
            className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
          />
        ) : (
          <div className="space-y-6">
            {/* Shared Toolbar */}
            <PdfToolbar
              title={file.name}
              subtitle={`${pages.length} páginas | ${(file.size / 1024 / 1024).toFixed(2)} MB total`}
              onAdd={() => { }} // Disabled for single file tools or hidden
              showAddButton={false}
              onSelectAll={handleSelectAll}
              onDeselectAll={handleDeselectAll}
              onInvertSelection={handleInvertSelection}
              onReset={() => setFile(null)}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
              <div className="lg:col-span-1 space-y-6">
                <Card className="sticky top-24">
                  <CardContent className="space-y-6 py-4">
                    <div className="space-y-4">
                      <div>
                        <h2 className="text-md font-semibold mb-2">Resumen:</h2>
                        <ul className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-inside">
                          <li>Puedes seleccionar las páginas a eliminar de forma individual, incluso cambiar su orden.</li>
                          <li>Tambien puedes usar el campo de rango para una selección rápida (ej: 1,3-5)</li>
                        </ul>
                      </div>

                      <div className="space-y-2">
                        <label className="text-xs text-zinc-500">Campo de rango de páginas:</label>
                        <Input
                          className="h-9 text-sm bg-white dark:bg-zinc-900"
                          placeholder="Ej: 1, 3-5"
                          value={rangeInput}
                          onChange={(e) => handleRangeChange(e.target.value)}
                        />
                      </div>

                      <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
                        <div className="flex justify-between">
                          <span>Total PDF original:</span>
                          <span className="font-normal">{pages.length}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Páginas a eliminar:</span>
                          <span className={`font-bold ${selectedIds.length > 0 ? 'text-red-500' : ''}`}>
                            {selectedIds.length}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total final:</span>
                          <span className="font-bold">{pages.length - selectedIds.length}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                      <Button
                        className="w-full bg-red-500 hover:bg-red-600 cursor-pointer disabled:bg-red-600 disabled:hover:bg-red-600 disabled:cursor-not-allowed"
                        size="lg"
                        onClick={handleOpenSaveDialog}
                        disabled={isProcessing || selectedIds.length === 0}
                      >
                        {isProcessing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <FileUp className="w-4 h-4" />
                        )}
                        {isProcessing ? "Procesando..." : "Eliminar y Descargar"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <SaveDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                defaultName={`modified-${file.name.replace(".pdf", "")}`}
                onSave={handleSave}
                isProcessing={isProcessing}
                title="Guardar archivo"
                description="Asigna un nombre a tu nuevo archivo PDF."
              />

              {/* Right Panel: Pages Grid */}
              <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
                <PdfGrid
                  items={pages.map(p => ({
                    id: p.id,
                    file: p.file,
                    pageNumber: p.originalIndex,
                    rotation: p.rotation
                  }))}
                  config={PDF_CARD_PRESETS.delete}
                  selectedIds={selectedIds}
                  onReorder={(newItems) => {
                    const newPages = newItems.map(item => pages.find(p => p.id === item.id)!).filter(Boolean);
                    reorderPages(newPages);
                  }}
                  onToggle={handleToggle}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
