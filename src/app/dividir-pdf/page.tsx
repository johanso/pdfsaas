"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, Loader2, Download, Scissors, FileOutput, Layers } from "lucide-react";
import { toast } from "sonner";

import { SplitGrid } from "./split-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";

// Configure worker inside component or effect to avoid SSR issues
// pdfjs.GlobalWorkerOptions.workerSrc = ... moved to useEffect

export default function SplitPdfPage() {
    // File State
    const [file, setFile] = useState<File | null>(null);
    const [numPages, setNumPages] = useState<number>(0);
    const [isProcessing, setIsProcessing] = useState(false);

    // Mode State
    const [mode, setMode] = useState<"ranges" | "extract" | "fixed">("ranges");

    // Mode Specific Data
    const [ranges, setRanges] = useState<number[]>([]); // Split AFTER these page numbers
    const [selectedPages, setSelectedPages] = useState<number[]>([]);
    const [extractMode, setExtractMode] = useState<"separate" | "merge">("separate");
    const [fixedSize, setFixedSize] = useState<number>(2);
    const [showSaveDialog, setShowSaveDialog] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

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
        setSelectedPages([]);
        setFixedSize(2);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const f = e.target.files[0];
            if (f.type !== "application/pdf") {
                toast.error("Por favor selecciona un archivo PDF válido");
                return;
            }
            // Reset previous state then set new file
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

    const handleExtractClick = (pageNumber: number) => {
        setSelectedPages(prev => {
            if (prev.includes(pageNumber)) {
                return prev.filter(p => p !== pageNumber).sort((a, b) => a - b);
            } else {
                return [...prev, pageNumber].sort((a, b) => a - b);
            }
        });
    };

    const getIsZip = () => {
        if (mode === "ranges") return ranges.length > 0;
        if (mode === "extract") return extractMode === "separate" && selectedPages.length > 1;
        if (mode === "fixed") return Math.ceil(numPages / fixedSize) > 1;
        return false;
    };

    const handlePreSubmit = () => {
        if (!file) return;

        // Validation
        if (mode === "ranges" && ranges.length === 0) {
            toast.error("Define al menos un punto de división");
            return;
        }
        if (mode === "extract" && selectedPages.length === 0) {
            toast.error("Selecciona al menos una página para extraer");
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
            } else if (mode === "extract") {
                config = { pages: selectedPages, merge: extractMode === "merge" };
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
        <div className="container mx-auto py-10 px-4 max-w-6xl min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Dividir PDF</h1>
                    <p className="text-zinc-500 dark:text-zinc-400">Herramienta profesional para separar, extraer y organizar tus documentos.</p>
                </div>
            </div>

            {!file ? (
                // Upload State
                <div
                    className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 transition-colors cursor-pointer h-80"
                    onClick={() => fileInputRef.current?.click()}
                >
                    <Input
                        type="file"
                        accept="application/pdf"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileSelect}
                    />
                    <div className="bg-white dark:bg-zinc-800 p-4 rounded-full mb-6 shadow-sm">
                        <FileUp className="w-10 h-10 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Selecciona un archivo PDF</h3>
                    <p className="text-zinc-500 text-center max-w-sm">
                        Haz clic para explorar tus archivos. Solo se permite un archivo a la vez para esta herramienta.
                    </p>
                </div>
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
                                        <TabsList className="grid w-full grid-cols-3 mb-4">
                                            <TabsTrigger value="ranges" title="Por Rangos"><Scissors className="w-4 h-4" /></TabsTrigger>
                                            <TabsTrigger value="extract" title="Extraer"><FileOutput className="w-4 h-4" /></TabsTrigger>
                                            <TabsTrigger value="fixed" title="Fijo"><Layers className="w-4 h-4" /></TabsTrigger>
                                        </TabsList>

                                        <div className="space-y-4">
                                            {mode === "ranges" && (
                                                <div className="text-sm text-zinc-500">
                                                    <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Modo Rangos</p>
                                                    <p>Haz clic en las tijeras entre las páginas para crear nuevos grupos.</p>
                                                    <div className="mt-4 p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs">
                                                        Grupos actuales: <strong>{ranges.length + 1}</strong>
                                                    </div>
                                                </div>
                                            )}

                                            {mode === "extract" && (
                                                <div className="space-y-4">
                                                    <div className="text-sm text-zinc-500">
                                                        <p className="mb-2 font-medium text-zinc-900 dark:text-zinc-100">Modo Extracción</p>
                                                        <p>Selecciona las páginas que deseas conservar.</p>
                                                    </div>

                                                    <div className="space-y-2">
                                                        <p className="text-sm mb-4 font-semibold">Opciones de salida</p>
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant={extractMode === "separate" ? "default" : "outline"}
                                                                size="sm"
                                                                className="flex-1 text-xs"
                                                                onClick={() => setExtractMode("separate")}
                                                            >
                                                                Separados
                                                            </Button>
                                                            <Button
                                                                variant={extractMode === "merge" ? "default" : "outline"}
                                                                size="sm"
                                                                className="flex-1 text-xs"
                                                                onClick={() => setExtractMode("merge")}
                                                            >
                                                                Unir en Uno
                                                            </Button>
                                                        </div>
                                                    </div>
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
                                                        Total archivos resultantes: <strong>{Math.ceil(numPages / fixedSize)}</strong>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </Tabs>

                                    <div className="py-4 border-t border-zinc-100 dark:border-zinc-800">
                                        <Button
                                            className="w-full"
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
                                            {isProcessing ? "Procesando..." : (getIsZip() ? "Descargar ZIP" : "Descargar PDF")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        <SaveDialog
                            open={showSaveDialog}
                            onOpenChange={setShowSaveDialog}
                            defaultName={file.name.replace(".pdf", "") + (mode === "ranges" ? "-split" : mode === "extract" ? "-extract" : "-fixed")}
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
                                    selectedPages={selectedPages}
                                    fixedSize={fixedSize}
                                    onRangeClick={handleRangeClick}
                                    onExtractClick={handleExtractClick}
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
    );
}
