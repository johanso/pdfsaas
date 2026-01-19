"use client";

import { useState, useCallback, useMemo, useEffect, useRef } from "react";
import { notify } from "@/lib/errors/notifications";
import dynamic from "next/dynamic";

// UI Components
import { PdfToolLayout } from "@/components/pdf-system/pdf-tool-layout";
import ProcessingScreen from "@/components/processing-screen";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, FileText, ChevronRight, X, Edit3 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { SignatureCreator, SignatureSource } from "@/components/pdf-system/signature-creator";
import { cn } from "@/lib/utils";
import { PasswordProtectedState } from "@/components/pdf-system/password-protected-state";

// Hooks
import { usePdfFiles } from "@/hooks/usePdfFiles";
import { useSignPdf } from "@/hooks/useSignPdf";

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
  const [savedSignatures, setSavedSignatures] = useState<SignatureSource[]>([]);
  const [isSignatureDialogOpen, setIsSignatureDialogOpen] = useState(false);
  const [isSaveDialogOpen, setIsSaveDialogOpen] = useState(false);
  const [editingSignature, setEditingSignature] = useState<{
    type: 'saved' | 'placed';
    id?: string;
    index?: number;
  } | null>(null);

  // Placed Signatures state PER FILE
  const [filesSignatures, setFilesSignatures] = useState<Record<string, any[]>>({});
  const savedFileName = useRef<string>("");

  const {
    files,
    addFiles,
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

  const handleCreateSignature = (source: SignatureSource) => {
    if (editingSignature) {
      if (editingSignature.type === 'saved' && editingSignature.index !== undefined) {
        setSavedSignatures(prev => {
          const next = [...prev];
          next[editingSignature.index!] = source;
          return next;
        });
        notify.success("Firma actualizada");
      } else if (editingSignature.type === 'placed' && editingSignature.id) {
        // Actualizar firma en el archivo activo
        if (activeFileId) {
          setFilesSignatures(prev => ({
            ...prev,
            [activeFileId]: prev[activeFileId].map(s =>
              s.id === editingSignature.id ? { ...s, image: source.dataUrl, source } : s
            )
          }));
        }
        notify.success("Firma en documento actualizada");
      }
    } else {
      setSavedSignatures(prev => [...prev, source]);
      notify.success("Firma creada y guardada");
    }

    setIsSignatureDialogOpen(false);
    setEditingSignature(null);
  };

  const currentEditingData = useMemo(() => {
    if (!editingSignature) return null;
    if (editingSignature.type === 'saved' && editingSignature.index !== undefined) {
      return savedSignatures[editingSignature.index];
    }
    if (editingSignature.type === 'placed' && editingSignature.id && activeFileId) {
      const sig = filesSignatures[activeFileId]?.find(s => s.id === editingSignature.id);
      return sig?.source || { type: 'upload', dataUrl: sig?.image };
    }
    return null;
  }, [editingSignature, savedSignatures, filesSignatures, activeFileId]);

  const handleEditSavedSignature = (index: number) => {
    setEditingSignature({ type: 'saved', index });
    setIsSignatureDialogOpen(true);
  };

  const handleEditPlacedSignature = (id: string) => {
    setEditingSignature({ type: 'placed', id });
    setIsSignatureDialogOpen(true);
  };

  const handleFinishSigning = async () => {
    if (!activePdfFile) return;

    const currentSignatures = filesSignatures[activePdfFile.id] || [];
    if (currentSignatures.length === 0) {
      notify.warning("Coloca al menos una firma en el documento");
      return;
    }

    setIsSaveDialogOpen(true);
  };

  const handleSave = (fileName: string) => {
    setIsSaveDialogOpen(false);
    savedFileName.current = fileName;
    document.dispatchEvent(new CustomEvent('trigger-sign-process', { detail: { fileId: activeFileId } }));
  };

  // Escuchar el evento de guardado del editor
  useEffect(() => {
    const handleSaveRequest = async (e: any) => {
      const { signatures, fileId } = e.detail;
      const targetFile = files.find(f => f.id === fileId);
      if (!targetFile) return;

      const finalFileName = savedFileName.current || targetFile.name.replace(".pdf", "-firmado");

      await signPdf(targetFile.file, {
        fileName: finalFileName.endsWith(".pdf") ? finalFileName : `${finalFileName}.pdf`,
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
    clearPasswordError();
  };

  const handleSignaturesUpdate = useCallback((sigs: any[]) => {
    if (!activeFileId) return;
    setFilesSignatures(prev => {
      if (JSON.stringify(prev[activeFileId]) === JSON.stringify(sigs)) return prev;
      return { ...prev, [activeFileId]: sigs };
    });
  }, [activeFileId]);

  const handleDeleteSavedSignature = (index: number) => {
    setSavedSignatures(prev => prev.filter((_, i) => i !== index));
    notify.info("Firma eliminada de tus guardadas");
  };

  return (
    <>
      <PdfToolLayout
        toolId="firmar-pdf"
        title="Firmar PDF Online"
        description="Dibuja, escribe o sube tu firma. Colócala exactamente donde la necesitas arrastrando y soltando. Firma documentos legalmente sin imprimir ni escanear."
        hasFiles={files.length > 0 || hasPasswordError}
        onFilesSelected={handleFilesSelected}
        onReset={handleReset}
        summaryItems={activePdfFile ? [
          { label: "Archivo", value: activePdfFile.name },
          { label: "Firmas colocadas", value: (filesSignatures[activePdfFile.id]?.length || 0) }
        ] : []}
        layout="list"
        sidebarCustomControls={
          <div className="space-y-6">
            {/* Lista de Archivos (Navegación) */}
            {files.length > 1 && (
              <div className="space-y-2">
                <h3 className="text-md font-bold">Documentos ({files.length})</h3>
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
              <Dialog
                open={isSignatureDialogOpen}
                onOpenChange={(open) => {
                  setIsSignatureDialogOpen(open);
                  if (!open) setEditingSignature(null); // Limpiar al cerrar
                }}
              >
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full shadow-none border-dashed border hover:border-primary group"
                    onClick={() => setEditingSignature(null)} // Asegurar que es una firma nueva
                    disabled={savedSignatures.length >= 2}
                  >
                    {savedSignatures.length >= 2 ? (
                      <span className="flex items-center gap-2">
                        Límite alcanzado (2/2)
                      </span>
                    ) : (
                      <span className="flex items-center gap-2">
                        <Plus className="w-4 h-4" />
                        Nueva Firma ({savedSignatures.length}/2)
                      </span>
                    )}
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>Crear Firma Digital</DialogTitle>
                  </DialogHeader>
                  <SignatureCreator
                    onSave={handleCreateSignature}
                    key={isSignatureDialogOpen ? 'open' : 'closed'}
                    initialData={currentEditingData}
                  />
                </DialogContent>
              </Dialog>

              <div className="grid grid-cols-1 gap-2">
                {savedSignatures.map((sig, idx) => (
                  <div
                    key={idx}
                    className="relative group border-2 border-dashed rounded-xl p-2 bg-white hover:border-primary dark:bg-zinc-900 cursor-move transition-all"
                    draggable
                    onDragStart={(e) => {
                      e.dataTransfer.setData("signature-image", sig.dataUrl);
                      e.dataTransfer.setData("signature-meta", JSON.stringify(sig));
                    }}
                    onDoubleClick={() => handleEditSavedSignature(idx)}
                    title="Doble clic para editar"
                  >
                    <img src={sig.dataUrl} alt="Firma" className="h-10 w-auto mx-auto object-contain cursor-alias" />
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center">
                      <p className="text-[10px] font-bold text-primary uppercase">Arrastra al PDF</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditSavedSignature(idx);
                      }}
                      className="absolute top-2 left-2 rounded-full group-hover:opacity-100 opacity-0 transition-opacity z-10 bg-primary text-white p-1 hover:bg-primary/90 shadow-sm"
                      title="Editar firma"
                    >
                      <Edit3 className="w-2.5 h-2.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteSavedSignature(idx);
                      }}
                      className="absolute top-2 right-2 rounded-full group-hover:opacity-100 opacity-0 transition-opacity z-10 bg-red-500 text-white p-1 hover:bg-red-600 shadow-sm"
                      title="Eliminar de mis firmas"
                    >
                      <X className="w-2.5 h-2.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        }
        downloadButtonText="Firmar y Descargar PDF"
        isDownloadDisabled={isProcessing || !activeFileId}
        onDownload={handleFinishSigning}
        saveDialogProps={{
          open: isSaveDialogOpen,
          onOpenChange: setIsSaveDialogOpen,
          defaultName: activePdfFile?.name.replace(".pdf", "-firmado") || "documento-firmado",
          onSave: handleSave,
          isProcessing: isProcessing,
          extension: "pdf",
        }}
        successDialogProps={{
          isOpen: false,
          onOpenChange: () => { },
          onContinue: handleStartNew,
        }}
      >
        {files.length === 0 && hasPasswordError ? (
          <PasswordProtectedState
            fileName={passwordProtectedFileName || undefined}
            onReset={handleReset}
          />
        ) : activePdfFile ? (
          <div className="w-full bg-zinc-200/50 dark:bg-zinc-950/50 rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-inner h-[calc(100vh-250px)] relative">
            <PdfSignerEditorArea
              file={activePdfFile.file}
              fileId={activePdfFile.id}
              initialSignatures={filesSignatures[activePdfFile.id] || []}
              onSignaturesUpdate={handleSignaturesUpdate}
              onEditSignature={handleEditPlacedSignature}
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
          fileName={result?.fileName || activePdfFile?.name.replace(".pdf", "-firmado") || "documento.pdf"}
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
