"use client";

import { useState, useRef } from "react";
// import { useDropzone } from "react-dropzone"; // Unused
// Let's us native drag events for upload to avoid extra deps if not needed, or just standard input.
// Actually, dnd-kit is for reordering. For uploading, I should check if I missed installing a dropzone lib.
// The user prompt said: "Drag & Drop: @dnd-kit/core...". It didn't explicitly say "react-dropzone".
// But "Subir: Cargar múltiples archivos PDF mediante Drag & Drop o explorador" implies a dropzone.
// I can implement a simple one.

import { PdfFile } from "@/types";
import { SortableGrid } from "@/components/sortable-grid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, FileUp, Download, Loader2, Plus, RotateCw, ArrowDownAZ, Trash2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
// import { v4 as uuidv4 } from "uuid"; // Unused
// I'll use simple random string generator to avoid extra deps if possible, or just install uuid.
// Let's use crypto.randomUUID() if available (modern browsers) or simple fallback.

export default function MergePdfPage() {
    const [files, setFiles] = useState<PdfFile[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [outputName, setOutputName] = useState("merged-document");
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFiles = (newFiles: File[]) => {
        const pdfFiles = newFiles.
            filter(f => f.type === "application/pdf")
            .map(f => ({
                id: crypto.randomUUID(),
                file: f,
                name: f.name,
                rotation: 0
            }));
        setFiles(prev => [...prev, ...pdfFiles]);
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

    const handleSubmit = async () => {
        if (files.length === 0) return;
        setIsProcessing(true);

        try {
            const formData = new FormData();
            const metadata: Record<string, { rotation: number; index: number }> = {};

            files.forEach((f, index) => {
                formData.append("files", f.file);
                metadata[f.id] = { rotation: f.rotation, index };
            });

            const rotations = files.map(f => f.rotation);
            formData.append("rotations", JSON.stringify(rotations));

            const response = await fetch("/api/merge-pdf", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) throw new Error("Merge failed");

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

        } catch (error) {
            console.error(error);
            alert("Error merging PDFs");
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Unir PDF</h1>
                        <p className="text-zinc-500">Combina múltiples archivos PDF en un solo documento ordenado.</p>
                    </div>
                </div>

                {/* Hidden Input for Global Access */}
                <Input
                    type="file"
                    accept="application/pdf"
                    multiple
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                {files.length === 0 ? (
                    /* Initial Upload Area */
                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-8 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 transition-colors cursor-pointer h-64"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-full mb-4 shadow-sm">
                            <FileUp className="w-8 h-8 text-primary" />
                        </div>
                        <h3 className="text-lg font-semibold mb-1">Arrastra tus archivos PDF aquí</h3>
                        <p className="text-sm text-zinc-500 mb-6">o haz clic para explorar en tu dispositivo</p>
                    </div>
                ) : (
                    /* Global Toolbar & Grid */
                    <div className="space-y-4">
                        <Alert className="bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row items-center justify-between gap-4 py-4">
                            <div className="flex items-center gap-2">
                                <AlertTitle className="text-base font-semibold mb-0 flex items-center gap-2">
                                    <FileUp className="w-4 h-4" />
                                    {files.length} Archivos seleccionados
                                </AlertTitle>
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => fileInputRef.current?.click()}
                                >
                                    <Plus className="mr-2 h-4 w-4" /> Añadir
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleRotateAll}
                                >
                                    <RotateCw className="mr-2 h-4 w-4" /> Rotar todo
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSort}
                                >
                                    <ArrowDownAZ className="mr-2 h-4 w-4" /> Ordenar
                                </Button>
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => setFiles([])}
                                >
                                    <Trash2 className="mr-2 h-4 w-4" /> Limpiar
                                </Button>
                            </div>
                        </Alert>

                        <SortableGrid
                            files={files}
                            onReorder={handleReorder}
                            onRotate={handleRotate}
                            onRemove={handleRemove}
                        />

                        <div className="flex justify-end pt-6 border-t">
                            <Button
                                size="lg"
                                onClick={() => setIsDialogOpen(true)}
                                disabled={isProcessing}
                                className="w-full md:w-auto"
                            >
                                <Download className="mr-2 h-4 w-4" />
                                Unir y Descargar PDF
                            </Button>
                        </div>
                    </div>
                )}

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Guardar archivo</DialogTitle>
                            <DialogDescription>
                                Asigna un nombre a tu archivo PDF fusionado antes de descargarlo.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="name" className="text-right">
                                    Nombre
                                </Label>
                                <div className="col-span-3 flex items-center gap-2">
                                    <Input
                                        id="name"
                                        value={outputName}
                                        onChange={(e) => setOutputName(e.target.value)}
                                        className="col-span-3"
                                        placeholder="merged-document"
                                        suppressHydrationWarning
                                    />
                                    <span className="text-sm text-zinc-500">.pdf</span>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSubmit} disabled={isProcessing}>
                                {isProcessing ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Procesando...
                                    </>
                                ) : (
                                    "Descargar"
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

            </div>
        </div>
    );
}
