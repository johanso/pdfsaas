"use client";

import { useState } from "react";

// Components
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { usePdfProcessing } from "@/hooks/usePdfProcessing";

export default function ExcelToPdfPage() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);

    const {
        files,
        addFiles,
        removeFile,
        reset,
    } = usePdfFiles(true); // Skip PDF validation for Excel files

    const { isProcessing, processAndDownload } = usePdfProcessing();

    const handleFilesSelected = (newFiles: File[]) => {
        // Validar extensión
        const validExtensions = ['.xlsx', '.xls'];
        const file = newFiles[0];
        const fileExtension = file.name.toLowerCase().slice(file.name.lastIndexOf('.'));

        if (!validExtensions.includes(fileExtension)) {
            alert('Por favor, selecciona un archivo Excel válido (.xlsx o .xls)');
            return;
        }

        // Solo permitimos un archivo a la vez
        if (files.length > 0) {
            reset();
        }
        addFiles([file]);
    };

    const handleSubmit = async (fileName: string) => {
        if (files.length === 0) return;

        const formData = new FormData();
        formData.append("file", files[0].file);

        await processAndDownload(fileName, formData, {
            endpoint: "/api/worker/api/excel-to-pdf",
            extension: "pdf",
            successMessage: "¡Hoja de cálculo convertida a PDF correctamente!",
            onSuccess: () => {
                setIsDialogOpen(false);
                setIsSuccessDialogOpen(true);
            }
        });
    };

    return (
        <PdfToolLayout
            toolId="excel-to-pdf"
            title="Convertir Excel a PDF"
            description="Convierte hojas de cálculo de Microsoft Excel (XLSX, XLS) a PDF manteniendo el formato."
            hasFiles={files.length > 0}
            onFilesSelected={handleFilesSelected}
            acceptedFileTypes=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onReset={reset}
            summaryItems={[
                {
                    label: "Archivo",
                    value: files[0]
                        ? `${files[0].name}`
                        : "-"
                },
                {
                    label: "Peso total",
                    value: files[0]
                        ? `${(files[0].file.size / 1024 / 1024).toFixed(2)} MB`
                        : "-"
                },
                { label: "Formato de salida", value: "PDF" }
            ]}
            downloadButtonText="Convertir a PDF"
            isDownloadDisabled={isProcessing || files.length === 0}
            onDownload={() => setIsDialogOpen(true)}
            saveDialogProps={{
                isOpen: isDialogOpen,
                onOpenChange: setIsDialogOpen,
                defaultName: files[0]?.name.replace(/\.(xlsx|xls)$/i, "") || "hoja-calculo",
                onSave: handleSubmit,
                isProcessing,
                title: "Guardar como PDF",
                description: "Elige un nombre para tu archivo PDF.",
                extension: "pdf",
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
                    ...PDF_CARD_PRESETS.merge,
                    draggable: false,
                    selectable: false,
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
