"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FileUp, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { pdfjs } from "react-pdf";
import { SortablePageGrid } from "@/components/sortable-page-grid";
import { PdfToolbar } from "@/components/pdf-toolbar";
import { PdfActionBar } from "@/components/pdf-action-bar";
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

export default function RotatePdfPage() {
    const [file, setFile] = useState<File | null>(null);
    const [pages, setPages] = useState<PageData[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleFile = async (newFile: File) => {
        if (newFile.type !== "application/pdf") {
            toast.error("Por favor sube un archivo PDF válido.");
            return;
        }
        setFile(newFile);
        setPages([]);

        try {
            const { pdfjs } = await import("react-pdf");
            pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

            const buffer = await newFile.arrayBuffer();
            const pdf = await pdfjs.getDocument(buffer).promise;

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

    // Rotation Handlers
    const handleRotate = (id: string) => {
        setPages(prev => prev.map(p =>
            p.id === id ? { ...p, rotation: (p.rotation + 90) % 360 } : p
        ));
    };

    const handleRotateRight = () => {
        setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation + 90) % 360 })));
        toast.success("Documento rotado a la derecha");
    };

    const handleRotateLeft = () => {
        setPages(prev => prev.map(p => ({ ...p, rotation: (p.rotation - 90 + 360) % 360 })));
        toast.success("Documento rotado a la izquierda");
    };

    const handleResetRotation = () => {
        setPages(prev => prev.map(p => ({ ...p, rotation: 0 })));
        toast.info("Rotación restablecida");
    };

    const handleReorder = (newPages: PageData[]) => {
        setPages(newPages);
    };

    const handleSave = async (outputName: string) => {
        if (!file) return;

        setIsProcessing(true);
        try {
            const formData = new FormData();
            formData.append("file", file);

            const pageInstructions = pages.map(p => ({
                originalIndex: p.originalIndex - 1,
                rotation: p.rotation
            }));

            formData.append("pageInstructions", JSON.stringify(pageInstructions));

            // Reuse delete-pages API or create rotate specific?
            // Since logic is identical (reconstruct PDF from indices with rotation), we can create a dedicated route for clarity.
            const response = await fetch("/api/rotate-pdf", {
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

            toast.success("¡PDF rotado correctamente!");
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
                    titlePage="Rotar PDF"
                    descriptionPage="Rota tus archivos PDF permanentemente. Gira todo el documento o páginas específicas."
                />

                {!file ? (
                    <Dropzone
                        onFilesSelected={handleFilesSelected}
                        multiple={false}
                        className="h-80 bg-zinc-50/50 dark:bg-zinc-900/50"
                    />
                ) : (
                    <div className="space-y-6">
                        <PdfToolbar
                            title={file.name}
                            subtitle={`${pages.length} páginas`}
                            onAdd={() => { }}
                            showAddButton={false}
                            onRotateRight={handleRotateRight}
                            onRotateLeft={handleRotateLeft}
                            onResetRotation={handleResetRotation}
                            onReset={() => setFile(null)}
                        />

                        {/* Reuse SortablePageGrid but ignore toggle/selection since we just rotate */}
                        <SortablePageGrid
                            pages={pages}
                            selectedIds={[]} // No selection needed for rotation
                            onReorder={handleReorder} // Allow reorder if they want, or disable? UX: "Rotate PDF" usually allows organizing too.
                            onToggle={() => { }} // No toggle needed
                            onRotate={handleRotate}
                        />

                        <PdfActionBar
                            infoText="¿Todo listo? Guarda tu nuevo PDF"
                            actionButton={
                                <Button
                                    className="bg-primary hover:bg-primary/90"
                                    size="lg"
                                    onClick={() => setIsDialogOpen(true)}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileUp className="w-4 h-4 mr-2" />}
                                    Guardar PDF Rotado
                                </Button>
                            }
                        />

                        <SaveDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            defaultName={`rotated-${file.name.replace(".pdf", "")}`}
                            onSave={handleSave}
                            isProcessing={isProcessing}
                            title="Guardar archivo"
                            description="Asigna un nombre a tu archivo PDF rotado."
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
