"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { pdfjs } from "react-pdf";
import { SortablePageGrid } from "@/components/sortable-page-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { PdfActionBar } from "@/components/pdf-action-bar";
import { SaveDialog } from "@/components/save-dialog";

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
    const [rangeInput, setRangeInput] = useState("");

    // Save Dialog State
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFile = async (newFile: File) => {
        if (newFile.type !== "application/pdf") {
            toast.error("Por favor sube un archivo PDF válido.");
            return;
        }
        setFile(newFile);
        setSelectedIds([]);
        setPages([]);
        setRangeInput("");

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

    const handleRotateAll = () => {
        setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 })));
    };

    const handleReorder = (newPages: PageData[]) => {
        setPages(newPages);
    };

    const handleRangeChange = (input: string) => {
        setRangeInput(input);

        if (!input.trim()) return;

        const idsToSelect: string[] = [];
        const parts = input.split(",");

        // Map originalIndex to ID for easier lookup
        const indexToIdMap = new Map(pages.map(p => [p.originalIndex, p.id]));
        const numPages = pages.length; // Actually map size

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

    const handleSave = async (outputName: string) => {
        if (!file) return;

        const activePages = pages.filter(p => !selectedIds.includes(p.id));

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

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
            a.download = `${outputName}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

            toast.success("¡PDF procesado correctamente!");
            setIsDialogOpen(false);

        } catch (error) {
            console.error(error);
            const msg = error instanceof Error ? error.message : "Error al procesar el PDF";
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
                        {/* Shared Toolbar with Range Input */}
                        <PdfToolbar
                            title={file.name}
                            subtitle={`${pages.length} páginas`}
                            onAdd={() => { }} // Disabled for single file tools or hidden
                            showAddButton={false}
                            onRotateAll={handleRotateAll} // Keep rotate all if user wants
                            onReset={() => setFile(null)}
                        >
                            <div className="flex items-center gap-2 mr-4 min-w-[200px]">
                                <span className="text-xs text-zinc-500 whitespace-nowrap">Eliminar:</span>
                                <Input
                                    className="h-8 text-xs bg-white dark:bg-zinc-900"
                                    placeholder="Ej: 1, 3-5"
                                    value={rangeInput}
                                    onChange={(e) => handleRangeChange(e.target.value)}
                                />
                            </div>
                        </PdfToolbar>

                        {/* Pages Grid */}
                        <SortablePageGrid
                            pages={pages}
                            selectedIds={selectedIds}
                            onReorder={handleReorder}
                            onToggle={handleToggle}
                            onRotate={handleRotate}
                        />

                        {/* Shared Action Bar */}
                        <PdfActionBar
                            infoText={
                                <span className={selectedIds.length > 0 ? "text-red-500 font-medium" : ""}>
                                    {selectedIds.length > 0
                                        ? `${selectedIds.length} páginas seleccionadas para eliminar`
                                        : "Selecciona las páginas que deseas eliminar"
                                    }
                                </span>
                            }
                            actionButton={
                                <Button
                                    className="bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
                                    size="lg"
                                    onClick={handleOpenSaveDialog}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                                    Procesar y Descargar
                                </Button>
                            }
                        />

                        <SaveDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            defaultName={`modified-${file.name.replace(".pdf", "")}`}
                            onSave={handleSave}
                            isProcessing={isProcessing}
                            title="Guardar archivo"
                            description="Asigna un nombre a tu nuevo archivo PDF."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
