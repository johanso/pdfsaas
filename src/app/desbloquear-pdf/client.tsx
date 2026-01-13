"use client";

import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import { Shield, AlertCircle } from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Card, CardContent } from "@/components/ui/card";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import {
  useUnlockPdf,
  type UnlockCheckResult,
} from "@/hooks/useUnlockPdf";

export default function UnlockPdfClient() {
  const [password, setPassword] = useState("");
  const [encryptionCheck, setEncryptionCheck] = useState<UnlockCheckResult | null>(null);
  const [isCheckingEncryption, setIsCheckingEncryption] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    reset: resetFiles,
    isLoading: isFilesLoading,
  } = usePdfFiles();

  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    result,
    unlock,
    checkEncryption,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useUnlockPdf();

  const file = files[0]?.file || null;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      const f = newFiles[0];
      if (f.type !== "application/pdf") {
        notify.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      addFiles([f]);

      // Verificar si está encriptado (opcional)
      setIsCheckingEncryption(true);
      checkEncryption(f)
        .then((result) => {
          setEncryptionCheck(result);
          if (!result.isEncrypted) {
            notify.info("Este PDF no está protegido con contraseña");
          }
        })
        .catch(() => {
          // No mostrar error si falla el check, es opcional
        })
        .finally(() => {
          setIsCheckingEncryption(false);
        });
    }
  }, [addFiles, checkEncryption]);

  const extractCardData = useCallback((f: any) => ({
    id: f.id,
    file: f.file,
    name: f.name,
    size: f.file.size,
    pageCount: f.pageCount,
    rotation: f.rotation,
  }), []);

  const handleReset = () => {
    resetFiles();
    setPassword("");
    setEncryptionCheck(null);
    setIsDialogOpen(false);
    handleStartNew();
  };

  const handlePreSubmit = () => {
    if (!file) return;

    // Validar contraseña
    if (!password || password.length < 1) {
      notify.error("Se requiere la contraseña del PDF");
      return;
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;
    setIsDialogOpen(false);

    try {
      await unlock(file, {
        password,
        fileName,
      });
    } catch (error: any) {
      if (error.message === "INVALID_PASSWORD") {
        notify.error("Contraseña incorrecta. Intenta de nuevo.");
      } else if (error.message === "NOT_ENCRYPTED") {
        notify.error("Este PDF no está protegido con contraseña.");
      } else {
        notify.error(error.message || "Error al desbloquear el PDF");
      }
    }
  };

  const canSubmit = !!file && password.length >= 1;

  return (
    <>
      <PdfToolLayout
        toolId="unlock-pdf"
        title="Desbloquear PDF"
        description="Elimina la contraseña de tus documentos PDF protegidos. Recupera el acceso completo a tus archivos."
        hasFiles={!!file}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[]}
        downloadButtonText="Desbloquear PDF"
        isDownloadDisabled={isProcessing || files.length === 0 || !canSubmit}
        onDownload={handlePreSubmit}
        isGridLoading={isFilesLoading && files.length === 0}
        sidebarCustomControls={
          <div className="space-y-2">
            <div className="space-y-3 mb-4">
              <Label className="block text-sm font-semibold">
                Contraseña del PDF
              </Label>

              <Input
                type="password"
                className="shadow-none"
                placeholder="Ingresa la contraseña del PDF"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isProcessing}
              />

              {encryptionCheck && (
                <Card className="mt-3 bg-muted/50 border-border">
                  <CardContent className="py-3 px-4">
                    <div className="flex gap-3">
                      {encryptionCheck.isEncrypted ? (
                        <Shield className="w-5 h-5 text-primary shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
                      )}
                      <div className="flex-1">
                        {encryptionCheck.isEncrypted ? (
                          <>
                            <div className="text-sm font-medium">PDF protegido</div>
                            <div className="text-xs text-muted-foreground">
                              {encryptionCheck.encryptionInfo || "Encriptación detectada"}
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="text-sm font-medium">Sin protección</div>
                            <div className="text-xs text-muted-foreground">
                              Este PDF no tiene contraseña
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        }
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file ? file.name.replace(".pdf", "") : "desbloqueado",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar PDF desbloqueado",
          description: "Se eliminará la restricción de contraseña.",
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: () => { },
        }}
        layout="grid"
      >
        <PdfGrid
          items={files}
          config={PDF_CARD_PRESETS.unlock}
          layout="list"
          extractCardData={extractCardData}
          onRemove={removeFile}
        />
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
                  type: "simple",
                  data: {
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
