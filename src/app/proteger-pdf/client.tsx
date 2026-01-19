"use client";

import { useState, useCallback } from "react";
import { notify } from "@/lib/errors/notifications";
import { CheckCircle2, Lock, Shield } from "lucide-react";

// Components
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { PdfGrid } from "@/components/pdf-system/pdf-grid";
import { PDF_CARD_PRESETS } from "@/components/pdf-system/pdf-card";
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Separator } from "@/components/ui/separator";
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import {
  useProtectPdf,
  type EncryptionLevel,
} from "@/hooks/useProtectPdf";

export default function ProtectPdfClient() {
  const [userPassword, setUserPassword] = useState("");
  const [encryption, setEncryption] = useState<EncryptionLevel>("256");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const {
    files,
    addFiles,
    removeFile,
    reset: resetFiles,
    isLoading: isFilesLoading,
    hasPasswordError,
    passwordProtectedFileName,
    clearPasswordError
  } = usePdfFiles();

  const {
    isProcessing,
    isComplete,
    progress,
    phase,
    operation,
    uploadStats,
    result,
    protect,
    handleDownloadAgain,
    handleStartNew,
    cancelOperation,
  } = useProtectPdf();

  const file = files[0]?.file || null;

  const handleFilesSelected = useCallback((newFiles: File[]) => {
    if (newFiles.length > 0) {
      const f = newFiles[0];
      if (f.type !== "application/pdf") {
        notify.error("Por favor selecciona un archivo PDF válido");
        return;
      }
      addFiles([f]);
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

  const handleReset = () => {
    resetFiles();
    setUserPassword("");
    setEncryption("256");
    setIsDialogOpen(false);
    handleStartNew();
    clearPasswordError();
  };

  const handlePreSubmit = () => {
    if (!file) return;

    // Validar contraseña
    if (!userPassword || userPassword.length < 4) {
      if (!userPassword) {
        notify.error("Se requiere al menos una contraseña");
        return;
      }
      notify.error("La contraseña debe tener al menos 4 caracteres");
      return;
    }

    setIsDialogOpen(true);
  };

  const handleSubmit = async (fileName: string) => {
    if (!file) return;
    setIsDialogOpen(false);

    await protect(file, {
      userPassword,
      encryption,
      fileName,
    });
  };

  const canSubmit = !!file && userPassword.length >= 4;

  return (
    <>
      <PdfToolLayout
        toolId="protect-pdf"
        title="Proteger PDF: Poner Contraseña y Encriptar Archivos"
        description="Añade una clave de seguridad a tus documentos confidenciales. Utiliza encriptación militar AES-256 para que solo quien tú quieras pueda leer el contenido."
        hasFiles={!!file || hasPasswordError}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={[]}
        downloadButtonText="Descargar PDF"
        isDownloadDisabled={isProcessing || files.length === 0 || !canSubmit}
        onDownload={handlePreSubmit}
        isGridLoading={isFilesLoading && files.length === 0 && !hasPasswordError}
        sidebarCustomControls={
          <div className="space-y-2">
            <div className="space-y-3 mb-4">
              <Label className="block text-sm font-semibold">
                Contraseña para abrir el PDF
              </Label>

              <Input
                type="password"
                className="shadow-none"
                placeholder="Contraseña (mínimo 4 caracteres)"
                value={userPassword}
                onChange={(e) => setUserPassword(e.target.value)}
                disabled={isProcessing}
              />
            </div>

            <div className="space-y-3 mb-4">
              <Label className="block text-sm font-semibold">
                Nivel de Encriptación
              </Label>

              <div className="space-y-2">
                <div className="py-2 px-3 bg-primary/10 border border-primary/20 rounded-lg cursor-pointer hover:bg-primary/15 transition-colors"
                  onClick={() => setEncryption("256")}
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">256-bit AES</div>
                      <div className="text-xs text-muted-foreground">Máxima seguridad</div>
                    </div>
                    {encryption === "256" && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                </div>

                <div className="p-3 bg-muted/30 border border-border rounded-lg cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => setEncryption("128")}
                >
                  <div className="flex items-center gap-3">
                    <Lock className="w-5 h-5 text-muted-foreground shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-sm">128-bit AES</div>
                      <div className="text-xs text-muted-foreground">Compatible con lectores antiguos</div>
                    </div>
                    {encryption === "128" && (
                      <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
                    )}
                  </div>
                </div>
              </div>
            </div>

            <Separator className="my-4" />
          </div>
        }
        saveDialogProps={{
          open: isDialogOpen,
          onOpenChange: setIsDialogOpen,
          defaultName: file ? file.name.replace(".pdf", "") : "protegido",
          onSave: handleSubmit,
          isProcessing,
          title: "Guardar PDF protegido",
          description: `Se protegerá con encriptación ${encryption}-bit AES.`,
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
                type: "protect",
                data: {
                  encryption: result.encryption,
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
