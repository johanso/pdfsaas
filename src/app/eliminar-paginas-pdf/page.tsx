"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, Loader2, Trash2, X, RotateCw, CheckSquare } from "lucide-react";
import { toast } from "sonner";
import { pdfjs } from "react-pdf";
import { SortablePageGrid } from "@/components/sortable-page-grid";

// Types
interface PageData {
    id: string;
    originalIndex: number;
    rotation: number;
    file: File;
}

export default function DeletePagesPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageData[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (newFile: File) => {
        if (newFile.type !== "application/pdf") {
            toast.error("Por favor sube un archivo PDF válido.");
            return;
        }
        setFile(newFile);
        setSelectedIds([]);
        setPages([]);

        try {
            // Import pdfjs dynamically
            const { pdfjs } = await import("react-pdf");
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await newFile.arrayBuffer();
            const pdf = await pdfjs.getDocument(buffer).promise;

            // Create page data objects
            const newPages: PageData[] = [];
            for (let i = 1; i <= pdf.numPages; i++) {
                newPages.push({
                    id: crypto.randomUUID(),
                    originalIndex: i,
                    rotation: 0,
                    file: newFile
                });
            }
            setPages(newPages);

        } catch (error) {
            console.error(error);
            toast.error("Error al leer el PDF.");
            setFile(null);
        }
    };

    const onDrop = (e: React.DragEvent) => {
        e.preventDefault();
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            if (e.dataTransfer.files.length > 1) {
                toast.warning("Solo se permite un archivo a la vez. Se usará el primero.");
            }
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    };

    const handleToggle = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(pid => pid !== id) : [...prev, id]
        );
    };

    const handleRotate = (id: string) => {
        setPages(prev => prev.map(p =>
            p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
        ));
    };

    const handleReorder = (newPages: PageData[]) => {
        setPages(newPages);
    };

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(pages.map(p => p.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSubmit = async () => {
        if (!file || pages.length === 0) return;

        // Filter out deleted pages (those in selectedIds)
        const activePages = pages.filter(p => !selectedIds.includes(p.id));

        if (activePages.length === 0) {
            toast.error("No puedes eliminar todas las páginas.");
            return;
        }

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            // Prepare instructions: list of { originalIndex, rotation } in the desired ORDER
            // Note: originalIndex in pages is 1-based, backend likely expects 0-based if we are standardized, 
            // OR we send 1-based and handle there. Let's send 0-based to be safe and consistent with previous "Delete" logic potentially.
            // Previous logic was "page indices to delete".
            // NEW logic is "page instructions to keep".

            const pageInstructions = activePages.map(p => ({
                originalIndex: p.originalIndex - 1, // 0-based
                rotation: p.rotation
            }));

            formData.append("pageInstructions", JSON.stringify(pageInstructions));

            const response = await fetch("/api/delete-pages", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const data = await response.json();
                throw new Error(data.error || "Failed to process PDF");
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `modified-${file.name}`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("¡PDF procesado correctamente!");

        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Error al procesar el PDF";
            toast.error(msg);
        } finally {
            setIsProcessing(false);
        }
    };

    return (
        <div className="container mx-auto py-10 px-4 max-w-6xl">
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Organizar y Eliminar Páginas</h1>
                        <p className="text-zinc-500">Reordena páginas, rota o elimina las que no necesites permenentemente.</p>
                    </div>
                </div>

                <Input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                />

                {!file ? (
                    <div
                        onDrop={onDrop}
                        onDragOver={(e) => e.preventDefault()}
                        className="border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-12 flex flex-col items-center justify-center bg-zinc-50/50 dark:bg-zinc-900/50 hover:bg-zinc-100/50 transition-colors cursor-pointer h-80"
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="bg-white dark:bg-zinc-800 p-4 rounded-full mb-6 shadow-sm">
                            <FileUp className="w-10 h-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold mb-2">Sube tu archivo PDF</h3>
                        <p className="text-zinc-500 text-center max-w-sm">
                            Arrastra y suelta tu archivo aquí o haz clic para explorar.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Toolbar */}
                        <div className="sticky top-0 z-30 bg-background/80 backdrop-blur-md p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4 w-full md:w-auto">
                                <Button variant="ghost" size="icon" onClick={() => setFile(null)}>
                                    <X className="w-5 h-5" />
                                </Button>
                                <div className="font-medium truncate max-w-[200px]" title={file.name}>
                                    {file.name}
                                </div>
                                <div className="text-sm text-zinc-500 px-2 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                                    {pages.length} páginas
                                </div>
                            </div>

                            <div className="flex items-center gap-2 w-full md:w-auto">
                                <div className="flex items-center gap-2 mr-4">
                                    <span className="text-sm text-zinc-500">
                                        {selectedIds.length} seleccionadas para eliminar
                                    </span>
                                </div>

                                <Button
                                    className="bg-primary hover:bg-primary/90"
                                    onClick={handleSubmit}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                                    Procesar y Descargar
                                </Button>
                            </div>
                        </div>

                        {/* Pages Grid */}
                        <SortablePageGrid
                            pages={pages}
                            selectedIds={selectedIds}
                            onReorder={handleReorder}
                            onToggle={handleToggle}
                            onRotate={handleRotate}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
