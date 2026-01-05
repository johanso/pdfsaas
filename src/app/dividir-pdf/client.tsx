"use client";

import { useState, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Scissors, Layers, X } from "lucide-react";

// Components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SplitGrid } from "./split-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { getSplitGroupColor } from "@/lib/split-colors";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";

// Hooks
import { usePdfLoader } from "@/hooks/usePdfLoader";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";

export default function SplitPdfClient() {
  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"ranges" | "fixed">("ranges");
  const [ranges, setRanges] = useState<number[]>([]);
  const [fixedSize, setFixedSize] = useState<number>(2);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  const { numPages } = usePdfLoader(file);
  const {
    isProcessing,
    progress,
    isComplete,
    fileName,
    operation,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew
  } = usePdfProcessing();

  const handleReset = () => {
    setFile(null);
    setRanges([]);
    setFixedSize(2);
  };

  const handleFilesSelected = useCallback((files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      if (f.type !== "application/pdf") {
        toast.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      handleReset();
      setFile(f);
    }
  }, []);

  const handleRangeClick = useCallback((pageNumber: number) => {
    setRanges(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber).sort((a, b) => a - b);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  }, []);

  const handleDeleteGroup = useCallback((groupIndex: number) => {
    const sortedRanges = [...ranges].sort((a, b) => a - b);
    if (groupIndex === sortedRanges.length) {
      if (sortedRanges.length > 0) {
        const lastSplit = sortedRanges[sortedRanges.length - 1];
        setRanges(prev => prev.filter(p => p !== lastSplit));
      }
    } else if (groupIndex < sortedRanges.length) {
      const splitToRemove = sortedRanges[groupIndex];
      setRanges(prev => prev.filter(p => p !== splitToRemove));
    }
  }, [ranges]);

  const getIsZip = () => {
    if (mode === "ranges") return ranges.length > 0;
    if (mode === "fixed") return Math.ceil(numPages / fixedSize) > 1;
    return false;
  };

  const rangeGroups = useMemo(() => {
    if (mode !== "ranges" || numPages === 0) return [];
    const groups: { start: number; end: number; color: string }[] = [];
    const sortedRanges = [...ranges].sort((a, b) => a - b);
    let start = 1;

    sortedRanges.forEach((splitPoint, index) => {
      const colorObj = getSplitGroupColor(index);
      groups.push({ start, end: splitPoint, color: colorObj.dot });
      start = splitPoint + 1;
    });

    if (start <= numPages) {
      const colorObj = getSplitGroupColor(sortedRanges.length);
      groups.push({ start, end: numPages, color: colorObj.dot });
    }
    return groups;
  }, [mode, numPages, ranges]);

  const handlePreSubmit = () => {
    if (!file) return;
    if (mode === "ranges" && ranges.length === 0) {
      toast.error("Define al menos un punto de división");
      return;
    }
    if (mode === "fixed" && (fixedSize < 1 || fixedSize >= numPages)) {
      toast.error("El tamaño de división debe ser válido");
      return;
    }
    setShowSaveDialog(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;

    setShowSaveDialog(false);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);
    let config = mode === "ranges" ? { ranges } : { size: fixedSize };
    formData.append("config", JSON.stringify(config));

    await processAndDownload(fileName, formData, {
      endpoint: "/api/worker/split-pdf",
      extension: getIsZip() ? "zip" : "pdf",
      operation: "Dividiendo PDF",
      successMessage: "¡Archivo procesado correctamente!",
      onContinueEditing: () => {
        // Keep files and state
      }
    });
  };

  // const rangeGroups = getRangeGroups(); // Moved to useMemo above

  return (
    <>
      <PdfToolLayout
        toolId="split-pdf"
        title="Dividir, Separar o cortar PDF"
        description="Extrae páginas sueltas o divide tu archivo en varios documentos PDF. Fácil, rápido y seguro."
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[
          { label: "Total páginas", value: numPages },
          { label: "Modo", value: mode === "ranges" ? "Por Rangos" : "Cantidad Fija" },
        ]}
        downloadButtonText={isProcessing ? "Procesando..." : (getIsZip() ? "Dividir y Descargar ZIP" : "Dividir y Descargar PDF")}
        isDownloadDisabled={isProcessing || numPages === 0 || (mode === "ranges" && ranges.length === 0) || (mode === "fixed" && fixedSize < 1)}
        onDownload={handlePreSubmit}
        isGridLoading={file !== null && numPages === 0}
        sidebarCustomControls={
          <>
            <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger className="flex items-center gap-2 cursor-pointer" value="ranges">
                  <Scissors className="w-4 h-4" />
                  <span className="text-xs">Rangos</span>
                </TabsTrigger>
                <TabsTrigger className="flex items-center gap-2 cursor-pointer" value="fixed">
                  <Layers className="w-4 h-4" />
                  <span className="text-xs">Cantidad</span>
                </TabsTrigger>
              </TabsList>

              <div className="space-y-4">
                {mode === "ranges" && (
                  <div className="text-sm text-zinc-500">
                    <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Modo Rangos</p>
                    <p>Haz clic en las tijeras entre las páginas para crear nuevos grupos.</p>
                    {rangeGroups.length > 0 && (
                      <div className="mt-4 space-y-3">
                        <div className="space-y-1 max-h-[300px] overflow-y-auto pr-1">
                          {rangeGroups.map((group, index) => (
                            <div key={index} className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700">
                              <div className={`w-2 h-2 rounded-full ${group.color} shrink-0`} />
                              <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 min-w-[60px]">archivo-{index + 1}.pdf:</span>
                              <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1">
                                {group.start === group.end ? `Pág ${group.start}` : `Págs ${group.start}-${group.end}`}
                              </span>
                              {rangeGroups.length > 1 && (
                                <Button variant="ghost" size="icon" className="h-5 w-5 hover:text-red-600" onClick={() => handleDeleteGroup(index)}>
                                  <X className="h-3 w-3" />
                                </Button>
                              )}
                            </div>
                          ))}
                        </div>
                        <div className="p-3 bg-green-100/60 dark:bg-green-200/90 border border-green-300 dark:border-green-600 rounded-lg text-xs text-zinc-600 dark:text-zinc-700">
                          {
                            rangeGroups.length > 1
                              ? <>Se crearán <span className="font-semibold text-zinc-900">{rangeGroups.length} archivos PDF</span> en un .zip al descargar.</>
                              : <>El archivo cargado aun no se ha dividido.</>
                          }
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {mode === "fixed" && (
                  <div className="space-y-4">
                    <div className="text-sm text-zinc-500">
                      <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">División Fija</p>
                      <p>Divide el documento en partes de igual tamaño.</p>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs block font-medium text-zinc-700 dark:text-zinc-300">Páginas por archivo:</label>
                      <Input
                        type="number"
                        min={0}
                        max={numPages}
                        className="shadow-none"
                        value={fixedSize}
                        onChange={(e) => setFixedSize(Math.min(parseInt(e.target.value) || 1, numPages))}
                      />
                    </div>
                    {(() => {
                      const totalGroups = Math.ceil(numPages / fixedSize);
                      return (
                        <div className="p-3 bg-green-100/60 dark:bg-green-200/90 border border-green-300 dark:border-green-600 rounded-lg text-xs text-zinc-600 dark:text-zinc-700">
                          {numPages % fixedSize !== 0 ? (
                            <>El documento se dividirá en <strong>{totalGroups}</strong> archivos: {totalGroups - 1} archivo{totalGroups - 1 > 1 ? 's' : ''} de <strong>{fixedSize}</strong> página{fixedSize > 1 ? 's' : ''} y 1 archivo de <strong>{numPages % fixedSize}</strong> página{(numPages % fixedSize) > 1 ? 's' : ''}.</>
                          ) : (
                            <>El documento se dividirá en <strong>{totalGroups}</strong> archivos de <strong>{fixedSize}</strong> página{fixedSize > 1 ? 's' : ''} cada uno.</>
                          )}
                        </div>
                      );
                    })()}
                  </div>
                )}
              </div>
            </Tabs>
            <Separator className="my-5" />
          </>
        }
        saveDialogProps={{
          isOpen: showSaveDialog,
          onOpenChange: setShowSaveDialog,
          defaultName: file?.name.replace(".pdf", "") + (mode === "ranges" ? "-split" : "-fixed") || "",
          onSave: handleSubmit,
          isProcessing,
          title: getIsZip() ? "Guardar archivo ZIP" : "Guardar archivo PDF",
          description: getIsZip() ? "Asigna un nombre a tu archivo comprimido." : "Asigna un nombre a tu archivo PDF.",
          extension: getIsZip() ? "zip" : "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
      >
        <SplitGrid
          file={file!}
          numPages={numPages}
          mode={mode}
          ranges={ranges}
          fixedSize={fixedSize}
          onRangeClick={handleRangeClick}
        />
      </PdfToolLayout>

      {(isProcessing || isComplete) && (
        <ProcessingScreen
          fileName={fileName}
          operation={operation}
          progress={progress}
          isComplete={isComplete}
          onDownload={handleDownloadAgain}
          onEditAgain={() => handleContinueEditing()}
          onStartNew={() => handleStartNew(handleReset)}
        />
      )}
    </>
  );
}
