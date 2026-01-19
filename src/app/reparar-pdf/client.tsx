"use client";

import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import {
  Info,
} from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";
import { Card, CardContent } from "@/components/ui/card";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import {
  useRepairPdf,
  type RepairMode,
  type RepairCheckResult,
} from "@/hooks/useRepairPdf";

// Información de los modos de reparación
const MODE_INFO = {
  auto: {
    title: "Automático",
    description: "Detecta y repara problemas comunes (default)",
    explanation: "Detecta y repara automáticamente problemas comunes como tablas de referencias dañadas y streams corruptos. Opción más rápida.",
  },
  aggressive: {
    title: "Reparación profunda",
    description: "Reconstruye todo desde cero (más lento)",
    explanation: "Reconstruye todo el documento PDF desde cero. Más lento pero puede reparar daños severos que el modo automático no puede.",
  },
  linearize: {
    title: "Reparar y optimizar",
    description: "Repara + optimiza para web",
    explanation: "Repara el documento y además lo optimiza para visualización en web. Ideal para compartir online.",
  },
};

export default function RepairPdfClient() {
  const [mode, setMode] = useState<RepairMode>("auto");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [checkResult, setCheckResult] = useState<RepairCheckResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    reset: resetFiles,
    isLoading: isFilesLoading,
    hasPasswordError,
    passwordProtectedFileName,
    clearPasswordError,
  } = usePdfFiles();

  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    result,
    repair,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useRepairPdf();

  const file = files[0]?.file || null;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      const f = newFiles[0];
      if (f.type !== "application/pdf") {
        notify.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      addFiles([f]);
      setCheckResult(null);
    }
  }, [addFiles]);

  const extractCardData = useCallback((f: any) => ({
    id: f.id,
    file: f.file,
    name: f.name,
    size: f.file.size,
    pageCount: f.pageCount,
    rotation: f.rotation,
  }), []);

  const handleCheck = async () => {
    if (!file) return;

    setIsChecking(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/worker/repair-pdf/check", {
        method: "POST",
        body: formData,
      });

      const data: RepairCheckResult = await response.json();
      setCheckResult(data);

      if (data.status === "damaged" && data.canRepair) {
        notify.success("Se detectaron problemas que pueden repararse");
      } else if (data.status === "ok") {
        notify.info("El PDF parece estar en buen estado");
      } else if (data.status === "encrypted") {
        notify.error("El PDF está protegido con contraseña. Desbloquéalo primero.");
      } else if (data.status === "invalid") {
        notify.error("El archivo no es un PDF válido");
      }
    } catch (error) {
      notify.error("Error al verificar el PDF");
    } finally {
      setIsChecking(false);
    }
  };

  const handleReset = () => {
    resetFiles();
    setMode("auto");
    setIsDialogOpen(false);
    setCheckResult(null);
    handleStartNew();
    clearPasswordError();
  };

  const handlePreSubmit = () => {
    if (!file) return;
    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;
    setIsDialogOpen(false);

    await repair(file, {
      mode,
      fileName,
    });
  };

  const modeInfo = MODE_INFO[mode];

  const showRepairButton = file && (checkResult?.status === "damaged" || checkResult?.status === "ok");

  return (
    <>
      <PdfToolLayout
        toolId="repair-pdf"
        title="Recuperar PDF Dañados y Corruptos"
        description="¿Tu PDF no abre o muestra errores? Nuestra herramienta diagnostica y reconstruye la estructura interna para recuperar tu información valiosa."
        hasFiles={!!file || hasPasswordError}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[]}
        downloadButtonText="Reparar PDF"
        isDownloadDisabled={!showRepairButton || isProcessing || isChecking}
        onDownload={handlePreSubmit}
        isGridLoading={isFilesLoading && files.length === 0 && !hasPasswordError}
        sidebarCustomControls={
          <div className="space-y-2">
            <div className="space-y-3 mb-4">
              <Label className="block text-sm font-semibold">
                Modo de Reparación
              </Label>

              <Select value={mode} onValueChange={(value) => setMode(value as RepairMode)}>
                <SelectTrigger className="w-full shadow-none">
                  <SelectValue placeholder="Selecciona un modo de reparación" />
                </SelectTrigger>
                <SelectContent>
                  {(Object.keys(MODE_INFO) as RepairMode[]).map((key) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center gap-2">
                        <div className="flex-1">
                          <span className="font-medium">{MODE_INFO[key].title}</span>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-900/30 rounded-lg">
                <div className="flex gap-2">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    {modeInfo.explanation}
                  </p>
                </div>
              </div>
            </div>

            {file && (
              <div className="space-y-3">
                <Button
                  onClick={handleCheck}
                  disabled={isChecking || isProcessing}
                  className="w-full shadow-none"
                  variant="default"
                >
                  {isChecking ? "Verificando..." : "Verificar PDF"}
                </Button>

                {checkResult && (
                  <Card className={`border ${checkResult.status === "ok"
                      ? "border-green-500 bg-green-50 dark:bg-green-900/20"
                      : checkResult.status === "damaged"
                        ? "border-orange-500 bg-orange-50 dark:bg-orange-900/20"
                        : checkResult.status === "encrypted"
                          ? "border-red-500 bg-red-50 dark:bg-red-900/20"
                          : "border-red-500 bg-red-50 dark:bg-red-900/20"
                    }`}>
                    <CardContent className="py-2">
                      <div className="flex">
                        <div className="flex-1">
                          <p className="text-sm font-medium mb-1">
                            {checkResult.status === "ok"
                              ? "El PDF está en buen estado"
                              : checkResult.status === "damaged"
                                ? "El PDF está dañado"
                                : checkResult.status === "encrypted"
                                  ? "El PDF está protegido"
                                  : "El archivo no es válido"}
                          </p>
                          {checkResult.recommendation && (
                            <p className="text-xs text-muted-foreground">
                              {checkResult.recommendation}
                            </p>
                          )}
                          {checkResult.issues && checkResult.issues.length > 0 && (
                            <ul className="text-xs text-muted-foreground mt-2 list-none">
                              {checkResult.issues.map((issue, idx) => (
                                <li key={idx}>- {issue}</li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}

            <Separator className="my-4" />
          </div>
        }
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file ? file.name.replace(".pdf", "") : "reparado",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar PDF reparado",
          description: `Se aplicará reparación ${modeInfo.title.toLowerCase()}.`,
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
        layout="grid"
      >
        {files.length === 0 && hasPasswordError ? (
          <PasswordProtectedState
            fileName={passwordProtectedFileName || undefined}
            onReset={handleReset}
          />
        ) : (
          <PdfGrid
            items={files}
            config={PDF_CARD_PRESETS.compress}
            layout="list"
            extractCardData={extractCardData}
            onRemove={removeFile}
          />
        )}
      </PdfToolLayout>

      {(isProcessing || isComplete) && (
        <ProcessingScreen
          progress={progress}
          isComplete={isComplete}
          phase={phase}
          uploadStats={uploadStats}
          fileName={result?.fileName || file?.name || "documento.pdf"}
          operation={operation}
          onDownload={handleDownloadAgain}
          onEditAgain={handleStartNew}
          onStartNew={handleReset}
          onCancel={phase === "uploading" || phase === "processing" ? cancelOperation : undefined}
          toolMetrics={
            result
              ? {
                type: "repair",
                data: {
                  repairActions: result.repairActions,
                  fullyRepaired: result.fullyRepaired,
                  resultSize: result.resultSize,
                }
              }
              : undefined
          }
        />
      )}
    </>
  );
}
