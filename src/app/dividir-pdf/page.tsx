"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, Scissors, FileOutput, Layers, X } from "lucide-react";
import { toast } from "sonner";

import { SplitGrid } from "./split-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";
import { getSplitGroupColor } from "@/lib/split-colors";

// Configure worker inside component or effect to avoid SSR issues
// pdfjs.GlobalWorkerOptions.workerSrc = ... moved to useEffect

export default function SplitPdfPage() {
    // File State
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mode State
    const [mode, setMode] = useState<"ranges" | "fixed">("ranges");

    // Mode Specific Data
    const [ranges, setRanges] = useState<number[]>([]); // Split AFTER these page numbers
    const [fixedSize, setFixedSize] = useState<number>(2);
    const [showSaveDialog, setShowSaveDialog] = useState(false);



    // Initial PDF Load
    useEffect(() => {
        if (!file) return;

        const loadPdf = async () => {
            try {
                const { pdfjs } = await import("react-pdf");
                pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

                const buffer = await file.arrayBuffer();
                const pdf = await pdfjs.getDocument(buffer).promise;
                setNumPages(pdf.numPages);
            } catch (err) {
                console.error(err);
                toast.error("Error al leer el archivo PDF");
                setFile(null);
            }
        };
        loadPdf();
    }, [file]);

    const handleReset = () => {
        setFile(null);
        setNumPages(0);
        setRanges([]);
        setFixedSize(2);
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

    // Delete a specific group by removing its split point
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

    // Calculate groups for ranges mode
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
        setShowSaveDialog(false);

        setIsProcessing(true);

        try {
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

            const response = await fetch("/api/split-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error splitting PDF");
            }

            // Handle Download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;

            // Determine filename
            const ext = blob.type === "application/zip" ? "zip" : "pdf";
            a.download = `${fileName}.${ext}`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast.success("¡Archivo procesado correctamente!");

        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error al procesar el archivo");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl pb-32">
            <div className="space-y-6">
                <HeadingPage
                    titlePage={"Dividir PDF"}
                    descriptionPage="Herramienta profesional para separar, extraer y organizar tus documentos."
                />

                {!file ? (
                    <Dropzone
                        onFilesSelected={handleFilesSelected}
                        multiple={false}
                        className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
                    />
                ) : (
                    // Editor State
                    <div className="space-y-6">
                        <PdfToolbar
                            title={file.name}
                            subtitle={`${numPages} páginas | ${(file.size / 1024 / 1024).toFixed(2)} MB`}
                            onReset={handleReset}
                            showAddButton={false}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Left Panel: Controls */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card>
                                    <CardContent className="space-y-4 pt-4">
                                        <Tabs value={mode} onValueChange={(v) => setMode(v as any)} className="w-full">
                                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                                <TabsTrigger className="flex items-center gap-2 cursor-pointer" value="ranges" title="Por Rangos">
                                                    <Scissors className="w-4 h-4" />
                                                    <span className="text-xs">Manual</span>
                                                </TabsTrigger>
                                                <TabsTrigger className="flex items-center gap-2 cursor-pointer" value="fixed" title="Fijo">
                                                    <Layers className="w-4 h-4" />
                                                    <span className="text-xs">Fija</span>
                                                </TabsTrigger>
                                            </TabsList>

                                            <div className="space-y-4">
                                                {mode === "ranges" && (
                                                    <div className="text-sm text-zinc-500">
                                                        <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Modo Rangos</p>
                                                        <p>Haz clic en las tijeras entre las páginas para crear nuevos grupos.</p>

                                                        {getRangeGroups().length > 0 && (
                                                            <div className="mt-6 space-y-2">
                                                                <p className="text-sm mb-4 font-semibold text-zinc-700 dark:text-zinc-300">
                                                                    Grupos a crear ({getRangeGroups().length}):
                                                                </p>
                                                                <div className="space-y-1.5">
                                                                    {getRangeGroups().map((group, index) => (
                                                                        <div
                                                                            key={index}
                                                                            className="flex items-center gap-2 p-2 bg-white dark:bg-zinc-900 rounded-md border border-zinc-200 dark:border-zinc-700 group/item hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
                                                                        >
                                                                            <div className={`w-2 h-2 rounded-full ${group.color} shrink-0`} />
                                                                            <span className="text-xs font-medium text-zinc-700 dark:text-zinc-300 min-w-[60px]">
                                                                                Archivo {index + 1}:
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
                                                            <p className="text-sm mb-4 font-semibold">Páginas por archivo</p>
                                                            <Input
                                                                type="number"
                                                                min={1}
                                                                max={numPages}
                                                                value={fixedSize}
                                                                onChange={(e) => setFixedSize(parseInt(e.target.value) || 1)}
                                                            />
                                                        </div>

                                                        <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
                                                            Se crearán <strong>{Math.ceil(numPages / fixedSize)}</strong> archivos de <strong>{fixedSize}</strong> páginas cada uno (aprox).
                                                        </div>

                                                    </div>
                                                )}
                                            </div>
                                        </Tabs>

                                        <div className="py-4 border-t border-zinc-200 dark:border-zinc-800">
                                            <Button
                                                className="w-full cursor-pointer"
                                                size="lg"
                                                onClick={handlePreSubmit}
                                                disabled={isProcessing || (mode !== "fixed" && numPages === 0)}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : getIsZip() ? (
                                                    <Layers className="w-4 h-4 mr-2" />
                                                ) : (
                                                    <Download className="w-4 h-4 mr-2" />
                                                )}
                                                {isProcessing ? "Procesando..." : (getIsZip() ? "Dividir y Descargar ZIP" : "Dividir y Descargar PDF")}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
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

                            {/* Right Panel: Preview Grid */}
                            <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
                                {numPages > 0 ? (
                                    <SplitGrid
                                        file={file}
                                        numPages={numPages}
                                        mode={mode}
                                        ranges={ranges}
                                        fixedSize={fixedSize}
                                        onRangeClick={handleRangeClick}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-zinc-400">
                                        <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                        <p>Cargando vista previa...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
