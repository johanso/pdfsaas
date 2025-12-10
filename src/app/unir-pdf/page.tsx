"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileUp, GripVertical, Loader2 } from "lucide-react";
import { HeadingPage } from "@/components/ui/heading-page";
import { toast } from "sonner";
import { PdfFile } from "@/types";
import { SortableGrid } from "@/components/sortable-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { Dropzone } from "@/components/ui/dropzone";
import { SaveDialog } from "@/components/save-dialog";

export default function UnirPdfPage() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = async (newFiles: File[]) => {
        const pdfFiles = newFiles.filter(f => f.type === "application/pdf");

        if (pdfFiles.length < newFiles.length) {
            toast.error("Algunos archivos no eran PDF y fueron ignorados.");
        }

        if (pdfFiles.length === 0) return;

        // Extract page counts for each PDF
        const mappedFilesPromises = pdfFiles.map(async (f) => {
            let pageCount: number | undefined;
            try {
                const { pdfjs } = await import("react-pdf");
                pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

                const buffer = await f.arrayBuffer();
                const pdf = await pdfjs.getDocument(buffer).promise;
                pageCount = pdf.numPages;
            } catch (error) {
                console.error("Error extracting page count:", error);
                // pageCount remains undefined if extraction fails
            }

            return {
                id: crypto.randomUUID(),
                file: f,
                name: f.name,
                rotation: 0,
                pageCount
            };
        });

        const mappedFiles = await Promise.all(mappedFilesPromises);

        setFiles(prev => [...prev, ...mappedFiles]);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };



    const handleRotate = (id: string) => {
        setFiles(files.map(f => {
            if (f.id === id) {
                return { ...f, rotation: (f.rotation + 90) % 360 };
            }
            return f;
        }));
    };

    const handleSortAZ = () => {
        setFiles([...files].sort((a, b) => a.name.localeCompare(b.name)));
    };

    const handleSortZA = () => {
        setFiles([...files].sort((a, b) => b.name.localeCompare(a.name)));
    };

    const handleRemove = (id: string) => {
        setFiles(files.filter(f => f.id !== id));
    };

    const handleReorder = (newFiles: PdfFile[]) => {
        setFiles(newFiles);
    };

    const handleSubmit = async (outputName: string) => {
        if (files.length < 2) {
            toast.error("Por favor sube al menos 2 archivos para unir.");
            return;
        }

        setIsProcessing(true);

        try {
            const formData = new FormData();

            files.forEach((f, index) => {
                formData.append("files", f.file);
            });

            // Note: If rotations are needed by backend, they should be sent here.
            // Currently assuming standard merge without rotation support in backend unless updated.

            const response = await fetch("/api/merge-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Merge failed");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `${outputName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            setIsDialogOpen(false);
            toast.success("¡PDF unido correctamente!");
            setFiles([]);

        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Error al unir los PDFs";
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
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
                                subtitle={files.reduce((acc, f) => acc + f.file.size, 0) > 0 ? `${(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB total` : undefined}
                                onAdd={() => fileInputRef.current?.click()}
                                onSortAZ={handleSortAZ}
                                onSortZA={handleSortZA}
                                onReset={() => setFiles([])}
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
                                                        <span>Total páginas:</span>
                                                        <span className="font-bold">
                                                            {files.reduce((acc, f) => acc + (f.pageCount || 0), 0)}
                                                        </span>
                                                    </div>
                                                    <div className="flex justify-between">
                                                        <span>Tamaño total:</span>
                                                        <span className="font-bold">
                                                            {(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                                <Button
                                                    className="w-full cursor-pointer"
                                                    size="lg"
                                                    onClick={() => setIsDialogOpen(true)}
                                                    disabled={files.length < 2 || isProcessing}
                                                >
                                                    {isProcessing ? (
                                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                    ) : (
                                                        <FileUp className="w-4 h-4 mr-2" />
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
                                <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
                                    <SortableGrid
                                        files={files}
                                        onReorder={handleReorder}
                                        onRotate={handleRotate}
                                        onRemove={handleRemove}
                                        showRotate={false}
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
