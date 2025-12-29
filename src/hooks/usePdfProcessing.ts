import { useState } from "react";
import { toast } from "sonner";
import { getApiUrl } from "@/lib/api";

interface ProcessOptions {
  endpoint: string;
  successMessage?: string;
  errorMessage?: string;
  extension?: string;
  operation?: string;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onContinueEditing?: () => void;
  onStartNew?: () => void;
}

interface ProcessingState {
  isProcessing: boolean;
  progress: number;
  isComplete: boolean;
  fileName: string;
  operation: string;
  phase: "idle" | "uploading" | "processing" | "ready";
}

export function usePdfProcessing() {
  const [state, setState] = useState<ProcessingState>({
    isProcessing: false,
    progress: 0,
    isComplete: false,
    fileName: "",
    operation: "",
    phase: "idle"
  });

  const [downloadInfo, setDownloadInfo] = useState<{
    fileId: string;
    fileName: string;
  } | null>(null);

  const processAndDownload = async (
    fileName: string,
    formData: FormData,
    options: ProcessOptions
  ) => {
    const ext = options.extension || "pdf";
    const fullFileName = `${fileName}.${ext}`;

    setState({
      isProcessing: true,
      progress: 0,
      isComplete: false,
      fileName: fullFileName,
      operation: options.operation || "Procesando archivo",
      phase: "uploading"
    });

    try {
      // ===== FASE 1: UPLOAD CON PROGRESO =====
      const result = await new Promise<{ fileId: string; fileName: string }>((resolve, reject) => {
        const xhr = new XMLHttpRequest();

        // Progreso de upload (0-90%)
        xhr.upload.addEventListener("progress", (e) => {
          if (e.lengthComputable) {
            const uploadProgress = (e.loaded / e.total) * 90;
            setState(prev => ({
              ...prev,
              progress: uploadProgress,
              phase: "uploading"
            }));
          }
        });

        xhr.addEventListener("load", () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            try {
              const response = JSON.parse(xhr.responseText);

              if (response.fileId) {
                // Nuevo formato: servidor devuelve fileId
                setState(prev => ({
                  ...prev,
                  progress: 95,
                  phase: "processing"
                }));
                resolve({
                  fileId: response.fileId,
                  fileName: response.fileName || fullFileName
                });
              } else if (response.error) {
                reject(new Error(response.error));
              } else {
                reject(new Error("Respuesta inesperada del servidor"));
              }
            } catch (e) {
              // Respuesta no es JSON - podría ser el formato antiguo (blob directo)
              // Manejar compatibilidad hacia atrás
              reject(new Error("Formato de respuesta no soportado"));
            }
          } else {
            try {
              const errorData = JSON.parse(xhr.responseText);
              reject(new Error(errorData.error || `Error ${xhr.status}`));
            } catch {
              reject(new Error(`Error ${xhr.status}: Falló el procesamiento`));
            }
          }
        });

        xhr.addEventListener("error", () => {
          reject(new Error("Error de red al procesar el archivo"));
        });

        const fullEndpoint = getApiUrl(options.endpoint);
        xhr.open("POST", fullEndpoint);
        xhr.send(formData);
      });

      // Guardar info para descarga
      setDownloadInfo({
        fileId: result.fileId,
        fileName: fullFileName
      });

      // ===== FASE 2: TRIGGER DESCARGA NATIVA =====
      setState(prev => ({
        ...prev,
        progress: 100,
        phase: "ready"
      }));

      // Descarga usando el navegador (muestra progreso nativo)
      const downloadUrl = getApiUrl(`/api/worker/download/${result.fileId}`);

      // Crear link y forzar descarga
      const a = document.createElement("a");
      a.href = downloadUrl;
      a.download = fullFileName;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);

      // Marcar como completo
      setState(prev => ({ ...prev, isComplete: true }));

      toast.success(options.successMessage || "¡Archivo procesado correctamente!");
      options.onSuccess?.();

      return true;
    } catch (error) {
      console.error(error);
      const msg = error instanceof Error ? error.message : (options.errorMessage || "Error al procesar el archivo");
      toast.error(msg);
      options.onError?.(error instanceof Error ? error : new Error(msg));

      setState({
        isProcessing: false,
        progress: 0,
        isComplete: false,
        fileName: "",
        operation: "",
        phase: "idle"
      });

      return false;
    }
  };

  const handleDownloadAgain = () => {
    if (!downloadInfo) return;

    const downloadUrl = getApiUrl(`/api/worker/download/${downloadInfo.fileId}`);
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.download = downloadInfo.fileName;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success("Archivo descargado nuevamente");
  };

  const handleContinueEditing = (callback?: () => void) => {
    setState({
      isProcessing: false,
      progress: 0,
      isComplete: false,
      fileName: "",
      operation: "",
      phase: "idle"
    });
    setDownloadInfo(null);
    callback?.();
  };

  const handleStartNew = (callback?: () => void) => {
    setState({
      isProcessing: false,
      progress: 0,
      isComplete: false,
      fileName: "",
      operation: "",
      phase: "idle"
    });
    setDownloadInfo(null);
    callback?.();
  };

  // Helper para obtener el texto de la fase actual
  const getPhaseText = () => {
    switch (state.phase) {
      case "uploading":
        return "Subiendo archivos...";
      case "processing":
        return "Procesando...";
      case "ready":
        return "¡Listo! Descargando...";
      default:
        return state.operation;
    }
  };

  return {
    isProcessing: state.isProcessing,
    progress: state.progress,
    isComplete: state.isComplete,
    fileName: state.fileName,
    operation: getPhaseText(),
    phase: state.phase,
    processAndDownload,
    handleDownloadAgain,
    handleContinueEditing,
    handleStartNew
  };
}