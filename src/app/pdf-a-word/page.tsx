"use client";

import { useState } from "react";
import { FileText, Download, CheckCircle2 } from "lucide-react";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";

export default function PdfToWordPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

    const {
        files,
        addFiles,
        removeFile,
        reset,
    } = usePdfFiles();

    const { isProcessing, processAndDownload } = usePdfProcessing();

    const handleFilesSelected = (newFiles: File[]) => {
        // Para esta herramienta solo permitimos un archivo a la vez por ahora
        // para simplificar la conversión directa.
        if (files.length > 0) {
            reset();
        }
        addFiles([newFiles[0]]);
    };

    const handleSubmit = async (fileName: string) => {
        if (files.length === 0) return;

        const formData = new FormData();
        formData.append("file", files[0].file);

        await processAndDownload(fileName, formData, {
            endpoint: "/api/worker/api/pdf-to-word",
            extension: "docx",
            successMessage: "¡PDF convertido a Word correctamente!",
            onSuccess: () => {
                setIsDialogOpen(false);
                setIsSuccessDialogOpen(true);
            }
        });
    };

    return (
        <PdfToolLayout
            toolId="pdf-to-word"
            title="Convertir PDF a Word"
            description="Convierte tus documentos PDF a archivos DOCX editables con alta precisión."
            hasFiles={files.length > 0}
            onFilesSelected={handleFilesSelected}
            onReset={reset}
            summaryItems={[
                { label: "Archivo", value: files[0]?.name || "-" },
                { label: "Páginas", value: files[0]?.pageCount || 0 },
                { label: "Formato de salida", value: "DOCX (Word)" }
            ]}
            sidebarCustomControls={
                <p className="text-xs bg-red-100/50 dark:bg-zinc-900/50 p-2 rounded">
                    Los PDFs escaneados o con mucho diseño gráfico
                    pueden no convertirse perfectamente. Para mejores resultados, usa PDFs generados
                    desde Word u Office.
                </p>
            }
            downloadButtonText="Convertir a Word"
            isDownloadDisabled={isProcessing || files.length === 0}
            onDownload={() => setIsDialogOpen(true)}
            saveDialogProps={{
                isOpen: isDialogOpen,
                onOpenChange: setIsDialogOpen,
                defaultName: files[0]?.name.replace(".pdf", "") || "documento-convertido",
                onSave: handleSubmit,
                isProcessing,
                title: "Guardar como Word",
                description: "Elige un nombre para tu nuevo archivo de Microsoft Word.",
                extension: "docx",
            }}
            successDialogProps={{
                isOpen: isSuccessDialogOpen,
                onOpenChange: setIsSuccessDialogOpen,
                onContinue: () => setIsSuccessDialogOpen(false),
            }}
        >
            <PdfGrid
                items={files}
                config={{
                    ...PDF_CARD_PRESETS.organize, // Usamos preset de organizar para ver preview
                    draggable: false,
                    selectable: false,
                    removable: true,
                }}
                extractCardData={(f) => ({
                    id: f.id,
                    file: f.file,
                    name: f.name,
                    size: f.file.size,
                    pageCount: f.pageCount,
                })}
                onRemove={removeFile}
            />
        </PdfToolLayout>
    );
}
