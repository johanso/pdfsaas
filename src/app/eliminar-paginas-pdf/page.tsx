"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileUp, Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { pdfjs } from "react-pdf";
import { SortablePageGrid } from "@/components/sortable-page-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { SaveDialog } from "@/components/save-dialog";
import { Dropzone } from "@/components/ui/dropzone";
import { HeadingPage } from "@/components/ui/heading-page";

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



    const handleFilesSelected = (files: File[]) => {
        if (files.length > 0) {
            handleFile(files[0]);
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

                <HeadingPage
                    titlePage={"Eliminar Páginas PDF"}
                    descriptionPage="Reordena páginas, rota o elimina las que no necesites permenentemente."
                />

                {!file ? (
                    <Dropzone
                        onFilesSelected={handleFilesSelected}
                        multiple={false}
                        className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
                    />
                ) : (
                    <div className="space-y-6">
                        {/* Shared Toolbar */}
                        <PdfToolbar
                            title={file.name}
                            subtitle={`${pages.length} páginas`}
                            onAdd={() => { }} // Disabled for single file tools or hidden
                            showAddButton={false}
                            onReset={() => setFile(null)}
                        />

                        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                            {/* Left Panel: Instructions & Download */}
                            <div className="lg:col-span-1 space-y-6">
                                <Card>
                                    <CardContent className="space-y-6 pt-6">
                                        <div className="space-y-4">
                                            <div>
                                                <h3 className="font-medium mb-2 flex items-center gap-2">
                                                    <Trash2 className="w-4 h-4 text-primary" />
                                                    Cómo usar
                                                </h3>
                                                <ol className="text-sm text-zinc-600 dark:text-zinc-400 space-y-2 list-decimal list-inside">
                                                    <li>Selecciona las páginas que deseas eliminar</li>
                                                    <li>Usa el campo de rango para selección rápida (ej: 1,3-5)</li>
                                                    <li>Haz clic en "Descargar" para guardar el PDF modificado</li>
                                                </ol>
                                            </div>

                                            <div className="space-y-2">
                                                <label className="text-xs text-zinc-500">Eliminar páginas:</label>
                                                <Input
                                                    className="h-9 text-sm bg-white dark:bg-zinc-900"
                                                    placeholder="Ej: 1, 3-5"
                                                    value={rangeInput}
                                                    onChange={(e) => handleRangeChange(e.target.value)}
                                                />
                                            </div>

                                            <div className="p-3 bg-zinc-100 dark:bg-zinc-800 rounded-lg text-xs space-y-1">
                                                <div className="flex justify-between">
                                                    <span>Seleccionadas:</span>
                                                    <span className={`font-bold ${selectedIds.length > 0 ? 'text-red-500' : ''}`}>
                                                        {selectedIds.length}
                                                    </span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span>Total páginas:</span>
                                                    <span className="font-bold">{pages.length}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="py-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <Button
                                                className="w-full"
                                                size="lg"
                                                onClick={handleOpenSaveDialog}
                                                disabled={isProcessing}
                                            >
                                                {isProcessing ? (
                                                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                                ) : (
                                                    <FileUp className="w-4 h-4 mr-2" />
                                                )}
                                                {isProcessing ? "Procesando..." : "Descargar"}
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>

                            <SaveDialog
                                open={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                                defaultName={`modified-${file.name.replace(".pdf", "")}`}
                                onSave={handleSave}
                                isProcessing={isProcessing}
                                title="Guardar archivo"
                                description="Asigna un nombre a tu nuevo archivo PDF."
                            />

                            {/* Right Panel: Pages Grid */}
                            <div className="lg:col-span-3 bg-zinc-50/50 dark:bg-zinc-900/20 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-xl p-6 min-h-[500px]">
                                <SortablePageGrid
                                    pages={pages}
                                    selectedIds={selectedIds}
                                    onReorder={handleReorder}
                                    onToggle={handleToggle}
                                    onRotate={handleRotate}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
