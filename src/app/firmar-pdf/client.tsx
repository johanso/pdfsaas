"use client";

import { useState, useCallback, useMemo, useEffect } from "react";
import { notify } from "@/lib/errors/notifications";
import dynamic from "next/dynamic";
import { DndContext, DragEndEvent, DragOverlay } from "@dnd-kit/core";

// UI Components
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Button } from "@/components/ui/button";
import { PenTool, Loader2, Plus, FileText, ChevronRight, Check } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignaturePad } from "@/components/pdf-system/signature-pad";
import { cn } from "@/lib/utils";
import { ScrollArea } from "@/components/ui/scroll-area";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { useSignPdf, Signature } from "@/hooks/useSignPdf";

// Dynamic Components
const PdfSignerEditorArea = dynamic(
    () => import("@/components/pdf-system/pdf-signer-editor").then((m) => m.PdfSignerEditorArea),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col items-center justify-center h-[600px] w-full bg-white/50 backdrop-blur-sm rounded-xl border border-dashed border-zinc-200">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="text-muted-foreground animate-pulse font-medium">Preparando visor de PDF...</p>
            </div>
        )
    }
);

export default function SignPdfClient() {
    const [activeFileId, setActiveFileId] = useState<string | null>(null);
    const [savedSignatures, setSavedSignatures] = useState<string[]>([]);
    const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
    const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);

    // Placed Signatures state PER FILE
    const [filesSignatures, setFilesSignatures] = useState<Record<string, any[]>>({});

    const { files, addFiles, removeFile, reset: resetFiles, isLoading: isFilesLoading } = usePdfFiles();
    const {
        isProcessing,
        isComplete,
        progress,
        phase,
        result,
        uploadStats,
        process: signPdf,
        handleDownloadAgain,
        handleStartNew,
        cancelOperation,
    } = useSignPdf();

    // Set first file as active when uploaded
    useEffect(() => {
        if (files.length > 0 && !activeFileId) {
            setActiveFileId(files[0].id);
        } else if (files.length === 0) {
            setActiveFileId(null);
        }
    }, [files, activeFileId]);

    const activePdfFile = useMemo(() => {
        return files.find(f => f.id === activeFileId) || null;
    }, [files, activeFileId]);

    // Handlers
    const handleFilesSelected = useCallback((newFiles: File[]) => {
        const pdfs = newFiles.filter(f => f.type === "application/pdf");
        if (pdfs.length === 0) {
            notify.error("Selecciona archivos PDF válidos");
            return;
        }
        addFiles(pdfs);
    }, [addFiles]);

    const handleCreateSignature = (dataUrl: string) => {
        setSavedSignatures(prev => [...prev, dataUrl]);
        setIsSignatureDialogOpen(false);
        notify.success("Firma creada y guardada");
    };

    const handleFinishSigning = async () => {
        if (!activePdfFile) return;

        const currentSignatures = filesSignatures[activePdfFile.id] || [];
        if (currentSignatures.length === 0) {
            notify.warning("Coloca al menos una firma en el documento");
            return;
        }

        // El componente PdfSignerEditorArea ya maneja la conversión de coordenadas
        // si le pasamos las firmas visuales. Pero aquí lo activaremos desde el sidebar.
        // Nota: Usaremos un evento o trigger para que el editor nos devuelva las coordenadas finales.
        // O simplificamos: El editor actualiza el estado `filesSignatures` en tiempo real.

        // Necesitamos escalar las coordenadas visuales a PDF Points.
        // Esta lógica la delegamos al editor o la centralizamos.
        // Por ahora, asumimos que `filesSignatures` ya tiene lo necesario o disparamos el evento.

        // NOTA: Para no romper la simplicidad, haremos que el botón de "Firmar" en el sidebar
        // llame a una función que el editor expone vía ref o context.
        document.dispatchEvent(new CustomEvent('trigger-sign-process', { detail: { fileId: activeFileId } }));
    };

    // Escuchar el evento de guardado del editor
    useEffect(() => {
        const handleSaveRequest = async (e: any) => {
            const { signatures, fileId } = e.detail;
            const targetFile = files.find(f => f.id === fileId);
            if (!targetFile) return;

            await signPdf(targetFile.file, {
                fileName: targetFile.name.replace(".pdf", "-firmado.pdf"),
                signatures
            });
        };

        document.addEventListener('sign-pdf-final-submit', handleSaveRequest);
        return () => document.removeEventListener('sign-pdf-final-submit', handleSaveRequest);
    }, [files, signPdf]);

    const handleReset = () => {
        resetFiles();
        setActiveFileId(null);
        setFilesSignatures({});
    };

    const handleSignaturesUpdate = useCallback((sigs: any[]) => {
        if (!activeFileId) return;
        setFilesSignatures(prev => {
            // Only update if the signatures are actually different to avoid extra renders
            // (Simple length check or deep comparison could be added here if needed, 
            // but useCallback + functional update usually fixes the loop reference issue)
            if (JSON.stringify(prev[activeFileId]) === JSON.stringify(sigs)) return prev;
            return { ...prev, [activeFileId]: sigs };
        });
    }, [activeFileId]);

    return (
        <>
            <PdfToolLayout
                toolId="firmar-pdf"
                title="Firmar PDF Online"
                description="Firma tus documentos con validez legal. Dibuja, sube o escribe tu firma."
                hasFiles={files.length > 0}
                onFilesSelected={handleFilesSelected}
                onReset={handleReset}
                summaryItems={activePdfFile ? [
                    { label: "Archivo activo", value: activePdfFile.name },
                    { label: "Páginas", value: activePdfFile.pageCount || "..." },
                    { label: "Firmas colocadas", value: (filesSignatures[activePdfFile.id]?.length || 0) }
                ] : []}
                layout="list"
                sidebarCustomControls={
                    <div className="space-y-6">
                        {/* Lista de Archivos (Navegación) */}
                        {files.length > 1 && (
                            <div className="space-y-2">
                                <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Documentos ({files.length})</h3>
                                <div className="space-y-1">
                                    {files.map(f => (
                                        <button
                                            key={f.id}
                                            onClick={() => setActiveFileId(f.id)}
                                            className={cn(
                                                "w-full flex items-center gap-2 p-2 text-xs rounded-lg transition-all",
                                                activeFileId === f.id
                                                    ? "bg-primary text-primary-foreground shadow-md"
                                                    : "hover:bg-zinc-100 dark:hover:bg-zinc-800"
                                            )}
                                        >
                                            <FileText className="w-3.5 h-3.5 shrink-0" />
                                            <span className="truncate flex-1 text-left">{f.name}</span>
                                            {activeFileId === f.id && <ChevronRight className="w-3.5 h-3.5" />}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Creación de Firmas */}
                        <div className="space-y-3">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Tus Firmas</h3>
                            <Dialog open={isSignatureDialogOpen} onOpenChange={setIsSignatureDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" className="w-full border-dashed border-2 hover:border-primary group">
                                        <Plus className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                                        Nueva Firma
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                    <DialogHeader>
                                        <DialogTitle>Crear Firma Digital</DialogTitle>
                                    </DialogHeader>
                                    <SignaturePad onSave={handleCreateSignature} />
                                </DialogContent>
                            </Dialog>

                            <div className="grid grid-cols-1 gap-2">
                                {savedSignatures.map((sig, idx) => (
                                    <div
                                        key={idx}
                                        className="relative group border rounded-xl p-3 bg-white dark:bg-zinc-900 cursor-move hover:shadow-lg transition-all hover:-translate-y-0.5"
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData("signature-image", sig);
                                        }}
                                    >
                                        <img src={sig} alt="Firma" className="h-12 w-auto mx-auto object-contain" />
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <p className="text-[10px] font-bold text-primary uppercase">Arrastra al PDF</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                }
                downloadButtonText="Finalizar y Firmar"
                isDownloadDisabled={isProcessing || !activeFileId}
                onDownload={handleFinishSigning}
                saveDialogProps={{
                    open: isSaveDialogOpen,
                    onOpenChange: setIsSaveDialogOpen,
                    defaultName: activePdfFile?.name.replace(".pdf", "-firmado.pdf") || "documento-firmado",
                    onSave: () => { },
                    isProcessing: isProcessing,
                }}
                successDialogProps={{
                    isOpen: isComplete,
                    onOpenChange: () => { },
                    onContinue: handleStartNew,
                }}
            >
                {activePdfFile ? (
                    <div className="w-full bg-zinc-200/50 dark:bg-zinc-950/50 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner h-[calc(100vh-250px)] relative">
                        <PdfSignerEditorArea
                            file={activePdfFile.file}
                            fileId={activePdfFile.id}
                            onSignaturesUpdate={handleSignaturesUpdate}
                        />
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-64 text-muted-foreground italic">
                        Cargando archivos...
                    </div>
                )}
            </PdfToolLayout>

            {(isProcessing || isComplete) && (
                <ProcessingScreen
                    fileName={result?.fileName || activePdfFile?.name.replace(".pdf", "-firmado.pdf") || "documento.pdf"}
                    operation="Aplicando firmas"
                    progress={progress}
                    isComplete={isComplete}
                    phase={phase}
                    uploadStats={uploadStats}
                    onDownload={handleDownloadAgain}
                    onEditAgain={() => {
                        handleStartNew();
                    }}
                    onStartNew={() => {
                        handleStartNew();
                        handleReset();
                    }}
                    onCancel={cancelOperation}
                    toolMetrics={result ? {
                        type: "simple",
                        data: { originalSize: result.originalSize, resultSize: result.resultSize }
                    } : undefined}
                />
            )}
        </>
    );
}
