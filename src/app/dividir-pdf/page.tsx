"use client";
import { useState } from "react";
import { toast } from "sonner";
// components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Scissors, Layers, X } from "lucide-react";
import { SplitGrid } from "./split-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { getSplitGroupColor } from "@/lib/split-colors";

// Hooks
import { usePdfLoader } from "@/hooks/usePdfLoader";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";
import { useIsMobile } from "@/hooks/useMobile";
import { GlobalToolbar } from "@/components/globalToolbar";
import { SuccessDialog } from "@/components/success-dialog";
import { SummaryList } from "@/components/summaryList";
import { cn } from "@/lib/utils";
import BootstrapIcon from "@/components/bootstrapIcon";
import { ButtonDownload } from "@/components/buttonDownload";

export default function SplitPdfPage() {

  const [file, setFile] = useState<File | null>(null);
  const [mode, setMode] = useState<"ranges" | "fixed">("ranges");

  const [ranges, setRanges] = useState<number[]>([]);
  const [fixedSize, setFixedSize] = useState<number>(2);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isOptionsOpen, setIsOptionsOpen] = useState(false);
  const isMobile = useIsMobile();

  const { numPages } = usePdfLoader(file);
  const { isProcessing, processAndDownload } = usePdfProcessing();


  const handleReset = () => {
    setFile(null);
    setRanges([]);
    setFixedSize(2);
    setIsSuccessDialogOpen(false);
  };

  const handleFilesSelected = (files: File[]) => {
    if (files.length > 0) {
      const f = files[0];
      if (f.type !== "application/pdf") {
        toast.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      handleReset();
      setFile(f);
    }
  };

  const handleRangeClick = (pageNumber: number) => {
    setRanges(prev => {
      if (prev.includes(pageNumber)) {
        return prev.filter(p => p !== pageNumber).sort((a, b) => a - b);
      } else {
        return [...prev, pageNumber].sort((a, b) => a - b);
      }
    });
  };

  const handleDeleteGroup = (groupIndex: number) => {
    const sortedRanges = [...ranges].sort((a, b) => a - b);

    // If it's the last group, remove the last split point
    if (groupIndex === sortedRanges.length) {
      if (sortedRanges.length > 0) {
        const lastSplit = sortedRanges[sortedRanges.length - 1];
        setRanges(prev => prev.filter(p => p !== lastSplit));
      }
    } else if (groupIndex < sortedRanges.length) {
      // Remove the split point at the end of this group
      const splitToRemove = sortedRanges[groupIndex];
      setRanges(prev => prev.filter(p => p !== splitToRemove));
    }
  };

  const getIsZip = () => {
    if (mode === "ranges") return ranges.length > 0;
    if (mode === "fixed") return Math.ceil(numPages / fixedSize) > 1;
    return false;
  };

  const getRangeGroups = () => {
    if (mode !== "ranges" || numPages === 0) return [];

    const groups: { start: number; end: number; color: string }[] = [];

    const sortedRanges = [...ranges].sort((a, b) => a - b);
    let start = 1;

    sortedRanges.forEach((splitPoint, index) => {
      const colorObj = getSplitGroupColor(index);
      groups.push({
        start,
        end: splitPoint,
        color: colorObj.dot
      });
      start = splitPoint + 1;
    });

    // Add final group
    if (start <= numPages) {
      const colorObj = getSplitGroupColor(sortedRanges.length);
      groups.push({
        start,
        end: numPages,
        color: colorObj.dot
      });
    }

    return groups;
  };

  const handlePreSubmit = () => {
    if (!file) return;

    // Validation
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

    const formData = new FormData();
    formData.append("file", file);
    formData.append("mode", mode);

    let config = {};
    if (mode === "ranges") {
      config = { ranges };
    } else if (mode === "fixed") {
      config = { size: fixedSize };
    }
    formData.append("config", JSON.stringify(config));

    await processAndDownload(fileName, formData, {
      endpoint: "/api/split-pdf",
      successMessage: "¡Archivo procesado correctamente!",
      onSuccess: () => {
        setShowSaveDialog(false);
        setIsSuccessDialogOpen(true);
      }
    });
  };

  return (
    <div className="container mx-auto py-10 px-4 max-w-7xl pb-24">
      <div className="space-y-6">
        <HeadingPage
          titlePage={"Dividir PDF"}
          descriptionPage="Herramienta profesional para separar, extraer y organizar tus documentos."
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
                        features={{ sorting: true }}
                        actions={{
                          onSortAZ: () => toast.info("No aplicable en dividir"),
                          onSortZA: () => toast.info("No aplicable en dividir"),
                        }}
                      />
                    </section>
                  )}

                  <section className="lg:ml-12 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-300 dark:border-zinc-800 rounded-lg p-4 md:p-6 min-h-[500px]">
                    {numPages === 0 ? (
                      <div className="flex items-center justify-center h-full">
                        <Loader2 className="w-8 h-8 animate-spin text-zinc-400" />
                      </div>
                    ) : (
                      <SplitGrid
                        file={file}
                        numPages={numPages}
                        mode={mode}
                        ranges={ranges}
                        fixedSize={fixedSize}
                        onRangeClick={handleRangeClick}
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
                        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                          <TabsList className="grid w-full grid-cols-2 mb-4">
                            <TabsTrigger className="flex items-center gap-2 cursor-pointer" value="ranges" title="Por Rangos">
                              <Scissors className="w-4 h-4" />
                              <span className="text-xs">Rangos</span>
                            </TabsTrigger>
                            <TabsTrigger className="flex items-center gap-2 cursor-pointer" value="fixed" title="Fijo">
                              <Layers className="w-4 h-4" />
                              <span className="text-xs">Cantidad</span>
                            </TabsTrigger>
                          </TabsList>

                          <div className="space-y-4">
                            {mode === "ranges" && (
                              <div className="text-sm text-zinc-500">
                                <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Modo Rangos</p>
                                <p>Haz clic en las tijeras entre las páginas para crear nuevos grupos.</p>

                                {getRangeGroups().length > 0 && (
                                  <div className="mt-6 space-y-4">
                                    <div className="space-y-1.5">
                                      {getRangeGroups().map((group, index) => (
                                        <div
                                          key={index}
                                          className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 group/item hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                                        >
                                          <div className={`w-2 h-2 rounded-full ${group.color} shrink-0`} />
                                          <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 min-w-[60px]">
                                            archivo-{index + 1}.pdf:
                                          </span>
                                          <span className="text-xs text-zinc-500 dark:text-zinc-400 flex-1">
                                            {group.start === group.end
                                              ? `Pág ${group.start}`
                                              : `Págs ${group.start}-${group.end}`
                                            }
                                          </span>
                                          {
                                            getRangeGroups().length > 1 && (
                                              <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-5 w-5 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 cursor-pointer"
                                                onClick={() => handleDeleteGroup(index)}
                                                title="Eliminar grupo"
                                              >
                                                <X className="h-3 w-3" />
                                              </Button>
                                            )
                                          }
                                        </div>
                                      ))}
                                    </div>
                                    <div className="p-3 text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
                                      Se crearán <strong>{getRangeGroups().length} archivos PDF</strong> en un .zip
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
                                  <label className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                                    Páginas por archivo:
                                  </label>
                                  <Input
                                    type="number"
                                    min={1}
                                    max={numPages}
                                    value={fixedSize}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 1;
                                      if (val > numPages) {
                                        toast.error(`Máximo ${numPages} páginas`);
                                        setFixedSize(numPages);
                                      } else {
                                        setFixedSize(val);
                                      }
                                    }}
                                    className={cn(
                                      fixedSize > numPages && "border-red-500"
                                    )}
                                  />
                                </div>

                                {(() => {
                                  const totalGroups = Math.ceil(numPages / fixedSize);
                                  const lastGroupSize = numPages % fixedSize || fixedSize;
                                  const allSameSize = lastGroupSize === fixedSize;

                                  return (
                                    <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
                                      <span>
                                        Se crearán <strong>{totalGroups}</strong> archivo{totalGroups > 1 ? 's' : ''} PDF,
                                      </span>
                                      {allSameSize ? (
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                          &nbsp; todos con <strong>{fixedSize}</strong> página{fixedSize > 1 ? 's' : ''}
                                        </span>
                                      ) : (
                                        <span className="text-zinc-700 dark:text-zinc-300">
                                          &nbsp; {totalGroups - 1} de <strong>{fixedSize}</strong> págs, el último de <strong>{lastGroupSize}</strong> pág{lastGroupSize > 1 ? 's' : ''}
                                        </span>
                                      )}
                                    </div>
                                  );
                                })()}


                              </div>
                            )}
                          </div>
                        </Tabs>
                        <ButtonDownload
                          handleOpenSaveDialog={handlePreSubmit}
                          buttonText={isProcessing ? "Procesando..." : (getIsZip() ? "Dividir y Descargar ZIP" : "Dividir y Descargar PDF")}
                          disabled={
                            isProcessing ||
                            numPages === 0 ||
                            (mode === "ranges" && ranges.length === 0) ||
                            (mode === "fixed" && fixedSize < 1)
                          }
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
                        handleOpenSaveDialog={handlePreSubmit}
                        buttonText={isProcessing ? "Procesando..." : (getIsZip() ? "Dividir y Descargar ZIP" : "Dividir y Descargar PDF")}
                        disabled={
                          isProcessing ||
                          numPages === 0 ||
                          (mode === "ranges" && ranges.length === 0) ||
                          (mode === "fixed" && fixedSize < 1)
                        }
                      />
                    </div>
                  )}
                </div>
              </div>

              <SaveDialog
                open={showSaveDialog}
                onOpenChange={setShowSaveDialog}
                defaultName={file.name.replace(".pdf", "") + (mode === "ranges" ? "-split" : "-fixed")}
                onSave={handleSubmit}
                isProcessing={isProcessing}
                title={getIsZip() ? "Guardar archivo ZIP" : "Guardar archivo PDF"}
                description={getIsZip()
                  ? "Asigna un nombre a tu archivo comprimido antes de descargarlo."
                  : "Asigna un nombre a tu archivo PDF antes de descargarlo."
                }
                extension={getIsZip() ? "zip" : "pdf"}
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