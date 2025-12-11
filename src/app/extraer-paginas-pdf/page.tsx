"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Download, FileOutput } from "lucide-react";
import { toast } from "sonner";
import { HeadingPage } from "@/components/ui/heading-page";
import { Dropzone } from "@/components/ui/dropzone";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { PdfPageGrid } from "@/components/pdf-page-grid";
import { SaveDialog } from "@/components/save-dialog";

export default function ExtractPdfPage() {
    // File State
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mode State
    // extractMode: 'separate' = zip with individual pages, 'merge' = single new pdf
    const [extractMode, setExtractMode] = useState<"separate" | "merge">("separate");
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
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
        setSelectedPages([]);
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

    // Selection Handlers
    const handleTogglePage = (pageNumber: number) => {
        setSelectedPages(prev => {
            if (prev.includes(pageNumber)) {
                return prev.filter(p => p !== pageNumber).sort((a, b) => a - b);
            } else {
                return [...prev, pageNumber].sort((a, b) => a - b);
            }
        });
    };

    const handleSelectAll = () => {
        if (numPages === 0) return;
        const all = Array.from({ length: numPages }, (_, i) => i + 1);
        setSelectedPages(all);
        toast.info("Todas las páginas seleccionadas");
    };

    const handleDeselectAll = () => {
        setSelectedPages([]);
        toast.info("Selección limpiada");
    };

    const handleInvertSelection = () => {
        if (numPages === 0) return;
        const all = Array.from({ length: numPages }, (_, i) => i + 1);
        setSelectedPages(prev => {
            const newSelection = all.filter(p => !prev.includes(p));
            return newSelection;
        });
        toast.info("Selección invertida");
    };


    const handlePreSubmit = () => {
        if (!file) return;
        if (selectedPages.length === 0) {
            toast.error("Selecciona al menos una página para extraer");
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
            formData.append("mode", "extract");

            const config = {
                pages: selectedPages,
                merge: extractMode === "merge"
            };
            formData.append("config", JSON.stringify(config));

            const response = await fetch("/api/split-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Error extracting pages");
            }

            // Handle Download
            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = downloadUrl;

            // Determine filename extension
            const ext = blob.type === "application/zip" ? "zip" : "pdf";
            a.download = `${fileName}.${ext}`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);

            toast.success("¡Páginas extraídas correctamente!");

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
                    titlePage="Extraer Páginas PDF"
                    descriptionPage="Selecciona las páginas que quieres conservar y crea un nuevo PDF o descárgalas por separado."
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
                            onSelectAll={handleSelectAll}
                            onDeselectAll={handleDeselectAll}
                            onInvertSelection={handleInvertSelection}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Left Panel: Controls */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card className="sticky top-24">
                                    <CardContent className="space-y-6 pt-4">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium mb-2 flex items-center gap-2">
                                                    <FileOutput className="w-4 h-4 text-primary" />
                                                    Opciones de Salida
                                                </h3>
                                                <p className="text-sm text-zinc-500 mb-4">
                                                    Elige cómo quieres recibir tus páginas extraídas.
                                                </p>

                                                <div className="flex flex-col gap-2">
                                                    <Button
                                                        variant={extractMode === "separate" ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setExtractMode("separate")}
                                                        className="cursor-pointer"
                                                    >
                                                        Separar páginas (ZIP)
                                                    </Button>
                                                    <Button
                                                        variant={extractMode === "merge" ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setExtractMode("merge")}
                                                        className="cursor-pointer"
                                                    >
                                                        Fusionar en un nuevo PDF
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Páginas a extraer:</span>
                                                    <span className="font-bold">{selectedPages.length}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>De un total de:</span>
                                                    <span className="font-bold">{numPages}</span>
                                                </div>
                                            </div>

                                            <div className="text-xs">
                                                {
                                                    extractMode === "separate" ? (
                                                        <p>
                                                            {selectedPages.length === 1
                                                                ? "Se descargará un archivo PDF con la página seleccionada."
                                                                : "Se descargará un archivo .zip con las páginas seleccionadas de forma independiente."
                                                            }
                                                        </p>
                                                    ) : (
                                                        <p>Se creará un único documento PDF con las <strong>{selectedPages.length}</strong> páginas seleccionadas.</p>
                                                    )
                                                }
                                            </div>
                                        </div>

                                        <div className="py-4 border-t border-zinc-200 dark:border-zinc-800">
                                            <Button
                                                className="w-full bg-red-500 hover:bg-red-600 cursor-pointer disabled:bg-red-600 disabled:hover:bg-red-600 disabled:cursor-not-allowed"
                                                size="lg"
                                                onClick={handlePreSubmit}
                                                disabled={isProcessing || selectedPages.length === 0}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <Download className="w-4 h-4 mr-2" />
                                                )}
                                                {isProcessing ? "Procesando..." : extractMode === "separate" && selectedPages.length > 1 ? "Descargar ZIP" : "Descargar PDF"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <SaveDialog
                                open={showSaveDialog}
                                onOpenChange={setShowSaveDialog}
                                defaultName={file.name.replace(".pdf", "") + "-extract"}
                                onSave={handleSubmit}
                                isProcessing={isProcessing}
                                title={extractMode === "separate" ? "Guardar archivo ZIP" : "Guardar archivo PDF"}
                                description={extractMode === "separate"
                                    ? "Asigna un nombre a tu archivo comprimido."
                                    : "Asigna un nombre a tu nuevo archivo PDF."
                                }
                                extension={extractMode === "separate" ? "zip" : "pdf"}
                            />

                            {/* Right Panel: Preview Grid */}
                            <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
                                {numPages > 0 ? (
                                    <PdfPageGrid
                                        file={file}
                                        numPages={numPages}
                                        selectedPages={selectedPages}
                                        onTogglePage={handleTogglePage}
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
