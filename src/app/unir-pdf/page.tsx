"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { PdfFile } from "@/types";
import { SortableGrid } from "@/components/sortable-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { PdfActionBar } from "@/components/pdf-action-bar";
import { SaveDialog } from "@/components/save-dialog";

export default function UnirPdfPage() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (newFiles: File[]) => {
        const pdfFiles = newFiles.filter(f => f.type === "application/pdf");

        if (pdfFiles.length < newFiles.length) {
            toast.error("Algunos archivos no eran PDF y fueron ignorados.");
        }

        if (pdfFiles.length === 0) return;

        const mappedFiles = pdfFiles.map(f => ({
            id: crypto.randomUUID(),
            file: f,
            name: f.name,
            rotation: 0
        }));

        setFiles(prev => [...prev, ...mappedFiles]);
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files) {
            handleFiles(Array.from(e.dataTransfer.files));
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(Array.from(e.target.files));
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

    const handleRotateAll = () => {
        setFiles(files.map(f => ({ ...f, rotation: (f.rotation + 90) % 360 })));
    };

    const handleSort = () => {
        setFiles([...files].sort((a, b) => a.name.localeCompare(b.name)));
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
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Unir PDF</h1>
                        <p className="text-zinc-500">Combina múltiples archivos PDF en un solo documento ordenado.</p>
                    </div>
                </div>

                <Input
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                {files.length === 0 ? (
                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 transition-colors cursor-pointer h-80"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-full mb-6 shadow-sm">
                            <FileUp className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sube tus archivos PDF</h3>
                        <p className="text-zinc-500 text-center max-w-sm">
                            Arrastra y suelta tus archivos aquí o haz clic para explorar. Puedes seleccionar múltiples archivos.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <PdfToolbar
                            title={`${files.length} Archivos seleccionados`}
                            subtitle={files.reduce((acc, f) => acc + f.file.size, 0) > 0 ? `${(files.reduce((acc, f) => acc + f.file.size, 0) / 1024 / 1024).toFixed(2)} MB total` : undefined}
                            onAdd={() => fileInputRef.current?.click()}
                            onRotateAll={handleRotateAll}
                            onSort={handleSort}
                            onReset={() => setFiles([])}
                            showAddButton={true}
                        />

                        <SortableGrid
                            files={files}
                            onReorder={handleReorder}
                            onRotate={handleRotate}
                            onRemove={handleRemove}
                        />

                        <PdfActionBar
                            infoText={`${files.length} documentos listos para unir`}
                            actionButton={
                                <Button
                                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    size="lg"
                                    onClick={() => setIsDialogOpen(true)}
                                    disabled={files.length < 2 || isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                                    Procesar y Descargar
                                </Button>
                            }
                        />

                        <SaveDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            defaultName="merged-document"
                            onSave={handleSubmit}
                            isProcessing={isProcessing}
                            title="Guardar archivo"
                            description="Asigna un nombre a tu archivo PDF fusionado antes de descargarlo."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
